export { cn } from "cn";

export function isVideoUrl(url: string): boolean {
  try {
    const { pathname } = new URL(url);

    return (
      pathname.endsWith(".mp4") ||
      pathname.endsWith(".webm") ||
      pathname.endsWith(".mov")
    );
  } catch {
    return false;
  }
}
