// ── GENERATE ──────────────────────────────────────────────────────────────────
import { state, pickFromDeck } from './state.js';
import { getPaletteShadows }   from './palette.js';

// Costruisce l'HTML dei risultati e lo inietta nel displayArea.
// Usato sia da generate() che dal timer — unica implementazione.
export function renderResults(results) {
    const display  = document.getElementById('displayArea');
    const palette  = document.documentElement.getAttribute('data-palette') || 'cyberpunk';
    const shadows  = getPaletteShadows(palette);
    display.innerHTML = results.map((res, i) => {
        const isCyan = i % 2 === 0;
        return `<div class="animate-fade font-extrabold text-center"
                     style="color:${isCyan ? 'var(--neon-cyan)' : 'var(--alt-color)'};
                            text-shadow:${isCyan ? shadows.cyan : shadows.alt};
                            overflow-wrap:normal; word-break:keep-all; hyphens:none; line-height:0.94;"
                >${res}</div>`;
    }).join('');
    fitTextToContainer();
}

export function generate(timerRef) {
    const wc = document.getElementById('wordCount') || document.getElementById('wordCountDesktop');
    const results = pickFromDeck(parseInt(wc.value));
    if (!results.length) return;
    renderResults(results);
    if (timerRef?.active) timerRef.reset();
}

export function fitTextToContainer() {
    const display = document.getElementById('displayArea');
    const items   = display.querySelectorAll('div.animate-fade');
    if (!items.length) return;

    const pad             = 32;
    const availableWidth  = display.clientWidth  - pad * 2;
    const availableHeight = display.clientHeight - pad * 2;

    items.forEach(el => {
        el.style.width       = availableWidth + 'px';
        el.style.flexShrink  = '0';
        el.style.whiteSpace  = 'normal';
        el.style.marginBottom = '0';
    });

    // Binary search sulla font-size; gap = 0.7 * fontSize
    let lo = 8, hi = 42;
    while (lo < hi) {
        const mid = Math.ceil((lo + hi) / 2);
        const gap = Math.round(mid * 0.7);
        items.forEach(el => el.style.fontSize = mid + 'px');
        const totalH      = Array.from(items).reduce((s, el) => s + el.scrollHeight, 0) + gap * (items.length - 1);
        const anyOverflow = Array.from(items).some(el => el.scrollWidth > availableWidth + 1);
        if (totalH <= availableHeight && !anyOverflow) lo = mid;
        else hi = mid - 1;
    }

    const finalGap  = Math.round(lo * 0.7);
    const itemsArr  = Array.from(items);
    itemsArr.forEach((el, i) => {
        el.style.fontSize    = lo + 'px';
        el.style.marginBottom = i < itemsArr.length - 1 ? finalGap + 'px' : '0';
    });

    const totalH = itemsArr.reduce((s, el) => s + el.scrollHeight, 0) + finalGap * (itemsArr.length - 1);
    const topPad = Math.max(pad, (display.clientHeight - totalH) / 2);
    display.style.paddingTop    = topPad + 'px';
    display.style.paddingBottom = topPad + 'px';
}
