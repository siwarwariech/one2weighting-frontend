// src/components/ToggleTheme.tsx
export default function ToggleTheme() {
  return (
    <button
      onClick={() => document.documentElement.classList.toggle("dark")}
      className="btn w-10 h-10 p-0 rounded-full bg-surface2"
      title="Toggle dark mode"
    >
      🌙
    </button>
  );
}
