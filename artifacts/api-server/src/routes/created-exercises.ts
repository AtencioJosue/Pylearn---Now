import { Router, IRouter } from "express";
import { Pool } from "pg";
import OpenAI from "openai";

const router: IRouter = Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
});

router.get("/", async (req, res) => {
  const { user_id } = req.query;
  try {
    const query = user_id
      ? "SELECT * FROM py_created_exercises WHERE user_id = $1 ORDER BY created_at DESC"
      : "SELECT * FROM py_created_exercises WHERE status = 'approved' ORDER BY created_at DESC";
    const params = user_id ? [user_id] : [];
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/", async (req, res) => {
  const { user_id, author_name, title, topic, type, question, correct_answer, hint, explanation } = req.body;
  if (!user_id || !author_name || !title || !topic || !type || !question || !correct_answer)
    return res.status(400).json({ error: "Faltan campos requeridos" });

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

  try {
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 500,
      messages: [{ role: "user", content: validationPrompt }],
    });

    const raw = aiResponse.choices[0]?.message?.content ?? "{}";
    let parsed: { approved: boolean; score: number; feedback: string; reason: string } = {
      approved: false, score: 0, feedback: "No se pudo evaluar", reason: "error"
    };

    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
    } catch {
      // keep defaults
    }

    const status = parsed.approved ? "approved" : "rejected";
    const result = await pool.query(
      `INSERT INTO py_created_exercises
         (user_id, author_name, title, topic, type, question, correct_answer, hint, explanation, ai_feedback, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [user_id, author_name, title, topic, type, question, correct_answer,
       hint ?? null, explanation ?? null, parsed.feedback, status]
    );

    res.json({ exercise: result.rows[0], validation: parsed });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
