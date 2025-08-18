import React from "react";

export function Button({
  children, onClick, className = "", variant = "solid",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: "solid" | "outline";
}) {
  const base = "rounded-full px-4 py-2 text-sm transition";
  const style =
    variant === "outline"
      ? "bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
      : "bg-slate-900 text-white hover:bg-slate-800 shadow-[0_1px_0_rgba(0,0,0,0.05)]";
  return (
    <button onClick={onClick} className={[base, style, className].join(" ")}>
      {children}
    </button>
  );
}
