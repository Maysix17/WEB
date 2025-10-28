import { Button } from "@heroui/react";
import type { ButtonProps } from "../../types/Boton.type";

const CustomButton: React.FC<ButtonProps> = ({
    label,
    text,
    children,
    icon,
    tooltip,
    onClick,
    disabled = false,
    color = "primary",
    variant = "solid",
    type = "button",
    className = "",
    ariaLabel,
    size = "md",
    ...props
}) => {
    // Determine the button content
    const buttonContent = label || text || children || icon;

    // Base styles for all variants
    const baseClass = `
        font-semibold
        transition-all duration-200 ease-in-out
        focus:outline-none
        disabled:opacity-50 disabled:cursor-not-allowed
        active:scale-95
    `;

    // Size-specific styles
    const sizeStyles = {
        sm: "px-3 py-2 text-sm rounded-lg",
        md: "px-4 py-2 text-base rounded-lg",
        lg: "px-6 py-3 text-lg rounded-xl"
    };

    // Variant-specific styles
    const variantStyles: Record<string, Record<string, string>> = {
        solid: {
            primary: "bg-primary-500 hover:bg-primary-600 text-white shadow-md hover:shadow-lg focus:ring-primary-500",
            secondary: "bg-gray-600 hover:bg-gray-700 text-white shadow-md hover:shadow-lg focus:ring-gray-500",
            danger: "bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg focus:ring-red-500",
            ghost: "bg-transparent hover:bg-gray-100 text-muted-600 focus:ring-primary-500"
        },
        bordered: {
            primary: "border border-primary-500 text-primary-600 hover:bg-primary-50 focus:ring-primary-500",
            secondary: "border border-gray-300 text-muted-600 hover:bg-gray-50 focus:ring-primary-500",
            danger: "border border-red-500 text-red-600 hover:bg-red-50 focus:ring-red-500",
            ghost: "border border-transparent text-muted-600 hover:bg-gray-100 focus:ring-primary-500"
        },
        light: {
            primary: "bg-primary-100 hover:bg-primary-200 text-primary-700 focus:ring-primary-500",
            secondary: "bg-gray-100 hover:bg-gray-200 text-gray-700 focus:ring-gray-500",
            danger: "bg-red-100 hover:bg-red-200 text-red-700 focus:ring-red-500",
            ghost: "bg-transparent hover:bg-gray-100 text-muted-600 focus:ring-primary-500"
        }
    };

    const currentVariantStyles = variantStyles[variant] || variantStyles.solid;
    const currentColorStyles = currentVariantStyles[color] || currentVariantStyles.primary;

    const buttonElement = (
        <Button
            color={color as any}
            variant={variant}
            size={size}
            type={type}
            disabled={disabled}
            onClick={onClick}
            className={`${baseClass} ${sizeStyles[size]} ${currentColorStyles} ${className}`}
            aria-label={ariaLabel || tooltip}
            {...props}
        >
            <span className="flex items-center justify-center gap-2">
                {buttonContent}
            </span>
        </Button>
    );

    if (tooltip) {
        return (
            <div className="relative group">
                {buttonElement}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-tooltip whitespace-nowrap">
                    {tooltip}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                </div>
            </div>
        );
    }

    return buttonElement;
};

export default CustomButton;
