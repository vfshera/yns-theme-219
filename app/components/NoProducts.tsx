export function NoProducts({
  message = "No products match these filters.",
}: {
  message?: string;
}) {
  return (
    <div className="py-24 text-center">
      <p className="text-lg text-muted-foreground">{message}</p>
    </div>
  );
}
