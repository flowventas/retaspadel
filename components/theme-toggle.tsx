type ThemeToggleProps = {
  theme: "light" | "dark";
  onToggle: () => void;
};

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/20 sm:w-auto"
    >
      <span className="text-base">{theme === "dark" ? "☀" : "◐"}</span>
      <span className="sm:hidden">{theme === "dark" ? "Claro" : "Oscuro"}</span>
      <span className="hidden sm:inline">{theme === "dark" ? "Modo claro" : "Modo oscuro"}</span>
    </button>
  );
}
