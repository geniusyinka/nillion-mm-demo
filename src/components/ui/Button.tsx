import type { ButtonHTMLAttributes } from "react";

export function Button({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  const baseClasses =
    "w-full rounded-none border border-border font-medium bg-button-bg text-foreground cursor-pointer transition-all duration-100 text-center hover:border-border-hover hover:bg-button-hover disabled:border-border disabled:bg-button-disabled-bg disabled:text-button-disabled-text disabled:cursor-not-allowed";

  // A simple way to merge classes without a helper library.
  const finalClassName = [baseClasses, className].filter(Boolean).join(" ");
  return <button className={finalClassName} {...props} />;
}
