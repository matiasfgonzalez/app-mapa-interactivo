"use client";

import { useState, useRef, useEffect } from "react";
import {
  User as UserIcon,
  ChevronDown,
  LogOut,
  Settings,
  User as UserProfile,
} from "lucide-react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface UserMenuProps {
  user: User | null;
  loading: boolean;
}

export default function UserMenu({ user, loading }: Readonly<UserMenuProps>) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleLogin = () => {
    router.push("/login");
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin"></div>
    );
  }

  if (!user) {
    return (
      <button
        onClick={handleLogin}
        className="cursor-pointer flex items-center space-x-1 sm:space-x-2 px-3 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors"
      >
        <UserIcon size={16} className="sm:w-[18px] sm:h-[18px]" />
        <span className="hidden sm:block text-sm font-medium">
          Iniciar sesión
        </span>
      </button>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 text-foreground hover:bg-accent rounded-lg transition-colors"
      >
        <div className="flex items-center space-x-2">
          {user.user_metadata?.avatar_url ? (
            <img
              src={user.user_metadata.avatar_url}
              alt="Avatar"
              className="w-6 h-6 rounded-full object-cover"
            />
          ) : (
            <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-muted-foreground">
              <UserIcon size={14} />
            </div>
          )}
          <span className="hidden sm:block text-sm font-medium max-w-24 truncate">
            {user.user_metadata?.full_name || user.email?.split("@")[0]}
          </span>
        </div>
        <ChevronDown
          size={14}
          className={`hidden sm:block transition-transform text-muted-foreground ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-card rounded-lg shadow-lg border border-border z-50">
          <div className="py-1">
            {/* Información del usuario */}
            <div className="px-4 py-3 border-b border-border">
              <div className="font-medium text-foreground">
                {user.user_metadata?.full_name || "Usuario"}
              </div>
              <div className="text-sm text-muted-foreground truncate">
                {user.email}
              </div>
            </div>

            {/* Opciones del menú */}
            <button className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent flex items-center gap-2 transition-colors">
              <UserProfile size={16} className="text-muted-foreground" />
              <span>Mi perfil</span>
            </button>

            <button className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent flex items-center gap-2 transition-colors">
              <Settings size={16} className="text-muted-foreground" />
              <span>Configuración</span>
            </button>

            <div className="border-t border-border mt-1">
              <button
                onClick={handleLogout}
                className="cursor-pointer w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/10 flex items-center gap-2 transition-colors"
              >
                <LogOut size={16} />
                <span>Cerrar sesión</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
