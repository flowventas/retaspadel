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
      className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-xl font-bold text-[var(--hero-text)] transition hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] hover:shadow-[0_0_24px_rgba(57,255,20,0.2)]"
    >
      <span aria-hidden="true">{theme === "dark" ? "☀" : "◐"}</span>
    </button>
  );
}
