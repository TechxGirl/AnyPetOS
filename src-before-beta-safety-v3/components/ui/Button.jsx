import { forwardRef } from "react";

const Button = forwardRef(function Button(
  {
    children,
    variant = "primary",
    size = "md",
    loading = false,
    fullWidth = false,
    className = "",
    disabled,
    type = "button",
    leftIcon,
    rightIcon,
    ...props
  },
  ref
) {
  const classes = [
    "ui-button",
    `ui-button--${variant}`,
    `ui-button--${size}`,
    fullWidth ? "ui-button--full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      ref={ref}
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <span className="ui-button__spinner" aria-hidden="true" />}
      <span className="ui-button__content">
        {!loading && leftIcon}
        <span>{children}</span>
        {!loading && rightIcon}
      </span>
    </button>
  );
});

export default Button;
