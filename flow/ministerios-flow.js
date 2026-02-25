// flows/ministerios-flow.js
// ─────────────────────────────────────────────────────────────
// Fluxo inteligente dos Ministérios
// Lê dados da tabela ministerios + ministerio_lideres do Supabase
// ─────────────────────────────────────────────────────────────

// ── Textos da UI por idioma ───────────────────────────────
const t = {
    pt: {
        menuTitulo:   `🙏 <strong>Ministérios da Zion Lisboa</strong>`,
        menuIntro:    `Temos ministérios para todas as faixas etárias e áreas de serviço. O que queres saber?`,
        menuOpcoes:   `<p>Escreve o nome do ministério para saber mais:<br><br>✨ <strong>LUMEN</strong> — Crianças<br>🔥 <strong>RISE</strong> — 12 a 14 anos<br>🌊 <strong>FLOW</strong> — 15 a 17 anos<br>🎤 <strong>VOX</strong> — 18 a 29 anos<br>👑 <strong>EKLEKTOS</strong> — 29 a 39 anos<br>💎 <strong>DIAMANTE</strong> — 60+ anos<br>🌱 <strong>RAÍZES</strong> — Membresia<br>🚶 <strong>JORNADA</strong> — Novos Convertidos<br>🏛️ <strong>LEGADO</strong> — Expansão do Reino<br>🌎 <strong>MISSÕES</strong> — Ao Redor do Mundo<br>🎵 <strong>ALTOMONTE</strong> — Louvor e Adoração</p>`,
        lider:        `👤 Líder`,
        coLider:      `👤 Co-líder`,
        faixa:        `👥 Faixa etária`,
        contato:      `📞 Contacto`,
        instagram:    `📸 Instagram`,
        aDefinir:     `A definir`,
        semInfo:      `<p>Não encontrei informações sobre esse ministério. Tenta escrever o nome completo 😊</p>`,
        nenhumAtivo:  `<p>Não há ministérios ativos de momento. Contacta-nos para mais informações 😊</p>`,
        dica:         `<p>Escreve o nome de outro ministério ou <strong>OI</strong> para voltar ao menu principal 😊</p>`,
        erro:         `<p>Ocorreu um erro ao carregar os ministérios. Tenta novamente em breve 😊</p>`,
        todos:        `📋 <strong>Todos os Ministérios:</strong>`,
    },
    en: {
        menuTitulo:   `🙏 <strong>Zion Lisboa Ministries</strong>`,
        menuIntro:    `We have ministries for all ages and areas of service. What would you like to know?`,
        menuOpcoes:   `<p>Type the ministry name to learn more:<br><br>✨ <strong>LUMEN</strong> — Children<br>🔥 <strong>RISE</strong> — 12 to 14 years<br>🌊 <strong>FLOW</strong> — 15 to 17 years<br>🎤 <strong>VOX</strong> — 18 to 29 years<br>👑 <strong>EKLEKTOS</strong> — 29 to 39 years<br>💎 <strong>DIAMANTE</strong> — 60+ years<br>🌱 <strong>ROOTS</strong> — Membership<br>🚶 <strong>JOURNEY</strong> — New Believers<br>🏛️ <strong>LEGACY</strong> — Kingdom Expansion<br>🌎 <strong>MISSIONS</strong> — Around the World<br>🎵 <strong>ALTOMONTE</strong> — Worship</p>`,
        lider:        `👤 Leader`,
        coLider:      `👤 Co-leader`,
        faixa:        `👥 Age group`,
        contato:      `📞 Contact`,
        instagram:    `📸 Instagram`,
        aDefinir:     `To be confirmed`,
        semInfo:      `<p>I couldn't find information about that ministry. Try typing the full name 😊</p>`,
        nenhumAtivo:  `<p>No active ministries at the moment. Contact us for more information 😊</p>`,
        dica:         `<p>Type another ministry name or <strong>HI</strong> to go back to the main menu 😊</p>`,
        erro:         `<p>An error occurred loading the ministries. Please try again shortly 😊</p>`,
        todos:        `📋 <strong>All Ministries:</strong>`,
    },
    es: {
        menuTitulo:   `🙏 <strong>Ministerios de Zion Lisboa</strong>`,
        menuIntro:    `Tenemos ministerios para todas las edades y áreas de servicio. ¿Qué quieres saber?`,
        menuOpcoes:   `<p>Escribe el nombre del ministerio para saber más:<br><br>✨ <strong>LUMEN</strong> — Niños<br>🔥 <strong>RISE</strong> — 12 a 14 años<br>🌊 <strong>FLOW</strong> — 15 a 17 años<br>🎤 <strong>VOX</strong> — 18 a 29 años<br>👑 <strong>EKLEKTOS</strong> — 29 a 39 años<br>💎 <strong>DIAMANTE</strong> — 60+ años<br>🌱 <strong>RAÍCES</strong> — Membresía<br>🚶 <strong>JORNADA</strong> — Nuevos Creyentes<br>🏛️ <strong>LEGADO</strong> — Expansión del Reino<br>🌎 <strong>MISIONES</strong> — Por Todo el Mundo<br>🎵 <strong>ALTOMONTE</strong> — Alabanza</p>`,
        lider:        `👤 Líder`,
        coLider:      `👤 Co-líder`,
        faixa:        `👥 Rango de edad`,
        contato:      `📞 Contacto`,
        instagram:    `📸 Instagram`,
        aDefinir:     `Por definir`,
        semInfo:      `<p>No encontré información sobre ese ministerio. Intenta escribir el nombre completo 😊</p>`,
        nenhumAtivo:  `<p>No hay ministerios activos por ahora. Contáctanos para más información 😊</p>`,
        dica:         `<p>Escribe otro ministerio o <strong>HOLA</strong> para volver al menú principal 😊</p>`,
        erro:         `<p>Ocurrió un error al cargar los ministerios. Inténtalo de nuevo pronto 😊</p>`,
        todos:        `📋 <strong>Todos los Ministerios:</strong>`,
    },
    it: {
        menuTitulo:   `🙏 <strong>Ministeri di Zion Lisboa</strong>`,
        menuIntro:    `Abbiamo ministeri per tutte le età e aree di servizio. Cosa vuoi sapere?`,
        menuOpcoes:   `<p>Scrivi il nome del ministero per saperne di più:<br><br>✨ <strong>LUMEN</strong> — Bambini<br>🔥 <strong>RISE</strong> — 12 a 14 anni<br>🌊 <strong>FLOW</strong> — 15 a 17 anni<br>🎤 <strong>VOX</strong> — 18 a 29 anni<br>👑 <strong>EKLEKTOS</strong> — 29 a 39 anni<br>💎 <strong>DIAMANTE</strong> — 60+ anni<br>🌱 <strong>RADICI</strong> — Appartenenza<br>🚶 <strong>CAMMINO</strong> — Nuovi Credenti<br>🏛️ <strong>EREDITÀ</strong> — Espansione del Regno<br>🌎 <strong>MISSIONI</strong> — In Tutto il Mondo<br>🎵 <strong>ALTOMONTE</strong> — Lode</p>`,
        lider:        `👤 Leader`,
        coLider:      `👤 Co-leader`,
        faixa:        `👥 Fascia d'età`,
        contato:      `📞 Contatto`,
        instagram:    `📸 Instagram`,
        aDefinir:     `Da definire`,
        semInfo:      `<p>Non ho trovato informazioni su quel ministero. Prova a scrivere il nome completo 😊</p>`,
        nenhumAtivo:  `<p>Nessun ministero attivo al momento. Contattaci per maggiori informazioni 😊</p>`,
        dica:         `<p>Scrivi un altro ministero o <strong>CIAO</strong> per tornare al menu principale 😊</p>`,
        erro:         `<p>Si è verificato un errore nel caricamento dei ministeri. Riprova a breve 😊</p>`,
        todos:        `📋 <strong>Tutti i Ministeri:</strong>`,
    },
};

