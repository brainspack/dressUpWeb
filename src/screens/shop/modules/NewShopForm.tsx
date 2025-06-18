import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../../components/ui/form'
import { useShopFormStore } from '../../../store/useShopFormStore'
import { baseApi } from '../../../api/baseApi'

const shopSchema = z.object({
  name: z.string().min(1, 'Shop name is required'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').max(10, 'Phone number must not exceed 10 digits'),
  address: z.string().min(1, 'Address is required'),
})

type ShopFormValues = z.infer<typeof shopSchema>

interface NewShopFormProps {
  onFormSubmitSuccess?: () => void
  editMode?: boolean
  shopToEdit?: {
    id: string
    name: string
    phone: string
    address: string
  }
}

const NewShopForm: React.FC<NewShopFormProps> = ({ onFormSubmitSuccess, editMode = false, shopToEdit }) => {
  const {
    formData,
    isLoading,
    apiError,
    setFormData,
    setIsLoading,
    setApiError,
    resetForm,
  } = useShopFormStore()

  const form = useForm<ShopFormValues>({
    resolver: zodResolver(shopSchema),
    defaultValues: editMode && shopToEdit ? shopToEdit : formData || { name: '', phone: '', address: '' },
    mode: 'onSubmit',
  })

  React.useEffect(() => {
    const subscription = form.watch((value) => {
      setFormData(value as Partial<ShopFormValues>)
    })
    return () => subscription.unsubscribe()
  }, [form.watch, setFormData])

  const onSubmit = async (values: ShopFormValues) => {
    setApiError('')
    setIsLoading(true)
    try {
      if (editMode && shopToEdit) {
        // Update existing shop
        const response = await baseApi(`/shops/${shopToEdit.id}`, {
          method: 'PATCH',
          body: JSON.stringify(values),
        })
        console.log('Shop updated successfully:', response)
      } else {
        // Create new shop
        const response = await baseApi('/shops/create', {
          method: 'POST',
          body: JSON.stringify(values),
        })
        console.log('Shop created successfully:', response)
      }
      onFormSubmitSuccess?.()
      form.reset()
      resetForm()
    } catch (error: any) {
      setApiError(error.message || `Failed to ${editMode ? 'update' : 'create'} shop`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-md shadow-md">
      <h2 className="text-2xl font-bold mb-4">{editMode ? 'Edit Shop' : 'Create New Shop'}</h2>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Shop Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter shop name" {...field} />
              </FormControl>
              <FormMessage>{form.formState.errors.name?.message}</FormMessage>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter phone number"
                  {...field}
                  onInput={(e) => {
                    const input = e.currentTarget
                    input.value = input.value.replace(/\D/g, '').slice(0, 10)
                    field.onChange(input.value)
                  }}
                />
              </FormControl>
              <FormMessage>{form.formState.errors.phone?.message}</FormMessage>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="Enter address" {...field} />
              </FormControl>
              <FormMessage>{form.formState.errors.address?.message}</FormMessage>
            </FormItem>
          )}
        />

        {apiError && <p className="text-red-500 text-sm">{apiError}</p>}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (editMode ? 'Updating...' : 'Creating...') : (editMode ? 'Update Shop' : 'Create Shop')}
        </Button>
      </form>
    </div>
  )
}

export default NewShopForm
