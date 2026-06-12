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
          bg: '#131314', // Main background
          surface: '#1E1F20', // Sidebar / Cards
          hover: '#28292A', // Hover states
          green: '#44C961', // Primary Green Accent
          'green-dark': '#35A04D',
          text: '#E3E3E3',
          'text-secondary': '#A8A8A8',
        }
      }
    },
  },
  plugins: [],
};
