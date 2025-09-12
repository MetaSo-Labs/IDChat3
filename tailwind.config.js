/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{tsx,js,ts}"],
  theme: {
    extend: {
      colors: {
        "black-primary": "#141416",
        "black-secondary": "#303133",
        "gray-primary": "#909399",
        "gray-line": "#BFC2CC",
        "gray-soft": "#EDEFF2",
        "gray-secondary": "#F5F7F9",
        "gray-light": "#F5F7FA",
        "teal-primary": "#72F5F6",
        "blue-primary": "#171AFF",
        "blue-light": "#F3F3FF",
        "btn-blue": "#1E2BFF",
        "orange-primary": "#FF8F1F",
        "slate-light": "#606266",
        "red-primary": "#FA5151",
        "green-success": "#00B578",
      },
      fontSize: {
        ss: ["0.8125rem", "1.125rem"],
      },
      width: {
        4.5: '1.125rem',
        7.5: '1.875rem',
        15: '3.75rem',
        22.5: '5.625rem',
        30: '7.5rem',
        32.5: '8.125rem',
        61.5: '15.375rem',
        82: '20.5rem',
      },
    },
  },
  plugins: [],
};
