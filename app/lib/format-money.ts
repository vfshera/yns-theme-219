type MoneyInt = { amount: string | bigint | number; currency: string };

// https://docs.stripe.com/currencies#zero-decimal
const edgeCaseCurrencies = {
  BIF: 0,
  CLP: 0,
  DJF: 0,
  GNF: 0,
  JPY: 0,
  KMF: 0,
  KRW: 0,
  MGA: 0,
  PYG: 0,
  RWF: 0,
  UGX: 0,
  VND: 0,
  VUV: 0,
  XAF: 0,
  XOF: 0,
  XPF: 0,

  BHD: 3,
  JOD: 3,
  KWD: 3,
  OMR: 3,
  TND: 3,
} as const;

const decimalsFor = (currency: string): number => {
  if (currency.length !== 3) {
    throw new Error("Currency needs to be a 3-letter code");
  }

  return (
    edgeCaseCurrencies[
      currency.toUpperCase() as keyof typeof edgeCaseCurrencies
    ] ?? 2
  );
};

/** Format a minor-unit amount (e.g. "2400" -> "$24.00") for display. */
export function formatMoney({
  amount: minor,
  currency,
  locale,
}: MoneyInt & { locale: string }): string {
  const decimals = decimalsFor(currency);
  const major = (Number(minor) / 10 ** decimals).toFixed(decimals);

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    currencyDisplay: "symbol",
  }).format(Number.parseFloat(major));
}
