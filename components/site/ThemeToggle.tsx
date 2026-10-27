"use client";

import { Moon, Sun } from "lucide-react";

import { setTheme, useTheme } from "@/lib/theme";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const theme = useTheme();
  const next = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      className={`relative flex h-10 w-10 items-center justify-center rounded-full border border-line text-fg transition hover:border-accent hover:text-accent ${className}`}
    >
      {/* Both icons render; CSS shows the right one so there's no flash before hydration. */}
      <Sun className="h-4 w-4 transition-all duration-300 [[data-theme=light]_&]:scale-0 [[data-theme=light]_&]:opacity-0" aria-hidden />
      <Moon className="absolute h-4 w-4 scale-0 opacity-0 transition-all duration-300 [[data-theme=light]_&]:scale-100 [[data-theme=light]_&]:opacity-100" aria-hidden />
    </button>
  );
}
