export default function Button({
    children,
    variant = "primary",
    size = "md",
    className = "",
    disabled = false,
    ...props
}) {
    const baseStyles =
        "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

    const variants = {
        primary:
            "bg-[rgb(var(--color-primary))] text-white hover:bg-[rgb(var(--color-primary-dark))] focus:ring-[rgb(var(--color-primary))] shadow-sm hover:shadow-md",
        secondary:
            "bg-[rgb(var(--color-surface))] text-[rgb(var(--color-text-primary))] border border-[rgb(var(--color-border))] hover:bg-[rgb(var(--color-background))] focus:ring-[rgb(var(--color-primary))]",
        danger: "bg-[rgb(var(--color-error))] text-white hover:bg-red-600 focus:ring-[rgb(var(--color-error))] shadow-sm hover:shadow-md",
        ghost: "text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-background))] hover:text-[rgb(var(--color-text-primary))]",
    };

    const sizes = {
        sm: "px-3 py-1.5 text-sm rounded-[var(--radius-sm)]",
        md: "px-4 py-2 text-base rounded-[var(--radius-md)]",
        lg: "px-5 py-2.5 text-lg rounded-[var(--radius-lg)]",
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
}
