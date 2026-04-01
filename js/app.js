// ── ENTRY POINT ───────────────────────────────────────────────────────────────
import { state, setState, saveWords, resetDeck as _resetDeck } from './state.js';
import { buildPaletteSelectors, applyPalette }                 from './palette.js';
import { generate as _generate, fitTextToContainer }           from './generate.js';
import { autoTimer, initTimerUI }                              from './timer.js';
import {
    initUI, renderTags, renderTable, showNotification,
    toggleArchiveTag, startRenameTag, confirmRenameTag,
    updateQuickSelect, initTableResizeObserver,
} from './ui.js';
import {
    openEditor, closeEditor, addWordsBulk, prevPage, nextPage,
    handleTableSearch, clearSearch, toggleAddSection,
    openDesktopEdit, closeDesktopEdit, removeDesktopEditTag,
    saveDesktopEdit, deleteDesktopEdit,
    openMobileDetail, closeMobileDetail, removeMobileDetailTag,
    saveMobileDetail, deleteMobileDetail,
    confirmClearDatabase, closeClearModal, clearDatabase,
    exportData, importData, toggleDrawer, closeDrawer, initDrawerDrag,
    loadDefaultDB, closeLoadDefaultModal, confirmLoadDefaultDB,
} from './editor.js';

// ── ESPONI GLOBALI per gli onclick inline nell'HTML ───────────────────────────
// (Il refactoring non tocca l'HTML, quindi i handler inline devono restare globali)
Object.assign(window, {
    openEditor, closeEditor, addWordsBulk, prevPage, nextPage,
    handleTableSearch, clearSearch, toggleAddSection,
    openDesktopEdit, closeDesktopEdit, removeDesktopEditTag,
    saveDesktopEdit, deleteDesktopEdit,
    openMobileDetail, closeMobileDetail, removeMobileDetailTag,
    saveMobileDetail, deleteMobileDetail,
    confirmClearDatabase, closeClearModal, clearDatabase,
    exportData, importData, toggleDrawer, closeDrawer,
    loadDefaultDB, closeLoadDefaultModal, confirmLoadDefaultDB,
    toggleArchiveTag, startRenameTag, confirmRenameTag,
    applyPalette,
    _autoTimer: autoTimer,
    // Funzioni semplici usate dall'HTML
    resetDeck() {
        _resetDeck();
        showNotification('MAZZO RIMESCOLATO');
    },
    generate() {
        _generate(autoTimer);
    },
    adjustCount(v) {
        const mob  = document.getElementById('wordCount');
        const desk = document.getElementById('wordCountDesktop');
        const cur  = parseInt((mob || desk).value);
        const n    = cur + v;
        if (n >= 1 && n <= 10) { if (mob) mob.value = n; if (desk) desk.value = n; }
    },
    toggleTagInInput(tag) {
        const input   = document.getElementById('newTags');
        let current   = input.value.split(',').map(s => s.trim().toLowerCase()).filter(s => s);
        if (current.includes(tag)) current = current.filter(t => t !== tag);
        else current.push(tag);
        input.value = current.join(', ');
        updateQuickSelect();
    },
});

// ── POSIZIONA displayArea nel grid desktop ────────────────────────────────────
function placeDisplayArea() {
    const slot = document.getElementById('displayAreaSlot');
    const da   = document.getElementById('displayArea');
    if (!slot || !da) return;
    if (window.innerWidth >= 1024) {
        da.style.position     = 'static';
        da.style.height       = '450px';
        da.style.borderRadius = '';
        da.style.border       = '';
        da.style.padding      = '40px';
        slot.innerHTML        = '';
        slot.appendChild(da);
    }
}

// ── SHORTCUT DA TASTIERA ──────────────────────────────────────────────────────
window.addEventListener('keydown', e => {
    const isEditing = ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)
                   || document.activeElement.isContentEditable;
    if (e.code === 'Space' && !isEditing) {
        e.preventDefault();
        _generate(autoTimer);
    }
    if (e.key === 'Escape') {
        const exportModal = document.getElementById('exportModal');
        if (exportModal?.style.display === 'flex') exportModal.style.display = 'none';
    }
});

// ── INIT ──────────────────────────────────────────────────────────────────────
buildPaletteSelectors();
applyPalette(localStorage.getItem('palette') || 'elettrico');

placeDisplayArea();
window.addEventListener('resize', placeDisplayArea);

document.getElementById('newTags').addEventListener('input', updateQuickSelect);

initDrawerDrag();
initTimerUI();
initTableResizeObserver();

if (state.words.length === 0) loadDefaultDB();
else initUI();
