// ── UI ────────────────────────────────────────────────────────────────────────
import { state, setState, saveWords, saveTagOrder, getSortedTags, resetDeck } from './state.js';

// ── TOAST ─────────────────────────────────────────────────────────────────────

let _toastTimeout = null;
let _pendingUndo  = null;

export function showNotification(msg) {
    const existing = document.querySelector('.cyber-toast');
    if (existing) existing.remove();
    if (_toastTimeout) clearTimeout(_toastTimeout);
    const t = document.createElement('div');
    t.className  = 'cyber-toast animate-fade';
    t.innerText  = msg;
    document.body.appendChild(t);
    _toastTimeout = setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 400); }, 1500);
}

export function showUndoToast(msg, undoFn) {
    _pendingUndo = undoFn;
    const existing = document.querySelector('.cyber-toast');
    if (existing) existing.remove();
    if (_toastTimeout) clearTimeout(_toastTimeout);
    const t = document.createElement('div');
    t.className  = 'cyber-toast cyber-toast--undo animate-fade';
    t.innerHTML  = `<span>${msg}</span><button class="cyber-toast__undo" id="undoBtn">ANNULLA</button>`;
    document.body.appendChild(t);
    t.querySelector('#undoBtn').addEventListener('click', executePendingUndo);
    _toastTimeout = setTimeout(() => {
        _pendingUndo = null;
        t.style.opacity = '0';
        setTimeout(() => t.remove(), 400);
    }, 4000);
}

function executePendingUndo() {
    if (!_pendingUndo) return;
    const fn = _pendingUndo;
    _pendingUndo = null;
    clearTimeout(_toastTimeout);
    const toast = document.querySelector('.cyber-toast');
    if (toast) toast.remove();
    fn();
}

// ── FILTRI TAG (con drag-and-drop) ────────────────────────────────────────────

let _filterDragSrc = null;

export function renderTags() {
    const containers = [
        document.getElementById('tagFilters'),
        document.getElementById('tagFiltersMobile'),
    ].filter(Boolean);

    const tagCounts = {};
    state.words.forEach(w => {
        w.tags.forEach(t => {
            const lt = t.toLowerCase();
            tagCounts[lt] = (tagCounts[lt] || 0) + 1;
        });
    });

    const allTags    = Object.keys(tagCounts);
    const sortedTags = getSortedTags(allTags);
    state.tagOrder   = sortedTags; // rimuove tag non più esistenti

    containers.forEach(container => {
        container.innerHTML = '';
        sortedTags.forEach(t => {
            const btn = document.createElement('button');
            btn.draggable  = true;
            btn.dataset.tag = t;
            btn.className  = `px-4 py-2 rounded-lg text-xs font-bold border uppercase transition-all ${state.activeTags.has(t) ? 'theme-tag-active' : 'theme-tag-inactive'}`;
            btn.style.cursor = 'grab';
            btn.textContent = `${t} (${tagCounts[t]})`;
            btn.addEventListener('click', () => { _toggleTag(t); });
            _attachFilterDrag(btn, container);
            container.appendChild(btn);
        });
    });
}

function _toggleTag(t) {
    if (state.activeTags.has(t)) state.activeTags.delete(t);
    else state.activeTags.add(t);
    resetDeck();
    showNotification('MAZZO RIMESCOLATO');
    renderTags();
}

function _attachFilterDrag(el, container) {
    el.addEventListener('dragstart', function(e) {
        _filterDragSrc = this;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', this.dataset.tag);
        this.style.opacity = '0.4';
    });
    el.addEventListener('dragend', function() {
        this.style.opacity = '';
        container.querySelectorAll('[data-tag]').forEach(b => b.classList.remove('tag-drag-over'));
    });
    el.addEventListener('dragover', function(e) {
        e.preventDefault();
        if (_filterDragSrc && _filterDragSrc !== this) {
            container.querySelectorAll('[data-tag]').forEach(b => b.classList.remove('tag-drag-over'));
            this.classList.add('tag-drag-over');
        }
    });
    el.addEventListener('dragleave', function() { this.classList.remove('tag-drag-over'); });
    el.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('tag-drag-over');
        if (!_filterDragSrc || _filterDragSrc === this) return;
        const fromTag = e.dataTransfer.getData('text/plain');
        const toTag   = this.dataset.tag;
        const fromIdx = state.tagOrder.indexOf(fromTag);
        const toIdx   = state.tagOrder.indexOf(toTag);
        if (fromIdx === -1 || toIdx === -1) return;
        state.tagOrder.splice(fromIdx, 1);
        state.tagOrder.splice(toIdx, 0, fromTag);
        saveTagOrder();
        renderTags();
    });
}

// ── TABELLA ARCHIVIO ──────────────────────────────────────────────────────────

let _calcDebounce = null;
let _tableResizeObserver = null;

