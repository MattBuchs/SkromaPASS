export default function Input({
    label,
    error,
    icon: Icon,
    className = "",
    containerClassName = "",
    ...props
}) {
    return (
        <div className={`${containerClassName}`}>
            {label && (
                <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                    {label}
                </label>
            )}
            <div className="relative">
                {Icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Icon className="h-5 w-5 text-[rgb(var(--color-text-tertiary))]" />
                    </div>
                )}
                <input
                    className={`block w-full rounded-[var(--radius-md)] border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] px-4 py-2.5 text-[rgb(var(--color-text-primary))] placeholder:text-[rgb(var(--color-text-tertiary))] focus:border-[rgb(var(--color-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))] focus:ring-opacity-20 transition-all duration-200 ${
                        Icon ? "pl-10" : ""
                    } ${
                        error ? "border-[rgb(var(--color-error))]" : ""
                    } ${className}`}
                    {...props}
                />
            </div>
            {error && (
                <p className="mt-1 text-sm text-[rgb(var(--color-error))]">
                    {error}
                </p>
            )}
        </div>
    );
}
