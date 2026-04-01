// ── EDITOR ────────────────────────────────────────────────────────────────────
import { state, setState, saveWords, resetDeck } from './state.js';
import { initUI, renderTags, renderTable, renderArchiveSearchTags, showNotification, showUndoToast, calcItemsPerPage } from './ui.js';

// ── MODALE EDITOR ─────────────────────────────────────────────────────────────

export function openEditor() {
    const modal = document.getElementById('editorModal');
    modal.classList.add('editor-open');
    document.body.style.overflow = 'hidden';
    initUI();
    setTimeout(calcItemsPerPage, 80);
}

export function closeEditor() {
    document.getElementById('editorModal').classList.remove('editor-open');
    document.body.style.overflow = 'auto';
}

// ── AGGIUNTA VOCI ─────────────────────────────────────────────────────────────

export function addWordsBulk() {
    const text     = document.getElementById('newWords').value;
    const lines    = text.split('\n').map(l => l.trim()).filter(l => l);
    const tagsInput = document.getElementById('newTags').value || 'generale';
    const newTags  = tagsInput.split(',').map(t => t.trim().toLowerCase()).filter(t => t);

    let addedCount   = 0;
    let updatedCount = 0;

    lines.forEach(lineText => {
        const existing = state.words.find(w => w.text.toLowerCase() === lineText.toLowerCase());
        if (existing) {
            newTags.forEach(tag => {
                if (!existing.tags.includes(tag)) { existing.tags.push(tag); updatedCount++; }
            });
        } else {
            state.words.push({ text: lineText, tags: [...newTags] });
            addedCount++;
        }
    });

    document.getElementById('newWords').value = '';
    document.getElementById('newTags').value  = '';
    saveWords();
    initUI();
    showNotification(`AGGIUNTE: ${addedCount} VOCI | TAG AGGIORNATI: ${updatedCount}`);
}

// ── PAGINAZIONE ───────────────────────────────────────────────────────────────

export function prevPage() {
    if (state.currentPage > 1) { setState({ currentPage: state.currentPage - 1 }); renderTable(); }
}
export function nextPage() {
    const max = Math.ceil(state.filteredLength / state.itemsPerPage);
    if (state.currentPage < max) { setState({ currentPage: state.currentPage + 1 }); renderTable(); }
}

// ── RICERCA ───────────────────────────────────────────────────────────────────

export function handleTableSearch() {
    const input = document.getElementById('tableSearch');
    setState({ searchQuery: input.value.toLowerCase(), currentPage: 1 });
    const btn = document.getElementById('clearSearchBtn');
    if (btn) btn.style.display = input.value ? 'block' : 'none';
    renderTable();
}

export function clearSearch() {
    const input = document.getElementById('tableSearch');
    if (input) input.value = '';
    const btn = document.getElementById('clearSearchBtn');
    if (btn) btn.style.display = 'none';
    setState({ searchQuery: '', currentPage: 1 });
    renderTable();
}

// ── TOGGLE SEZIONE AGGIUNGI (mobile) ──────────────────────────────────────────

export function toggleAddSection() {
    const sec  = document.getElementById('addSection');
    const btn  = document.getElementById('toggleAddBtn');
    const isOpen = sec.classList.contains('add-open');
    sec.classList.toggle('add-open');
    if (btn) btn.textContent = isOpen ? '+ Aggiungi Voci' : '− Nascondi';
    setTimeout(calcItemsPerPage, 50);
}

// ── MODIFICA DESKTOP ──────────────────────────────────────────────────────────

export function openDesktopEdit(idx) {
    if (window.innerWidth < 1024) return;
    setState({ desktopEditIndex: idx });
    const w = state.words[idx];
    if (!w) return;
    document.getElementById('desktopEditText').value = w.text;
    _renderDesktopEditTags(idx);
    _populateTagSelect('desktopEditTagSelect', w, idx, 'desktop');
    document.getElementById('desktopEditModal').style.display = 'flex';
}

export function closeDesktopEdit() {
    document.getElementById('desktopEditModal').style.display = 'none';
    setState({ desktopEditIndex: -1 });
}

