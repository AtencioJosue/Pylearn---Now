import { Link, useLocation } from "wouter";
import { BookOpen, ArrowLeft, Code2, MessageCircle, User } from "lucide-react";
import { useGetProgress } from "@workspace/api-client-react";
import { useUser } from "@/context/UserContext";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

export function Navbar({ backTo = null }: { backTo?: string | null }) {
  const { data: progress } = useGetProgress();
  const { user, unlockAchievement } = useUser();
  const [location] = useLocation();

  const totalEx = progress?.totalExercises ?? 1;
  const correct = progress?.correctAnswers ?? 0;
  const percent = Math.round((correct / totalEx) * 100);

  useEffect(() => {
    if (!user || !progress) return;
    if (percent >= 25) unlockAchievement("progress_25");
    if (percent >= 50) unlockAchievement("progress_50");
    if (percent >= 75) unlockAchievement("progress_75");
    if (percent >= 100) unlockAchievement("progress_100");
  }, [percent, user, progress]);

  const navLink = (href: string, label: string, icon?: React.ReactNode) => (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-colors",
        location === href
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      )}
    >
      {icon}
      {label}
    </Link>
  );

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-xl bg-background/80 border-b border-border/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Left: logo + nav */}
          <div className="flex items-center gap-2">
            {backTo && (
              <Link href={backTo} className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            )}
            <Link href="/" className="flex items-center gap-2 group mr-2">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight text-foreground hidden sm:block">
                PyLearn
              </span>
            </Link>

            <div className="hidden sm:flex items-center gap-1">
              {navLink("/", "Ejercicios")}
              {navLink("/playground", "Editor libre", <Code2 className="w-4 h-4" />)}
              {navLink("/foro", "Foro", <MessageCircle className="w-4 h-4" />)}
            </div>
          </div>

          {/* Right: progress bar + user */}
          <div className="flex items-center gap-3">
            {/* Progress bar */}
            {progress && (
              <div className="hidden sm:flex items-center gap-3 bg-white px-4 py-2 rounded-2xl shadow-sm border border-border/50 min-w-[160px]">
                <div className="flex-1">
                  <div className="flex justify-between text-xs font-bold text-muted-foreground mb-1">
                    <span>Progreso</span>
                    <span>{percent}%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* User pill */}
            {user ? (
              <Link
                href="/perfil"
                className="flex items-center gap-2 bg-white px-3 py-2 rounded-2xl shadow-sm border border-border/50 hover:border-primary/30 transition-all group"
              >
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <User className="w-4 h-4" />
                </div>
                <span className="text-sm font-bold text-foreground hidden md:block max-w-[100px] truncate">
                  {user.name}
                </span>
              </Link>
            ) : (
              <div className="w-9 h-9 rounded-xl bg-muted animate-pulse" />
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
