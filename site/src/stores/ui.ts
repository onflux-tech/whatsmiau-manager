import { create } from "zustand";

interface UIState {
  selectedInstance: string | null;
  activeTab: string;
  drawerOpen: boolean;
  commandOpen: boolean;
  settingsOpen: boolean;
  checkNumberOpen: boolean;
  bulkMode: boolean;
  bulkSelected: Set<string>;
  selectInstance: (id: string | null, tab?: string) => void;
  closeDrawer: () => void;
  setActiveTab: (tab: string) => void;
  setCommandOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  setCheckNumberOpen: (open: boolean) => void;
  toggleBulkMode: () => void;
  toggleSelected: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
  selectedInstance: null,
  activeTab: "connect",
  drawerOpen: false,
  commandOpen: false,
  settingsOpen: false,
  checkNumberOpen: false,
  bulkMode: false,
  bulkSelected: new Set(),

  selectInstance: (id, tab) =>
    set({
      selectedInstance: id,
      drawerOpen: id !== null,
      activeTab: tab ?? "connect",
    }),

  closeDrawer: () => set({ drawerOpen: false, selectedInstance: null }),

  setActiveTab: (tab) => set({ activeTab: tab }),

  setCommandOpen: (open) => set({ commandOpen: open }),

  setSettingsOpen: (open) => set({ settingsOpen: open }),

  setCheckNumberOpen: (open) => set({ checkNumberOpen: open }),

  toggleBulkMode: () =>
    set((s) => ({
      bulkMode: !s.bulkMode,
      bulkSelected: s.bulkMode ? new Set() : s.bulkSelected,
    })),

  toggleSelected: (id) =>
    set((s) => {
      const next = new Set(s.bulkSelected);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { bulkSelected: next, bulkMode: next.size > 0 };
    }),

  selectAll: (ids) => set({ bulkSelected: new Set(ids), bulkMode: true }),

  clearSelection: () => set({ bulkSelected: new Set(), bulkMode: false }),
}));
