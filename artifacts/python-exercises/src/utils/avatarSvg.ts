export interface AvatarOption {
  id: string;
  label: string;
  icon: string; // Emoji representing the option in UI
}

export const MASCOTS: AvatarOption[] = [
  { id: "pyto", label: "Pylearn 🐍", icon: "🐍" },
  { id: "froggy", label: "Ranita 🐸", icon: "🐸" },
  { id: "foxy", label: "Zorrito 🦊", icon: "🦊" },
  { id: "pingu", label: "Pingu 🐧", icon: "🐧" },
  { id: "draco", label: "Draco 🐲", icon: "🐲" },
];

export const HATS: AvatarOption[] = [
  { id: "none", label: "Sin Sombrero", icon: "❌" },
  { id: "grad", label: "Birrete 🎓", icon: "🎓" },
  { id: "wizard", label: "Mago 🧙‍♂️", icon: "🧙‍♂️" },
  { id: "cowboy", label: "Vaquero 🤠", icon: "🤠" },
  { id: "crown", label: "Corona 👑", icon: "👑" },
  { id: "chef", label: "Chef 👨‍🍳", icon: "👨‍🍳" },
];

export const ACCESSORIES: AvatarOption[] = [
  { id: "none", label: "Sin Accesorio", icon: "❌" },
  { id: "cool", label: "Lentes Cool 🕶️", icon: "🕶️" },
  { id: "nerd", label: "Lentes Nerd 👓", icon: "👓" },
  { id: "laptop", label: "Laptop 💻", icon: "💻" },
  { id: "book", label: "Libro Python 📖", icon: "📖" },
];

export const BACKGROUNDS: AvatarOption[] = [
  { id: "sunset", label: "Atardecer 🌅", icon: "🌅" },
  { id: "cyberpunk", label: "Neon 🌌", icon: "🌌" },
  { id: "emerald", label: "Esmeralda 🌿", icon: "🌿" },
  { id: "ocean", label: "Océano 💧", icon: "💧" },
  { id: "sakura", label: "Sakura 🌸", icon: "🌸" },
  { id: "transparent", label: "Transparente 🏁", icon: "🏁" },
];

// SVG template parts
const BACKGROUND_DEFS = `
  <defs>
    <linearGradient id="bg-sunset" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF4B4B" />
      <stop offset="100%" stop-color="#FF9600" />
    </linearGradient>
    <linearGradient id="bg-cyberpunk" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8C52FF" />
      <stop offset="100%" stop-color="#00D2FF" />
    </linearGradient>
    <linearGradient id="bg-emerald" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#58CC02" />
      <stop offset="100%" stop-color="#22C55E" />
    </linearGradient>
    <linearGradient id="bg-ocean" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1CB0F6" />
      <stop offset="100%" stop-color="#3B82F6" />
    </linearGradient>
    <linearGradient id="bg-sakura" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF8097" />
      <stop offset="100%" stop-color="#FFF0F5" />
    </linearGradient>
  </defs>
`;

const SVGS_BACKGROUNDS: Record<string, string> = {
  sunset: `<rect width="100" height="100" rx="22" fill="url(#bg-sunset)" />`,
  cyberpunk: `<rect width="100" height="100" rx="22" fill="url(#bg-cyberpunk)" />`,
  emerald: `<rect width="100" height="100" rx="22" fill="url(#bg-emerald)" />`,
  ocean: `<rect width="100" height="100" rx="22" fill="url(#bg-ocean)" />`,
  sakura: `<rect width="100" height="100" rx="22" fill="url(#bg-sakura)" />`,
  transparent: `<rect width="100" height="100" rx="22" fill="none" stroke="#E2E8F0" stroke-width="2" stroke-dasharray="4" />`,
};

