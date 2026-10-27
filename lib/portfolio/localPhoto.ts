import "server-only";

import { existsSync } from "node:fs";
import path from "node:path";

/** Drop a photo at public/images/profile.(jpg|jpeg|png|webp) to use it when the sheet has no image URL. */
export function localProfilePhoto(): string | null {
  return (
    ["jpg", "jpeg", "png", "webp"]
      .map((ext) => `/images/profile.${ext}`)
      .find((p) => existsSync(path.join(process.cwd(), "public", p))) ?? null
  );
}
