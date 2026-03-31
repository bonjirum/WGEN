let words = JSON.parse(localStorage.getItem('myWords')) || [];
        let _firstLoad = words.length === 0;
        let _calcDebounce = null;
        let activeTags = new Set();
        let archiveSearchTags = new Set();
        let currentPage = 1;
        let itemsPerPage = 12;
        let _filteredLength = 0;
        let _mobileDetailIndex = -1;
        let _mobileDetailFiltered = [];
        let _desktopEditIndex = -1;
        let searchQuery = "";
        let currentDeck = [];
        let editingTagIndex = null;

        function save() { localStorage.setItem('myWords', JSON.stringify(words)); }
        function init() { renderTags(); renderArchiveSearchTags(); renderTable(); updateQuickSelect(); }

        async function loadDefaultDB() {
            try {
                const response = await fetch('db-argomenti-v1.json');
                if (!response.ok) throw new Error();
                words = await response.json();
                save(); init(); resetDeck();
                showNotification("DATABASE DEFAULT CARICATO");
            } catch (err) { showNotification("ERR: USA LIVE SERVER PER IL FILE JSON"); }
        }

        function openEditor() {
            const modal = document.getElementById('editorModal');
            modal.classList.add('editor-open');
            document.body.style.overflow = 'hidden';
            init();
            setTimeout(calcItemsPerPage, 80);
        }
        function closeEditor() {
            document.getElementById('editorModal').classList.remove('editor-open');
            document.body.style.overflow = 'auto';
        }

        let _toastTimeout = null;
        function showNotification(m) {
            // Rimuovi toast esistente
            const existing = document.querySelector('.cyber-toast');
            if (existing) existing.remove();
            if (_toastTimeout) clearTimeout(_toastTimeout);
            const t = document.createElement('div'); t.className = 'cyber-toast animate-fade'; t.innerText = m;
            document.body.appendChild(t);
            _toastTimeout = setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 400); }, 1500);
        }

        function resetDeck() { currentDeck = []; showNotification("POOL RESETTATO"); }
        function adjustCount(v) {
            const mob = document.getElementById('wordCount');
            const desk = document.getElementById('wordCountDesktop');
            const cur = parseInt((mob || desk).value);
            const n = cur + v;
            if (n >= 1 && n <= 10) { if(mob) mob.value=n; if(desk) desk.value=n; }
        }

        function updateQuickSelect() {
            const container = document.getElementById('quickSelectTags');
            const allTags = new Set();
            words.forEach(w => w.tags.forEach(t => allTags.add(t.toLowerCase())));
            const currentInputTags = document.getElementById('newTags').value.split(',').map(s => s.trim().toLowerCase());
            container.innerHTML = [...allTags].sort().map(t => {
                const isActive = currentInputTags.includes(t);
                return `<button onclick="toggleTagInInput('${t}')" class="text-[11px] px-3 py-1.5 rounded-md border uppercase transition-all ${isActive ? 'theme-tag-active' : 'theme-tag-inactive'}">${t}</button>`;
            }).join('');
        }

        function toggleTagInInput(tag) {
            const input = document.getElementById('newTags');
            let current = input.value.split(',').map(s => s.trim().toLowerCase()).filter(s => s);
            if (current.includes(tag)) current = current.filter(t => t !== tag);
            else current.push(tag);
            input.value = current.join(', ');
            updateQuickSelect();
        }

        function handleTableSearch() {
            const input = document.getElementById('tableSearch');
            searchQuery = input.value.toLowerCase();
            const btn = document.getElementById('clearSearchBtn');
            if (btn) btn.style.display = input.value ? 'block' : 'none';
            currentPage = 1;
            renderTable();
        }
        function clearSearch() {
            const input = document.getElementById('tableSearch');
            if (input) input.value = '';
            const btn = document.getElementById('clearSearchBtn');
            if (btn) btn.style.display = 'none';
            searchQuery = '';
            currentPage = 1;
            renderTable();
        }

        function renderArchiveSearchTags() {
            const container = document.getElementById('archiveTagFilters');

            const tagCounts = {};
            words.forEach(w => {
                w.tags.forEach(t => {
                    const lowerTag = t.toLowerCase();
                    tagCounts[lowerTag] = (tagCounts[lowerTag] || 0) + 1;
                });
            });

            const allTags = Object.keys(tagCounts).sort();

            container.innerHTML = allTags.map(tag => {
                const active = archiveSearchTags.has(tag);
                const count = tagCounts[tag];
                return `
                    <div style="display:inline-flex;align-items:center;gap:0;" id="tagpill-${CSS.escape(tag)}">
                        <button onclick="toggleArchiveTag('${tag}')"
                            class="px-4 py-2 rounded-l-lg text-[11px] font-bold border-y border-l uppercase transition-all
                            ${active ? 'theme-tag-active' : 'theme-tag-inactive'}" style="border-right:none;">
                            ${tag} (${count})
                        </button>
                        <button onclick="startRenameTag('${tag}')"
                            title="Rinomina tag"
                            class="py-2 px-2 rounded-r-lg text-[11px] border-y border-r uppercase transition-all
                            ${active ? 'theme-tag-active' : 'theme-tag-inactive'}"
                            style="border-left:1px solid rgba(var(--neon-cyan-rgb),0.15);opacity:0.5;"
                            onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.5">✎</button>
                    </div>`;
            }).join('');
        }

        function startRenameTag(oldTag) {
            const pill = document.getElementById('tagpill-' + CSS.escape(oldTag));
            if (!pill) return;
            const active = archiveSearchTags.has(oldTag);
            const count = (words.filter(w => w.tags.some(t => t.toLowerCase() === oldTag)).length);
            pill.innerHTML = `
                <input id="renameTagInput-${CSS.escape(oldTag)}"
                    value="${oldTag}"
                    class="cyber-input rounded-lg text-[11px] font-bold uppercase px-3 py-2"
                    style="min-width:90px;max-width:160px;border-color:rgba(var(--neon-cyan-rgb),0.7);"
                    onkeydown="if(event.key==='Enter'){confirmRenameTag('${oldTag}',this.value)}else if(event.key==='Escape'){renderArchiveSearchTags()}"
                    onblur="setTimeout(()=>confirmRenameTag('${oldTag}',this.value),120)"
                    autofocus>`;
            const inp = document.getElementById('renameTagInput-' + CSS.escape(oldTag));
            if (inp) { inp.focus(); inp.select(); }
        }

        function confirmRenameTag(oldTag, newRaw) {
            const newTag = newRaw.trim().toLowerCase();
            if (!newTag || newTag === oldTag) { renderArchiveSearchTags(); return; }
            // Rinomina in tutto il database
            words.forEach(w => {
                w.tags = w.tags.map(t => t.toLowerCase() === oldTag ? newTag : t);
                // Deduplica
                w.tags = [...new Set(w.tags)];
            });
            // Aggiorna archiveSearchTags se il tag era attivo
            if (archiveSearchTags.has(oldTag)) {
                archiveSearchTags.delete(oldTag);
                archiveSearchTags.add(newTag);
            }
            save();
            init();
            showNotification(`TAG RINOMINATO: "${oldTag}" → "${newTag}"`);
        }

        function toggleArchiveTag(t) { if(archiveSearchTags.has(t)) archiveSearchTags.delete(t); else archiveSearchTags.add(t); currentPage = 1; renderArchiveSearchTags(); renderTable(); }

        function renderTable() {
            const tbody = document.getElementById('wordTableBody');
            let filtered = [...words].reverse().filter(w => {
                const matchesText = w.text.toLowerCase().includes(searchQuery);
                const matchesTags = archiveSearchTags.size === 0 || [...archiveSearchTags].every(t => w.tags.some(wt => wt.toLowerCase() === t.toLowerCase()));
                return matchesText && matchesTags;
            });

            const paginatedItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
            const allDatabaseTags = [...new Set(words.flatMap(w => w.tags.map(t => t.toLowerCase())))].sort();

            const isMobileView = window.innerWidth < 1024;
            tbody.innerHTML = paginatedItems.map((w) => {
                const idx = words.findIndex(item => item.text === w.text);
                const isAdding = editingTagIndex === idx;

                if (isMobileView) {
                    return `
                    <tr onclick="openMobileDetail(${idx})" style="cursor:pointer;">
                        <td class="p-4" style="width:100%;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">
                            <div class="font-bold theme-editable" style="overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">${w.text}</div>
                        </td>
                        <td style="padding:0 12px 0 4px;text-align:right;color:var(--neon-cyan);font-size:1.4rem;white-space:nowrap;width:28px;vertical-align:middle;">›</td>
                    </tr>`;
                }

                // Tag: mostra quelli che stanno, +X per gli altri
                const MAX_TAGS_VISIBLE = 3;
                const visibleTags = w.tags.slice(0, MAX_TAGS_VISIBLE);
                const hiddenCount = w.tags.length - MAX_TAGS_VISIBLE;
                const tagsHtml = visibleTags.map(t =>
                    `<span class="theme-tag-chip px-2 py-0.5 rounded text-[9px] uppercase" style="background:rgba(var(--neon-cyan-rgb),0.08);color:var(--neon-cyan);border:1px solid rgba(var(--neon-cyan-rgb),0.2);white-space:nowrap;">${t}</span>`
                ).join('') + (hiddenCount > 0 ? `<span onclick="openDesktopEdit(${idx})" style="font-family:'Rajdhani',sans-serif;font-size:0.6rem;font-weight:700;color:var(--neon-cyan);opacity:0.6;cursor:pointer;white-space:nowrap;padding:2px 6px;">+${hiddenCount}</span>` : '');

                return `
                <tr class="theme-row-hover transition" style="cursor:pointer;" onclick="openDesktopEdit(${idx})">
                    <td class="p-4" style="width:55%;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;max-width:0;">
                        <div class="font-bold theme-editable" style="overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">${w.text}</div>
                    </td>
                    <td class="p-4" style="width:35%;overflow:hidden;max-width:0;">
                        <div style="display:flex;gap:4px;align-items:center;overflow:hidden;flex-wrap:nowrap;">${tagsHtml}</div>
                    </td>
                    <td class="p-4 text-right" style="width:10%;white-space:nowrap;" onclick="event.stopPropagation()">
                        <button onclick="openDesktopEdit(${idx})" style="font-family:'Rajdhani',sans-serif;font-size:0.65rem;font-weight:700;background:none;border:none;color:var(--neon-cyan);cursor:pointer;text-transform:uppercase;opacity:0.6;transition:opacity 0.2s;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.6">Modifica</button>
                    </td>
                </tr>`;
            }).join('');

            _filteredLength = filtered.length;
            _mobileDetailFiltered = filtered;
            document.getElementById('paginationInfo').innerText = `Pagina ${currentPage} di ${Math.ceil(filtered.length/itemsPerPage) || 1}`;
            // Ricalcola se le righe hanno altezza variabile (frasi lunghe)
            const modal = document.getElementById('editorModal');
            if (modal && modal.classList.contains('editor-open')) {
                clearTimeout(_calcDebounce);
                _calcDebounce = setTimeout(calcItemsPerPage, 80);
            }
        }

        function confirmInlineTag(idx, val) { if(val) words[idx].tags.push(val); editingTagIndex = null; save(); init(); }
        function removeTagFromWord(wi, t) { words[wi].tags = words[wi].tags.filter(tag => tag !== t); if(words[wi].tags.length === 0) words[wi].tags = ['generale']; save(); init(); }
        function deleteWord(i) { words.splice(i, 1); save(); init(); }
        function updateWordText(index, newText) {
            const cleanText = newText.trim();
            const oldText = words[index].text;

            // Se il testo non è cambiato o è vuoto, ripristina e annulla
            if (!cleanText || cleanText === oldText) {
                renderTable();
                return;
            }

            // Controllo duplicati: esiste già questo testo in un'ALTRA posizione?
            const exists = words.some((w, i) => i !== index && w.text.toLowerCase() === cleanText.toLowerCase());

            if (exists) {
                showNotification("ERRORE: PAROLA GIÀ ESISTENTE");
                renderTable(); // Forza il refresh per cancellare il testo duplicato appena scritto
                return;
            }

            // Aggiorna l'array e salva
            words[index].text = cleanText;
            save();
            // Aggiorniamo i filtri in caso la parola fosse l'unica con quel nome nella dashboard
            renderTags();
            showNotification("VOCE AGGIORNATA");
        }
        function prevPage() { if(currentPage > 1) { currentPage--; renderTable(); } }
        function nextPage() { if(currentPage < Math.ceil(_filteredLength/itemsPerPage)) { currentPage++; renderTable(); } }

        function addWordsBulk() {
            const text = document.getElementById('newWords').value;
            const lines = text.split('\n').map(l => l.trim()).filter(l => l);
            const tagsInput = document.getElementById('newTags').value || 'generale';
            const newTags = tagsInput.split(',').map(t => t.trim().toLowerCase()).filter(t => t);

            let addedCount = 0;
            let updatedCount = 0;

            lines.forEach(lineText => {
                // Cerca se la parola esiste già
                const existingWord = words.find(w => w.text.toLowerCase() === lineText.toLowerCase());

                if (existingWord) {
                    // Se esiste, aggiungi solo i tag che non ha già
                    newTags.forEach(tag => {
                        if (!existingWord.tags.includes(tag)) {
                            existingWord.tags.push(tag);
                            updatedCount++;
                        }
                    });
                } else {
                    // Se non esiste, crea la nuova voce
                    words.push({ text: lineText, tags: [...newTags] });
                    addedCount++;
                }
            });

            document.getElementById('newWords').value = '';
            document.getElementById('newTags').value = '';
            save();
            init();

            showNotification(`AGGIUNTI: ${addedCount} | TAG AGGIORNATI: ${updatedCount}`);
        }

        function renderTags() {
            const container = document.getElementById('tagFilters');

            // 1. Contiamo le occorrenze per ogni tag
            const tagCounts = {};
            words.forEach(w => {
                w.tags.forEach(t => {
                    const lowerTag = t.toLowerCase();
                    tagCounts[lowerTag] = (tagCounts[lowerTag] || 0) + 1;
                });
            });

            // 2. Otteniamo la lista unica dei tag ordinata
            const allTags = Object.keys(tagCounts).sort();

            // 3. Generiamo l'HTML con i numeri e lo stile più grande (px-4 py-2 e text-xs)
            const tagsHtml = allTags.map(t => {
                const active = activeTags.has(t);
                const count = tagCounts[t];
                return `
                    <button onclick="toggleTag('${t}')"
                        class="px-4 py-2 rounded-lg text-xs font-bold border uppercase transition-all hover:border-cyan-500
                        ${active ? 'theme-tag-active' : 'theme-tag-inactive'}">
                        ${t} (${count})
                    </button>`;
            }).join('');
            container.innerHTML = tagsHtml;
            const mob = document.getElementById('tagFiltersMobile');
            if (mob) mob.innerHTML = tagsHtml;
        }

        function toggleTag(t) {
    if(activeTags.has(t)) activeTags.delete(t);
    else activeTags.add(t);
    resetDeck(); // Forza la rigenerazione del mazzo con i nuovi filtri
    renderTags();
}

