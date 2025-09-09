import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { baseApi } from '../../../api/baseApi';
import { formSchema, OrderFormData } from '../schemas/orderSchemas';
import { useOrderStore } from '../../../store/useOrderStore';
import {
  useOrderInitializationEffect,
  useMeasurementsInitializationEffect,
  useMeasurementChangeLoggerEffect,
  useCurrentMeasurementsLoggerEffect,
  useFormErrorNavigationEffect,
  useFetchTailorsEffect,
  useFetchShopIdEffect,
  useSetTailorOnLoadEffect,
  useSetTailorIdIfMissingEffect
} from './orderEffects';

interface TailorOption {
  label: string;
  value: string;
  mobileNumber: string;
  shopId: string;
}

interface UseOrderHookProps {
  onFormSubmitSuccess?: () => void;
  initialData?: Partial<OrderFormData>;
  orderId?: string;
  onBack?: () => void;
}

export const useOrderHook = ({
  onFormSubmitSuccess,
  initialData: propInitialData,
  orderId: propOrderId,
  onBack,
}: UseOrderHookProps) => {
  // Add state for form initialization
  const [isFormInitialized, setIsFormInitialized] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);

  // Add refs to track if we've already fetched data
  const hasFetchedTailors = useRef(false);

  const [loadingShopId, setLoadingShopId] = useState(true);
  const [shopIdError, setShopIdError] = useState<string | null>(null);
  const [tailors, setTailors] = useState<TailorOption[]>([]);
  const [loadingTailors, setLoadingTailors] = useState(false);
  const [tailorsError, setTailorsError] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ id: string }>();
  const { updateOrder } = useOrderStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use orderId from URL params if available, otherwise from props
  const orderId = params.id || propOrderId;

  // Get state from navigation if available
  const navigationState = location.state as { order?: OrderFormData; customerId?: string; shopId?: string } | null;

  
  // Determine if we're in edit mode and get the order data
  const isEditMode = Boolean(params.id);
  
  

  // Function to fetch order data from API
  const fetchOrderData = useCallback(async (id: string) => {
    setIsLoadingOrder(true);
    setFormError(null);
    try {
      const response = await baseApi(`/orders/${id}`, { method: 'GET' });
      console.log('Order API response:', response);
    
      
      if (!response) {
        throw new Error('No order data received from server');
      }

      // Transform the API response to match our form structure
      const toDateInputValue = (dateString: string | null | undefined) => {
        if (!dateString) return '';
        const d = new Date(dateString);
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      };
      const orderData: OrderFormData = {
        customerId: response.customerId,
        shopId: response.shopId,
        tailorName: response.tailorName || '',
        tailorNumber: response.tailorNumber || '',
        tailorId: response.tailorId || '',
        status: response.status,
        orderDate: toDateInputValue(response.orderDate) || toDateInputValue(response.createdAt),
        deliveryDate: toDateInputValue(response.deliveryDate) || '',
        orderType: response.orderType || 'STITCHING',
        alterationPrice: response.alterationPrice || undefined,
        clothes: (response.clothes || []).map((item: any) => {
          // Use measurements that are nested within this clothing item
          const itemMeasurements = item.measurements || [];
          
        
          // Create a single measurement object for the form
          const measurement = itemMeasurements.length > 0 ? {
            height: itemMeasurements[0]?.height ?? null,
            chest: itemMeasurements[0]?.chest ?? null,
            waist: itemMeasurements[0]?.waist ?? null,
            hip: itemMeasurements[0]?.hip ?? null,
            shoulder: itemMeasurements[0]?.shoulder ?? null,
            sleeveLength: itemMeasurements[0]?.sleeveLength ?? null,
            inseam: itemMeasurements[0]?.inseam ?? null,
            neck: itemMeasurements[0]?.neck ?? null,
            armhole: itemMeasurements[0]?.armhole ?? null,
            bicep: itemMeasurements[0]?.bicep ?? null,
            wrist: itemMeasurements[0]?.wrist ?? null,
            outseam: itemMeasurements[0]?.outseam ?? null,
            thigh: itemMeasurements[0]?.thigh ?? null,
            knee: itemMeasurements[0]?.knee ?? null,
            calf: itemMeasurements[0]?.calf ?? null,
            ankle: itemMeasurements[0]?.ankle ?? null,
          } : {
            height: null,
            chest: null,
            waist: null,
            hip: null,
            shoulder: null,
            sleeveLength: null,
            inseam: null,
            neck: null,
            armhole: null,
            bicep: null,
            wrist: null,
            outseam: null,
            thigh: null,
            knee: null,
            calf: null,
            ankle: null,
          };

          return {
            type: item.type || '',
            designNotes: item.designNotes || '',
            imageUrls: item.imageUrls || [],
            videoUrls: item.videoUrls || [],
            measurements: [measurement]
          };
        })
      };

      return orderData;
    } catch (err: any) {
      console.error('Error fetching order data:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch order data';
      setFormError(errorMessage);
      throw err;
    } finally {
      setIsLoadingOrder(false);
    }
  }, []);

  // Combine initial data sources
  const initialData = useMemo(() => {
    // If we have prop initialData, use it
    if (propInitialData) {
      return propInitialData;
    }

    // If we're in edit mode, we'll fetch from API instead of using navigation state
    if (isEditMode) {
      return undefined; // We'll fetch this from API
    }

    // If in edit mode (order data from navigation state), use that (fallback)
    if (navigationState?.order) {
      return navigationState.order;
    }
   
    return undefined;
  }, [propInitialData, navigationState, isEditMode]);

  
  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<OrderFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: useMemo(() => {
      if (initialData) {
        // Ensure measurements are properly structured
        const formData = {
          ...initialData,
          clothes: initialData.clothes?.map(item => ({
            ...item,
            measurements: item.measurements?.map(measurement => ({
              height: measurement.height || null,
              chest: measurement.chest || null,
              waist: measurement.waist || null,
              hip: measurement.hip || null,
              shoulder: measurement.shoulder || null,
              sleeveLength: measurement.sleeveLength || null,
              inseam: measurement.inseam || null,
              neck: measurement.neck || null,
            })) || [{
              height: null,
              chest: null,
              waist: null,
              hip: null,
              shoulder: null,
              sleeveLength: null,
              inseam: null,
              neck: null,
            }]
          })) || []
        };
        setIsFormInitialized(true);
        return formData;
      }
      // If in edit mode (order data from navigation state), use that
      if (navigationState?.order) {
        setIsFormInitialized(true);
        return navigationState.order;
      }
      // For new order, try to get customerId and shopId from navigationState or URL params
      const customerId = navigationState?.customerId || new URLSearchParams(location.search).get('customerId') || '';
      const shopId = navigationState?.shopId || new URLSearchParams(location.search).get('shopId') || '';
      if (!customerId || !shopId) {
        console.error('Missing required customer or shop information');
        setFormError('Missing required customer or shop information for new order.');
        setIsFormInitialized(true);
        // Return a minimal formData to avoid crash, but let the UI show the error
        return {
          customerId: '',
          shopId: '',
          tailorName: '',
          tailorNumber: '',
          tailorId: '',
          status: 'PENDING' as const,
          orderDate: new Date().toISOString().split('T')[0],
          deliveryDate: null,
          orderType: 'STITCHING' as const,
          alterationPrice: undefined,
          clothes: [],
        };
      }
      // Default values for a new order
      const formData: OrderFormData = {
        customerId,
        shopId,
        tailorName: '',
        tailorNumber: '',
        tailorId: '',
        status: 'PENDING' as const,
        orderDate: new Date().toISOString().split('T')[0],
        deliveryDate: null,
        orderType: 'STITCHING' as const,
        alterationPrice: undefined,
        clothes: [{
          type: '',
          color: '',
          fabric: '',
          designNotes: '',
          imageUrls: [],
          videoUrls: [],
          measurements: [{
            height: null,
            chest: null,
            waist: null,
            hip: null,
            shoulder: null,
            sleeveLength: null,
            inseam: null,
            neck: null,
          }]
        }],
        costs: [{ materialCost: 0, laborCost: 0, totalCost: 0 }],
      };
      setIsFormInitialized(true);
      return formData;
    }, [initialData, navigationState, location.search, isFormInitialized]),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'clothes',
  });

  const shopId = watch('shopId');

  // Memoize the shopId value
  const currentShopId = useMemo(() => watch('shopId'), [watch('shopId')]);

  // Memoize the fetchShopId function
  const fetchShopId = useCallback(async () => {
    const currentShopId = watch('shopId');
    
    // Only fetch shop ID if not already set
    if (!currentShopId || currentShopId === '') {
      setLoadingShopId(true);
      setShopIdError(null);
      try {
        const response = await baseApi('/shops/my-shops', { method: 'GET' });
        
        if (Array.isArray(response) && response.length > 0) {
          const fetchedShopId = response[0].id;
          setValue('shopId', fetchedShopId);
        } else {
          setShopIdError('No shop found for current user.');
        }
      } catch (err: any) {
        console.error('Error fetching shop ID:', err);
        setShopIdError(err.message || 'Failed to fetch shop ID');
      } finally {
        setLoadingShopId(false);
      }
    } else {
      setLoadingShopId(false);
    }
  }, [setValue, watch]);

  // Memoize the fetchTailors function
  const fetchTailors = useCallback(async () => {
    if (!currentShopId || hasFetchedTailors.current) {
      return;
    }

    setLoadingTailors(true);
    setTailorsError(null);
    try {
      const response = await baseApi(`/tailors/by-shop/${currentShopId}`, {
        method: 'GET'
      });

      if (Array.isArray(response)) {
        const tailorOptions: TailorOption[] = response.map((tailor: any) => ({
          label: tailor.name,
          value: tailor.id,
          mobileNumber: tailor.mobileNumber,
          shopId: tailor.shopId,
        }));
        setTailors(tailorOptions);
        hasFetchedTailors.current = true;
      } else {
        throw new Error('Invalid response format for tailors');
      }
    } catch (err: any) {
      setTailorsError(err.message || 'Failed to fetch tailors');
    } finally {
      setLoadingTailors(false);
    }
  }, [currentShopId]);

  useEffect(() => {
    hasFetchedTailors.current = false;
    fetchTailors();
  }, [currentShopId, fetchTailors]);

  // Now call the effect helpers after all dependencies are defined:
  useOrderInitializationEffect(isEditMode, orderId, isFormInitialized, fetchOrderData, reset, setIsFormInitialized);
  useMeasurementsInitializationEffect(initialData, setValue);
  useMeasurementChangeLoggerEffect(watch);
  useCurrentMeasurementsLoggerEffect(watch);
  useFormErrorNavigationEffect(formError, onBack);
  useFetchTailorsEffect(currentShopId, hasFetchedTailors, fetchTailors);
  useFetchShopIdEffect(isFormInitialized, fetchShopId, watch);
  useSetTailorOnLoadEffect(tailors, initialData, navigationState, setValue, watch);
  useSetTailorIdIfMissingEffect(isFormInitialized, tailors, watch, setValue);

  const costs = watch('costs') || [{ materialCost: 0, laborCost: 0, totalCost: 0 }];

  const handleCostChange = (field: 'materialCost' | 'laborCost', value: number) => {
    const material = field === 'materialCost' ? value : (costs[0]?.materialCost ?? 0);
    const labor = field === 'laborCost' ? value : (costs[0]?.laborCost ?? 0);
    setValue('costs', [{ materialCost: material, laborCost: labor, totalCost: material + labor }]);
  };

  const handleTailorSelect = (selectedId: string) => {
    if (selectedId === 'no-selection-placeholder') {
      setValue('tailorName', '');
      setValue('tailorNumber', '');
      setValue('tailorId', '');
    }
    const selectedTailor = tailors.find(tailor => tailor.value === selectedId);
    if (selectedTailor) {
      setValue('tailorName', selectedTailor.label);
      setValue('tailorNumber', selectedTailor.mobileNumber);
      setValue('tailorId', selectedTailor.value);
    }
  };

  const onSubmit = async (data: OrderFormData) => {
    try {
      // Validate and format dates
      const validateAndFormatDate = (dateString: string | null | undefined): string | null => {
        if (!dateString) return null;
        try {
          const date = new Date(dateString);
          if (isNaN(date.getTime())) {
            throw new Error('Invalid date');
          }
          return date.toISOString();
        } catch (error) {
          console.error('Error validating date:', error);
          return null;
        }
      };

      const orderData = {
        ...data,
        orderType: data.orderType || 'STITCHING',
        alterationPrice: data.alterationPrice || undefined,
        clothes: data.clothes.map(cloth => {
          const { measurements, ...clothData } = cloth;
          return clothData;
        }),
        measurements: data.clothes
          .flatMap(cloth => {
            const measurementValues = cloth.measurements?.[0];
            
            // Always create a measurement object, even if measurementValues is undefined
            const formattedMeasurement = {
              height: measurementValues?.height ?? null,
              chest: measurementValues?.chest ?? null,
              waist: measurementValues?.waist ?? null,
              hip: measurementValues?.hip ?? null,
              shoulder: measurementValues?.shoulder ?? null,
              sleeveLength: measurementValues?.sleeveLength ?? null,
              inseam: measurementValues?.inseam ?? null,
              neck: measurementValues?.neck ?? null,
              armhole: measurementValues?.armhole ?? null,
              bicep: measurementValues?.bicep ?? null,
              wrist: measurementValues?.wrist ?? null,
              outseam: measurementValues?.outseam ?? null,
              thigh: measurementValues?.thigh ?? null,
              knee: measurementValues?.knee ?? null,
              calf: measurementValues?.calf ?? null,
              ankle: measurementValues?.ankle ?? null,
            };
         
            // Always return the measurement, even if all values are null
            return [formattedMeasurement];
          }),
        costs: [], // Costs are now handled within clothes (materialCost and price)
        orderDate: validateAndFormatDate(data.orderDate) || new Date().toISOString(),
        deliveryDate: validateAndFormatDate(data.deliveryDate),
      };

      let response;
      if (orderId) {
        response = await baseApi(`/orders/${orderId}`, {
          method: 'PATCH',
          data: orderData,
        });
      } else {
        response = await baseApi('/orders', {
          method: 'POST',
          data: orderData,
        });
      }

      if (!response) {
        throw new Error('No response received from server');
      }
   
      onFormSubmitSuccess?.();
      navigate('/orders');

    } catch (err: any) {
      console.error('useOrderHook: Error saving order:', err);
      console.error('useOrderHook: Error details:', {
        message: err.message,
        stack: err.stack,
        name: err.name,
        response: err.response
      });

      const errorMessage = err.response?.data?.message || err.message || 'Unknown error occurred while saving order';
      // alert(`Error saving order: ${errorMessage}`);
    }
  };

  // Add a function to append clothing items with proper measurement structure
  const appendClothingItem = () => {
    append({
      type: '',
      color: '',
      fabric: '',
      designNotes: '',
      imageUrls: [],
      videoUrls: [],
      measurements: [{
        height: null,
        chest: null,
        waist: null,
        hip: null,
        shoulder: null,
        sleeveLength: null,
        inseam: null,
        neck: null,
      }]
    });
  };

  // Add a function to handle remove/reset logic for clothing items
  const handleRemoveOrResetClothingItem = () => {
    const currentFields = watch('clothes');
    if (currentFields.length === 1) {
      // If only 1 item, reset its values instead of removing
      setValue('clothes.0', {
        type: '',
        color: '',
        fabric: '',
        designNotes: '',
        imageUrls: [],
        videoUrls: [],
        measurements: [{
          height: null,
          chest: null,
          waist: null,
          hip: null,
          shoulder: null,
          sleeveLength: null,
          inseam: null,
          neck: null,
          armhole: null,
          bicep: null,
          wrist: null,
          outseam: null,
          thigh: null,
          knee: null,
          calf: null,
          ankle: null,
        }]
      });
    } else {
      // If 2 or more items, remove the last one
      remove(currentFields.length - 1);
    }
  };

  return {
    // Form state
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    errors,
    isSubmitting,
    isFormInitialized,
    formError,
    isLoadingOrder,
    
    // Field array
    fields,
    append,
    remove,
    appendClothingItem,
    handleRemoveOrResetClothingItem,
    
    // Loading states
    loadingShopId,
    loadingTailors,
    shopIdError,
    tailorsError,
    
    // Data
    tailors,
    costs,
    currentShopId,
    isEditMode,
    orderId,
    
    // Handlers
    handleCostChange,
    handleTailorSelect,
    onSubmit,
    
    // Navigation
    navigate,
  };
};