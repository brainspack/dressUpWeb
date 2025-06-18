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
  address: z.string().min(5, { message: 'Address must be at least 5 characters.' }).nullable().optional(),
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
      address: customerToEdit?.address ?? undefined,
    },
  })

  // Sync react-hook-form inputs to Zustand store on every change
  useEffect(() => {
    if (customerToEdit) {
      setValue('name', customerToEdit.name);
      setValue('mobileNumber', customerToEdit.mobileNumber);
      setValue('address', customerToEdit.address ?? undefined);
    } else {
      reset();
    }
    const subscription = watch((value) => {
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
        console.log('Customer updated successfully:', response)
      } else {
        // Create new customer
        const response = await baseApi('/customers/create', {
          method: 'POST',
          data: {
            ...values,
            shopId: shopId,
          },
        })
        console.log('Customer created successfully:', response)
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
        <div>
          <label htmlFor="name" className="block mb-1 font-medium">
            Name
          </label>
          <Input
          // lbael="my knvhj"
            id="name"
            type="text"
            placeholder="Enter name"
            {...register('name')}
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="mobileNumber" className="block mb-1 font-medium">
            Mobile Number
          </label>
          <Input
            id="mobileNumber"
            type="text"
            maxLength={10}
            placeholder="Enter mobile number"
            {...register('mobileNumber')}
            onInput={(e) => {
              const input = e.currentTarget
              input.value = input.value.replace(/\D/g, '').slice(0, 10)
            }}
            className={errors.mobileNumber ? 'border-red-500' : ''}
          />
          {errors.mobileNumber && (
            <p className="text-red-500 text-sm mt-1">{errors.mobileNumber.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="address" className="block mb-1 font-medium">
            Address
          </label>
          <Input
            id="address"
            type="text"
            placeholder="Enter address"
            {...register('address')}
            className={errors.address ? 'border-red-500' : ''}
          />
          {errors.address && (
            <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
          )}
        </div>

        {apiError && <p className="text-red-600 mb-2">{apiError}</p>}

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="blueGradient" onClick={onCancel}>Cancel</Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (customerToEdit ? 'Updating...' : 'Creating...') : (customerToEdit ? 'Update Customer' : 'Create Customer')}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default NewCustomerForm

