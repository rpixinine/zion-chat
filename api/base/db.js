// api/base/db.js
// Função sb() global — usada por todos os módulos do admin
// Usa o JWT do Supabase Auth em vez da anon key

window.ZionDB = {
    query: async function(path, opts = {}) {
        const token = await ZionAuth.getToken();
        const r = await fetch(`${window.SUPABASE_URL}/rest/v1/${path}`, {
            ...opts,
            headers: {
                'apikey':        window.SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${token}`,
                'Content-Type':  'application/json',
                'Prefer':        'return=representation',
                ...opts.headers,
            },
        });
        if (!r.ok) {
            const e = await r.json().catch(() => {});
            throw e;
        }
        const txt = await r.text();
        return txt ? JSON.parse(txt) : [];
    }
};

// Atalho global — todos os módulos usam sb() directamente
window.sb = window.ZionDB.query;