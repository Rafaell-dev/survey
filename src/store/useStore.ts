import { create } from 'zustand'
import { Form, User } from '@/domain/types'

interface AppState {
  user: User | null;
  forms: Form[];
  setUser: (user: User | null) => void;
  setForms: (forms: Form[]) => void;
  addForm: (form: Form) => void;
  deleteForm: (id: string) => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  forms: [],
  setUser: (user) => set({ user }),
  setForms: (forms) => set({ forms }),
  addForm: (form) => set((state) => ({ forms: [...state.forms, form] })),
  deleteForm: (id) => set((state) => ({ forms: state.forms.filter(f => f.id !== id) })),
}))
