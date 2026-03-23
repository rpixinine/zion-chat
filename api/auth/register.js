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

        // ── Verifica se email já está registado em usuarios ────
        const { data: emailExistente } = await supabase
            .from("usuarios")
            .select("id")
            .eq("email", emailNorm)
            .maybeSingle();

        if (emailExistente)
            return res.status(409).json({ error: "Este email já tem conta registada." });

        // ── Auto-vínculo com membro existente ──────────────────
        // Schema membros: tem coluna nif (text) e email (text)
        // Prioridade: NIF → email
        let membroId    = null;
        let visitanteId = null;
        let tipo        = "visitante";

        // 1. Tenta por NIF (coluna nif existe em membros ✓)
        if (nifNorm) {
            const { data: membroPorNif } = await supabase
                .from("membros")
                .select("id, nome, email")
                .eq("nif", nifNorm)
                .eq("ativo", true)
                .maybeSingle();

            if (membroPorNif) {
                membroId = membroPorNif.id;
                tipo     = "membro";
                console.log(`[register] Vínculo por NIF → membro_id=${membroId} (${membroPorNif.nome})`);
            }
        }

        // 2. Tenta por email se não encontrou por NIF
        //    (membros.email tem unique key, maybeSingle é seguro)
        if (!membroId) {
            const { data: membroPorEmail } = await supabase
                .from("membros")
                .select("id, nome")
                .eq("email", emailNorm)
                .eq("ativo", true)
                .maybeSingle();

            if (membroPorEmail) {
                membroId = membroPorEmail.id;
                tipo     = "membro";
                console.log(`[register] Vínculo por email → membro_id=${membroId} (${membroPorEmail.nome})`);
            }
        }

        // 3. Se não é membro → cria visitante
        //    Schema visitantes: id, nome, email, telefone, zona,
        //    onde_conheceu, data_visita, convertido, membro_id,
        //    observacoes, created_at, ativo
        //    NÃO tem: nif, foto_url (essas colunas não existem)
        if (!membroId) {
            const { data: novoVisitante, error: visitanteErr } = await supabase
                .from("visitantes")
                .insert({
                    nome:          nome.trim(),
                    email:         emailNorm,
                    telefone:      telefone || null,
                    onde_conheceu: onde_conheceu || null,
                    ativo:         true,
                    // foto_url NÃO existe em visitantes
                    // nif NÃO existe em visitantes
                })
                .select("id")
                .single();

            if (visitanteErr) {
                // Loga mas não bloqueia — o utilizador fica sem visitante_id
                console.warn("[register] Erro ao criar visitante:", visitanteErr.message);
            } else {
                visitanteId = novoVisitante.id;
                console.log(`[register] Visitante criado → visitante_id=${visitanteId}`);
            }
        }

        // ── Hash da password ───────────────────────────────────
        const passwordHash = await bcrypt.hash(password, 12);

        // ── Cria utilizador ────────────────────────────────────
        // Schema usuarios: id, nome, email, password_hash, tipo,
        //   visitante_id, membro_id, ativo, created_at, updated_at,
        //   e_admin, ultimo_acesso, ver_*/criar_*/editar_*/eliminar_*
        //
        // NÃO tem: nif, telefone, foto_url
        // (essas colunas existem em membros/visitantes, não em usuarios)
        const { data: novoUser, error: userErr } = await supabase
            .from("usuarios")
            .insert({
                nome:          nome.trim(),
                email:         emailNorm,
                password_hash: passwordHash,
                tipo,                           // 'visitante' ou 'membro'
                membro_id:     membroId,         // null se visitante
                visitante_id:  visitanteId,      // null se membro vinculado
                ativo:         true,
                e_admin:       false,
                // Permissões todas a false por defeito (o schema já tem default false)
            })
            .select("id, nome, email, tipo, membro_id, visitante_id")
            .single();

        if (userErr) {
            console.error("[register] Erro ao inserir usuario:", JSON.stringify(userErr));

            if (userErr.code === "23505")  // unique violation (email duplicado)
                return res.status(409).json({ error: "Este email já tem conta registada." });

            if (userErr.code === "42703")  // column does not exist
                return res.status(500).json({ error: `Schema desactualizado: ${userErr.message}` });

            if (userErr.code === "23514")  // check constraint violation
                return res.status(400).json({ error: `Valor inválido: ${userErr.message}` });

            throw new Error(userErr.message);
        }

        // ── Actualiza foto_url no membro se vinculou ───────────
        // membros tem foto_url ✓ — aproveita para guardar a foto
        // mesmo que o user já seja membro, actualiza a foto se foi enviada
        if (membroId && foto_url) {
            await supabase
                .from("membros")
                .update({ foto_url })
                .eq("id", membroId)
                .is("foto_url", null); // só actualiza se o membro ainda não tiver foto
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
                tipo:         novoUser.tipo,          // 'visitante' ou 'membro'
                membro_id:    novoUser.membro_id    || null,
                visitante_id: novoUser.visitante_id || null,
                vinculado:    !!membroId,             // true se foi auto-vinculado a membro existente
            }
        });

    } catch (err) {
        console.error("[auth/register] ERRO GERAL:", err.message);
        return res.status(500).json({ error: err.message || "Erro interno. Tenta novamente." });
    }
}
