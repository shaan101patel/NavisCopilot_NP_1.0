import { clsx } from "clsx";

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  color?: "default" | "success" | "warning" | "danger";
}

export function Progress({ value, max = 100, className, color = "default" }: ProgressProps) {
  const percentage = Math.min((value / max) * 100, 100);
  
  const colorClasses = {
    default: "bg-primary",
    success: "bg-green-500",
    warning: "bg-yellow-500",
    danger: "bg-red-500",
  };

  return (
    <div className={clsx("w-full bg-secondary rounded-full h-2", className)}>
      <div 
        className={clsx("h-2 rounded-full transition-all duration-300", colorClasses[color])}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