const SVGS_MASCOTS: Record<string, string> = {
  pyto: `
    <!-- PYTO SERPIENTE -->
    <g id="mascot-pyto">
      <!-- Cuerpo curvado -->
      <path d="M25,65 C25,75 40,82 50,82 C65,82 78,72 72,62 C68,54 58,56 50,56 C38,56 25,58 25,65 Z" fill="#4B9E01" />
      <path d="M28,66 C28,73 40,79 50,79 C63,79 74,70 69,61 C65,54 56,56 50,56 C39,56 28,60 28,66 Z" fill="#58CC02" />
      <path d="M42,72 C45,75 55,75 58,72" stroke="#4B9E01" stroke-width="2" stroke-linecap="round" fill="none" />
      
      <!-- Cuello/Tronco vertical -->
      <path d="M42,50 C42,50 40,65 42,70 C44,75 56,75 58,70 C60,65 58,50 58,50" fill="#58CC02" />
      <path d="M45,52 C45,52 44,65 46,68 C48,70 52,70 54,68 C56,65 55,52 55,52" fill="#8BE92A" />

      <!-- Cabeza redondita -->
      <circle cx="50" cy="42" r="16" fill="#58CC02" />
      
      <!-- Ojos grandes y adorables -->
      <circle cx="43" cy="40" r="4.5" fill="#1A1A1A" />
      <circle cx="41.5" cy="38.5" r="1.5" fill="#FFFFFF" />
      <circle cx="44.2" cy="41.2" r="0.7" fill="#FFFFFF" />

      <circle cx="57" cy="40" r="4.5" fill="#1A1A1A" />
      <circle cx="55.5" cy="38.5" r="1.5" fill="#FFFFFF" />
      <circle cx="58.2" cy="41.2" r="0.7" fill="#FFFFFF" />

      <!-- Mejillas sonrosadas -->
      <ellipse cx="37" cy="44" rx="2.5" ry="1.5" fill="#FF8097" opacity="0.8" />
      <ellipse cx="63" cy="44" rx="2.5" ry="1.5" fill="#FF8097" opacity="0.8" />

      <!-- Sonrisa tierna -->
      <path d="M46.5,46 C48,48.5 52,48.5 53.5,46" stroke="#377A00" stroke-width="2.5" stroke-linecap="round" fill="none" />
    </g>
  `,
  froggy: `
    <!-- RANITA -->
    <g id="mascot-froggy">
      <!-- Cuerpo Redondo -->
      <circle cx="50" cy="62" r="21" fill="#78D639" />
      <!-- Pancita Clara -->
      <ellipse cx="50" cy="67" rx="13" ry="10" fill="#C4F482" />
      
      <!-- Ojos saltones -->
      <circle cx="38" cy="45" r="7.5" fill="#78D639" />
      <circle cx="38" cy="45" r="5" fill="#1A1A1A" />
      <circle cx="36.5" cy="43.5" r="1.8" fill="#FFFFFF" />
      <circle cx="39.2" cy="46.2" r="0.8" fill="#FFFFFF" />

      <circle cx="62" cy="45" r="7.5" fill="#78D639" />
      <circle cx="62" cy="45" r="5" fill="#1A1A1A" />
      <circle cx="60.5" cy="43.5" r="1.8" fill="#FFFFFF" />
      <circle cx="63.2" cy="46.2" r="0.8" fill="#FFFFFF" />

      <!-- Cabeza e integración -->
      <ellipse cx="50" cy="54" rx="17" ry="12" fill="#78D639" />

      <!-- Sonrisa enorme -->
      <path d="M43,56 C46,60 54,60 57,56" stroke="#3B8004" stroke-width="3" stroke-linecap="round" fill="none" />

      <!-- Mejillas -->
      <ellipse cx="36" cy="54" rx="2.5" ry="1.5" fill="#FF8097" />
      <ellipse cx="64" cy="54" rx="2.5" ry="1.5" fill="#FF8097" />
    </g>
  `,
  foxy: `
    <!-- ZORRITO -->
    <g id="mascot-foxy">
      <!-- Cuerpo -->
      <circle cx="50" cy="64" r="18" fill="#E05B1B" />
      <ellipse cx="50" cy="68" rx="10" ry="11" fill="#FFFFFF" />

      <!-- Orejas triangulares grandes -->
      <polygon points="30,42 24,24 40,32" fill="#E05B1B" />
      <polygon points="30,42 26,27 37,33" fill="#F4A261" />

      <polygon points="70,42 76,24 60,32" fill="#E05B1B" />
      <polygon points="70,42 74,27 63,33" fill="#F4A261" />

      <!-- Cabeza Zorro -->
      <ellipse cx="50" cy="49" rx="16" ry="12" fill="#E05B1B" />
      
      <!-- Mejillas blancas peludas -->
      <path d="M34,49 Q28,54 36,56 Z" fill="#FFFFFF" />
      <path d="M66,49 Q72,54 64,56 Z" fill="#FFFFFF" />

      <!-- Ojos Felices -->
      <circle cx="41" cy="45" r="3.5" fill="#1A1A1A" />
      <circle cx="39.5" cy="43.5" r="1.2" fill="#FFFFFF" />
      
      <circle cx="59" cy="45" r="3.5" fill="#1A1A1A" />
      <circle cx="57.5" cy="43.5" r="1.2" fill="#FFFFFF" />

      <!-- Hocico y Nariz -->
      <polygon points="46,51 54,51 50,55" fill="#FFFFFF" />
      <ellipse cx="50" cy="51" rx="2" ry="1.5" fill="#1A1A1A" />

      <!-- Sonrisa -->
      <path d="M48,53 Q50,55 52,53" stroke="#9A3300" stroke-width="1.5" stroke-linecap="round" fill="none" />
    </g>
  `,
  pingu: `
    <!-- PINGÜINO -->
    <g id="mascot-pingu">
      <!-- Cuerpo Base Dark -->
      <ellipse cx="50" cy="60" rx="20" ry="22" fill="#1E293B" />
      
      <!-- Pancita / Cara blanca -->
      <ellipse cx="50" cy="62" rx="14" ry="16" fill="#FFFFFF" />
      <ellipse cx="44" cy="48" rx="7" ry="7" fill="#FFFFFF" />
      <ellipse cx="56" cy="48" rx="7" ry="7" fill="#FFFFFF" />

      <!-- Alitas -->
      <ellipse cx="28" cy="60" rx="4" ry="10" fill="#1E293B" transform="rotate(15 28 60)" />
      <ellipse cx="72" cy="60" rx="4" ry="10" fill="#1E293B" transform="rotate(-15 72 60)" />

      <!-- Ojos grandes y tiernos -->
      <circle cx="44" cy="48" r="3.2" fill="#111827" />
      <circle cx="42.8" cy="46.8" r="1" fill="#FFFFFF" />

      <circle cx="56" cy="48" r="3.2" fill="#111827" />
      <circle cx="54.8" cy="46.8" r="1" fill="#FFFFFF" />

      <!-- Pico Naranja -->
      <polygon points="46,51 54,51 50,56" fill="#F97316" />

      <!-- Patitas naranjas -->
      <ellipse cx="40" cy="80" rx="4.5" ry="2.5" fill="#F97316" />
      <ellipse cx="60" cy="80" rx="4.5" ry="2.5" fill="#F97316" />

      <!-- Mejillas -->
      <circle cx="38" cy="52" r="2" fill="#FCA5A5" />
      <circle cx="62" cy="52" r="2" fill="#FCA5A5" />
    </g>
  `,
  draco: `
    <!-- DRAGONCITO -->
    <g id="mascot-draco">
      <!-- Alas traseras -->
      <path d="M22,62 C10,55 15,35 28,45 Z" fill="#FBBF24" />
      <path d="M78,62 C90,55 85,35 72,45 Z" fill="#FBBF24" />

      <!-- Cuerpo -->
      <ellipse cx="50" cy="64" rx="18" ry="17" fill="#8B5CF6" />
      <!-- Pancita Amarilla con Rayitas -->
      <ellipse cx="50" cy="67" rx="11" ry="11" fill="#FEF08A" />
      <line x1="43" y1="64" x2="57" y2="64" stroke="#D97706" stroke-width="1.5" />
      <line x1="42" y1="69" x2="58" y2="69" stroke="#D97706" stroke-width="1.5" />
      <line x1="44" y1="74" x2="56" y2="74" stroke="#D97706" stroke-width="1.5" />

      <!-- Cuernitos en la cabeza -->
      <path d="M40,34 Q36,22 41,22 Z" fill="#FBBF24" />
      <path d="M60,34 Q64,22 59,22 Z" fill="#FBBF24" />

      <!-- Cabeza -->
      <circle cx="50" cy="46" r="15" fill="#8B5CF6" />

      <!-- Ojos expresivos -->
      <circle cx="43" cy="42" r="4.2" fill="#111827" />
      <circle cx="41.5" cy="40.5" r="1.3" fill="#FFFFFF" />
      <circle cx="44.2" cy="43" r="0.5" fill="#FFFFFF" />

      <circle cx="57" cy="42" r="4.2" fill="#111827" />
      <circle cx="55.5" cy="40.5" r="1.3" fill="#FFFFFF" />
      <circle cx="58.2" cy="43" r="0.5" fill="#FFFFFF" />

      <!-- Nariz / Hocico -->
      <ellipse cx="50" cy="49" rx="5" ry="3.5" fill="#7C3AED" />
      <circle cx="48" cy="49" r="0.8" fill="#111827" />
      <circle cx="52" cy="49" r="0.8" fill="#111827" />

      <!-- Mejillas -->
      <circle cx="38" cy="47" r="2.2" fill="#F472B6" />
      <circle cx="62" cy="47" r="2.2" fill="#F472B6" />
    </g>
  `,
};

