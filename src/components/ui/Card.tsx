import React from "react";

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={[
        "rounded-[28px] border border-slate-200/80 bg-white",
        "shadow-[0_1px_0_rgba(0,0,0,0.04),0_8px_24px_rgba(15,23,42,0.06)]",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, description }: { title: React.ReactNode; description?: React.ReactNode }) {
  return (
    <div className="px-6 pt-6">
      <div className="text-2xl font-semibold flex items-center">{title}</div>
      {description && <div className="text-sm text-slate-500 mt-2">{description}</div>}
    </div>
  );
}

export function CardBody({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={["p-6", className].join(" ")}>{children}</div>;
}
