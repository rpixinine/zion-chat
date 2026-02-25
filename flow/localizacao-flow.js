// flows/localizacao-flow.js
// ─────────────────────────────────────────────────────────────
// Responde com endereço, mapa e horários de culto
// Lê tudo da tabela configuracoes e cultos do Supabase
// ─────────────────────────────────────────────────────────────

// ── Textos da UI por idioma ───────────────────────────────
const t = {
    pt: {
        titulo:       `📍 <strong>Como Chegar à Zion Lisboa</strong>`,
        endereco:     `🏠 <strong>Endereço</strong>`,
        mapa:         `🗺️ Ver no Google Maps`,
        cultos:       `⛪ <strong>Horários dos Cultos</strong>`,
        sabado:       `Sábado`,
        domingo:      `Domingo`,
        segunda:      `Segunda-feira`,
        terca:        `Terça-feira`,
        quarta:       `Quarta-feira`,
        quinta:       `Quinta-feira`,
        sexta:        `Sexta-feira`,
        dica:         `\n\nSe precisares de mais informações escreve <strong>OI</strong> para voltar ao menu 😊`,
        erro:         `<p>Não consegui carregar a localização. Tenta novamente em breve 😊</p>`,
    },
    en: {
        titulo:       `📍 <strong>How to Get to Zion Lisboa</strong>`,
        endereco:     `🏠 <strong>Address</strong>`,
        mapa:         `🗺️ View on Google Maps`,
        cultos:       `⛪ <strong>Service Times</strong>`,
        sabado:       `Saturday`,
        domingo:      `Sunday`,
        segunda:      `Monday`,
        terca:        `Tuesday`,
        quarta:       `Wednesday`,
        quinta:       `Thursday`,
        sexta:        `Friday`,
        dica:         `\n\nFor more information type <strong>HI</strong> to go back to the menu 😊`,
        erro:         `<p>Could not load location. Please try again shortly 😊</p>`,
    },
    es: {
        titulo:       `📍 <strong>Cómo Llegar a Zion Lisboa</strong>`,
        endereco:     `🏠 <strong>Dirección</strong>`,
        mapa:         `🗺️ Ver en Google Maps`,
        cultos:       `⛪ <strong>Horarios de Cultos</strong>`,
        sabado:       `Sábado`,
        domingo:      `Domingo`,
        segunda:      `Lunes`,
        terca:        `Martes`,
        quarta:       `Miércoles`,
        quinta:       `Jueves`,
        sexta:        `Viernes`,
        dica:         `\n\nPara más información escribe <strong>HOLA</strong> para volver al menú 😊`,
        erro:         `<p>No se pudo cargar la ubicación. Inténtalo de nuevo pronto 😊</p>`,
    },
    it: {
        titulo:       `📍 <strong>Come Arrivare a Zion Lisboa</strong>`,
        endereco:     `🏠 <strong>Indirizzo</strong>`,
        mapa:         `🗺️ Vedi su Google Maps`,
        cultos:       `⛪ <strong>Orari dei Culti</strong>`,
        sabado:       `Sabato`,
        domingo:      `Domenica`,
        segunda:      `Lunedì`,
        terca:        `Martedì`,
        quarta:       `Mercoledì`,
        quinta:       `Giovedì`,
        sexta:        `Venerdì`,
        dica:         `\n\nPer maggiori informazioni scrivi <strong>CIAO</strong> per tornare al menu 😊`,
        erro:         `<p>Impossibile caricare la posizione. Riprova a breve 😊</p>`,
    },
};

// ── Traduz dia_semana do PT para o idioma ─────────────────
function traduzDia(dia, lang) {
    const tx = t[lang] || t.pt;
    const map = {
        "domingo":    tx.domingo,
        "sabado":     tx.sabado,
        "segunda":    tx.segunda,
        "terca":      tx.terca,
        "quarta":     tx.quarta,
        "quinta":     tx.quinta,
        "sexta":      tx.sexta,
    };
    return map[dia?.toLowerCase()] || dia;
}

// ── Formata hora HH:MM:SS → HH:MM ─────────────────────────
function formatHora(hora) {
    if (!hora) return "";
    return hora.substring(0, 5).replace(":", "h");
}

// ── Busca configurações do Supabase ──────────────────────
async function getConfig(supabase, chaves) {
    const { data } = await supabase
        .from("configuracoes")
        .select("chave, valor")
        .in("chave", chaves);
    if (!data) return {};
    return data.reduce((acc, row) => ({ ...acc, [row.chave]: row.valor }), {});
}

// ── Busca cultos ativos do Supabase ───────────────────────
async function getCultos(supabase) {
    const { data } = await supabase
        .from("cultos")
        .select("nome, dia_semana, hora_inicio, hora_fim")
        .eq("ativo", true)
        .eq("recorrente", true)
        .order("dia_semana")
        .order("hora_inicio");
    return data || [];
}

// ── Keywords que ativam este flow ────────────────────────
const keywords = {
    pt: ["localizacao", "onde fica", "endereco", "como chegar", "morada", "mapa"],
    en: ["location", "where", "address", "how to get", "map", "directions"],
    es: ["ubicacion", "donde", "direccion", "como llegar", "mapa"],
    it: ["posizione", "dove", "indirizzo", "come arrivare", "mappa"],
};

export function isLocalizacaoRequest(msg, lang) {
    const list = keywords[lang] || keywords.pt;
    return list.some(k => msg.includes(k));
}

// ─────────────────────────────────────────────────────────
// HANDLER PRINCIPAL
// ─────────────────────────────────────────────────────────
export async function handleLocalizacaoFlow(lang, supabase) {
    const tx = t[lang] || t.pt;

    try {
        // Busca endereço e cultos em paralelo
        const [config, cultos] = await Promise.all([
            getConfig(supabase, ["endereco", "codigo_postal", "cidade", "maps_url"]),
            getCultos(supabase),
        ]);

        // ── Endereço ─────────────────────────────────────────
        let html = `<p>${tx.titulo}</p>`;
        html += `<p>${tx.endereco}<br>`;
        html += `${config.endereco || ""}<br>`;
        html += `${config.codigo_postal || ""} ${config.cidade || ""}</p>`;

        if (config.maps_url) {
            html += `<p><a href="${config.maps_url}" target="_blank">📌 ${tx.mapa}</a></p>`;
        }

        // ── Cultos ───────────────────────────────────────────
        if (cultos.length > 0) {
            html += `<p>${tx.cultos}</p>`;

            // Agrupa por dia
            const porDia = cultos.reduce((acc, c) => {
                const dia = traduzDia(c.dia_semana, lang);
                if (!acc[dia]) acc[dia] = [];
                acc[dia].push(c);
                return acc;
            }, {});

            html += `<p>`;
            Object.entries(porDia).forEach(([dia, lista]) => {
                html += `📅 <strong>${dia}</strong><br>`;
                lista.forEach(c => {
                    html += `⏰ ${c.nome} — ${formatHora(c.hora_inicio)} às ${formatHora(c.hora_fim)}<br>`;
                });
            });
            html += `</p>`;
        }

        html += `<p>${tx.dica}</p>`;
        return html;

    } catch (err) {
        console.error("[localizacao-flow] Erro:", err);
        return tx.erro;
    }
}