export function renderTable() {
    const tbody = document.getElementById('wordTableBody');
    if (!tbody) return;

    const filtered = [...state.words].reverse().filter(w => {
        const matchesText = w.text.toLowerCase().includes(state.searchQuery);
        const matchesTags = state.archiveSearchTags.size === 0
            || [...state.archiveSearchTags].every(t => w.tags.some(wt => wt.toLowerCase() === t.toLowerCase()));
        return matchesText && matchesTags;
    });

    const paginated = filtered.slice(
        (state.currentPage - 1) * state.itemsPerPage,
        state.currentPage * state.itemsPerPage
    );

    const isMobileView = window.innerWidth < 1024;

    tbody.innerHTML = paginated.map(w => {
        const idx = state.words.findIndex(item => item.text === w.text);

        if (isMobileView) {
            return `
            <tr onclick="openMobileDetail(${idx})" style="cursor:pointer;">
                <td class="p-4" style="width:100%;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">
                    <div class="font-bold theme-editable" style="overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">${w.text}</div>
                </td>
                <td style="padding:0 12px 0 4px;text-align:right;color:var(--neon-cyan);font-size:1.4rem;white-space:nowrap;width:28px;vertical-align:middle;">›</td>
            </tr>`;
        }

        const MAX_TAGS_VISIBLE = 3;
        const visibleTags = w.tags.slice(0, MAX_TAGS_VISIBLE);
        const hiddenCount = w.tags.length - MAX_TAGS_VISIBLE;
        const tagsHtml = visibleTags.map(t =>
            `<span class="theme-tag-chip px-2 py-0.5 rounded text-[9px] uppercase"
                   style="background:rgba(var(--neon-cyan-rgb),0.08);color:var(--neon-cyan);border:1px solid rgba(var(--neon-cyan-rgb),0.2);white-space:nowrap;">${t}</span>`
        ).join('') + (hiddenCount > 0
            ? `<span onclick="openDesktopEdit(${idx})" style="font-family:'Rajdhani',sans-serif;font-size:0.6rem;font-weight:700;color:var(--neon-cyan);opacity:0.6;cursor:pointer;white-space:nowrap;padding:2px 6px;">+${hiddenCount}</span>`
            : '');

        return `
        <tr class="theme-row-hover transition" style="cursor:pointer;" onclick="openDesktopEdit(${idx})">
            <td class="p-4" style="width:55%;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;max-width:0;">
                <div class="font-bold theme-editable" style="overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">${w.text}</div>
            </td>
            <td class="p-4" style="width:35%;overflow:hidden;max-width:0;">
                <div style="display:flex;gap:4px;align-items:center;overflow:hidden;flex-wrap:nowrap;">${tagsHtml}</div>
            </td>
            <td class="p-4 text-right" style="width:10%;white-space:nowrap;" onclick="event.stopPropagation()">
                <button onclick="openDesktopEdit(${idx})"
                    style="font-family:'Rajdhani',sans-serif;font-size:0.65rem;font-weight:700;background:none;border:none;color:var(--neon-cyan);cursor:pointer;text-transform:uppercase;opacity:0.6;transition:opacity 0.2s;"
                    onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.6">Modifica</button>
            </td>
        </tr>`;
    }).join('');

    setState({ filteredLength: filtered.length, mobileDetailFiltered: filtered });
    const info = document.getElementById('paginationInfo');
    if (info) info.innerText = `Pagina ${state.currentPage} di ${Math.ceil(filtered.length / state.itemsPerPage) || 1}`;

    // Ricalcola itemsPerPage se il modale è aperto
    const modal = document.getElementById('editorModal');
    if (modal?.classList.contains('editor-open')) {
        clearTimeout(_calcDebounce);
        _calcDebounce = setTimeout(calcItemsPerPage, 80);
    }
}

// ── CALCOLO RIGHE VISIBILI (ResizeObserver) ───────────────────────────────────

export function initTableResizeObserver() {
    const tableContainer = document.getElementById('tableContainer');
    if (!tableContainer || !window.ResizeObserver) return;

    _tableResizeObserver = new ResizeObserver(() => {
        const modal = document.getElementById('editorModal');
        if (modal?.classList.contains('editor-open')) {
            clearTimeout(_calcDebounce);
            _calcDebounce = setTimeout(calcItemsPerPage, 80);
        }
    });
    _tableResizeObserver.observe(tableContainer);
}

export function calcItemsPerPage() {
    const modal     = document.getElementById('editorModal');
    const container = document.getElementById('tableContainer');
    if (!modal || !container || !modal.classList.contains('editor-open')) return;

    const tbody    = container.querySelector('tbody');
    const thead    = container.querySelector('thead');
    const pagination = document.getElementById('paginationBar');
    const searchRow  = container.querySelector(':scope > div:first-child');

    // Misura l'altezza reale di una riga (o usa il fallback di 52px)
    const sampleRow = tbody?.querySelector('tr');
    const ROW_H     = sampleRow ? sampleRow.getBoundingClientRect().height || 52 : 52;

    // Spazio disponibile = altezza container - elementi fissi misurati dal DOM
    const containerH  = container.clientHeight;
    const searchH     = searchRow  ? searchRow.offsetHeight  + 16 : 70;
    const theadH      = thead      ? thead.offsetHeight           : 44;
    const paginationH = pagination ? pagination.offsetHeight + 12 : 52;
    const tcPadV      = 48; // p-6 = 1.5rem × 2

    const available = containerH - tcPadV - searchH - theadH - paginationH;
    const newItems  = Math.max(1, Math.floor(available / ROW_H));

    if (newItems !== state.itemsPerPage) {
        setState({ itemsPerPage: newItems, currentPage: 1 });
        renderTable();
    }
}

