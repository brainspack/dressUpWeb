import React from 'react';
import {
  UseFormRegister,
  UseFormWatch,
  UseFormSetValue,
  FieldErrors,
  Control,
} from 'react-hook-form';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { OrderFormData } from '../schemas/orderSchemas';

interface MeasurementInputsProps {
  index: number;
  register: UseFormRegister<OrderFormData>;
  watch: UseFormWatch<OrderFormData>;
  setValue: UseFormSetValue<OrderFormData>;
  errors?: FieldErrors<OrderFormData>;
  control?: Control<OrderFormData>;
  initialMeasurements?: Record<string, number | null>;
}

const measurementFields = [
  { name: 'height', label: 'Height (inch)' },
  { name: 'chest', label: 'Chest / Bust (inch)' },
  { name: 'waist', label: 'Waist (inch)' },
  { name: 'hip', label: 'Hips (inch)' },
  { name: 'shoulder', label: 'Shoulder Width (inch)' },
  { name: 'neck', label: 'Neck (inch)' },
  { name: 'sleeveLength', label: 'Sleeve Length (inch)' },
  { name: 'armhole', label: 'Armhole (inch)' },
  { name: 'bicep', label: 'Bicep (inch)' },
  { name: 'wrist', label: 'Wrist (inch)' },
  { name: 'inseam', label: 'Inseam (inch)' },
  { name: 'outseam', label: 'Outseam (inch)' },
  { name: 'thigh', label: 'Thigh (inch)' },
  { name: 'knee', label: 'Knee (inch)' },
  { name: 'calf', label: 'Calf (inch)' },
  { name: 'ankle', label: 'Ankle (inch)' },
] as const;

const MeasurementInputs: React.FC<MeasurementInputsProps> = ({
  index,
  register,
  watch,
  setValue,
  errors,
  initialMeasurements,
}) => {
  // Get measurements array for this clothing item
  const measurements = watch(`clothes.${index}.measurements`);


  

  // Set measurements from initialMeasurements only once on mount
  React.useEffect(() => {
    if (initialMeasurements) {
      // Ensure measurements array exists and has at least one object
      if (!measurements || measurements.length === 0) {
      
        setValue(`clothes.${index}.measurements`, [{
          height: 0,
          chest: 0,
          waist: 0,
          hip: 0,
          shoulder: 0,
          sleeveLength: 0,
          inseam: 0,
          neck: 0,
          armhole: 0,
          bicep: 0,
          wrist: 0,
          outseam: 0,
          thigh: 0,
          knee: 0,
          calf: 0,
          ankle: 0,
        }]);
      }

      // Set values for the first measurement object, defaulting to 0 if null/undefined
      Object.entries(initialMeasurements).forEach(([key, value]) => {
        setValue(`clothes.${index}.measurements.0.${key}` as any, value ?? 0);
      });
    }
  }, [initialMeasurements, index, setValue, measurements]);

  

  const leftFields = measurementFields.slice(0, 8);
  const rightFields = measurementFields.slice(8);

  return (
    <div className="p-4 border rounded bg-white h-full flex flex-col min-h-[400px]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left column */}
        <div>
          {leftFields.map((field) => {
            const fieldName = `clothes.${index}.measurements.0.${field.name}` as const;
            const error = errors?.clothes?.[index]?.measurements?.[0]?.[field.name];
            return (
              <div key={field.name} className="mb-2">
                <Label
                  htmlFor={fieldName}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {field.label}
                </Label>
                <Input
                  id={fieldName}
                  type="number"
                  {...register(fieldName, {
                    setValueAs: (v) => (v === '' ? null : Number(v)),
                  })}
                  className={`w-full ${error ? 'border-red-500' : ''}`}
                  value={
                    (() => {
                      const v = measurements?.[0]?.[field.name] !== undefined && measurements?.[0]?.[field.name] !== null && measurements?.[0]?.[field.name] !== 0
                        ? measurements?.[0]?.[field.name]
                        : initialMeasurements?.[field.name] !== undefined && initialMeasurements?.[field.name] !== null && initialMeasurements?.[field.name] !== 0
                          ? initialMeasurements?.[field.name]
                          : '';
                      return v === null || v === undefined ? '' : v;
                    })()
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    setValue(fieldName, val === '' ? null : Number(val));
                  }}
                  placeholder="Enter value"
                />
                {error && (
                  <p className="text-red-500 text-xs mt-1">{error.message}</p>
                )}
              </div>
            );
          })}
        </div>
        {/* Right column */}
        <div>
          {rightFields.map((field) => {
            const fieldName = `clothes.${index}.measurements.0.${field.name}` as const;
            const error = errors?.clothes?.[index]?.measurements?.[0]?.[field.name];
            return (
              <div key={field.name} className="mb-2">
                <Label
                  htmlFor={fieldName}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {field.label}
                </Label>
                <Input
                  id={fieldName}
                  type="number"
                  {...register(fieldName, {
                    setValueAs: (v) => (v === '' ? null : Number(v)),
                  })}
                  className={`w-full ${error ? 'border-red-500' : ''}`}
                  value={
                    (() => {
                      const v = measurements?.[0]?.[field.name] !== undefined && measurements?.[0]?.[field.name] !== null && measurements?.[0]?.[field.name] !== 0
                        ? measurements?.[0]?.[field.name]
                        : initialMeasurements?.[field.name] !== undefined && initialMeasurements?.[field.name] !== null && initialMeasurements?.[field.name] !== 0
                          ? initialMeasurements?.[field.name]
                          : '';
                      return v === null || v === undefined ? '' : v;
                    })()
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    setValue(fieldName, val === '' ? null : Number(val));
                  }}
                  placeholder="Enter value"
                />
                {error && (
                  <p className="text-red-500 text-xs mt-1">{error.message}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MeasurementInputs;
