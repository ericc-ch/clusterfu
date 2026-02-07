import { create } from "zustand"

type SidebarState = {
  openMobile: boolean
}

type SidebarActions = {
  setOpenMobile: (open: boolean) => void
  toggleMobile: () => void
}

type SidebarStore = SidebarState & {
  actions: SidebarActions
}

export const useSidebarStore = create<SidebarStore>((set) => ({
  openMobile: false,
  actions: {
    setOpenMobile: (openMobile) => set({ openMobile }),
    toggleMobile: () => set((state) => ({ openMobile: !state.openMobile })),
  },
}))

export const useSidebarActions = () => useSidebarStore((s) => s.actions)
export const useSidebarOpenMobile = () => useSidebarStore((s) => s.openMobile)
