require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

// Mensagem inicial Bem vindo
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

    // ── Gerais ──────────────────────────────

    "visao": `
<p>🌍 <strong>Visão da Zion Church</strong></p>
<p>Formar discípulos e líderes que manifestam o Reino de Deus para transformar a Terra, através do amor de Cristo, verdade da Palavra e poder do Espírito Santo.</p>
`,

    "valores da zion": `
<p>💛 <strong>Valores da Zion Church</strong></p>
<p><strong>Intimidade com Deus</strong><br>
Buscar a presença de Deus é algo prioritário em nossas vidas. Um estilo de vida de adoração, oração e leitura da palavra de Deus é a base para a intimidade com o nosso Deus. Manifestamos em público o que somos no secreto.</p>
<p><em>Mt 6.6 | Sl 27.4 | Sl 63.1-8 | Lc 7.37-38 | II Cor 3:18</em></p>
`,

    "cultos": `
<p>⛪ <strong>Nossos Cultos</strong></p>
<p>Os cultos acontecem aos <strong>domingos</strong>:<br>
⏰ 10h às 13h<br>
⏰ 17h às 21h</p>
<p>Será uma alegria receber você na Zion Church Lisboa 🙌</p>
<p>Se precisar da localização, digite <strong>LOCALIZAÇÃO</strong>.</p>
`,

    "localizacao": `
<p>📍 <strong>Campus Lisboa</strong></p>
<p>Rua do Centro Cultural, 11<br>
1700-036 Alvalade — Lisboa, Portugal</p>
<p>Se quiser saber os horários dos cultos, digite <strong>CULTOS</strong> 😊</p>
`,

    "dizimos": `
<p>💰 <strong>Dízimos e Ofertas</strong></p>
<p>Contribuições voluntárias que sustentam os ministérios e obras da igreja, permitindo que o Reino de Deus continue sendo expandido em Lisboa e ao redor do mundo.</p>
`,

    "caridade": `
<p>❤️ <strong>Caridade</strong></p>
<p>A Zion Church acredita no cuidado com o próximo. Desenvolvemos projetos sociais para apoiar quem mais precisa, expressando o amor de Cristo de forma prática na nossa comunidade.</p>
`,

    "keola": `
<p>☕ <strong>KEOLA — Lanchonete</strong></p>
<p>A KEOLA é o nosso espaço de convivência e comunhão. Um lugar para tomar um café, criar conexões e fortalecer os laços da comunidade Zion.</p>
`,

    "zao": `
<p>🤝 <strong>ZAO — Instituto Bíblico</strong></p>
<p>O Instituto Bíblico ZAO convida você a embarcar em uma jornada de transformação e aprofundamento no conhecimento e compreensão da Bíblia e de Seu divino Autor.</p>
<p>Seja para fortalecer sua caminhada com Deus ou para enriquecer sua comunidade com ensinos profundos e aplicáveis, nossos cursos são desenhados para <strong>todos os corações sedentos por mais</strong>.</p>
`,

    "links": `
<p>🔗 <strong>LINKs — Grupos de Conexão</strong></p>
<p>Os LINKs são grupos que se reúnem como família nos lares, buscando a presença de Deus e compartilhando testemunhos de forma presencial ou online. Neste ambiente a cultura do reino é desenvolvida e a vida cristã é encorajada de forma intencional.</p>
<p>Os grupos são organizados por faixa etária:<br>
• Rise (12 a 14 anos)<br>
• Flow (15 a 18 anos)<br>
• Vox (18 a 26 anos)<br>
• Eklektos (27 a 39 anos)<br>
• Famílias</p>
<p>Use nossa plataforma para escolher um LINK e se conectar! 😊</p>
`,

    // ── Ministérios ─────────────────────────

    "lumen": `
<p>✨ <strong>LUMEN — Ministério Infantil</strong></p>
<p>Lumen é o ministério infantil da Zion Church. Existimos para formar crianças à luz da Palavra de Deus, firmadas na verdade de Cristo e sensíveis à atuação do Espírito Santo, crendo que elas são chamadas a refletir a luz de Jesus em sua geração.</p>
`,

    "rise": `
<p>🔥 <strong>RISE — 12 a 14 anos</strong></p>
<p>Ministério da Zion Church focado em adolescentes de 12 a 14 anos. É nossa missão ver adolescentes sendo formados no olho do furacão do avivamento, com suas identidades forjadas no caráter de Cristo, cheios do Poder do Espírito Santo, levando o Reino dos Céus para a sociedade a sua volta.</p>
`,

    "flow": `
<p>🌊 <strong>FLOW — 15 a 17 anos</strong></p>
<p>Flow é o ministério da Zion Church focado em jovens adolescentes de 15 a 17 anos. Acreditamos em uma geração de filhos que se levanta como líderes para trazer transformação e revolução dentro das suas escolas.</p>
`,

    "vox": `
<p>🎤 <strong>VOX — 18 a 29 anos</strong></p>
<p>O Vox é um ministério de jovens adultos de 18 a 29 anos, que são compromissados a marcarem a sua geração. A palavra "vox" significa voz no latim. O intuito deste grupo é justamente ser uma voz que anuncia as boas novas do Reino e demonstra o poder e amor de Deus.</p>
`,

    "eklektos": `
<p>👑 <strong>EKLEKTOS — 29 a 39 anos</strong></p>
<p>A palavra "Eklektos" significa <em>escolhidos</em>, no grego. O Eklektos é o ministério de jovens de 29 a 39 anos da Zion Church, que acredita que serão capacitados para trazer o Reino de Deus nas esferas da sociedade, através de famílias e indivíduos que manifestam a luz e o poder de Cristo.</p>
`,

    "diamante": `
<p>💎 <strong>DIAMANTE — 60+ anos</strong></p>
<p>O Ministério Diamante é um ministério da Zion Church cujos participantes são de acima de 60 anos de idade. Um espaço de honra, comunhão e fé para quem tem muito a contribuir com a comunidade.</p>
`,

    "raizes": `
<p>🌱 <strong>RAÍZES — Processo de Membresia</strong></p>
<p>É o processo de membresia da Zion Church. No Processo Raízes você aprenderá os fundamentos vivos da nossa igreja, a nossa missão, visão, quais os valores que compõem nossa cultura, nosso histórico, e poderá acelerar o engajamento com outros membros e líderes da casa.</p>
`,

    "jornada": `
<p>🚶 <strong>JORNADA — Novos Convertidos</strong></p>
<p>Jornada é o ministério que acolhe, ajuda e orienta os novos convertidos a darem seus primeiros passos na jornada com Cristo, após o novo nascimento, auxiliando também na integração dentro da Zion Church. Seu objetivo é gerar conhecimento, crescimento e conexão.</p>
`,

    "por um legado": `
<p>🏛️ <strong>POR UM LEGADO — Expansão do Reino</strong></p>
<p>Por Um Legado é um compromisso pessoal com a expansão do Reino de Deus por meio da Zion Church. Este é o verdadeiro desdobramento de uma história de mais de 40 anos do que Deus tem feito em nosso meio tanto física, quanto espiritualmente.</p>
`,

    "missoes": `
<p>🌎 <strong>MISSÕES — Ao Redor do Mundo</strong></p>
<p>A Zion Church coopera com o que o Senhor tem feito ao redor do mundo, dando suporte financeiro e espiritual a organizações missionárias e iniciativas de justiça social. Estas parcerias são definidas anualmente com diferentes instituições.</p>
`,

    "altomonte": `
<p>🎵 <strong>ALTOMONTE MUSIC — Ministério de Louvor</strong></p>
<p>Altomonte Music é o ministério de Louvor e Adoração da Zion Church. Existe para exaltar e fazer conhecido o nome de Deus. Nosso sonho é ver todos os reinos deste mundo adorando, em espírito e em verdade, ao único Rei dos Reis: Jesus Cristo.</p>
`,

};

app.post("/chat", async (req, res) => {
    const { message, conversationId } = req.body;
    let convId = conversationId;

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

    // Normalizar mensagem
    const msg = message
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();

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

    res.json({ reply, conversationId: convId });
});

app.listen(process.env.PORT, () => {
    console.log("Servidor rodando na porta " + process.env.PORT + " 🚀");
});