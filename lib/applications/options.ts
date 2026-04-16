import type { SupabaseClient } from "@supabase/supabase-js";

type EnumValueRow = {
  enum_type: string;
  enum_value: string;
};

type InterestCategoryRow = {
  category: string;
};

export type ApplicationFieldOptions = {
  deviceTypes: string[];
  operatingSystems: string[];
  comfortLevels: string[];
  interestCategories: string[];
};

type LoadOptionsResult =
  | { data: ApplicationFieldOptions; error: null }
  | { data: null; error: string };

const REQUIRED_ENUMS = ["device_type", "operating_system", "comfort_level"] as const;

export async function loadApplicationFieldOptions(
  supabase: SupabaseClient,
): Promise<LoadOptionsResult> {
  const { data: enumRows, error: enumError } = await supabase.rpc("get_enum_values", {
    enum_names: REQUIRED_ENUMS,
  });

  if (enumError || !Array.isArray(enumRows)) {
    return {
      data: null,
      error:
        "Unable to load application choices from the database. Please contact support or try again later.",
    };
  }

  const enumMap = new Map<string, string[]>();

  for (const rawRow of enumRows as EnumValueRow[]) {
    const enumType = rawRow.enum_type;
    const enumValue = rawRow.enum_value;

    if (!enumType || !enumValue) {
      continue;
    }

    const existing = enumMap.get(enumType) ?? [];
    existing.push(enumValue);
    enumMap.set(enumType, existing);
  }

  const deviceTypes = dedupeAndSort(enumMap.get("device_type") ?? []);
  const operatingSystems = dedupeAndSort(enumMap.get("operating_system") ?? []);
  const comfortLevels = dedupeAndSort(enumMap.get("comfort_level") ?? []);

  if (deviceTypes.length === 0 || comfortLevels.length === 0) {
    return {
      data: null,
      error:
        "Application choices are incomplete in the database. Please contact support before submitting.",
    };
  }

  const { data: interestRows, error: interestError } = await supabase
    .from("student_interest_ratings")
    .select("category");

  if (interestError || !Array.isArray(interestRows)) {
    return {
      data: null,
      error:
        "Unable to load interest categories from the database. Please contact support or try again later.",
    };
  }

  const interestCategories = dedupeAndSort(
    (interestRows as InterestCategoryRow[])
      .map((row) => row.category)
      .filter((value): value is string => Boolean(value)),
  );

  if (interestCategories.length === 0) {
    return {
      data: null,
      error:
        "No interest categories are currently available for applications. Please contact support.",
    };
  }

  return {
    data: {
      deviceTypes,
      operatingSystems,
      comfortLevels,
      interestCategories,
    },
    error: null,
  };
}

function dedupeAndSort(values: string[]) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}
