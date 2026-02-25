// flows/cadastro-flow.js
// ─────────────────────────────────────────────────────────────
// Fluxo de cadastro multi-passo
// Recolhe: nome, telefone, email, zona, história, tipo, estado civil, filhos
// Guarda tudo na tabela leads do Supabase
// ─────────────────────────────────────────────────────────────

// Perguntas por idioma e por passo
const perguntas = {
    pt: {
        inicio:        `😊 Ótimo! Vou precisar de alguns dados para te ajudarmos.\n\n👤 Qual é o teu <strong>nome completo</strong>?`,
        telefone:      `📞 Qual é o teu <strong>número de telefone</strong>?`,
        email:         `📧 Qual é o teu <strong>email</strong>?`,
        tipo:          `🙏 És <strong>membro</strong> ou <strong>visitante</strong> da Zion Lisboa?\n\nResponde: <strong>MEMBRO</strong> ou <strong>VISITANTE</strong>`,
        estadoCivil:   `💍 Qual é o teu <strong>estado civil</strong>?\n\nResponde: <strong>SOLTEIRO</strong>, <strong>CASADO</strong>, <strong>DIVORCIADO</strong> ou <strong>VIÚVO</strong>`,
        filhos:        `👶 Tens <strong>filhos</strong>?\n\nResponde: <strong>SIM</strong> ou <strong>NÃO</strong>`,
        ondeConheceu:  `🌐 Onde <strong>conheceste</strong> a Zion Lisboa?\n(Redes sociais, amigo, evento, já frequentava, outro...)`,
        tempoZion:     `⏳ Há quanto <strong>tempo</strong> acompanhas a Zion Lisboa?\n(Ex: 1 mês, 6 meses, 2 anos...)`,
        historia:      `📖 Conta-nos um pouco da tua <strong>história</strong>.\n\nPodes falar sobre quem és, o que te trouxe à Zion, como tem sido a tua caminhada com Deus... À vontade! 😊`,
        confirmacao:   (d) => `<p>✅ <strong>Obrigado, ${d.nome}!</strong></p><p>Os teus dados foram guardados com sucesso. A nossa equipa vai entrar em contacto em breve para te ajudar a juntar a um LINK.\n\nQue Deus te abençoe! ✝️</p>`,
    },
    en: {
        inicio:        `😊 Great! I'll need a few details to help you.\n\n👤 What is your <strong>full name</strong>?`,
        telefone:      `📞 What is your <strong>phone number</strong>?`,
        email:         `📧 What is your <strong>email</strong>?`,
        tipo:          `🙏 Are you a <strong>member</strong> or <strong>visitor</strong> of Zion Lisboa?\n\nReply: <strong>MEMBER</strong> or <strong>VISITOR</strong>`,
        estadoCivil:   `💍 What is your <strong>marital status</strong>?\n\nReply: <strong>SINGLE</strong>, <strong>MARRIED</strong>, <strong>DIVORCED</strong> or <strong>WIDOWED</strong>`,
        filhos:        `👶 Do you have <strong>children</strong>?\n\nReply: <strong>YES</strong> or <strong>NO</strong>`,
        ondeConheceu:  `🌐 How did you <strong>find out</strong> about Zion Lisboa?\n(Social media, friend, event, already attended, other...)`,
        tempoZion:     `⏳ How long have you been following Zion Lisboa?\n(e.g. 1 month, 6 months, 2 years...)`,
        historia:      `📖 Tell us a bit about your <strong>story</strong>.\n\nFeel free to share who you are, what brought you to Zion, how your walk with God has been... 😊`,
        confirmacao:   (d) => `<p>✅ <strong>Thank you, ${d.nome}!</strong></p><p>Your details have been saved successfully. Our team will get in touch soon to help you join a LINK.\n\nGod bless you! ✝️</p>`,
    },
    es: {
        inicio:        `😊 ¡Genial! Voy a necesitar algunos datos para ayudarte.\n\n👤 ¿Cuál es tu <strong>nombre completo</strong>?`,
        telefone:      `📞 ¿Cuál es tu <strong>número de teléfono</strong>?`,
        email:         `📧 ¿Cuál es tu <strong>email</strong>?`,
        tipo:          `🙏 ¿Eres <strong>miembro</strong> o <strong>visitante</strong> de Zion Lisboa?\n\nResponde: <strong>MIEMBRO</strong> o <strong>VISITANTE</strong>`,
        estadoCivil:   `💍 ¿Cuál es tu <strong>estado civil</strong>?\n\nResponde: <strong>SOLTERO</strong>, <strong>CASADO</strong>, <strong>DIVORCIADO</strong> o <strong>VIUDO</strong>`,
        filhos:        `👶 ¿Tienes <strong>hijos</strong>?\n\nResponde: <strong>SÍ</strong> o <strong>NO</strong>`,
        ondeConheceu:  `🌐 ¿Dónde <strong>conociste</strong> Zion Lisboa?\n(Redes sociales, amigo, evento, ya asistía, otro...)`,
        tempoZion:     `⏳ ¿Hace cuánto <strong>tiempo</strong> sigues Zion Lisboa?\n(Ej: 1 mes, 6 meses, 2 años...)`,
        historia:      `📖 Cuéntanos un poco de tu <strong>historia</strong>.\n\nPuedes hablar sobre quién eres, qué te trajo a Zion, cómo ha sido tu camino con Dios... ¡Con confianza! 😊`,
        confirmacao:   (d) => `<p>✅ <strong>¡Gracias, ${d.nome}!</strong></p><p>Tus datos han sido guardados con éxito. Nuestro equipo se pondrá en contacto contigo pronto para ayudarte a unirte a un LINK.\n\n¡Que Dios te bendiga! ✝️</p>`,
    },
    it: {
        inicio:        `😊 Ottimo! Avrò bisogno di alcuni dati per aiutarti.\n\n👤 Qual è il tuo <strong>nome completo</strong>?`,
        telefone:      `📞 Qual è il tuo <strong>numero di telefono</strong>?`,
        email:         `📧 Qual è la tua <strong>email</strong>?`,
        tipo:          `🙏 Sei un <strong>membro</strong> o un <strong>visitatore</strong> di Zion Lisboa?\n\nRispondi: <strong>MEMBRO</strong> o <strong>VISITATORE</strong>`,
        estadoCivil:   `💍 Qual è il tuo <strong>stato civile</strong>?\n\nRispondi: <strong>SINGLE</strong>, <strong>SPOSATO</strong>, <strong>DIVORZIATO</strong> o <strong>VEDOVO</strong>`,
        filhos:        `👶 Hai <strong>figli</strong>?\n\nRispondi: <strong>SÌ</strong> o <strong>NO</strong>`,
        ondeConheceu:  `🌐 Come hai <strong>conosciuto</strong> Zion Lisboa?\n(Social media, amico, evento, frequentavi già, altro...)`,
        tempoZion:     `⏳ Da quanto <strong>tempo</strong> segui Zion Lisboa?\n(Es: 1 mese, 6 mesi, 2 anni...)`,
        historia:      `📖 Raccontaci un po' della tua <strong>storia</strong>.\n\nParla pure di chi sei, cosa ti ha portato a Zion, com'è stato il tuo cammino con Dio... Sentiti libero! 😊`,
        confirmacao:   (d) => `<p>✅ <strong>Grazie, ${d.nome}!</strong></p><p>I tuoi dati sono stati salvati con successo. Il nostro team ti contatterà presto per aiutarti a unirti a un LINK.\n\nDio ti benedica! ✝️</p>`,
    },
};

