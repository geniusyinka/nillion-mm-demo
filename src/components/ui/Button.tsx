import type { ButtonHTMLAttributes } from "react";

export function Button({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  const baseClasses =
    "w-full rounded-none border border-border font-medium bg-button-bg text-foreground cursor-pointer transition-all duration-150 text-center hover:border-border-hover hover:bg-button-hover hover:shadow-[0_0_12px_rgba(180,190,254,0.2)] hover:scale-[1.02] active:scale-[0.98] active:shadow-none disabled:border-border disabled:bg-button-disabled-bg disabled:text-button-disabled-text disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none";

  // A simple way to merge classes without a helper library.
  const finalClassName = [baseClasses, className].filter(Boolean).join(" ");
  return <button className={finalClassName} {...props} />;
}
