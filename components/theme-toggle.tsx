type ThemeToggleProps = {
  theme: "light" | "dark";
  onToggle: () => void;
};

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={theme === "dark" ? "Activar modo claro" : "Activar modo oscuro"}
      title={theme === "dark" ? "Modo claro" : "Modo oscuro"}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface-strong)] text-lg font-semibold text-[var(--app-text)] shadow-[0_10px_30px_-20px_rgba(15,23,42,0.55)] transition hover:border-[var(--brand-primary)] hover:bg-[var(--surface-soft)] hover:text-[var(--brand-primary)]"
    >
      <span aria-hidden="true">{theme === "dark" ? "☀" : "◐"}</span>
    </button>
  );
}
