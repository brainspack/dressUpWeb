import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { useTailorStore } from '../../../store/useTailorStore';

const tailorFormSchema = z.object({
  name: z.string().min(1, 'Tailor name is required'),
  mobileNumber: z.string()
    .regex(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
});

type TailorFormData = z.infer<typeof tailorFormSchema>;

interface TailorData {
  id: string;
  name: string;
  mobileNumber: string;
  shopId: string;
}

interface NewTailorFormProps {
  onFormSubmitSuccess: () => void;
  shopId: string | null;
  tailorToEdit?: TailorData | null;
  onCancel: () => void;
}

const NewTailorForm: React.FC<NewTailorFormProps> = ({
  onFormSubmitSuccess,
  shopId,
  tailorToEdit,
  onCancel,
}) => {
  const { addTailor, updateTailor, loading, error } = useTailorStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<TailorFormData>({
    resolver: zodResolver(tailorFormSchema),
    defaultValues: { name: '', mobileNumber: '' },
  });

  useEffect(() => {
    if (tailorToEdit) {
      setValue('name', tailorToEdit.name);
      setValue('mobileNumber', tailorToEdit.mobileNumber);
    } else {
      reset();
    }
  }, [tailorToEdit, reset, setValue]);

  const onSubmit = async (data: TailorFormData) => {
    if (!shopId) {
      alert('Shop ID is not available. Cannot add tailor.');
      return;
    }

    try {
      const payload = {
        name: data.name,
        mobileNumber: data.mobileNumber,
        shopId,
      };

      if (tailorToEdit) {
        await updateTailor(tailorToEdit.id, payload);
        console.log('Tailor updated successfully via Zustand');
      } else {
        await addTailor(payload);
        console.log('Tailor added successfully via Zustand');
      }

      onFormSubmitSuccess();
      reset();
    } catch (err: any) {
      console.error('Tailor operation failed:', err);
      alert('Error saving tailor: ' + (error || err.message || 'Unknown error'));
    }
  };

  const handleCancel = () => {
    reset();         // Clear form fields
    onCancel();      // Close modal
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {loading && <p className="text-blue-500">Saving tailor...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right">Tailor Name</Label>
        <Input id="name" {...register('name')} className="col-span-3" />
      </div>
      {errors.name && (
        <p className="text-red-500 text-sm col-span-4 text-right">
          {errors.name.message}
        </p>
      )}

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="mobileNumber" className="text-right">Phone Number</Label>
        <Input id="mobileNumber"   maxLength={10} {...register('mobileNumber')} onKeyDown={(e) => {
    if (!/[0-9]/.test(e.key) && e.key !== 'Backspace') {
      e.preventDefault();
    }
  }} className="col-span-3" />
      </div>
      {errors.mobileNumber && (
        <p className="text-red-500 text-sm col-span-4 text-right">
          {errors.mobileNumber.message}
        </p>
      )}

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="blueGradient" onClick={handleCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {tailorToEdit ? 'Update Tailor' : 'Add Tailor'}
        </Button>
      </div>
    </form>
  );
};

export default NewTailorForm;
