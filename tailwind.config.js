module.exports = {
  content: [
    "./index.html",
    "./design.html",
    "./grimm-reader.jsx",
    "./main.jsx",
    "./features.jsx",
    "./design/**/*.{jsx,js}",
    "./src/**/*.{jsx,js}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Georgia', 'serif'],
      }
    },
  },
  plugins: [],
};