// ── Mapa slug → keywords por idioma ──────────────────────
// Permite reconhecer o ministério independente do idioma
const slugKeywords = {
    lumen:     { pt: ["lumen"], en: ["lumen"], es: ["lumen"], it: ["lumen"] },
    rise:      { pt: ["rise"], en: ["rise"], es: ["rise"], it: ["rise"] },
    flow:      { pt: ["flow"], en: ["flow"], es: ["flow"], it: ["flow"] },
    vox:       { pt: ["vox"], en: ["vox"], es: ["vox"], it: ["vox"] },
    eklektos:  { pt: ["eklektos"], en: ["eklektos"], es: ["eklektos"], it: ["eklektos"] },
    diamante:  { pt: ["diamante"], en: ["diamante"], es: ["diamante"], it: ["diamante"] },
    raizes:    { pt: ["raizes", "raízes"], en: ["roots"], es: ["raices", "raíces"], it: ["radici"] },
    jornada:   { pt: ["jornada"], en: ["journey"], es: ["jornada"], it: ["cammino"] },
    legado:    { pt: ["legado", "por um legado"], en: ["legacy"], es: ["legado"], it: ["eredita", "eredità"] },
    missoes:   { pt: ["missoes", "missões"], en: ["missions"], es: ["misiones"], it: ["missioni"] },
    altomonte: { pt: ["altomonte"], en: ["altomonte"], es: ["altomonte"], it: ["altomonte"] },
};

// Keywords que abrem o menu de ministérios
const menuKeywords = {
    pt: ["ministerios", "ministérios", "ministerio", "ministério"],
    en: ["ministries", "ministry"],
    es: ["ministerios", "ministerio"],
    it: ["ministeri", "ministero"],
};

