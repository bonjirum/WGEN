// ── PALETTE ───────────────────────────────────────────────────────────────────

export const PALETTES = [
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

const PALETTE_GRADIENTS = {
    cyberpunk:   ['0,255,242',   '188,19,254'],
    retrowave:   ['222,26,88',   '246,125,49'],
    switch:      ['8,217,214',   '255,46,99'],
    cioccolato:  ['192,133,82',  '75,46,43'],
    halloween:   ['250,129,18',  '34,34,34'],
    pastello:    ['221,174,211', '101,148,177'],
    giungla:     ['157,192,139', '64,81,59'],
    elettrico:   ['244,206,20',  '69,71,75'],
    caramella:   ['255,63,127',  '255,196,0'],
    ferrari:     ['218,0,55',    '68,68,68'],
};

export function getPaletteShadows(palette) {
    const altColor = getComputedStyle(document.documentElement).getPropertyValue('--alt-color').trim();
    switch (palette) {
        case 'cyberpunk':  return { cyan: '0 0 8px var(--neon-cyan), 2px 2px 0 #003333, 3px 4px 0 rgba(0,0,0,0.5)', alt: '0 0 6px rgba(255,255,255,0.5), 2px 2px 0 #111, 3px 4px 0 rgba(0,0,0,0.4)' };
        case 'retrowave':  return { cyan: '0 0 8px var(--neon-cyan), 2px 2px 0 #4a0018, 3px 4px 0 rgba(0,0,0,0.5)', alt: `0 0 8px ${altColor}, 2px 2px 0 #4a2000, 3px 4px 0 rgba(0,0,0,0.5)` };
        case 'cioccolato': return { cyan: '0 0 8px rgba(255,248,240,0.6), 2px 2px 0 #2a1410, 3px 4px 0 rgba(0,0,0,0.5)', alt: '0 0 8px rgba(192,133,82,0.6), 2px 2px 0 #2a1410, 3px 4px 0 rgba(0,0,0,0.5)' };
        case 'halloween':  return { cyan: '0 0 8px #FA8112, 2px 2px 0 #5a2500, 3px 4px 0 rgba(0,0,0,0.5)', alt: '2px 2px 0 #111, 3px 4px 0 rgba(0,0,0,0.4)' };
        case 'pastello':   return { cyan: '0 0 10px rgba(221,174,211,0.7), 2px 3px 6px rgba(0,0,0,0.7)', alt: '2px 3px 6px rgba(0,0,0,0.7)' };
        case 'giungla':    return { cyan: '0 0 8px #9DC08B, 2px 2px 0 #1a2918, 3px 4px 0 rgba(0,0,0,0.5)', alt: '2px 2px 0 #1a2918, 3px 4px 0 rgba(0,0,0,0.4)' };
        case 'elettrico':  return { cyan: '0 0 8px #F4CE14, 2px 2px 0 #5a4a00, 3px 4px 0 rgba(0,0,0,0.5)', alt: '2px 2px 0 #111, 3px 4px 0 rgba(0,0,0,0.4)' };
        case 'caramella':  return { cyan: '0 0 8px #FF3F7F, 2px 2px 0 #1a0035, 3px 4px 0 rgba(0,0,0,0.5)', alt: '0 0 8px #FFC400, 2px 2px 0 #1a0035, 3px 4px 0 rgba(0,0,0,0.5)' };
        case 'ferrari':    return { cyan: '0 0 8px #DA0037, 2px 2px 0 #3a0010, 3px 4px 0 rgba(0,0,0,0.5)', alt: '2px 2px 0 #111, 3px 4px 0 rgba(0,0,0,0.4)' };
        default:           return { cyan: `0 0 12px var(--neon-cyan), 2px 3px 6px rgba(0,0,0,0.9)`, alt: `0 0 12px ${altColor}, 2px 3px 6px rgba(0,0,0,0.9)` };
    }
}

export function buildPaletteSelectors() {
    ['paletteSelectorMobile', 'paletteSelectorDesktop'].forEach(id => {
        const sel = document.getElementById(id);
        if (!sel) return;
        sel.innerHTML = PALETTES.map(p => `<option value="${p.id}">${p.label}</option>`).join('');
    });
}

export function applyPalette(name) {
    document.documentElement.setAttribute('data-palette', name);
    localStorage.setItem('palette', name);
    ['paletteSelectorMobile', 'paletteSelectorDesktop'].forEach(id => {
        const sel = document.getElementById(id);
        if (sel) sel.value = name;
    });
    const g = PALETTE_GRADIENTS[name] || PALETTE_GRADIENTS['cyberpunk'];
    const grad = `radial-gradient(circle at 15% 25%, rgba(${g[0]},0.07) 0%, transparent 45%),
                  radial-gradient(circle at 85% 75%, rgba(${g[1]},0.07) 0%, transparent 45%)`;
    const da = document.getElementById('displayArea');
    if (da) da.style.backgroundImage = grad;

    // Aggiorna shadow sui risultati già visibili
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
