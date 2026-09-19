import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface FillInTheBlankProps {
  codeTemplate: string;
  options: string[];
  onChange: (filledAnswer: string, isReady: boolean) => void;
  submitted: boolean;
  isCorrect?: boolean;
  hideOptions?: boolean;
  hideCode?: boolean;
  externalFilled?: (string | null)[];
  onExternalFilledChange?: (next: (string | null)[]) => void;
}

function parseTemplate(template: string): (string | null)[] {
  const parts: (string | null)[] = [];
  let rest = template;
  while (rest.includes("___")) {
    const idx = rest.indexOf("___");
    if (idx > 0) parts.push(rest.slice(0, idx));
    parts.push(null);
    rest = rest.slice(idx + 3);
  }
  if (rest) parts.push(rest);
  return parts;
}

export function FillInTheBlankExercise({
  codeTemplate,
  options,
  onChange,
  submitted,
  isCorrect = false,
  hideOptions = false,
  hideCode = false,
  externalFilled,
  onExternalFilledChange,
}: FillInTheBlankProps) {
  const parts = parseTemplate(codeTemplate);
  const blankCount = parts.filter((p) => p === null).length;

  const [internalFilled, setInternalFilled] = useState<(string | null)[]>(Array(blankCount).fill(null));
  const isControlled = externalFilled !== undefined;
  const filled = isControlled ? externalFilled : internalFilled;
  const setFilled = onExternalFilledChange || setInternalFilled;

  const [prevSubmitted, setPrevSubmitted] = useState(submitted);

  useEffect(() => {
    if (prevSubmitted && !submitted) {
      setFilled(Array(blankCount).fill(null));
      onChange("", false);
    }
    setPrevSubmitted(submitted);
  }, [submitted, prevSubmitted, blankCount, onChange, setFilled]);

  const handleOptionClick = (option: string) => {
    if (submitted) return;
    const idx = filled.findIndex((f) => f === null);
    if (idx === -1) return;
    const next = [...filled];
    next[idx] = option;
    setFilled(next);
    onChange(JSON.stringify(next), !next.some((f) => f === null));
  };

  const handleBlankClick = (blankIdx: number) => {
    if (submitted) return;
    const next = [...filled];
    next[blankIdx] = null;
    setFilled(next);
    onChange(JSON.stringify(next), false);
  };

  const isWrong = submitted && !isCorrect;

  const cleanOptions = (options || []).filter(Boolean);
  let blankIdx = 0;

  return (
    <motion.div
      animate={isWrong ? { x: [-8, 8, -6, 6, -4, 4, 0] } : {}}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* ── Code display with blanks ── */}
      {!hideCode && (
        <div className="bg-[#1f2937] rounded-2xl p-5 border-2 border-[#374151] shadow-[0_4px_0_#111827] font-mono text-base leading-relaxed whitespace-pre-wrap break-words">
          {parts.map((part, i) => {
            if (part !== null) {
              return (
                <span key={i} className="text-[#e5e7eb]">
                  {part}
                </span>
              );
            }
            const bi = blankIdx++;
            const val = filled[bi];
            return (
              <button
                key={i}
                type="button"
                onClick={() => handleBlankClick(bi)}
                disabled={submitted}
                className={`min-w-[75px] px-3 py-1.5 mx-1 rounded-lg border-2 border-dashed font-mono text-sm transition-all inline-flex justify-center items-center align-middle cursor-pointer
                  ${val
                    ? submitted
                      ? isCorrect
                        ? "bg-emerald-900/40 border-emerald-500 text-emerald-300 font-bold"
                        : "bg-red-900/40 border-red-500 text-red-300 line-through"
                      : "bg-amber-400/20 border-amber-400 text-amber-300 font-bold shadow-[0_0_12px_rgba(251,191,36,0.3)] hover:border-amber-300"
                    : "bg-slate-800/80 border-cyan-500/50 text-cyan-300/80 hover:border-cyan-400 hover:bg-cyan-500/10"
                  }`}
              >
                {val ?? "___"}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Option blocks ── */}
      {!hideOptions && (
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
            Selecciona los bloques
          </p>
          <div className="flex flex-wrap gap-2.5">
            {cleanOptions.map((opt, optIndex) => {
              return (
                <button
                  key={`${opt}-${optIndex}`}
                  type="button"
                  onClick={() => handleOptionClick(opt)}
                  disabled={submitted}
                  className={`px-4 py-2.5 rounded-xl border-2 border-b-[4px] font-mono font-bold text-sm transition-all select-none cursor-pointer
                    ${submitted
                      ? "bg-slate-800/40 border-slate-700/60 border-b-slate-800 text-slate-500 cursor-not-allowed opacity-50"
                      : "bg-slate-800/90 border-slate-600/80 border-b-slate-700 text-slate-100 hover:-translate-y-0.5 hover:shadow-lg hover:border-cyan-400 hover:border-b-cyan-500 hover:text-cyan-300 active:translate-y-0.5"
                    }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}
