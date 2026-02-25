// flows/links-flow.js
// ─────────────────────────────────────────────────────────────
// Fluxo inteligente dos LINKs — lê dados do Supabase
// data/links.js já não é necessário
// ─────────────────────────────────────────────────────────────

// ── Textos da UI por idioma ───────────────────────────────
const t = {
    pt: {
        menu: `<p>🔗 <strong>LINKs — Grupos de Conexão</strong></p><p>Os LINKs são grupos que se reúnem como família nos lares, buscando a presença de Deus e partilhando testemunhos de forma presencial ou online.</p><p>O que queres saber?</p><p>👉 <strong>O QUE SÃO</strong> — O que são os LINKs<br>👥 <strong>RESPONSÁVEIS</strong> — Quem lidera cada LINK<br>📅 <strong>HORÁRIOS</strong> — Dias e horas de cada LINK<br>📍 <strong>ONDE</strong> — Onde se realizam<br>🙋 <strong>PARTICIPAR</strong> — Como entrar num LINK<br>📋 <strong>TODOS</strong> — Ver todos os LINKs</p>`,
        oQueSao: `<p>🔗 <strong>O que são os LINKs?</strong></p><p>Os LINKs são grupos de conexão da Zion Church Lisboa que se reúnem como família nos lares. É um ambiente onde a cultura do Reino é desenvolvida, a vida cristã é encorajada de forma intencional e os testemunhos são partilhados presencialmente ou online.</p><p>Temos grupos para todas as faixas etárias:<br>• <strong>Rise</strong> — 12 a 14 anos<br>• <strong>Flow</strong> — 15 a 17 anos<br>• <strong>Vox</strong> — 18 a 29 anos<br>• <strong>Eklektos</strong> — 29 a 39 anos<br>• <strong>Famílias</strong></p><p>Para entrar num LINK escreve <strong>PARTICIPAR</strong> 😊</p>`,
        perguntaZona: `<p>📍 Em que zona moras? (ex: Montijo, Alcochete, Lisboa...)</p><p>Assim consigo indicar-te o LINK mais próximo de ti 😊</p>`,
        sugestaoIntro: `<p>Encontrei os LINKs mais próximos de ti:</p>`,
        semLinks: `<p>De momento não temos LINKs nessa zona, mas estamos a crescer! Queres que entremos em contacto quando houver um LINK perto de ti?</p><p>Responde <strong>SIM</strong> para deixares os teus dados ou <strong>NÃO</strong> para terminar.</p>`,
        perguntaCadastro: `<p>Queres que entremos em contacto para te ajudar a juntar a um LINK?</p><p>Responde <strong>SIM</strong> para fazer o teu cadastro ou <strong>NÃO</strong> para terminar 😊</p>`,
        nenhumLink: `<p>De momento não temos LINKs registados. Contacta-nos diretamente para mais informações 😊</p>`,
        dica: `<p>Para entrar num LINK escreve <strong>PARTICIPAR</strong> 😊</p>`,
        todosTitulo: `<p>📋 <strong>Todos os LINKs da Zion Lisboa:</strong></p>`,
        responsaveisTitulo: `<p>👥 <strong>Responsáveis dos LINKs:</strong></p>`,
        horariosTitulo: `<p>📅 <strong>Horários dos LINKs:</strong></p>`,
        ondeTitulo: `<p>📍 <strong>Localização dos LINKs:</strong></p>`,
        obrigado: `<p>Sem problema! 😊 Se mudares de ideias, estamos sempre aqui. Que Deus te abençoe! ✝️</p>`,
        erro: `<p>Ocorreu um erro ao carregar os LINKs. Tenta novamente em breve 😊</p>`,
    },
    en: {
        menu: `<p>🔗 <strong>LINKs — Connection Groups</strong></p><p>LINKs are groups that gather as family in homes, seeking God's presence and sharing testimonies in person or online.</p><p>What would you like to know?</p><p>👉 <strong>WHAT ARE</strong> — What are LINKs<br>👥 <strong>LEADERS</strong> — Who leads each LINK<br>📅 <strong>SCHEDULE</strong> — Days and times<br>📍 <strong>WHERE</strong> — Where they meet<br>🙋 <strong>JOIN</strong> — How to join a LINK<br>📋 <strong>ALL</strong> — See all LINKs</p>`,
        oQueSao: `<p>🔗 <strong>What are LINKs?</strong></p><p>LINKs are Zion Church Lisboa's connection groups that gather as family in homes. It's an environment where Kingdom culture is developed, Christian life is intentionally encouraged and testimonies are shared in person or online.</p><p>We have groups for all ages:<br>• <strong>Rise</strong> — 12 to 14 years<br>• <strong>Flow</strong> — 15 to 17 years<br>• <strong>Vox</strong> — 18 to 29 years<br>• <strong>Eklektos</strong> — 29 to 39 years<br>• <strong>Families</strong></p><p>To join a LINK type <strong>JOIN</strong> 😊</p>`,
        perguntaZona: `<p>📍 Which area do you live in? (e.g. Montijo, Alcochete, Lisbon...)</p><p>I'll suggest the closest LINK to you 😊</p>`,
        sugestaoIntro: `<p>Here are the closest LINKs to you:</p>`,
        semLinks: `<p>We don't have LINKs in that area yet, but we're growing! Would you like us to contact you when a LINK opens near you?</p><p>Reply <strong>YES</strong> to register or <strong>NO</strong> to finish.</p>`,
        perguntaCadastro: `<p>Would you like us to get in touch to help you join a LINK?</p><p>Reply <strong>YES</strong> to register or <strong>NO</strong> to finish 😊</p>`,
        nenhumLink: `<p>No LINKs registered at the moment. Contact us directly for more information 😊</p>`,
        dica: `<p>To join a LINK type <strong>JOIN</strong> 😊</p>`,
        todosTitulo: `<p>📋 <strong>All LINKs at Zion Lisboa:</strong></p>`,
        responsaveisTitulo: `<p>👥 <strong>LINK Leaders:</strong></p>`,
        horariosTitulo: `<p>📅 <strong>LINK Schedules:</strong></p>`,
        ondeTitulo: `<p>📍 <strong>LINK Locations:</strong></p>`,
        obrigado: `<p>No problem! 😊 If you change your mind, we're always here. God bless you! ✝️</p>`,
        erro: `<p>An error occurred loading the LINKs. Please try again shortly 😊</p>`,
    },
    es: {
        menu: `<p>🔗 <strong>LINKs — Grupos de Conexión</strong></p><p>Los LINKs son grupos que se reúnen como familia en los hogares, buscando la presencia de Dios y compartiendo testimonios.</p><p>¿Qué quieres saber?</p><p>👉 <strong>QUÉ SON</strong> — Qué son los LINKs<br>👥 <strong>RESPONSABLES</strong> — Quién lidera cada LINK<br>📅 <strong>HORARIOS</strong> — Días y horas<br>📍 <strong>DÓNDE</strong> — Dónde se realizan<br>🙋 <strong>PARTICIPAR</strong> — Cómo unirse<br>📋 <strong>TODOS</strong> — Ver todos los LINKs</p>`,
        oQueSao: `<p>🔗 <strong>¿Qué son los LINKs?</strong></p><p>Los LINKs son grupos de conexión de Zion Church Lisboa que se reúnen como familia en los hogares.</p><p>Tenemos grupos para todas las edades:<br>• Rise (12-14) • Flow (15-17) • Vox (18-29) • Eklektos (29-39) • Familias</p><p>Para unirte escribe <strong>PARTICIPAR</strong> 😊</p>`,
        perguntaZona: `<p>📍 ¿En qué zona vives? (ej: Montijo, Alcochete, Lisboa...)</p><p>Así te indico el LINK más cercano 😊</p>`,
        sugestaoIntro: `<p>Estos son los LINKs más cercanos a ti:</p>`,
        semLinks: `<p>Por ahora no tenemos LINKs en esa zona. ¿Quieres que te contactemos cuando haya uno cerca?</p><p>Responde <strong>SÍ</strong> para registrarte o <strong>NO</strong> para terminar.</p>`,
        perguntaCadastro: `<p>¿Quieres que nos pongamos en contacto para ayudarte a unirte a un LINK?</p><p>Responde <strong>SÍ</strong> para registrarte o <strong>NO</strong> para terminar 😊</p>`,
        nenhumLink: `<p>No hay LINKs registrados por ahora. Contáctanos directamente 😊</p>`,
        dica: `<p>Para unirte a un LINK escribe <strong>PARTICIPAR</strong> 😊</p>`,
        todosTitulo: `<p>📋 <strong>Todos los LINKs de Zion Lisboa:</strong></p>`,
        responsaveisTitulo: `<p>👥 <strong>Responsables de los LINKs:</strong></p>`,
        horariosTitulo: `<p>📅 <strong>Horarios de los LINKs:</strong></p>`,
        ondeTitulo: `<p>📍 <strong>Ubicación de los LINKs:</strong></p>`,
        obrigado: `<p>¡Sin problema! 😊 Si cambias de opinión, aquí estamos. ¡Que Dios te bendiga! ✝️</p>`,
        erro: `<p>Ocurrió un error al cargar los LINKs. Inténtalo de nuevo pronto 😊</p>`,
    },
    it: {
        menu: `<p>🔗 <strong>LINKs — Gruppi di Connessione</strong></p><p>I LINKs sono gruppi che si riuniscono come famiglia nelle case, cercando la presenza di Dio e condividendo testimonianze.</p><p>Cosa vuoi sapere?</p><p>👉 <strong>COSA SONO</strong> — Cosa sono i LINKs<br>👥 <strong>RESPONSABILI</strong> — Chi guida ogni LINK<br>📅 <strong>ORARI</strong> — Giorni e orari<br>📍 <strong>DOVE</strong> — Dove si svolgono<br>🙋 <strong>PARTECIPARE</strong> — Come unirsi<br>📋 <strong>TUTTI</strong> — Vedere tutti i LINKs</p>`,
        oQueSao: `<p>🔗 <strong>Cosa sono i LINKs?</strong></p><p>I LINKs sono gruppi di connessione di Zion Church Lisboa che si riuniscono come famiglia nelle case.</p><p>Abbiamo gruppi per tutte le età:<br>• Rise (12-14) • Flow (15-17) • Vox (18-29) • Eklektos (29-39) • Famiglie</p><p>Per unirti scrivi <strong>PARTECIPARE</strong> 😊</p>`,
        perguntaZona: `<p>📍 In quale zona abiti? (es: Montijo, Alcochete, Lisbona...)</p><p>Così ti suggerisco il LINK più vicino 😊</p>`,
        sugestaoIntro: `<p>Ecco i LINKs più vicini a te:</p>`,
        semLinks: `<p>Al momento non abbiamo LINKs in quella zona. Vuoi che ti contattassimo quando ce n'è uno vicino?</p><p>Rispondi <strong>SÌ</strong> per registrarti o <strong>NO</strong> per terminare.</p>`,
        perguntaCadastro: `<p>Vuoi che ti contattassimo per aiutarti a unirti a un LINK?</p><p>Rispondi <strong>SÌ</strong> per registrarti o <strong>NO</strong> per terminare 😊</p>`,
        nenhumLink: `<p>Nessun LINK registrato al momento. Contattaci direttamente 😊</p>`,
        dica: `<p>Per unirti a un LINK scrivi <strong>PARTECIPARE</strong> 😊</p>`,
        todosTitulo: `<p>📋 <strong>Tutti i LINKs di Zion Lisboa:</strong></p>`,
        responsaveisTitulo: `<p>👥 <strong>Responsabili dei LINKs:</strong></p>`,
        horariosTitulo: `<p>📅 <strong>Orari dei LINKs:</strong></p>`,
        ondeTitulo: `<p>📍 <strong>Posizione dei LINKs:</strong></p>`,
        obrigado: `<p>Nessun problema! 😊 Se cambi idea, siamo sempre qui. Dio ti benedica! ✝️</p>`,
        erro: `<p>Si è verificato un errore nel caricamento dei LINKs. Riprova a breve 😊</p>`,
    },
};