// ── FILTRI RICERCA ARCHIVIO ───────────────────────────────────────────────────

let _renameConfirmed = false;

export function renderArchiveSearchTags() {
    const container = document.getElementById('archiveTagFilters');
    if (!container) return;

    const tagCounts = {};
    state.words.forEach(w => {
        w.tags.forEach(t => {
            const lt = t.toLowerCase();
            tagCounts[lt] = (tagCounts[lt] || 0) + 1;
        });
    });

    const allTags = Object.keys(tagCounts).sort();
    container.innerHTML = allTags.map(tag => {
        const active = state.archiveSearchTags.has(tag);
        const count  = tagCounts[tag];
        return `
            <div style="display:inline-flex;align-items:center;gap:0;" id="tagpill-${CSS.escape(tag)}">
                <button onclick="toggleArchiveTag('${tag}')"
                    class="px-4 py-2 rounded-l-lg text-[11px] font-bold border-y border-l uppercase transition-all
                    ${active ? 'theme-tag-active' : 'theme-tag-inactive'}" style="border-right:none;">
                    ${tag} (${count})
                </button>
                <button onclick="startRenameTag('${tag}')"
                    title="Rinomina tag" aria-label="Rinomina tag ${tag}"
                    class="py-2 px-2 rounded-r-lg text-[11px] border-y border-r uppercase transition-all
                    ${active ? 'theme-tag-active' : 'theme-tag-inactive'}"
                    style="border-left:1px solid rgba(var(--neon-cyan-rgb),0.15);opacity:0.5;"
                    onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.5">✎</button>
            </div>`;
    }).join('');
}

export function toggleArchiveTag(t) {
    if (state.archiveSearchTags.has(t)) state.archiveSearchTags.delete(t);
    else state.archiveSearchTags.add(t);
    setState({ currentPage: 1 });
    renderArchiveSearchTags();
    renderTable();
}

export function startRenameTag(oldTag) {
    const pill = document.getElementById('tagpill-' + CSS.escape(oldTag));
    if (!pill) return;
    _renameConfirmed = false;
    pill.innerHTML = `
        <input id="renameTagInput-${CSS.escape(oldTag)}"
            value="${oldTag}"
            aria-label="Rinomina tag, premi Invio per confermare o Escape per annullare"
            class="cyber-input rounded-lg text-[11px] font-bold uppercase px-3 py-2"
            style="min-width:90px;max-width:160px;border-color:rgba(var(--neon-cyan-rgb),0.7);"
            onkeydown="if(event.key==='Enter'){_renameConfirmed=true;confirmRenameTag('${oldTag}',this.value)}else if(event.key==='Escape'){_renameConfirmed=true;renderArchiveSearchTags()}"
            onblur="if(!_renameConfirmed){_renameConfirmed=true;confirmRenameTag('${oldTag}',this.value)}"
            autofocus>`;
    const inp = document.getElementById('renameTagInput-' + CSS.escape(oldTag));
    if (inp) { inp.focus(); inp.select(); }
}

export function confirmRenameTag(oldTag, newRaw) {
    const newTag = newRaw.trim().toLowerCase();
    if (!newTag || newTag === oldTag) { renderArchiveSearchTags(); return; }
    state.words.forEach(w => {
        w.tags = w.tags.map(t => t.toLowerCase() === oldTag ? newTag : t);
        w.tags = [...new Set(w.tags)];
    });
    if (state.archiveSearchTags.has(oldTag)) {
        state.archiveSearchTags.delete(oldTag);
        state.archiveSearchTags.add(newTag);
    }
    saveWords();
    initUI();
    showNotification(`TAG RINOMINATO: "${oldTag}" → "${newTag}"`);
}

// ── QUICK SELECT TAG (form aggiungi) ──────────────────────────────────────────

export function updateQuickSelect() {
    const container = document.getElementById('quickSelectTags');
    if (!container) return;
    const allTags = new Set();
    state.words.forEach(w => w.tags.forEach(t => allTags.add(t.toLowerCase())));
    const currentInputTags = document.getElementById('newTags').value.split(',').map(s => s.trim().toLowerCase());
    container.innerHTML = [...allTags].sort().map(t => {
        const isActive = currentInputTags.includes(t);
        return `<button onclick="toggleTagInInput('${t}')" class="text-[11px] px-3 py-1.5 rounded-md border uppercase transition-all ${isActive ? 'theme-tag-active' : 'theme-tag-inactive'}">${t}</button>`;
    }).join('');
}

// ── INIT UI ───────────────────────────────────────────────────────────────────

export function initUI() {
    renderTags();
    renderArchiveSearchTags();
    renderTable();
    updateQuickSelect();
}
