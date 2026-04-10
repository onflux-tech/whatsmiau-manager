import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { apiGroups } from "../data/api-reference";
import { useScrollSpy } from "../hooks/use-scroll-spy";
import type { ApiEndpoint } from "../types";
import { DocsContent } from "./docs-content";
import { DocsHeader } from "./docs-header";
import { DocsSidebar } from "./docs-sidebar";
import { PlaygroundAuthProvider } from "./playground-auth";
import { HistoryPopover } from "./playground-history";
import { type HistoryEntry, PlaygroundSheet } from "./playground-sheet";
import { usePlaygroundHistory } from "./use-playground-history";
import "./print.css";

function DocsPageInner() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [playgroundEndpoint, setPlaygroundEndpoint] = useState<ApiEndpoint | null>(null);
  const [playgroundOpen, setPlaygroundOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { entries, addEntry, clearHistory } = usePlaygroundHistory();

  const sectionIds = useMemo(() => {
    const ids: string[] = [];
    for (const group of apiGroups) {
      if (group.endpoints.length === 0) {
        ids.push(group.id);
      } else {
        for (const ep of group.endpoints) {
          ids.push(ep.id);
        }
      }
    }
    return ids;
  }, []);

  const { activeId, scrollTo } = useScrollSpy(sectionIds, scrollRef);

  useEffect(() => {
    const prev = document.title;
    document.title = "WhatsMiau API Reference";
    return () => {
      document.title = prev;
    };
  }, []);

  const handleNavigate = (id: string) => {
    scrollTo(id);
    setMobileOpen(false);
  };

  const handleOpenPlayground = useCallback((endpoint: ApiEndpoint) => {
    setPlaygroundEndpoint(endpoint);
    setPlaygroundOpen(true);
  }, []);

  const handleHistory = useCallback(
    (entry: HistoryEntry) => {
      addEntry(entry);
    },
    [addEntry],
  );

  const handleReplay = useCallback(
    (entry: HistoryEntry) => {
      for (const group of apiGroups) {
        const ep = group.endpoints.find((e) => e.path === entry.path && e.method === entry.method);
        if (ep) {
          handleOpenPlayground(ep);
          return;
        }
      }
    },
    [handleOpenPlayground],
  );

  return (
    <div className="bg-dot-pattern flex h-screen flex-col bg-background">
      <DocsHeader
        onMobileToggle={() => setMobileOpen(!mobileOpen)}
        historySlot={
          <HistoryPopover entries={entries} onClear={clearHistory} onReplay={handleReplay} />
        }
      />

      <div className="flex flex-1 overflow-hidden">
        <DocsSidebar
          groups={apiGroups}
          activeId={activeId}
          onNavigate={handleNavigate}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />
        <DocsContent ref={scrollRef} groups={apiGroups} onOpenPlayground={handleOpenPlayground} />
      </div>

      <PlaygroundSheet
        open={playgroundOpen}
        onOpenChange={setPlaygroundOpen}
        endpoint={playgroundEndpoint}
        onHistory={handleHistory}
      />
    </div>
  );
}

export default function DocsPage() {
  return (
    <PlaygroundAuthProvider>
      <DocsPageInner />
    </PlaygroundAuthProvider>
  );
}
