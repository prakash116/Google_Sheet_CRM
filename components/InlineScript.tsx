/**
 * Static inline <script> that runs before paint. Per the Next.js "preventing flash" guide:
 * the server emits it as JavaScript, the client as text/plain (so React doesn't warn about
 * rendering scripts), and suppressHydrationWarning tolerates that difference and attributes
 * that browser extensions inject into script tags. Only pass trusted, static code.
 */
export default function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
