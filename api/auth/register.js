import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "POST")   return res.status(405).json({ error: "Method Not Allowed" });

    try {
        const { nome, nif, email, telefone, onde_conheceu, foto_url, password } = req.body;

        // ── Validações básicas ─────────────────────────────────
        if (!nome?.trim())   return res.status(400).json({ error: "Nome obrigatório." });
        if (!email?.trim())  return res.status(400).json({ error: "Email obrigatório." });
        if (!password)       return res.status(400).json({ error: "Password obrigatória." });
        if (password.length < 6) return res.status(400).json({ error: "Password deve ter pelo menos 6 caracteres." });

        const emailNorm = email.toLowerCase().trim();
        const nifNorm   = nif?.replace(/\D/g, '') || null;

        if (nifNorm && nifNorm.length !== 9)
            return res.status(400).json({ error: "NIF inválido. Deve ter 9 dígitos." });

        // ── Verifica se email já está registado ────────────────
        const { data: emailExistente } = await supabase
            .from("usuarios")
            .select("id")
            .eq("email", emailNorm)
            .maybeSingle(); // maybeSingle não lança erro se não encontrar

        if (emailExistente)
            return res.status(409).json({ error: "Este email já tem conta registada." });

        // ── Verifica se NIF já está em uso ─────────────────────
        if (nifNorm) {
            const { data: nifExistente } = await supabase
                .from("usuarios")
                .select("id")
                .eq("nif", nifNorm)
                .maybeSingle();

            if (nifExistente)
                return res.status(409).json({ error: "Este NIF já está associado a outra conta." });
        }

        // ── Tenta auto-vínculo com membro existente ────────────
        // Prioridade: NIF → email
        // Usa maybeSingle para não crashar se não encontrar ou se coluna não existir
        let membroId    = null;
        let visitanteId = null;
        let tipo        = "visitante";

        // 1. Tenta por NIF (só se a coluna nif existir na tabela membros)
        if (nifNorm) {
            try {
                const { data: membroPorNif } = await supabase
                    .from("membros")
                    .select("id")
                    .eq("nif", nifNorm)
                    .eq("ativo", true)
                    .maybeSingle();

                if (membroPorNif) {
                    membroId = membroPorNif.id;
                    tipo     = "membro";
                    console.log(`[register] Vínculo por NIF: membro_id=${membroId}`);
                }
            } catch (e) {
                // Coluna nif não existe na tabela membros — ignora e continua
                console.warn("[register] Coluna nif não encontrada em membros:", e.message);
            }
        }

        // 2. Tenta por email se ainda não encontrou
        if (!membroId) {
            try {
                const { data: membroPorEmail } = await supabase
                    .from("membros")
                    .select("id")
                    .eq("email", emailNorm)
                    .eq("ativo", true)
                    .maybeSingle();

                if (membroPorEmail) {
                    membroId = membroPorEmail.id;
                    tipo     = "membro";
                    console.log(`[register] Vínculo por email: membro_id=${membroId}`);
                }
            } catch (e) {
                console.warn("[register] Erro ao buscar membro por email:", e.message);
            }
        }

        // 3. Se visitante, cria registo na tabela visitantes
        if (!membroId) {
            // Constrói o payload de forma segura — só inclui campos que provavelmente existem
            const visitantePayload = {
                nome:          nome.trim(),
                email:         emailNorm,
                foto_url:      foto_url || null,
            };
            // Campos opcionais — adicionados só se tiverem valor
            if (telefone)      visitantePayload.telefone      = telefone;
            if (onde_conheceu) visitantePayload.onde_conheceu = onde_conheceu;
            if (nifNorm)       visitantePayload.nif           = nifNorm;

            const { data: novoVisitante, error: visitanteErr } = await supabase
                .from("visitantes")
                .insert(visitantePayload)
                .select("id")
                .single();

            if (visitanteErr) {
                // Se a tabela visitantes não existir ou coluna falhar, continua sem visitante_id
                console.warn("[register] Não foi possível criar visitante:", visitanteErr.message);
                // Não bloqueia o registo — o utilizador fica sem visitante_id
            } else {
                visitanteId = novoVisitante.id;
            }
        }

        // ── Hash da password ───────────────────────────────────
        const passwordHash = await bcrypt.hash(password, 12);

        // ── Cria utilizador ────────────────────────────────────
        // Payload base — apenas colunas que certamente existem
        const userPayload = {
            nome:          nome.trim(),
            email:         emailNorm,
            password_hash: passwordHash,
            tipo,
            ativo:         true,
            foto_url:      foto_url || null,
        };

        // Colunas opcionais — só adiciona se tiverem valor
        // Se a coluna não existir no schema, o Supabase ignora (ou retorna erro tratado abaixo)
        if (nifNorm)     userPayload.nif          = nifNorm;
        if (membroId)    userPayload.membro_id     = membroId;
        if (visitanteId) userPayload.visitante_id  = visitanteId;
        if (telefone)    userPayload.telefone       = telefone;

        const { data: novoUser, error: userErr } = await supabase
            .from("usuarios")
            .insert(userPayload)
            .select("id, nome, email, tipo, membro_id, visitante_id")
            .single();

        if (userErr) {
            console.error("[register] Erro ao inserir usuario:", JSON.stringify(userErr));

            // Mensagem mais amigável para erros comuns
            if (userErr.code === "23505") // unique violation
                return res.status(409).json({ error: "Este email já tem conta registada." });

            if (userErr.code === "42703") // column does not exist
                return res.status(500).json({
                    error: `Coluna em falta na tabela usuarios: ${userErr.message}. Verifica o schema da BD.`
                });

            throw new Error(userErr.message);
        }

        // ── Actualiza membro com o user_id (se vinculou) ───────
        if (membroId) {
            try {
                await supabase
                    .from("membros")
                    .update({ usuario_id: novoUser.id })
                    .eq("id", membroId);
            } catch (e) {
                // Coluna usuario_id pode não existir — não bloqueia
                console.warn("[register] Não foi possível actualizar usuario_id em membros:", e.message);
            }
        }

        // ── Gera token JWT ─────────────────────────────────────
        const token = jwt.sign(
            { id: novoUser.id, email: novoUser.email, tipo: novoUser.tipo },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        return res.status(201).json({
            token,
            user: {
                id:           novoUser.id,
                nome:         novoUser.nome,
                email:        novoUser.email,
                tipo:         novoUser.tipo,
                membro_id:    novoUser.membro_id    || null,
                visitante_id: novoUser.visitante_id || null,
                vinculado:    !!membroId,
            }
        });

    } catch (err) {
        console.error("[auth/register] ERRO GERAL:", err.message, err.stack);
        return res.status(500).json({ error: err.message || "Erro interno. Tenta novamente." });
    }
}
