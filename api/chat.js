import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

// ─────────────────────────────────────────
// CLIENTES — lê direto das variáveis de ambiente do Vercel
// ─────────────────────────────────────────
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// ─────────────────────────────────────────
// SAUDAÇÕES por idioma
// ─────────────────────────────────────────
const greetings = {
  pt: new Set(["oi", "ola", "oi!", "ola!", "oii", "hey", "oi tudo bem", "bom dia", "boa tarde", "boa noite", "hello", "hi"]),
  en: new Set(["hi", "hello", "hey", "good morning", "good afternoon", "good evening", "howdy"]),
  es: new Set(["hola", "hola!", "hey", "buenos dias", "buenas tardes", "buenas noches", "buenas", "hi", "hello"]),
  it: new Set(["ciao", "ciao!", "salve", "buongiorno", "buonasera", "buonanotte", "hey", "hi", "hello"]),
};

// ─────────────────────────────────────────
// SYSTEM PROMPTS por idioma
// ─────────────────────────────────────────
const systemPrompts = {
  pt: `Você é um assistente virtual da Zion Church Lisboa, amigável, acolhedor e cristão.
Responda sempre em português europeu.
Fale sobre a igreja, cultos, ministérios, fé e assuntos relacionados.
Se a pergunta for totalmente fora do contexto da igreja, redirecione gentilmente para os tópicos da Zion Church.
Nunca invente informações sobre datas, eventos ou pessoas.
Responda de forma curta e direta (máximo 3 parágrafos).`,
  en: `You are a friendly, welcoming and Christian virtual assistant for Zion Church Lisboa.
Always respond in British English.
Talk about the church, services, ministries, faith and related topics.
If the question is completely outside the church context, gently redirect.
Never make up information about dates, events or people.
Keep responses short and direct (maximum 3 paragraphs).`,
  es: `Eres un asistente virtual amigable y cristiano de Zion Church Lisboa.
Responde siempre en español.
Habla sobre la iglesia, cultos, ministerios, fe y temas relacionados.
Si la pregunta está fuera del contexto de la iglesia, redirige amablemente.
Nunca inventes información sobre fechas, eventos o personas.
Respuestas cortas y directas (máximo 3 párrafos).`,
  it: `Sei un assistente virtuale amichevole e cristiano di Zion Church Lisboa.
Rispondi sempre in italiano.
Parla della chiesa, dei culti, dei ministeri, della fede e di argomenti correlati.
Se la domanda è completamente fuori dal contesto della chiesa, reindirizza gentilmente.
Non inventare mai informazioni su date, eventi o persone.
Risposte brevi e dirette (massimo 3 paragrafi).`,
};

