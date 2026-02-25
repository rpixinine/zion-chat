// flows/keola-flow.js
// ─────────────────────────────────────────────────────────────
// Fluxo do KEOLA — Lanchonete da Zion Church Lisboa
// Lê cardápio e especial do dia da tabela keola_menu do Supabase
// ─────────────────────────────────────────────────────────────

const t = {
    pt: {
        titulo:         `☕ <strong>KEOLA — Lanchonete da Zion Lisboa</strong>`,
        intro:          `Um espaço de convivência, comunhão e bons sabores 😊`,
        menuOpcoes:     `<p>O que queres ver?</p><p>🍽️ <strong>CARDÁPIO</strong> — Ver tudo o que temos<br>⭐ <strong>ESPECIAL DO DIA</strong> — O prato especial de hoje<br>☕ <strong>BEBIDAS</strong> — As nossas bebidas<br>🥪 <strong>SNACKS</strong> — Snacks e petiscos<br>🍰 <strong>SOBREMESAS</strong> — Doces e sobremesas</p>`,
        cardapioTitulo: `🍽️ <strong>Cardápio KEOLA</strong>`,
        especialTitulo: `⭐ <strong>Especial do Dia</strong>`,
        semEspecial:    `<p>⭐ Hoje não temos especial do dia. Vê o nosso cardápio escrevendo <strong>CARDÁPIO</strong> 😊</p>`,
        semProdutos:    `<p>De momento não temos produtos disponíveis nesta categoria. Volta em breve! 😊</p>`,
        semCardapio:    `<p>O cardápio está a ser atualizado. Volta em breve! 😊</p>`,
        preco:          `💶`,
        dica:           `<p>Para voltar ao menu principal escreve <strong>OI</strong> 😊</p>`,
        erro:           `<p>Ocorreu um erro ao carregar o KEOLA. Tenta novamente em breve 😊</p>`,
        categorias:     { bebidas: `☕ <strong>Bebidas</strong>`, snacks: `🥪 <strong>Snacks</strong>`, almoco: `🍽️ <strong>Almoço</strong>`, sobremesas: `🍰 <strong>Sobremesas</strong>`, sumos: `🧃 <strong>Sumos</strong>`, outro: `🛒 <strong>Outros</strong>` },
    },
    en: {
        titulo:         `☕ <strong>KEOLA — Zion Lisboa Café</strong>`,
        intro:          `A space for fellowship, community and good food 😊`,
        menuOpcoes:     `<p>What would you like to see?</p><p>🍽️ <strong>MENU</strong> — See everything we have<br>⭐ <strong>DAILY SPECIAL</strong> — Today's special<br>☕ <strong>DRINKS</strong> — Our drinks<br>🥪 <strong>SNACKS</strong> — Snacks and light bites<br>🍰 <strong>DESSERTS</strong> — Sweets and desserts</p>`,
        cardapioTitulo: `🍽️ <strong>KEOLA Menu</strong>`,
        especialTitulo: `⭐ <strong>Daily Special</strong>`,
        semEspecial:    `<p>⭐ No daily special today. Check our full menu by typing <strong>MENU</strong> 😊</p>`,
        semProdutos:    `<p>No products available in this category at the moment. Check back soon! 😊</p>`,
        semCardapio:    `<p>The menu is being updated. Check back soon! 😊</p>`,
        preco:          `💶`,
        dica:           `<p>To go back to the main menu type <strong>HI</strong> 😊</p>`,
        erro:           `<p>An error occurred loading KEOLA. Please try again shortly 😊</p>`,
        categorias:     { bebidas: `☕ <strong>Drinks</strong>`, snacks: `🥪 <strong>Snacks</strong>`, almoco: `🍽️ <strong>Lunch</strong>`, sobremesas: `🍰 <strong>Desserts</strong>`, sumos: `🧃 <strong>Juices</strong>`, outro: `🛒 <strong>Other</strong>` },
    },
    es: {
        titulo:         `☕ <strong>KEOLA — Cafetería de Zion Lisboa</strong>`,
        intro:          `Un espacio de convivencia, comunión y buenos sabores 😊`,
        menuOpcoes:     `<p>¿Qué quieres ver?</p><p>🍽️ <strong>MENÚ</strong> — Ver todo lo que tenemos<br>⭐ <strong>ESPECIAL DEL DÍA</strong> — El plato especial de hoy<br>☕ <strong>BEBIDAS</strong> — Nuestras bebidas<br>🥪 <strong>SNACKS</strong> — Snacks y aperitivos<br>🍰 <strong>POSTRES</strong> — Dulces y postres</p>`,
        cardapioTitulo: `🍽️ <strong>Menú KEOLA</strong>`,
        especialTitulo: `⭐ <strong>Especial del Día</strong>`,
        semEspecial:    `<p>⭐ Hoy no tenemos especial del día. Ve nuestro menú escribiendo <strong>MENÚ</strong> 😊</p>`,
        semProdutos:    `<p>No hay productos disponibles en esta categoría por ahora. ¡Vuelve pronto! 😊</p>`,
        semCardapio:    `<p>El menú está siendo actualizado. ¡Vuelve pronto! 😊</p>`,
        preco:          `💶`,
        dica:           `<p>Para volver al menú principal escribe <strong>HOLA</strong> 😊</p>`,
        erro:           `<p>Ocurrió un error al cargar KEOLA. Inténtalo de nuevo pronto 😊</p>`,
        categorias:     { bebidas: `☕ <strong>Bebidas</strong>`, snacks: `🥪 <strong>Snacks</strong>`, almoco: `🍽️ <strong>Almuerzo</strong>`, sobremesas: `🍰 <strong>Postres</strong>`, sumos: `🧃 <strong>Zumos</strong>`, outro: `🛒 <strong>Otros</strong>` },
    },
    it: {
        titulo:         `☕ <strong>KEOLA — Caffetteria di Zion Lisboa</strong>`,
        intro:          `Uno spazio di convivenza, comunione e buoni sapori 😊`,
        menuOpcoes:     `<p>Cosa vuoi vedere?</p><p>🍽️ <strong>MENU</strong> — Vedi tutto quello che abbiamo<br>⭐ <strong>SPECIALE DEL GIORNO</strong> — Il piatto speciale di oggi<br>☕ <strong>BEVANDE</strong> — Le nostre bevande<br>🥪 <strong>SNACKS</strong> — Snack e stuzzichini<br>🍰 <strong>DOLCI</strong> — Dolci e dessert</p>`,
        cardapioTitulo: `🍽️ <strong>Menu KEOLA</strong>`,
        especialTitulo: `⭐ <strong>Speciale del Giorno</strong>`,
        semEspecial:    `<p>⭐ Oggi non c'è uno speciale del giorno. Vedi il nostro menu scrivendo <strong>MENU</strong> 😊</p>`,
        semProdutos:    `<p>Nessun prodotto disponibile in questa categoria al momento. Torna presto! 😊</p>`,
        semCardapio:    `<p>Il menu è in aggiornamento. Torna presto! 😊</p>`,
        preco:          `💶`,
        dica:           `<p>Per tornare al menu principale scrivi <strong>CIAO</strong> 😊</p>`,
        erro:           `<p>Si è verificato un errore nel caricamento di KEOLA. Riprova a breve 😊</p>`,
        categorias:     { bebidas: `☕ <strong>Bevande</strong>`, snacks: `🥪 <strong>Snack</strong>`, almoco: `🍽️ <strong>Pranzo</strong>`, sobremesas: `🍰 <strong>Dolci</strong>`, sumos: `🧃 <strong>Succhi</strong>`, outro: `🛒 <strong>Altri</strong>` },
    },
};

