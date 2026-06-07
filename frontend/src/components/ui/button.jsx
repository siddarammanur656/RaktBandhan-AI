import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center font-semibold transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] outline-none select-none disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-brand-gradient text-white shadow-sm hover:shadow-brand hover:scale-[1.02] hover:brightness-110 active:scale-[0.98] after:absolute after:inset-0 after:-translate-x-full hover:after:translate-x-full after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent after:transition-transform after:duration-500 after:ease-in-out",
        secondary: "bg-white border border-border text-foreground shadow-sm hover:bg-secondary hover:border-gray-300 hover:scale-[1.02] active:scale-[0.98]",
        outline: "border border-border bg-transparent hover:bg-secondary hover:text-foreground active:scale-[0.98]",
        ghost: "bg-transparent text-muted-foreground hover:bg-secondary hover:text-foreground active:scale-[0.98]",
        destructive: "bg-destructive/10 text-destructive hover:bg-destructive/20 active:scale-[0.98]",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "px-5 py-2.5 rounded-xl text-base",
        sm: "px-4 py-2 rounded-lg text-sm",
        lg: "px-8 py-3.5 rounded-xl text-lg",
        icon: "h-10 w-10 rounded-xl [&_svg]:size-5",
        "icon-sm": "h-8 w-8 rounded-lg [&_svg]:size-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props} />
  );
}

export { Button, buttonVariants }
