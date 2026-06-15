module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gemini: {
          bg: '#041B18', // Deep, muted dark teal base
          surface: '#072C27', // Sidebar / Cards teal fill
          hover: '#0A3F38', // Hover states
          green: '#46DBA5', // Vibrant green logo highlight accent
          'green-dark': '#38b286',
          text: '#E3E3E3',
          'text-secondary': '#8ba29d', // Muted secondary teal text
        }
      }
    },
  },
  plugins: [],
};
