/** Satori-compatible product card for /product/:slug/og.png.
 * Ported from theme 219's `opengraph-image.tsx` (the source uses next/og).
 * Only inline styles and flexbox: Satori does not resolve CSS variables or Tailwind classes.
 */
export type ProductOgCardProps = {
  storeName: string;
  productName: string;
  price: string | null;
  summary: string | null;
  image: string | null;
};

export function ProductOgCard({
  storeName,
  productName,
  price,
  summary,
  image,
}: ProductOgCardProps) {
  return (
    <div
      style={{
        fontFamily: "Geist",
        display: "flex",
        flexDirection: "row",
        alignItems: "stretch",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        backgroundColor: "#f5f5f5",
      }}
    >
      {image ? (
        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Data URI from the public image file: Satori blocks localhost URLs. */}
          <img
            src={image}
            style={{ width: "600px", height: "630px", objectFit: "cover" }}
          />
        </div>
      ) : null}
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          borderLeft: "1px solid #e5e5e5",
        }}
      >
        <div
          style={{
            width: "100%",
            marginTop: "32px",
            marginBottom: "-32px",
            paddingLeft: "64px",
            paddingRight: "64px",
            textAlign: "left",
            fontSize: "36px",
            fontWeight: 400,
          }}
        >
          {storeName}
        </div>
        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "center",
            paddingLeft: "64px",
            paddingRight: "64px",
          }}
        >
          <div
            style={{
              fontSize: "48px",
              fontWeight: 700,
              margin: 0,
              width: "100%",
              textWrap: productName.includes(" ") ? "balance" : "initial",
            }}
          >
            {productName}
          </div>
          {price ? (
            <div style={{ fontSize: "30px", color: "#3f3f46", margin: 0 }}>
              {price}
            </div>
          ) : null}
          {summary ? (
            <div
              style={{
                fontSize: "20px",
                color: "#52525b",
                maxHeight: "112px",
                overflow: "hidden",
                marginTop: "16px",
              }}
            >
              {summary}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
