import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export interface LeagueHeaderProps {
  leagueTier: number;
}

export function LeagueHeader({ leagueTier }: LeagueHeaderProps) {
  const leagueNames = ["Bronce", "Plata", "Oro", "Rubí", "Esmeralda", "Diamante"];
  const leagueColors = [
    "from-orange-700 to-yellow-600", // Bronce
    "from-slate-300 to-slate-500", // Plata
    "from-yellow-400 to-amber-600", // Oro
    "from-red-500 to-rose-700", // Rubí
    "from-emerald-400 to-green-600", // Esmeralda
    "from-cyan-300 to-blue-500" // Diamante
  ];
  
  const currentLeagueName = leagueNames[leagueTier - 1] || "Bronce";
  const currentLeagueColor = leagueColors[leagueTier - 1] || leagueColors[0];

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });

  // Calcular el tiempo restante hasta el domingo a medianoche
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      // En JavaScript, 0 es Domingo.
      // Si hoy es domingo, faltan 0 días para el "próximo domingo" si la hora es < 23:59, 
      // pero lógicamente es más fácil usar matemática de días de la semana (Lunes = 1... Domingo = 7)
      
      // Lógica de hora Global (UTC)
      // getUTCDay() devuelve 0 para Domingo, 1 para Lunes, etc.
      const dayOfWeek = now.getUTCDay() === 0 ? 7 : now.getUTCDay();
      const daysUntilNextMonday = 8 - dayOfWeek; // Días que faltan para el próximo Lunes
      
      const nextMondayUTC = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() + (dayOfWeek === 1 && now.getUTCHours() === 0 && now.getUTCMinutes() === 0 ? 0 : daysUntilNextMonday),
        0, 0, 0
      ));
      
      const difference = nextMondayUTC.getTime() - now.getTime();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000); // Actualizar cada minuto
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-[var(--bg-tarjetas)] border-4 border-[var(--linea-conexion)] rounded-3xl p-8 text-[var(--texto-principal)] relative overflow-hidden shadow-xl transition-all duration-300">
      {/* Background decorations */}
      <div className={`absolute top-0 right-0 w-96 h-96 bg-gradient-to-br ${currentLeagueColor} opacity-15 dark:opacity-25 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3`} />
      <div className={`absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr ${currentLeagueColor} opacity-10 dark:opacity-15 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4`} />
      
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        {/* League Info */}
        <div className="flex items-center gap-6">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className={`w-24 h-28 rounded-xl bg-gradient-to-br ${currentLeagueColor} flex items-center justify-center shadow-[0_10px_25px_-5px_rgba(0,0,0,0.15)] dark:shadow-[0_0_30px_rgba(0,0,0,0.5)] border-2 border-white/20`}
            style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}
          >
            <span className="text-4xl">🏆</span>
          </motion.div>
          
          <div>
            <h1 className="text-sm font-bold text-[var(--texto-principal)] opacity-60 uppercase tracking-wider mb-1">Liga Actual</h1>
            <h2 className={`text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r ${currentLeagueColor}`}>
              {currentLeagueName}
            </h2>
            <p className="text-[var(--texto-principal)] opacity-70 mt-2 max-w-sm font-medium">
              Compite contra otros 30 estudiantes. Los 5 mejores avanzan a la siguiente liga.
            </p>
          </div>
        </div>

        {/* Countdown Timer */}
        <div className="bg-[var(--bg-general)]/80 backdrop-blur-md border border-[var(--linea-conexion)] rounded-2xl p-5 flex flex-col items-center min-w-[200px]">
          <span className="text-xs font-bold text-[var(--texto-principal)] opacity-60 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Termina en
          </span>
          <div className="flex gap-4 text-center">
            <div className="flex flex-col">
              <span className="text-3xl font-black font-mono text-[var(--texto-principal)]">{timeLeft.days}</span>
              <span className="text-[10px] font-bold text-[var(--texto-principal)] opacity-50 uppercase tracking-wider">días</span>
            </div>
            <span className="text-3xl font-black text-primary dark:text-[#1CB0F6]">:</span>
            <div className="flex flex-col">
              <span className="text-3xl font-black font-mono text-[var(--texto-principal)]">{timeLeft.hours.toString().padStart(2, '0')}</span>
              <span className="text-[10px] font-bold text-[var(--texto-principal)] opacity-50 uppercase tracking-wider">hrs</span>
            </div>
            <span className="text-3xl font-black text-primary dark:text-[#1CB0F6]">:</span>
            <div className="flex flex-col">
              <span className="text-3xl font-black font-mono text-[var(--texto-principal)]">{timeLeft.minutes.toString().padStart(2, '0')}</span>
              <span className="text-[10px] font-bold text-[var(--texto-principal)] opacity-50 uppercase tracking-wider">min</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
