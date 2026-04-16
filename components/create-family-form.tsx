"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

type CreateFamilyFormProps = {
  parentProfileId: string;
};

type ChildFormData = {
  fullName: string;
  relationshipToStudent: string;
  gradeLevel: string;
  birthDate: string;
};

function createEmptyChild(): ChildFormData {
  return {
    fullName: "",
    relationshipToStudent: "",
    gradeLevel: "",
    birthDate: "",
  };
}

export function CreateFamilyForm({ parentProfileId }: CreateFamilyFormProps) {
  const [primaryHomeCity, setPrimaryHomeCity] = useState("");
  const [children, setChildren] = useState<ChildFormData[]>([createEmptyChild()]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const updateChild = (
    childIndex: number,
    field: keyof ChildFormData,
    value: string,
  ) => {
    setChildren((currentChildren) =>
      currentChildren.map((child, index) =>
        index === childIndex ? { ...child, [field]: value } : child,
      ),
    );
  };

  const handleAddChild = () => {
    setChildren((currentChildren) => [...currentChildren, createEmptyChild()]);
  };

  const handleRemoveChild = (childIndex: number) => {
    setChildren((currentChildren) =>
      currentChildren.filter((_, index) => index !== childIndex),
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedCity = primaryHomeCity.trim();
    if (!trimmedCity) {
      setError("Primary home city is required");
      return;
    }

    if (children.length === 0) {
      setError("Add at least one child before creating your family.");
      return;
    }

    const trimmedChildren = children.map((child) => ({
      fullName: child.fullName.trim(),
      relationshipToStudent: child.relationshipToStudent.trim(),
      gradeLevel: child.gradeLevel.trim(),
      birthDate: child.birthDate,
    }));

    const firstInvalidChildIndex = trimmedChildren.findIndex(
      (child) =>
        !child.fullName ||
        !child.relationshipToStudent ||
        !child.gradeLevel ||
        !child.birthDate,
    );

    if (firstInvalidChildIndex >= 0) {
      setError(
        `Child ${firstInvalidChildIndex + 1}: full name, relationship, grade level, and birth date are required.`,
      );
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data: authUserResult } = await supabase.auth.getUser();

      const { data: familyRow, error: familyInsertError } = await supabase
        .from("families")
        .insert({
          parent_profile_id: parentProfileId,
          primary_home_city: trimmedCity,
          preferred_schedule_options: ["weekday_daytime"],
        })
        .select("id")
        .single();

      if (familyInsertError || !familyRow) {
        throw familyInsertError ?? new Error("Unable to create family.");
      }

      const studentsPayload = trimmedChildren.map((child) => ({
        family_id: familyRow.id,
        full_name: child.fullName,
        relationship_to_student: child.relationshipToStudent,
        grade_level: child.gradeLevel,
        birth_date: child.birthDate || null,
      }));

      const { error: studentInsertError } = await supabase
        .from("students")
        .insert(studentsPayload);

      if (studentInsertError) {
        throw new Error(
          "Your family was created, but saving children failed. Please review child details and try again.",
        );
      }

      router.push("/protected");
      router.refresh();
    } catch (submitError: unknown) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to create family. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="grid gap-2">
        <Label htmlFor="primary-home-city">Primary home city</Label>
        <Input
          id="primary-home-city"
          type="text"
          placeholder="Cleveland"
          required
          value={primaryHomeCity}
          onChange={(event) => setPrimaryHomeCity(event.target.value)}
        />
      </div>

      <div className="grid gap-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Children</p>
          <Button type="button" variant="outline" onClick={handleAddChild}>
            Add child
          </Button>
        </div>

        {children.map((child, index) => (
          <div
            key={`child-${index}`}
            className="rounded-md border border-slate-200/15 p-4"
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-medium">Child {index + 1}</p>
              {children.length > 1 ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => handleRemoveChild(index)}
                >
                  Remove
                </Button>
              ) : null}
            </div>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor={`child-full-name-${index}`}>Full name</Label>
                <Input
                  id={`child-full-name-${index}`}
                  type="text"
                  required
                  value={child.fullName}
                  onChange={(event) =>
                    updateChild(index, "fullName", event.target.value)
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor={`child-relationship-${index}`}>
                  Relationship to student
                </Label>
                <Input
                  id={`child-relationship-${index}`}
                  type="text"
                  required
                  value={child.relationshipToStudent}
                  onChange={(event) =>
                    updateChild(index, "relationshipToStudent", event.target.value)
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor={`child-grade-level-${index}`}>Grade level</Label>
                <Input
                  id={`child-grade-level-${index}`}
                  type="text"
                  required
                  value={child.gradeLevel}
                  onChange={(event) =>
                    updateChild(index, "gradeLevel", event.target.value)
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor={`child-birth-date-${index}`}>
                  Birth date
                </Label>
                <Input
                  id={`child-birth-date-${index}`}
                  type="date"
                  required
                  value={child.birthDate}
                  onChange={(event) =>
                    updateChild(index, "birthDate", event.target.value)
                  }
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {error ? <p className="text-sm text-red-500">{error}</p> : null}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Creating family..." : "Create Family"}
      </Button>
    </form>
  );
}
