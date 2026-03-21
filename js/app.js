let words = JSON.parse(localStorage.getItem('myWords')) || [];
        let _firstLoad = words.length === 0;
        let activeTags = new Set();
        let archiveSearchTags = new Set();
        let currentPage = 1;
        let itemsPerPage = 12;
        let _filteredLength = 0;
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

        function handleTableSearch() { searchQuery = document.getElementById('tableSearch').value.toLowerCase(); currentPage = 1; renderTable(); }

        function renderArchiveSearchTags() {
            const container = document.getElementById('archiveTagFilters');

            // 1. Contiamo quante volte appare ogni tag nel database
            const tagCounts = {};
            words.forEach(w => {
                w.tags.forEach(t => {
                    const lowerTag = t.toLowerCase();
                    tagCounts[lowerTag] = (tagCounts[lowerTag] || 0) + 1;
                });
            });

            // 2. Otteniamo la lista unica dei tag
            const allTags = Object.keys(tagCounts).sort();

            // 3. Generiamo l'HTML includendo il conteggio tra parentesi
            container.innerHTML = allTags.map(tag => {
                const active = archiveSearchTags.has(tag);
                const count = tagCounts[tag];
                return `
                    <button onclick="toggleArchiveTag('${tag}')"
                        class="px-4 py-2 rounded-lg text-[11px] font-bold border uppercase transition-all
                        ${active ? 'theme-tag-active' : 'theme-tag-inactive'}">
                        ${tag} (${count})
                    </button>`;
            }).join('');
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

            tbody.innerHTML = paginatedItems.map((w) => {
                // Troviamo l'indice reale nell'array originale 'words'
                const idx = words.findIndex(item => item.text === w.text);
                const isAdding = editingTagIndex === idx;

                return `
                <tr class="theme-row-hover transition">
                    <td class="p-4">
                        <div contenteditable="true"
                             onblur="updateWordText(${idx}, this.innerText)"
                             class="font-bold theme-editable outline-none px-2 py-1 rounded transition-all cursor-edit"
                             spellcheck="false">
                            ${w.text}
                        </div>
                    </td>
                    <td class="p-4">
                        <div class="flex flex-wrap gap-1 items-center">
                            ${w.tags.map(t => `<span class="theme-tag-chip px-2 py-0.5 rounded text-[9px] uppercase cursor-pointer" onclick="removeTagFromWord(${idx}, '${t}')">${t} ×</span>`).join('')}
                            ${isAdding ? `<select onchange="confirmInlineTag(${idx}, this.value)" class="theme-panel-dark theme-label text-[10px] rounded" style="border:1px solid rgba(var(--neon-cyan-rgb),0.2);"><option value="">+</option>${allDatabaseTags.filter(t => !w.tags.map(wt=>wt.toLowerCase()).includes(t)).map(t => `<option value="${t}">${t.toUpperCase()}</option>`).join('')}</select>` : `<button onclick="editingTagIndex=${idx};renderTable()" class="theme-muted text-xs">+</button>`}
                        </div>
                    </td>
                    <td class="p-4 text-right">
                        <button onclick="deleteWord(${idx})" style="font-family:'Rajdhani',sans-serif;font-size:0.65rem;font-weight:700;background:none;border:none;color:#7f1d1d;cursor:pointer;text-transform:uppercase;transition:color 0.2s;" onmouseover="this.style.color='#ff2e63'" onmouseout="this.style.color='#7f1d1d'">Elimina</button>
                    </td>
                </tr>`;
            }).join('');

            _filteredLength = filtered.length;
            document.getElementById('paginationInfo').innerText = `Pagina ${currentPage} di ${Math.ceil(filtered.length/itemsPerPage) || 1}`;
            // Ricalcola se le righe hanno altezza variabile (frasi lunghe)
            const modal = document.getElementById('editorModal');
            if (modal && modal.classList.contains('editor-open')) {
                requestAnimationFrame(calcItemsPerPage);
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
        // Se il mazzo è vuoto O se sono stati cambiati i filtri, ricrealo
        if(currentDeck.length === 0) {
            currentDeck = [...filtered].sort(() => Math.random() - 0.5);
        }

        // Estrai l'elemento. Se per errore è undefined (mazzo finito), rigenera
        let picked = currentDeck.pop();
        if(!picked) {
            currentDeck = [...filtered].sort(() => Math.random() - 0.5);
            picked = currentDeck.pop();
        }
        results.push(picked.text);
    }

    display.innerHTML = results.map((res, i) => {
        const isCyan = i % 2 === 0;
        const color = isCyan ? 'var(--neon-cyan)' : 'var(--alt-color)';
        const altColor = getComputedStyle(document.documentElement).getPropertyValue('--alt-color').trim();
        const palette = document.documentElement.getAttribute('data-palette') || 'cyberpunk';
        let cyanShadow, altShadow;
        if (palette === 'cyberpunk') {
            // D: ombra blocco solida + glow neon
            cyanShadow = '0 0 8px var(--neon-cyan), 2px 2px 0 #003333, 3px 4px 0 rgba(0,0,0,0.5)';
            altShadow  = '0 0 6px rgba(255,255,255,0.5), 2px 2px 0 #111, 3px 4px 0 rgba(0,0,0,0.4)';
        } else if (palette === 'retrowave') {
            // D: ombra blocco solida colorata
            cyanShadow = '0 0 8px var(--neon-cyan), 2px 2px 0 #4a0018, 3px 4px 0 rgba(0,0,0,0.5)';
            altShadow  = '0 0 8px ' + altColor + ', 2px 2px 0 #4a2000, 3px 4px 0 rgba(0,0,0,0.5)';
        } else if (palette === 'cioccolato') {
            cyanShadow = '0 0 8px rgba(255,248,240,0.6), 2px 2px 0 #2a1410, 3px 4px 0 rgba(0,0,0,0.5)';
            altShadow  = '0 0 8px rgba(192,133,82,0.6), 2px 2px 0 #2a1410, 3px 4px 0 rgba(0,0,0,0.5)';
        } else if (palette === 'halloween') {
            cyanShadow = '0 0 8px #FA8112, 2px 2px 0 #5a2500, 3px 4px 0 rgba(0,0,0,0.5)';
            altShadow  = '2px 2px 0 #111, 3px 4px 0 rgba(0,0,0,0.4)';
        } else if (palette === 'pastello') {
            cyanShadow = '0 0 10px rgba(221,174,211,0.7), 2px 3px 6px rgba(0,0,0,0.7)';
            altShadow  = '2px 3px 6px rgba(0,0,0,0.7)';
        } else if (palette === 'giungla') {
            cyanShadow = '0 0 8px #9DC08B, 2px 2px 0 #1a2918, 3px 4px 0 rgba(0,0,0,0.5)';
            altShadow  = '2px 2px 0 #1a2918, 3px 4px 0 rgba(0,0,0,0.4)';
        } else if (palette === 'elettrico') {
            cyanShadow = '0 0 8px #F4CE14, 2px 2px 0 #5a4a00, 3px 4px 0 rgba(0,0,0,0.5)';
            altShadow  = '2px 2px 0 #111, 3px 4px 0 rgba(0,0,0,0.4)';
        } else if (palette === 'caramella') {
            cyanShadow = '0 0 8px #FF3F7F, 2px 2px 0 #1a0035, 3px 4px 0 rgba(0,0,0,0.5)';
            altShadow  = '0 0 8px #FFC400, 2px 2px 0 #1a0035, 3px 4px 0 rgba(0,0,0,0.5)';
        } else if (palette === 'ferrari') {
            cyanShadow = '0 0 8px #DA0037, 2px 2px 0 #3a0010, 3px 4px 0 rgba(0,0,0,0.5)';
            altShadow  = '2px 2px 0 #111, 3px 4px 0 rgba(0,0,0,0.4)';
        } else {
            // switch e altri: drop shadow originale
            cyanShadow = '0 0 12px var(--neon-cyan), 2px 3px 6px rgba(0,0,0,0.9)';
            altShadow  = '0 0 12px ' + altColor + ', 2px 3px 6px rgba(0,0,0,0.9)';
        }
        const shadow = isCyan ? cyanShadow : altShadow;
        return `<div class="animate-fade font-extrabold text-center" style="color:${color}; text-shadow:${shadow}; overflow-wrap:normal; word-break:keep-all; hyphens:none; line-height:0.94;">${res}</div>`;
    }).join('');
    fitTextToContainer();
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
            { id: 'switch',     label: 'Switch'     },
            { id: 'cioccolato', label: 'Cioccolato' },
            { id: 'halloween',  label: 'Halloween'  },
            { id: 'retrowave',  label: 'Retrowave'  },
            { id: 'elettrico',  label: 'Elettrico'  },
            { id: 'ferrari',    label: 'Ferrari'    },
            { id: 'cyberpunk',  label: 'Cyberpunk'  },
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
                const altColor = getComputedStyle(document.documentElement).getPropertyValue('--alt-color').trim();
                items.forEach((el, i) => {
                    const isCyan = i % 2 === 0;
                    let cyanShadow, altShadow;
                    if (name === 'cyberpunk') {
                        cyanShadow = '0 0 8px var(--neon-cyan), 2px 2px 0 #003333, 3px 4px 0 rgba(0,0,0,0.5)';
                        altShadow  = '0 0 6px rgba(255,255,255,0.5), 2px 2px 0 #111, 3px 4px 0 rgba(0,0,0,0.4)';
                    } else if (name === 'retrowave') {
                        cyanShadow = '0 0 8px var(--neon-cyan), 2px 2px 0 #4a0018, 3px 4px 0 rgba(0,0,0,0.5)';
                        altShadow  = '0 0 8px ' + altColor + ', 2px 2px 0 #4a2000, 3px 4px 0 rgba(0,0,0,0.5)';
                    } else if (name === 'cioccolato') {
                        cyanShadow = '0 0 8px rgba(255,248,240,0.6), 2px 2px 0 #2a1410, 3px 4px 0 rgba(0,0,0,0.5)';
                        altShadow  = '0 0 8px rgba(192,133,82,0.6), 2px 2px 0 #2a1410, 3px 4px 0 rgba(0,0,0,0.5)';
                    } else if (name === 'halloween') {
                        cyanShadow = '0 0 8px #FA8112, 2px 2px 0 #5a2500, 3px 4px 0 rgba(0,0,0,0.5)';
                        altShadow  = '2px 2px 0 #111, 3px 4px 0 rgba(0,0,0,0.4)';
                    } else if (name === 'pastello') {
                        cyanShadow = '0 0 10px rgba(221,174,211,0.7), 2px 3px 6px rgba(0,0,0,0.7)';
                        altShadow  = '2px 3px 6px rgba(0,0,0,0.7)';
                    } else if (name === 'giungla') {
                        cyanShadow = '0 0 8px #9DC08B, 2px 2px 0 #1a2918, 3px 4px 0 rgba(0,0,0,0.5)';
                        altShadow  = '2px 2px 0 #1a2918, 3px 4px 0 rgba(0,0,0,0.4)';
                    } else if (name === 'elettrico') {
                        cyanShadow = '0 0 8px #F4CE14, 2px 2px 0 #5a4a00, 3px 4px 0 rgba(0,0,0,0.5)';
                        altShadow  = '2px 2px 0 #111, 3px 4px 0 rgba(0,0,0,0.4)';
                    } else if (name === 'caramella') {
                        cyanShadow = '0 0 8px #FF3F7F, 2px 2px 0 #1a0035, 3px 4px 0 rgba(0,0,0,0.5)';
                        altShadow  = '0 0 8px #FFC400, 2px 2px 0 #1a0035, 3px 4px 0 rgba(0,0,0,0.5)';
                    } else if (name === 'ferrari') {
                        cyanShadow = '0 0 8px #DA0037, 2px 2px 0 #3a0010, 3px 4px 0 rgba(0,0,0,0.5)';
                        altShadow  = '2px 2px 0 #111, 3px 4px 0 rgba(0,0,0,0.4)';
                    } else {
                        cyanShadow = '0 0 12px var(--neon-cyan), 2px 3px 6px rgba(0,0,0,0.9)';
                        altShadow  = '0 0 12px ' + altColor + ', 2px 3px 6px rgba(0,0,0,0.9)';
                    }
                    el.style.color = isCyan ? 'var(--neon-cyan)' : 'var(--alt-color)';
                    el.style.textShadow = isCyan ? cyanShadow : altShadow;
                });
            }
        }

        buildPaletteSelectors();
        const savedPalette = localStorage.getItem('palette') || 'switch';
        applyPalette(savedPalette);

        if (_firstLoad) loadDefaultDB(); else init();
