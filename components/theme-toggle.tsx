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
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-lg font-semibold text-slate-100 transition hover:bg-white/20"
    >
      <span aria-hidden="true">{theme === "dark" ? "☀" : "◐"}</span>
    </button>
  );
}
