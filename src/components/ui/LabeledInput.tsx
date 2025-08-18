import React from "react";
export function LabeledInput(
  props: React.InputHTMLAttributes<HTMLInputElement> & { label: string; id?: string }
) {
  const { label, id, className = "", ...rest } = props;
  return (
    <div className="space-y-2 mt-2">
      <label htmlFor={id} className="text-sm">{label}</label>
      <input
        id={id}
        {...rest}
        className={[
          "w-full rounded-2xl border border-slate-200 bg-white",
          "px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900",
          className,
        ].join(" ")}
      />
    </div>
  );
}
