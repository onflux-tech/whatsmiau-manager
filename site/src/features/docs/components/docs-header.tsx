import { ArrowLeft, Menu, Moon, Sun } from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useThemeStore } from "@/stores/theme";

interface DocsHeaderProps {
  onMobileToggle: () => void;
  historySlot?: React.ReactNode;
}

export function DocsHeader({ onMobileToggle, historySlot }: DocsHeaderProps) {
  const { toggle: toggleTheme, dark } = useThemeStore();

  return (
    <header className="docs-header sticky top-0 z-50 flex h-14 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur-md">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onMobileToggle}
        className="docs-mobile-toggle lg:hidden"
        aria-label="Toggle sidebar"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex items-center gap-2">
        <span className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
          W
        </span>
        <span className="hidden text-lg font-semibold sm:inline">WhatsMiau</span>
        <Separator orientation="vertical" className="!h-5" />
        <span className="text-sm text-muted-foreground">API Reference</span>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        {historySlot}
        <Button variant="ghost" size="icon-sm" onClick={toggleTheme} aria-label="Toggle theme">
          {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link to="/">
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
        </Button>
      </div>
    </header>
  );
}
