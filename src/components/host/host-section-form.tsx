"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Button from "@/components/general/Button";
import { Input } from "@/components/ui/input";
import type { HostOnboardingStep, HostProfile } from "@/types/host";
import { useUpdateHostProfileMutation } from "@/hooks/use-host-profile";
import { cn } from "@/lib/utils";

type FieldType = "text" | "email" | "tel" | "textarea";

export type HostSectionField = {
  name: keyof HostProfile;
  label: string;
  type?: FieldType;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
};

export type HostSectionConfig = {
  id: string;
  tabLabel?: string;
  apiSection?: string;
  title: string;
  description: string;
  stepKey?: HostOnboardingStep;
  fields: HostSectionField[];
};

type HostSectionFormProps = {
  config: HostSectionConfig;
  profile: HostProfile;
};

type SectionFormValues = Record<string, string>;

export const HostSectionForm = ({ config, profile }: HostSectionFormProps) => {
  const { mutateAsync, isPending } = useUpdateHostProfileMutation();

  const defaultValues = useMemo(() => {
    const values: SectionFormValues = {};
    config.fields.forEach((field) => {
      const rawValue = profile[field.name];
      if (Array.isArray(rawValue)) {
        values[field.name] = rawValue.join(", ");
      } else if (typeof rawValue === "boolean") {
        values[field.name] = rawValue ? "true" : "false";
      } else {
        values[field.name] = rawValue ?? "";
      }
    });
    return values;
  }, [config.fields, profile]);

  const {
    register,
    handleSubmit,
    formState: { isDirty },
    reset,
  } = useForm<SectionFormValues>({
    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const onSubmit = async (values: SectionFormValues) => {
    const normalized = Object.fromEntries(
      Object.entries(values).map(([key, value]) => {
        if (key === "languages") {
          return [
            key,
            value
              .split(",")
              .map((language) => language.trim())
              .filter(Boolean),
          ];
        }
        return [key, value];
      }),
    );

    await mutateAsync({
      section: config.apiSection,
      data: normalized,
    });
    reset(values, { keepDirty: false });
  };

  const isComplete =
    config.stepKey && profile.completedSteps.includes(config.stepKey);

  return (
    <Card id={config.id} className="border-slate-200">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle>{config.title}</CardTitle>
            <p className="text-sm text-slate-500">{config.description}</p>
          </div>
          {config.stepKey && (
            <span
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold",
                isComplete
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 text-slate-600",
              )}
            >
              {isComplete ? "Complete" : "Pending"}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 text-sm text-slate-700"
        >
          {config.fields.map((field) => {
            if (field.type === "textarea") {
              return (
                <label key={field.name as string} className="block space-y-2">
                  <span className="font-medium">{field.label}</span>
                  <textarea
                    className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    placeholder={field.placeholder}
                    rows={4}
                    {...register(field.name as string)}
                  />
                  {field.helperText && (
                    <p className="text-xs text-slate-500">
                      {field.helperText}
                    </p>
                  )}
                </label>
              );
            }

            return (
              <label key={field.name as string} className="block space-y-2">
                <span className="font-medium">{field.label}</span>
                <Input
                  type={field.type ?? "text"}
                  placeholder={field.placeholder}
                  {...register(field.name as string)}
                />
                {field.helperText && (
                  <p className="text-xs text-slate-500">{field.helperText}</p>
                )}
              </label>
            );
          })}
          <Button
            type="primary"
            buttonType="submit"
            disabled={isPending || !isDirty}
            className="rounded-2xl text-sm font-semibold"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Save changes
              </span>
            ) : (
              "Save changes"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
