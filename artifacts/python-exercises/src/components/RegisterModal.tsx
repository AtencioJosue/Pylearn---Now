import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, User, Mail, Lock, Sparkles } from "lucide-react";
import { useUser } from "@/context/UserContext";

export function RegisterModal() {
  const { showRegister, setShowRegister, register, login } = useUser();
  const [isLogin, setIsLogin] = useState(true); // Toggle between Login and Register
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setError("Todos los campos de credenciales son obligatorios");
      return;
    }

    if (!isLogin) {
      const trimmedName = name.trim();
      if (!trimmedName || trimmedName.length < 2) {
        setError("El nombre debe tener al menos 2 caracteres");
        return;
      }
      setLoading(true);
      setError("");
      try {
        await register(trimmedName, trimmedEmail, trimmedPassword);
      } catch (err: any) {
        setError(
          err.message || "No se pudo registrar el usuario. Inténtalo de nuevo.",
        );
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(true);
      setError("");
      try {
        await login(trimmedEmail, trimmedPassword);
      } catch (err: any) {
        setError(
          err.message || "Error al iniciar sesión. Verifica tus credenciales.",
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const handleToggleMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setName("");
    setEmail("");
    setPassword("");
  };

  return showRegister ? (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ type: "spring", duration: 0.4 }}
        className="w-full max-w-md overflow-hidden rounded-[2.5rem] bg-[#364654] p-8 shadow-2xl border-4 border-[#1CB0F6]/20 text-[#E5E5E5]"
        style={{
          boxShadow:
            "0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 40px rgba(28, 176, 246, 0.1)",
        }}
      >
        {/* Header / Brand Logo */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#1CB0F6] flex items-center justify-center shadow-lg shadow-[#1CB0F6]/30 mb-3 animate-pulse-soft">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-display font-black tracking-tight text-white mb-1">
            Pylearn
          </h1>
          <p className="text-sm text-slate-300">
            {isLogin
              ? "Inicia sesión para continuar tu aventura de programación"
              : "Regístrate para guardar tu progreso y unirte a la comunidad"}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 gap-2 bg-[#161D24] p-1 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => !isLogin && handleToggleMode()}
            className={`py-2 px-4 rounded-xl font-bold text-sm transition-all duration-300 ${
              isLogin
                ? "bg-[#1CB0F6] text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => isLogin && handleToggleMode()}
            className={`py-2 px-4 rounded-xl font-bold text-sm transition-all duration-300 ${
              !isLogin
                ? "bg-[#1CB0F6] text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Crear Cuenta
          </button>
        </div>

        {/* Dual Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? "login_fields" : "register_fields"}
              initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Name field (Register only) */}
              {!isLogin && (
                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-slate-300 mb-1.5 block">
                    Nombre de Usuario
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Tu nombre o apodo..."
                      maxLength={50}
                      className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-slate-600/40 focus:border-[#1CB0F6] focus:outline-none font-medium text-white bg-[#161D24] transition-colors"
                      required
                      autoFocus
                    />
                  </div>
                </div>
              )}

              {/* Email field */}
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-300 mb-1.5 block">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ejemplo@correo.com"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-slate-600/40 focus:border-[#1CB0F6] focus:outline-none font-medium text-white bg-[#161D24] transition-colors"
                    required
                    autoFocus={isLogin}
                  />
                </div>
              </div>

              {/* Password field */}
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-300 mb-1.5 block">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-slate-600/40 focus:border-[#1CB0F6] focus:outline-none font-medium text-white bg-[#161D24] transition-colors"
                    required
                  />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Error Box */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border-2 border-red-500/30 text-red-300 p-3 rounded-2xl text-xs font-semibold"
            >
              {error}
            </motion.div>
          )}

          {/* Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 bg-[#1CB0F6] hover:bg-[#158fc7] text-white rounded-2xl font-extrabold text-base transition-all duration-300 active:scale-98 flex items-center justify-center gap-2 shadow-lg shadow-[#1CB0F6]/20 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                {isLogin ? "Iniciar Sesión" : "Comenzar Aventura"}
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => setShowRegister(false)}
            className="w-full py-2 text-sm font-bold text-slate-300 hover:text-white transition-colors"
          >
            Continuar como invitado
          </button>
          <p className="text-center text-xs text-slate-400">
            Puedes probar el editor sin cuenta; tu proyecto se guardará en este
            navegador.
          </p>
        </form>
      </motion.div>
    </motion.div>
  ) : null;
}
