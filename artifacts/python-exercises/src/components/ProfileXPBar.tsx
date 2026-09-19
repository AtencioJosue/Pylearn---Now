import React from 'react';
import { motion } from 'framer-motion';

export interface ProfileXPBarProps {
  currentLevel: number;
  xpInCurrentLevel: number;
  xpNeededForNextLevel: number;
  percentage: number;
  leagueTier: number;
  className?: string;
}

export function ProfileXPBar({
  currentLevel,
  xpInCurrentLevel,
  xpNeededForNextLevel,
  percentage,
  leagueTier,
  className = "",
}: ProfileXPBarProps) {
  
  const leagueNames = ["Bronce", "Plata", "Oro", "Rubí", "Esmeralda", "Diamante"];
  const leagueColors = [
    "from-orange-700 to-yellow-600", // Bronce
    "from-gray-300 to-gray-500", // Plata
    "from-yellow-400 to-yellow-600", // Oro
    "from-red-500 to-rose-700", // Rubí
    "from-emerald-400 to-green-600", // Esmeralda
    "from-cyan-300 to-blue-500" // Diamante
  ];
  
  const currentLeagueName = leagueNames[leagueTier - 1] || "Bronce";
  const currentLeagueColor = leagueColors[leagueTier - 1] || leagueColors[0];

  return (
    <div className={`p-6 rounded-3xl bg-[var(--bg-tarjetas)] shadow-xl border border-[var(--linea-conexion)] flex flex-col gap-4 ${className}`}>
      
      {/* Cabecera del Perfil */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br ${currentLeagueColor} text-white font-bold text-2xl shadow-lg ring-4 ring-[var(--bg-tarjetas)]`}>
              {currentLevel}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-slate-800 dark:bg-slate-700 text-white text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-wider border-2 border-[var(--bg-tarjetas)]">
              Nivel
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[var(--texto-principal)]">Tu Progreso</h2>
            <p className="text-sm font-medium text-[var(--texto-principal)] opacity-70">
              Liga actual: <span className={`bg-clip-text text-transparent bg-gradient-to-r ${currentLeagueColor} font-black uppercase`}>{currentLeagueName}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Barra de Progreso XP */}
      <div className="mt-2 group relative cursor-help">
        <div className="flex justify-between text-xs font-bold text-[var(--texto-principal)] opacity-60 mb-2 uppercase tracking-wide">
          <span>Progreso de Nivel</span>
          <span>{xpInCurrentLevel} / {xpNeededForNextLevel} XP</span>
        </div>
        
        <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner border border-[var(--linea-conexion)]/10">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 relative"
          >
            {/* Brillo animado */}
            <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
          </motion.div>
        </div>
        
        {/* Tooltip on hover */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs px-3 py-1.5 rounded shadow-lg pointer-events-none whitespace-nowrap z-10">
          ¡Faltan {xpNeededForNextLevel - xpInCurrentLevel} XP para el Nivel {currentLevel + 1}!
        </div>
      </div>
    </div>
  );
}