const SVGS_HATS: Record<string, string> = {
  none: "",
  grad: `
    <!-- BIRRETE -->
    <g id="hat-grad">
      <path d="M30,30 L50,22 L70,30 L50,38 Z" fill="#1E293B" stroke="#0F172A" stroke-width="1" />
      <path d="M40,32.5 L40,38 C40,41 60,41 60,38 L60,32.5 Z" fill="#334155" />
      <!-- Borla colgante -->
      <path d="M50,30 L32,34 L31,41" stroke="#F59E0B" stroke-width="1.5" stroke-linecap="round" fill="none" />
      <polygon points="29,40 33,40 31,45" fill="#D97706" />
    </g>
  `,
  wizard: `
    <!-- MAGO -->
    <g id="hat-wizard" transform="translate(0, -3)">
      <!-- Cono del sombrero -->
      <path d="M30,34 Q50,5 58,10 Q61,13 49,20 Q50,25 70,34 Z" fill="#1E3A8A" />
      <ellipse cx="50" cy="34" rx="22" ry="4.5" fill="#2563EB" />
      
      <!-- Estrellitas doradas -->
      <polygon points="42,20 44,22 42,24 40,22" fill="#FBBF24" />
      <polygon points="48,15 50,17 48,19 46,17" fill="#FBBF24" />
      <polygon points="53,23 54,24 53,25 52,24" fill="#FBBF24" />
      <polygon points="46,28 48,29 46,30 44,29" fill="#FBBF24" />
    </g>
  `,
  cowboy: `
    <!-- VAQUERO -->
    <g id="hat-cowboy" transform="translate(0, 1)">
      <!-- Copa -->
      <path d="M34,30 C34,18 40,16 50,19 C60,16 66,18 66,30 Z" fill="#78350F" />
      <path d="M34,26 Q50,29 66,26" stroke="#451A03" stroke-width="2.5" fill="none" />
      
      <!-- Ala curva -->
      <path d="M26,30 Q50,38 74,30 Q78,25 70,29 Q50,33 30,29 Q22,25 26,30" fill="#92400E" />
    </g>
  `,
  crown: `
    <!-- CORONA -->
    <g id="hat-crown" transform="translate(0, 2)">
      <polygon points="32,32 30,16 41,25 50,14 59,25 70,16 68,32" fill="#FBBF24" stroke="#D97706" stroke-width="1" />
      <rect x="34" y="30" width="32" height="4.5" fill="#F59E0B" rx="1" />
      
      <!-- Joyas -->
      <circle cx="50" cy="20" r="1.8" fill="#EF4444" />
      <circle cx="36" cy="22" r="1.5" fill="#3B82F6" />
      <circle cx="64" cy="22" r="1.5" fill="#10B981" />
      <circle cx="50" cy="14" r="1.2" fill="#EF4444" />
      <circle cx="30" cy="16" r="1" fill="#F59E0B" />
      <circle cx="70" cy="16" r="1" fill="#F59E0B" />
    </g>
  `,
  chef: `
    <!-- CHEF -->
    <g id="hat-chef" transform="translate(0, -1)">
      <!-- Copa bombacha -->
      <circle cx="50" cy="18" r="12" fill="#F8FAFC" />
      <circle cx="41" cy="23" r="10" fill="#F8FAFC" />
      <circle cx="59" cy="23" r="10" fill="#F8FAFC" />
      
      <!-- Banda del sombrero -->
      <rect x="35" y="27" width="30" height="7.5" fill="#E2E8F0" rx="1" />
    </g>
  `,
};

