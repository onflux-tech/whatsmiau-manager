import { BookOpen, LogOut, Search, Settings } from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { useUIStore } from "@/stores/ui";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";

export function TopBar({ wid }: { wid: string }) {
  const isMobile = useIsMobile();
  const { setCommandOpen, setSettingsOpen } = useUIStore();
  const { logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 flex h-12 items-center justify-between border-b border-border bg-background/80 px-3 backdrop-blur-sm">
      <WorkspaceSwitcher currentWid={wid} />

      <div className="flex items-center gap-1">
        {!isMobile && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm" onClick={() => setCommandOpen(true)}>
                <Search className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Buscar (Ctrl+K)</TooltipContent>
          </Tooltip>
        )}

        <ThemeToggle />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-sm" onClick={() => setSettingsOpen(true)}>
              <Settings className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Configurações</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-sm" asChild>
              <Link to="/docs">
                <BookOpen className="size-4" />
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent>API Docs</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-sm" onClick={logout}>
              <LogOut className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Sair</TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
}