function _renderDesktopEditTags(idx) {
    const w = state.words[idx];
    const container = document.getElementById('desktopEditTags');
    container.innerHTML = w.tags.map(t =>
        `<span onclick="removeDesktopEditTag('${t}')"
               style="font-family:'Rajdhani',sans-serif;font-size:0.6rem;font-weight:700;text-transform:uppercase;
                      padding:4px 10px;border-radius:6px;background:rgba(var(--neon-cyan-rgb),0.1);
                      border:1px solid rgba(var(--neon-cyan-rgb),0.3);color:var(--neon-cyan);cursor:pointer;"
        >${t} ×</span>`
    ).join('');
}

export function removeDesktopEditTag(tag) {
    const idx = state.desktopEditIndex;
    if (idx < 0) return;
    const w = state.words[idx];
    w.tags = w.tags.filter(t => t !== tag);
    if (w.tags.length === 0) w.tags = ['generale'];
    saveWords();
    _renderDesktopEditTags(idx);
}

export function saveDesktopEdit() {
    const idx = state.desktopEditIndex;
    if (idx < 0) return;
    const newText = document.getElementById('desktopEditText').value.trim();
    if (!newText) return;
    const exists = state.words.some((w, i) => i !== idx && w.text.toLowerCase() === newText.toLowerCase());
    if (exists) { showNotification('ERRORE: VOCE GIÀ ESISTENTE'); return; }
    state.words[idx].text = newText;
    saveWords();
    renderTags();
    showNotification('VOCE AGGIORNATA');
    closeDesktopEdit();
    renderTable();
}

export function deleteDesktopEdit() {
    const idx = state.desktopEditIndex;
    if (idx < 0) return;
    const deletedWord = { ...state.words[idx], tags: [...state.words[idx].tags] };
    state.words.splice(idx, 1);
    saveWords(); initUI(); resetDeck();
    closeDesktopEdit();
    showUndoToast('VOCE ELIMINATA', () => {
        state.words.splice(idx, 0, deletedWord);
        saveWords(); initUI(); resetDeck();
        showNotification('ELIMINAZIONE ANNULLATA');
    });
}

// ── MODIFICA MOBILE ───────────────────────────────────────────────────────────

export function openMobileDetail(wordIdx) {
    setState({ mobileDetailIndex: wordIdx });
    const w = state.words[wordIdx];
    if (!w) return;
    document.getElementById('mobileDetailText').value = w.text;
    _renderMobileDetailTags(wordIdx);
    _populateTagSelect('mobileDetailTagSelect', w, wordIdx, 'mobile');
    const screen = document.getElementById('mobileDetailScreen');
    screen.style.display = 'flex';
    setTimeout(() => screen.classList.add('open'), 10);
}

export function closeMobileDetail() {
    const screen = document.getElementById('mobileDetailScreen');
    screen.classList.remove('open');
    setTimeout(() => { screen.style.display = 'none'; }, 260);
    setState({ mobileDetailIndex: -1 });
}

function _renderMobileDetailTags(wordIdx) {
    const w = state.words[wordIdx];
    document.getElementById('mobileDetailTags').innerHTML = w.tags.map(t =>
        `<span class="theme-tag-chip px-3 py-1 rounded text-xs uppercase cursor-pointer"
               onclick="removeMobileDetailTag('${t}')"
               style="background:rgba(var(--neon-cyan-rgb),0.1);color:var(--neon-cyan);border:1px solid rgba(var(--neon-cyan-rgb),0.25);"
        >${t} ×</span>`
    ).join('');
}

export function removeMobileDetailTag(tag) {
    const idx = state.mobileDetailIndex;
    if (idx < 0) return;
    const w = state.words[idx];
    w.tags = w.tags.filter(t => t !== tag);
    if (w.tags.length === 0) w.tags = ['generale'];
    saveWords();
    _renderMobileDetailTags(idx);
}

