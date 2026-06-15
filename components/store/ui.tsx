"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/cn";

type Variant =
  | "primary"
  | "green"
  | "light"
  | "outline"
  | "outlineLight"
  | "ghost";
type Size = "sm" | "md" | "lg";

const base =
  "group/btn relative inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-tight transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent focus-visible:ring-ocean-500/50 disabled:pointer-events-none disabled:opacity-50";

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-[13px]",
  md: "h-11 px-6 text-[14px]",
  lg: "h-13 px-8 text-[15px] py-[14px]",
};

const variants: Record<Variant, string> = {
  primary: "bg-ocean-500 text-white hover:bg-ocean-600 shadow-[0_8px_20px_-6px_rgba(10,100,227,0.45)]",
  green: "bg-leaf-500 text-white hover:bg-leaf-600 shadow-[0_8px_20px_-6px_rgba(0,181,98,0.45)] font-semibold",
  light: "bg-white text-ink border border-line hover:bg-cream-100 shadow-[0_4px_12px_-4px_rgba(0,0,0,0.05)]",
  outline: "border border-ink/15 text-ink hover:border-ink/40 hover:bg-ink/[0.03]",
  outlineLight:
    "border border-white/35 text-white backdrop-blur-sm hover:bg-white hover:text-ocean-500",
  ghost: "text-ink hover:bg-ink/[0.05]",
};

type ButtonProps = {
  variant?: Variant;
  size?: Size;
  href?: string;
  className?: string;
  children: ReactNode;
  arrow?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  variant = "primary",
  size = "md",
  href,
  className,
  children,
  arrow = false,
  ...rest
}: ButtonProps) {
  const cls = cn(base, sizes[size], variants[variant], className);
  const inner = (
    <>
      {children}
      {arrow && (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/btn:translate-x-0.5"
        >
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      )}
    </>
  );
  if (href) {
    return (
      <a href={href} className={cls}>
        {inner}
      </a>
    );
  }
  return (
    <button className={cls} {...rest}>
      {inner}
    </button>
  );
}

export function Eyebrow({
  children,
  className,
  tone = "leaf",
}: {
  children: ReactNode;
  className?: string;
  tone?: "leaf" | "ocean" | "cream";
}) {
  const dot =
    tone === "leaf" ? "bg-leaf-500" : tone === "ocean" ? "bg-ocean-500" : "bg-cream-100";
  const text =
    tone === "cream"
      ? "text-cream-100/80"
      : tone === "ocean"
      ? "text-ocean-500"
      : "text-leaf-500";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.28em]",
        text,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dot)} />
      {children}
    </span>
  );
}

export function Badge({
  children,
  className,
  tone = "ocean",
}: {
  children: ReactNode;
  className?: string;
  tone?: "ocean" | "leaf" | "ink" | "cream";
}) {
  const tones = {
    ocean: "bg-ocean-50 text-ocean-600 border border-ocean-100",
    leaf: "bg-leaf-50 text-leaf-500 border border-leaf-100",
    ink: "bg-ink text-white",
    cream: "bg-white/90 text-ocean-900 backdrop-blur border border-line",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
