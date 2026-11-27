import { useSearchParams } from "react-router";
import { cn } from "~/lib/utils";
import type { VariantWithOptions } from "~/lib/variants/types";

type VariantOption = {
  id: string;
  value: string;
  colorValue: string | null;
  position: number;
};

type VariantGroup = {
  label: string;
  type: "string" | "color";
  options: VariantOption[];
};

function processVariants(
  variants: readonly VariantWithOptions[],
): VariantGroup[] {
  const allCombinations = variants.flatMap((variant) =>
    variant.combinations.map(({ variantValue }) => ({ variantValue })),
  );
  const seenOptionIds = new Map<string, Set<string>>();
  const grouped = allCombinations.reduce(
    (acc, { variantValue }) => {
      const { label, type } = variantValue.variantType;

      if (!acc[label]) {
        acc[label] = { label, type, options: [] };
        seenOptionIds.set(label, new Set());
      }

      const seenIds = seenOptionIds.get(label);
      if (!seenIds?.has(variantValue.id)) {
        seenIds?.add(variantValue.id);
        acc[label].options.push({
          id: variantValue.id,
          value: variantValue.value,
          colorValue: variantValue.colorValue,
          position: variantValue.position ?? 0,
        });
      }

      return acc;
    },
    {} as Record<string, VariantGroup>,
  );

  return Object.values(grouped)
    .map((group) => ({
      ...group,
      options: [...group.options].sort((a, b) => a.position - b.position),
    }))
    .filter((group) => group.options.length > 1);
}

/** The URL is only written here; a plain page load keeps the default variant's clean URL. */
export function VariantSelector({
  variants,
  selectedVariant,
  selectedOptions,
}: {
  variants: readonly VariantWithOptions[];
  selectedVariant: VariantWithOptions | undefined;
  selectedOptions: Record<string, string>;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const groups = processVariants(variants);

  if (groups.length === 0) {
    return null;
  }

  const optionsById = new Map(
    groups.map((group) => [
      group.label,
      new Map(group.options.map((option) => [option.id, option])),
    ]),
  );

  const handleSelect = (label: string, optionId: string) => {
    const option = optionsById.get(label)?.get(optionId);
    if (!option) {
      return;
    }

    const optionLabels = new Set(groups.map((group) => group.label));
    const preserved = [...searchParams.entries()].filter(
      ([key]) => !optionLabels.has(key),
    );
    const next = new URLSearchParams(preserved);

    // Write a complete option set from the resolved variant, overriding the clicked label.
    for (const { variantValue } of selectedVariant?.combinations ?? []) {
      const key = variantValue.variantType.label;
      next.set(key, key === label ? option.value : variantValue.value);
    }

    setSearchParams(next, { preventScrollReset: true });
  };

  return (
    <div className="space-y-5">
      {groups.map((group) => {
        const selectedOptionId = selectedOptions[group.label];

        return (
          <fieldset key={group.label} className="m-0 border-0 p-0">
            <div className="mb-3 flex items-center justify-between">
              <legend className="text-sm font-medium">{group.label}</legend>
              {group.type === "color" && selectedOptionId && (
                <span className="text-sm text-muted-foreground">
                  {optionsById.get(group.label)?.get(selectedOptionId)?.value}
                </span>
              )}
            </div>

            <div
              className={cn(
                "flex gap-3",
                group.type === "color" ? "" : "flex-wrap",
              )}
            >
              {group.options.map((option) => {
                const isSelected = selectedOptionId === option.id;

                if (group.type === "color") {
                  const isLightColor = ["#FFFFFF", "#FFFFF0", "#FFF"].includes(
                    option.colorValue?.toUpperCase() ?? "",
                  );

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleSelect(group.label, option.id)}
                      aria-label={option.value}
                      aria-pressed={isSelected}
                      title={option.value}
                      className={cn(
                        "relative size-12 rounded-full transition-all duration-200",
                        isSelected
                          ? "ring-2 ring-foreground ring-offset-2 ring-offset-background"
                          : "hover:ring-2 hover:ring-muted-foreground hover:ring-offset-2 hover:ring-offset-background",
                      )}
                      style={{ backgroundColor: option.colorValue ?? "#fff" }}
                    >
                      {isLightColor && (
                        <span className="absolute inset-0 rounded-full border border-border" />
                      )}
                    </button>
                  );
                }

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleSelect(group.label, option.id)}
                    aria-pressed={isSelected}
                    className={cn(
                      "flex h-10 items-center rounded-md border px-4 transition-colors duration-200",
                      isSelected
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-background hover:border-muted-foreground",
                    )}
                  >
                    <span className="text-sm font-medium">{option.value}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>
        );
      })}
    </div>
  );
}