export function saveMobileDetail() {
    const idx = state.mobileDetailIndex;
    if (idx < 0) return;
    const newText = document.getElementById('mobileDetailText').value.trim();
    if (!newText) return;
    const exists = state.words.some((w, i) => i !== idx && w.text.toLowerCase() === newText.toLowerCase());
    if (exists) { showNotification('ERRORE: VOCE GIÀ ESISTENTE'); return; }
    state.words[idx].text = newText;
    saveWords();
    renderTags();
    showNotification('VOCE AGGIORNATA');
    closeMobileDetail();
    renderTable();
}

export function deleteMobileDetail() {
    const idx = state.mobileDetailIndex;
    if (idx < 0) return;
    const deletedWord = { ...state.words[idx], tags: [...state.words[idx].tags] };
    state.words.splice(idx, 1);
    saveWords(); initUI(); resetDeck();
    closeMobileDetail();
    showUndoToast('VOCE ELIMINATA', () => {
        state.words.splice(idx, 0, deletedWord);
        saveWords(); initUI(); resetDeck();
        showNotification('ELIMINAZIONE ANNULLATA');
    });
}

// Helper: popola il <select> per aggiunta tag
function _populateTagSelect(selectId, w, wordIdx, context) {
    const allTags = [...new Set(state.words.flatMap(w => w.tags.map(t => t.toLowerCase())))].sort();
    const sel = document.getElementById(selectId);
    const refreshSelect = () => {
        const currentTags = state.words[wordIdx]?.tags.map(t => t.toLowerCase()) || [];
        sel.innerHTML = '<option value="">+ Aggiungi tag...</option>' +
            allTags.filter(t => !currentTags.includes(t))
                   .map(t => `<option value="${t}">${t.toUpperCase()}</option>`).join('');
        sel.value = '';
    };
    refreshSelect();
    sel.onchange = function() {
        if (!this.value) return;
        state.words[wordIdx].tags.push(this.value);
        saveWords();
        if (context === 'mobile') {
            _renderMobileDetailTags(wordIdx);
            openMobileDetail(wordIdx);
        } else {
            _renderDesktopEditTags(wordIdx);
            refreshSelect();
        }
    };
}

// ── CONFERMA CANCELLAZIONE DB ─────────────────────────────────────────────────

export function confirmClearDatabase() {
    document.getElementById('clearDbModal').style.display = 'flex';
    closeDrawer();
}
export function closeClearModal() {
    document.getElementById('clearDbModal').style.display = 'none';
}
export function clearDatabase() {
    state.words = [];
    saveWords(); initUI(); resetDeck();
    closeClearModal();
    showNotification('ARCHIVIO ELIMINATO');
}

// ── IMPORT / EXPORT ───────────────────────────────────────────────────────────

export function exportData() {
    const allTags = [...new Set(state.words.flatMap(w => w.tags.map(t => t.toLowerCase())))].sort();
    if (allTags.length === 0) { _doExport(state.words, 'backup.json'); return; }
    _openExportModal(allTags);
}

function _doExport(data, filename) {
    const dl = document.createElement('a');
    dl.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data)));
    dl.setAttribute('download', filename);
    dl.click();
}

