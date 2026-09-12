"use client";

import React, { forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================
// 1. FORM FIELDSET (Agrupador visual de secciones de formulario)
// ============================================================
export interface FormFieldsetProps extends React.HTMLAttributes<HTMLFieldSetElement> {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  badge?: string;
  children: React.ReactNode;
}

export function FormFieldset({
  icon: Icon,
  title,
  description,
  badge,
  children,
  className,
  ...props
}: FormFieldsetProps) {
  return (
    <fieldset
      className={cn(
        "p-4 rounded-xl bg-[#0B1220]/80 border border-[#1F2937] space-y-3.5 transition-colors focus-within:border-slate-700",
        className
      )}
      {...props}
    >
      <legend className="px-2 -ml-1 text-xs font-bold text-slate-200 flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-amber-400 shrink-0" />}
        <span className="font-[family-name:var(--font-sora)] tracking-tight">{title}</span>
        {badge && (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            {badge}
          </span>
        )}
      </legend>
      {description && (
        <p className="text-[11px] text-slate-400 -mt-2 mb-2 leading-relaxed">
          {description}
        </p>
      )}
      {children}
    </fieldset>
  );
}

// ============================================================
// 2. FORM SELECT (Select estilizado con chevron e icono opcional)
// ============================================================
export interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  icon?: React.ComponentType<{ className?: string }>;
  helperText?: string;
  error?: string;
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ label, icon: Icon, helperText, error, required, className, children, ...props }, ref) => {
    return (
      <div className="space-y-1.5 text-xs w-full">
        {label && (
          <label className="block text-slate-300 font-semibold tracking-wide">
            {label} {required && <span className="text-amber-400">*</span>}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
              <Icon className="h-4 w-4" />
            </div>
          )}
          <select
            ref={ref}
            required={required}
            className={cn(
              "w-full h-10 bg-[#0E1524] border border-[#1F2937] hover:border-slate-600 focus:border-amber-500 rounded-xl px-3.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all font-medium",
              Icon && "pl-10",
              error && "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20",
              className
            )}
            {...props}
          >
            {children}
          </select>
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-amber-400 pointer-events-none">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
        {helperText && !error && (
          <p className="text-[10px] text-slate-400 font-normal">{helperText}</p>
        )}
        {error && (
          <p className="text-[10px] text-rose-400 font-medium">{error}</p>
        )}
      </div>
    );
  }
);
FormSelect.displayName = "FormSelect";

// ============================================================
// 3. FORM INPUT (Input estilizado con iconos y sufijos)
// ============================================================
export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ComponentType<{ className?: string }>;
  suffix?: string;
  helperText?: string;
  error?: string;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, icon: Icon, suffix, helperText, error, required, className, ...props }, ref) => {
    return (
      <div className="space-y-1.5 text-xs w-full">
        {label && (
          <label className="block text-slate-300 font-semibold tracking-wide">
            {label} {required && <span className="text-amber-400">*</span>}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
              <Icon className="h-4 w-4" />
            </div>
          )}
          <input
            ref={ref}
            required={required}
            className={cn(
              "w-full h-10 bg-[#0E1524] border border-[#1F2937] hover:border-slate-600 focus:border-amber-500 rounded-xl px-3.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all font-medium",
              Icon && "pl-10",
              suffix && "pr-14",
              error && "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20",
              className
            )}
            {...props}
          />
          {suffix && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono font-bold text-slate-400 border border-slate-700 pointer-events-none">
              {suffix}
            </div>
          )}
        </div>
        {helperText && !error && (
          <p className="text-[10px] text-slate-400 font-normal">{helperText}</p>
        )}
        {error && (
          <p className="text-[10px] text-rose-400 font-medium">{error}</p>
        )}
      </div>
    );
  }
);
FormInput.displayName = "FormInput";

// ============================================================
// 4. FORM TEXTAREA (Textarea estilizado)
// ============================================================
export interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ label, helperText, error, required, className, rows = 3, ...props }, ref) => {
    return (
      <div className="space-y-1.5 text-xs w-full">
        {label && (
          <label className="block text-slate-300 font-semibold tracking-wide">
            {label} {required && <span className="text-amber-400">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          required={required}
          rows={rows}
          className={cn(
            "w-full bg-[#0E1524] border border-[#1F2937] hover:border-slate-600 focus:border-amber-500 rounded-xl p-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all font-medium resize-none",
            error && "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20",
            className
          )}
          {...props}
        />
        {helperText && !error && (
          <p className="text-[10px] text-slate-400 font-normal">{helperText}</p>
        )}
        {error && (
          <p className="text-[10px] text-rose-400 font-medium">{error}</p>
        )}
      </div>
    );
  }
);
FormTextarea.displayName = "FormTextarea";
