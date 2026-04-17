"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type ApplicationFieldOptions = {
  deviceTypes: string[];
  operatingSystems: string[];
  comfortLevels: string[];
  interestCategories: string[];
};

type CreateStudentApplicationFormProps = {
  studentId: string;
  studentName: string;
  semesterId: string;
  semesterName: string;
  semesterFeeUsd: number;
  submittedByProfileId: string;
  options: ApplicationFieldOptions;
};

const FEE_ACKNOWLEDGMENT_ERROR =
  "Please confirm that you are okay with paying the semester fee before submitting.";

type RatingsState = Record<string, string>;
type RatingTone = {
  sliderAccentClass: string;
  valueClass: string;
};

const INTEREST_AREA_INFO: Record<
  string,
  { title: string; examples: string[] }
> = {
  hardware: {
    title: "Build with hardware",
    examples: [
      "custom small scale smart home (sensors to monitor/control air temp, humidity, door security, etc.)",
      "automated hydroponics garden (grow lettuce indoors with LED and nutrient monitoring)",
      "hand controlled rc car (program a glove that detects hand movements to control an rc car)",
    ],
  },
  games: {
    title: "Make games",
    examples: [
      "create a 2d arcade game (pong, snake, tetris, or original game)",
      "puzzle/escape room game (logic challenges and branching clues)",
      "interactive adventure game (choose-your-own-story with branching paths and endings)",
    ],
  },
  ai_ml: {
    title: "AI/ML projects",
    examples: [
      "custom ai chatbot website (tutorAI, storyCreatorAI, talkLikeAPirateAI)",
      "image classifier (train a model to recognize objects or hand signs)",
      "ai quiz generator (upload notes/textbook and generate study quizzes)",
    ],
  },
  creative_coding: {
    title: "Creative coding",
    examples: [
      "meme and sticker studio app (create captions, remix templates, and share custom designs)",
      "avatar and character creator website (mix hairstyles, outfits, colors, and accessories, then save/share designs)",
      "music mood visualizer (live visuals that react to sound)",
    ],
  },
  real_world_impact: {
    title: "Real-world impact projects",
    examples: [
      "recycling/litter tracking app (log cleanups and progress)",
      "smart classroom tool (team generator, attendance helper, live polls)",
      "community donation finder app (map local food pantries, shelters, and clothing drop-off sites)",
    ],
  },
};

const INTEREST_CARD_STYLES: Record<string, string> = {
  hardware: "border-emerald-200/20 bg-gradient-to-br from-emerald-600/10 via-teal-600/5 to-cyan-600/10",
  games: "border-amber-200/20 bg-gradient-to-br from-amber-600/10 via-orange-600/5 to-yellow-600/10",
  ai_ml: "border-cyan-200/20 bg-gradient-to-br from-cyan-600/10 via-sky-600/5 to-indigo-600/10",
  creative_coding:
    "border-violet-200/20 bg-gradient-to-br from-violet-600/10 via-fuchsia-600/5 to-pink-600/10",
  real_world_impact:
    "border-rose-200/20 bg-gradient-to-br from-rose-600/10 via-red-600/5 to-orange-600/10",
};

/** Display label for each stored rating 1–5 (shown under the slider; updates with the control). */
const INTEREST_LEVEL_LABELS: Record<string, string> = {
  "1": "Not interested.",
  "2": "A little curious — not a top pick.",
  "3": "Somewhat interested — happy to explore it.",
  "4": "Very interested — would love to dig in.",
  "5": "Super interested — let's do this!",
};

