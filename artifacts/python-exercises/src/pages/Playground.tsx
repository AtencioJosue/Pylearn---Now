import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Workbench } from "@/features/playground/Workbench";
import { ExerciseCreator } from "@/features/playground/ExerciseCreator";
import { Code2, Sparkles } from "lucide-react";
export function Playground() {
  const [tab, setTab] = useState<"editor" | "creator">("editor");
  return (
    <div className="min-h-screen page-bg flex flex-col">
      <Navbar />
      <main className="flex-1 min-w-0 px-2 sm:px-4 py-3">
        <div className="flex gap-2 mb-3 text-sm font-bold">
          <button
            onClick={() => setTab("editor")}
            className={
              "flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--linea-conexion)] " +
              (tab === "editor"
                ? "bg-[var(--bg-tarjetas)] text-primary"
                : "text-[var(--texto-principal)] opacity-60")
            }
          >
            <Code2 size={16} />
            Editor libre
          </button>
          <button
            onClick={() => setTab("creator")}
            className={
              "flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--linea-conexion)] " +
              (tab === "creator"
                ? "bg-[var(--bg-tarjetas)] text-primary"
                : "text-[var(--texto-principal)] opacity-60")
            }
          >
            <Sparkles size={16} />
            Crear ejercicio
          </button>
        </div>
        <div hidden={tab !== "editor"}>
          <Workbench />
        </div>
        {tab === "creator" && <ExerciseCreator />}
      </main>
    </div>
  );
}
