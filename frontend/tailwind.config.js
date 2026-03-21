export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        surface: { DEFAULT: "#0f1117", card: "#161b27", border: "#1e2535" },
        accent: { blue: "#3b82f6", purple: "#8b5cf6", teal: "#14b8a6", amber: "#f59e0b", red: "#ef4444", green: "#22c55e" }
      }
    }
  }
}