// ── PALETTE SHADOWS (unica fonte di verità) ──────────────────────────────────
function getPaletteShadows(palette) {
    const altColor = getComputedStyle(document.documentElement).getPropertyValue('--alt-color').trim();
    switch (palette) {
        case 'cyberpunk':
            return {
                cyan: '0 0 8px var(--neon-cyan), 2px 2px 0 #003333, 3px 4px 0 rgba(0,0,0,0.5)',
                alt:  '0 0 6px rgba(255,255,255,0.5), 2px 2px 0 #111, 3px 4px 0 rgba(0,0,0,0.4)',
            };
        case 'retrowave':
            return {
                cyan: '0 0 8px var(--neon-cyan), 2px 2px 0 #4a0018, 3px 4px 0 rgba(0,0,0,0.5)',
                alt:  '0 0 8px ' + altColor + ', 2px 2px 0 #4a2000, 3px 4px 0 rgba(0,0,0,0.5)',
            };
        case 'cioccolato':
            return {
                cyan: '0 0 8px rgba(255,248,240,0.6), 2px 2px 0 #2a1410, 3px 4px 0 rgba(0,0,0,0.5)',
                alt:  '0 0 8px rgba(192,133,82,0.6), 2px 2px 0 #2a1410, 3px 4px 0 rgba(0,0,0,0.5)',
            };
        case 'halloween':
            return {
                cyan: '0 0 8px #FA8112, 2px 2px 0 #5a2500, 3px 4px 0 rgba(0,0,0,0.5)',
                alt:  '2px 2px 0 #111, 3px 4px 0 rgba(0,0,0,0.4)',
            };
        case 'pastello':
            return {
                cyan: '0 0 10px rgba(221,174,211,0.7), 2px 3px 6px rgba(0,0,0,0.7)',
                alt:  '2px 3px 6px rgba(0,0,0,0.7)',
            };
        case 'giungla':
            return {
                cyan: '0 0 8px #9DC08B, 2px 2px 0 #1a2918, 3px 4px 0 rgba(0,0,0,0.5)',
                alt:  '2px 2px 0 #1a2918, 3px 4px 0 rgba(0,0,0,0.4)',
            };
        case 'elettrico':
            return {
                cyan: '0 0 8px #F4CE14, 2px 2px 0 #5a4a00, 3px 4px 0 rgba(0,0,0,0.5)',
                alt:  '2px 2px 0 #111, 3px 4px 0 rgba(0,0,0,0.4)',
            };
        case 'caramella':
            return {
                cyan: '0 0 8px #FF3F7F, 2px 2px 0 #1a0035, 3px 4px 0 rgba(0,0,0,0.5)',
                alt:  '0 0 8px #FFC400, 2px 2px 0 #1a0035, 3px 4px 0 rgba(0,0,0,0.5)',
            };
        case 'ferrari':
            return {
                cyan: '0 0 8px #DA0037, 2px 2px 0 #3a0010, 3px 4px 0 rgba(0,0,0,0.5)',
                alt:  '2px 2px 0 #111, 3px 4px 0 rgba(0,0,0,0.4)',
            };
        default: // switch e altri
            return {
                cyan: '0 0 12px var(--neon-cyan), 2px 3px 6px rgba(0,0,0,0.9)',
                alt:  '0 0 12px ' + altColor + ', 2px 3px 6px rgba(0,0,0,0.9)',
            };
    }
}

