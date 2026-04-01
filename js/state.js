// ── STATE ─────────────────────────────────────────────────────────────────────
// Unica fonte di verità per tutto lo stato dell'app.
// Usare setState() per modificare — non scrivere direttamente su state.

export const state = {
    words:              JSON.parse(localStorage.getItem('myWords')) || [],
    activeTags:         new Set(),
    archiveSearchTags:  new Set(),
    currentPage:        1,
    itemsPerPage:       12,
    filteredLength:     0,
    mobileDetailIndex:  -1,
    mobileDetailFiltered: [],
    desktopEditIndex:   -1,
    searchQuery:        '',
    currentDeck:        [],
    editingTagIndex:    null,
    tagOrder:           JSON.parse(localStorage.getItem('tagOrder') || 'null') || [],
};

export const derived = {
    get firstLoad() { return state.words.length === 0; },
};

// Aggiorna uno o più campi e chiama opzionalmente un callback
export function setState(patch) {
    Object.assign(state, patch);
}

// ── PERSISTENZA ───────────────────────────────────────────────────────────────

export function saveWords() {
    localStorage.setItem('myWords', JSON.stringify(state.words));
}

export function saveTagOrder() {
    localStorage.setItem('tagOrder', JSON.stringify(state.tagOrder));
}

// ── DECK ──────────────────────────────────────────────────────────────────────

export function getFilteredWords() {
    return state.activeTags.size > 0
        ? state.words.filter(w => w.tags.some(t => state.activeTags.has(t.toLowerCase())))
        : state.words;
}

// Estrae `count` voci dal deck, rimescolando quando si esaurisce.
// Restituisce array di stringhe.
export function pickFromDeck(count) {
    const filtered = getFilteredWords();
    if (filtered.length === 0) return [];
    const results = [];
    for (let i = 0; i < count; i++) {
        if (state.currentDeck.length === 0) {
            state.currentDeck = [...filtered].sort(() => Math.random() - 0.5);
        }
        let picked = state.currentDeck.pop();
        if (!picked) {
            state.currentDeck = [...filtered].sort(() => Math.random() - 0.5);
            picked = state.currentDeck.pop();
        }
        results.push(picked.text);
    }
    return results;
}

export function resetDeck() {
    state.currentDeck = [];
}

// ── ORDINAMENTO TAG ───────────────────────────────────────────────────────────

export function getSortedTags(allTags) {
    const known = state.tagOrder.filter(t => allTags.includes(t));
    const novel = allTags.filter(t => !known.includes(t)).sort();
    return [...known, ...novel];
}
