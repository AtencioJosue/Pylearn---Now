import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Loader2, Sparkles, MessageCircle, Bot } from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ExerciseContext {
  id: number;
  title: string;
  topic: string;
  question: string;
  explanation?: string;
  hint?: string;
}

interface AICoachPanelProps {
  isOpen: boolean;
  onClose: () => void;
  exercise: ExerciseContext;
  userAnswer?: string;
  wasCorrect?: boolean | null;
  correctAnswer?: string;
}

const PANEL_WIDTH = 360; // px — used to push content

function getQuickSuggestions(wasCorrect: boolean | null | undefined): string[] {
  if (wasCorrect === true) {
    return [
      "Repasa la teoría con otro ejemplo",
      "¿Por qué funciona así? 🤔",
      "¿Cuándo se usa en proyectos reales?",
    ];
  }
  if (wasCorrect === false) {
    return [
      "Enséñame la teoría paso a paso",
      "¿Por qué me equivoqué?",
      "Dame una pista 💡",
    ];
  }
  return [
    "Enséñame la teoría paso a paso",
    "Dame una pista para comenzar 💡",
    "¿Qué hace exactamente este código?",
  ];
}

function TypingDots() {
  return (
    <div className="flex items-end gap-3 mb-3">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-xs flex-shrink-0 shadow">
        🐍
      </div>
      <div className="bg-[#1e2d3d] border border-emerald-900/40 rounded-2xl rounded-bl-none px-4 py-3 flex gap-1.5 items-center">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 bg-emerald-400 rounded-full"
            animate={{ y: [0, -5, 0] }}
            transition={{
              duration: 0.55,
              repeat: Infinity,
              delay: i * 0.13,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Python syntax highlighter (no deps) ──
const PY_KEYWORDS =
  /\b(def|return|if|else|elif|for|while|in|not|and|or|True|False|None|import|from|class|pass|break|continue|lambda|try|except|with|as|is|print|len|range|type|int|str|float|list|dict|set|tuple|input|append|split|join|upper|lower|format)\b/g;
const PY_STRING = /(["'`])(?:(?!\1)[^\\]|\\.)*\1/g;
const PY_COMMENT = /(#[^\n]*)/g;
const PY_NUMBER = /\b(\d+\.?\d*)\b/g;

function highlightPython(code: string): React.ReactNode[] {
  // split preserving newlines
  const lines = code.split("\n");
  return lines.map((line, li) => {
    // tokenise each line with simple regex replacements → span array
    let segments: React.ReactNode[] = [];
    let remaining = line;
    let key = 0;

    // comments — eat the rest of the line
    const cIdx = remaining.indexOf("#");
    let commentPart = "";
    if (cIdx !== -1) {
      commentPart = remaining.slice(cIdx);
      remaining = remaining.slice(0, cIdx);
    }

    // simple tokenise: strings then keywords then numbers then rest
    const tokenRegex =
      /(["'])(?:(?!\1)[^\\]|\\.)*\1|\b(?:def|return|if|else|elif|for|while|in|not|and|or|True|False|None|import|from|class|pass|break|continue|lambda|try|except|with|as|is|print|len|range|type|int|str|float|list|dict|set|tuple|input|append|split|join|upper|lower|format)\b|\b\d+\.?\d*\b/g;
    let lastIndex = 0;
    let m: RegExpExecArray | null;
    tokenRegex.lastIndex = 0;
    while ((m = tokenRegex.exec(remaining)) !== null) {
      if (m.index > lastIndex) {
        segments.push(
          <span key={key++}>{remaining.slice(lastIndex, m.index)}</span>,
        );
      }
      const tok = m[0];
      if (tok.startsWith('"') || tok.startsWith("'")) {
        segments.push(
          <span key={key++} style={{ color: "#a8ff78" }}>
            {tok}
          </span>,
        );
      } else if (/^\d/.test(tok)) {
        segments.push(
          <span key={key++} style={{ color: "#fbbf24" }}>
            {tok}
          </span>,
        );
      } else {
        segments.push(
          <span key={key++} style={{ color: "#67e8f9" }}>
            {tok}
          </span>,
        );
      }
      lastIndex = m.index + tok.length;
    }
    if (lastIndex < remaining.length) {
      segments.push(<span key={key++}>{remaining.slice(lastIndex)}</span>);
    }
    if (commentPart) {
      segments.push(
        <span key={key++} style={{ color: "#6b7280", fontStyle: "italic" }}>
          {commentPart}
        </span>,
      );
    }

    return (
      <span key={li}>
        {segments}
        {li < lines.length - 1 && "\n"}
      </span>
    );
  });
}

// ── Rich message renderer ──
function MessageContent({ text, isUser }: { text: string; isUser: boolean }) {
  if (isUser) return <span>{text}</span>;

  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // ── Code block ──
    const cbStart = remaining.indexOf("```");
    if (cbStart !== -1) {
      // text before block
      if (cbStart > 0) {
        parts.push(
          <InlineText key={key++} text={remaining.slice(0, cbStart)} />,
        );
      }
      const afterFence = remaining.slice(cbStart + 3);
      const langEnd = afterFence.indexOf("\n");
      const closeIdx = afterFence.indexOf("```", langEnd + 1);
      if (closeIdx !== -1) {
        const codeContent = afterFence.slice(langEnd + 1, closeIdx).trimEnd();
        parts.push(
          <div
            key={key++}
            className="my-2 rounded-lg overflow-hidden border border-slate-700/60"
            style={{ background: "#0d1117" }}
          >
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 border-b border-slate-700/60"
              style={{ background: "#161b22" }}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
              <span className="text-[10px] text-slate-500 font-mono ml-1">
                python
              </span>
            </div>
            <pre
              className="px-3 py-2.5 text-[12px] font-mono leading-5 overflow-x-auto whitespace-pre"
              style={{ color: "#e6edf3" }}
            >
              <code>{highlightPython(codeContent)}</code>
            </pre>
          </div>,
        );
        remaining = afterFence.slice(closeIdx + 3);
        continue;
      }
    }

    // ── Table row ──  |col|col|
    const tableMatch = remaining.match(/^(\|.+\|(\n\|.+\|)*)/m);
    if (tableMatch && remaining.trimStart().startsWith("|")) {
      const tableText = tableMatch[0];
      const rows = tableText
        .split("\n")
        .filter((r) => r.trim().startsWith("|"));
      parts.push(
        <div
          key={key++}
          className="my-2 overflow-hidden rounded-lg border border-slate-700/50 text-[11.5px]"
        >
          {rows.map((row, ri) => {
            const cells = row.split("|").filter((c) => c.trim() !== "");
            const isSep = cells.every((c) => /^[-: ]+$/.test(c));
            if (isSep) return null;
            return (
              <div
                key={ri}
                className={`flex ${ri === 0 ? "bg-emerald-900/40 font-bold text-emerald-300" : "border-t border-slate-700/40 text-slate-200"}`}
              >
                {cells.map((cell, ci) => (
                  <div key={ci} className="flex-1 px-2.5 py-1.5 truncate">
                    {cell.trim()}
                  </div>
                ))}
              </div>
            );
          })}
        </div>,
      );
      remaining = remaining.slice(
        remaining.indexOf(tableText) + tableText.length,
      );
      continue;
    }

    // consume rest as inline text
    parts.push(<InlineText key={key++} text={remaining} />);
    break;
  }

  return <div className="space-y-0.5 text-[13px] leading-relaxed">{parts}</div>;
}

function InlineText({ text }: { text: string }) {
  // Parse bold, inline-code, numbered steps, line breaks
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, li) => {
        // Numbered step  "1. ..."
        const stepMatch = line.match(/^(\d+)\.\s+(.+)$/);
        if (stepMatch) {
          return (
            <div key={li} className="flex gap-2 py-0.5">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-700/60 text-emerald-300 text-[10px] font-black flex items-center justify-center">
                {stepMatch[1]}
              </span>
              <span className="text-slate-200 text-[12.5px]">
                <InlineParts text={stepMatch[2]} />
              </span>
            </div>
          );
        }
        return (
          <div key={li} className={li > 0 ? "mt-1" : ""}>
            <InlineParts text={line} />
          </div>
        );
      })}
    </>
  );
}

function InlineParts({ text }: { text: string }) {
  // Handle **bold** and `inline code`
  const parts: React.ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let last = 0,
    m: RegExpExecArray | null,
    k = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last)
      parts.push(<span key={k++}>{text.slice(last, m.index)}</span>);
    if (m[0].startsWith("**")) {
      parts.push(
        <strong key={k++} className="text-white font-bold">
          {m[0].slice(2, -2)}
        </strong>,
      );
    } else {
      parts.push(
        <code
          key={k++}
          className="px-1 py-0.5 rounded text-[11.5px] font-mono text-emerald-300"
          style={{ background: "#1e2d3d" }}
        >
          {m[0].slice(1, -1)}
        </code>,
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(<span key={k++}>{text.slice(last)}</span>);
  return <>{parts}</>;
}

function ChatBubble({ msg, isNew }: { msg: ChatMessage; isNew?: boolean }) {
  const isUser = msg.role === "user";
  return (
    <motion.div
      initial={isNew ? { opacity: 0, y: 8, scale: 0.97 } : false}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 420, damping: 30 }}
      className={`flex items-end gap-2.5 mb-3 ${isUser ? "flex-row-reverse" : ""}`}
    >
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 shadow mt-1 ${isUser ? "bg-gradient-to-br from-[#1CB0F6] to-blue-700 text-white" : "bg-gradient-to-br from-emerald-400 to-green-600 text-white"}`}
      >
        {isUser ? "Tú" : "🐍"}
      </div>
      <div
        className={`max-w-[88%] px-3.5 py-2.5 rounded-2xl shadow-sm ${isUser ? "bg-[#1CB0F6] text-white rounded-br-none text-[13px] font-medium leading-relaxed" : "bg-[#1e2d3d] border border-emerald-900/40 text-slate-100 rounded-bl-none"}`}
      >
        <MessageContent text={msg.content} isUser={isUser} />
      </div>
    </motion.div>
  );
}

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export function AICoachPanel({
  isOpen,
  onClose,
  exercise,
  userAnswer,
  wasCorrect,
  correctAnswer,
}: AICoachPanelProps) {
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [newMsgIndex, setNewMsgIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const MAX_MESSAGES = 20;

  // Push the page content when panel opens/closes
  useEffect(() => {
    const root = document.getElementById("root") || document.body;
    if (isOpen) {
      root.style.transition = "padding-right 0.32s cubic-bezier(0.4,0,0.2,1)";
      root.style.paddingRight = `${PANEL_WIDTH}px`;
    } else {
      root.style.paddingRight = "0px";
      setTimeout(() => {
        root.style.transition = "";
      }, 340);
    }
    return () => {
      root.style.paddingRight = "0px";
      root.style.transition = "";
    };
  }, [isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [history, isLoading]);

  // Focus input when opens
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  // Reset when exercise changes
  useEffect(() => {
    setHistory([]);
    setMessageCount(0);
    setInputValue("");
    setNewMsgIndex(null);
  }, [exercise.id]);

  const sendMessage = useCallback(
    async (message: string) => {
      if (!message.trim() || isLoading || messageCount >= MAX_MESSAGES) return;

      const userMsg: ChatMessage = { role: "user", content: message.trim() };
      setHistory((prev) => [...prev, userMsg]);
      setNewMsgIndex(history.length); // track index for animation
      setInputValue("");
      setIsLoading(true);
      setMessageCount((c) => c + 1);

      // Reset textarea height
      if (inputRef.current) {
        inputRef.current.style.height = "auto";
      }

      try {
        const res = await fetch(`${BASE}/api/ai/coach`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            exerciseId: exercise.id,
            exerciseTitle: exercise.title,
            exerciseTopic: exercise.topic,
            exerciseQuestion: exercise.question,
            exerciseExplanation: exercise.explanation,
            exerciseHint: exercise.hint,
            userAnswer: userAnswer ?? "",
            wasCorrect: wasCorrect ?? null,
            correctAnswer: correctAnswer ?? "",
            userMessage: message.trim(),
            history: history.map((h) => ({ role: h.role, content: h.content })),
          }),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const reply =
          data.reply ?? "Lo siento, algo salió mal. Intenta de nuevo 🐍";
        setHistory((prev) => [...prev, { role: "assistant", content: reply }]);
        setNewMsgIndex(history.length + 1);
      } catch {
        setHistory((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "Tuve un problema de conexión. ¿Podrías intentarlo de nuevo? 🐍",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [
      history,
      isLoading,
      messageCount,
      exercise,
      userAnswer,
      wasCorrect,
      correctAnswer,
    ],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  const quickSuggestions = getQuickSuggestions(wasCorrect);
  const showWelcome = history.length === 0 && !isLoading;

  const panel = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: PANEL_WIDTH, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: PANEL_WIDTH, opacity: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 28 }}
          style={{ width: PANEL_WIDTH }}
          className="fixed right-0 top-0 bottom-0 z-[150] flex flex-col"
        >
          {/* Background */}
          <div className="absolute inset-0 bg-[#0d1b2a] border-l border-slate-800/80 shadow-[-8px_0_40px_rgba(0,0,0,0.5)]" />

          <div className="relative flex flex-col h-full overflow-hidden">
            {/* ── Header ── */}
            <div
              className="flex-shrink-0 px-4 py-3.5 border-b border-slate-800/80"
              style={{
                background: "linear-gradient(135deg, #0d2818 0%, #0d1b2a 100%)",
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ y: [0, -3, 0] }}
                    transition={{
                      duration: 2.8,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-green-700 flex items-center justify-center text-xl shadow-lg"
                  >
                    🐍
                  </motion.div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-black text-sm tracking-tight">
                        Pylearn Coach
                      </span>
                      <span className="px-1.5 py-0.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[9px] font-black rounded-full uppercase tracking-widest flex items-center gap-1">
                        <Sparkles className="w-2 h-2" /> IA
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px] font-medium mt-0.5">
                      {wasCorrect === true
                        ? "¡Felicidades! Pregúntame más 🌟"
                        : wasCorrect === false
                          ? "¡Puedes lograrlo! Te guío 💪"
                          : "Tu tutor personal de Python"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-slate-700/60 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Context pill */}
              <div className="mt-2.5 px-2.5 py-1.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-[11px] text-slate-400 font-medium flex items-center gap-2 truncate">
                <MessageCircle className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                <span className="truncate">
                  <span className="text-emerald-400 font-bold">
                    {exercise.topic}
                  </span>
                  {" — "}
                  {exercise.title}
                </span>
              </div>
            </div>

            {/* ── Messages ── */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 py-4"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "rgb(30 45 61) transparent",
              }}
            >
              {/* Welcome screen */}
              {showWelcome && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center text-center pt-4 pb-2"
                >
                  <motion.div
                    animate={{ y: [0, -7, 0] }}
                    transition={{
                      duration: 2.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="text-4xl mb-3"
                  >
                    🐍
                  </motion.div>
                  <h4 className="text-white font-black text-base mb-1">
                    ¡Hola! Soy Pylearn 👋
                  </h4>
                  <p className="text-slate-500 text-xs leading-relaxed mb-5 max-w-[240px]">
                    {wasCorrect === true
                      ? "¡Genial trabajo! Puedo explicarte por qué funciona o darte ejemplos más avanzados."
                      : wasCorrect === false
                        ? "¡No te rindas! Te daré pistas sin revelar la respuesta. Aprenderás más así 💪"
                        : "Estoy aquí para ayudarte. Puedo explicarte el concepto, darte pistas o responder tus dudas."}
                  </p>

                  {/* Quick chips */}
                  <div className="w-full flex flex-col gap-2">
                    {quickSuggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => sendMessage(s)}
                        className="w-full text-left px-3.5 py-2.5 bg-[#1e2d3d] hover:bg-[#243545] border border-slate-700/60 hover:border-emerald-600/40 text-slate-300 hover:text-white text-xs font-semibold rounded-xl transition-all duration-150"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Messages */}
              {history.map((msg, idx) => (
                <ChatBubble
                  key={idx}
                  msg={msg}
                  isNew={idx === newMsgIndex || idx === newMsgIndex! + 1}
                />
              ))}

              {isLoading && <TypingDots />}

              {messageCount >= MAX_MESSAGES && (
                <p className="text-center text-[11px] text-slate-600 font-medium py-3">
                  Límite de sesión alcanzado. Recarga para continuar.
                </p>
              )}
            </div>

            {/* ── Input ── */}
            <div className="flex-shrink-0 px-4 py-3 border-t border-slate-800/80 bg-[#0d1b2a]">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading || messageCount >= MAX_MESSAGES}
                  placeholder={
                    messageCount >= MAX_MESSAGES
                      ? "Límite alcanzado"
                      : "Pregúntale a Pylearn... (Enter)"
                  }
                  rows={1}
                  className="flex-1 bg-[#1e2d3d] border border-slate-700/60 focus:border-emerald-600/50 rounded-xl px-3.5 py-2.5 text-[13px] text-white placeholder-slate-600 font-medium resize-none focus:outline-none transition-colors leading-relaxed"
                  style={{ maxHeight: 100 }}
                  onInput={(e) => {
                    const el = e.currentTarget;
                    el.style.height = "auto";
                    el.style.height = Math.min(el.scrollHeight, 100) + "px";
                  }}
                />
                <button
                  onClick={() => sendMessage(inputValue)}
                  disabled={
                    !inputValue.trim() ||
                    isLoading ||
                    messageCount >= MAX_MESSAGES
                  }
                  className="w-9 h-9 flex-shrink-0 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl flex items-center justify-center transition-all active:scale-95 shadow-md"
                >
                  {isLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              <p className="text-center text-[10px] text-slate-700 font-medium mt-2">
                Pylearn guía sin revelar respuestas · Aprende pensando 🧠
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(panel, document.body);
}

// Export the panel width so ExerciseView can use it for layout compensation
export { PANEL_WIDTH };