function generate() {
    const display = document.getElementById('displayArea');
    const _wc = document.getElementById('wordCount') || document.getElementById('wordCountDesktop');
    const count = parseInt(_wc.value);

    // Filtra le parole in base ai tag attivi
    let filtered = activeTags.size > 0
        ? words.filter(w => w.tags.some(t => activeTags.has(t.toLowerCase())))
        : words;

    if(filtered.length === 0) return;

    let results = [];
    for(let i=0; i<count; i++) {
        if(currentDeck.length === 0) {
            currentDeck = [...filtered].sort(() => Math.random() - 0.5);
        }
        let picked = currentDeck.pop();
        if(!picked) {
            currentDeck = [...filtered].sort(() => Math.random() - 0.5);
            picked = currentDeck.pop();
        }
        results.push(picked.text);
    }

    const palette = document.documentElement.getAttribute('data-palette') || 'cyberpunk';
    const shadows = getPaletteShadows(palette);

    display.innerHTML = results.map((res, i) => {
        const isCyan = i % 2 === 0;
        const color  = isCyan ? 'var(--neon-cyan)' : 'var(--alt-color)';
        const shadow = isCyan ? shadows.cyan : shadows.alt;
        return `<div class="animate-fade font-extrabold text-center" style="color:${color}; text-shadow:${shadow}; overflow-wrap:normal; word-break:keep-all; hyphens:none; line-height:0.94;">${res}</div>`;
    }).join('');

    fitTextToContainer();

    // Se il timer è attivo, resettalo ad ogni generazione manuale
    if (_autoTimer.active) _autoTimer.reset();
}