const kw = {
    keola:      { pt: ["keola"], en: ["keola"], es: ["keola"], it: ["keola"] },
    cardapio:   { pt: ["cardapio", "cardápio", "menu", "o que tem", "o que temos"], en: ["menu", "food", "what do you have"], es: ["menu", "menú", "carta", "que tienen"], it: ["menu", "cosa avete"] },
    especial:   { pt: ["especial do dia", "especial", "prato do dia", "almoco do dia"], en: ["daily special", "special", "dish of the day"], es: ["especial del dia", "especial", "plato del dia"], it: ["speciale del giorno", "speciale", "piatto del giorno"] },
    bebidas:    { pt: ["bebidas", "cafe", "café", "agua", "sumos", "beber"], en: ["drinks", "coffee", "water", "beverages"], es: ["bebidas", "cafe", "agua", "beber"], it: ["bevande", "caffe", "acqua"] },
    snacks:     { pt: ["snacks", "lanche", "petisco", "tosta", "comer"], en: ["snacks", "light bites", "food"], es: ["snacks", "aperitivos", "tapas", "comer"], it: ["snack", "stuzzichini", "mangiare"] },
    sobremesas: { pt: ["sobremesas", "doces", "bolo", "pastel"], en: ["desserts", "sweets", "cake"], es: ["postres", "dulces", "pastel"], it: ["dolci", "dessert", "torta"] },
};