// Keywords para listar todos
const todosKeywords = {
    pt: ["todos", "ver todos", "lista"],
    en: ["all", "see all", "list"],
    es: ["todos", "ver todos"],
    it: ["tutti", "vedere tutti"],
};

function normalize(str) {
    return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function hasKw(msg, list) {
    return list.some(k => msg === normalize(k) || msg.includes(normalize(k)));
}

// Descobre o slug do ministério a partir da mensagem
function detectarSlug(msg, lang) {
    for (const [slug, keywords] of Object.entries(slugKeywords)) {
        const list = keywords[lang] || keywords.pt;
        if (hasKw(msg, list)) return slug;
    }
    return null;
}

// ── Emojis por slug ───────────────────────────────────────
const emojis = {
    lumen: "✨", rise: "🔥", flow: "🌊", vox: "🎤",
    eklektos: "👑", diamante: "💎", raizes: "🌱", jornada: "🚶",
    legado: "🏛️", missoes: "🌎", altomonte: "🎵",
};

// ── Busca ministério + líderes do Supabase ────────────────
async function getMinisterio(supabase, slug) {
    const { data: min } = await supabase
        .from("ministerios")
        .select("*")
        .eq("slug", slug)
        .eq("ativo", true)
        .single();

    if (!min) return null;

    // Busca líderes vinculados
    const { data: lideres } = await supabase
        .from("ministerio_lideres")
        .select(`
      cargo,
      membro_id,
      membros (nome, telefone)
    `)
        .eq("ministerio_id", min.id);

    return { ...min, lideres: lideres || [] };
}

async function getTodosMinisterios(supabase) {
    const { data } = await supabase
        .from("ministerios")
        .select("*")
        .eq("ativo", true)
        .order("nome");
    return data || [];
}

// ── Formata um ministério para HTML ──────────────────────
function formatarMinisterio(min, lideres, lang) {
    const tx = t[lang] || t.pt;
    const emoji = emojis[min.slug] || "🙏";

    let html = `<p>${emoji} <strong>${min.nome}</strong>`;
    if (min.faixa_etaria) html += ` — ${min.faixa_etaria}`;
    html += `</p>`;

    if (min.descricao) html += `<p>${min.descricao}</p>`;

    html += `<p>`;

    if (lideres && lideres.length > 0) {
        lideres.forEach((l, i) => {
            const nome = l.membros?.nome || tx.aDefinir;
            const label = i === 0 ? tx.lider : tx.coLider;
            html += `${label}: ${nome}`;
            if (l.cargo) html += ` <em>(${l.cargo})</em>`;
            html += `<br>`;
            if (l.membros?.telefone) html += `📞 ${l.membros.telefone}<br>`;
        });
    } else {
        html += `${tx.lider}: ${tx.aDefinir}<br>`;
    }

    if (min.instagram) html += `📸 <a href="${min.instagram}" target="_blank">${min.instagram}</a><br>`;

    html += `</p>`;
    return html;
}

// ── Verifica se é pedido de ministério ───────────────────
export function isMinisterioRequest(msg, lang) {
    const menuList = menuKeywords[lang] || menuKeywords.pt;
    if (hasKw(msg, menuList)) return true;
    return detectarSlug(msg, lang) !== null;
}

// ─────────────────────────────────────────────────────────
// HANDLER PRINCIPAL
// ─────────────────────────────────────────────────────────
export async function handleMinisteriosFlow(msg, lang, supabase) {
    const tx = t[lang] || t.pt;

    try {
        const menuList = menuKeywords[lang] || menuKeywords.pt;
        const todosList = todosKeywords[lang] || todosKeywords.pt;

        // ── Menu geral de ministérios ─────────────────────────
        if (hasKw(msg, menuList) && !detectarSlug(msg, lang)) {
            return `<p>${tx.menuTitulo}</p><p>${tx.menuIntro}</p>${tx.menuOpcoes}`;
        }

        // ── Listar todos ──────────────────────────────────────
        if (hasKw(msg, todosList)) {
            const todos = await getTodosMinisterios(supabase);
            if (!todos.length) return tx.nenhumAtivo;
            let html = `<p>${tx.todos}</p>`;
            todos.forEach(m => {
                const emoji = emojis[m.slug] || "🙏";
                html += `<p>${emoji} <strong>${m.nome}</strong>`;
                if (m.faixa_etaria) html += ` — ${m.faixa_etaria}`;
                if (m.descricao) html += `<br><small>${m.descricao}</small>`;
                html += `</p>`;
            });
            html += tx.dica;
            return html;
        }

        // ── Ministério específico ─────────────────────────────
        const slug = detectarSlug(msg, lang);
        if (!slug) return null;

        const min = await getMinisterio(supabase, slug);
        if (!min) return tx.semInfo;

        let html = formatarMinisterio(min, min.lideres, lang);
        html += tx.dica;
        return html;

    } catch (err) {
        console.error("[ministerios-flow] Erro:", err);
        return tx.erro;
    }
}