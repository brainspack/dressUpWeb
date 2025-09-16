import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

import { Input } from '../../../components/ui/input'
import { Button } from '../../../components/ui/button'
import { baseApi } from '../../../api/baseApi'
import { useCustomerFormStore } from '../../../store/useCustomerFormStore'

const customerSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  mobileNumber: z
    .string()
    .regex(/^\d+$/, { message: 'Only digits allowed.' })
    .min(10, { message: 'Must be at least 10 digits.' }),
  address: z.string().min(5, { message: 'Address must be at least 5 characters.' }).nullable().optional().or(z.literal('')),
})

type CustomerFormValues = z.infer<typeof customerSchema>

interface NewCustomerFormProps {
  onFormSubmitSuccess?: () => void;
  shopId?: string | null;
  customerToEdit?: {
    id: string;
    name: string;
    mobileNumber: string;
    address?: string | null;
  };
  onCancel?: () => void;
}

const NewCustomerForm: React.FC<NewCustomerFormProps> = ({
  onFormSubmitSuccess,
  shopId,
  customerToEdit,
  onCancel,
}) => {
  // Zustand store state and actions
  const {
    formData,
    setFormData,
    isLoading,
    apiError,
    setIsLoading,
    setApiError,
    resetForm,
  } = useCustomerFormStore()

  // react-hook-form setup with initial values from Zustand store
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: customerToEdit?.name || '',
      mobileNumber: customerToEdit?.mobileNumber || '',
      address: (customerToEdit?.address === null ? '' : customerToEdit?.address) || '',
    } as CustomerFormValues,
  })

  // Sync react-hook-form inputs to Zustand store on every change
  useEffect(() => {
    if (customerToEdit) {
      setValue('name', customerToEdit.name);
      setValue('mobileNumber', customerToEdit.mobileNumber);
      setValue('address', customerToEdit.address || '');
    } else {
      reset();
    }
    const subscription = watch((value:any) => {
      setFormData(value)
    })
    return () => subscription.unsubscribe()
  }, [watch, setFormData, customerToEdit, reset, setValue])

  // Form submit handler
  const onSubmit = async (values: CustomerFormValues) => {
    setApiError('')
    setIsLoading(true)
    try {
      if (customerToEdit) {
        // Update existing customer
        const response = await baseApi(`/customers/${customerToEdit.id}`, {
          method: 'PATCH',
          data: values,
        })
    
      } else {
        // Create new customer
        const response = await baseApi('/customers/create', {
          method: 'POST',
          data: {
            ...values,
            shopId: shopId,
          },
        })
       
      }
      onFormSubmitSuccess?.();
      reset(); // reset react-hook-form fields
      resetForm(); // reset Zustand store state
    } catch (error: any) {
      setApiError(error.message || `Failed to ${customerToEdit ? 'update' : 'create'} customer`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-md shadow-md">
      <h2 className="text-2xl font-bold mb-4">{customerToEdit ? 'Edit Customer' : 'Create New Customer'}</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Name"
          type="text"
          placeholder="Enter name"
          {...register('name')}
          error={errors.name?.message}
        />

        <Input
          label="Mobile Number"
          type="text"
          maxLength={10}
          placeholder="Enter mobile number"
          {...register('mobileNumber')}
          error={errors.mobileNumber?.message}
          onInput={(e) => {
            const input = e.currentTarget
            input.value = input.value.replace(/\D/g, '').slice(0, 10)
          }}
        />

        <Input
          label="Address"
          type="text"
          placeholder="Enter address"
          {...register('address')}
          error={errors.address?.message}
        />

        {apiError && <p className="text-red-600 mb-2">{apiError}</p>}

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="mintGreen" onClick={onCancel}>Cancel</Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (customerToEdit ? 'Updating...' : 'Creating...') : (customerToEdit ? 'Update Customer' : 'Create Customer')}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default NewCustomerForm

