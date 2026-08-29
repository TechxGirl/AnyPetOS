import { useTheme } from "../../context/ThemeContextCore";
import { THEMES } from "../../utils/theme";
import Icon from "./Icon";

const OPTIONS = [
  {
    value: THEMES.LIGHT,
    label: "Light",
    description: "Bright surfaces with dark text",
    icon: "sun",
  },
  {
    value: THEMES.DARK,
    label: "Dark",
    description: "Low-light workspace with softer contrast",
    icon: "moon",
  },
];

export default function ThemeSelector({ className = "" }) {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className={["ui-theme-selector", className].filter(Boolean).join(" ")}
      role="group"
      aria-label="Color theme"
    >
      {OPTIONS.map((option) => {
        const selected = theme === option.value;

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            className={[
              "ui-theme-selector__option",
              selected ? "is-selected" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => setTheme(option.value)}
          >
            <span
              className={`ui-theme-selector__preview ui-theme-selector__preview--${option.value}`}
              aria-hidden="true"
            >
              <span className="ui-theme-selector__preview-sidebar" />
              <span className="ui-theme-selector__preview-content">
                <span />
                <span />
              </span>
            </span>

            <span className="ui-theme-selector__copy">
              <span className="ui-theme-selector__title">
                <Icon name={option.icon} size={18} />
                {option.label}
              </span>
              <span className="ui-theme-selector__description">
                {option.description}
              </span>
            </span>

            <span className="ui-theme-selector__check" aria-hidden="true">
              {selected && <Icon name="check" size={16} />}
            </span>
          </button>
        );
      })}
    </div>
  );
}
