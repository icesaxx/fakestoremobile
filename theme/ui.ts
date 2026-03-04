export const ui = {
  pageHorizontal: 16,
  pageTop: 12,
  fontFamily: "System",
};

export const typography = {
  title: {
    fontFamily: ui.fontFamily,
    fontSize: 30,
    fontWeight: "800" as const,
  },
  subtitle: {
    fontFamily: ui.fontFamily,
    fontSize: 14,
    color: "#6b7280",
  },
  body: {
    fontFamily: ui.fontFamily,
    fontSize: 15,
  },
  caption: {
    fontFamily: ui.fontFamily,
    fontSize: 12,
    color: "#6b7280",
  },
};