export function CreateStudentApplicationForm({
  studentId,
  studentName,
  semesterId,
  semesterName,
  semesterFeeUsd,
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
  const [missingRequiredFields, setMissingRequiredFields] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ratings, setRatings] = useState<RatingsState>(() =>
    Object.fromEntries(options.interestCategories.map((category) => [category, "1"])),
  );
  const [expandedInterestCards, setExpandedInterestCards] = useState<Record<string, boolean>>(
    () =>
      Object.fromEntries(
        options.interestCategories.map((category) => [category, false]),
      ),
  );
  const [feeAcknowledged, setFeeAcknowledged] = useState(false);

  const formattedSemesterFee = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(semesterFeeUsd),
    [semesterFeeUsd],
  );

  const canSubmit = useMemo(
    () => !isSubmitting && feeAcknowledged,
    [isSubmitting, feeAcknowledged],
  );

  const setRating = (category: string, value: string) => {
    setRatings((current) => ({ ...current, [category]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!feeAcknowledged) {
      setError(FEE_ACKNOWLEDGMENT_ERROR);
      return;
    }

    const whyJoinText = studentWhyJoin.trim();
    const buildOrLearnText = studentWhatToBuildOrLearn.trim();
    const parentCommentsText = additionalParentComments.trim();
    const missingFields = getMissingRequiredFields({
      deviceAvailable,
      operatingSystem,
      comfortLevel,
      whyJoinText,
      buildOrLearnText,
    });

    if (missingFields.length > 0) {
      setMissingRequiredFields(missingFields);
      setError(
        `Please complete the following required field${missingFields.length === 1 ? "" : "s"}: ${missingFields.join(", ")}.`,
      );
      return;
    }

    setMissingRequiredFields([]);

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

      <div
        className="rounded-md border border-input bg-muted/30 p-4 text-sm"
        role="note"
        aria-label="Laptop requirement for club meetings"
      >
        <p className="font-medium text-foreground">Laptop for club meetings</p>
        <p className="mt-2 text-muted-foreground">
          Each student works on their own computer during club. Please plan to have a laptop,
          Chromebook, or other portable computer your child can bring to every session. A desktop
          that stays at home is not a substitute unless you can reliably bring a portable machine on
          club days.
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="device-available">Device available</Label>
        <p id="device-available-hint" className="text-xs text-muted-foreground">
          Choose what best matches the machine your child will actually bring to the club.
        </p>
        <select
          id="device-available"
          required
          value={deviceAvailable}
          onChange={(event) => setDeviceAvailable(event.target.value)}
          aria-describedby="device-available-hint"
          className={`rounded-md border bg-input px-3 py-2 text-sm text-foreground ${
            missingRequiredFields.includes("Device available") ? "border-red-500" : "border-input"
          }`}
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
          className="rounded-md border border-input bg-input px-3 py-2 text-sm text-foreground"
        >
          <option value="false">No</option>
          <option value="true">Yes</option>
        </select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="operating-system">Operating system</Label>
        <select
          id="operating-system"
          required
          value={operatingSystem}
          onChange={(event) => setOperatingSystem(event.target.value)}
          className={`rounded-md border bg-input px-3 py-2 text-sm text-foreground ${
            missingRequiredFields.includes("Operating system") ? "border-red-500" : "border-input"
          }`}
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
          className="rounded-md border border-input bg-input px-3 py-2 text-sm text-foreground"
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
          className="min-h-24 rounded-md border border-input bg-input px-3 py-2 text-sm text-foreground"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="comfort-level">Comfort level</Label>
        <select
          id="comfort-level"
          required
          value={comfortLevel}
          onChange={(event) => setComfortLevel(event.target.value)}
          className={`rounded-md border bg-input px-3 py-2 text-sm text-foreground ${
            missingRequiredFields.includes("Comfort level") ? "border-red-500" : "border-input"
          }`}
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
          className={`min-h-24 rounded-md border bg-input px-3 py-2 text-sm text-foreground ${
            missingRequiredFields.includes("Why does the student want to join?")
              ? "border-red-500"
              : "border-input"
          }`}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="student-build-learn">What does the student want to build or learn?</Label>
        <textarea
          id="student-build-learn"
          required
          value={studentWhatToBuildOrLearn}
          onChange={(event) => setStudentWhatToBuildOrLearn(event.target.value)}
          className={`min-h-24 rounded-md border bg-input px-3 py-2 text-sm text-foreground ${
            missingRequiredFields.includes("What does the student want to build or learn?")
              ? "border-red-500"
              : "border-input"
          }`}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="additional-parent-comments">Additional parent comments (optional)</Label>
        <textarea
          id="additional-parent-comments"
          value={additionalParentComments}
          onChange={(event) => setAdditionalParentComments(event.target.value)}
          className="min-h-24 rounded-md border border-input bg-input px-3 py-2 text-sm text-foreground"
        />
      </div>

      <fieldset className="grid min-w-0 gap-4 overflow-x-clip rounded-md border border-slate-200 p-4 [min-inline-size:0]">
        <legend className="px-1 text-sm font-medium">Interest ratings (1-5)</legend>
        <div className="grid min-w-0 gap-3">
          {options.interestCategories.map((category) => {
            const info = INTEREST_AREA_INFO[category];
            const title = info?.title ?? formatLabel(category);
            const examples = info?.examples ?? [];
            const isExpanded = expandedInterestCards[category] ?? false;
            const currentRating = ratings[category] ?? "1";
            const ratingTone = getRatingTone(currentRating);

            return (
              <div
                key={category}
                className={`min-w-0 max-w-full rounded-xl border p-4 ${INTEREST_CARD_STYLES[category] ?? "bg-card"}`}
              >
                <button
                  type="button"
                  className="flex min-w-0 w-full items-center justify-between gap-3 text-left"
                  onClick={() =>
                    setExpandedInterestCards((current) => ({
                      ...current,
                      [category]: !current[category],
                    }))
                  }
                  aria-expanded={isExpanded}
                >
                  <div className="min-w-0">
                    <Label htmlFor={`rating-${category}`} className="truncate">
                      {title}
                    </Label>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Move the slider to match how interested the student is.
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center">
                    <ChevronDown
                      className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : "rotate-0"}`}
                      aria-hidden="true"
                    />
                  </div>
                </button>

                <div className="mt-4 min-w-0 space-y-2">
                  <div className="min-w-0 w-full">
                    <input
                      id={`rating-${category}`}
                      type="range"
                      min={1}
                      max={5}
                      step={1}
                      value={currentRating}
                      aria-valuetext={interestLevelLabel(currentRating)}
                      onChange={(event) => setRating(category, event.target.value)}
                      className={`max-w-full min-w-0 w-full cursor-pointer ${ratingTone.sliderAccentClass} 
                      [&::-webkit-slider-runnable-track]:h-2
                      [&::-webkit-slider-runnable-track]:rounded-full
                      [&::-webkit-slider-runnable-track]:bg-input
                      [&::-webkit-slider-thumb]:appearance-none
                      [&::-webkit-slider-thumb]:h-4
                      [&::-webkit-slider-thumb]:w-4
                      [&::-webkit-slider-thumb]:mt-[-4px]
                      [&::-webkit-slider-thumb]:rounded-full
                      [&::-webkit-slider-thumb]:bg-foreground
                      [&::-webkit-slider-thumb]:border
                      [&::-webkit-slider-thumb]:border-border
                      [&::-webkit-slider-thumb]:shadow-sm
                      [&::-webkit-slider-thumb]:cursor-pointer
                      [&::-moz-range-track]:h-2
                      [&::-moz-range-track]:rounded-full
                      [&::-moz-range-track]:bg-input
                      [&::-moz-range-thumb]:h-4
                      [&::-moz-range-thumb]:w-4
                      [&::-moz-range-thumb]:rounded-full
                      [&::-moz-range-thumb]:bg-foreground
                      [&::-moz-range-thumb]:border
                      [&::-moz-range-thumb]:border-border
                      [&::-moz-range-thumb]:shadow-sm
                      [&:focus-visible]:outline-none
                      [&:focus-visible]:ring-2
                      [&:focus-visible]:ring-[hsl(var(--ring))]`}
                    />
                  </div>
                  <p
                    aria-live="polite"
                    className={`min-w-0 text-pretty text-center text-sm font-medium leading-snug ${ratingTone.valueClass} rounded-md border px-2 py-1.5`}
                  >
                    {interestLevelLabel(currentRating)}
                  </p>
                </div>

                {isExpanded && examples.length > 0 ? (
                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Examples
                    </p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                      {examples.map((example) => (
                        <li key={example}>{example}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </fieldset>

      <div className="flex items-start gap-3 rounded-md border border-input bg-muted/30 p-4">
        <Checkbox
          id="fee-acknowledgment"
          checked={feeAcknowledged}
          onCheckedChange={(checked) => {
            const next = checked === true;
            setFeeAcknowledged(next);
            if (next) {
              setError((current) =>
                current === FEE_ACKNOWLEDGMENT_ERROR ? null : current,
              );
            }
          }}
          className="mt-0.5"
          aria-describedby="fee-acknowledgment-description"
        />
        <div className="min-w-0 flex-1">
          <Label htmlFor="fee-acknowledgment" className="cursor-pointer font-medium leading-snug">
            I am okay with paying the semester fee of {formattedSemesterFee} for {semesterName}.
          </Label>
          <p id="fee-acknowledgment-description" className="mt-1 text-xs text-muted-foreground">
            You must check this box to submit the application.
          </p>
        </div>
      </div>

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

function interestLevelLabel(rating: string): string {
  return INTEREST_LEVEL_LABELS[rating] ?? INTEREST_LEVEL_LABELS["1"];
}

function getRatingTone(rating: string): RatingTone {
  switch (rating) {
    case "5":
      return {
        sliderAccentClass: "accent-rose-400",
        valueClass: "border-rose-300/40 bg-rose-500/20 text-rose-200",
      };
    case "4":
      return {
        sliderAccentClass: "accent-violet-400",
        valueClass: "border-violet-300/40 bg-violet-500/20 text-violet-200",
      };
    case "3":
      return {
        sliderAccentClass: "accent-sky-400",
        valueClass: "border-sky-300/40 bg-sky-500/20 text-sky-200",
      };
    case "2":
      return {
        sliderAccentClass: "accent-emerald-400",
        valueClass: "border-emerald-300/40 bg-emerald-500/20 text-emerald-200",
      };
    case "1":
    default:
      return {
        sliderAccentClass: "accent-slate-400",
        valueClass: "border-slate-300/30 bg-slate-500/15 text-slate-200",
      };
  }
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

function getMissingRequiredFields({
  deviceAvailable,
  operatingSystem,
  comfortLevel,
  whyJoinText,
  buildOrLearnText,
}: {
  deviceAvailable: string;
  operatingSystem: string;
  comfortLevel: string;
  whyJoinText: string;
  buildOrLearnText: string;
}) {
  const missing: string[] = [];

  if (!deviceAvailable) {
    missing.push("Device available");
  }

  if (!operatingSystem) {
    missing.push("Operating system");
  }

  if (!comfortLevel) {
    missing.push("Comfort level");
  }

  if (!whyJoinText) {
    missing.push("Why does the student want to join?");
  }

  if (!buildOrLearnText) {
    missing.push("What does the student want to build or learn?");
  }

  return missing;
}
