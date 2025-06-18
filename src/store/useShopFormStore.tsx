import { create } from 'zustand';

interface ShopFormValues {
  name: string;
  phone: string;
  address: string;
}

interface ShopFormState {
  formData: ShopFormValues;
  isLoading: boolean;
  apiError: string;
  setFormData: (data: Partial<ShopFormValues>) => void;
  setIsLoading: (loading: boolean) => void;
  setApiError: (message: string) => void;
  resetForm: () => void;
}

const initialState: ShopFormValues = {
  name: '',
  phone: '',
  address: '',
};

export const useShopFormStore = create<ShopFormState>((set) => ({
  formData: initialState,
  isLoading: false,
  apiError: '',
  setFormData: (data) => set((state) => ({
    formData: { ...state.formData, ...data }
  })),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setApiError: (message) => set({ apiError: message }),
  resetForm: () => set({ formData: initialState, apiError: '', isLoading: false }),
})); 