// ─────────────────────────────────────────
// MENSAGENS DE BOAS-VINDAS por idioma
// ─────────────────────────────────────────
const welcomeMessages = {
  pt: `
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
`,

  en: `
<p>Welcome to <strong>Zion Church Lisboa</strong> 🙌</p>
<p>We are so glad you are here! ❤️</p>
<p>We are led by <strong>Pastor Eddie Nunes</strong> and his wife <strong>Kristin Nunes</strong>, and we are ready to welcome you and your family with love and care.</p>
<p>📖 <strong>Our motto:</strong><br>
"Not by might, nor by power, but by the grace of God" (Zechariah 4:6)</p>
<p>📅 <strong>Our services:</strong><br>
Sundays from 10am to 1pm<br>
Sundays from 5pm to 9pm</p>
<p>Reply with one of the words below to get started 👇</p>
<p>
📌 <strong>General Info</strong><br>
— VISION &nbsp;|&nbsp; VALUES &nbsp;|&nbsp; SERVICES &nbsp;|&nbsp; LOCATION &nbsp;|&nbsp; LINKS &nbsp;|&nbsp; TITHES &nbsp;|&nbsp; CHARITY &nbsp;|&nbsp; KEOLA &nbsp;|&nbsp; ZAO
</p>
<p>
🙏 <strong>Ministries</strong><br>
— LUMEN <em>(Children)</em><br>
— RISE <em>(12 to 14 years)</em><br>
— FLOW <em>(15 to 17 years)</em><br>
— VOX <em>(18 to 29 years)</em><br>
— EKLEKTOS <em>(29 to 39 years)</em><br>
— DIAMANTE <em>(60+)</em><br>
— ROOTS <em>(Membership Process)</em><br>
— JOURNEY <em>(New Believers)</em><br>
— LEGACY <em>(Kingdom Expansion)</em><br>
— MISSIONS <em>(Around the World)</em><br>
— ALTOMONTE <em>(Worship Ministry)</em>
</p>
<p>We look forward to helping you 😊</p>
`,

  es: `
<p>¡Bienvenido a <strong>Zion Church Lisboa</strong>! 🙌</p>
<p>¡Es una gran alegría tenerte aquí! ❤️</p>
<p>Somos liderados por el <strong>Pastor Eddie Nunes</strong> y su esposa <strong>Kristin Nunes</strong>, y estamos listos para recibirte a ti y a tu familia con mucho amor y cuidado.</p>
<p>📖 <strong>Nuestro lema:</strong><br>
"No con ejército, ni con fuerza, sino con mi Espíritu" (Zacarías 4:6)</p>
<p>📅 <strong>Nuestros cultos:</strong><br>
Domingos de 10h a 13h<br>
Domingos de 17h a 21h</p>
<p>Para facilitar, responde con una de las palabras de abajo 👇</p>
<p>
📌 <strong>Información General</strong><br>
— VISIÓN &nbsp;|&nbsp; VALORES &nbsp;|&nbsp; CULTOS &nbsp;|&nbsp; UBICACIÓN &nbsp;|&nbsp; LINKS &nbsp;|&nbsp; DIEZMOS &nbsp;|&nbsp; CARIDAD &nbsp;|&nbsp; KEOLA &nbsp;|&nbsp; ZAO
</p>
<p>
🙏 <strong>Ministerios</strong><br>
— LUMEN <em>(Niños)</em><br>
— RISE <em>(12 a 14 años)</em><br>
— FLOW <em>(15 a 17 años)</em><br>
— VOX <em>(18 a 29 años)</em><br>
— EKLEKTOS <em>(29 a 39 años)</em><br>
— DIAMANTE <em>(60+)</em><br>
— RAÍCES <em>(Proceso de Membresía)</em><br>
— JORNADA <em>(Nuevos Creyentes)</em><br>
— LEGADO <em>(Expansión del Reino)</em><br>
— MISIONES <em>(Por Todo el Mundo)</em><br>
— ALTOMONTE <em>(Ministerio de Alabanza)</em>
</p>
<p>¡Así podemos ayudarte más rápido 😊!</p>
`,

  it: `
<p>Benvenuto a <strong>Zion Church Lisboa</strong>! 🙌</p>
<p>Siamo così felici che tu sia qui! ❤️</p>
<p>Siamo guidati dal <strong>Pastore Eddie Nunes</strong> e sua moglie <strong>Kristin Nunes</strong>, e siamo pronti ad accogliere te e la tua famiglia con molto amore e cura.</p>
<p>📖 <strong>Il nostro motto:</strong><br>
"Non con forza né con potenza, ma con il mio Spirito" (Zaccaria 4:6)</p>
<p>📅 <strong>I nostri culti:</strong><br>
Domeniche dalle 10:00 alle 13:00<br>
Domeniche dalle 17:00 alle 21:00</p>
<p>Per facilitare, rispondi con una delle parole qui sotto 👇</p>
<p>
📌 <strong>Informazioni Generali</strong><br>
— VISIONE &nbsp;|&nbsp; VALORI &nbsp;|&nbsp; CULTI &nbsp;|&nbsp; POSIZIONE &nbsp;|&nbsp; LINKS &nbsp;|&nbsp; DECIME &nbsp;|&nbsp; CARITÀ &nbsp;|&nbsp; KEOLA &nbsp;|&nbsp; ZAO
</p>
<p>
🙏 <strong>Ministeri</strong><br>
— LUMEN <em>(Bambini)</em><br>
— RISE <em>(12 a 14 anni)</em><br>
— FLOW <em>(15 a 17 anni)</em><br>
— VOX <em>(18 a 29 anni)</em><br>
— EKLEKTOS <em>(29 a 39 anni)</em><br>
— DIAMANTE <em>(60+)</em><br>
— RADICI <em>(Processo di Appartenenza)</em><br>
— CAMMINO <em>(Nuovi Credenti)</em><br>
— EREDITÀ <em>(Espansione del Regno)</em><br>
— MISSIONI <em>(In Tutto il Mondo)</em><br>
— ALTOMONTE <em>(Ministero di Lode)</em>
</p>
<p>Così possiamo aiutarti più velocemente 😊</p>
`,
};

