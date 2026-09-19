import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { Sword, Shield, Zap, Flame, Code2, Trash2, Trophy, Heart, Skull } from "lucide-react";
import { useGamification } from "@/context/GamificationContext";
import { Button } from "@/components/ui/button";
import { soundEngine } from "@/utils/sound";

// --- Tipos ---
type EntityStats = {
  nombre: string;
  vida: number;
  maxVida: number;
  escudo: number;
  fuerza: number;
  spriteUrl: string;
  color: string;
};

type CodeCard = {
  id: string;
  code: string;
  description: string;
  didacticText: string;
  type: "ataque" | "defensa" | "especial" | "debuff";
  effect: (player: EntityStats, enemy: EntityStats) => { sound: 'attack' | 'heal' | 'hit' | 'error', log: string };
};

// --- Datos de Nivel ---
const PLAYER_INIT: EntityStats = {
  nombre: "héroe",
  vida: 100, maxVida: 100,
  escudo: 0,
  fuerza: 10,
  spriteUrl: "/images/arena_sprite_heroe.png", // Asumimos que pondremos las imágenes aquí
  color: "text-blue-500"
};

const ENEMIES: EntityStats[] = [
  { nombre: "Slime de Asignaciones", vida: 50, maxVida: 50, escudo: 0, fuerza: 5, spriteUrl: "/images/arena_sprite_slime.png", color: "text-green-500" },
  { nombre: "Duende Lógico", vida: 100, maxVida: 100, escudo: 10, fuerza: 10, spriteUrl: "/images/arena_sprite_goblin.png", color: "text-orange-500" },
  { nombre: "Dragón Sintáctico", vida: 200, maxVida: 200, escudo: 30, fuerza: 20, spriteUrl: "/images/arena_sprite_dragon.png", color: "text-red-500" },
  { nombre: "Hydra de Bucles", vida: 400, maxVida: 400, escudo: 50, fuerza: 30, spriteUrl: "/images/arena_sprite_hydra.png", color: "text-purple-500" },
];

const ALL_CARDS: CodeCard[] = [
  { 
    id: "c1", code: "enemigo['vida'] -= heroe['fuerza']", 
    description: "Ataque básico usando tu fuerza.", 
    didacticText: "Resta tu fuerza a la clave 'vida' del diccionario del enemigo.",
    type: "ataque", 
    effect: (p, e) => { e.vida -= p.fuerza; return { sound: 'attack', log: `⚔️ Héroe ataca con ${p.fuerza} de daño!`}; } 
  },
  { 
    id: "c2", code: "heroe['escudo'] += 20", 
    description: "Añade 20 puntos de escudo temporal.", 
    didacticText: "Suma 20 al valor numérico asociado a la clave 'escudo'.",
    type: "defensa", 
    effect: (p, e) => { p.escudo += 20; return { sound: 'heal', log: `🛡️ Héroe gana 20 de escudo.`}; } 
  },
  { 
    id: "c3", code: "enemigo['escudo'] = 0", 
    description: "Rompe todo el escudo del enemigo.", 
    didacticText: "Asigna exactamente 0 a la clave 'escudo', sobreescribiéndolo.",
    type: "debuff", 
    effect: (p, e) => { e.escudo = 0; return { sound: 'hit', log: `💥 Escudo enemigo destruido.`}; } 
  },
  { 
    id: "c4", code: "heroe['fuerza'] *= 2", 
    description: "Duplica tu fuerza actual.", 
    didacticText: "Multiplica el valor actual de la clave 'fuerza' por 2.",
    type: "especial", 
    effect: (p, e) => { p.fuerza *= 2; return { sound: 'heal', log: `⚡ Fuerza del héroe multiplicada a ${p.fuerza}!`}; } 
  },
  { 
    id: "c5", code: "enemigo['vida'] -= len([1, 2, 3]) * 10", 
    description: "Daño basado en la longitud de una lista.", 
    didacticText: "Calcula len() que es 3, multiplica por 10, y resta 30 a la vida.",
    type: "ataque", 
    effect: (p, e) => { e.vida -= 30; return { sound: 'attack', log: `⚔️ Ataque de Lista inflige 30 de daño!`}; } 
  },
  { 
    id: "c6", code: "if heroe['vida'] < 50: heroe['vida'] += 40", 
    description: "Curación condicional de emergencia.", 
    didacticText: "Solo suma 40 si la condición booleana (< 50) es Verdadera.",
    type: "defensa", 
    effect: (p, e) => { 
      if (p.vida < 50) {
        p.vida = Math.min(p.maxVida, p.vida + 40);
        return { sound: 'heal', log: `💚 Condición cumplida. Héroe curado.`};
      }
      return { sound: 'error', log: `❌ Condición falsa. La curación falló.`};
    } 
  },
  { 
    id: "c7", code: "enemigo['fuerza'] = enemigo['fuerza'] // 2", 
    description: "Divide la fuerza enemiga a la mitad entera.", 
    didacticText: "Operador de división entera (//). Reduce el daño enemigo a la mitad.",
    type: "debuff", 
    effect: (p, e) => { e.fuerza = Math.floor(e.fuerza / 2); return { sound: 'hit', log: `📉 Fuerza enemiga reducida a ${e.fuerza}.`}; } 
  },
];

