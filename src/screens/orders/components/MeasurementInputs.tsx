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
  { name: 'height', label: 'Height' },
  { name: 'chest', label: 'Chest / Bust' },
  { name: 'waist', label: 'Waist' },
  { name: 'hip', label: 'Hips' },
  { name: 'shoulder', label: 'Shoulder Width' },
  { name: 'neck', label: 'Neck' },
  { name: 'sleeveLength', label: 'Sleeve Length' },
  { name: 'armhole', label: 'Armhole' },
  { name: 'bicep', label: 'Bicep' },
  { name: 'wrist', label: 'Wrist' },
  { name: 'inseam', label: 'Inseam' },
  { name: 'outseam', label: 'Outseam' },
  { name: 'thigh', label: 'Thigh' },
  { name: 'knee', label: 'Knee' },
  { name: 'calf', label: 'Calf' },
  { name: 'ankle', label: 'Ankle' },
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
                  defaultValue={
                    (measurements?.[0]?.[field.name] ?? initialMeasurements?.[field.name] ?? 0)
                  }
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
                  defaultValue={
                    (measurements?.[0]?.[field.name] ?? initialMeasurements?.[field.name] ?? 0)
                  }
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
