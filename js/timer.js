// ── TIMER ─────────────────────────────────────────────────────────────────────
import { state, pickFromDeck } from './state.js';
import { renderResults }       from './generate.js';

export const autoTimer = (() => {
    let intervalId = null;
    let rafId      = null;
    let startTime  = null;
    let duration   = 5000;
    let active     = false;

    function _tick() {
        if (!active) return;
        const elapsed   = Date.now() - startTime;
        const remaining = Math.max(0, duration - elapsed);
        const pct       = (remaining / duration) * 100;
        const secs      = Math.ceil(remaining / 1000);

        const bar    = document.getElementById('autoTimerBar');
        const count  = document.getElementById('autoTimerCount');
        const barM   = document.getElementById('autoTimerBarMobile');
        const countM = document.getElementById('autoTimerCountMobile');
        if (bar)    bar.style.width     = pct + '%';
        if (count)  count.textContent   = secs;
        if (barM)   barM.style.width    = pct + '%';
        if (countM) countM.textContent  = secs;

        rafId = requestAnimationFrame(_tick);
    }

    function _scheduleNext() {
        intervalId = setTimeout(() => {
            if (!active) return;
            // Usa pickFromDeck + renderResults — nessuna duplicazione
            const wc      = document.getElementById('wordCount') || document.getElementById('wordCountDesktop');
            const results = pickFromDeck(parseInt(wc.value));
            if (results.length) renderResults(results);
            _restart();
        }, duration);
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
        _resetBarsInstant();
        requestAnimationFrame(() => {
            ['autoTimerBar', 'autoTimerBarMobile'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.style.transition = 'width 0.15s linear';
            });
            startTime = Date.now();
            rafId     = requestAnimationFrame(_tick);
            _scheduleNext();
        });
    }

    function _showBar(show) {
        const isMobile = window.innerWidth < 1024;
        const w1 = document.getElementById('autoTimerBarWrapper');
        const w2 = document.getElementById('mobileTimerBarWrapper');
        if (w1) w1.style.display = (!isMobile && show) ? 'flex' : 'none';
        if (w2) w2.style.display = (isMobile  && show) ? 'flex' : 'none';
    }

    function _updateToggleBtn(on) {
        ['timerToggleBtn', 'timerToggleBtnDesktop'].forEach(id => {
            const btn = document.getElementById(id);
            if (!btn) return;
            btn.textContent = on ? 'FERMA' : 'AVVIA';
            btn.classList.toggle('button-primary', on);
        });
    }

    function start() {
        if (active) return;
        const inp = document.getElementById('timerDuration') || document.getElementById('timerDurationDesktop');
        if (inp) {
            duration = Math.max(1, parseInt(inp.value) || 5) * 1000;
            ['timerDuration', 'timerDurationDesktop'].forEach(id => {
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

    return { start, stop, reset, toggle, get active() { return active; } };
})();

export function initTimerUI() {
    const saved = localStorage.getItem('timerDuration');
    ['timerDuration', 'timerDurationDesktop'].forEach(id => {
        const inp = document.getElementById(id);
        if (!inp) return;
        if (saved) inp.value = saved;
        inp.addEventListener('change', () => {
            localStorage.setItem('timerDuration', inp.value);
            // Sincronizza l'altro input
            ['timerDuration', 'timerDurationDesktop'].forEach(otherId => {
                if (otherId !== id) {
                    const other = document.getElementById(otherId);
                    if (other) other.value = inp.value;
                }
            });
            if (autoTimer.active) { autoTimer.stop(); autoTimer.start(); }
        });
    });
}