function _openExportModal(allTags) {
    let modal = document.getElementById('exportModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'exportModal';
        modal.style.cssText = 'display:none;position:fixed;inset:0;z-index:300;background:rgba(0,0,0,0.72);align-items:center;justify-content:center;padding:24px;';
        modal.innerHTML = `
            <div style="background:var(--bg-panel);border:1px solid rgba(var(--neon-cyan-rgb),0.3);border-radius:16px;padding:28px;max-width:480px;width:100%;box-shadow:0 0 40px rgba(0,0,0,0.5);max-height:80vh;display:flex;flex-direction:column;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                    <h3 style="font-family:'Rajdhani',sans-serif;font-size:1rem;font-weight:800;text-transform:uppercase;letter-spacing:0.12em;color:var(--neon-cyan);">Esporta per Tag</h3>
                    <button id="exportModalClose" style="font-family:'Rajdhani',sans-serif;width:32px;height:32px;border-radius:50%;border:1px solid rgba(var(--neon-cyan-rgb),0.3);background:none;color:var(--neon-cyan);font-size:1.1rem;cursor:pointer;opacity:0.6;">×</button>
                </div>
                <div style="display:flex;gap:8px;margin-bottom:12px;flex-shrink:0;">
                    <button id="exportSelAll"   class="cyber-button py-1 text-[10px] flex-1">Seleziona tutto</button>
                    <button id="exportDeselAll" class="cyber-button py-1 text-[10px] flex-1">Deseleziona tutto</button>
                </div>
                <div id="exportTagList" style="flex:1;overflow-y:auto;display:flex;flex-wrap:wrap;gap:8px;align-content:flex-start;padding:4px 0;margin-bottom:16px;"></div>
                <div style="display:flex;align-items:center;justify-content:space-between;flex-shrink:0;gap:10px;border-top:1px solid rgba(var(--neon-cyan-rgb),0.1);padding-top:14px;">
                    <span id="exportCount" style="font-family:'Rajdhani',sans-serif;font-size:0.7rem;font-weight:700;color:var(--neon-cyan);opacity:0.6;"></span>
                    <div style="display:flex;gap:8px;">
                        <button id="exportCancel"  class="cyber-button px-6 py-2 text-xs">Annulla</button>
                        <button id="exportConfirm" class="cyber-button button-primary px-6 py-2 text-xs">Scarica JSON</button>
                    </div>
                </div>
            </div>`;
        document.body.appendChild(modal);
        // Event listeners — nessun onclick inline
        modal.querySelector('#exportModalClose').addEventListener('click', () => { modal.style.display = 'none'; });
        modal.querySelector('#exportCancel').addEventListener('click',     () => { modal.style.display = 'none'; });
        modal.querySelector('#exportSelAll').addEventListener('click',     () => { _exportSelectAll(true); });
        modal.querySelector('#exportDeselAll').addEventListener('click',   () => { _exportSelectAll(false); });
        modal.querySelector('#exportConfirm').addEventListener('click',    _confirmExport);
    }

    const list = modal.querySelector('#exportTagList');
    list.innerHTML = allTags.map(tag => {
        const count = state.words.filter(w => w.tags.some(t => t.toLowerCase() === tag)).length;
        return `
            <label style="display:inline-flex;align-items:center;gap:6px;cursor:pointer;padding:6px 10px;border-radius:8px;border:1px solid rgba(var(--neon-cyan-rgb),0.2);background:rgba(var(--neon-cyan-rgb),0.04);transition:background 0.15s;">
                <input type="checkbox" class="export-tag-cb" value="${tag}" checked style="accent-color:var(--neon-cyan);width:13px;height:13px;cursor:pointer;">
                <span style="font-family:'Rajdhani',sans-serif;font-size:0.65rem;font-weight:700;text-transform:uppercase;color:var(--neon-cyan);">${tag}</span>
                <span style="font-family:'Rajdhani',sans-serif;font-size:0.6rem;color:var(--neon-cyan);opacity:0.4;">(${count})</span>
            </label>`;
    }).join('');

    list.querySelectorAll('.export-tag-cb').forEach(cb => cb.addEventListener('change', _updateExportCount));
    _updateExportCount();
    modal.style.display = 'flex';
}

function _exportSelectAll(checked) {
    document.querySelectorAll('.export-tag-cb').forEach(cb => cb.checked = checked);
    _updateExportCount();
}

function _updateExportCount() {
    const allCbs   = document.querySelectorAll('.export-tag-cb');
    const selected = [...document.querySelectorAll('.export-tag-cb:checked')].map(cb => cb.value);
    const isAll    = selected.length === allCbs.length;
    const count    = isAll ? state.words.length : state.words.filter(w => w.tags.some(t => selected.includes(t.toLowerCase()))).length;
    const el = document.getElementById('exportCount');
    if (el) el.textContent = isAll ? `${count} voci (archivio completo)` : `${count} voci selezionate`;
}