const SVGS_ACCESSORIES: Record<string, string> = {
  none: "",
  cool: `
    <!-- LENTES COOL -->
    <g id="acc-cool" transform="translate(0, 1)">
      <!-- Lente Izquierdo -->
      <path d="M30,41 Q40,41 45,43 L43,48 Q35,51 30,46 Z" fill="#111827" />
      <path d="M32,43 L36,43 L34,48" stroke="#FFFFFF" stroke-width="1.2" stroke-linecap="round" fill="none" opacity="0.8" />
      
      <!-- Lente Derecho -->
      <path d="M70,41 Q60,41 55,43 L57,48 Q65,51 70,46 Z" fill="#111827" />
      <path d="M58,43 L62,43 L60,48" stroke="#FFFFFF" stroke-width="1.2" stroke-linecap="round" fill="none" opacity="0.8" />

      <!-- Puente -->
      <line x1="44" y1="43" x2="56" y2="43" stroke="#111827" stroke-width="2.5" />
    </g>
  `,
  nerd: `
    <!-- LENTES NERD -->
    <g id="acc-nerd" transform="translate(0, 1)">
      <!-- Lente Izquierdo -->
      <circle cx="39" cy="44" r="7.5" fill="none" stroke="#1F2937" stroke-width="2.5" />
      <path d="M34,41 L37,41" stroke="#FFFFFF" stroke-width="1" stroke-linecap="round" fill="none" opacity="0.5" />

      <!-- Lente Derecho -->
      <circle cx="61" cy="44" r="7.5" fill="none" stroke="#1F2937" stroke-width="2.5" />
      <path d="M56,41 L59,41" stroke="#FFFFFF" stroke-width="1" stroke-linecap="round" fill="none" opacity="0.5" />

      <!-- Puente -->
      <path d="M46.5,44 Q50,42 53.5,44" fill="none" stroke="#1F2937" stroke-width="2.5" />
    </g>
  `,
  laptop: `
    <!-- LAPTOP PROGRAMADOR (Esquina inferior derecha) -->
    <g id="acc-laptop" transform="translate(56, 52)">
      <!-- Pantalla Abierta -->
      <rect x="5" y="5" width="22" height="15" rx="1.5" fill="#334155" stroke="#1E293B" stroke-width="1" />
      <!-- Brillo de la pantalla celeste -->
      <rect x="6.5" y="6.5" width="19" height="12" rx="0.5" fill="#38BDF8" />
      <!-- Código de mentira en pantalla -->
      <line x1="9" y1="9" x2="16" y2="9" stroke="#FFFFFF" stroke-width="1" stroke-linecap="round" />
      <line x1="9" y1="12" x2="22" y2="12" stroke="#4ADE80" stroke-width="1" stroke-linecap="round" />
      <line x1="9" y1="15" x2="19" y2="15" stroke="#FBBF24" stroke-width="1" stroke-linecap="round" />
      
      <!-- Base teclado -->
      <polygon points="2,20 30,20 27,24 5,24" fill="#1E293B" />
      <rect x="2" y="20" width="28" height="1.5" fill="#64748B" />
    </g>
  `,
  book: `
    <!-- LIBRO DE PYTHON (Esquina inferior izquierda) -->
    <g id="acc-book" transform="translate(14, 55)">
      <!-- Tapa del libro -->
      <path d="M4,4 L18,4 C20,4 21,5 21,7 L21,23 C21,24 20,25 18,25 L4,25 Z" fill="#0284C7" />
      <!-- Hojas blancas del borde -->
      <path d="M21,7 L21,23 L22,23 L22,7 Z" fill="#E2E8F0" />
      <!-- Lomo del libro -->
      <rect x="2" y="4" width="3" height="21" fill="#0369A1" rx="1" />
      <!-- Emblema de la serpiente de oro en el centro -->
      <path d="M10,10 C10,8 14,8 14,10 C14,12 11,13 11,15 C11,17 15,17 15,15" stroke="#F59E0B" stroke-width="2" stroke-linecap="round" fill="none" />
      <circle cx="10" cy="10" r="0.8" fill="#F59E0B" />
    </g>
  `,
};

/**
 * Combines selected options into a single, clean, self-contained SVG string.
 */
export function getCombinedAvatarSvg(
  baseId: string,
  hatId: string,
  accId: string,
  bgId: string
): string {
  const bg = SVGS_BACKGROUNDS[bgId] || SVGS_BACKGROUNDS.sunset;
  const mascot = SVGS_MASCOTS[baseId] || SVGS_MASCOTS.pyto;
  const hat = SVGS_HATS[hatId] || "";
  const acc = SVGS_ACCESSORIES[accId] || "";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
    ${BACKGROUND_DEFS}
    ${bg}
    <g id="avatar-character-group">
      ${mascot}
      ${acc}
      ${hat}
    </g>
  </svg>`;
}

export function getCombinedAvatarDataUrl(
  baseId: string,
  hatId: string,
  accId: string,
  bgId: string
): string {
  const svgContent = getCombinedAvatarSvg(baseId, hatId, accId, bgId);
  // Safe base64 encoding of UTF-8 string in both browser and node contexts
  const base64Svg = typeof window !== "undefined"
    ? window.btoa(unescape(encodeURIComponent(svgContent)))
    : Buffer.from(svgContent, "utf8").toString("base64");
  return `data:image/svg+xml;base64,${base64Svg}`;
}
