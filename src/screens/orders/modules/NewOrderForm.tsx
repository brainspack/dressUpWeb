import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import SelectField from "../../../components/ui/select";
import ImageUploader from "../../../components/ui/ImageUploader";
import { OrderFormData } from '../schemas/orderSchemas';
import MeasurementInputs from '../components/MeasurementInputs';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { useOrderHook } from '../hooks/useOrderHook';

interface NewOrderFormProps {
  onFormSubmitSuccess?: () => void;
  initialData?: Partial<OrderFormData>;
  orderId?: string;
  onBack?: () => void;
}

const NewOrderForm: React.FC<NewOrderFormProps> = ({
  onFormSubmitSuccess,
  initialData: propInitialData,
  orderId: propOrderId,
  onBack,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Use the custom hook
  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    errors,
    fields,
    append,
    remove,
    appendClothingItem,
    handleRemoveOrResetClothingItem,
    loadingShopId,
    loadingTailors,
    shopIdError,
    tailorsError,
    tailors,
    costs,
    isEditMode,
    orderId,
    isLoadingOrder,
    isFormInitialized,
    handleCostChange,
    handleTailorSelect,
    onSubmit,
  } = useOrderHook({
    onFormSubmitSuccess,
    initialData: propInitialData,
    orderId: propOrderId,
    onBack,
  });

  // Add a title based on whether we're editing or creating
  const formTitle = orderId ? "Edit Order" : "New Order";
  const submitButtonText = orderId ? "Update Order" : "Create Order";

  // Show loading state when fetching order data from API
  if (isEditMode && isLoadingOrder) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading order data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card>
        <CardContent className="px-6 py-4">
          {/* Back Button */}
          <div className="mb-4">
            <Button
              type="button"
              variant="blueGradient"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              ← Back
            </Button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full">
            {/* Add debugging for form submission */}
            <div className="text-xs text-gray-500">
              <p>Form errors: {Object.keys(errors).length > 0 ? JSON.stringify(errors, null, 2) : 'No errors'}</p>
            </div>

            {/* Add a visual indicator for edit mode */}
            {isEditMode && (
              <div className="bg-blue-100 border-l-4 border-blue-500 p-4 mb-4">
                <div className="flex">
                  <div className='flex-shrink-0'>
                    <svg className='h-5 w-5 text-blue-500' viewBox='0 0 20 20' fill='currentColor'>
                      <path fillRule='evenodd' d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z' clipRule='evenodd' />
                    </svg>
                  </div>
                  <div className='ml-3'>
                    <p className='text-sm text-blue-700'>
                      You are editing an existing order. Any changes you make will update the current order.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {onBack && (
              <Button type="button" variant="blueGradient" onClick={onBack} className="mb-4">
                ← Back
              </Button>
            )}

            <div className="text-sm text-gray-600 mb-4">
              <p><strong>Customer ID:</strong> {watch('customerId')}</p>
              <p><strong>Shop ID:</strong> {loadingShopId ? 'Loading...' : watch('shopId')}</p>
              {shopIdError && <p className="text-red-500">Error: {shopIdError}</p>}
            </div>

            {/* Tailor Selection */}
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-3 font-medium">Tailor Name</div>
                <div className="col-span-9">
                  {loadingTailors ?
                    (
                      <p className="text-gray-500">Loading tailors...</p>
                    ) : tailorsError ? (
                      <p className="text-red-500">{tailorsError}</p>
                    ) : tailors.length === 0 ? (
                      <p className="text-gray-500">No tailors found for this shop</p>
                    )
                      : (
                        <SelectField
                          name="tailorName"
                          value={watch('tailorId') || ''}
                          onValueChange={handleTailorSelect}
                          options={[
                            { label: 'Select a tailor', value: 'no-selection-placeholder' },
                            ...tailors.map(tailor => ({ label: tailor.label, value: tailor.value }))
                          ]}
                          placeholder="Select a tailor"
                          className="w-full"
                        />
                      )}
                </div>
              </div>
              <div className="grid grid-cols-12 gap-2 items-center">
                <Input
                  label="Tailor Number"
                  {...register('tailorNumber')}
                  readOnly
                  value={watch('tailorNumber')}
                  className="min-w-[150px] w-[290px]" // or w-40/w-48 as per your design
                  error={(errors.tailorName as any)?.message || errors.tailorName}
                />
              </div>
            </div>

            {/* Status and Dates */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-3 font-medium">Status</div>
                <div className="col-span-9">
                  <SelectField
                    name="status"
                    value={watch('status')}
                    onValueChange={(value) => setValue('status', value as any)}
                    options={[
                      { label: 'Select status', value: 'status' },
                      { label: 'Pending', value: 'PENDING' },
                      { label: 'Delivered', value: 'DELIVERED' },
                      { label: 'Cancelled', value: 'CANCELLED' },
                    ]}
                    placeholder="Select status"
                    className="w-full"
                  />
                </div>
              </div>
              <Input
                label="Order Date"
                type="date"
                {...register('orderDate')}
                error={(errors.orderDate as any)?.message || errors.orderDate}
                className="col-span-9"
              />
              <Input
                label="Delivery Date"
                type="date"
                {...register('deliveryDate')}
                error={(errors.deliveryDate as any)?.message || errors.deliveryDate}
                className="col-span-9"
              />
            </div>
            {errors.status && <p className="text-red-500 text-sm">{(errors.status as any)?.message || errors.status}</p>}

            {/* Clothing Items */}
            {fields.map((field, index) => (
              <Card key={field.id} className="mb-4 p-4 border rounded-lg">
                {/* Add CardHeader for title of the clothing item */}
                <CardHeader className="px-0 py-4">
                  <CardTitle className="text-lg">Clothing Item {index + 1}</CardTitle>
                </CardHeader>
                <CardContent className="px-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 h-full">
                    {/* Left column for clothing details */}
                    <div className="space-y-4 flex flex-col justify-between">
                      <Input
                        label="Type"
                        {...register(`clothes.${index}.type`)}
                        placeholder="e.g., kurti, pant, shirt"
                        error={(errors.clothes?.[index]?.type as any)?.message || errors.clothes?.[index]?.type}
                      />
                      <Input
                        label="Color"
                        {...register(`clothes.${index}.color`)}
                        placeholder="e.g., blue, red, black"
                        error={(errors.clothes?.[index]?.color as any)?.message || errors.clothes?.[index]?.color}
                      />
                      <Input
                        label="Fabric"
                        {...register(`clothes.${index}.fabric`)}
                        placeholder="e.g., georgette, cotton, silk"
                        error={(errors.clothes?.[index]?.fabric as any)?.message || errors.clothes?.[index]?.fabric}
                      />
                      <Textarea
                        label="Design Notes"
                        {...register(`clothes.${index}.designNotes`)}
                        placeholder="Any specific design requests or notes"
                        rows={4}
                        error={(errors.clothes?.[index]?.designNotes as any)?.message || errors.clothes?.[index]?.designNotes}
                      />
                      <div className="flex space-x-4 w-full mt-auto">
                        <ImageUploader
                          label="Upload Images"
                          onFilesChange={(files) => {
                            if (files) {
                              // Convert FileList to array of URLs
                              const urls = Array.from(files).map(file => URL.createObjectURL(file));
                              setValue(`clothes.${index}.imageUrls`, urls, { shouldDirty: true });
                            }
                          }}
                          initialUrls={watch(`clothes.${index}.imageUrls`) || []}
                          existingImageUrls={watch(`clothes.${index}.imageUrls`) || []}
                          multiple
                          className="flex-1"
                        />
                        <ImageUploader
                          label="Upload Videos"
                          onFilesChange={(files) => {
                            if (files) {
                              // Convert FileList to array of URLs
                              const urls = Array.from(files).map(file => URL.createObjectURL(file));
                              setValue(`clothes.${index}.videoUrls`, urls, { shouldDirty: true });
                            }
                          }}
                          initialUrls={watch(`clothes.${index}.videoUrls`) || []}
                          existingImageUrls={watch(`clothes.${index}.videoUrls`) || []}
                          multiple
                          accept="video/*"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    {/* Right column for measurements */}
                    <div className="flex flex-col">
                      <Card className="border-2 border-dashed border-gray-300 p-4 flex-1">
                        <CardHeader className="px-0 py-2">
                          <CardTitle className="text-md">Measurements for Item {index + 1} (Optional)</CardTitle>
                        </CardHeader>
                        <CardContent className="px-0">
                          <MeasurementInputs
                            index={index}
                            register={register}
                            watch={watch}
                            setValue={setValue}
                            errors={errors}
                            initialMeasurements={
                              watch(`clothes.${index}.measurements`)?.[0] || {}
                            }
                          />
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Buttons for Add and Remove Item */}
            <div className="flex justify-between space-x-4">
              <Button
                type="button"
                onClick={appendClothingItem}
                className="flex-1"
              >
                Add Another Clothing Item
              </Button>
              {fields.length > 0 && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleRemoveOrResetClothingItem}
                  className="flex-1"
                >
                  {fields.length === 1 ? "Reset Clothing Item" : "Remove Last Clothing Item"}
                </Button>
              )}
            </div>

            {/* Costs */}
            <Card className="mb-4 p-4 border rounded-lg">
              <CardHeader className="px-0 py-2">
                <CardTitle className="text-lg">Costs</CardTitle>
              </CardHeader>
              <CardContent className="px-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Material Cost"
                    type="number"
                    {...register('costs.0.materialCost', { valueAsNumber: true })}
                    placeholder="0.00"
                    onChange={(e) => handleCostChange('materialCost', parseFloat(e.target.value) || 0)}
                    value={costs[0]?.materialCost ?? ''}
                    error={(errors.costs?.[0]?.materialCost as any)?.message || errors.costs?.[0]?.materialCost}
                  />
                  <Input
                    label="Labor Cost"
                    type="number"
                    {...register('costs.0.laborCost', { valueAsNumber: true })}
                    placeholder="0.00"
                    onChange={(e) => handleCostChange('laborCost', parseFloat(e.target.value) || 0)}
                    value={costs[0]?.laborCost ?? ''}
                    error={(errors.costs?.[0]?.laborCost as any)?.message || errors.costs?.[0]?.laborCost}
                  />
                  <Input
                    label="Total Cost"
                    type="number"
                    {...register('costs.0.totalCost', { valueAsNumber: true })}
                    placeholder="0.00"
                    readOnly
                    value={costs[0]?.totalCost ?? ''}
                    error={(errors.costs?.[0]?.totalCost as any)?.message || errors.costs?.[0]?.totalCost}
                  />
                </div>
              </CardContent>
            </Card>

            <Button
              type="submit"
              variant="blueGradient"
              className="w-full"
              onClick={() => {
                console.log('=== Submit button clicked ===');
                console.log('Form errors:', errors);
                console.log('Is form valid:', Object.keys(errors).length === 0);
              }}
            >
              {submitButtonText}
            </Button>

            {/* Debug button for shopId */}
            {/* <Button 
              type="button" 
              variant="outline" 
              className="w-full mt-2"
              onClick={() => {
                const currentData = watch();
                console.log('=== DEBUG: ShopId State ===');
                console.log('Current shopId:', currentData.shopId);
                console.log('Loading shopId:', loadingShopId);
                console.log('ShopId error:', shopIdError);
                console.log('Is form initialized:', isFormInitialized);
                console.log('Navigation state:', location.state);
                console.log('URL params:', new URLSearchParams(location.search).toString());
              }}
            >
              Debug: ShopId State
            </Button> */}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewOrderForm;