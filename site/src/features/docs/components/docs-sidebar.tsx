import { BookOpen, ChevronDown, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { ApiGroup, HttpMethod } from "../types";

const METHOD_DOT: Record<HttpMethod, string> = {
  GET: "bg-blue-400",
  POST: "bg-green-400",
  PUT: "bg-amber-400",
  DELETE: "bg-red-400",
};

interface DocsSidebarProps {
  groups: ApiGroup[];
  activeId: string | null;
  onNavigate: (id: string) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

function SidebarNav({
  groups,
  activeId,
  onNavigate,
  search,
  onSearchChange,
}: {
  groups: ApiGroup[];
  activeId: string | null;
  onNavigate: (id: string) => void;
  search: string;
  onSearchChange: (value: string) => void;
}) {
  const navRef = useRef<HTMLElement>(null);

  const [manualToggle, setManualToggle] = useState<Record<string, boolean>>({});

  const getIsOpen = useCallback(
    (groupId: string) => {
      if (manualToggle[groupId] !== undefined) return manualToggle[groupId];
      return true;
    },
    [manualToggle],
  );

  const handleToggle = useCallback((groupId: string, open: boolean) => {
    setManualToggle((prev) => ({ ...prev, [groupId]: open }));
  }, []);

  useEffect(() => {
    if (!activeId || !navRef.current) return;
    const activeBtn = navRef.current.querySelector<HTMLElement>(`[data-sidebar-id="${activeId}"]`);
    if (!activeBtn) return;
    activeBtn.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [activeId]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return groups;

    return groups
      .map((group) => {
        if (group.endpoints.length === 0) {
          return group.title.toLowerCase().includes(q) ? group : null;
        }

        const matchingEndpoints = group.endpoints.filter(
          (ep) =>
            ep.title.toLowerCase().includes(q) ||
            ep.path.toLowerCase().includes(q) ||
            ep.method.toLowerCase().includes(q),
        );

        if (matchingEndpoints.length === 0) return null;
        return { ...group, endpoints: matchingEndpoints };
      })
      .filter(Boolean) as ApiGroup[];
  }, [groups, search]);

  const isSearching = search.trim().length > 0;

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border p-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search endpoints..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-8 pl-8 text-xs"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <nav ref={navRef} className="p-2">
          <div className="space-y-1">
            {filtered.length === 0 && (
              <p className="px-3 py-8 text-center text-xs text-muted-foreground">
                No results found
              </p>
            )}

            {filtered.map((group) => {
              const Icon = group.icon;
              const hasEndpoints = group.endpoints.length > 0;
              const isOpen = isSearching || getIsOpen(group.id);
              const hasActiveChild =
                hasEndpoints && group.endpoints.some((ep) => ep.id === activeId);

              if (!hasEndpoints) {
                return (
                  <button
                    key={group.id}
                    type="button"
                    data-sidebar-id={group.id}
                    onClick={() => onNavigate(group.id)}
                    className={cn(
                      "flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px]",
                      activeId === group.id
                        ? "font-medium text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <BookOpen className="h-4 w-4 shrink-0" />
                    <span>{group.title}</span>
                  </button>
                );
              }

              return (
                <Collapsible
                  key={group.id}
                  open={isOpen}
                  onOpenChange={(open) => handleToggle(group.id, open)}
                >
                  <CollapsibleTrigger
                    data-sidebar-id={group.id}
                    className={cn(
                      "group/trigger flex w-full items-center gap-2.5 py-2 pl-3 pr-5 text-left text-[13px] font-medium",
                      hasActiveChild
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1 truncate">{group.title}</span>

                    <span className="flex items-center gap-1">
                      <span className="min-w-5 text-center text-[10px] tabular-nums text-muted-foreground/60">
                        {group.endpoints.length}
                      </span>
                      <ChevronDown
                        className={cn(
                          "h-3.5 w-3.5 shrink-0 text-muted-foreground/50",
                          isOpen && "rotate-180",
                        )}
                      />
                    </span>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="ml-5 flex flex-col border-l border-border/50 pl-3">
                      {group.endpoints.map((ep) => {
                        const isActive = activeId === ep.id;
                        return (
                          <button
                            key={ep.id}
                            type="button"
                            data-sidebar-id={ep.id}
                            onClick={() => onNavigate(ep.id)}
                            className={cn(
                              "flex w-full items-center gap-2 py-1.5 text-left text-[13px]",
                              isActive
                                ? "text-foreground"
                                : "text-muted-foreground hover:text-foreground",
                            )}
                          >
                            <span
                              className={cn(
                                "h-1.5 w-1.5 shrink-0 rounded-full",
                                METHOD_DOT[ep.method],
                              )}
                            />
                            <span className="truncate">{ep.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}

export function DocsSidebar({
  groups,
  activeId,
  onNavigate,
  mobileOpen,
  onMobileClose,
}: DocsSidebarProps) {
  const [search, setSearch] = useState("");

  const handleNavigate = (id: string) => {
    onNavigate(id);
    onMobileClose();
  };

  return (
    <>
      <aside className="docs-sidebar hidden w-72 shrink-0 border-r border-border lg:flex lg:flex-col lg:overflow-hidden">
        <SidebarNav
          groups={groups}
          activeId={activeId}
          onNavigate={onNavigate}
          search={search}
          onSearchChange={setSearch}
        />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={(open) => !open && onMobileClose()}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="flex h-14 items-center gap-2 border-b border-border px-4">
            <SheetTitle className="text-sm font-semibold">API Reference</SheetTitle>
          </SheetHeader>
          <div className="h-[calc(100vh-3.5rem)]">
            <SidebarNav
              groups={groups}
              activeId={activeId}
              onNavigate={handleNavigate}
              search={search}
              onSearchChange={setSearch}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