// Ordem dos passos
const passos = ["inicio", "telefone", "email", "tipo", "estadoCivil", "filhos", "ondeConheceu", "tempoZion", "historia"];

// Campo salvo em cada passo (o que guarda quando responde)
const camposDoPasso = {
    inicio:       "nome",
    telefone:     "telefone",
    email:        "email",
    tipo:         "tipo",
    estadoCivil:  "estadoCivil",
    filhos:       "temFilhos",
    ondeConheceu: "ondeConheceu",
    tempoZion:    "tempoZion",
    historia:     "historia",
};

// ─────────────────────────────────────────────────────────────
// HANDLER
// ─────────────────────────────────────────────────────────────
export async function handleCadastroFlow(msg, lang, state, supabase, conversationId) {
    const tx = perguntas[lang] || perguntas.pt;

    // Início do fluxo
    if (state.step === "inicio") {
        return {
            reply: `<p>${tx.inicio}</p>`,
            newState: { flow: "cadastro", step: "aguarda_nome", data: state.data || {} }
        };
    }

    // Processa resposta do passo anterior e avança
    const stepAtual = state.step; // ex: "aguarda_nome"
    const passoNome = stepAtual.replace("aguarda_", ""); // ex: "nome"

    // Mapeia passo para campo
    const campoMap = {
        nome:        "nome",
        telefone:    "telefone",
        email:       "email",
        tipo:        "tipo",
        estadocivil: "estadoCivil",
        filhos:      "temFilhos",
        ondeconheceu:"ondeConheceu",
        tempozion:   "tempoZion",
        historia:    "historia",
    };

    const campo = campoMap[passoNome];
    if (!campo) return null;

    // Guarda a resposta atual
    const data = { ...(state.data || {}), [campo]: msg };

    // Determina próximo passo
    const passosOrdem = ["nome", "telefone", "email", "tipo", "estadocivil", "filhos", "ondeconheceu", "tempozion", "historia"];
    const idxAtual = passosOrdem.indexOf(passoNome);
    const proximoPasso = passosOrdem[idxAtual + 1];

    // Se ainda há passos → pergunta o próximo
    if (proximoPasso) {
        const perguntaKey = camposDoPasso[passos.find(p => camposDoPasso[p] === campoMap[proximoPasso] || camposDoPasso[p] === proximoPasso)] || proximoPasso;
        const perguntaTexto = tx[proximoPasso] || tx[perguntaKey];

        return {
            reply: `<p>${perguntaTexto}</p>`,
            newState: { flow: "cadastro", step: `aguarda_${proximoPasso}`, data }
        };
    }

    // Último passo preenchido → guarda no Supabase
    try {
        await supabase.from("leads").insert({
            conversation_id: conversationId,
            nome:           data.nome,
            telefone:       data.telefone,
            email:          data.email,
            zona:           data.zona || null,
            link_indicado:  data.linkIndicado || null,
            historia:       data.historia,
            onde_conheceu:  data.ondeConheceu,
            tempo_zion:     data.tempoZion,
            tipo:           normalizarTipo(data.tipo, lang),
            estado_civil:   data.estadoCivil,
            tem_filhos:     normalizarFilhos(data.temFilhos, lang),
        });
    } catch (err) {
        console.error("[cadastro-flow] Erro ao guardar lead:", err);
    }

    return {
        reply: `<p>${tx.confirmacao(data)}</p>`,
        newState: null // termina o fluxo
    };
}

// Normaliza o campo "tipo" para valores aceites na BD
function normalizarTipo(valor, lang) {
    const membro = { pt: ["membro"], en: ["member"], es: ["miembro"], it: ["membro"] };
    const v = (valor || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const lista = membro[lang] || membro.pt;
    return lista.some(m => v.includes(m)) ? "membro" : "visitante";
}

// Normaliza o campo "tem_filhos" para booleano
function normalizarFilhos(valor, lang) {
    const sim = { pt: ["sim", "s"], en: ["yes", "y"], es: ["si", "sí", "s"], it: ["si", "sì", "s"] };
    const v = (valor || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const lista = sim[lang] || sim.pt;
    return lista.some(s => v.includes(s));
}