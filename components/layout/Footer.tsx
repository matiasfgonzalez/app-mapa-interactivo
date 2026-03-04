import { StatsMini } from "@/components/StatsPanel";

export function Footer({ lat, lon }: { lat: number | null; lon: number | null }) {
  return (
    <footer className="bg-card border-t border-border px-4 py-2 hidden md:block">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>© 2026 CEREGEO</span>
          <a href="#" className="hover:text-foreground transition-colors">
            Términos
          </a>
          <a href="#" className="hover:text-foreground transition-colors">
            Privacidad
          </a>
          <span className="hidden lg:block">|</span>
          <span className="hidden lg:flex">
            <StatsMini />
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono">
            {lat?.toFixed(6) || "--"}, {lon?.toFixed(6) || "--"}
          </span>
          <span className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Conectado</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
