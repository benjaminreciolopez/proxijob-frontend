import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "error" | "warning" | "info";
  className?: string;
}

const variantClasses = {
  default: "bg-grey-100 text-grey-700",
  success: "bg-success-light text-green-800",
  error: "bg-error-light text-red-800",
  warning: "bg-warning-light text-yellow-800",
  info: "bg-primary-light text-blue-800",
};

const Badge: React.FC<BadgeProps> = ({ children, variant = "default", className = "" }) => {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
