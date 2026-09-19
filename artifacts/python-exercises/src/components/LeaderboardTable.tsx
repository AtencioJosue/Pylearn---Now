import React from 'react';
import { motion } from 'framer-motion';

export interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  weeklyXp: number;
  isCurrentUser: boolean;
  streak: number;
}

export interface LeaderboardTableProps {
  users: LeaderboardUser[];
}

export function LeaderboardTable({ users }: LeaderboardTableProps) {
  // Ordenar por XP semanal de mayor a menor
  const sortedUsers = [...users].sort((a, b) => b.weeklyXp - a.weeklyXp);

  return (
    <div className="pylearn-card overflow-hidden p-0 rounded-2xl border-[var(--linea-conexion)]">
      
      {/* Cabecera de Tabla */}
      <div className="grid grid-cols-12 gap-4 p-4 border-b border-[var(--linea-conexion)] bg-[var(--bg-general)] text-xs font-bold text-[var(--texto-principal)] opacity-70 uppercase tracking-wider">
        <div className="col-span-2 text-center">Posición</div>
        <div className="col-span-7">Estudiante</div>
        <div className="col-span-3 text-right pr-4">XP Semanal</div>
      </div>

      {/* Filas */}
      <div className="flex flex-col relative">
        {sortedUsers.map((user, index) => {
          const position = index + 1;
          const isPromotionZone = position <= 5;
          const isDemotionZone = position > 25;
          const isSafeZone = !isPromotionZone && !isDemotionZone;

          let badgeColor = "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
          if (position === 1) badgeColor = "bg-yellow-400 text-yellow-900 ring-4 ring-yellow-400/30";
          else if (position === 2) badgeColor = "bg-slate-300 text-slate-700 ring-4 ring-slate-300/30";
          else if (position === 3) badgeColor = "bg-amber-600 text-amber-50 ring-4 ring-amber-600/30";

          return (
            <motion.div 
              key={user.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`
                grid grid-cols-12 gap-4 p-4 items-center border-b border-[var(--linea-conexion)]/50 transition-colors relative
                ${user.isCurrentUser ? 'bg-[#1CB0F6]/10 dark:bg-[#1CB0F6]/15' : 'hover:bg-[var(--bg-general)]/40'}
              `}
            >
              {/* Indicadores de Zona */}
              {position === 5 && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-emerald-400" />
              )}
              {position === 25 && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-red-400" />
              )}
              
              {/* Posición */}
              <div className="col-span-2 flex justify-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${badgeColor}`}>
                  {position}
                </div>
              </div>

              {/* Info de Estudiante */}
              <div className="col-span-7 flex items-center gap-4">
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  className={`w-12 h-12 rounded-full object-cover border-2 ${user.isCurrentUser ? 'border-[#1CB0F6]' : 'border-[var(--linea-conexion)]'}`}
                />
                <div className="flex flex-col">
                  <span className={`font-bold text-base ${user.isCurrentUser ? 'text-[#1CB0F6] dark:text-[#1CB0F6]' : 'text-[var(--texto-principal)]'}`}>
                    {user.name} {user.isCurrentUser && "(Tú)"}
                  </span>
                  <span className="text-xs font-semibold text-orange-500 flex items-center gap-1">
                    🔥 {user.streak} días
                  </span>
                </div>
              </div>

              {/* XP */}
              <div className="col-span-3 text-right pr-4">
                <span className={`font-black text-lg ${user.isCurrentUser ? 'text-[#1CB0F6] dark:text-[#1CB0F6]' : 'text-[var(--texto-principal)]'}`}>
                  {user.weeklyXp} <span className="text-xs text-[var(--texto-principal)] opacity-60">XP</span>
                </span>
              </div>
              
            </motion.div>
          );
        })}

        {/* Banners flotantes de zonas */}
        <div className="absolute top-[350px] -right-2 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-l-md shadow-lg rotate-90 origin-bottom-right hidden md:block">
          ZONA DE ASCENSO ⚡
        </div>
        <div className="absolute bottom-[100px] -right-2 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-l-md shadow-lg rotate-90 origin-bottom-right hidden md:block">
          ZONA DE DESCENSO 💀
        </div>

      </div>
    </div>
  );
}
