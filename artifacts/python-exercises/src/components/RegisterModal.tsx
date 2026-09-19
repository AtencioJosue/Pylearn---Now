import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  KeyRound,
  Lock,
  Mail,
  RefreshCw,
  Sparkles,
  User,
} from "lucide-react";
import { useUser } from "@/context/UserContext";

type View = "auth" | "verify" | "forgot" | "reset";

export function RegisterModal() {
  const {
    showRegister,
    setShowRegister,
    register,
    verifyEmail,
    resendVerification,
    login,
    requestPasswordReset,
    resetPassword,
  } = useUser();
  const [isLogin, setIsLogin] = useState(true);
  const [view, setView] = useState<View>("auth");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [debugCode, setDebugCode] = useState("");

  if (!showRegister) return null;

  const resetMessages = () => {
    setError("");
    setMessage("");
    setDebugCode("");
  };

  const handleAuthSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password;
    resetMessages();

    if (!cleanEmail || !cleanPassword) {
      setError("El correo y la contraseña son obligatorios.");
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login(cleanEmail, cleanPassword);
      } else {
        const cleanName = name.trim();
        if (cleanName.length < 2) {
          setError("El nombre debe tener al menos 2 caracteres.");
          return;
        }
        const result = await register(cleanName, cleanEmail, cleanPassword);
        setEmail(cleanEmail);
        setView("verify");
        if (result.debugCode) setDebugCode(result.debugCode);
        setMessage("Te enviamos un código de verificación a tu correo.");
      }
    } catch (caughtError: any) {
      if (isLogin && caughtError?.code === "EMAIL_NOT_VERIFIED") {
        setEmail(cleanEmail);
        setView("verify");
        setMessage("Tu cuenta existe, pero primero debes verificar el correo.");
      } else {
        setError(caughtError instanceof Error ? caughtError.message : "No se pudo completar la operación.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (event: FormEvent) => {
    event.preventDefault();
    resetMessages();
    if (!/^\d{6}$/.test(code)) {
      setError("Escribe el código de 6 dígitos.");
      return;
    }
    setLoading(true);
    try {
      await verifyEmail(email.trim().toLowerCase(), code);
    } catch (caughtError: any) {
      setError(caughtError instanceof Error ? caughtError.message : "Código inválido.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    resetMessages();
    setLoading(true);
    try {
      const result = await resendVerification(email.trim().toLowerCase());
      setMessage("Si la cuenta está pendiente, enviamos un nuevo código.");
      if (result.debugCode) setDebugCode(result.debugCode);
    } catch (caughtError: any) {
      setError(caughtError instanceof Error ? caughtError.message : "No se pudo reenviar el código.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (event: FormEvent) => {
    event.preventDefault();
    resetMessages();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError("Escribe tu correo.");
      return;
    }
    setLoading(true);
    try {
      const result = await requestPasswordReset(cleanEmail);
      setEmail(cleanEmail);
      setView("reset");
      setMessage(result.message || "Si el correo existe, recibirás un código.");
      if (result.debugCode) setDebugCode(result.debugCode);
    } catch (caughtError: any) {
      setError(caughtError instanceof Error ? caughtError.message : "No se pudo solicitar la recuperación.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (event: FormEvent) => {
    event.preventDefault();
    resetMessages();
    if (!/^\d{6}$/.test(code)) {
      setError("Escribe el código de 6 dígitos.");
      return;
    }
    if (newPassword.length < 8) {
      setError("La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }
    setLoading(true);
    try {
      const result = await resetPassword(email.trim().toLowerCase(), code, newPassword);
      setView("auth");
      setIsLogin(true);
      setPassword("");
      setNewPassword("");
      setCode("");
      setMessage(result.message || "Contraseña actualizada. Ya puedes ingresar.");
    } catch (caughtError: any) {
      setError(caughtError instanceof Error ? caughtError.message : "No se pudo cambiar la contraseña.");
    } finally {
      setLoading(false);
    }
  };

  const changeView = (nextView: View) => {
    resetMessages();
    setView(nextView);
    setCode("");
    setNewPassword("");
  };

  const backToAuth = () => {
    resetMessages();
    setView("auth");
    setCode("");
    setNewPassword("");
  };

  const title =
    view === "verify"
      ? "Verifica tu correo"
      : view === "forgot" || view === "reset"
        ? "Recupera tu cuenta"
        : "Pylearn";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        className="w-full max-w-md overflow-hidden rounded-[2.5rem] bg-[#364654] p-8 shadow-2xl border-4 border-[#1CB0F6]/20 text-[#E5E5E5]"
      >
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#1CB0F6] flex items-center justify-center shadow-lg shadow-[#1CB0F6]/30 mb-3">
            {view === "verify" ? <Mail className="w-8 h-8 text-white" /> : view === "reset" ? <KeyRound className="w-8 h-8 text-white" /> : <BookOpen className="w-8 h-8 text-white" />}
          </div>
          <h1 className="text-3xl font-display font-black tracking-tight text-white mb-1">{title}</h1>
          <p className="text-sm text-slate-300">
            {view === "verify"
              ? `Escribe el código enviado a ${email}`
              : view === "forgot"
                ? "Te enviaremos un código para recuperar el acceso"
                : view === "reset"
                  ? "El código caduca pronto y solo funciona una vez"
                  : isLogin
                    ? "Inicia sesión para continuar tu aventura de programación"
                    : "Regístrate para guardar tu progreso y unirte a la comunidad"}
          </p>
        </div>

        {view === "auth" && (
          <div className="grid grid-cols-2 gap-2 bg-[#161D24] p-1 rounded-2xl mb-6">
            <button type="button" onClick={() => { setIsLogin(true); resetMessages(); }} className={`py-2 px-4 rounded-xl font-bold text-sm ${isLogin ? "bg-[#1CB0F6] text-white" : "text-slate-400"}`}>Iniciar Sesión</button>
            <button type="button" onClick={() => { setIsLogin(false); resetMessages(); }} className={`py-2 px-4 rounded-xl font-bold text-sm ${!isLogin ? "bg-[#1CB0F6] text-white" : "text-slate-400"}`}>Crear Cuenta</button>
          </div>
        )}

        {view === "auth" && (
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-300 mb-1.5 block">Nombre de usuario</label>
                <div className="relative"><User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input value={name} onChange={(event) => setName(event.target.value)} maxLength={50} placeholder="Tu nombre o apodo..." className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-slate-600/40 focus:border-[#1CB0F6] focus:outline-none font-medium text-white bg-[#161D24]" required /></div>
              </div>
            )}
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-slate-300 mb-1.5 block">Correo electrónico</label>
              <div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="ejemplo@correo.com" className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-slate-600/40 focus:border-[#1CB0F6] focus:outline-none font-medium text-white bg-[#161D24]" required /></div>
            </div>
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-slate-300 mb-1.5 block">Contraseña</label>
              <div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} placeholder="Mínimo 8 caracteres" className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-slate-600/40 focus:border-[#1CB0F6] focus:outline-none font-medium text-white bg-[#161D24]" required /></div>
            </div>
            {isLogin && <button type="button" onClick={() => changeView("forgot")} className="text-xs text-[#8edcff] hover:text-white font-bold">¿Olvidaste tu contraseña?</button>}
            <ActionButton loading={loading}>{isLogin ? "Iniciar Sesión" : "Crear cuenta"}</ActionButton>
            <button type="button" onClick={() => setShowRegister(false)} className="w-full py-2 text-sm font-bold text-slate-300 hover:text-white">Continuar como invitado</button>
            <p className="text-center text-xs text-slate-400">Tu cuenta necesitará verificación por correo antes de entrar.</p>
          </form>
        )}

        {view === "verify" && (
          <form onSubmit={handleVerify} className="space-y-4">
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" className="w-full px-4 py-3 rounded-2xl bg-[#161D24] text-white border-2 border-slate-600/40 focus:border-[#1CB0F6] outline-none" required />
            <input value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" placeholder="000000" className="w-full text-center tracking-[0.6em] text-2xl font-black px-4 py-4 rounded-2xl bg-[#161D24] text-white border-2 border-slate-600/40 focus:border-[#1CB0F6] outline-none" required />
            <ActionButton loading={loading}>Verificar correo</ActionButton>
            <button type="button" onClick={handleResend} disabled={loading} className="w-full py-2 text-sm font-bold text-[#8edcff] hover:text-white flex items-center justify-center gap-2"><RefreshCw className="w-4 h-4" /> Reenviar código</button>
            <button type="button" onClick={backToAuth} className="w-full py-2 text-sm font-bold text-slate-300 hover:text-white flex items-center justify-center gap-2"><ArrowLeft className="w-4 h-4" /> Volver</button>
          </form>
        )}

        {view === "forgot" && (
          <form onSubmit={handleForgot} className="space-y-4">
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Tu correo registrado" className="w-full px-4 py-3 rounded-2xl bg-[#161D24] text-white border-2 border-slate-600/40 focus:border-[#1CB0F6] outline-none" required />
            <ActionButton loading={loading}>Enviar código</ActionButton>
            <button type="button" onClick={backToAuth} className="w-full py-2 text-sm font-bold text-slate-300 hover:text-white flex items-center justify-center gap-2"><ArrowLeft className="w-4 h-4" /> Volver al inicio de sesión</button>
          </form>
        )}

        {view === "reset" && (
          <form onSubmit={handleReset} className="space-y-4">
            <input value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" placeholder="Código de 6 dígitos" className="w-full text-center tracking-[0.4em] text-xl font-black px-4 py-4 rounded-2xl bg-[#161D24] text-white border-2 border-slate-600/40 focus:border-[#1CB0F6] outline-none" required />
            <input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} minLength={8} placeholder="Nueva contraseña" className="w-full px-4 py-3 rounded-2xl bg-[#161D24] text-white border-2 border-slate-600/40 focus:border-[#1CB0F6] outline-none" required />
            <ActionButton loading={loading}>Cambiar contraseña</ActionButton>
            <button type="button" onClick={backToAuth} className="w-full py-2 text-sm font-bold text-slate-300 hover:text-white flex items-center justify-center gap-2"><ArrowLeft className="w-4 h-4" /> Cancelar</button>
          </form>
        )}

        {message && <div className="mt-4 rounded-2xl border border-[#1CB0F6]/40 bg-[#1CB0F6]/10 p-3 text-sm text-sky-100">{message}</div>}
        {debugCode && <div className="mt-3 rounded-2xl border border-amber-300/40 bg-amber-300/10 p-3 text-xs text-amber-100">Modo local: código de prueba <strong className="tracking-widest">{debugCode}</strong></div>}
        {error && <div role="alert" className="mt-4 bg-red-500/10 border-2 border-red-500/30 text-red-300 p-3 rounded-2xl text-xs font-semibold">{error}</div>}
      </motion.div>
    </motion.div>
  );
}

function ActionButton({ loading, children }: { loading: boolean; children: string }) {
  return (
    <button type="submit" disabled={loading} className="w-full py-3.5 px-6 bg-[#1CB0F6] hover:bg-[#158fc7] text-white rounded-2xl font-extrabold text-base transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#1CB0F6]/20 disabled:opacity-50">
      {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Sparkles className="w-5 h-5" />{children}</>}
    </button>
  );
}
