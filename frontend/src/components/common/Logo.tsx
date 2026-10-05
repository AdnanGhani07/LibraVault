import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showTagline?: boolean;
  href?: string;
  variant?: "full" | "mark";
}

const sizeMap = {
  sm: { icon: "w-7 h-7", text: "text-lg", badge: "text-[9px] px-1.5 py-0.2" },
  md: { icon: "w-9 h-9", text: "text-xl", badge: "text-[10px] px-2 py-0.5" },
  lg: { icon: "w-12 h-12", text: "text-2xl", badge: "text-[11px] px-2.5 py-0.5" },
  xl: { icon: "w-16 h-16", text: "text-3xl", badge: "text-xs px-3 py-1" },
};

export function LogoMark({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" | "xl" }) {
  const currentSize = sizeMap[size];

  return (
    <div
      className={cn(
        "relative rounded-xl flex items-center justify-center p-0.5 overflow-hidden transition-all duration-300 group-hover:scale-105 shadow-lg shadow-indigo-500/20",
        currentSize.icon,
        className
      )}
    >
      {/* Dynamic Animated Vector Mark */}
      <svg viewBox="0 0 64 64" fill="none" className="w-full h-full drop-shadow-md">
        <defs>
          <linearGradient id="comp-lv-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#1E1B4B" />
            <stop offset="50%" stop-color="#0F172A" />
            <stop offset="100%" stop-color="#020617" />
          </linearGradient>
          <linearGradient id="comp-lv-prim" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#6366F1" />
            <stop offset="50%" stop-color="#8B5CF6" />
            <stop offset="100%" stop-color="#06B6D4" />
          </linearGradient>
          <linearGradient id="comp-lv-wl" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#6366F1" />
            <stop offset="50%" stop-color="#4F46E5" />
            <stop offset="100%" stop-color="#312E81" />
          </linearGradient>
          <linearGradient id="comp-lv-wr" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#A855F7" />
            <stop offset="50%" stop-color="#8B5CF6" />
            <stop offset="100%" stop-color="#4C1D95" />
          </linearGradient>
          <linearGradient id="comp-lv-border" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#818CF8" stop-opacity="0.8" />
            <stop offset="50%" stop-color="#C084FC" stop-opacity="0.4" />
            <stop offset="100%" stop-color="#38BDF8" stop-opacity="0.6" />
          </linearGradient>
        </defs>

        {/* Base Frame */}
        <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#comp-lv-bg)" stroke="url(#comp-lv-border)" stroke-width="2" />

        {/* Inner Symbol */}
        <g transform="translate(0, 1)">
          {/* Left Leaf */}
          <path d="M32 20C24 20 16 25 14 36C19 33 26 33 32 37V20Z" fill="url(#comp-lv-wl)" />
          <path d="M32 20C24 20 16 25 14 36C19 33 26 33 32 37" stroke="#818CF8" stroke-width="1.2" stroke-linecap="round" />

          {/* Right Leaf */}
          <path d="M32 20C40 20 48 25 50 36C45 33 38 33 32 37V20Z" fill="url(#comp-lv-wr)" />
          <path d="M32 20C40 20 48 25 50 36C45 33 38 33 32 37" stroke="#C084FC" stroke-width="1.2" stroke-linecap="round" />

          {/* Keystone V-Base */}
          <path d="M20 42L32 49L44 42L32 45L20 42Z" fill="#4338CA" stroke="#6366F1" stroke-width="1" />

          {/* Scales Horizon */}
          <line x1="17" y1="21" x2="47" y2="21" stroke="#38BDF8" stroke-width="1.5" stroke-linecap="round" opacity="0.8" />
          <circle cx="17" cy="21" r="2" fill="#38BDF8" />
          <circle cx="47" cy="21" r="2" fill="#A855F7" />

          {/* Center Diamond Spark */}
          <path d="M32 9L36 17L32 25L28 17Z" fill="url(#comp-lv-prim)" />
          <path d="M32 11L35 17L32 23L29 17Z" fill="#FFFFFF" fill-opacity="0.9" />
          <circle cx="32" cy="17" r="1.5" fill="#38BDF8" />
        </g>
      </svg>
    </div>
  );
}

export function Logo({
  className,
  size = "md",
  showTagline = true,
  href = "/",
  variant = "full",
}: LogoProps) {
  const currentSize = sizeMap[size];

  const content = (
    <div className={cn("flex items-center gap-3 group select-none cursor-pointer", className)}>
      <LogoMark size={size} />

      {variant === "full" && (
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent group-hover:to-white transition-all",
              currentSize.text
            )}
          >
            Libra<span className="text-indigo-400">Vault</span>
          </span>

          {showTagline && (
            <span
              className={cn(
                "hidden sm:inline-block font-semibold uppercase tracking-wider bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 rounded-full",
                currentSize.badge
              )}
            >
              Research Hub
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return <Link href={href} className="inline-block focus:outline-none">{content}</Link>;
  }

  return content;
}