function _confirmExport() {
    const allCbs   = document.querySelectorAll('.export-tag-cb');
    const selected = [...document.querySelectorAll('.export-tag-cb:checked')].map(cb => cb.value);
    const isAll    = selected.length === allCbs.length;
    const data     = isAll ? state.words : state.words.filter(w => w.tags.some(t => selected.includes(t.toLowerCase())));
    if (data.length === 0) { showNotification('NESSUNA VOCE DA ESPORTARE'); return; }
    _doExport(data, isAll ? 'backup-completo.json' : `backup-${selected.join('-')}.json`);
    document.getElementById('exportModal').style.display = 'none';
    showNotification(`ESPORTATE ${data.length} VOCI`);
}

export function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const imported = JSON.parse(e.target.result);
            if (!Array.isArray(imported)) throw new Error();
            let addedCount = 0, updatedTagsCount = 0;
            imported.forEach(item => {
                const existing = state.words.find(w => w.text.toLowerCase() === item.text.toLowerCase());
                if (existing) {
                    item.tags.forEach(tag => {
                        const lt = tag.toLowerCase();
                        if (!existing.tags.map(t => t.toLowerCase()).includes(lt)) {
                            existing.tags.push(lt); updatedTagsCount++;
                        }
                    });
                } else {
                    state.words.push(item); addedCount++;
                }
            });
            saveWords(); initUI(); resetDeck();
            showNotification(`NUOVE VOCI: ${addedCount} | TAG UNIFICATI: ${updatedTagsCount}`);
        } catch { showNotification('ERRORE NEL FORMATO DEL FILE'); }
    };
    reader.readAsText(file);
    event.target.value = '';
}

// ── DRAWER (mobile) ───────────────────────────────────────────────────────────

export function toggleDrawer() {
    document.getElementById('drawer').classList.toggle('open');
    document.getElementById('drawerOverlay').classList.toggle('open');
}

export function closeDrawer() {
    document.getElementById('drawer').classList.remove('open');
    document.getElementById('drawerOverlay').classList.remove('open');
}

export function initDrawerDrag() {
    const drawer  = document.getElementById('drawer');
    const overlay = document.getElementById('drawerOverlay');
    if (!drawer) return;

    let startY = 0, currentY = 0, dragging = false, drawerH = 0;

    drawer.addEventListener('touchstart', e => {
        drawerH  = drawer.offsetHeight;
        startY   = e.touches[0].clientY;
        currentY = startY;
        dragging = true;
        drawer.style.transition = 'none';
    }, { passive: true });

    drawer.addEventListener('touchmove', e => {
        if (!dragging) return;
        currentY = e.touches[0].clientY;
        const deltaY  = currentY - startY;
        if (deltaY <= 0) { drawer.style.transform = 'translateY(0)'; return; }
        const clamped = Math.min(deltaY, drawerH);
        drawer.style.transform  = `translateY(${clamped}px)`;
        overlay.style.opacity   = 1 - (clamped / drawerH) * 0.85;
        e.preventDefault();
    }, { passive: false });

    drawer.addEventListener('touchend', () => {
        if (!dragging) return;
        dragging = false;
        drawer.style.transition = '';
        overlay.style.opacity   = '';
        if (currentY - startY > drawerH * 0.35) {
            closeDrawer();
            drawer.style.transform = '';
        } else {
            drawer.style.transform = '';
        }
    }, { passive: true });
}

// ── DB DEFAULT ────────────────────────────────────────────────────────────────

export function loadDefaultDB(silent = false) {
    if (silent) { confirmLoadDefaultDB(); return; }
    document.getElementById('loadDefaultDbModal').style.display = 'flex';
    closeDrawer();
}

export function closeLoadDefaultModal() {
    document.getElementById('loadDefaultDbModal').style.display = 'none';
}

export async function confirmLoadDefaultDB() {
    closeLoadDefaultModal();
    try {
        const response = await fetch('db-argomenti-v1.json');
        if (!response.ok) throw new Error();
        state.words = await response.json();
        saveWords(); initUI(); resetDeck();
        showNotification('ARCHIVIO DEFAULT CARICATO');
    } catch { showNotification('ERRORE: USA LIVE SERVER PER IL FILE JSON'); }
}
