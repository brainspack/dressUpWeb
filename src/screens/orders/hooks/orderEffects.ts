import { useEffect } from 'react';
import { UseFormWatch, UseFormReset, UseFormSetValue, FieldValues } from 'react-hook-form';
import { OrderFormData } from '../schemas/orderSchemas';

export function useOrderInitializationEffect(
  isEditMode: boolean,
  orderId: string | undefined,
  isFormInitialized: boolean,
  fetchOrderData: (id: string) => Promise<OrderFormData>,
  reset: UseFormReset<OrderFormData>,
  setIsFormInitialized: (val: boolean) => void,
  setValue: UseFormSetValue<OrderFormData>
) {
  useEffect(() => {
    if (isEditMode && orderId && !isFormInitialized) {
      fetchOrderData(orderId)
        .then((orderData) => {
          reset(orderData);
          // Ensure dates are explicitly set in the form after reset
          if (orderData.orderDate) {
            setValue('orderDate', orderData.orderDate, { shouldDirty: false, shouldTouch: false, shouldValidate: false });
          }
          setValue('deliveryDate', (orderData.deliveryDate as any) || '', { shouldDirty: false, shouldTouch: false, shouldValidate: false });
          setIsFormInitialized(true);
        })
        .catch(() => {});
    }
  }, [isEditMode, orderId, isFormInitialized, fetchOrderData, reset, setIsFormInitialized, setValue]);
}

export function useMeasurementsInitializationEffect(
  initialData: Partial<OrderFormData> | undefined,
  setValue: UseFormSetValue<OrderFormData>
) {
  useEffect(() => {
    if (initialData?.clothes) {
      initialData.clothes.forEach((item, clothesIndex) => {
        if (item.measurements) {
          item.measurements.forEach((measurement, measurementIndex) => {
            Object.entries(measurement).forEach(([field, value]) => {
              if (value !== null && value !== undefined) {
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
}

export function useMeasurementChangeLoggerEffect(
  watch: UseFormWatch<OrderFormData>
) {
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name?.startsWith('clothes.') && name.includes('measurements')) {
        // Logging logic can be added here if needed
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);
}

export function useCurrentMeasurementsLoggerEffect(
  watch: UseFormWatch<OrderFormData>
) {
  useEffect(() => {
    const currentClothes = watch('clothes');
    // Logging logic can be added here if needed
  }, [watch('clothes')]);
}

export function useFormErrorNavigationEffect(
  formError: string | null,
  onBack: (() => void) | undefined
) {
  useEffect(() => {
    if (formError) {
      onBack?.();
    }
  }, [formError, onBack]);
}

export function useFetchTailorsEffect(
  currentShopId: string,
  hasFetchedTailors: React.MutableRefObject<boolean>,
  fetchTailors: () => void
) {
  useEffect(() => {
    if (currentShopId && !hasFetchedTailors.current) {
      fetchTailors();
    }
  }, [currentShopId, fetchTailors, hasFetchedTailors]);
}

export function useFetchShopIdEffect(
  isFormInitialized: boolean,
  fetchShopId: () => void,
  watch: UseFormWatch<OrderFormData>
) {
  useEffect(() => {
    if (isFormInitialized) {
      fetchShopId();
    }
  }, [isFormInitialized, fetchShopId, watch]);
}

export function useSetTailorOnLoadEffect(
  tailors: Array<{ label: string; value: string; mobileNumber: string; shopId: string }>,
  initialData: Partial<OrderFormData> | undefined,
  navigationState: any,
  setValue: UseFormSetValue<OrderFormData>,
  watch: UseFormWatch<OrderFormData>
) {
  useEffect(() => {
    if (tailors.length > 0) {
      const tailorToSelectId = initialData?.tailorId || navigationState?.order?.tailorId || watch('tailorId');
      if (tailorToSelectId && tailorToSelectId !== '') {
        const initialTailor = tailors.find(t => t.value === tailorToSelectId);
        if (initialTailor) {
          setValue('tailorName', initialTailor.label);
          setValue('tailorNumber', initialTailor.mobileNumber || '');
          setValue('tailorId', initialTailor.value);
        }
      } else {
        const tailorName = initialData?.tailorName || navigationState?.order?.tailorName || watch('tailorName');
        if (tailorName && tailorName !== '') {
          const initialTailor = tailors.find(t => t.label === tailorName);
          if (initialTailor) {
            setValue('tailorName', initialTailor.label);
            setValue('tailorNumber', initialTailor.mobileNumber || '');
            setValue('tailorId', initialTailor.value);
          }
        }
      }
    }
  }, [tailors, initialData, navigationState, setValue, watch]);
}

export function useSetTailorIdIfMissingEffect(
  isFormInitialized: boolean,
  tailors: Array<{ label: string; value: string; mobileNumber: string; shopId: string }>,
  watch: UseFormWatch<OrderFormData>,
  setValue: UseFormSetValue<OrderFormData>
) {
  useEffect(() => {
    if (isFormInitialized && tailors.length > 0) {
      const currentTailorName = watch('tailorName');
      const currentTailorId = watch('tailorId');
      if (currentTailorName && !currentTailorId) {
        const tailor = tailors.find(t => t.label === currentTailorName);
        if (tailor) {
          setValue('tailorId', tailor.value);
        }
      } else if (!currentTailorName && !currentTailorId) {
        const shopId = watch('shopId');
        const shopTailors = tailors.filter(t => t.shopId === shopId);
        if (shopTailors.length === 1) {
          const onlyTailor = shopTailors[0];
          setValue('tailorName', onlyTailor.label);
          setValue('tailorNumber', onlyTailor.mobileNumber || '');
          setValue('tailorId', onlyTailor.value);
        }
      }
    }
  }, [isFormInitialized, tailors, watch, setValue]);
} 