import type {
  Bundle,
  BundleItemSource,
  BundleSelection,
  PricedBundleSelection,
} from "./types";

/** Forced items at their fixed quantity, then items marked as selected by default. */
export function defaultSelections(bundle: Bundle): BundleSelection[] {
  return bundle.groups.flatMap((group) =>
    group.items.flatMap((item) => {
      if (item.forced) {
        return [
          {
            groupId: group.id,
            variantId: item.variantId,
            quantity: item.fixedQuantity,
          },
        ];
      }

      if (item.defaultSelected) {
        return [{ groupId: group.id, variantId: item.variantId, quantity: 1 }];
      }

      return [];
    }),
  );
}

/** Stable line identity: two different picks are two different cart lines. */
export function bundleKey(selections: readonly BundleSelection[]): string {
  return [...selections]
    .sort(
      (a, b) =>
        a.groupId.localeCompare(b.groupId) ||
        a.variantId.localeCompare(b.variantId),
    )
    .map(
      ({ groupId, variantId, quantity }) =>
        `${groupId}:${variantId}:${quantity}`,
    )
    .join("|");
}

const isSelection = (value: unknown): value is BundleSelection => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const entry = value as Record<string, unknown>;

  return (
    typeof entry.groupId === "string" &&
    entry.groupId.length > 0 &&
    typeof entry.variantId === "string" &&
    entry.variantId.length > 0 &&
    typeof entry.quantity === "number" &&
    Number.isInteger(entry.quantity) &&
    entry.quantity >= 1 &&
    entry.quantity <= 99
  );
};

/** Decode the single JSON field posted to `/cart`; reject anything malformed. */
export function parseSelections(raw: string | null): BundleSelection[] | null {
  if (!raw) {
    return null;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (
    !Array.isArray(parsed) ||
    parsed.length > 100 ||
    !parsed.every(isSelection)
  ) {
    return null;
  }

  return parsed.map(({ groupId, variantId, quantity }) => ({
    groupId,
    variantId,
    quantity,
  }));
}

/**
 * Server backstop for the builder's client-side checks. Mirrors its caps: a group's min/max,
 * per-item max, stock, and the one-per-item rule when duplicates are not allowed.
 */
export function validateSelections(
  bundle: Bundle,
  selections: readonly BundleSelection[],
  resolveVariant: (variantId: string) => BundleItemSource | null,
): string | null {
  const seen = new Set<string>();

  for (const selection of selections) {
    const key = `${selection.groupId}:${selection.variantId}`;
    if (seen.has(key)) {
      return "Duplicate selection";
    }

    seen.add(key);

    const group = bundle.groups.find((entry) => entry.id === selection.groupId);
    if (!group) {
      return "Invalid bundle group";
    }

    const item = group.items.find(
      (entry) => entry.variantId === selection.variantId,
    );
    if (!item) {
      return "Invalid bundle item";
    }

    const source = resolveVariant(selection.variantId);
    if (!source || (source.stock !== null && source.stock <= 0)) {
      return "This item is out of stock";
    }

    if (!group.allowDuplicates && selection.quantity > 1) {
      return `Choose only one ${item.label}`;
    }

    if (item.maxQuantity !== null && selection.quantity > item.maxQuantity) {
      return `Only ${item.maxQuantity} of ${item.label} available`;
    }

    if (source.stock !== null && selection.quantity > source.stock) {
      return `Not enough stock for ${item.label}`;
    }
  }

  for (const group of bundle.groups) {
    const picked = selections.filter(
      (selection) => selection.groupId === group.id,
    );
    const total = picked.reduce(
      (sum, selection) => sum + selection.quantity,
      0,
    );

    if (total < group.minQuantity) {
      return `Select at least ${group.minQuantity} from ${group.name ?? "each group"}`;
    }

    if (group.maxQuantity !== null && total > group.maxQuantity) {
      return `Select at most ${group.maxQuantity} from ${group.name ?? "each group"}`;
    }

    for (const item of group.items.filter((entry) => entry.forced)) {
      const required = picked.find(
        (selection) => selection.variantId === item.variantId,
      );
      if (!required || required.quantity !== item.fixedQuantity) {
        return `${item.label} is required`;
      }
    }
  }

  return null;
}

/** Resolve ids against one bundle's items; used by validation and line construction. */
export function bundleItemResolver(
  bundle: Bundle,
): (variantId: string) => BundleItemSource | null {
  const items = bundle.groups.flatMap((group) => group.items);

  return (variantId) =>
    items.find((item) => item.variantId === variantId) ?? null;
}

/** Attach authoritative prices so the cart can price a bundle line without a server import. */
export function resolveBundleSelections(
  selections: readonly BundleSelection[],
  resolveVariant: (variantId: string) => BundleItemSource | null,
): PricedBundleSelection[] | null {
  const resolved = selections.map((selection) => {
    const source = resolveVariant(selection.variantId);

    return source
      ? {
          ...selection,
          label: source.label,
          price: source.price,
          priceGross: source.priceGross,
        }
      : null;
  });

  return resolved.every((entry) => entry !== null)
    ? (resolved as PricedBundleSelection[])
    : null;
}
