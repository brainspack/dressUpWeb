import React, { useState, useEffect } from 'react';
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
import { baseApi } from '../../../api/baseApi';

import '@fortawesome/fontawesome-free/css/all.min.css';
import { sortedFemaleTypeOptions, sortedMaleTypeOptions, femaleTypeLabels, maleTypeLabels } from '../orderTypeOptions';

import { useCustomerStore } from '../../../store/useCustomerStore';
import { useShopStore } from '../../../store/useShopStore';
import ReusableCard from '../../../components/ui/CustomCard';
import Loader from '../../../components/ui/Loader';
import { X } from 'lucide-react';
import Tooltip from '../../../components/ui/tooltip';

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
    appendClothingItem,
    handleRemoveOrResetClothingItem,
    loadingShopId,
    shopIdError,
    tailors,
    costs,
    isEditMode,
    orderId,
    isLoadingOrder,
    isFormInitialized,
    handleCostChange,
    handleTailorSelect,
    onSubmit,
    formError,
  } = useOrderHook({
    onFormSubmitSuccess,
    initialData: propInitialData,
    orderId: propOrderId,
    onBack,
  });

  // Add a title based on whether we're editing or creating
  const formTitle = orderId ? "Edit Order" : "New Order";
  const submitButtonText = orderId ? "Update Order" : "Create Order";

  // Add state for names
  const [customerName, setCustomerName] = useState('');
  const [shopName, setShopName] = useState('');

  // Add gender state for each clothing item
  const [genders, setGenders] = useState<{ [key: number]: 'male' | 'female' }>({});

  // Handle order type change - auto-add cloth for alteration orders
  useEffect(() => {
    const orderType = watch('orderType');
    const currentClothes = watch('clothes') || [];
    
    if (orderType === 'ALTERATION' && currentClothes.length === 0) {
      // Auto-add a cloth item for alteration orders
      appendClothingItem();
      // Set default design notes for alteration
      setValue(`clothes.0.designNotes`, 'For alteration');
    }
  }, [watch('orderType'), watch('clothes'), appendClothingItem, setValue]);

  // Set gender for each item based on type on mount or when fields change
  useEffect(() => {
    setGenders(prev => {
      const newGenders = { ...prev };
      fields.forEach((field, idx) => {
        const typeValue = field.type || '';
        if (typeValue) {
          if (femaleTypeLabels.includes(typeValue)) {
            newGenders[idx] = 'female';
          } else if (maleTypeLabels.includes(typeValue)) {
            newGenders[idx] = 'male';
          } else if (!newGenders[idx]) {
            newGenders[idx] = 'male'; // fallback default
          }
        } else if (!newGenders[idx]) {
          newGenders[idx] = 'male'; // fallback default
        }
      });
      return newGenders;
    });
  }, [fields]);

  // Fetch names when IDs change
  useEffect(() => {
    const customerId = watch('customerId');
    if (customerId) {
      baseApi(`/customers/${customerId}`, { method: 'GET' })
        .then(data => setCustomerName(data?.name || ''))
        .catch(() => setCustomerName(''));
    } else {
      setCustomerName('');
    }
  }, [watch('customerId')]);

  useEffect(() => {
    const shopId = watch('shopId');
    if (shopId) {
      baseApi(`/shops/${shopId}`, { method: 'GET' })
        .then(data => setShopName(data?.name || ''))
        .catch(() => setShopName(''));
    } else {
      setShopName('');
    }
  }, [watch('shopId')]);

  const { customers, fetchCustomers } = useCustomerStore();
  const { shops, fetchShops } = useShopStore();

  useEffect(() => {
    const shopId = watch('shopId');
    if (shopId) {
      fetchCustomers(shopId);
    }
    fetchShops();
  }, [watch('shopId'), fetchCustomers, fetchShops]);

  // Helper to get serial numbers
  const getCustomerSerial = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? `Cus-${(customer.serialNumber || 0) + 999}` : customerId;
  };
  const getShopSerial = (shopId: string) => {
    const shop = shops.find(s => s.id === shopId);
    return shop ? `Shp-${(shop.serialNumber || 0) + 999}` : shopId;
  };

  // Show loading state when fetching order data from API
  if (isEditMode && isLoadingOrder) {
    return (
      <Loader message="Loading order data..." />
    );
  }

  const [imageUploadErrors, setImageUploadErrors] = useState<{ [key: number]: string }>({});
  const [videoUploadErrors, setVideoUploadErrors] = useState<{ [key: number]: string }>({});

  // Show error if formError is set
  if (formError) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-red-500 text-xl font-bold">{formError}</div>
      </div>
    );
  }

  console.log('orderDate in form:', watch('orderDate'));
  console.log('deliveryDate in form:', watch('deliveryDate'));

  return (
    <div className="w-full max-w-[1024px]  px-4 ml-0">

      <div className="mx-1 my-3">
        <Button
          type="button"
          variant="mintGreen"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          ← Back
        </Button>
      </div>
      <ReusableCard>
        <CardContent className="px-6 py-1">
          {/* Back Button */}

          <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6 w-full">
            {/* Add debugging for form submission */}
            <div className="text-xs text-gray-500">
              {/* <p>Form errors: {Object.keys(errors).length > 0 ? JSON.stringify(errors, null, 2) : 'No errors'}</p> */}
            </div>

            {/* Add a visual indicator for edit mode */}
            {isEditMode && (
              <div className="bg-green-100 border-l-4 border-[#55AC8A] p-4 mb-4">
                <div className="flex">
                  <div className='flex-shrink-0'>
                    <svg className='h-5 w-5 text-[#55AC8A]' viewBox='0 0 20 20' fill='currentColor'>
                      <path fillRule='evenodd' d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z' clipRule='evenodd' />
                    </svg>
                  </div>
                  <div className='ml-3'>
                    <p className='text-sm text-[#55AC8A]'>
                      You are editing an existing order. Any changes you make will update the current order.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {onBack && (
              <Button type="button" variant="mintGreen" onClick={onBack} className="mb-4">
                ← Back
              </Button>
            )}

            <div className="text-sm text-gray-600 mb-4 flex flex-wrap gap-6">
              <div>
                <p><strong>Customer:</strong> {getCustomerSerial(watch('customerId'))}</p>
                <p><strong>Customer Name:</strong> {customerName}</p>
              </div>
              <div>
                <p><strong>Shop:</strong> {getShopSerial(watch('shopId'))}</p>
                <p><strong>Shop Name:</strong> {shopName}</p>
              </div>
              {shopIdError && <p className="text-red-500">Error: {shopIdError}</p>}
            </div>

            {/* Top Card for Order fields */}
            <Card className="mb-6">
              <CardContent className="px-6 py-4">
                <div className="space-y-4">
                  {/* Top Row: Order Date, Delivery Date, Order Type */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    {/* Order Date */}
                    <div className="flex flex-col">
                      <label htmlFor="orderDate" className="block text-sm font-medium text-gray-700 mb-1">Order Date</label>
                      <Input
                        id="orderDate"
                        type="date"
                        {...register('orderDate')}
                        error={(errors.orderDate as any)?.message || errors.orderDate}
                        className="w-full h-10"
                        value={watch('orderDate') || ''}
                      />
                    </div>
                    {/* Delivery Date */}
                    <div className="flex flex-col">
                      <label htmlFor="deliveryDate" className="block text-sm font-medium text-gray-700 mb-1">Delivery Date</label>
                      <Input
                        id="deliveryDate"
                        type="date"
                        {...register('deliveryDate')}
                        error={(errors.deliveryDate as any)?.message || errors.deliveryDate}
                        className="w-full h-10"
                        value={watch('deliveryDate') || ''}
                      />
                    </div>
                    {/* Order Type */}
                    <div className="flex flex-col">
                      <label htmlFor="orderType" className="block text-sm font-medium text-gray-700 mb-1">Order Type</label>
                      <SelectField
                        name="orderType"
                        value={watch('orderType') || 'STITCHING'}
                        onValueChange={(value) => setValue('orderType', value as any)}
                        options={[
                          { label: 'Stitching', value: 'STITCHING' },
                          { label: 'Alteration', value: 'ALTERATION' }
                        ]}
                        placeholder="Select order type"
                        className="w-full [&>button]:h-10"
                      />
                    </div>
                  </div>
                  
                  {/* Bottom Row: Tailor Name, Tailor Number, Status */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    {/* Tailor Name */}
                    <div className="flex flex-col">
                      <label htmlFor="tailorName" className="block text-sm font-medium text-gray-700 mb-1">Tailor Name</label>
                      <SelectField
                        name="tailorName"
                        value={watch('tailorId') || ''}
                        onValueChange={handleTailorSelect}
                        options={[
                          { label: 'Select a tailor', value: 'no-selection-placeholder' },
                          ...tailors
                            .filter(tailor => tailor.shopId === watch('shopId'))
                            .map(tailor => ({ label: tailor.label, value: tailor.value }))
                        ]}
                        placeholder="Select a tailor"
                        className="w-full [&>button]:h-10"
                      />
                    </div>
                    {/* Tailor Number */}
                    <div className="flex flex-col">
                      <label htmlFor="tailorNumber" className="block text-sm font-medium text-gray-700 mb-1">Tailor Number</label>
                      <Input
                        id="tailorNumber"
                        {...register('tailorNumber')}
                        readOnly
                        value={watch('tailorNumber')}
                        className="w-full h-10"
                        error={(errors.tailorName as any)?.message || errors.tailorName}
                      />
                    </div>
                    {/* Status */}
                    <div className="flex flex-col">
                      <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
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
                        className="w-full [&>button]:h-10"
                      />
                    </div>
                  </div>
                  
                  {/* Alteration Price - Only show when order type is ALTERATION */}
                  {watch('orderType') === 'ALTERATION' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                      <div className="flex flex-col">
                        <label htmlFor="alterationPrice" className="block text-sm font-medium text-gray-700 mb-1">Alteration Price (₹)</label>
                        <Input
                          id="alterationPrice"
                          type="number"
                          step="0.01"
                          min="0"
                          {...register('alterationPrice', { valueAsNumber: true })}
                          placeholder="Enter alteration price"
                          error={(errors.alterationPrice as any)?.message || errors.alterationPrice}
                          className="w-full h-10"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Clothing Items */}
            {fields.map((field, index) => {

              return (
                <Card key={field.id} className="mb-4 p-4 border rounded-lg">
                  <CardHeader className="px-0 py-4">
                    <CardTitle className="text-lg">Clothing Item {index + 1}</CardTitle>
                  </CardHeader>
                  <CardContent className="px-0">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4 h-full">
                      {/* Left column for clothing details and uploaders */}
                      <div className="space-y-2 flex flex-col justify-between col-span-12 md:col-span-5">

                        {/* Gender selection between Type and Color */}
                        <div className="mb-2">
                          <Label className="block text-xs font-medium text-gray-700 mb-1">Gender</Label>
                          <div className="flex gap-4">

                            <i className={`fa-solid fa-person text-[30px] p-1.5 rounded-md border-2  ${genders[index] === 'male' ? 'bg-[#a67c52] border-[#a67c52] text-white' : 'bg-[#ffffff] border-gray-300 text-[#a67c52]'} `}
                              onClick={() => {
                                if (genders[index] !== 'male') {
                                  setGenders(g => ({ ...g, [index]: 'male' }));
                                  setValue(`clothes.${index}.type`, '');
                                }
                              }}></i>

                            <i className={`fa-solid fa-person-dress text-[30px]  p-1.5 rounded-md border-2 ${genders[index] === 'female' ? 'bg-[#3a2a1a] border-[#3a2a1a] text-white' : 'bg-[#f5f5f5] border-gray-300 text-[#3a2a1a]'}`}
                              onClick={() => {
                                if (genders[index] !== 'female') {
                                  setGenders(g => ({ ...g, [index]: 'female' }));
                                  setValue(`clothes.${index}.type`, '');
                                }
                              }}></i>

                          </div>
                        </div>
                        <SelectField
                          name={`clothes.${index}.type`}
                          value={watch(`clothes.${index}.type`) || ''}
                          onValueChange={val => setValue(`clothes.${index}.type`, val)}
                          options={
                            (genders[index] === 'female' ? sortedFemaleTypeOptions : sortedMaleTypeOptions).filter(opt => !opt.disabled || opt.disabled)
                          }
                          placeholder="Select type"
                          className="w-full"
                        />
                        
                        {/* Color field */}
                        <Input
                          label="Color"
                          {...register(`clothes.${index}.color`)}
                          placeholder="Enter color"
                          error={(errors.clothes?.[index]?.color as any)?.message || errors.clothes?.[index]?.color}
                          className="w-full"
                        />
                        
                        {/* Fabric field */}
                        <Input
                          label="Fabric"
                          {...register(`clothes.${index}.fabric`)}
                          placeholder="Enter fabric type"
                          error={(errors.clothes?.[index]?.fabric as any)?.message || errors.clothes?.[index]?.fabric}
                          className="w-full"
                        />
                        
                        <Textarea
                          label="Design Notes"
                          {...register(`clothes.${index}.designNotes`)}
                          placeholder="Any specific design requests or notes"
                          rows={4}
                          error={(errors.clothes?.[index]?.designNotes as any)?.message || errors.clothes?.[index]?.designNotes}
                        />
                        {/* Uploaders below details */}
                        {/* Previews Section */}
                        {(watch(`clothes.${index}.imageUrls`) || []).length > 0 && (
                          <div className="flex gap-2 mb-2 border-2 border-dashed border-gray-300 rounded-md p-2">
                            {(watch(`clothes.${index}.imageUrls`) || []).map((url, imgIdx) => (
                              <div key={imgIdx} className="relative w-20 h-20">
                                <img src={url} alt={`Preview ${imgIdx + 1}`} className="w-full h-full object-cover rounded" />
                                <X
                                  size={16}
                                  className="absolute top-0 right-0 bg-white bg-opacity-80 rounded-full p-1 text-red-500 hover:bg-opacity-100"
                                  onClick={e => {
                                    e.stopPropagation();
                                    const urls = [...(watch(`clothes.${index}.imageUrls`) || [])];
                                    urls.splice(imgIdx, 1);
                                    setValue(`clothes.${index}.imageUrls`, urls, { shouldDirty: true });
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        {(watch(`clothes.${index}.videoUrls`) || []).length > 0 && (
                          <div className="flex gap-2 mb-2 border-2 border-dashed border-gray-300 rounded-md p-2">
                            {(watch(`clothes.${index}.videoUrls`) || []).map((url, vidIdx) => (
                              <div key={vidIdx} className="relative w-20 h-20">
                                <video src={url} controls className="w-full h-full object-cover rounded" />
                                <X
                                  size={16}
                                  className="absolute top-0 right-0 bg-white bg-opacity-80 rounded-full p-1 text-red-500 hover:bg-opacity-100"
                                  onClick={e => {
                                    e.stopPropagation();
                                    const urls = [...(watch(`clothes.${index}.videoUrls`) || [])];
                                    urls.splice(vidIdx, 1);
                                    setValue(`clothes.${index}.videoUrls`, urls, { shouldDirty: true });
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Uploaders in one row */}
                        <div className="flex gap-3 w-full">
                          <Tooltip text="Add Image">
                            <div className="flex gap-1 w-full">
                              <ImageUploader
                                label="Upload Images"
                                onUploadSuccess={(urls) => {
                                  setValue(`clothes.${index}.imageUrls`, urls, { shouldDirty: true });
                                  setImageUploadErrors(prev => ({ ...prev, [index]: '' }));
                                }}
                                initialUrls={watch(`clothes.${index}.imageUrls`) || []}
                                existingImageUrls={watch(`clothes.${index}.imageUrls`) || []}
                                multiple
                                maxFiles={2}
                                className="w-42"
                                accept=".jpg,.jpeg,.png"
                              />
                              {imageUploadErrors[index] && (
                                <div className="text-red-500 text-xs mt-1">{imageUploadErrors[index]}</div>
                              )}
                            </div>
                          </Tooltip>
                          <Tooltip text="Add Video">
                            <div className="flex gap-1 w-full">
                              <ImageUploader
                                label="Upload Videos"
                                onUploadSuccess={(urls) => {
                                  setValue(`clothes.${index}.videoUrls`, urls, { shouldDirty: true });
                                  setVideoUploadErrors(prev => ({ ...prev, [index]: '' }));
                                }}
                                initialUrls={watch(`clothes.${index}.videoUrls`) || []}
                                existingImageUrls={watch(`clothes.${index}.videoUrls`) || []}
                                multiple
                                maxFiles={2}
                                accept=".mp4,.mov"
                                className="w-42"
                              />
                              {videoUploadErrors[index] && (
                                <div className="text-red-500 text-xs mt-1">{videoUploadErrors[index]}</div>
                              )}
                            </div>
                          </Tooltip>
                        </div>

                      </div>
                      {/* Right column for measurements (now 2 sections inside) */}
                      <div className="flex flex-col col-span-12 md:col-span-7">
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
                              initialMeasurements={watch(`clothes.${index}.measurements`)?.[0] || {}}
                            />
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}

            {/* Buttons for Add and Remove Item */}
            <div className="flex justify-end space-x-1">
              <Button
                type="button"
                onClick={appendClothingItem}
              // className="flex-1"
              >
                Add Item
              </Button>
              {fields.length > 0 && (
                <button
                  type="button"
                  onClick={handleRemoveOrResetClothingItem}
                  className="reset-button px-3 py-3  "
                >
                  {fields.length === 1 ? "Reset Item" : "Remove Item"}
                </button>
              )}
            </div>

            {/* Costs */}
            <Card className="mb-4 p-4 border rounded-lg">
              <CardHeader className="px-0 py-2">
                {/* Quantity line above costs */}
                <div className="mb-2 text-base font-medium">Quantity - {fields.length}</div>
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
                    error={(errors.costs?.[0]?.materialCost as any)?.message || errors.costs?.[0]?.materialCost}
                  />
                  <Input
                    label="Labor Cost"
                    type="number"
                    {...register('costs.0.laborCost', { valueAsNumber: true })}
                    placeholder="0.00"
                    onChange={(e) => handleCostChange('laborCost', parseFloat(e.target.value) || 0)}
                    error={(errors.costs?.[0]?.laborCost as any)?.message || errors.costs?.[0]?.laborCost}
                  />
                  <Input
                    label="Total Cost"
                    type="number"
                    {...register('costs.0.totalCost', { valueAsNumber: true })}
                    placeholder="0.00"
                    readOnly
                    error={(errors.costs?.[0]?.totalCost as any)?.message || errors.costs?.[0]?.totalCost}
                  />
                </div>
              </CardContent>
            </Card>
            <div className="flex justify-end">
              <Button
                type="submit"
                variant="mintGreen"
              >
                {submitButtonText}
              </Button>
            </div>
          </form>
        </CardContent>
      </ReusableCard>
    </div>
  );
};

export default NewOrderForm;