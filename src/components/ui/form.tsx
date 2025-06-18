import * as React from "react";
import {
  useFormContext,
  Controller,
  FormProvider,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { Label } from "../../components/ui/label";
import { cn } from "../../lib/utils"; // uses clsx + tailwind-merge version

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
}

function Form({ className, ...props }: FormProps) {
  const methods = useFormContext();

  return (
    <FormProvider {...methods}>
      <form className={cn(className)} {...props} />
    </FormProvider>
  );
}

interface FormFieldProps<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>
  extends ControllerProps<TFieldValues, TName> {}

function FormField<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>({
  ...props
}: FormFieldProps<TFieldValues, TName>) {
  return <Controller {...props} />;
}

interface FormItemProps extends React.HTMLAttributes<HTMLDivElement> {}

const FormItem = React.forwardRef<HTMLDivElement, FormItemProps>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("space-y-2", className)} {...props} />;
});
FormItem.displayName = "FormItem";

interface FormLabelProps extends React.ComponentPropsWithoutRef<typeof Label> {}
const FormLabel = ({ className, ...props }: FormLabelProps) => {
  return <Label className={cn("text-sm font-medium", className)} {...props} />;
};

interface FormControlProps extends React.HTMLAttributes<HTMLDivElement> {}
const FormControl = React.forwardRef<HTMLDivElement, FormControlProps>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("relative", className)} {...props} />;
});
FormControl.displayName = "FormControl";

interface FormMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const FormMessage = React.forwardRef<HTMLParagraphElement, FormMessageProps>(
  ({ className, ...props }, ref) => {
    return (
      <p ref={ref} className={cn("text-sm text-red-500", className)} {...props} />
    );
  }
);
FormMessage.displayName = "FormMessage";

export {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
};
