import { Menu, Info } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NavigationMenuOptions } from "@/components/NavigationMenu";
import UserMenu from "@/components/UserMenu";
import { User } from "@supabase/supabase-js";

interface HeaderProps {
  user: User | null;
  loading: boolean;
  leftSidebarOpen: boolean;
  setLeftSidebarOpen: (open: boolean) => void;
  rightSidebarOpen: boolean;
  setRightSidebarOpen: (open: boolean) => void;
  isMobile: boolean;
}

export function Header({
  user,
  loading,
  leftSidebarOpen,
  setLeftSidebarOpen,
  rightSidebarOpen,
  setRightSidebarOpen,
  isMobile,
}: HeaderProps) {
  return (
    <nav className="bg-card border-b border-border shadow-sm z-50 relative">
      <div className="px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo y controles de sidebar */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={() => {
                setLeftSidebarOpen(!leftSidebarOpen);
                if (isMobile && rightSidebarOpen) setRightSidebarOpen(false);
              }}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label="Toggle menu"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-32 h-8 rounded-lg flex items-center justify-center">
                <img
                  alt="CEREGEO Logo"
                  src="https://ceregeo.github.io/Ceregeo/images/logoceregeo.png"
                  className="dark:brightness-110"
                />
              </div>
              <span className="text-lg sm:text-xl font-semibold text-foreground hidden sm:block">
                CEREGEO
              </span>
            </div>
          </div>

          {/* Menú central - Solo visible en desktop */}
          <div className="hidden lg:flex items-center space-x-6">
            <NavigationMenuOptions />
          </div>

          {/* Controles derecha */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            <ThemeToggle />
            <UserMenu user={user} loading={loading} />
            <button
              onClick={() => {
                setRightSidebarOpen(!rightSidebarOpen);
                if (isMobile && leftSidebarOpen) setLeftSidebarOpen(false);
              }}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label="Toggle info panel"
            >
              <Info size={20} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
