type ThemeToggleProps = {
  theme: "light" | "dark";
  onToggle: () => void;
};

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/20"
    >
      <span className="text-base">{theme === "dark" ? "☀" : "◐"}</span>
      {theme === "dark" ? "Modo claro" : "Modo oscuro"}
    </button>
  );
}
