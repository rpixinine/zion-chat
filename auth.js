
const ZionAuth = (() => {

    const SUPABASE_URL = window.SUPABASE_URL || '';
    const SUPABASE_KEY = window.SUPABASE_ANON_KEY || '';
    const SESSION_KEY  = 'zion_session';

    // ── Helpers ──────────────────────────────────────────────

    function saveSession(data) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(data));
    }

    function clearSession() {
        localStorage.removeItem(SESSION_KEY);
    }

    function getUser() {
        try {
            const raw = localStorage.getItem(SESSION_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }

    function isLoggedIn() {
        const user = getUser();
        if (!user || !user.token) return false;
        // Verifica expiração
        if (user.expires_at && Date.now() > user.expires_at) {
            clearSession();
            return false;
        }
        return true;
    }

    // ── Proteger página ───────────────────────────────────────
    // Chama no topo da página protegida.
    // opts.tipo: 'visitante' | 'membro' | 'admin' (opcional)
    function protect(opts = {}) {
        if (!isLoggedIn()) {
            // Guarda a página atual para redirecionar depois do login
            sessionStorage.setItem('zion_redirect', window.location.href);
            window.location.href = 'login.html';
            return;
        }

        if (opts.tipo) {
            const user = getUser();
            const hierarquia = { visitante: 1, membro: 2, admin: 3 };
            const nivelUser  = hierarquia[user.tipo] || 0;
            const nivelReq   = hierarquia[opts.tipo] || 0;

            if (nivelUser < nivelReq) {
                window.location.href = 'acesso-negado.html';
                return;
            }
        }
    }

    // ── Login via API ─────────────────────────────────────────
    async function login(email, password) {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || 'Erro ao fazer login');
        }

        saveSession({
            id:         data.user.id,
            nome:       data.user.nome,
            email:      data.user.email,
            tipo:       data.user.tipo,        // visitante | membro | admin
            membro_id:  data.user.membro_id,
            token:      data.token,
            expires_at: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 dias
        });

        return data.user;
    }

    // ── Registar visitante via API ────────────────────────────
    async function register(formData) {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || 'Erro ao registar');
        }

        saveSession({
            id:         data.user.id,
            nome:       data.user.nome,
            email:      data.user.email,
            tipo:       data.user.tipo,
            membro_id:  data.user.membro_id,
            token:      data.token,
            expires_at: Date.now() + (7 * 24 * 60 * 60 * 1000)
        });

        return data.user;
    }

    // ── Logout ────────────────────────────────────────────────
    function logout() {
        clearSession();
        window.location.href = 'index.html';
    }

    // ── Render user info num elemento ────────────────────────
    // Coloca nome e tipo do utilizador num elemento HTML
    function renderUserBadge(selector) {
        const user = getUser();
        const el = document.querySelector(selector);
        if (!el || !user) return;

        const tipoLabel = { visitante: 'Visitante', membro: 'Membro', admin: 'Admin' };
        el.innerHTML = `
      <span class="user-name">${user.nome?.split(' ')[0] || 'Utilizador'}</span>
      <span class="user-tipo">${tipoLabel[user.tipo] || user.tipo}</span>
    `;
    }

    // ── Exposição pública ─────────────────────────────────────
    return { protect, login, register, logout, getUser, isLoggedIn, renderUserBadge, saveSession };

})();