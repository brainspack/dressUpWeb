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
  { name: 'chest', label: 'Chest' },
  { name: 'waist', label: 'Waist' },
  { name: 'hip', label: 'Hip' },
  { name: 'shoulder', label: 'Shoulder' },
  { name: 'sleeveLength', label: 'Sleeve Length' },
  { name: 'inseam', label: 'Inseam' },
  { name: 'neck', label: 'Neck' },
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

  console.log(`MeasurementInputs for index ${index}:`, {
    measurements,
    measurementsLength: measurements?.length,
    firstMeasurement: measurements?.[0],
    initialMeasurements
  });

  // Set measurements from initialMeasurements only once on mount
  React.useEffect(() => {
    if (initialMeasurements) {
      // Ensure measurements array exists and has at least one object
      if (!measurements || measurements.length === 0) {
        console.log(`Initializing measurements array for index ${index}`);
        setValue(`clothes.${index}.measurements`, [{
          height: null,
          chest: null,
          waist: null,
          hip: null,
          shoulder: null,
          sleeveLength: null,
          inseam: null,
          neck: null,
        }]);
      }

      // Set values for the first measurement object
      Object.entries(initialMeasurements).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          console.log(`Setting measurement clothes[${index}].measurements.0.${key} to:`, value);
          setValue(`clothes.${index}.measurements.0.${key}` as any, value);
        }
      });
    }
  }, [initialMeasurements, index, setValue, measurements]);

  console.log("initialMeasurements for index", index, initialMeasurements);
  console.log("Current measurements for index", index, measurements);

  return (
    <div className="p-4 border rounded bg-gray-100 h-full flex flex-col min-h-[400px]">
      {measurementFields.map((field) => {
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
              placeholder={`${field.label} (optional)`}
              className={error ? 'border-red-500' : ''}
              defaultValue={
                measurements?.[0]?.[field.name] ??
                initialMeasurements?.[field.name] ??
                ''
              }
            />
            {error && (
              <p className="text-red-500 text-xs mt-1">{error.message}</p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MeasurementInputs;