function normalize(str) {
    return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function hasKw(msg, lang, key) {
    const list = kw[key]?.[lang] || kw[key]?.pt || [];
    return list.some(k => msg === normalize(k) || msg.includes(normalize(k)));
}

function formatarProduto(produto, tx) {
    let html = `<p><strong>${produto.nome}</strong><br>`;
    if (produto.descricao) html += `<small>${produto.descricao}</small><br>`;
    html += `${tx.preco} <strong>${Number(produto.preco).toFixed(2)}€</strong>`;
    if (!produto.disponivel) html += ` ❌`;
    html += `</p>`;
    return html;
}

async function getCardapio(supabase, categoria = null) {
    let query = supabase.from("keola_menu").select("*").order("ordem").order("nome");
    if (categoria) query = query.eq("categoria", categoria);
    const { data } = await query;
    return data || [];
}

async function getEspecial(supabase) {
    const { data } = await supabase
        .from("keola_menu")
        .select("*")
        .eq("especial_hoje", true)
        .eq("disponivel", true)
        .limit(1);
    return data?.[0] || null;
}

export function isKeolaRequest(msg, lang) {
    return hasKw(msg, lang, "keola") ||
        hasKw(msg, lang, "cardapio") ||
        hasKw(msg, lang, "especial") ||
        hasKw(msg, lang, "bebidas") ||
        hasKw(msg, lang, "snacks") ||
        hasKw(msg, lang, "sobremesas");
}

export async function handleKeolaFlow(msg, lang, supabase) {
    const tx = t[lang] || t.pt;

    try {
        // ── KEOLA geral → mostra menu de opções ──────────────
        if (hasKw(msg, lang, "keola") &&
            !hasKw(msg, lang, "cardapio") &&
            !hasKw(msg, lang, "especial") &&
            !hasKw(msg, lang, "bebidas") &&
            !hasKw(msg, lang, "snacks") &&
            !hasKw(msg, lang, "sobremesas")) {
            return `<p>${tx.titulo}</p><p>${tx.intro}</p>${tx.menuOpcoes}`;
        }

        // ── ESPECIAL DO DIA ───────────────────────────────────
        if (hasKw(msg, lang, "especial")) {
            const especial = await getEspecial(supabase);
            if (!especial) return tx.semEspecial;
            let html = `<p>${tx.especialTitulo}</p>`;
            html += formatarProduto(especial, tx);
            html += tx.dica;
            return html;
        }

        // ── CATEGORIA ESPECÍFICA ──────────────────────────────
        let categoriaFiltro = null;
        if (hasKw(msg, lang, "bebidas"))    categoriaFiltro = "bebidas";
        if (hasKw(msg, lang, "snacks"))     categoriaFiltro = "snacks";
        if (hasKw(msg, lang, "sobremesas")) categoriaFiltro = "sobremesas";

        if (categoriaFiltro) {
            const produtos = await getCardapio(supabase, categoriaFiltro);
            if (!produtos.length) return tx.semProdutos;
            let html = `<p>${tx.categorias[categoriaFiltro]}</p>`;
            produtos.forEach(p => { html += formatarProduto(p, tx); });
            html += tx.dica;
            return html;
        }

        // ── CARDÁPIO COMPLETO ─────────────────────────────────
        const produtos = await getCardapio(supabase);
        if (!produtos.length) return tx.semCardapio;

        const especial = produtos.find(p => p.especial_hoje && p.disponivel);
        let html = `<p>${tx.cardapioTitulo}</p>`;

        // Destaca especial no topo
        if (especial) {
            html += `<p>${tx.especialTitulo}</p>`;
            html += formatarProduto(especial, tx);
        }

        // Agrupa por categoria na ordem correta
        const ordemCategorias = ["almoco", "bebidas", "sumos", "snacks", "sobremesas", "outro"];
        const porCategoria = produtos.reduce((acc, p) => {
            const cat = p.categoria || "outro";
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(p);
            return acc;
        }, {});

        ordemCategorias.forEach(cat => {
            if (!porCategoria[cat]?.length) return;
            html += `<p>${tx.categorias[cat] || cat}</p>`;
            porCategoria[cat].forEach(p => { html += formatarProduto(p, tx); });
        });

        html += tx.dica;
        return html;

    } catch (err) {
        console.error("[keola-flow] Erro:", err);
        return tx.erro;
    }
}