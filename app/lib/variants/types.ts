/** Structural contracts shared by variant ordering, selection and cart lines. */

export type VariantTypeKind = "string" | "color";

export type VariantTypeRef = {
  id: string;
  type: VariantTypeKind;
  label: string;
};

export type VariantValue = {
  id: string;
  value: string;
  colorValue: string | null;
  position: number | null;
  variantType: VariantTypeRef;
};

export type VariantCombination = {
  variantValue: VariantValue;
};

/** The minimum shape both helpers need — no price, stock or product data. */
export type VariantWithOptions = {
  id: string;
  combinations: readonly VariantCombination[];
};
