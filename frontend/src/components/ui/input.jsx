import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({
  className,
  type,
  ...props
}) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded-xl border border-border bg-white px-4 py-2 text-base transition-all duration-150 ease-in-out outline-none file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#A1A1AA] focus-visible:border-brand-600 focus-visible:ring-4 focus-visible:ring-brand-100 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props} />
  );
}

export { Input }
