/* ═══════════════════════════════════════════════════════════
   ZION CHURCH LISBOA — app.js
   Funções globais partilhadas por todas as páginas.
   ═══════════════════════════════════════════════════════════ */

// ── LOGO ─────────────────────────────────────────────────
// Injeta o logo da Zion em todos os elementos .js-logo
function initLogo() {
    document.querySelectorAll('.js-logo').forEach(el => {
        const img = document.createElement('img');
        img.src = '/assets/logo_zion.jpg';
        img.alt = 'Zion Church Lisboa';
        img.className = el.dataset.center
            ? 'page-logo page-logo--center'
            : 'page-logo';
        img.onerror = function () {
            this.style.display = 'none';
            const fb = document.createElement('div');
            fb.className = el.dataset.center
                ? 'logo-fallback logo-fallback--center'
                : 'logo-fallback';
            fb.textContent = 'Z';
            this.parentNode.insertBefore(fb, this.nextSibling);
        };
        el.replaceWith(img);
    });
}

// ── TOAST ────────────────────────────────────────────────
function showToast(msg, duration = 2500) {
    let toast = document.querySelector('.toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), duration);
}

// ── INIT ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    initLogo();
});