// ── Keywords por idioma ───────────────────────────────────
const kw = {
    links:        { pt: ["links"], en: ["links"], es: ["links"], it: ["links"] },
    oQueSao:      { pt: ["o que sao", "o que e"], en: ["what are", "what is"], es: ["que son", "que es"], it: ["cosa sono"] },
    responsaveis: { pt: ["responsaveis", "quem lidera", "lideres"], en: ["leaders", "who leads"], es: ["responsables", "quien lidera"], it: ["responsabili", "chi guida"] },
    horarios:     { pt: ["horarios", "dias", "quando"], en: ["schedule", "days", "when"], es: ["horarios", "dias", "cuando"], it: ["orari", "giorni", "quando"] },
    onde:         { pt: ["onde", "localizacao", "morada"], en: ["where", "location"], es: ["donde", "ubicacion"], it: ["dove", "posizione"] },
    participar:   { pt: ["participar", "entrar", "quero participar"], en: ["join", "participate"], es: ["participar", "unirse"], it: ["partecipare", "unirsi"] },
    todos:        { pt: ["todos", "ver todos"], en: ["all", "see all"], es: ["todos", "ver todos"], it: ["tutti", "vedere tutti"] },
    sim:          { pt: ["sim", "s", "quero", "yes"], en: ["yes", "y", "sure"], es: ["si", "sí", "s", "claro"], it: ["si", "sì", "certo"] },
    nao:          { pt: ["nao", "n", "no", "obrigado", "obrigada"], en: ["no", "n", "thanks"], es: ["no", "n", "gracias"], it: ["no", "n", "grazie"] },
};