// ─────────────────────────────────────────
// RESPOSTAS FIXAS por idioma
// ─────────────────────────────────────────
const responses = {

  // ── PORTUGUÊS ──────────────────────────
  pt: {
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
  },

  // ── ENGLISH ────────────────────────────
  en: {
    "vision": `
<p>🌍 <strong>Zion Church Vision</strong></p>
<p>To form disciples and leaders who manifest the Kingdom of God to transform the Earth, through the love of Christ, the truth of the Word and the power of the Holy Spirit.</p>
`,
    "values": `
<p>💛 <strong>Zion Church Values</strong></p>
<p><strong>Intimacy with God</strong><br>
Seeking God's presence is a priority in our lives. A lifestyle of worship, prayer and reading the Word of God is the foundation of our intimacy with Him. We manifest in public what we are in secret.</p>
<p><em>Mt 6:6 | Ps 27:4 | Ps 63:1-8 | Lk 7:37-38 | 2 Cor 3:18</em></p>
`,
    "services": `
<p>⛪ <strong>Our Services</strong></p>
<p>Services take place on <strong>Sundays</strong>:<br>
⏰ 10am to 1pm<br>
⏰ 5pm to 9pm</p>
<p>We would love to welcome you at Zion Church Lisboa 🙌</p>
<p>For directions, type <strong>LOCATION</strong>.</p>
`,
    "location": `
<p>📍 <strong>Lisboa Campus</strong></p>
<p>Rua do Centro Cultural, 11<br>
1700-036 Alvalade — Lisboa, Portugal</p>
<p>To check service times, type <strong>SERVICES</strong> 😊</p>
`,
    "tithes": `
<p>💰 <strong>Tithes & Offerings</strong></p>
<p>Voluntary contributions that sustain the church's ministries and works, allowing the Kingdom of God to continue expanding in Lisboa and around the world.</p>
`,
    "charity": `
<p>❤️ <strong>Charity</strong></p>
<p>Zion Church believes in caring for others. We develop social projects to support those most in need, expressing the love of Christ in a practical way in our community.</p>
`,
    "keola": `
<p>☕ <strong>KEOLA — Café & Community</strong></p>
<p>KEOLA is our fellowship and community space. A place to grab a coffee, make connections and strengthen the bonds of the Zion community.</p>
`,
    "zao": `
<p>🤝 <strong>ZAO — Biblical Institute</strong></p>
<p>The ZAO Biblical Institute invites you to embark on a journey of transformation and deeper understanding of the Bible and its divine Author.</p>
<p>Our courses are designed for <strong>all hearts hungry for more</strong>.</p>
`,
    "links": `
<p>🔗 <strong>LINKs — Connection Groups</strong></p>
<p>LINKs are groups that gather as family in homes, seeking God's presence and sharing testimonies in person or online. In this environment the culture of the kingdom is developed and the Christian life is intentionally encouraged.</p>
<p>Groups by age:<br>
• Rise (12–14) • Flow (15–18) • Vox (18–26) • Eklektos (27–39) • Families</p>
<p>Use our platform to find a LINK and connect! 😊</p>
`,
    "lumen": `
<p>✨ <strong>LUMEN — Children's Ministry</strong></p>
<p>Lumen is Zion Church's children's ministry. We exist to raise children in the light of God's Word, grounded in the truth of Christ and sensitive to the Holy Spirit, believing they are called to reflect the light of Jesus in their generation.</p>
`,
    "rise": `
<p>🔥 <strong>RISE — 12 to 14 years</strong></p>
<p>A ministry of Zion Church for teenagers aged 12 to 14. Our mission is to see teenagers formed in the heart of revival, with their identities forged in the character of Christ, filled with the Power of the Holy Spirit, carrying the Kingdom of Heaven to the society around them.</p>
`,
    "flow": `
<p>🌊 <strong>FLOW — 15 to 17 years</strong></p>
<p>Flow is Zion Church's ministry for teenagers aged 15 to 17. We believe in a generation rising as leaders to bring transformation and revolution into their schools.</p>
`,
    "vox": `
<p>🎤 <strong>VOX — 18 to 29 years</strong></p>
<p>Vox is a young adults ministry for those aged 18 to 29, committed to marking their generation. "Vox" means voice in Latin — to be a voice that announces the good news of the Kingdom and demonstrates God's power and love.</p>
`,
    "eklektos": `
<p>👑 <strong>EKLEKTOS — 29 to 39 years</strong></p>
<p>"Eklektos" means <em>chosen</em> in Greek. A ministry for 29 to 39 year-olds, equipped to bring the Kingdom of God into the spheres of society through families and individuals who manifest the light and power of Christ.</p>
`,
    "diamante": `
<p>💎 <strong>DIAMANTE — 60+ years</strong></p>
<p>The Diamante Ministry is for members aged 60 and above. A space of honour, fellowship and faith for those who have much to contribute to the community.</p>
`,
    "roots": `
<p>🌱 <strong>ROOTS — Membership Process</strong></p>
<p>In Roots you will learn the living foundations of our church — our mission, vision, values and history — and accelerate your connection with other members and leaders of the house.</p>
`,
    "journey": `
<p>🚶 <strong>JOURNEY — New Believers</strong></p>
<p>Journey welcomes, helps and guides new believers in their first steps with Christ, after the new birth, also supporting their integration into Zion Church. Its goal is to generate knowledge, growth and connection.</p>
`,
    "legacy": `
<p>🏛️ <strong>LEGACY — Kingdom Expansion</strong></p>
<p>Legacy is a personal commitment to the expansion of the Kingdom of God through Zion Church — the unfolding of a 40-year history of what God has done among us, both physically and spiritually.</p>
`,
    "missions": `
<p>🌎 <strong>MISSIONS — Around the World</strong></p>
<p>Zion Church cooperates with what God is doing around the world, providing financial and spiritual support to missionary organisations and social justice initiatives. These partnerships are defined annually with different institutions.</p>
`,
    "altomonte": `
<p>🎵 <strong>ALTOMONTE MUSIC — Worship Ministry</strong></p>
<p>Altomonte Music exists to exalt and make known the name of God. Our dream is to see all the kingdoms of this world worshipping, in spirit and in truth, the one King of Kings: Jesus Christ.</p>
`,
  },

  // ── ESPAÑOL ────────────────────────────
  es: {
    "vision": `
<p>🌍 <strong>Visión de Zion Church</strong></p>
<p>Formar discípulos y líderes que manifiestan el Reino de Dios para transformar la Tierra, a través del amor de Cristo, la verdad de la Palabra y el poder del Espíritu Santo.</p>
`,
    "valores": `
<p>💛 <strong>Valores de Zion Church</strong></p>
<p><strong>Intimidad con Dios</strong><br>
Buscar la presencia de Dios es una prioridad en nuestras vidas. Un estilo de vida de adoración, oración y lectura de la Palabra es la base de nuestra intimidad con Él. Manifestamos en público lo que somos en secreto.</p>
<p><em>Mt 6:6 | Sal 27:4 | Sal 63:1-8 | Lc 7:37-38 | 2 Cor 3:18</em></p>
`,
    "cultos": `
<p>⛪ <strong>Nuestros Cultos</strong></p>
<p>Los cultos se celebran los <strong>domingos</strong>:<br>
⏰ De 10h a 13h<br>
⏰ De 17h a 21h</p>
<p>¡Será una alegría recibirte en Zion Church Lisboa 🙌!</p>
<p>Si necesitas la ubicación, escribe <strong>UBICACIÓN</strong>.</p>
`,
    "ubicacion": `
<p>📍 <strong>Campus Lisboa</strong></p>
<p>Rua do Centro Cultural, 11<br>
1700-036 Alvalade — Lisboa, Portugal</p>
<p>Para conocer los horarios de los cultos, escribe <strong>CULTOS</strong> 😊</p>
`,
    "diezmos": `
<p>💰 <strong>Diezmos y Ofrendas</strong></p>
<p>Contribuciones voluntarias que sostienen los ministerios y obras de la iglesia, permitiendo que el Reino de Dios siga expandiéndose en Lisboa y en todo el mundo.</p>
`,
    "caridad": `
<p>❤️ <strong>Caridad</strong></p>
<p>Zion Church cree en el cuidado del prójimo. Desarrollamos proyectos sociales para apoyar a quienes más lo necesitan, expresando el amor de Cristo de forma práctica en nuestra comunidad.</p>
`,
    "keola": `
<p>☕ <strong>KEOLA — Cafetería</strong></p>
<p>KEOLA es nuestro espacio de convivencia y comunión. Un lugar para tomar un café, crear conexiones y fortalecer los lazos de la comunidad Zion.</p>
`,
    "zao": `
<p>🤝 <strong>ZAO — Instituto Bíblico</strong></p>
<p>El Instituto Bíblico ZAO te invita a embarcarte en un viaje de transformación y profundización en el conocimiento de la Biblia y de su divino Autor.</p>
<p>Nuestros cursos están diseñados para <strong>todos los corazones sedientos de más</strong>.</p>
`,
    "links": `
<p>🔗 <strong>LINKs — Grupos de Conexión</strong></p>
<p>Los LINKs son grupos que se reúnen como familia en los hogares, buscando la presencia de Dios y compartiendo testimonios de forma presencial o en línea.</p>
<p>Grupos por edades:<br>
• Rise (12–14) • Flow (15–18) • Vox (18–26) • Eklektos (27–39) • Familias</p>
<p>¡Usa nuestra plataforma para encontrar un LINK y conectarte! 😊</p>
`,
    "lumen": `
<p>✨ <strong>LUMEN — Ministerio Infantil</strong></p>
<p>Lumen es el ministerio infantil de Zion Church. Existimos para formar niños a la luz de la Palabra de Dios, firmes en la verdad de Cristo y sensibles a la actuación del Espíritu Santo, creyendo que están llamados a reflejar la luz de Jesús en su generación.</p>
`,
    "rise": `
<p>🔥 <strong>RISE — 12 a 14 años</strong></p>
<p>Ministerio de Zion Church para adolescentes de 12 a 14 años. Nuestra misión es ver adolescentes formados en el corazón del avivamiento, con sus identidades forjadas en el carácter de Cristo, llenos del Poder del Espíritu Santo.</p>
`,
    "flow": `
<p>🌊 <strong>FLOW — 15 a 17 años</strong></p>
<p>Flow es el ministerio de Zion Church para jóvenes de 15 a 17 años. Creemos en una generación que se levanta como líderes para traer transformación y revolución dentro de sus escuelas.</p>
`,
    "vox": `
<p>🎤 <strong>VOX — 18 a 29 años</strong></p>
<p>Vox es un ministerio de jóvenes adultos de 18 a 29 años. "Vox" significa voz en latín — ser una voz que anuncia las buenas nuevas del Reino y demuestra el poder y amor de Dios.</p>
`,
    "eklektos": `
<p>👑 <strong>EKLEKTOS — 29 a 39 años</strong></p>
<p>"Eklektos" significa <em>elegidos</em> en griego. Ministerio de 29 a 39 años, capacitados para llevar el Reino de Dios a las esferas de la sociedad a través de familias e individuos que manifiestan la luz y el poder de Cristo.</p>
`,
    "diamante": `
<p>💎 <strong>DIAMANTE — 60+ años</strong></p>
<p>El Ministerio Diamante es para personas de 60 años en adelante. Un espacio de honor, comunión y fe para quienes tienen mucho que aportar a la comunidad.</p>
`,
    "raices": `
<p>🌱 <strong>RAÍCES — Proceso de Membresía</strong></p>
<p>En Raíces aprenderás los fundamentos vivos de nuestra iglesia — nuestra misión, visión, valores e historia — y podrás acelerar tu conexión con otros miembros y líderes de la casa.</p>
`,
    "jornada": `
<p>🚶 <strong>JORNADA — Nuevos Creyentes</strong></p>
<p>Jornada acoge, ayuda y orienta a los nuevos creyentes en sus primeros pasos con Cristo, auxiliando también en la integración dentro de Zion Church. Su objetivo es generar conocimiento, crecimiento y conexión.</p>
`,
    "legado": `
<p>🏛️ <strong>LEGADO — Expansión del Reino</strong></p>
<p>Legado es un compromiso personal con la expansión del Reino de Dios a través de Zion Church — el despliegue de una historia de más de 40 años de lo que Dios ha hecho entre nosotros.</p>
`,
    "misiones": `
<p>🌎 <strong>MISIONES — Por Todo el Mundo</strong></p>
<p>Zion Church coopera con lo que el Señor está haciendo en todo el mundo, brindando apoyo financiero y espiritual a organizaciones misioneras e iniciativas de justicia social.</p>
`,
    "altomonte": `
<p>🎵 <strong>ALTOMONTE MUSIC — Ministerio de Alabanza</strong></p>
<p>Altomonte Music existe para exaltar y dar a conocer el nombre de Dios. Nuestro sueño es ver a todos los reinos de este mundo adorando, en espíritu y en verdad, al único Rey de reyes: Jesucristo.</p>
`,
  },

  // ── ITALIANO ───────────────────────────
  it: {
    "visione": `
<p>🌍 <strong>Visione di Zion Church</strong></p>
<p>Formare discepoli e leader che manifestano il Regno di Dio per trasformare la Terra, attraverso l'amore di Cristo, la verità della Parola e il potere dello Spirito Santo.</p>
`,
    "valori": `
<p>💛 <strong>Valori di Zion Church</strong></p>
<p><strong>Intimità con Dio</strong><br>
Cercare la presenza di Dio è una priorità nelle nostre vite. Uno stile di vita di adorazione, preghiera e lettura della Parola è la base della nostra intimità con Lui. Manifestiamo in pubblico ciò che siamo in segreto.</p>
<p><em>Mt 6:6 | Sal 27:4 | Sal 63:1-8 | Lc 7:37-38 | 2 Cor 3:18</em></p>
`,
    "culti": `
<p>⛪ <strong>I Nostri Culti</strong></p>
<p>I culti si svolgono la <strong>domenica</strong>:<br>
⏰ Dalle 10:00 alle 13:00<br>
⏰ Dalle 17:00 alle 21:00</p>
<p>Sarà una gioia accoglierti a Zion Church Lisboa 🙌</p>
<p>Per la posizione, scrivi <strong>POSIZIONE</strong>.</p>
`,
    "posizione": `
<p>📍 <strong>Campus Lisboa</strong></p>
<p>Rua do Centro Cultural, 11<br>
1700-036 Alvalade — Lisboa, Portogallo</p>
<p>Per gli orari dei culti, scrivi <strong>CULTI</strong> 😊</p>
`,
    "decime": `
<p>💰 <strong>Decime e Offerte</strong></p>
<p>Contributi volontari che sostengono i ministeri e le opere della chiesa, permettendo al Regno di Dio di continuare ad espandersi a Lisboa e nel mondo.</p>
`,
    "carita": `
<p>❤️ <strong>Carità</strong></p>
<p>Zion Church crede nella cura del prossimo. Sviluppiamo progetti sociali per sostenere chi ne ha più bisogno, esprimendo l'amore di Cristo in modo pratico nella nostra comunità.</p>
`,
    "keola": `
<p>☕ <strong>KEOLA — Caffetteria</strong></p>
<p>KEOLA è il nostro spazio di convivenza e comunione. Un luogo per prendere un caffè, creare connessioni e rafforzare i legami della comunità Zion.</p>
`,
    "zao": `
<p>🤝 <strong>ZAO — Istituto Biblico</strong></p>
<p>L'Istituto Biblico ZAO ti invita a intraprendere un viaggio di trasformazione e approfondimento nella conoscenza della Bibbia e del suo divino Autore.</p>
<p>I nostri corsi sono progettati per <strong>tutti i cuori assetati di più</strong>.</p>
`,
    "links": `
<p>🔗 <strong>LINKs — Gruppi di Connessione</strong></p>
<p>I LINKs sono gruppi che si riuniscono come famiglia nelle case, cercando la presenza di Dio e condividendo testimonianze di persona o online.</p>
<p>Gruppi per età:<br>
• Rise (12–14) • Flow (15–18) • Vox (18–26) • Eklektos (27–39) • Famiglie</p>
<p>Usa la nostra piattaforma per trovare un LINK e connetterti! 😊</p>
`,
    "lumen": `
<p>✨ <strong>LUMEN — Ministero per Bambini</strong></p>
<p>Lumen è il ministero per bambini di Zion Church. Esistiamo per formare bambini alla luce della Parola di Dio, radicati nella verità di Cristo e sensibili all'azione dello Spirito Santo, credendo che siano chiamati a riflettere la luce di Gesù nella loro generazione.</p>
`,
    "rise": `
<p>🔥 <strong>RISE — 12 a 14 anni</strong></p>
<p>Ministero per adolescenti dai 12 ai 14 anni. La nostra missione è vedere adolescenti formati nel cuore del risveglio, con la loro identità forgiata nel carattere di Cristo, pieni del Potere dello Spirito Santo.</p>
`,
    "flow": `
<p>🌊 <strong>FLOW — 15 a 17 anni</strong></p>
<p>Flow è il ministero di Zion Church per giovani dai 15 ai 17 anni. Crediamo in una generazione che si alza come leader per portare trasformazione e rivoluzione nelle loro scuole.</p>
`,
    "vox": `
<p>🎤 <strong>VOX — 18 a 29 anni</strong></p>
<p>Vox è un ministero per giovani adulti dai 18 ai 29 anni. "Vox" significa voce in latino — essere una voce che annuncia le buone notizie del Regno e dimostra il potere e l'amore di Dio.</p>
`,
    "eklektos": `
<p>👑 <strong>EKLEKTOS — 29 a 39 anni</strong></p>
<p>"Eklektos" significa <em>scelti</em> in greco. Ministero dai 29 ai 39 anni, equipaggiati per portare il Regno di Dio nelle sfere della società attraverso famiglie e individui che manifestano la luce e il potere di Cristo.</p>
`,
    "diamante": `
<p>💎 <strong>DIAMANTE — 60+ anni</strong></p>
<p>Il Ministero Diamante è per persone di 60 anni e oltre. Uno spazio di onore, comunione e fede per chi ha molto da contribuire alla comunità.</p>
`,
    "radici": `
<p>🌱 <strong>RADICI — Processo di Appartenenza</strong></p>
<p>In Radici imparerai i fondamenti vivi della nostra chiesa — la nostra missione, visione, valori e storia — e potrai accelerare la connessione con altri membri e leader della casa.</p>
`,
    "cammino": `
<p>🚶 <strong>CAMMINO — Nuovi Credenti</strong></p>
<p>Cammino accoglie, aiuta e guida i nuovi credenti nei loro primi passi con Cristo, dopo la nuova nascita, supportando anche la loro integrazione in Zion Church. Obiettivo: generare conoscenza, crescita e connessione.</p>
`,
    "eredita": `
<p>🏛️ <strong>EREDITÀ — Espansione del Regno</strong></p>
<p>Eredità è un impegno personale per l'espansione del Regno di Dio attraverso Zion Church — lo sviluppo di una storia di oltre 40 anni di ciò che Dio ha fatto tra noi, fisicamente e spiritualmente.</p>
`,
    "missioni": `
<p>🌎 <strong>MISSIONI — In Tutto il Mondo</strong></p>
<p>Zion Church coopera con ciò che il Signore sta facendo nel mondo, fornendo supporto finanziario e spirituale a organizzazioni missionarie e iniziative di giustizia sociale.</p>
`,
    "altomonte": `
<p>🎵 <strong>ALTOMONTE MUSIC — Ministero di Lode</strong></p>
<p>Altomonte Music esiste per esaltare e far conoscere il nome di Dio. Il nostro sogno è vedere tutti i regni di questo mondo adorare, in spirito e in verità, l'unico Re dei Re: Gesù Cristo.</p>
`,
  },
};

