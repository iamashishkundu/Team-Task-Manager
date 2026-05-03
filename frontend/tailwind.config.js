/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        slate: "#1f2937",
        cloud: "#f8fafc",
        mist: "#eef2f6",
        brand: "#0f766e",
        accent: "#f97316"
      }
    }
  },
  plugins: []
};