function has(msg, lang, key) {
    const list = kw[key]?.[lang] || kw[key]?.pt || [];
    return list.some(k => msg === k || msg.includes(k));
}

// ── Formata um LINK para HTML ────────────────────────────
function formatarLink(link, lang) {
    const l = {
        pt: { resp: "Responsável", dia: "Dia", hora: "Horário", morada: "Morada", contato: "Contacto", online: "Grupo online" },
        en: { resp: "Leader", dia: "Day", hora: "Time", morada: "Address", contato: "Contact", online: "Online group" },
        es: { resp: "Responsable", dia: "Día", hora: "Horario", morada: "Dirección", contato: "Contacto", online: "Grupo en línea" },
        it: { resp: "Responsabile", dia: "Giorno", hora: "Orario", morada: "Indirizzo", contato: "Contatto", online: "Gruppo online" },
    }[lang] || {};

    let html = `<p><strong>📎 ${link.nome}</strong>${link.faixa_etaria ? ` — ${link.faixa_etaria}` : ""}</p><p>`;
    html += `👤 ${l.resp}: ${link.responsavel}<br>`;
    if (link.co_responsavel) html += `👤 ${link.co_responsavel}<br>`;
    html += `📅 ${l.dia}: ${link.dia} às ${link.horario}<br>`;
    if (link.online) {
        html += `💻 ${l.online}<br>`;
    } else {
        html += `📍 ${link.zona}: ${link.morada}<br>`;
    }
    html += `📞 ${l.contato}</p>`;
    return html;
}

