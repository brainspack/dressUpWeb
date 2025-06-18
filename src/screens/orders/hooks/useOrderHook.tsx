import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { baseApi } from '../../../api/baseApi';
import { formSchema, OrderFormData } from '../schemas/orderSchemas';
import { useOrderStore } from '../../../store/useOrderStore';

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

  // Add debug logging for initial data
  console.log('useOrderHook - Initial Props:', {
    propInitialData,
    locationState: location.state,
    params
  });

  // Determine if we're in edit mode and get the order data
  const isEditMode = Boolean(params.id);
  
  // Log the navigation state and edit mode status
  console.log('useOrderHook - Edit Mode Check:', {
    isEditMode,
    orderId: params.id,
    navigationState,
    hasOrderData: Boolean(navigationState?.order)
  });

  // Function to fetch order data from API
  const fetchOrderData = useCallback(async (id: string) => {
    setIsLoadingOrder(true);
    setFormError(null);
    try {
      const response = await baseApi(`/orders/${id}`, { method: 'GET' });
      console.log('Fetched order data from API:', response);
      
      if (!response) {
        throw new Error('No order data received from server');
      }

      // Transform the API response to match our form structure
      const orderData: OrderFormData = {
        customerId: response.customerId,
        shopId: response.shopId,
        tailorName: response.tailorName || '',
        tailorNumber: response.tailorNumber || '',
        tailorId: response.tailorId || '',
        status: response.status,
        orderDate: response.orderDate ? new Date(response.orderDate).toISOString().split('T')[0] : new Date(response.createdAt).toISOString().split('T')[0],
        deliveryDate: response.deliveryDate ? new Date(response.deliveryDate).toISOString().split('T')[0] : null,
        clothes: (response.clothes || []).map((item: any) => {
          // Use measurements that are nested within this clothing item
          const itemMeasurements = item.measurements || [];
          
          console.log(`Processing clothing item "${item.type}":`, {
            itemId: item.id,
            measurementsCount: itemMeasurements.length,
            measurements: itemMeasurements
          });
          
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
          } : {
            height: null,
            chest: null,
            waist: null,
            hip: null,
            shoulder: null,
            sleeveLength: null,
            inseam: null,
            neck: null,
          };

          return {
            type: item.type || '',
            color: item.color || '',
            fabric: item.fabric || '',
            designNotes: item.designNotes || '',
            imageUrls: item.imageUrls || [],
            videoUrls: item.videoUrls || [],
            measurements: [measurement]
          };
        }),
        costs: (response.costs || []).map((cost: any) => ({
          materialCost: cost.materialCost || 0,
          laborCost: cost.laborCost || 0,
          totalCost: cost.totalCost || 0
        }))
      };

      console.log('Transformed order data for form:', orderData);
      console.log('Final clothes structure with measurements:', orderData.clothes.map((item, index) => ({
        index,
        type: item.type,
        measurements: item.measurements
      })));
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
    console.log('useOrderHook - Combining initial data sources:', {
      propInitialData,
      navigationStateOrder: navigationState?.order,
      isEditMode
    });

    // If we have prop initialData, use it
    if (propInitialData) {
      console.log('Using prop initialData:', propInitialData);
      return propInitialData;
    }

    // If we're in edit mode, we'll fetch from API instead of using navigation state
    if (isEditMode) {
      console.log('In edit mode - will fetch from API');
      return undefined; // We'll fetch this from API
    }

    // If in edit mode (order data from navigation state), use that (fallback)
    if (navigationState?.order) {
      console.log('Using navigationState.order for form:', navigationState.order);
      console.log('Measurements in navigationState:', navigationState.order.clothes?.map(c => c.measurements));
      setIsFormInitialized(true);
      return navigationState.order;
    }

    // For new orders, return undefined to use default values
    console.log('No initial data available, will use default values');
    return undefined;
  }, [propInitialData, navigationState, isEditMode]);

  // Log the final initialData that will be used
  console.log('useOrderHook - Final initialData for form:', initialData);

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
      console.log('Form initialization - Using initialData:', initialData);
      
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
        
        console.log('Structured form data with measurements:', formData);
        setIsFormInitialized(true);
        return formData;
      }

      // If in edit mode (order data from navigation state), use that
      if (navigationState?.order) {
        console.log('Using navigationState.order for form:', navigationState.order);
        console.log('Measurements in navigationState:', navigationState.order.clothes?.map(c => c.measurements));
        setIsFormInitialized(true);
        return navigationState.order;
      }

      // For new order, try to get customerId and shopId from navigationState or URL params
      const customerId = navigationState?.customerId || new URLSearchParams(location.search).get('customerId') || '';
      const shopId = navigationState?.shopId || new URLSearchParams(location.search).get('shopId') || '';

      if (!customerId || !shopId) {
        console.error('Missing required customer or shop information');
        setFormError('Missing required customer or shop information for new order.');
        return undefined; // Prevent form from initializing without critical data
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

      console.log('Using default form data:', formData);
      setIsFormInitialized(true);
      return formData;
    }, [initialData, navigationState, location.search, isFormInitialized]),
  });

  // Effect to fetch order data from API when in edit mode
  useEffect(() => {
    if (isEditMode && orderId && !isFormInitialized) {
      console.log('Fetching order data from API for edit mode');
      fetchOrderData(orderId)
        .then((orderData) => {
          console.log('Successfully fetched order data:', orderData);
          // Reset form with fetched data
          reset(orderData);
          setIsFormInitialized(true);
        })
        .catch((error) => {
          console.error('Failed to fetch order data:', error);
          // Error is already set in fetchOrderData
        });
    }
  }, [isEditMode, orderId, isFormInitialized, fetchOrderData, reset]);

  // Add specific effect to handle measurements initialization
  useEffect(() => {
    if (initialData?.clothes) {
      console.log('Setting measurements from initialData:', initialData.clothes);
      
      initialData.clothes.forEach((item, clothesIndex) => {
        if (item.measurements) {
          item.measurements.forEach((measurement, measurementIndex) => {
            // Set each measurement field individually
            Object.entries(measurement).forEach(([field, value]) => {
              if (value !== null && value !== undefined) {
                console.log(`Setting measurement clothes[${clothesIndex}].measurements[${measurementIndex}].${field} to:`, value);
                setValue(
                  `clothes.${clothesIndex}.measurements.${measurementIndex}.${field}` as any,
                  value,
                  { shouldValidate: true }
                );
              }
            });
          });
        }
      });
    }
  }, [initialData, setValue]);

  // Add effect to monitor measurement changes
  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      if (name?.startsWith('clothes.') && name.includes('measurements')) {
        const clothesIndex = parseInt(name.split('.')[1]);
        const measurementIndex = parseInt(name.split('.')[3]);
        const measurementField = name.split('.')[4];
        
        console.log('Measurement updated:', {
          clothesIndex,
          measurementIndex,
          measurementField,
          newValue: (value.clothes?.[clothesIndex]?.measurements?.[measurementIndex] as any)?.[measurementField],
          allMeasurements: value.clothes?.[clothesIndex]?.measurements
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [watch]);

  // Add effect to log current measurements state
  useEffect(() => {
    const currentClothes = watch('clothes');
    console.log('Current measurements state:', currentClothes?.map(item => ({
      type: item.type,
      measurements: item.measurements,
      measurementsLength: item.measurements?.length,
      firstMeasurement: item.measurements?.[0]
    })));
  }, [watch('clothes')]);

  // Add effect to handle form initialization errors
  useEffect(() => {
    if (formError) {
      console.error('Form initialization error:', formError);
      onBack?.();
    }
  }, [formError, onBack]);

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
    console.log('fetchShopId called, current shopId:', currentShopId);
    
    // Only fetch shop ID if not already set
    if (!currentShopId || currentShopId === '') {
      console.log('ShopId not set, fetching from API...');
      setLoadingShopId(true);
      setShopIdError(null);
      try {
        const response = await baseApi('/shops/my-shops', { method: 'GET' });
        console.log('Shops API response:', response);
        
        if (Array.isArray(response) && response.length > 0) {
          const fetchedShopId = response[0].id;
          console.log('Setting shopId to:', fetchedShopId);
          setValue('shopId', fetchedShopId);
        } else {
          console.log('No shops found in response');
          setShopIdError('No shop found for current user.');
        }
      } catch (err: any) {
        console.error('Error fetching shop ID:', err);
        setShopIdError(err.message || 'Failed to fetch shop ID');
      } finally {
        setLoadingShopId(false);
      }
    } else {
      console.log('ShopId already set, skipping fetch:', currentShopId);
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
      const response = await baseApi(`/tailors?shopId=${currentShopId}`, {
        method: 'GET'
      });

      if (Array.isArray(response)) {
        const tailorOptions: TailorOption[] = response.map((tailor: any) => ({
          label: tailor.name,
          value: tailor.id,
          mobileNumber: tailor.mobileNumber,
          shopId: currentShopId,
        }));
        setTailors(tailorOptions);
        hasFetchedTailors.current = true;
        console.log('Tailors fetched successfully:', tailorOptions);
      } else {
        throw new Error('Invalid response format for tailors');
      }
    } catch (err: any) {
      setTailorsError(err.message || 'Failed to fetch tailors');
    } finally {
      setLoadingTailors(false);
    }
  }, [currentShopId]);

  // Fetch tailors only once when shopId is available
  useEffect(() => {
    if (currentShopId && !hasFetchedTailors.current) {
      fetchTailors();
    }
  }, [currentShopId, fetchTailors]);

  // Fetch shop ID only once on component mount
  useEffect(() => {
    console.log('fetchShopId effect triggered');
    console.log('isFormInitialized:', isFormInitialized);
    console.log('current shopId from watch:', watch('shopId'));
    
    // Only fetch if form is initialized and shopId is not set
    if (isFormInitialized) {
      fetchShopId();
    }
  }, [isFormInitialized, fetchShopId]);

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

  // Add effect to set tailor when tailors are loaded and initialData or navigationState is present
  useEffect(() => {
    if (tailors.length > 0) {
      console.log('Tailors loaded, trying to set initial tailor');
      console.log('Available tailors:', tailors);
      console.log('Initial data tailorId:', initialData?.tailorId);
      console.log('Initial data tailorName:', initialData?.tailorName);
      console.log('Navigation state tailorId:', navigationState?.order?.tailorId);
      console.log('Navigation state tailorName:', navigationState?.order?.tailorName);
      console.log('Current form tailorName:', watch('tailorName'));
      console.log('Current form tailorId:', watch('tailorId'));
      
      // First try to find by tailorId
      const tailorToSelectId = initialData?.tailorId || navigationState?.order?.tailorId || watch('tailorId');
      if (tailorToSelectId && tailorToSelectId !== '') {
        const initialTailor = tailors.find(t => t.value === tailorToSelectId);
        if (initialTailor) {
          console.log('Found tailor by ID:', initialTailor);
          setValue('tailorName', initialTailor.label);
          setValue('tailorNumber', initialTailor.mobileNumber || '');
          setValue('tailorId', initialTailor.value);
        }
      } else {
        // If no tailorId, try to find by tailorName
        const tailorName = initialData?.tailorName || navigationState?.order?.tailorName || watch('tailorName');
        if (tailorName && tailorName !== '') {
          console.log('Looking for tailor by name:', tailorName);
          const initialTailor = tailors.find(t => t.label === tailorName);
          if (initialTailor) {
            console.log('Found tailor by name:', initialTailor);
            setValue('tailorName', initialTailor.label);
            setValue('tailorNumber', initialTailor.mobileNumber || '');
            setValue('tailorId', initialTailor.value);
          } else {
            console.log('No tailor found with name:', tailorName);
            console.log('Available tailor names:', tailors.map(t => t.label));
          }
        } else {
          console.log('No tailor name or ID found to pre-select');
        }
      }
    }
  }, [tailors, initialData, navigationState, setValue, watch]);

  // Additional effect to ensure tailor is selected when form is reset with data
  useEffect(() => {
    if (isFormInitialized && tailors.length > 0) {
      const currentTailorName = watch('tailorName');
      const currentTailorId = watch('tailorId');
      
      if (currentTailorName && !currentTailorId) {
        console.log('Form initialized but tailorId missing, trying to find by name:', currentTailorName);
        const tailor = tailors.find(t => t.label === currentTailorName);
        if (tailor) {
          console.log('Found and setting tailor by name:', tailor);
          setValue('tailorId', tailor.value);
        }
      }
    }
  }, [isFormInitialized, tailors, watch, setValue]);

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
        }]
      });
      console.log('Reset clothing item values (only 1 item)');
    } else {
      // If 2 or more items, remove the last one
      remove(currentFields.length - 1);
      console.log('Removed last clothing item');
    }
  };

  const onSubmit = async (data: OrderFormData) => {
    console.log('=== onSubmit function called ===');
    console.log('Form data received:', data);
    console.log('Form errors:', errors);
    
    try {
      console.log('Submitting form data:', data);
      console.log('Measurements in form data:', data.clothes.map(c => c.measurements));
      console.log('Is edit mode:', !!orderId);

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
        clothes: data.clothes.map(cloth => {
          const { measurements, ...clothData } = cloth;
          return clothData;
        }),
        measurements: data.clothes
          .flatMap(cloth => {
            const measurementValues = cloth.measurements?.[0];
            console.log('Processing measurements for cloth:', cloth.type, measurementValues);
            
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
            };

            console.log('Formatted measurement for', cloth.type, ':', formattedMeasurement);
            // Always return the measurement, even if all values are null
            return [formattedMeasurement];
          }),
        costs: data.costs.map(cost => ({
          materialCost: cost.materialCost ?? 0,
          laborCost: cost.laborCost ?? 0,
          totalCost: cost.totalCost ?? 0,
        })),
        orderDate: validateAndFormatDate(data.orderDate) || new Date().toISOString(),
        deliveryDate: validateAndFormatDate(data.deliveryDate),
      };

      console.log('Final measurements array:', orderData.measurements);
      console.log('Sending order data:', JSON.stringify(orderData, null, 2));

      let response;
      if (orderId) {
        console.log('Updating existing order:', orderId);
        response = await baseApi(`/orders/${orderId}`, {
          method: 'PATCH',
          data: orderData,
        });
        console.log('response:', response)
      } else {
        console.log('Creating new order');
        response = await baseApi('/orders', {
          method: 'POST',
          data: orderData,
        });
   
      }

      if (!response) {
        throw new Error('No response received from server');
      }

      console.log('Order saved successfully:', response);
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
