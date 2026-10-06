import { type ComponentProps, useId } from 'react';
import { cn } from './cn';

interface FormFieldProps extends ComponentProps<'input'> {
  label: string;
  error?: string;
  hint?: string;
}

/** Labelled input with accessible error/hint wiring. */
export function FormField({ label, error, hint, className, id, ...props }: FormFieldProps) {
  const generated = useId();
  const inputId = id ?? generated;
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={inputId} className="text-sm font-medium text-ink-soft">
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          'h-12 rounded-xl bg-surface px-4 text-base text-ink ring-1 ring-line transition',
          'placeholder:text-muted/70 focus:ring-2 focus:ring-brand-500 focus:outline-none',
          error && 'ring-danger-600',
        )}
        {...props}
      />
      {error ? (
        <p id={`${inputId}-error`} className="text-sm text-danger-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="text-sm text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