// ── Busca LINKs do Supabase ──────────────────────────────
async function getLinksDaDB(supabase, zona = null) {
    let query = supabase.from("links").select("*").eq("ativo", true).order("nome");

    if (zona) {
        const normalize = s => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const { data: todos } = await supabase.from("links").select("*").eq("ativo", true).order("nome");
        if (!todos) return [];
        const zonaN = normalize(zona);
        const proximos = todos.filter(l => {
            if (l.online) return false;
            const zonaL = normalize(l.zona || "");
            return zonaL.includes(zonaN) || zonaN.includes(zonaL);
        });
        return proximos.length > 0 ? proximos : todos.filter(l => !l.online);
    }

    const { data } = await query;
    return data || [];
}

// ─────────────────────────────────────────────────────────────
// HANDLER PRINCIPAL DO FLUXO
// ─────────────────────────────────────────────────────────────
export async function handleLinksFlow(msg, lang, state, supabase) {
    const tx = t[lang] || t.pt;

    // ── Entrada no fluxo ─────────────────────────────────────
    if (has(msg, lang, "links") && (!state || !state.flow)) {
        return {
            reply: tx.menu,
            newState: { flow: "links", step: "menu" }
        };
    }

    if (!state || state.flow !== "links") return null;

    // ── O QUE SÃO ────────────────────────────────────────────
    if (has(msg, lang, "oQueSao")) {
        return { reply: tx.oQueSao, newState: { flow: "links", step: "info" } };
    }

    // ── RESPONSÁVEIS ─────────────────────────────────────────
    if (has(msg, lang, "responsaveis")) {
        const links = await getLinksDaDB(supabase);
        if (!links.length) return { reply: tx.nenhumLink, newState: null };
        let html = tx.responsaveisTitulo;
        links.forEach(l => {
            html += `<p><strong>${l.nome}</strong><br>👤 ${l.responsavel}`;
            if (l.co_responsavel) html += `<br>👤 ${l.co_responsavel}`;
            html += `<br>📞 ${l.contato}</p>`;
        });
        html += tx.dica;
        return { reply: html, newState: { flow: "links", step: "info" } };
    }

    // ── HORÁRIOS ─────────────────────────────────────────────
    if (has(msg, lang, "horarios")) {
        const links = await getLinksDaDB(supabase);
        if (!links.length) return { reply: tx.nenhumLink, newState: null };
        let html = tx.horariosTitulo;
        links.forEach(l => {
            html += `<p><strong>${l.nome}</strong><br>📅 ${l.dia} às ${l.horario}${l.online ? " 💻" : ""}</p>`;
        });
        html += tx.dica;
        return { reply: html, newState: { flow: "links", step: "info" } };
    }

    // ── ONDE ─────────────────────────────────────────────────
    if (has(msg, lang, "onde")) {
        const links = await getLinksDaDB(supabase);
        if (!links.length) return { reply: tx.nenhumLink, newState: null };
        let html = tx.ondeTitulo;
        links.forEach(l => {
            html += `<p><strong>${l.nome}</strong><br>`;
            html += l.online ? `💻 Online` : `📍 ${l.zona}: ${l.morada}`;
            html += `</p>`;
        });
        html += tx.dica;
        return { reply: html, newState: { flow: "links", step: "info" } };
    }

    // ── TODOS ────────────────────────────────────────────────
    if (has(msg, lang, "todos")) {
        const links = await getLinksDaDB(supabase);
        if (!links.length) return { reply: tx.nenhumLink, newState: null };
        let html = tx.todosTitulo;
        links.forEach(l => { html += formatarLink(l, lang); });
        return { reply: html, newState: { flow: "links", step: "info" } };
    }

    // ── PARTICIPAR → pergunta zona ────────────────────────────
    if (has(msg, lang, "participar")) {
        return { reply: tx.perguntaZona, newState: { flow: "links", step: "aguarda_zona" } };
    }

    // ── Aguarda zona ─────────────────────────────────────────
    if (state.step === "aguarda_zona") {
        const links = await getLinksDaDB(supabase, msg);
        if (!links.length) {
            return {
                reply: tx.semLinks,
                newState: { flow: "links", step: "aguarda_cadastro", data: { zona: msg } }
            };
        }
        let html = tx.sugestaoIntro;
        links.forEach(l => { html += formatarLink(l, lang); });
        html += tx.perguntaCadastro;
        return {
            reply: html,
            newState: { flow: "links", step: "aguarda_cadastro", data: { zona: msg } }
        };
    }

    // ── Aguarda decisão de cadastro ──────────────────────────
    if (state.step === "aguarda_cadastro") {
        if (has(msg, lang, "sim")) {
            return {
                reply: null, // sinal para o chat.js transitar para o fluxo de cadastro
                newState: { flow: "cadastro", step: "inicio", data: state.data || {} }
            };
        }
        if (has(msg, lang, "nao")) {
            return { reply: tx.obrigado, newState: null };
        }
    }

    return null;
}