"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { ApplicationFieldOptions } from "@/lib/applications/options";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

type CreateStudentApplicationFormProps = {
  studentId: string;
  studentName: string;
  semesterId: string;
  semesterName: string;
  submittedByProfileId: string;
  options: ApplicationFieldOptions;
};

type RatingsState = Record<string, string>;

export function CreateStudentApplicationForm({
  studentId,
  studentName,
  semesterId,
  semesterName,
  submittedByProfileId,
  options,
}: CreateStudentApplicationFormProps) {
  const router = useRouter();

  const [deviceAvailable, setDeviceAvailable] = useState(options.deviceTypes[0] ?? "");
  const [sharesDeviceWithSibling, setSharesDeviceWithSibling] = useState("false");
  const [operatingSystem, setOperatingSystem] = useState("");
  const [hasCodingExperience, setHasCodingExperience] = useState("false");
  const [codingToolsUsed, setCodingToolsUsed] = useState("");
  const [comfortLevel, setComfortLevel] = useState(options.comfortLevels[0] ?? "");
  const [studentWhyJoin, setStudentWhyJoin] = useState("");
  const [studentWhatToBuildOrLearn, setStudentWhatToBuildOrLearn] = useState("");
  const [additionalParentComments, setAdditionalParentComments] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ratings, setRatings] = useState<RatingsState>(() =>
    Object.fromEntries(options.interestCategories.map((category) => [category, ""])),
  );

  const canSubmit = useMemo(
    () =>
      Boolean(deviceAvailable) &&
      Boolean(comfortLevel) &&
      Boolean(studentWhyJoin.trim()) &&
      Boolean(studentWhatToBuildOrLearn.trim()),
    [comfortLevel, deviceAvailable, studentWhatToBuildOrLearn, studentWhyJoin],
  );

  const setRating = (category: string, value: string) => {
    setRatings((current) => ({ ...current, [category]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const whyJoinText = studentWhyJoin.trim();
    const buildOrLearnText = studentWhatToBuildOrLearn.trim();
    const parentCommentsText = additionalParentComments.trim();

    if (!whyJoinText || !buildOrLearnText) {
      setError("Please complete all required writing prompts.");
      return;
    }

    if (!deviceAvailable || !comfortLevel) {
      setError("Please complete all required choice fields.");
      return;
    }

    const ratingsPayload = options.interestCategories.map((category) => {
      const rawValue = ratings[category];
      const parsedValue = Number(rawValue);

      return {
        category,
        rating: Number.isFinite(parsedValue) ? parsedValue : NaN,
      };
    });

    const hasInvalidRating = ratingsPayload.some(
      (item) => !Number.isInteger(item.rating) || item.rating < 1 || item.rating > 5,
    );

    if (hasInvalidRating) {
      setError("Please provide a rating from 1 to 5 for every interest category.");
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();

      const { data: insertedApplication, error: insertApplicationError } = await supabase
        .from("student_applications")
        .insert({
          student_id: studentId,
          semester_id: semesterId,
          submitted_by_profile_id: submittedByProfileId,
          status: "pending",
          device_available: deviceAvailable,
          shares_device_with_sibling: sharesDeviceWithSibling === "true",
          operating_system: operatingSystem || null,
          has_coding_experience: hasCodingExperience === "true",
          coding_tools_used: codingToolsUsed.trim() || null,
          comfort_level: comfortLevel,
          student_why_join: whyJoinText,
          student_what_to_build_or_learn: buildOrLearnText,
          additional_parent_comments: parentCommentsText || null,
        })
        .select("id")
        .single();

      if (insertApplicationError || !insertedApplication) {
        throw insertApplicationError ?? new Error("Unable to save the application.");
      }

      const ratingRows = ratingsPayload.map((item) => ({
        application_id: insertedApplication.id,
        category: item.category,
        rating: item.rating,
      }));

      const { error: ratingInsertError } = await supabase
        .from("student_interest_ratings")
        .insert(ratingRows);

      if (ratingInsertError) {
        await supabase.from("student_applications").delete().eq("id", insertedApplication.id);
        throw new Error(
          "Application details were saved, but ratings failed to save. Please try again.",
        );
      }

      router.push("/protected");
      router.refresh();
    } catch (submitError: unknown) {
      const message =
        submitError instanceof Error
          ? mapSubmitErrorToMessage(submitError.message)
          : "Unable to submit the application. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <p className="text-sm text-muted-foreground">
        Student: {studentName} | Semester: {semesterName}
      </p>

      <div className="grid gap-2">
        <Label htmlFor="device-available">Device available</Label>
        <select
          id="device-available"
          required
          value={deviceAvailable}
          onChange={(event) => setDeviceAvailable(event.target.value)}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
        >
          {options.deviceTypes.map((option) => (
            <option key={option} value={option}>
              {formatLabel(option)}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="shares-device">Shares device with sibling</Label>
        <select
          id="shares-device"
          required
          value={sharesDeviceWithSibling}
          onChange={(event) => setSharesDeviceWithSibling(event.target.value)}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
        >
          <option value="false">No</option>
          <option value="true">Yes</option>
        </select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="operating-system">Operating system (optional)</Label>
        <select
          id="operating-system"
          value={operatingSystem}
          onChange={(event) => setOperatingSystem(event.target.value)}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
        >
          <option value="">Not specified</option>
          {options.operatingSystems.map((option) => (
            <option key={option} value={option}>
              {formatLabel(option)}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="has-coding-experience">Has coding experience</Label>
        <select
          id="has-coding-experience"
          required
          value={hasCodingExperience}
          onChange={(event) => setHasCodingExperience(event.target.value)}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
        >
          <option value="false">No</option>
          <option value="true">Yes</option>
        </select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="coding-tools-used">Coding tools used</Label>
        <textarea
          id="coding-tools-used"
          value={codingToolsUsed}
          onChange={(event) => setCodingToolsUsed(event.target.value)}
          placeholder="Scratch, Python, JavaScript, robotics kits, etc."
          className="min-h-24 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="comfort-level">Comfort level</Label>
        <select
          id="comfort-level"
          required
          value={comfortLevel}
          onChange={(event) => setComfortLevel(event.target.value)}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
        >
          {options.comfortLevels.map((option) => (
            <option key={option} value={option}>
              {formatLabel(option)}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="student-why-join">Why does the student want to join?</Label>
        <textarea
          id="student-why-join"
          required
          value={studentWhyJoin}
          onChange={(event) => setStudentWhyJoin(event.target.value)}
          className="min-h-24 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="student-build-learn">What does the student want to build or learn?</Label>
        <textarea
          id="student-build-learn"
          required
          value={studentWhatToBuildOrLearn}
          onChange={(event) => setStudentWhatToBuildOrLearn(event.target.value)}
          className="min-h-24 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="additional-parent-comments">Additional parent comments (optional)</Label>
        <textarea
          id="additional-parent-comments"
          value={additionalParentComments}
          onChange={(event) => setAdditionalParentComments(event.target.value)}
          className="min-h-24 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
        />
      </div>

      <fieldset className="grid gap-4 rounded-md border border-slate-200 p-4">
        <legend className="px-1 text-sm font-medium">Interest ratings (1-5)</legend>
        {options.interestCategories.map((category) => (
          <div key={category} className="grid gap-2">
            <Label htmlFor={`rating-${category}`}>{formatLabel(category)}</Label>
            <input
              id={`rating-${category}`}
              type="number"
              min={1}
              max={5}
              required
              value={ratings[category] ?? ""}
              onChange={(event) => setRating(category, event.target.value)}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
            />
          </div>
        ))}
      </fieldset>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <Button type="submit" disabled={isSubmitting || !canSubmit}>
        {isSubmitting ? "Submitting application..." : "Submit application"}
      </Button>
    </form>
  );
}

function formatLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function mapSubmitErrorToMessage(message: string) {
  const lower = message.toLowerCase();

  if (lower.includes("duplicate") || lower.includes("already")) {
    return "An application for this student and semester already exists.";
  }

  if (lower.includes("foreign key")) {
    return "The selected student or semester is invalid. Please return to the dashboard and try again.";
  }

  if (lower.includes("invalid input value for enum")) {
    return "One of the selected options is no longer valid. Please refresh and try again.";
  }

  return message || "Unable to submit the application. Please try again.";
}
