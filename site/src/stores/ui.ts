import { create } from "zustand";

interface UIState {
  selectedInstance: string | null;
  activeTab: string;
  drawerOpen: boolean;
  commandOpen: boolean;
  settingsOpen: boolean;
  selectInstance: (id: string | null, tab?: string) => void;
  closeDrawer: () => void;
  setActiveTab: (tab: string) => void;
  setCommandOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  selectedInstance: null,
  activeTab: "connect",
  drawerOpen: false,
  commandOpen: false,
  settingsOpen: false,

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
}));
