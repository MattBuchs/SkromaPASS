export default function Card({
    children,
    className = "",
    hover = false,
    padding = true,
    ...props
}) {
    const baseStyles =
        "bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-[var(--radius-lg)] transition-all duration-200";
    const hoverStyles = hover
        ? "hover:shadow-lg hover:border-[rgb(var(--color-border-hover))] cursor-pointer"
        : "shadow-sm";
    const paddingStyles = padding ? "p-6" : "";

    return (
        <div
            className={`${baseStyles} ${hoverStyles} ${paddingStyles} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}
