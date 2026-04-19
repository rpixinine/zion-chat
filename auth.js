const ZionAuth = (() => {

    const _sb = supabase.createClient(
        window.SUPABASE_URL,
        window.SUPABASE_ANON_KEY
    );

    // ── Sessão activa ─────────────────────────────────────────
    async function getSession() {
        const { data } = await _sb.auth.getSession();
        return data?.session || null;
    }

    // ── User com dados extra da tabela membros ────────────────
    async function getUser() {
        const session = await getSession();
        if (!session) return null;

        const { data: membro } = await _sb
            .from('membros')
            .select('id,nome,email,tipo,e_admin,e_lider,e_gerenciamento,e_escala,e_hub,e_jornada,e_dizimista,foto_url')
            .eq('email', session.user.email)
            .eq('ativo', true)
            .single();

        if (!membro) return null;

        return {
            ...membro,
            membro_id: membro.id,
            _session:  session
        };
    }

    // ── Login ─────────────────────────────────────────────────
    async function login(email, password) {
        const { data, error } = await _sb.auth.signInWithPassword({
            email: email.toLowerCase().trim(),
            password
        });
        if (error) throw new Error(
            error.message === 'Invalid login credentials'
                ? 'Email ou password incorretos.'
                : error.message
        );
        return data.user;
    }

    // ── Registo de novo membro ────────────────────────────────
    async function register(formData) {
        // 1. Cria conta no Supabase Auth
        const { data, error } = await _sb.auth.signUp({
            email:    formData.email.toLowerCase().trim(),
            password: formData.password,
            options:  { data: { nome: formData.nome } }
        });
        if (error) throw new Error(error.message);

        // 2. Cria registo na tabela membros
        const { error: dbError } = await _sb.from('membros').insert({
            nome:           formData.nome,
            email:          formData.email.toLowerCase().trim(),
            nif:            formData.nif || null,
            telefone:       formData.telefone || null,
            onde_conheceu:  formData.onde_conheceu || null,
            foto_url:       formData.foto_url || null,
            tipo:           'visitante',
            ativo:          true
        });
        if (dbError) throw new Error(dbError.message);

        return data.user;
    }

    // ── Logout ────────────────────────────────────────────────
    async function logout() {
        await _sb.auth.signOut();
        window.location.href = '/login';
    }

    // ── Proteger página ───────────────────────────────────────
    async function protect(opts = {}) {
        const session = await getSession();
        if (!session) {
            sessionStorage.setItem('zion_redirect', window.location.href);
            window.location.href = '/login';
            return null;
        }
        return session;
    }

    // ── Token para o sb() das páginas ────────────────────────
    async function getToken() {
        const session = await getSession();
        return session?.access_token || null;
    }

    // ── Compatibilidade com o sistema antigo ─────────────────
    function isLoggedIn() {
        // Versão síncrona para compatibilidade — usa getSession() async onde possível
        return !!localStorage.getItem(
            `sb-${window.SUPABASE_URL?.split('//')[1]?.split('.')[0]}-auth-token`
        );
    }

    // ── Escuta mudanças de sessão ─────────────────────────────
    function onAuthChange(callback) {
        _sb.auth.onAuthStateChange(callback);
    }

    // ── Expõe o cliente Supabase para quem precisar ───────────
    function getClient() {
        return _sb;
    }

    return {
        login, register, logout, protect,
        getUser, getSession, getToken, isLoggedIn,
        onAuthChange, getClient
    };

})();
