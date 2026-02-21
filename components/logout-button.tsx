"use client";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

interface LogoutButtonProps {
  collapsed?: boolean;
}

export function LogoutButton({ collapsed = false }: LogoutButtonProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (

    <Button
      variant="ghostRed"
      className={`w-full  text-zen-anti-flash/80 hover:text-zen-anti-flash hover:bg-red-800/90 transition-colors ${
        collapsed ? 'justify-center px-0' : 'justify-start'
      }`}
      onClick={handleLogout}
    >
      <LogOut className={`h-4 w-4 text-zen-anti-flash ${collapsed ? '' : 'mr-2'}`} />
      {!collapsed && <span className="font-medium">Cerrar Sesión</span>}
    </Button>
  );
}
