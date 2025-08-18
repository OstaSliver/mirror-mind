import React from "react";
export function IconButton({ children, onClick, ariaLabel }: { children: React.ReactNode; onClick?: () => void; ariaLabel: string }) {
  return (
    <button
      aria-label={ariaLabel}
      onClick={onClick}
      className="size-9 rounded-2xl ring-1 ring-slate-200 grid place-items-center hover:bg-slate-50"
    >
      {children}
    </button>
  );
}
