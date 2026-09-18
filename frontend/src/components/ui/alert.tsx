import * as React from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "info" | "warning" | "destructive" | "success";
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "info", children, ...props }, ref) => {
    const variantStyles = {
      info: "bg-blue-950/40 text-blue-300 border-blue-800/60",
      warning: "bg-amber-950/40 text-amber-300 border-amber-800/60",
      destructive: "bg-rose-950/40 text-rose-300 border-rose-800/60",
      success: "bg-emerald-950/40 text-emerald-300 border-emerald-800/60",
    };

    const icons = {
      info: <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />,
      warning: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />,
      destructive: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />,
      success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />,
    };

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          "relative flex items-start gap-3 rounded-lg border p-4 text-xs leading-relaxed",
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {icons[variant]}
        <div className="flex-1 space-y-1">{children}</div>
      </div>
    );
  }
);
Alert.displayName = "Alert";

export const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h5 ref={ref} className={cn("font-medium leading-none tracking-tight text-sm", className)} {...props} />
  )
);
AlertTitle.displayName = "AlertTitle";

export const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-xs opacity-90 leading-relaxed", className)} {...props} />
));
AlertDescription.displayName = "AlertDescription";
