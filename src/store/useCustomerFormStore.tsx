// src/store/useCustomerFormStore.ts
import { create } from 'zustand'

interface CustomerFormValues {
  name: string
  mobileNumber: string
  address: string
}

interface CustomerFormState {
  formData: CustomerFormValues
  isLoading: boolean
  apiError: string
  setFormData: (data: Partial<CustomerFormValues>) => void
  setIsLoading: (loading: boolean) => void
  setApiError: (message: string) => void
  resetForm: () => void
}

const initialState: CustomerFormValues = {
  name: '',
  mobileNumber: '',
  address: '',
}

export const useCustomerFormStore = create<CustomerFormState>((set) => ({
  formData: initialState,
  isLoading: false,
  apiError: '',
  setFormData: (data) => set((state) => ({
    formData: { ...state.formData, ...data }
  })),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setApiError: (message) => set({ apiError: message }),
  resetForm: () => set({ formData: initialState, apiError: '', isLoading: false }),
}))
