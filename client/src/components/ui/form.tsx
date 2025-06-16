"use client";

import React, { createContext, useContext, forwardRef, useId } from "react";
import {
  Controller,
  FormProvider,
  useFormContext,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

/**
 * Form context provider, wrap your form in <Form> to supply RHF context
 */
export const Form = FormProvider;

// Field context to pass the name of the controlled field
const FormFieldContext = createContext<
  { name: FieldPath<any> } | null
>(null);

/**
 * Wraps RHF Controller to provide field context
 */
export function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(props: ControllerProps<TFieldValues, TName>) {
  const { name, control, render, ...rest } = props;
  return (
    <FormFieldContext.Provider value={{ name }}>
      <Controller name={name} control={control} render={render} {...rest} />
    </FormFieldContext.Provider>
  );
}

// Item context to generate unique IDs for form item elements
const FormItemContext = createContext<{ id: string } | null>(null);

/**
 * Wraps a form row, generating a unique id for linking label, control, etc.
 */
export const FormItem = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const id = useId();
  return (
    <FormItemContext.Provider value={{ id }}>
      <div ref={ref} className={cn("space-y-2", className)} {...props} />
    </FormItemContext.Provider>
  );
});
FormItem.displayName = "FormItem";

/**
 * Hook to retrieve form field metadata and state
 */
function useFormField() {
  const fieldCtx = useContext(FormFieldContext);
  const itemCtx = useContext(FormItemContext);
  const form = useFormContext();

  if (!fieldCtx) {
    throw new Error("useFormField must be used within a FormField");
  }
  if (!itemCtx) {
    throw new Error("useFormField must be used within a FormItem");
  }

  const { name } = fieldCtx;
  const { getFieldState, formState } = form;
  const fieldState = getFieldState(name as any, formState);

  const { id } = itemCtx;
  const formItemId = `${id}-form-item`;
  const formDescriptionId = `${id}-description`;
  const formMessageId = `${id}-message`;

  return {
    id,
    name,
    formItemId,
    formDescriptionId,
    formMessageId,
    ...fieldState,
  };
}

/**
 * Renders a label tied to the form control
 */
export const FormLabel = forwardRef<
  React.ElementRef<typeof Label>,
  React.ComponentPropsWithoutRef<typeof Label>
>(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField();
  return (
    <Label
      ref={ref}
      htmlFor={formItemId}
      className={cn(error && "text-destructive", className)}
      {...props}
    />
  );
});
FormLabel.displayName = "FormLabel";

/**
 * Wraps a form control, forwarding aria attributes and id
 */
export const FormControl = forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();
  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-invalid={!!error}
      aria-describedby={
        error ? `${formDescriptionId} ${formMessageId}` : formDescriptionId
      }
      {...props}
    />
  );
});
FormControl.displayName = "FormControl";

/**
 * Renders a description for the form control
 */
export const FormDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField();
  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
});
FormDescription.displayName = "FormDescription";

/**
 * Renders field validation messages
 */
export const FormMessage = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField();
  const message = error ? error.message : children;
  if (!message) return null;

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn("text-sm font-medium text-destructive", className)}
      {...props}
    >
      {message}
    </p>
  );
});
FormMessage.displayName = "FormMessage";

export { useFormField };
