import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, User, Sparkles } from "lucide-react";
import { useUser } from "@/context/UserContext";

export function RegisterModal() {
  const { showRegister, register } = useUser();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || trimmed.length < 2) {
      setError("El nombre debe tener al menos 2 caracteres");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await register(trimmed);
    } catch {
      setError("Ocurrió un error. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {showRegister && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
          >
            <div className="flex flex-col items-center mb-8 text-center">
              <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 mb-4">
                <BookOpen className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-display font-bold mb-2">Bienvenido a PyLearn</h1>
              <p className="text-muted-foreground">
                Crea tu perfil para guardar tu progreso, desbloquear logros y conectar con la comunidad.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-bold text-foreground mb-2 block">
                  ¿Cómo te llamas?
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Tu nombre o apodo..."
                    maxLength={50}
                    className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-border focus:border-primary focus:outline-none font-medium text-foreground bg-muted/30 transition-colors"
                    autoFocus
                  />
                </div>
                {error && <p className="text-red-500 text-sm mt-2 font-medium">{error}</p>}
                <p className="text-xs text-muted-foreground mt-2">
                  Se te asignará un ID único para identificar tu progreso.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || !name.trim()}
                className="w-full py-3 px-6 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Comenzar aventura
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
