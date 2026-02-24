import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Mensagem inicial Bem-vindo
const welcomeMessage = `
<p>Bem-vindo à <strong>Zion Church Lisboa</strong> 🙌</p>
<p>É uma grande alegria ter você aqui! ❤️</p>
<p>Somos liderados pelo <strong>Pastor Eddie Nunes</strong> e sua esposa <strong>Kristin Nunes</strong>, e estamos prontos para receber você e sua família com muito amor e cuidado.</p>
<p>📖 <strong>Nosso lema:</strong><br>
"Nem por força, nem por violência, mas pelo favor de Deus" (Zacarias 4:6)</p>
<p>📅 <strong>Nossos cultos:</strong><br>
Domingos das 10h às 13h<br>
Domingos das 17h às 21h</p>
<p>Para facilitar, responda com uma das palavras abaixo 👇</p>
<p>
📌 <strong>Informações Gerais</strong><br>
— VISÃO &nbsp;|&nbsp; VALORES DA ZION &nbsp;|&nbsp; CULTOS &nbsp;|&nbsp; LOCALIZAÇÃO &nbsp;|&nbsp; LINKS &nbsp;|&nbsp; DÍZIMOS &nbsp;|&nbsp; CARIDADE &nbsp;|&nbsp; KEOLA &nbsp;|&nbsp; ZAO
</p>
<p>
🙏 <strong>Ministérios</strong><br>
— LUMEN <em>(Crianças)</em><br>
— RISE <em>(12 a 14 anos)</em><br>
— FLOW <em>(15 a 17 anos)</em><br>
— VOX <em>(18 a 29 anos)</em><br>
— EKLEKTOS <em>(29 a 39 anos)</em><br>
— DIAMANTE <em>(60+)</em><br>
— RAÍZES <em>(Processo de Membresia)</em><br>
— JORNADA <em>(Novos Convertidos)</em><br>
— POR UM LEGADO <em>(Expansão do Reino)</em><br>
— MISSÕES <em>(Ao Redor do Mundo)</em><br>
— ALTOMONTE <em>(Ministério de Louvor)</em>
</p>
<p>Assim conseguimos te ajudar mais rápido 😊</p>
`;

const responses = {
  "visao": `<p>🌍 <strong>Visão da Zion Church</strong><br>Formar discípulos e líderes...</p>`,
  "valores da zion": `<p>💛 <strong>Valores da Zion Church</strong><br>Intimidade com Deus...</p>`,
  "cultos": `<p>⛪ <strong>Nossos Cultos</strong><br>Domingos 10h-13h / 17h-21h</p>`,
  "localizacao": `<p>📍 <strong>Campus Lisboa</strong><br>Rua do Centro Cultural, 11</p>`,
  "dizimos": `<p>💰 <strong>Dízimos e Ofertas</strong><br>Contribuições voluntárias...</p>`,
  "caridade": `<p>❤️ <strong>Caridade</strong><br>Projetos sociais para apoiar quem precisa...</p>`,
  "keola": `<p>☕ <strong>KEOLA — Lanchonete</strong><br>Espaço de convivência e comunhão...</p>`,
  "zao": `<p>🤝 <strong>ZAO — Instituto Bíblico</strong><br>Jornada de transformação e aprofundamento...</p>`,
  "links": `<p>🔗 <strong>LINKs — Grupos de Conexão</strong><br>Grupos familiares para presença de Deus...</p>`,
  "lumen": `<p>✨ <strong>LUMEN — Ministério Infantil</strong></p>`,
  "rise": `<p>🔥 <strong>RISE — 12 a 14 anos</strong></p>`,
  "flow": `<p>🌊 <strong>FLOW — 15 a 17 anos</strong></p>`,
  "vox": `<p>🎤 <strong>VOX — 18 a 29 anos</strong></p>`,
  "eklektos": `<p>👑 <strong>EKLEKTOS — 29 a 39 anos</strong></p>`,
  "diamante": `<p>💎 <strong>DIAMANTE — 60+ anos</strong></p>`,
  "raizes": `<p>🌱 <strong>RAÍZES — Processo de Membresia</strong></p>`,
  "jornada": `<p>🚶 <strong>JORNADA — Novos Convertidos</strong></p>`,
  "por um legado": `<p>🏛️ <strong>POR UM LEGADO — Expansão do Reino</strong></p>`,
  "missoes": `<p>🌎 <strong>MISSÕES — Ao Redor do Mundo</strong></p>`,
  "altomonte": `<p>🎵 <strong>ALTOMONTE MUSIC — Ministério de Louvor</strong></p>`,
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).send("Only POST requests allowed");
    return;
  }

  const { message, conversationId } = req.body;
  let convId = conversationId;

  try {
    // Se não houver conversationId, cria no Supabase
    if (!convId) {
      const { data } = await supabase
        .from("conversations")
        .insert({})
        .select()
        .single();
      convId = data.id;
    }

    // Salva mensagem do usuário
    await supabase.from("messages").insert({
      conversation_id: convId,
      role: "user",
      content: message
    });

    // Normaliza mensagem
    const msg = message
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

    // Escolhe resposta
    let reply;
    if (msg === "oi" || msg === "ola" || msg === "oi!" || msg === "ola!" || msg === "olá" || msg === "oii") {
      reply = welcomeMessage;
    } else if (responses[msg]) {
      reply = responses[msg];
    } else {
      reply = "🤔 Não entendi. Digite 'oi' para ver o menu da Zion Church.";
    }

    // Salva resposta do bot
    await supabase.from("messages").insert({
      conversation_id: convId,
      role: "bot",
      content: reply
    });

    res.status(200).json({ reply, conversationId: convId });
  } catch (error) {
    console.error("Erro no chat:", error);
    res.status(500).json({ reply: "Desculpa, houve um erro de ligação. Tenta novamente." });
  }
}
