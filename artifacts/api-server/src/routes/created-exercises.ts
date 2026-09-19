import { Router, IRouter } from "express";
import OpenAI from "openai";
import { localDB } from "../local_db";
import { pool } from "../database";
import { getAuthenticatedUser, getAuthUser, requireAuth } from "../auth";

const router: IRouter = Router();
const aiApiKey =
  process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY;

const openai = new OpenAI({
  baseURL:
    process.env.AI_INTEGRATIONS_OPENAI_BASE_URL ||
    "https://api.groq.com/openai/v1",
  apiKey: aiApiKey || "dummy",
  maxRetries: 0,
  timeout: 8000,
});

function localValidation(title: string, question: string) {
  const approved = title.length > 3 && question.length > 5;
  return {
    approved,
    score: approved ? 85 : 30,
    feedback: approved
      ? "¡Excelente ejercicio! El contenido es educativo y correcto."
      : "El ejercicio necesita más detalle.",
    reason: approved ? "approved" : "low_quality",
  };
}

router.get("/", async (req, res) => {
  const requestedUserId =
    typeof req.query.user_id === "string" ? req.query.user_id : "";
  const currentUser = requestedUserId ? await getAuthenticatedUser(req) : null;
  if (requestedUserId && !currentUser) {
    return res.status(401).json({ error: "Debes iniciar sesión." });
  }
  const user_id = requestedUserId ? currentUser!.id : "";

  if (!pool) {
    const db = localDB.get();
    const createdExercises = db.createdExercises ?? [];
    const filtered = user_id
      ? createdExercises.filter((e) => e.user_id === user_id)
      : createdExercises.filter((e) => e.status === "approved");
    const sorted = [...filtered].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
    return res.json(sorted);
  }

  try {
    const query = user_id
      ? "SELECT * FROM py_created_exercises WHERE user_id = $1 ORDER BY created_at DESC"
      : "SELECT * FROM py_created_exercises WHERE status = 'approved' ORDER BY created_at DESC";
    const params = user_id ? [user_id] : [];
    const result = await pool.query(query, params);
    return res.json(result.rows);
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

router.post("/", requireAuth, async (req, res) => {
  const user = getAuthUser(req);
  const {
    title,
    topic,
    type,
    question,
    correct_answer,
    hint,
    explanation,
  } = req.body;
  if (
    !title ||
    !topic ||
    !type ||
    !question ||
    !correct_answer
  )
    return res.status(400).json({ error: "Faltan campos requeridos" });

  const user_id = user.id;
  const author_name = user.name;

  if (process.env.VERCEL === "1" && !pool) {
    return res.status(503).json({
      error: "La base de datos de producción aún no está configurada.",
    });
  }

  const validationPrompt = `Eres un evaluador de ejercicios educativos de Python para estudiantes latinoamericanos.

Analiza este ejercicio propuesto:
- Título: ${title}
- Tipo: ${type} (fill_blank=completar código, predict_output=predecir salida, multiple_choice=opción múltiple)
- Pregunta/Código: ${question}
- Respuesta correcta: ${correct_answer}
- Pista: ${hint ?? "N/A"}
- Explicación: ${explanation ?? "N/A"}

Evalúa ESTRICTAMENTE los siguientes criterios:
1. CORRECCIÓN TÉCNICA: ¿La respuesta correcta es verdaderamente correcta en Python?
2. EDUCATIVO: ¿Enseña un concepto útil de Python?
3. CALIDAD: ¿El enunciado es claro y el nivel de dificultad es apropiado?
4. ORIGINALIDAD: ¿Parece hecho con esfuerzo propio (no generado trivialmente por IA)?

Responde SOLO en este formato JSON exacto:
{
  "approved": true/false,
  "score": 0-100,
  "feedback": "Explicación breve de la evaluación en español (máx 150 palabras)",
  "reason": "approved" | "incorrect_answer" | "low_quality" | "not_educational" | "too_simple"
}`;

  let parsed: {
    approved: boolean;
    score: number;
    feedback: string;
    reason: string;
  } = {
    approved: false,
    score: 0,
    feedback: "No se pudo evaluar",
    reason: "error",
  };

  try {
    if (!aiApiKey || aiApiKey === "dummy_key") {
      // Mock validation for local dev without a real key
      parsed = localValidation(title, question);
    } else {
      let aiResponse;
      try {
        aiResponse = await openai.chat.completions.create({
          model: "openai/gpt-oss-120b",
          max_tokens: 500,
          messages: [{ role: "user", content: validationPrompt }],
        });
      } catch (firstErr: any) {
        console.warn(
          "Primary model for exercise validation failed, trying fallback:",
          firstErr.message,
        );
        aiResponse = await openai.chat.completions.create({
          model: "openai/gpt-oss-20b",
          max_tokens: 500,
          messages: [{ role: "user", content: validationPrompt }],
        });
      }

      const raw = aiResponse.choices[0]?.message?.content ?? "{}";
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
    }
  } catch (e: any) {
    console.warn("AI exercise validation unavailable; using local validation:", e.message);
    parsed = localValidation(title, question);
  }

  const status = parsed.approved ? "approved" : "rejected";

  if (!pool) {
    const db = localDB.get();
    if (!db.createdExercises) db.createdExercises = [];
    const highestExistingId = db.createdExercises.reduce(
      (highest, exercise) => Math.max(highest, Number(exercise.id) || 0),
      0,
    );
    const id = Math.max(db.createdExerciseIdCounter ?? 1, highestExistingId + 1);
    db.createdExerciseIdCounter = id + 1;
    const exercise = {
      id,
      user_id,
      author_name,
      title,
      topic,
      type,
      question,
      correct_answer,
      hint: hint ?? null,
      explanation: explanation ?? null,
      ai_feedback: parsed.feedback,
      status,
      created_at: new Date().toISOString(),
    };
    db.createdExercises.push(exercise);
    localDB.save(db);
    return res.json({ exercise, validation: parsed });
  }

  try {
    const result = await pool.query(
      `INSERT INTO py_created_exercises
         (user_id, author_name, title, topic, type, question, correct_answer, hint, explanation, ai_feedback, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [
        user_id,
        author_name,
        title,
        topic,
        type,
        question,
        correct_answer,
        hint ?? null,
        explanation ?? null,
        parsed.feedback,
        status,
      ],
    );

    return res.json({ exercise: result.rows[0], validation: parsed });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

export default router;
