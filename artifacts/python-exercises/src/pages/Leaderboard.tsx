import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { LeagueHeader } from "@/components/LeagueHeader";
import { LeaderboardTable, LeaderboardUser } from "@/components/LeaderboardTable";
import { useUser } from "@/context/UserContext";
import { useCurrentUserGamification } from "@/hooks/useUserProgress";
import { Loader2 } from "lucide-react";

// Mock data generator for the 30 participants
function generateMockLeaderboard(currentUserWeeklyXp: number, currentUserName: string): LeaderboardUser[] {
  const users: LeaderboardUser[] = [];
  
  // Nombres aleatorios
  const names = ["Ana", "Carlos", "David", "Elena", "Fernando", "Gabriela", "Hugo", "Isabel", "Juan", "Laura", "Mario", "Natalia", "Oscar", "Patricia", "Roberto", "Sara", "Tomas", "Valentina", "Adrian", "Beatriz", "Cristian", "Diana", "Eduardo", "Fabiola", "Guillermo", "Hector", "Ines", "Javier", "Karla"];
  
  // Add the current user
  users.push({
    id: "current-user",
    name: currentUserName || "Tú",
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUserName || 'Tu'}`,
    weeklyXp: currentUserWeeklyXp,
    isCurrentUser: true,
    streak: Math.floor(Math.random() * 10) + 1,
  });

  // Generate 29 random competitors around the user's XP
  for (let i = 0; i < 29; i++) {
    const randomName = names[i % names.length];
    // Random XP between 0 and UserXP + 500, but keeping it mostly clustered
    const xpVariance = Math.floor(Math.random() * 800) - 400; 
    let xp = currentUserWeeklyXp + xpVariance;
    if (xp < 0) xp = Math.floor(Math.random() * 100);

    users.push({
      id: `user-${i}`,
      name: randomName,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${randomName}`,
      weeklyXp: xp,
      isCurrentUser: false,
      streak: Math.floor(Math.random() * 20),
    });
  }

  return users;
}

export function Leaderboard() {
  const { user } = useUser();
  
  const { data: gamification, isLoading } = useCurrentUserGamification();

  const [leaderboardUsers, setLeaderboardUsers] = useState<LeaderboardUser[]>([]);

  useEffect(() => {
    if (gamification) {
      setLeaderboardUsers(generateMockLeaderboard(gamification.weeklyXp, user?.name ?? "Estudiante"));
    }
  }, [gamification, user?.name]);

  if (isLoading) {
    return (
      <div className="min-h-screen page-bg font-sans flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary opacity-50" />
        </div>
      </div>
    );
  }

  const tier = gamification?.leagueTier ?? 1;

  return (
    <div className="min-h-screen page-bg font-sans flex flex-col">
      <Navbar />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8 flex flex-col gap-8">
        
        {/* Encabezado animado de la Liga */}
        <LeagueHeader leagueTier={tier} />

        {/* Tabla de clasificación interactiva */}
        <div>
          <h3 className="text-2xl font-black text-[var(--texto-principal)] mb-6 flex items-center gap-2">
            🏆 Clasificación Semanal
          </h3>
          <LeaderboardTable users={leaderboardUsers} />
        </div>

      </main>
    </div>
  );
}