// ─────────────────────────────────────────
// HANDLER (Vercel Serverless Function)
// ─────────────────────────────────────────
export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  try {
    const { message, conversationId, lang = "pt" } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Mensagem inválida." });
    }

    // Garante idioma válido, fallback para PT
    const language = ["pt", "en", "es", "it"].includes(lang) ? lang : "pt";

    let convId = conversationId;

    // Cria conversa nova no Supabase se ainda não existe
    if (!convId) {
      const { data, error } = await supabase
        .from("conversations")
        .insert({})
        .select()
        .single();

      if (error) throw new Error("Erro ao criar conversa: " + error.message);
      convId = data.id;
    }

    // Salva mensagem do utilizador
    await supabase.from("messages").insert({
      conversation_id: convId,
      role: "user",
      content: message
    });

    // Normaliza: remove acentos, minúsculas, trim
    const msg = message
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

    const langGreetings = greetings[language];
    const langResponses = responses[language];

    let reply;

    // 1. Saudação → menu de boas-vindas no idioma correto
    if (langGreetings.has(msg)) {
      reply = welcomeMessages[language];

    // 2. Palavra-chave conhecida → resposta fixa no idioma correto
    } else if (langResponses[msg]) {
      reply = langResponses[msg];

    // 3. Qualquer outra coisa → IA (OpenAI) respondendo no idioma correto
    } else {
      const { data: history } = await supabase
        .from("messages")
        .select("role, content")
        .eq("conversation_id", convId)
        .order("id", { ascending: true })
        .limit(20);

      const historyForAI = (history || []).map(m => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content
      }));

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        max_tokens: 300,
        messages: [
          {
            role: "system",
            content: systemPrompts[language]
          },
          ...historyForAI,
          { role: "user", content: message }
        ]
      });

      reply = completion.choices[0].message.content;
    }

    // Salva resposta do bot
    await supabase.from("messages").insert({
      conversation_id: convId,
      role: "bot",
      content: reply
    });

    return res.status(200).json({ reply, conversationId: convId });

  } catch (err) {
    console.error("[chat.js] Erro:", err);
    return res.status(500).json({
      reply: "<p>😔 Ocorreu um erro interno. Por favor, tenta novamente mais tarde.</p>",
      error: err.message
    });
  }
}