function fitTextToContainer() {
    const display = document.getElementById('displayArea');
    const items = display.querySelectorAll('div.animate-fade');
    if (!items.length) return;

    const pad = 32;
    const availableWidth = display.clientWidth - pad * 2;
    const availableHeight = display.clientHeight - pad * 2;

    // Setup iniziale
    items.forEach(el => {
        el.style.width = availableWidth + 'px';
        el.style.flexShrink = '0';
        el.style.whiteSpace = 'normal';
        el.style.marginBottom = '0';
    });

    // Binary search: gap = 0.7 * fontSize
    let lo = 8, hi = 42;
    while (lo < hi) {
        const mid = Math.ceil((lo + hi) / 2);
        const gap = Math.round(mid * 0.7);
        items.forEach(el => el.style.fontSize = mid + 'px');
        const totalH = Array.from(items).reduce((sum, el) => sum + el.scrollHeight, 0)
                      + gap * (items.length - 1);
        const anyOverflow = Array.from(items).some(el => el.scrollWidth > availableWidth + 1);
        if (totalH <= availableHeight && !anyOverflow) lo = mid;
        else hi = mid - 1;
    }

    // Applica font finale e gap come margin-bottom tranne sull'ultimo
    const finalGap = Math.round(lo * 0.7);
    const itemsArr = Array.from(items);
    itemsArr.forEach((el, i) => {
        el.style.fontSize = lo + 'px';
        el.style.marginBottom = i < itemsArr.length - 1 ? finalGap + 'px' : '0';
    });

    // Centra verticalmente con padding-top
    const totalH = itemsArr.reduce((sum, el) => sum + el.scrollHeight, 0)
                  + finalGap * (itemsArr.length - 1);
    const topPad = Math.max(pad, (display.clientHeight - totalH) / 2);
    display.style.paddingTop = topPad + 'px';
    display.style.paddingBottom = topPad + 'px';
}

        function exportData() { const dl = document.createElement('a'); dl.setAttribute("href", "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(words))); dl.setAttribute("download", "backup.json"); dl.click(); }
        function importData(event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const importedWords = JSON.parse(e.target.result);
                    if (Array.isArray(importedWords)) {
                        let addedCount = 0;
                        let updatedTagsCount = 0;

                        importedWords.forEach(importedItem => {
                            const existingWord = words.find(w => w.text.toLowerCase() === importedItem.text.toLowerCase());

                            if (existingWord) {
                                // Unisci i tag del file con quelli esistenti evitando duplicati
                                importedItem.tags.forEach(tag => {
                                    const lowerTag = tag.toLowerCase();
                                    if (!existingWord.tags.map(t => t.toLowerCase()).includes(lowerTag)) {
                                        existingWord.tags.push(lowerTag);
                                        updatedTagsCount++;
                                    }
                                });
                            } else {
                                // Aggiungi la parola nuova
                                words.push(importedItem);
                                addedCount++;
                            }
                        });

                        save();
                        init();
                        resetDeck();
                        showNotification(`NUOVE VOCI: ${addedCount} | TAG UNIFICATI: ${updatedTagsCount}`);
                    }
                } catch (err) {
                    showNotification("ERRORE NEL FORMATO DEL FILE");
                }
            };
            reader.readAsText(file);
            event.target.value = '';
        }

        function toggleDrawer() {
            document.getElementById('drawer').classList.toggle('open');
            document.getElementById('drawerOverlay').classList.toggle('open');
        }
        function closeDrawer() {
            document.getElementById('drawer').classList.remove('open');
            document.getElementById('drawerOverlay').classList.remove('open');
        }

        // ── DRAWER DRAG TO DISMISS ────────────────────────────────────────────────────
        (function initDrawerDrag() {
            const drawer  = document.getElementById('drawer');
            const overlay = document.getElementById('drawerOverlay');
            if (!drawer) return;

            let startY     = 0;
            let currentY   = 0;
            let dragging   = false;
            let drawerH    = 0;

            function onTouchStart(e) {
                // Drag solo dalla handle o dall'area in alto del drawer
                drawerH  = drawer.offsetHeight;
                startY   = e.touches[0].clientY;
                currentY = startY;
                dragging = true;
                // Disabilita la transition durante il drag per seguire il dito in tempo reale
                drawer.style.transition = 'none';
            }

            function onTouchMove(e) {
                if (!dragging) return;
                currentY = e.touches[0].clientY;
                const deltaY = currentY - startY;
                // Permetti solo drag verso il basso (deltaY > 0)
                if (deltaY <= 0) {
                    drawer.style.transform = 'translateY(0)';
                    return;
                }
                // Resistenza leggera oltre il 60% dell'altezza
                const maxDrag = drawerH;
                const clamped = Math.min(deltaY, maxDrag);
                drawer.style.transform = `translateY(${clamped}px)`;

                // Sfuma l'overlay proporzionalmente
                const progress = clamped / drawerH;
                overlay.style.opacity = 1 - progress * 0.85;

                // Previeni lo scroll della pagina durante il drag
                e.preventDefault();
            }

            function onTouchEnd() {
                if (!dragging) return;
                dragging = false;
                // Riabilita la transition
                drawer.style.transition = '';
                overlay.style.opacity   = '';

                const deltaY    = currentY - startY;
                const threshold = drawerH * 0.35; // chiudi se trascinato oltre il 35%

                if (deltaY > threshold) {
                    closeDrawer();
                    drawer.style.transform = ''; // lascia che il CSS gestisca
                } else {
                    // Rimbalza su
                    drawer.style.transform = '';
                }
            }

            drawer.addEventListener('touchstart', onTouchStart, { passive: true });
            drawer.addEventListener('touchmove',  onTouchMove,  { passive: false });
            drawer.addEventListener('touchend',   onTouchEnd,   { passive: true });
        })();


        function toggleAddSection() {
            const sec = document.getElementById('addSection');
            const btn = document.getElementById('toggleAddBtn');
            const isOpen = sec.classList.contains('add-open');
            sec.classList.toggle('add-open');
            if (btn) btn.textContent = isOpen ? '+ Aggiungi Voci' : '− Nascondi';
            // Ricalcola items dopo toggle
            setTimeout(calcItemsPerPage, 50);
        }

        function calcItemsPerPage() {
            const modal = document.getElementById('editorModal');
            const container = document.getElementById('tableContainer');
            if (!modal || !container || !modal.classList.contains('editor-open')) return;

            const ROW_H = 52; // altezza fissa delle righe (deve corrispondere al CSS)

            // Misura tutti gli elementi fissi sottraendo dal totale
            const modalH = modal.clientHeight;
            const inner = modal.querySelector(':scope > div');
            const innerPaddingV = 32; // 1rem top + 1rem bottom (mobile: 0.75rem * 2 = 24)

            const header = document.querySelector('#editorModal .flex.justify-between.items-center');
            const headerH = header ? header.offsetHeight + 16 : 60;

            const toggleBtn = document.getElementById('toggleAddBtn');
            const isMobile = window.innerWidth < 1024;
            const toggleH = (isMobile && toggleBtn) ? toggleBtn.offsetHeight + 12 : 0;

            const addSec = document.getElementById('addSection');
            const addOpen = addSec && addSec.classList.contains('add-open');
            const addH = addOpen ? addSec.offsetHeight + 16 : 0;

            // Gap tra addSection e tableContainer
            const gapH = addOpen ? 0 : 0;

            // Dentro tableContainer: padding + search + thead + pagination
            const tcPadV = 48; // p-6 = 1.5rem * 2
            const searchRow = container.querySelector(':scope > div:first-child');
            const searchH = searchRow ? searchRow.offsetHeight + 16 : 70;
            const thead = container.querySelector('thead');
            const theadH = thead ? thead.offsetHeight : 44;
            const pagination = document.getElementById('paginationBar');
            const paginationH = pagination ? pagination.offsetHeight + 12 : 52;

            const pad = isMobile ? 24 : innerPaddingV;
            const available = modalH - pad - headerH - toggleH - addH - gapH - tcPadV - searchH - theadH - paginationH;
            const newItems = Math.max(1, Math.floor(available / ROW_H));

            if (newItems !== itemsPerPage) {
                itemsPerPage = newItems;
                currentPage = 1;
                renderTable();
            }
        }


        function openMobileDetail(wordIdx) {
            _mobileDetailIndex = wordIdx;
            const w = words[wordIdx];
            if (!w) return;
            const screen = document.getElementById('mobileDetailScreen');
            document.getElementById('mobileDetailText').value = w.text;
            renderMobileDetailTags(wordIdx);
            // Popola select tag disponibili
            const allTags = [...new Set(words.flatMap(w => w.tags.map(t => t.toLowerCase())))].sort();
            const sel = document.getElementById('mobileDetailTagSelect');
            sel.innerHTML = '<option value="">+ Aggiungi tag...</option>' +
                allTags.filter(t => !w.tags.map(wt => wt.toLowerCase()).includes(t))
                       .map(t => `<option value="${t}">${t.toUpperCase()}</option>`).join('');
            sel.onchange = function() {
                if (this.value) {
                    words[_mobileDetailIndex].tags.push(this.value);
                    save();
                    renderMobileDetailTags(_mobileDetailIndex);
                    openMobileDetail(_mobileDetailIndex); // refresh select
                }
            };
            screen.style.display = 'flex';
            setTimeout(() => screen.classList.add('open'), 10);
        }

        function renderMobileDetailTags(wordIdx) {
            const w = words[wordIdx];
            const container = document.getElementById('mobileDetailTags');
            container.innerHTML = w.tags.map(t =>
                `<span class="theme-tag-chip px-3 py-1 rounded text-xs uppercase cursor-pointer"
                       onclick="removeMobileDetailTag('${t}')"
                       style="background:rgba(var(--neon-cyan-rgb),0.1);color:var(--neon-cyan);border:1px solid rgba(var(--neon-cyan-rgb),0.25);">
                    ${t} ×
                </span>`
            ).join('');
        }

        function removeMobileDetailTag(tag) {
            if (_mobileDetailIndex < 0) return;
            const w = words[_mobileDetailIndex];
            w.tags = w.tags.filter(t => t !== tag);
            if (w.tags.length === 0) w.tags = ['generale'];
            save();
            renderMobileDetailTags(_mobileDetailIndex);
        }

        function saveMobileDetail() {
            if (_mobileDetailIndex < 0) return;
            const newText = document.getElementById('mobileDetailText').value.trim();
            if (!newText) return;
            const exists = words.some((w, i) => i !== _mobileDetailIndex && w.text.toLowerCase() === newText.toLowerCase());
            if (exists) { showNotification('ERRORE: VOCE GIÀ ESISTENTE'); return; }
            words[_mobileDetailIndex].text = newText;
            save();
            renderTags();
            showNotification('VOCE AGGIORNATA');
            closeMobileDetail();
            renderTable();
        }

        function deleteMobileDetail() {
            if (_mobileDetailIndex < 0) return;
            words.splice(_mobileDetailIndex, 1);
            save();
            init();
            resetDeck();
            showNotification('VOCE ELIMINATA');
            closeMobileDetail();
        }

        function closeMobileDetail() {
            const screen = document.getElementById('mobileDetailScreen');
            screen.classList.remove('open');
            setTimeout(() => { screen.style.display = 'none'; }, 260);
            _mobileDetailIndex = -1;
        }

        function confirmClearDatabase() {
            const modal = document.getElementById('clearDbModal');
            modal.style.display = 'flex';
            closeDrawer();
        }
        function closeClearModal() {
            document.getElementById('clearDbModal').style.display = 'none';
        }
        function clearDatabase() {
            words = [];
            save();
            init();
            resetDeck();
            closeClearModal();
            showNotification('DATABASE ELIMINATO');
        }


        function openDesktopEdit(idx) {
            if (window.innerWidth < 1024) return;
            _desktopEditIndex = idx;
            const w = words[idx];
            if (!w) return;
            document.getElementById('desktopEditText').value = w.text;
            renderDesktopEditTags(idx);
            // Popola select
            const allTags = [...new Set(words.flatMap(w => w.tags.map(t => t.toLowerCase())))].sort();
            const sel = document.getElementById('desktopEditTagSelect');
            sel.innerHTML = '<option value="">+ Aggiungi tag...</option>' +
                allTags.filter(t => !w.tags.map(wt => wt.toLowerCase()).includes(t))
                       .map(t => `<option value="${t}">${t.toUpperCase()}</option>`).join('');
            sel.onchange = function() {
                if (this.value) {
                    words[_desktopEditIndex].tags.push(this.value);
                    save();
                    renderDesktopEditTags(_desktopEditIndex);
                    // Refresh select
                    const allT = [...new Set(words.flatMap(w => w.tags.map(t => t.toLowerCase())))].sort();
                    this.innerHTML = '<option value="">+ Aggiungi tag...</option>' +
                        allT.filter(t => !words[_desktopEditIndex].tags.map(wt => wt.toLowerCase()).includes(t))
                            .map(t => `<option value="${t}">${t.toUpperCase()}</option>`).join('');
                    this.value = '';
                }
            };
            const modal = document.getElementById('desktopEditModal');
            modal.style.display = 'flex';
        }

        function renderDesktopEditTags(idx) {
            const w = words[idx];
            const container = document.getElementById('desktopEditTags');
            container.innerHTML = w.tags.map(t =>
                `<span onclick="removeDesktopEditTag('${t}')" style="font-family:'Rajdhani',sans-serif;font-size:0.6rem;font-weight:700;text-transform:uppercase;padding:4px 10px;border-radius:6px;background:rgba(var(--neon-cyan-rgb),0.1);border:1px solid rgba(var(--neon-cyan-rgb),0.3);color:var(--neon-cyan);cursor:pointer;">${t} ×</span>`
            ).join('');
        }

        function removeDesktopEditTag(tag) {
            if (_desktopEditIndex < 0) return;
            const w = words[_desktopEditIndex];
            w.tags = w.tags.filter(t => t !== tag);
            if (w.tags.length === 0) w.tags = ['generale'];
            save();
            renderDesktopEditTags(_desktopEditIndex);
        }

        function saveDesktopEdit() {
            if (_desktopEditIndex < 0) return;
            const newText = document.getElementById('desktopEditText').value.trim();
            if (!newText) return;
            const exists = words.some((w, i) => i !== _desktopEditIndex && w.text.toLowerCase() === newText.toLowerCase());
            if (exists) { showNotification('ERRORE: VOCE GIÀ ESISTENTE'); return; }
            words[_desktopEditIndex].text = newText;
            save();
            renderTags();
            showNotification('VOCE AGGIORNATA');
            closeDesktopEdit();
            renderTable();
        }

        function deleteDesktopEdit() {
            if (_desktopEditIndex < 0) return;
            words.splice(_desktopEditIndex, 1);
            save();
            init();
            resetDeck();
            showNotification('VOCE ELIMINATA');
            closeDesktopEdit();
        }

        function closeDesktopEdit() {
            document.getElementById('desktopEditModal').style.display = 'none';
            _desktopEditIndex = -1;
        }
        window.addEventListener('keydown', (e) => {
            // Controlla se l'utente sta scrivendo in un input, textarea o un elemento contenteditable
            const isEditing = [ 'INPUT', 'TEXTAREA' ].includes(document.activeElement.tagName) ||
                               document.activeElement.isContentEditable;

            if(e.code === 'Space' && !isEditing) {
                e.preventDefault();
                generate();
            }
        });
        document.getElementById('newTags').addEventListener('input', updateQuickSelect);
        function placeDisplayArea() {
            const slot = document.getElementById('displayAreaSlot');
            const da = document.getElementById('displayArea');
            if (!slot || !da) return;
            if (window.innerWidth >= 1024) {
                da.style.position = 'static';
                da.style.height = '450px';
                da.style.borderRadius = '';
                da.style.border = '';
                da.style.padding = '40px';
                slot.innerHTML = '';
                slot.appendChild(da);
            }
        }
        placeDisplayArea();
        window.addEventListener('resize', placeDisplayArea);

        // ── PALETTE SWITCHER ──
        const PALETTES = [
            { id: 'elettrico',  label: 'Elettrico'  },
            { id: 'switch',     label: 'Switch'     },
            { id: 'cioccolato', label: 'Cioccolato' },
            { id: 'halloween',  label: 'Halloween'  },
            { id: 'ferrari',    label: 'Ferrari'    },
            { id: 'cyberpunk',  label: 'Cyberpunk'  },
            { id: 'retrowave',  label: 'Retrowave'  },
            { id: 'pastello',   label: 'Pastello'   },
            { id: 'giungla',    label: 'Giungla'    },
            { id: 'caramella',  label: 'Caramella'  },
        ];

        function buildPaletteSelectors() {
            ['paletteSelectorMobile', 'paletteSelectorDesktop'].forEach(id => {
                const sel = document.getElementById(id);
                if (!sel) return;
                sel.innerHTML = PALETTES.map(p =>
                    `<option value="${p.id}">${p.label}</option>`
                ).join('');
            });
        }

        const PALETTE_GRADIENTS = {
            cyberpunk: ['0,255,242',   '188,19,254'],
            retrowave: ['222,26,88',   '246,125,49'],
            switch:      ['8,217,214',   '255,46,99'],
            cioccolato:  ['192,133,82',  '75,46,43'],
            halloween:   ['250,129,18',  '34,34,34'],
            pastello:    ['221,174,211',  '101,148,177'],
            giungla:     ['157,192,139',  '64,81,59'],
            elettrico:   ['244,206,20',   '69,71,75'],
            caramella:   ['255,63,127',   '255,196,0'],
            ferrari:     ['218,0,55',      '68,68,68'],
        };

        function applyPalette(name) {
            document.documentElement.setAttribute('data-palette', name);
            localStorage.setItem('palette', name);
            ['paletteSelectorMobile', 'paletteSelectorDesktop'].forEach(id => {
                const sel = document.getElementById(id);
                if (sel) sel.value = name;
            });
            // Applica gradiente su displayArea
            const g = PALETTE_GRADIENTS[name] || PALETTE_GRADIENTS['cyberpunk'];
            const grad = `radial-gradient(circle at 15% 25%, rgba(${g[0]},0.07) 0%, transparent 45%),
                          radial-gradient(circle at 85% 75%, rgba(${g[1]},0.07) 0%, transparent 45%)`;
            const da = document.getElementById('displayArea');
            if (da) da.style.backgroundImage = grad;

            // Ricalcola le shadow degli elementi già generati con i colori del nuovo tema
            const items = document.querySelectorAll('#displayArea div.animate-fade');
            if (items.length) {
                const shadows = getPaletteShadows(name);
                items.forEach((el, i) => {
                    const isCyan = i % 2 === 0;
                    el.style.color      = isCyan ? 'var(--neon-cyan)' : 'var(--alt-color)';
                    el.style.textShadow = isCyan ? shadows.cyan : shadows.alt;
                });
            }
        }

        buildPaletteSelectors();
        const savedPalette = localStorage.getItem('palette') || 'elettrico';
        applyPalette(savedPalette);

        if (_firstLoad) loadDefaultDB(); else init();

        // ── AUTO TIMER ──────────────────────────────────────────────────────────────
        const _autoTimer = (() => {
            let intervalId  = null;
            let rafId       = null;
            let startTime   = null;
            let duration    = 5000;
            let active      = false;

            const getBar      = () => document.getElementById('autoTimerBar');
            const getCount    = () => document.getElementById('autoTimerCount');

            function _tick() {
                if (!active) return;
                const elapsed   = Date.now() - startTime;
                const remaining = Math.max(0, duration - elapsed);
                const pct       = (remaining / duration) * 100;
                const secs      = Math.ceil(remaining / 1000);
                // Desktop bar
                const bar   = document.getElementById('autoTimerBar');
                const count = document.getElementById('autoTimerCount');
                if (bar)   bar.style.width = pct + '%';
                if (count) count.textContent = secs;
                // Mobile bar
                const barM   = document.getElementById('autoTimerBarMobile');
                const countM = document.getElementById('autoTimerCountMobile');
                if (barM)   barM.style.width = pct + '%';
                if (countM) countM.textContent = secs;
                rafId = requestAnimationFrame(_tick);
            }

            function _scheduleNext() {
                intervalId = setTimeout(() => {
                    if (!active) return;
                    _generateInternal();
                    _restart();
                }, duration);
            }

            function _generateInternal() {
                const display = document.getElementById('displayArea');
                const _wc = document.getElementById('wordCount') || document.getElementById('wordCountDesktop');
                const count = parseInt(_wc.value);
                let filtered = activeTags.size > 0
                    ? words.filter(w => w.tags.some(t => activeTags.has(t.toLowerCase())))
                    : words;
                if (filtered.length === 0) return;
                let results = [];
                for (let i = 0; i < count; i++) {
                    if (currentDeck.length === 0) currentDeck = [...filtered].sort(() => Math.random() - 0.5);
                    let picked = currentDeck.pop();
                    if (!picked) { currentDeck = [...filtered].sort(() => Math.random() - 0.5); picked = currentDeck.pop(); }
                    results.push(picked.text);
                }
                const palette = document.documentElement.getAttribute('data-palette') || 'cyberpunk';
                const shadows = getPaletteShadows(palette);
                display.innerHTML = results.map((res, i) => {
                    const isCyan = i % 2 === 0;
                    return `<div class="animate-fade font-extrabold text-center" style="color:${isCyan ? 'var(--neon-cyan)' : 'var(--alt-color)'}; text-shadow:${isCyan ? shadows.cyan : shadows.alt}; overflow-wrap:normal; word-break:keep-all; hyphens:none; line-height:0.94;">${res}</div>`;
                }).join('');
                fitTextToContainer();
            }

            function _resetBarsInstant() {
                ['autoTimerBar', 'autoTimerBarMobile'].forEach(id => {
                    const el = document.getElementById(id);
                    if (!el) return;
                    el.style.transition = 'none';
                    el.style.width = '100%';
                });
            }

            function _restart() {
                clearTimeout(intervalId);
                cancelAnimationFrame(rafId);
                // Prima resetta le barre a 100% senza transition...
                _resetBarsInstant();
                // ...poi nel frame successivo riabilita la transition e fa partire il tick
                requestAnimationFrame(() => {
                    ['autoTimerBar', 'autoTimerBarMobile'].forEach(id => {
                        const el = document.getElementById(id);
                        if (el) el.style.transition = 'width 0.15s linear';
                    });
                    startTime = Date.now();
                    rafId = requestAnimationFrame(_tick);
                    _scheduleNext();
                });
            }

            function start() {
                if (active) return;
                // Legge dal primo input disponibile (mobile o desktop)
                const inp = document.getElementById('timerDuration') || document.getElementById('timerDurationDesktop');
                if (inp) {
                    duration = Math.max(1, parseInt(inp.value) || 5) * 1000;
                    // Sincronizza entrambi
                    ['timerDuration','timerDurationDesktop'].forEach(id => {
                        const el = document.getElementById(id);
                        if (el) el.value = Math.round(duration / 1000);
                    });
                }
                active = true;
                _showBar(true);
                _updateToggleBtn(true);
                _restart();
            }

            function stop() {
                active = false;
                clearTimeout(intervalId);
                cancelAnimationFrame(rafId);
                _resetBarsInstant();
                _showBar(false);
                _updateToggleBtn(false);
            }

            function reset() {
                if (!active) return;
                _restart();
            }

            function toggle() {
                if (active) stop(); else start();
            }

            function _showBar(show) {
                const isMobile = window.innerWidth < 1024;
                // Desktop bar: solo su desktop
                const w1 = document.getElementById('autoTimerBarWrapper');
                if (w1) w1.style.display = (!isMobile && show) ? 'flex' : 'none';
                // Mobile bar: solo su mobile
                const w2 = document.getElementById('mobileTimerBarWrapper');
                if (w2) w2.style.display = (isMobile && show) ? 'flex' : 'none';
            }

            function _updateToggleBtn(on) {
                ['timerToggleBtn', 'timerToggleBtnDesktop'].forEach(id => {
                    const btn = document.getElementById(id);
                    if (!btn) return;
                    btn.textContent = on ? 'STOP' : 'AVVIA';
                    if (on) { btn.classList.add('button-primary'); }
                    else    { btn.classList.remove('button-primary'); }
                });
            }

            return { start, stop, reset, toggle, get active() { return active; } };
        })();

        // Ricarica durata dal localStorage
        (function initTimerUI() {
            const saved = localStorage.getItem('timerDuration');
            const inp   = document.getElementById('timerDuration');
            if (inp && saved) inp.value = saved;
            if (inp) {
                inp.addEventListener('change', () => {
                    localStorage.setItem('timerDuration', inp.value);
                    if (_autoTimer.active) { _autoTimer.stop(); _autoTimer.start(); }
                });
            }
        })();