// ── RENDERIZADOR DE PERSONAJES (SVG PREMIUM ULTRA-QUALITY) ───────────────
function CharacterRenderer({ name, isPlayer, isHit, isDead }: { name: string; isPlayer: boolean; isHit: boolean; isDead: boolean }) {
  if (isDead) {
    return (
      <div className="opacity-30 filter grayscale scale-75 transition-all duration-1000 flex items-center justify-center">
        <Skull className="w-20 h-20 text-slate-600 animate-pulse" />
      </div>
    );
  }

  const hitFilter = isHit ? "brightness(2.2) drop-shadow(0 0 20px #ef4444)" : "none";

  if (isPlayer) {
    return (
      <svg className="w-36 h-36 drop-shadow-[0_15px_20px_rgba(0,0,0,0.65)] hover:scale-105 transition-transform duration-300" viewBox="0 0 120 120" style={{ filter: hitFilter }}>
        <defs>
          <linearGradient id="heroBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="60%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>
          <linearGradient id="heroVisor" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
          <linearGradient id="heroSword" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="50%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>
          <linearGradient id="goldAura" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#eab308" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#facc15" stopOpacity="0" />
          </linearGradient>
          <filter id="ultraGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <g className="animate-[float-slow_2.4s_infinite_ease-in-out]">
          {/* Cyber-Cape with tech line details */}
          <path d="M40 50 C22 50 15 90 28 98 C42 102 52 85 52 60 Z" fill="#4f46e5" opacity="0.85" stroke="#6366f1" strokeWidth="1" />
          <path d="M38 58 L24 88" stroke="#818cf8" strokeWidth="1" opacity="0.4" strokeDasharray="3 3" />

          {/* Hero Suit / Armor plates */}
          <rect x="40" y="50" width="36" height="42" rx="12" fill="url(#heroBody)" stroke="#475569" strokeWidth="2.5" />
          
          {/* Arc Reactor Core on Chest */}
          <circle cx="58" cy="65" r="7" fill="#0f172a" stroke="#22d3ee" strokeWidth="1.5" />
          <circle cx="58" cy="65" r="3.5" fill="#22d3ee" filter="url(#ultraGlow)" className="animate-pulse" />

          {/* Pauldrons (Shoulder pads) */}
          <path d="M36 52 C34 44 46 44 48 52 Z" fill="#334155" stroke="#475569" strokeWidth="1.5" />
          <path d="M72 52 C70 44 82 44 84 52 Z" fill="#334155" stroke="#475569" strokeWidth="1.5" />

          {/* Hero Head / High-tech Helmet */}
          <circle cx="58" cy="34" r="18" fill="url(#heroBody)" stroke="#475569" strokeWidth="2.5" />
          
          {/* Tactical Helmet Visor */}
          <path d="M44 30 C44 25 72 25 72 30 C72 36 44 36 44 30 Z" fill="url(#heroVisor)" filter="url(#ultraGlow)" className="animate-[cyber-blink_4s_infinite]" />
          <line x1="47" y1="30" x2="69" y2="30" stroke="#ffffff" strokeWidth="1" opacity="0.7" />

          {/* Cyber-Sword in Right Hand (Glowing Saber with energy sparks) */}
          <g transform="translate(86, 52) rotate(-18)">
            <rect x="-4" y="22" width="8" height="5" fill="#475569" rx="1.5" />
            <rect x="-1.5" y="27" width="3" height="8" fill="#1e293b" rx="1" />
            
            {/* The laser blade itself */}
            <path d="M-3 -35 L3 -35 L4.5 22 L-4.5 22 Z" fill="url(#heroSword)" filter="url(#ultraGlow)" />
            
            {/* Saber Spark particles */}
            <circle cx="0" cy="-10" r="1.5" fill="#ffffff" className="animate-ping" />
            <circle cx="-3" cy="-22" r="1" fill="#22d3ee" />
            <circle cx="3" cy="-5" r="1" fill="#22d3ee" />
          </g>

          {/* Translucent Cyber-Shield in Left Hand */}
          <g transform="translate(18, 52)">
            {/* Shield Outer rim */}
            <path d="M0 0 C0 0 0 20 12 28 C24 20 24 0 24 0 Z" fill="#0284c7" fillOpacity="0.2" stroke="#22d3ee" strokeWidth="2.5" filter="url(#ultraGlow)" />
            {/* Inner tech grids */}
            <path d="M4 6 L20 6 M4 14 L20 14" stroke="#0ea5e9" strokeWidth="1" opacity="0.6" />
            <circle cx="12" cy="14" r="4" fill="none" stroke="#22d3ee" strokeWidth="1.5" />
          </g>

          {/* Cyber Boots with landing lights */}
          <rect x="44" y="90" width="12" height="10" rx="3.5" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
          <rect x="60" y="90" width="12" height="10" rx="3.5" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
          <circle cx="50" cy="97" r="1.5" fill="#22d3ee" filter="url(#ultraGlow)" />
          <circle cx="66" cy="97" r="1.5" fill="#22d3ee" filter="url(#ultraGlow)" />
        </g>
      </svg>
    );
  }

  // ENEMY RENDERING
  if (name === "Slime de Asignaciones") {
    return (
      <svg className="w-36 h-36 drop-shadow-[0_15px_20px_rgba(0,0,0,0.65)] hover:scale-105 transition-transform duration-300" viewBox="0 0 120 120" style={{ filter: hitFilter }}>
        <defs>
          <linearGradient id="slimeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4ade80" />
            <stop offset="50%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#15803d" />
          </linearGradient>
          <filter id="slimeGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <g className="animate-[jelly-squish_1.8s_infinite_ease-in-out]">
          {/* Slime Translucent Gelatin Body */}
          <path d="M15 88 C8 70 25 30 60 30 C95 30 112 70 105 88 C100 98 20 98 15 88 Z" fill="url(#slimeGrad)" stroke="#22c55e" strokeWidth="3" />

          {/* Gel highlights and floating interior micro-particles */}
          <path d="M30 42 Q60 35 90 42" fill="none" stroke="#bbf7d0" strokeWidth="2.5" opacity="0.6" strokeLinecap="round" />
          <circle cx="38" cy="55" r="4.5" fill="#bbf7d0" opacity="0.5" />
          <circle cx="82" cy="65" r="3" fill="#bbf7d0" opacity="0.4" />
          <circle cx="60" cy="78" r="4" fill="#bbf7d0" opacity="0.3" />

          {/* Blushing cheeks */}
          <ellipse cx="32" cy="72" rx="7" ry="4" fill="#f43f5e" opacity="0.5" />
          <ellipse cx="88" cy="72" rx="7" ry="4" fill="#f43f5e" opacity="0.5" />

          {/* Assignment Operator logical display (=) */}
          <g transform="translate(60, 56)" filter="url(#slimeGlow)" className="animate-pulse">
            <line x1="-15" y1="-4" x2="15" y2="-4" stroke="#fef08a" strokeWidth="5" strokeLinecap="round" />
            <line x1="-15" y1="6" x2="15" y2="6" stroke="#fef08a" strokeWidth="5" strokeLinecap="round" />
          </g>

          {/* Animated blinking cute eyes */}
          <g>
            {/* Left Eye */}
            <circle cx="40" cy="64" r="5" fill="#0f172a" />
            <circle cx="38.5" cy="62.5" r="1.8" fill="#ffffff" />
            {/* Right Eye */}
            <circle cx="80" cy="64" r="5" fill="#0f172a" />
            <circle cx="78.5" cy="62.5" r="1.8" fill="#ffffff" />
          </g>
        </g>
      </svg>
    );
  }

  if (name === "Duende Lógico") {
    return (
      <svg className="w-36 h-36 drop-shadow-[0_15px_20px_rgba(0,0,0,0.65)] hover:scale-105 transition-transform duration-300" viewBox="0 0 120 120" style={{ filter: hitFilter }}>
        <defs>
          <linearGradient id="gobSkin" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fb923c" />
            <stop offset="100%" stopColor="#c2410c" />
          </linearGradient>
          <linearGradient id="gobLens" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
          <filter id="cyberGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <g className="animate-[float-slow_3.2s_infinite_ease-in-out]">
          {/* Pointy ears */}
          <path d="M34 40 C10 32 16 15 32 26 Z" fill="url(#gobSkin)" stroke="#9a3412" strokeWidth="2" />
          <path d="M86 40 C110 32 104 15 88 26 Z" fill="url(#gobSkin)" stroke="#9a3412" strokeWidth="2" />

          {/* Goblin head */}
          <circle cx="60" cy="38" r="24" fill="url(#gobSkin)" stroke="#9a3412" strokeWidth="2.5" />

          {/* Dark Cyber-Hood */}
          <path d="M32 36 C32 15 88 15 88 36 C88 46 32 46 32 36 Z" fill="#312e81" stroke="#4338ca" strokeWidth="1.5" />

          {/* Glowing Logic Scouter (cyber glasses) */}
          <rect x="42" y="32" width="36" height="12" rx="4" fill="#0f172a" stroke="#22d3ee" strokeWidth="2" />
          <circle cx="51" cy="38" r="4.5" fill="url(#gobLens)" filter="url(#cyberGlow)" />
          <circle cx="69" cy="38" r="4.5" fill="url(#gobLens)" filter="url(#cyberGlow)" />
          <line x1="56" y1="38" x2="64" y2="38" stroke="#06b6d4" strokeWidth="1.5" />

          {/* Robes */}
          <path d="M38 60 L82 60 L90 95 L30 95 Z" fill="#1e1b4b" stroke="#312e81" strokeWidth="2" />

          {/* Levitting Glowing Book of Boolean logic */}
          <g transform="translate(18, 62)" className="animate-[float-medium_2s_infinite_ease-in-out]">
            <rect x="0" y="0" width="22" height="28" rx="3" fill="#581c87" stroke="#a855f7" strokeWidth="1.5" />
            <line x1="4" y1="6" x2="18" y2="6" stroke="#c084fc" strokeWidth="2" />
            <line x1="4" y1="12" x2="18" y2="12" stroke="#c084fc" strokeWidth="1.5" />
            <path d="M11 18 L11 24" stroke="#ec4899" strokeWidth="2" filter="url(#cyberGlow)" />
          </g>

          {/* Orbiting Boolean logic runes */}
          <g filter="url(#cyberGlow)" className="animate-[pulse_1.5s_infinite]">
            <text x="14" y="30" fill="#ec4899" fontSize="11" fontWeight="black" fontFamily="monospace">&&</text>
            <text x="94" y="30" fill="#22d3ee" fontSize="11" fontWeight="black" fontFamily="monospace">||</text>
            <text x="60" y="10" fill="#10b981" fontSize="13" fontWeight="black" fontFamily="monospace">!</text>
          </g>
        </g>
      </svg>
    );
  }

  if (name === "Dragón Sintáctico") {
    return (
      <svg className="w-36 h-36 drop-shadow-[0_15px_20px_rgba(0,0,0,0.65)] hover:scale-105 transition-transform duration-300" viewBox="0 0 120 120" style={{ filter: hitFilter }}>
        <defs>
          <linearGradient id="dragBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="50%" stopColor="#be123c" />
            <stop offset="100%" stopColor="#4c0519" />
          </linearGradient>
          <linearGradient id="dragWings" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#e11d48" />
          </linearGradient>
          <filter id="dragonFireGlow" x="-35%" y="-35%" width="170%" height="170%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <g className="animate-[float-slow_2.8s_infinite_ease-in-out]">
          {/* Wing Left - Flapping with transform point */}
          <path d="M30 50 C5 32 10 8 36 36 Z" fill="url(#dragWings)" opacity="0.85" stroke="#f59e0b" strokeWidth="1.5"
            className="origin-[36px_36px] animate-[wing-flap-L_1.6s_infinite_ease-in-out]" />

          {/* Wing Right - Flapping with transform point */}
          <path d="M90 50 C115 32 110 8 84 36 Z" fill="url(#dragWings)" opacity="0.85" stroke="#f59e0b" strokeWidth="1.5"
            className="origin-[84px_36px] animate-[wing-flap-R_1.6s_infinite_ease-in-out]" />

          {/* Tail with glowing spike */}
          <path d="M34 85 C14 96 10 108 18 108 C30 108 34 95 34 85 Z" fill="url(#dragBody)" />
          <circle cx="12" cy="108" r="3.5" fill="#fbbf24" filter="url(#dragonFireGlow)" />

          {/* Dragon Body */}
          <rect x="34" y="46" width="52" height="46" rx="18" fill="url(#dragBody)" stroke="#9f1239" strokeWidth="2.5" />
          
          {/* Cyber chest armor plates */}
          <path d="M48 50 L72 50 L68 80 L52 80 Z" fill="#f97316" stroke="#ea580c" strokeWidth="1.5" opacity="0.9" />

          {/* Dragon Head */}
          <rect x="40" y="20" width="40" height="32" rx="10" fill="url(#dragBody)" stroke="#9f1239" strokeWidth="2.5" />
          
          {/* Sharp horns */}
          <path d="M44 20 C40 8 28 6 32 16 Z" fill="#fb923c" stroke="#d97706" strokeWidth="1" />
          <path d="M76 20 C80 8 92 6 88 16 Z" fill="#fb923c" stroke="#d97706" strokeWidth="1" />

          {/* Gorgeous Glowing Yellow Eyes */}
          <circle cx="50" cy="30" r="4.5" fill="#fbbf24" filter="url(#dragonFireGlow)" />
          <circle cx="70" cy="30" r="4.5" fill="#fbbf24" filter="url(#dragonFireGlow)" />
          <circle cx="49.5" cy="29.5" r="1.5" fill="#000" />
          <circle cx="69.5" cy="29.5" r="1.5" fill="#000" />

          {/* Brackets Fire particle effects */}
          <g filter="url(#dragonFireGlow)" className="animate-pulse">
            <text x="40" y="10" fill="#facc15" fontSize="14" fontWeight="black" fontFamily="monospace">{"{"}</text>
            <text x="68" y="10" fill="#fb923c" fontSize="14" fontWeight="black" fontFamily="monospace">{"}"}</text>
            <text x="22" y="26" fill="#f43f5e" fontSize="12" fontWeight="black" fontFamily="monospace">{"["}</text>
            <text x="86" y="26" fill="#f43f5e" fontSize="12" fontWeight="black" fontFamily="monospace">{"]"}</text>
          </g>
        </g>
      </svg>
    );
  }

  if (name === "Hydra de Bucles") {
    return (
      <svg className="w-36 h-36 drop-shadow-[0_15px_20px_rgba(0,0,0,0.65)] hover:scale-105 transition-transform duration-300" viewBox="0 0 120 120" style={{ filter: hitFilter }}>
        <defs>
          <linearGradient id="hydBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="60%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#3b0764" />
          </linearGradient>
          <filter id="hydGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <g>
          {/* Hydra Base Body */}
          <rect x="28" y="62" width="64" height="38" rx="18" fill="url(#hydBody)" stroke="#6d28d9" strokeWidth="2.5" />

          {/* Orbit Loop Circle Indicator */}
          <circle cx="60" cy="80" r="22" fill="none" stroke="#d8b4fe" strokeWidth="2" strokeDasharray="6 6" className="animate-[spin_20s_infinite_linear]" />

          {/* HEAD 1 (LEFT NECK & HEAD) - Animated */}
          <g className="origin-[40px_70px] animate-[float-slow_2.2s_infinite_ease-in-out]">
            <path d="M40 70 C28 55 22 42 32 30" fill="none" stroke="url(#hydBody)" strokeWidth="10" strokeLinecap="round" />
            <circle cx="32" cy="28" r="12" fill="url(#hydBody)" stroke="#6d28d9" strokeWidth="2" />
            <circle cx="30" cy="25" r="2.5" fill="#fcd34d" filter="url(#hydGlow)" />
            <path d="M26 33 Q32 37 38 33" fill="none" stroke="#2e1065" strokeWidth="1.5" />
          </g>

          {/* HEAD 2 (CENTER NECK & HEAD) - Animated with slight delay offset */}
          <g className="origin-[60px_70px] animate-[float-slow_2.8s_infinite_ease-in-out_0.5s]">
            <path d="M60 70 L60 26" fill="none" stroke="url(#hydBody)" strokeWidth="10" strokeLinecap="round" />
            <circle cx="60" cy="22" r="13" fill="url(#hydBody)" stroke="#6d28d9" strokeWidth="2" />
            <circle cx="56" cy="19" r="3" fill="#fcd34d" filter="url(#hydGlow)" />
            <circle cx="64" cy="19" r="3" fill="#fcd34d" filter="url(#hydGlow)" />
            <path d="M54 26 Q60 30 66 26" fill="none" stroke="#2e1065" strokeWidth="1.5" />
          </g>

          {/* HEAD 3 (RIGHT NECK & HEAD) - Animated with delay offset */}
          <g className="origin-[80px_70px] animate-[float-slow_2.5s_infinite_ease-in-out_0.25s]">
            <path d="M80 70 C92 55 98 42 88 30" fill="none" stroke="url(#hydBody)" strokeWidth="10" strokeLinecap="round" />
            <circle cx="88" cy="28" r="12" fill="url(#hydBody)" stroke="#6d28d9" strokeWidth="2" />
            <circle cx="90" cy="25" r="2.5" fill="#fcd34d" filter="url(#hydGlow)" />
            <path d="M82 33 Q88 37 94 33" fill="none" stroke="#2e1065" strokeWidth="1.5" />
          </g>

          {/* Glowing syntax operators drifting around */}
          <g filter="url(#hydGlow)">
            <text x="14" y="18" fill="#c084fc" fontSize="9" fontWeight="bold" fontFamily="monospace">while</text>
            <text x="90" y="18" fill="#c084fc" fontSize="9" fontWeight="bold" fontFamily="monospace">for</text>
            <text x="54" y="52" fill="#fb7185" fontSize="15" fontWeight="black" fontFamily="monospace">∞</text>
          </g>
        </g>
      </svg>
    );
  }

  return <div className="text-8xl">😎</div>;
}

