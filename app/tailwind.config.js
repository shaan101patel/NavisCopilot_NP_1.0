/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#77c7ecff", // Blue accent (Tailwind blue-600)
        background: "#f9fafb", // Light gray background
        foreground: "#111827", // Almost black for text
        muted: "#e5e7eb", // Tailwind gray-200
        border: "#d1d5db", // Tailwind gray-300
        card: "#ffffff", // White for cards and surfaces
        // Additional semantic colors for Navis
        success: "#10b981", // Green for success states
        warning: "#f59e0b", // Orange for warnings
        error: "#ef4444", // Red for errors
        secondary: "#6b7280", // Gray for secondary text
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        heading: ['Poppins', 'sans-serif'],
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
      boxShadow: {
        'nav': '0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 2px 4px -1px rgba(0, 0, 0, 0.10)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
}
