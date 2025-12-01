"use client";

import { useEffect, useState } from "react";
import Button from "@/components/general/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { HostProfile } from "@/types/host";
import { useUpdateHostProfileMutation } from "@/hooks/use-host-profile";
import { cn } from "@/lib/utils";

const LANGUAGE_OPTIONS = [
  "Yoruba",
  "Hausa",
  "Igbo",
  "Ebira",
  "Tapa",
  "French",
  "Spanish",
];

type HostLanguagePickerProps = {
  profile: HostProfile;
};

export const HostLanguagePicker = ({ profile }: HostLanguagePickerProps) => {
  const { mutateAsync, isPending } = useUpdateHostProfileMutation();
  const [selected, setSelected] = useState<string[]>([]);
  const [initialSelected, setInitialSelected] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const englishIncluded = true;

  useEffect(() => {
    const languages =
      profile.languages?.filter((language) => language !== "English") ?? [];
    setSelected(languages);
    setInitialSelected(languages);
  }, [profile.languages]);

  const toggleLanguage = (language: string) => {
    setSelected((prev) =>
      prev.includes(language)
        ? prev.filter((item) => item !== language)
        : [...prev, language],
    );
  };

  const handleSave = async () => {
    try {
      setError(null);
      await mutateAsync({
        section: "preferences",
        data: { languages: ["English", ...selected] },
      });
    } catch (mutationError) {
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : "Failed to update languages",
      );
    }
  };

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle>Language preferences</CardTitle>
        <p className="text-sm text-slate-500">
          English is enabled for every profile. Add other languages you’re comfortable
          supporting.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-3 text-sm">
          <span className="rounded-full border border-slate-300 bg-slate-50 px-3 py-1 font-semibold text-slate-600">
            English (default)
          </span>
          {[
            ...selected,
            ...LANGUAGE_OPTIONS.filter((lang) => !selected.includes(lang)),
          ].map((language) => {
            const isActive = selected.includes(language);
            return (
              <button
                key={language}
                type="button"
                onClick={() => toggleLanguage(language)}
                className={cn(
                  "rounded-full border px-3 py-1 font-medium transition",
                  isActive
                    ? "border-primary bg-primary text-white"
                    : "border-slate-300 text-slate-600 hover:bg-slate-50",
                )}
              >
                {isActive ? `+ ${language}` : `+ ${language}`}
              </button>
            );
          })}
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
        <Button
          type="primary"
          className="rounded-2xl"
          buttonType="button"
          onClick={handleSave}
          disabled={
            isPending ||
            (selected.length === initialSelected.length &&
              selected.every((lang) => initialSelected.includes(lang)))
          }
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Save language preferences
            </span>
          ) : (
            "Save language preferences"
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