const renderDict = (obj: EntityStats) => {
  return `{ 'vida': ${Math.round(obj.vida)}, 'escudo': ${Math.round(obj.escudo)}, 'fuerza': ${Math.round(obj.fuerza)} }`;
};

export function ArenaView() {
  const { gainXP } = useGamification();
  const [level, setLevel] = useState(0);
  
  const [player, setPlayer] = useState<EntityStats>({ ...PLAYER_INIT });
  const [enemy, setEnemy] = useState<EntityStats>({ ...ENEMIES[0] });
  
  const [hand, setHand] = useState<CodeCard[]>([]);
  const [combo, setCombo] = useState<CodeCard[]>([]);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [battleState, setBattleState] = useState<"draft" | "executing" | "victory" | "defeat">("draft");
  
  // Shake states
  const [pShake, setPShake] = useState(false);
  const [eShake, setEShake] = useState(false);

  // Floating text indicators
  const [pFloating, setPFloating] = useState<{ id: number; text: string; type: 'damage' | 'shield' | 'buff' }[]>([]);
  const [eFloating, setEFloating] = useState<{ id: number; text: string; type: 'damage' | 'shield' | 'buff' }[]>([]);

  // Attack Slash Visual Overlays
  const [pSlash, setPSlash] = useState(false);
  const [eSlash, setESlash] = useState(false);

  // Dash/Move Attack Animations
  const [pDash, setPDash] = useState(false);
  const [eDash, setEDash] = useState(false);

  // Spawners for floating indicators
  const spawnPFloating = (text: string, type: 'damage' | 'shield' | 'buff') => {
    const id = Date.now() + Math.random();
    setPFloating(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setPFloating(prev => prev.filter(item => item.id !== id));
    }, 1200);
  };

  const spawnEFloating = (text: string, type: 'damage' | 'shield' | 'buff') => {
    const id = Date.now() + Math.random();
    setEFloating(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setEFloating(prev => prev.filter(item => item.id !== id));
    }, 1200);
  };

  useEffect(() => {
    setPlayer({ ...PLAYER_INIT });
    setEnemy({ ...ENEMIES[level] });
    setCombo([]);
    setCombatLog([`¡Ha aparecido el ${ENEMIES[level].nombre}!`, "Selecciona 3 cartas para tu script."]);
    setBattleState("draft");
    
    // Progresión de cartas por nivel
    if (level === 0) setHand([ALL_CARDS[0], ALL_CARDS[1], ALL_CARDS[3]]);
    else if (level === 1) setHand([ALL_CARDS[0], ALL_CARDS[2], ALL_CARDS[4], ALL_CARDS[3]]);
    else if (level === 2) setHand([ALL_CARDS[0], ALL_CARDS[5], ALL_CARDS[6], ALL_CARDS[4], ALL_CARDS[3]]);
    else setHand([...ALL_CARDS]);
    
    soundEngine.play('click');
  }, [level]);

  const handleCardClick = (card: CodeCard) => {
    if (battleState !== "draft") return;
    if (combo.length >= 3) {
      soundEngine.play('error');
      return; 
    }
    soundEngine.play('click');
    setCombo([...combo, card]);
    setHand(hand.filter(c => c.id !== card.id));
  };

  const handleRemoveCard = (card: CodeCard, index: number) => {
    if (battleState !== "draft") return;
    soundEngine.play('click');
    const newCombo = [...combo];
    newCombo.splice(index, 1);
    setCombo(newCombo);
    setHand([...hand, card]);
  };

  const executeTurn = async () => {
    if (combo.length === 0 || battleState !== "draft") return;
    setBattleState("executing");
    setIsPlaying(true);
    
    let pState = { ...player };
    let eState = { ...enemy };
    let logs = [...combatLog, "--- Inicio de Ejecución ---"];
    setCombatLog(logs);

    for (let i = 0; i < combo.length; i++) {
      const card = combo[i];
      await new Promise(r => setTimeout(r, 800));
      
      const oldPVida = pState.vida;
      const oldPEscudo = pState.escudo;
      const oldPFuerza = pState.fuerza;
      const oldEVida = eState.vida;
      const oldEEscudo = eState.escudo;

      const result = card.effect(pState, eState);
      eState.vida = Math.max(0, eState.vida);
      eState.escudo = Math.max(0, eState.escudo);
      
      soundEngine.play(result.sound);
      
      // Calculate dynamic effects
      const pHeal = pState.vida - oldPVida;
      const pShieldGained = pState.escudo - oldPEscudo;
      const pFuerzaGained = pState.fuerza - oldPFuerza;

      const eHeal = eState.vida - oldEVida;
      const eShieldGained = eState.escudo - oldEEscudo;

      // 1. If player dealt damage to enemy (life or shield)
      const eDamage = (oldEVida + oldEEscudo) - (eState.vida + eState.escudo);
      if (eDamage > 0) {
        // Player dashes forward to strike
        setPDash(true);
        setTimeout(() => setPDash(false), 200);

        // Impact effects on enemy
        setTimeout(() => {
          setEShake(true);
          setESlash(true);
          setTimeout(() => setEShake(false), 200);
          setTimeout(() => setESlash(false), 300);
          spawnEFloating(`-${Math.round(eDamage)}`, 'damage');
        }, 120);
      }

      // 2. If player gained shield
      if (pShieldGained > 0) {
        spawnPFloating(`+${Math.round(pShieldGained)} 🛡️`, 'shield');
      }

      // 3. If enemy shield was broken
      if (oldEEscudo > 0 && eState.escudo === 0 && eDamage > 0) {
        spawnEFloating("🛡️ ROTO!", "shield");
      }

      // 4. If player gained strength (buff multiplier)
      if (pFuerzaGained > 0) {
        spawnPFloating(`x2 💪⚡`, 'buff');
      }

      // 5. If player healed
      if (pHeal > 0) {
        spawnPFloating(`+${Math.round(pHeal)} 💚`, 'buff');
      }

      // Enemy counter healing/shield adjustments
      if (eShieldGained > 0) {
        spawnEFloating(`+${Math.round(eShieldGained)} 🛡️`, 'shield');
      }
      if (eHeal > 0) {
        spawnEFloating(`+${Math.round(eHeal)} 💚`, 'buff');
      }

      logs = [...logs, `> ${card.code}`, result.log];
      setCombatLog([...logs]);
      setPlayer({ ...pState });
      setEnemy({ ...eState });
      
      if (eState.vida <= 0) break;
    }

    await new Promise(r => setTimeout(r, 1000));

    if (eState.vida > 0) {
      logs = [...logs, `💥 El ${eState.nombre} contraataca! (${eState.fuerza} de daño)`];
      setCombatLog([...logs]);
      
      const oldPVida = pState.vida;
      const oldPEscudo = pState.escudo;

      let damage = eState.fuerza;
      if (pState.escudo > 0) {
        const absorb = Math.min(pState.escudo, damage);
        pState.escudo -= absorb;
        damage -= absorb;
        logs = [...logs, `🛡️ Tu escudo bloqueó ${absorb} puntos.`];
      }
      pState.vida = Math.max(0, pState.vida - damage);
      
      soundEngine.play('hit');
      
      // Enemy dashes forward to attack
      setEDash(true);
      setTimeout(() => setEDash(false), 200);

      // Hit overlays and numbers on player
      setTimeout(() => {
        setPShake(true);
        setPSlash(true);
        setTimeout(() => setPShake(false), 200);
        setTimeout(() => setPSlash(false), 300);

        const shieldAbsorbed = oldPEscudo - pState.escudo;
        const lifeLost = oldPVida - pState.vida;

        if (shieldAbsorbed > 0) {
          spawnPFloating(`-${Math.round(shieldAbsorbed)} 🛡️`, 'shield');
        }
        if (lifeLost > 0) {
          spawnPFloating(`-${Math.round(lifeLost)}`, 'damage');
        }
        if (oldPEscudo > 0 && pState.escudo === 0) {
          spawnPFloating("🛡️ ROTO!", "shield");
        }
      }, 120);
      
      setPlayer({ ...pState });
      setCombatLog([...logs]);
    }

    await new Promise(r => setTimeout(r, 800));

    if (eState.vida <= 0) {
      soundEngine.play('win');
      setBattleState("victory");
      const xpReward = (level + 1) * 200;
      gainXP(xpReward);
      setCombatLog([...logs, `🏆 ¡VICTORIA! +${xpReward} XP`]);
    } else if (pState.vida <= 0) {
      soundEngine.play('error');
      setBattleState("defeat");
      setCombatLog([...logs, `💀 DERROTA.`]);
    } else {
      setHand([...hand, ...combo]);
      setCombo([]);
      setBattleState("draft");
      soundEngine.play('click');
    }
    
    setIsPlaying(false);
  };

  const nextLevel = () => {
    if (level < ENEMIES.length - 1) {
      setLevel(l => l + 1);
    } else {
      // All enemies defeated — restart from beginning with harder stats
      setLevel(0);
    }
  };

  return (
    <div className="min-h-screen page-bg flex flex-col text-slate-100 overflow-x-hidden relative">
      
      {/* ── ESTILOS CSS AVANZADOS EMBEBIDOS (ULTRA-PREMIUM GRAPHICS OPTIMIZED FOR GPU) ── */}
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
          50% { transform: translate3d(0, -8px, 0) rotate(1deg); }
        }
        @keyframes float-medium {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
          50% { transform: translate3d(0, -5px, 0) rotate(-1.5deg); }
        }
        @keyframes jelly-squish {
          0%, 100% { transform: scale3d(1, 1, 1) translate3d(0, 0, 0); }
          45% { transform: scale3d(1.12, 0.86, 1) translate3d(0, 6px, 0); }
          75% { transform: scale3d(0.94, 1.05, 1) translate3d(0, -2px, 0); }
        }
        @keyframes wing-flap-L {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-14deg) translate3d(0, -2px, 0); }
        }
        @keyframes wing-flap-R {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(14deg) translate3d(0, -2px, 0); }
        }
        @keyframes cyber-blink {
          0%, 94%, 98%, 100% { opacity: 1; filter: drop-shadow(0 0 5px #22d3ee); }
          96% { opacity: 0.15; filter: none; }
        }
        @keyframes laser-sweep {
          0% { transform: translate3d(0, 0, 0); opacity: 0; }
          15% { opacity: 0.95; }
          85% { opacity: 0.95; }
          100% { transform: translate3d(0, 440px, 0); opacity: 0; }
        }
        @keyframes orbit-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes orbit-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes grid-glow {
          0%, 100% { opacity: 0.25; }
          50% { opacity: 0.45; }
        }
        .sci-fi-grid {
          background-size: 50px 50px;
          background-image: 
            linear-gradient(to right, rgba(6, 182, 212, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(6, 182, 212, 0.08) 1px, transparent 1px);
        }
        .gpu-optimized {
          will-change: transform, opacity;
          backface-visibility: hidden;
          perspective: 1000px;
          transform: translate3d(0, 0, 0);
        }
      `}</style>

      <Navbar />
      
      {/* HUD HEADER: Telemetría de Campaña en tiempo real */}
      <div className="max-w-7xl mx-auto w-full px-4 lg:px-8 mt-4">
        <div className="bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 border border-primary/30 p-2 rounded-xl text-primary font-mono text-xs font-bold animate-pulse">
              SYS_LEVEL_0{level + 1}
            </div>
            <div>
              <h1 className="text-xl font-display font-black tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-slate-100 via-slate-300 to-slate-500">
                Pylearn Arena de Compilación
              </h1>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest">
                Prueba tus algoritmos vs compiladores monstruo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <span className="text-[11px] font-bold text-slate-500 block uppercase">Nivel Actual</span>
              <span className="text-sm font-black text-cyan-400 font-mono tracking-wider">
                {level === 0 ? "Asignaciones Básicas" : level === 1 ? "Comprobación Lógica" : level === 2 ? "Compilación de Árboles" : "Recursión Infinita"}
              </span>
            </div>
            <div className="h-8 w-[1px] bg-slate-800 hidden sm:block" />
            <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800">
              <span className="text-xs font-bold text-slate-400">Racha:</span>
              <span className="text-sm font-black text-yellow-500 font-mono">🔥 {level + 1}x</span>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-8 flex flex-col lg:flex-row gap-8 relative z-10">
        
        {/* LADO IZQUIERDO: Editor y Mazo en formato CHIP */}
        <div className="w-full lg:w-[450px] flex flex-col gap-6">
          <div className="bg-slate-950/90 backdrop-blur border-2 border-slate-800/80 rounded-3xl p-6 shadow-[0_15px_30px_rgba(0,0,0,0.7)] relative overflow-hidden">
            
            {/* Tech detail lines on borders */}
            <div className="absolute top-0 left-6 w-12 h-[2px] bg-cyan-500" />
            <div className="absolute bottom-0 right-6 w-12 h-[2px] bg-primary" />
            
            <h2 className="text-xl font-display font-extrabold flex items-center gap-2 mb-4 text-slate-200">
              <Code2 className="text-cyan-400 w-5 h-5" /> Editor de Combo <span className="text-xs text-slate-500 font-mono font-normal">v2.4</span>
            </h2>
            
            <div className="bg-slate-950/80 rounded-2xl p-4 min-h-[220px] border border-slate-800 flex flex-col gap-3 relative shadow-inner">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex justify-between items-center">
                <span>Tu Script (Máx 3)</span>
                <span className="text-cyan-400 font-mono">{combo.length}/3 INSTRUCCIONES</span>
              </div>
              <AnimatePresence>
                {combo.map((card, idx) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={`combo-${card.id}-${idx}`}
                    onClick={() => handleRemoveCard(card, idx)}
                    className="bg-slate-900/90 text-cyan-400 font-mono text-sm p-3.5 rounded-xl border border-cyan-500/30 cursor-pointer hover:border-red-500 hover:text-red-400 flex flex-col group transition-all duration-200 shadow-md relative"
                  >
                    <div className="absolute left-0 top-0 h-full w-[3px] bg-cyan-500 group-hover:bg-red-500 rounded-l" />
                    <div className="flex justify-between items-center">
                      <span className="truncate">{card.code}</span>
                      <Trash2 className="w-4 h-4 text-slate-500 group-hover:text-red-400 shrink-0 ml-2" />
                    </div>
                  </motion.div>
                ))}
                {combo.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 font-semibold italic mt-10">
                    <span className="text-3xl mb-2">📥</span>
                    <span className="text-xs uppercase tracking-wider text-slate-600 not-italic">Mazo Vacío</span>
                    <span className="text-[11px] text-slate-500 mt-1">Inserta instrucciones de abajo para programar tu táctica.</span>
                  </div>
                )}
              </AnimatePresence>
            </div>

            <Button 
              size="lg" 
              className={`w-full mt-6 text-base font-black h-14 transition-all duration-300 relative overflow-hidden group rounded-2xl
                ${combo.length > 0 
                  ? "bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 border-none text-white shadow-[0_0_20px_rgba(6,182,212,0.45)] hover:shadow-[0_0_30px_rgba(6,182,212,0.65)] hover:scale-[1.02]" 
                  : "bg-slate-900 border border-slate-800 text-slate-500"}`}
              disabled={combo.length === 0 || battleState !== "draft"}
              onClick={executeTurn}
            >
              {isPlaying ? (
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
                  COMPILANDO E INYECTANDO CÓDIGO...
                </span>
              ) : (
                <span className="flex items-center gap-2 uppercase tracking-wider font-display">
                  ¡Ejecutar Combo Algorítmico! ⚡
                </span>
              )}
            </Button>
          </div>

          <div className="flex-1 bg-slate-950/60 backdrop-blur rounded-3xl p-6 border border-slate-800/80 overflow-y-auto max-h-[42vh] shadow-xl">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center justify-between">
              <span>Cartas Disponibles</span>
              <span className="bg-cyan-500/20 text-cyan-400 px-2.5 py-0.5 rounded-full text-xs font-mono">{hand.length}</span>
            </h3>
            <div className="flex flex-col gap-3">
              <AnimatePresence>
                {hand.map((card) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={`hand-${card.id}`}
                    onClick={() => handleCardClick(card)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg relative overflow-hidden group
                      ${card.type === 'ataque' ? 'bg-red-950/20 border-red-900/50 hover:border-red-500' : 
                        card.type === 'defensa' ? 'bg-cyan-950/20 border-cyan-900/50 hover:border-cyan-500' :
                        card.type === 'debuff' ? 'bg-purple-950/20 border-purple-900/50 hover:border-purple-500' :
                        'bg-yellow-950/20 border-yellow-900/50 hover:border-yellow-500'}`}
                  >
                    {/* Tiny neon dot */}
                    <div className={`absolute right-3 top-3 w-2 h-2 rounded-full
                      ${card.type === 'ataque' ? 'bg-red-500 shadow-[0_0_8px_red]' : 
                        card.type === 'defensa' ? 'bg-cyan-500 shadow-[0_0_8px_cyan]' :
                        card.type === 'debuff' ? 'bg-purple-500 shadow-[0_0_8px_purple]' :
                        'bg-yellow-500 shadow-[0_0_8px_yellow]'}`} />

                    <code className="block font-mono font-bold text-sm text-slate-100 mb-1">{card.code}</code>
                    <p className="text-xs font-semibold text-slate-400 mb-1.5">{card.description}</p>
                    
                    {/* Micro explanatory tooltip container */}
                    <div className="pt-1.5 border-t border-slate-800/60">
                      <p className="text-[10px] leading-relaxed text-slate-500 italic">
                        💡 {card.didacticText}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* LADO DERECHO: Arena de Combate y Consola de Telemetría */}
        <div className="flex-1 flex flex-col gap-6">
          
          <div className="flex-1 bg-slate-950 rounded-3xl border-[3px] border-slate-800/80 relative overflow-hidden flex flex-col justify-center items-center shadow-[0_20px_40px_rgba(0,0,0,0.8)] p-8 min-h-[440px]">
            
            {/* BACKGROUND: Sci-fi Grid Ground with perspective */}
            <div className="absolute inset-0 sci-fi-grid opacity-30 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-transparent to-slate-950 pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-44 bg-[radial-gradient(ellipse_at_bottom,rgba(6,182,212,0.15),transparent)] pointer-events-none" />
            
            {/* Dynamic laser scan matrix bar */}
            {isPlaying && (
              <div className="absolute left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent pointer-events-none z-30 opacity-75 animate-[laser-sweep_2s_infinite_linear]" />
            )}

            <div className="w-full flex justify-between items-center z-10 max-w-2xl mt-8">
              
              {/* JUGADOR: HÉROE */}
              <div className="flex flex-col items-center gap-4 relative gpu-optimized">
                
                {/* HUD Panel - Glassmorphic Cyber Display */}
                <div className="bg-slate-950/90 backdrop-blur-md rounded-2xl p-3 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.15)] font-mono text-[11px] text-cyan-300 w-56 relative overflow-hidden">
                  <div className="absolute right-2 top-2 flex gap-1">
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                    <span className="w-1.5 h-1.5 bg-slate-700 rounded-full" />
                  </div>
                  <span className="text-[10px] text-slate-500 block mb-1 font-black tracking-widest uppercase">Telemetry // HEROE</span>
                  <span className="text-cyan-400 font-bold leading-relaxed block">{renderDict(player)}</span>
                </div>
                
                <div className="relative h-36 w-36 flex items-center justify-center">
                  
                  {/* Hologram Pedestal / Pod */}
                  <div className="absolute bottom-[-14px] w-48 h-12 pointer-events-none flex flex-col items-center justify-center">
                    <div className="absolute w-36 h-8 bg-cyan-500/10 rounded-full blur-md" />
                    <svg className="w-32 h-8 animate-[orbit-slow_12s_infinite_linear]" viewBox="0 0 100 30">
                      <ellipse cx="50" cy="15" rx="45" ry="12" fill="none" stroke="#22d3ee" strokeWidth="1" strokeDasharray="6 4" opacity="0.45" />
                    </svg>
                    <svg className="absolute w-24 h-6 animate-[orbit-reverse_8s_infinite_linear]" viewBox="0 0 100 30">
                      <ellipse cx="50" cy="15" rx="35" ry="9" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="15 8" opacity="0.65" />
                    </svg>
                    <div className="absolute bottom-6 w-20 h-16 bg-gradient-to-t from-cyan-500/20 to-transparent rounded-t-full blur-sm" style={{ clipPath: "polygon(10% 100%, 90% 100%, 75% 0%, 25% 0%)" }} />
                  </div>

                  {/* Strength Golden Flare */}
                  {player.fuerza > 10 && (
                    <motion.div
                      animate={{ opacity: [0.35, 0.7, 0.35], scaleY: [1, 1.25, 1] }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-yellow-500/20 via-orange-500/5 to-transparent pointer-events-none z-0 rounded-b-2xl"
                      style={{ filter: "blur(5px)" }}
                    />
                  )}

                  <motion.div 
                    animate={{ 
                      x: pDash ? 35 : pShake ? [-10, 10, -10, 10, 0] : 0,
                      y: [0, -4, 0]
                    }}
                    transition={{
                      y: { repeat: Infinity, duration: 2.2, ease: "easeInOut" },
                      x: { duration: 0.18 }
                    }}
                    className="relative z-10 gpu-optimized"
                  >
                    <CharacterRenderer name="heroe" isPlayer={true} isHit={pShake} isDead={player.vida <= 0} />
                  </motion.div>
                  
                  {/* Slash impact neon stroke */}
                  {pSlash && (
                    <motion.div
                      initial={{ opacity: 1, scaleX: 0 }}
                      animate={{ scaleX: 1, opacity: [1, 1, 0] }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
                    >
                      <svg className="w-full h-full" viewBox="0 0 120 120">
                        <line x1="20" y1="100" x2="100" y2="20" stroke="#ff0055" strokeWidth="7" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 8px #ff0055)" }} />
                      </svg>
                    </motion.div>
                  )}

                  {/* Protective Bubble Shield Grid */}
                  {player.escudo > 0 && (
                    <motion.div
                      animate={{ rotate: 360, scale: [1, 1.03, 1] }}
                      transition={{ rotate: { duration: 15, repeat: Infinity, ease: "linear" }, scale: { duration: 2, repeat: Infinity } }}
                      className="absolute -inset-5 rounded-full border border-cyan-400/50 bg-cyan-500/5 pointer-events-none z-20 flex items-center justify-center"
                      style={{ boxShadow: "0 0 20px rgba(34,211,238,0.25), inset 0 0 15px rgba(34,211,238,0.15)" }}
                    >
                      <Shield className="w-8 h-8 text-cyan-400/25 animate-pulse" />
                    </motion.div>
                  )}

                  {/* Floating Telemetry Indicator strings */}
                  <AnimatePresence>
                    {pFloating.map(f => (
                      <motion.div
                        key={f.id}
                        initial={{ opacity: 0, y: 20, scale: 0.5 }}
                        animate={{ opacity: [0, 1, 1, 0], y: -75, scale: [0.5, 1.3, 1.3, 0.8] }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className={`absolute top-[-35px] font-display font-black text-2xl drop-shadow-[0_3px_5px_rgba(0,0,0,0.9)] z-30 pointer-events-none
                          ${f.type === 'damage' ? 'text-red-500' : f.type === 'shield' ? 'text-cyan-400' : 'text-yellow-400'}`}
                      >
                        {f.text}
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* HP Healthbar with Glow */}
                  <div className="absolute -bottom-6 w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]" 
                      initial={{ width: "100%" }} 
                      animate={{ width: `${Math.max(0, (player.vida / player.maxVida) * 100)}%` }} 
                    />
                  </div>
                </div>
              </div>

              {/* THE NEON VERSUS LOGO SPLIT */}
              <div className="relative flex items-center justify-center select-none z-10">
                <div className="absolute w-24 h-24 rounded-full bg-gradient-to-r from-cyan-500/10 to-red-500/10 blur-xl animate-pulse" />
                <div className="relative font-display font-black text-5xl italic bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-pink-500 to-red-400 drop-shadow-[0_4px_12px_rgba(244,63,94,0.35)] tracking-widest leading-none">
                  VS
                </div>
                <div className="absolute -inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent scale-x-75 animate-pulse" />
              </div>

              {/* ENEMIGO */}
              <div className="flex flex-col items-center gap-4 relative gpu-optimized">
                
                {/* HUD Panel - Crimson Science Frame */}
                <div className="bg-slate-950/90 backdrop-blur-md rounded-2xl p-3 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.15)] font-mono text-[11px] text-red-300 w-56 relative overflow-hidden">
                  <div className="absolute left-2 top-2 flex gap-1">
                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
                    <span className="w-1.5 h-1.5 bg-slate-700 rounded-full" />
                  </div>
                  <span className="text-[10px] text-slate-500 block mb-1 font-black tracking-widest uppercase truncate text-right">Telemetry // {enemy.nombre}</span>
                  <span className="text-red-400 font-bold leading-relaxed block text-right">{renderDict(enemy)}</span>
                </div>
                
                <div className="relative h-32 w-32 flex items-center justify-center">
                  
                  {/* Hologram Pedestal / Crimson Pod */}
                  <div className="absolute bottom-[-14px] w-48 h-12 pointer-events-none flex flex-col items-center justify-center">
                    <div className="absolute w-36 h-8 bg-red-500/10 rounded-full blur-md" />
                    <svg className="w-32 h-8 animate-[orbit-slow_12s_infinite_linear]" viewBox="0 0 100 30">
                      <ellipse cx="50" cy="15" rx="45" ry="12" fill="none" stroke="#ef4444" strokeWidth="1" strokeDasharray="6 4" opacity="0.45" />
                    </svg>
                    <svg className="absolute w-24 h-6 animate-[orbit-reverse_8s_infinite_linear]" viewBox="0 0 100 30">
                      <ellipse cx="50" cy="15" rx="35" ry="9" fill="none" stroke="#f87171" strokeWidth="1.5" strokeDasharray="15 8" opacity="0.65" />
                    </svg>
                    <div className="absolute bottom-6 w-20 h-16 bg-gradient-to-t from-red-500/20 to-transparent rounded-t-full blur-sm" style={{ clipPath: "polygon(10% 100%, 90% 100%, 75% 0%, 25% 0%)" }} />
                  </div>

                  {/* Crimson Enemy Strength Aura */}
                  {enemy.fuerza > ENEMIES[level].fuerza && (
                    <motion.div
                      animate={{ opacity: [0.35, 0.7, 0.35], scaleY: [1, 1.25, 1] }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-red-500/20 via-orange-500/5 to-transparent pointer-events-none z-0 rounded-b-2xl"
                      style={{ filter: "blur(5px)" }}
                    />
                  )}

                  <motion.div 
                    animate={{ 
                      x: eDash ? -35 : eShake ? [-10, 10, -10, 10, 0] : 0,
                      y: [0, -4, 0]
                    }}
                    transition={{
                      y: { repeat: Infinity, duration: 2.2, ease: "easeInOut", delay: 0.2 },
                      x: { duration: 0.18 }
                    }}
                    className="relative z-10 gpu-optimized"
                  >
                    <CharacterRenderer name={enemy.nombre} isPlayer={false} isHit={eShake} isDead={enemy.vida <= 0} />
                  </motion.div>
                  
                  {/* Enemy Slash impact overlay */}
                  {eSlash && (
                    <motion.div
                      initial={{ opacity: 1, scaleX: 0 }}
                      animate={{ scaleX: 1, opacity: [1, 1, 0] }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
                    >
                      <svg className="w-full h-full" viewBox="0 0 120 120">
                        <line x1="100" y1="100" x2="20" y2="20" stroke="#ff0055" strokeWidth="7" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 8px #ff0055)" }} />
                      </svg>
                    </motion.div>
                  )}

                  {/* Shield Bubble Overlay */}
                  {enemy.escudo > 0 && (
                    <motion.div
                      animate={{ rotate: 360, scale: [1, 1.03, 1] }}
                      transition={{ rotate: { duration: 15, repeat: Infinity, ease: "linear" }, scale: { duration: 2, repeat: Infinity } }}
                      className="absolute -inset-5 rounded-full border border-cyan-400/50 bg-cyan-500/5 pointer-events-none z-20 flex items-center justify-center"
                      style={{ boxShadow: "0 0 20px rgba(34,211,238,0.25), inset 0 0 15px rgba(34,211,238,0.15)" }}
                    >
                      <Shield className="w-8 h-8 text-cyan-400/25 animate-pulse" />
                    </motion.div>
                  )}

                  {/* Floating indicators */}
                  <AnimatePresence>
                    {eFloating.map(f => (
                      <motion.div
                        key={f.id}
                        initial={{ opacity: 0, y: 20, scale: 0.5 }}
                        animate={{ opacity: [0, 1, 1, 0], y: -75, scale: [0.5, 1.3, 1.3, 0.8] }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className={`absolute top-[-35px] font-display font-black text-2xl drop-shadow-[0_3px_5px_rgba(0,0,0,0.9)] z-30 pointer-events-none
                          ${f.type === 'damage' ? 'text-red-500' : f.type === 'shield' ? 'text-cyan-400' : 'text-yellow-400'}`}
                      >
                        {f.text}
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* HP Healthbar with Glow */}
                  <div className="absolute -bottom-6 w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-red-600 to-rose-400 shadow-[0_0_8px_rgba(239,68,68,0.5)]" 
                      initial={{ width: "100%" }} 
                      animate={{ width: `${Math.max(0, (enemy.vida / enemy.maxVida) * 100)}%` }} 
                    />
                  </div>
                </div>
              </div>

            </div>
            
            {/* MATCH STATE OVERLAYS */}
            <AnimatePresence>
              {battleState === "victory" && (
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center z-50 p-6"
                >
                  <Trophy className="w-28 h-28 text-yellow-400 mb-4 animate-bounce" style={{ filter: "drop-shadow(0 0 20px rgba(234, 179, 8, 0.5))" }} />
                  <h2 className="text-5xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 mb-2 text-center drop-shadow-xl uppercase tracking-wider">
                    ¡COMPILACIÓN EXITOSA!
                  </h2>
                  <p className="text-xl text-green-400 font-bold mb-8 font-mono">🏆 +{ (level + 1) * 200 } XP INYECTADOS</p>
                  <Button size="lg" onClick={nextLevel} className="text-xl px-10 py-7 rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 border-none hover:scale-105 transition-transform text-black font-black uppercase tracking-widest shadow-[0_0_30px_rgba(250,204,21,0.65)]">
                    Siguiente Nivel 🗡️
                  </Button>
                </motion.div>
              )}
              {battleState === "defeat" && (
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center z-50 p-6"
                >
                  <Skull className="w-24 h-24 text-red-500 mb-4 animate-pulse" style={{ filter: "drop-shadow(0 0 15px rgba(239, 68, 68, 0.4))" }} />
                  <h2 className="text-5xl font-display font-black text-red-500 mb-2 text-center drop-shadow-xl uppercase tracking-wider">
                    EXCEPTION_ERROR
                  </h2>
                  <p className="text-xl text-slate-400 mb-8 font-mono">El script arrojó un error fatal.</p>
                  <Button size="lg" onClick={() => setLevel(level)} variant="destructive" className="text-xl px-10 py-7 rounded-2xl hover:scale-105 transition-transform uppercase font-black tracking-widest shadow-[0_0_20px_rgba(220,38,38,0.5)]">
                    Reintentar Compilación 🔄
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* SYSTEM CONSOLE TELEMETRY HUD */}
          <div className="bg-[#040810] rounded-2xl p-4 border border-slate-800 h-56 overflow-y-auto font-mono text-xs flex flex-col-reverse shadow-[inset_0_4px_20px_rgba(0,0,0,0.8)] relative">
            <div className="absolute right-4 top-4 bg-red-500/10 border border-red-500/30 text-[9px] font-bold text-red-400 px-2 py-0.5 rounded animate-pulse">
              LIVE_LOGS
            </div>
            <div className="flex flex-col gap-1.5 z-10">
              {combatLog.map((log, i) => (
                <div key={i} className={`leading-relaxed
                  ${log.includes("---") ? "text-slate-600 font-black my-2 border-t border-b border-slate-900/60 py-1" : ""}
                  ${log.includes("VICTORIA") ? "text-yellow-400 font-bold text-base" : ""}
                  ${log.includes("DERROTA") ? "text-red-500 font-bold text-base" : ""}
                  ${log.startsWith(">") ? "text-cyan-400 font-black" : ""}
                  ${log.includes("⚔️") || log.includes("💥") ? "text-rose-400" : ""}
                  ${log.includes("🛡️") || log.includes("💚") || log.includes("⚡") ? "text-emerald-400" : ""}
                  ${log.includes("❌") ? "text-red-400 font-black" : ""}
                  ${!log.includes("---") && !log.includes("VICTORIA") && !log.includes("DERROTA") && !log.startsWith(">") && !log.includes("⚔️") && !log.includes("💥") && !log.includes("🛡️") && !log.includes("💚") && !log.includes("⚡") && !log.includes("❌") ? "text-slate-400" : ""}
                `}>
                  {log}
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

