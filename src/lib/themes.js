export const themeMap = {
  aurora: {
    name: "Aurora Grid",
    preview: "Clean dark grid with warm accent",
    pageClass: "theme-grid"
  },
  wave: {
    name: "Ocean Wave",
    preview: "Blue neon gradients",
    pageClass: "theme-wave"
  },
  sunrise: {
    name: "Sats Sunrise",
    preview: "Amber highlights over warm dusk",
    pageClass: "theme-sunrise"
  },
  terminal: {
    name: "Terminal",
    preview: "Green hacker aesthetic",
    pageClass: "theme-terminal"
  }
};

export const themeOptions = Object.entries(themeMap).map(([value, theme]) => ({
  value,
  ...theme
}));
