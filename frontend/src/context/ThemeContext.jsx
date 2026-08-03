import React, { createContext, useContext, useState, useEffect } from "react";

export const BUILTIN_THEMES = [
  {
    id: "beereddy-executive",
    name: "Beereddy Executive",
    desc: "Deep Navy, Royal Blue & Executive White",
    mode: "light",
    primary: "#0f172a",
    secondary: "#1e3a8a",
    accent: "#2563eb",
    bg: "#f8fafc",
    sidebarBg: "#0f172a",
    sidebarText: "#f8fafc",
    cardBg: "#ffffff",
    navbarBg: "#ffffff",
    textColor: "#0f172a",
    borderRadius: "12px",
  },
  {
    id: "ocean-serenity",
    name: "Ocean Serenity",
    desc: "Soft Ocean Blue & Turquoise Minimal",
    mode: "light",
    primary: "#0284c7",
    secondary: "#0369a1",
    accent: "#06b6d4",
    bg: "#f0f9ff",
    sidebarBg: "#0c4a6e",
    sidebarText: "#f0f9ff",
    cardBg: "#ffffff",
    navbarBg: "#ffffff",
    textColor: "#0f172a",
    borderRadius: "14px",
  },
  {
    id: "mountain-mist",
    name: "Mountain Mist",
    desc: "White, Slate & Blue Accents",
    mode: "light",
    primary: "#475569",
    secondary: "#334155",
    accent: "#3b82f6",
    bg: "#f1f5f9",
    sidebarBg: "#1e293b",
    sidebarText: "#f8fafc",
    cardBg: "#ffffff",
    navbarBg: "#ffffff",
    textColor: "#0f172a",
    borderRadius: "12px",
  },
  {
    id: "forest-harmony",
    name: "Forest Harmony",
    desc: "Forest Green, Olive & Cream Natural",
    mode: "light",
    primary: "#14532d",
    secondary: "#166534",
    accent: "#84cc16",
    bg: "#f7fee7",
    sidebarBg: "#14532d",
    sidebarText: "#f7fee7",
    cardBg: "#ffffff",
    navbarBg: "#ffffff",
    textColor: "#14532d",
    borderRadius: "16px",
  },
  {
    id: "emerald-executive",
    name: "Emerald Executive",
    desc: "Emerald, Dark Green & Luxury Office",
    mode: "light",
    primary: "#065f46",
    secondary: "#047857",
    accent: "#10b981",
    bg: "#ecfdf5",
    sidebarBg: "#064e3b",
    sidebarText: "#ecfdf5",
    cardBg: "#ffffff",
    navbarBg: "#ffffff",
    textColor: "#064e3b",
    borderRadius: "12px",
  },
  {
    id: "royal-sapphire",
    name: "Royal Sapphire",
    desc: "Royal Blue & Executive Silver",
    mode: "light",
    primary: "#1d4ed8",
    secondary: "#1e40af",
    accent: "#60a5fa",
    bg: "#eff6ff",
    sidebarBg: "#172554",
    sidebarText: "#eff6ff",
    cardBg: "#ffffff",
    navbarBg: "#ffffff",
    textColor: "#0f172a",
    borderRadius: "12px",
  },
  {
    id: "pearl-white",
    name: "Pearl White",
    desc: "Pure White, Soft Grey & Glass UI",
    mode: "light",
    primary: "#64748b",
    secondary: "#475569",
    accent: "#0ea5e9",
    bg: "#ffffff",
    sidebarBg: "#f8fafc",
    sidebarText: "#0f172a",
    cardBg: "rgba(255,255,255,0.9)",
    navbarBg: "#ffffff",
    textColor: "#0f172a",
    borderRadius: "16px",
  },
  {
    id: "graphite-business",
    name: "Graphite Business",
    desc: "Dark Grey & Silver Corporate",
    mode: "dark",
    primary: "#334155",
    secondary: "#1e293b",
    accent: "#38bdf8",
    bg: "#0f172a",
    sidebarBg: "#1e293b",
    sidebarText: "#f8fafc",
    cardBg: "#1e293b",
    navbarBg: "#1e293b",
    textColor: "#f8fafc",
    borderRadius: "10px",
  },
  {
    id: "midnight-professional",
    name: "Midnight Professional",
    desc: "Deep OLED Black & Blue Glass",
    mode: "dark",
    primary: "#000000",
    secondary: "#0f172a",
    accent: "#3b82f6",
    bg: "#000000",
    sidebarBg: "#090d16",
    sidebarText: "#f8fafc",
    cardBg: "rgba(15, 23, 42, 0.8)",
    navbarBg: "rgba(15, 23, 42, 0.9)",
    textColor: "#f8fafc",
    borderRadius: "16px",
  },
  {
    id: "ivory-workspace",
    name: "Ivory Workspace",
    desc: "Warm White, Beige & Paper Texture",
    mode: "light",
    primary: "#78350f",
    secondary: "#92400e",
    accent: "#d97706",
    bg: "#fef3c7",
    sidebarBg: "#78350f",
    sidebarText: "#fef3c7",
    cardBg: "#fffbeb",
    navbarBg: "#fffbeb",
    textColor: "#451a03",
    borderRadius: "8px",
  },
  {
    id: "aurora-glass",
    name: "Aurora Glass",
    desc: "Glassmorphism, Gradient & Floating Cards",
    mode: "dark",
    primary: "#6366f1",
    secondary: "#4f46e5",
    accent: "#ec4899",
    bg: "linear-gradient(135deg, #0f172a 0%, #312e81 100%)",
    sidebarBg: "rgba(15, 23, 42, 0.75)",
    sidebarText: "#ffffff",
    cardBg: "rgba(255, 255, 255, 0.12)",
    navbarBg: "rgba(15, 23, 42, 0.75)",
    textColor: "#ffffff",
    borderRadius: "20px",
  },
  {
    id: "northern-lights",
    name: "Northern Lights",
    desc: "Purple, Blue, Cyan & Soft Glow",
    mode: "dark",
    primary: "#7e22ce",
    secondary: "#6b21a8",
    accent: "#06b6d4",
    bg: "#0b0f19",
    sidebarBg: "#131927",
    sidebarText: "#e2e8f0",
    cardBg: "#1a2234",
    navbarBg: "#131927",
    textColor: "#f1f5f9",
    borderRadius: "16px",
  },
  {
    id: "sunrise-office",
    name: "Sunrise Office",
    desc: "Warm Orange, Cream & Morning Glow",
    mode: "light",
    primary: "#c2410c",
    secondary: "#ea580c",
    accent: "#f97316",
    bg: "#fff7ed",
    sidebarBg: "#7c2d12",
    sidebarText: "#fff7ed",
    cardBg: "#ffffff",
    navbarBg: "#ffffff",
    textColor: "#431407",
    borderRadius: "14px",
  },
  {
    id: "evening-breeze",
    name: "Evening Breeze",
    desc: "Deep Blue, Purple & Relaxing Tone",
    mode: "dark",
    primary: "#312e81",
    secondary: "#3730a3",
    accent: "#818cf8",
    bg: "#1e1b4b",
    sidebarBg: "#17153b",
    sidebarText: "#e0e7ff",
    cardBg: "#2e2a72",
    navbarBg: "#17153b",
    textColor: "#e0e7ff",
    borderRadius: "14px",
  },
  {
    id: "nordic-minimal",
    name: "Nordic Minimal",
    desc: "Scandinavian White, Grey & Clean Lines",
    mode: "light",
    primary: "#334155",
    secondary: "#475569",
    accent: "#2563eb",
    bg: "#fafafa",
    sidebarBg: "#ffffff",
    sidebarText: "#0f172a",
    cardBg: "#ffffff",
    navbarBg: "#ffffff",
    textColor: "#0f172a",
    borderRadius: "6px",
  },
  {
    id: "sandstone-office",
    name: "Sandstone Office",
    desc: "Sand, Warm Brown & Earthy Elegance",
    mode: "light",
    primary: "#78350f",
    secondary: "#92400e",
    accent: "#b45309",
    bg: "#fef8f0",
    sidebarBg: "#451a03",
    sidebarText: "#fef8f0",
    cardBg: "#ffffff",
    navbarBg: "#ffffff",
    textColor: "#451a03",
    borderRadius: "12px",
  },
  {
    id: "cyber-executive",
    name: "Cyber Executive",
    desc: "Dark Navy, Electric Blue & Neon Accent",
    mode: "dark",
    primary: "#0f172a",
    secondary: "#1e293b",
    accent: "#00f0ff",
    bg: "#080d1a",
    sidebarBg: "#0f172a",
    sidebarText: "#00f0ff",
    cardBg: "#131d33",
    navbarBg: "#0f172a",
    textColor: "#e2e8f0",
    borderRadius: "10px",
  },
  {
    id: "royal-black-gold",
    name: "Royal Black Gold",
    desc: "Black & Luxury Gold Accents",
    mode: "dark",
    primary: "#000000",
    secondary: "#1c1917",
    accent: "#eab308",
    bg: "#0c0a09",
    sidebarBg: "#1c1917",
    sidebarText: "#fef08a",
    cardBg: "#1c1917",
    navbarBg: "#1c1917",
    textColor: "#fef08a",
    borderRadius: "12px",
  },
  {
    id: "lavender-calm",
    name: "Lavender Calm",
    desc: "Lavender, Light Purple & Stress-Free",
    mode: "light",
    primary: "#6b21a8",
    secondary: "#7e22ce",
    accent: "#a855f7",
    bg: "#faf5ff",
    sidebarBg: "#581c87",
    sidebarText: "#faf5ff",
    cardBg: "#ffffff",
    navbarBg: "#ffffff",
    textColor: "#3b0764",
    borderRadius: "16px",
  },
  {
    id: "zen-workspace",
    name: "Zen Workspace",
    desc: "Soft Sage Green & Peaceful Cream",
    mode: "light",
    primary: "#3f6212",
    secondary: "#4d7c0f",
    accent: "#65a30d",
    bg: "#f7fee7",
    sidebarBg: "#365314",
    sidebarText: "#f7fee7",
    cardBg: "#ffffff",
    navbarBg: "#ffffff",
    textColor: "#1a2e05",
    borderRadius: "14px",
  },
  {
    id: "rainy-day",
    name: "Rainy Day",
    desc: "Blue Grey, Cloud White & Relaxing Blue",
    mode: "light",
    primary: "#334155",
    secondary: "#475569",
    accent: "#64748b",
    bg: "#f1f5f9",
    sidebarBg: "#1e293b",
    sidebarText: "#f8fafc",
    cardBg: "#ffffff",
    navbarBg: "#ffffff",
    textColor: "#0f172a",
    borderRadius: "12px",
  },
  {
    id: "sky-office",
    name: "Sky Office",
    desc: "Sky Blue, White & Silver",
    mode: "light",
    primary: "#0369a1",
    secondary: "#0284c7",
    accent: "#38bdf8",
    bg: "#f0f9ff",
    sidebarBg: "#0c4a6e",
    sidebarText: "#f0f9ff",
    cardBg: "#ffffff",
    navbarBg: "#ffffff",
    textColor: "#0f172a",
    borderRadius: "14px",
  },
  {
    id: "arctic-frost",
    name: "Arctic Frost",
    desc: "Ice Blue, Crisp White & Modern Grey",
    mode: "light",
    primary: "#0284c7",
    secondary: "#0369a1",
    accent: "#38bdf8",
    bg: "#e0f2fe",
    sidebarBg: "#0369a1",
    sidebarText: "#ffffff",
    cardBg: "#ffffff",
    navbarBg: "#ffffff",
    textColor: "#0f172a",
    borderRadius: "16px",
  },
  {
    id: "carbon-fiber",
    name: "Carbon Fiber",
    desc: "Dark Carbon, Steel & Industrial Blue",
    mode: "dark",
    primary: "#18181b",
    secondary: "#27272a",
    accent: "#3b82f6",
    bg: "#09090b",
    sidebarBg: "#18181b",
    sidebarText: "#f4f4f5",
    cardBg: "#18181b",
    navbarBg: "#18181b",
    textColor: "#f4f4f5",
    borderRadius: "8px",
  },
  {
    id: "luxury-marble",
    name: "Luxury Marble",
    desc: "White Marble & Gold Executive Accents",
    mode: "light",
    primary: "#1c1917",
    secondary: "#292524",
    accent: "#d97706",
    bg: "#fafaf9",
    sidebarBg: "#1c1917",
    sidebarText: "#fef3c7",
    cardBg: "#ffffff",
    navbarBg: "#ffffff",
    textColor: "#1c1917",
    borderRadius: "14px",
  },
  {
    id: "deep-space",
    name: "Deep Space",
    desc: "Black, Indigo & Blue Cosmos",
    mode: "dark",
    primary: "#1e1b4b",
    secondary: "#312e81",
    accent: "#6366f1",
    bg: "#030712",
    sidebarBg: "#0b0f19",
    sidebarText: "#e0e7ff",
    cardBg: "#111827",
    navbarBg: "#0b0f19",
    textColor: "#f9fafb",
    borderRadius: "16px",
  },
  {
    id: "classic-corporate",
    name: "Classic Corporate",
    desc: "Traditional Blue & Grey ERP Look",
    mode: "light",
    primary: "#1e40af",
    secondary: "#1d4ed8",
    accent: "#3b82f6",
    bg: "#f3f4f6",
    sidebarBg: "#1e3a8a",
    sidebarText: "#ffffff",
    cardBg: "#ffffff",
    navbarBg: "#ffffff",
    textColor: "#111827",
    borderRadius: "6px",
  },
  {
    id: "apple-glass",
    name: "Apple Glass",
    desc: "Liquid Glass, Depth & Soft Transparency",
    mode: "light",
    primary: "#0f172a",
    secondary: "#1e293b",
    accent: "#007aff",
    bg: "#f2f2f7",
    sidebarBg: "rgba(255, 255, 255, 0.75)",
    sidebarText: "#1c1c1e",
    cardBg: "rgba(255, 255, 255, 0.85)",
    navbarBg: "rgba(255, 255, 255, 0.8)",
    textColor: "#1c1c1e",
    borderRadius: "18px",
  },
  {
    id: "material-you",
    name: "Material You",
    desc: "Adaptive, Dynamic Palette & Soft Rounded UI",
    mode: "light",
    primary: "#6750a4",
    secondary: "#625b71",
    accent: "#7d5260",
    bg: "#f6f2fa",
    sidebarBg: "#e8def8",
    sidebarText: "#1d192b",
    cardBg: "#ffffff",
    navbarBg: "#f6f2fa",
    textColor: "#1d192b",
    borderRadius: "24px",
  },
  {
    id: "custom-builder",
    name: "Custom Theme Builder",
    desc: "Fully Personalized Custom Theme",
    mode: "custom",
    primary: "#2563eb",
    secondary: "#1d4ed8",
    accent: "#06b6d4",
    bg: "#f8fafc",
    sidebarBg: "#0f172a",
    sidebarText: "#ffffff",
    cardBg: "#ffffff",
    navbarBg: "#ffffff",
    textColor: "#0f172a",
    borderRadius: "12px",
  },
];

export const WALLPAPER_PRESETS = [
  { id: "none", name: "None (Solid Color)", url: "" },
  { id: "minimal-white", name: "Minimal White", url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1600&q=80" },
  { id: "office", name: "Modern Office", url: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80" },
  { id: "mountains", name: "Mountains", url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=80" },
  { id: "lake", name: "Serene Lake", url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80" },
  { id: "nature", name: "Nature Green", url: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1600&q=80" },
  { id: "forest", name: "Deep Forest", url: "https://images.unsplash.com/photo-1511497584788-8767611136f6?auto=format&fit=crop&w=1600&q=80" },
  { id: "abstract-waves", name: "Abstract Waves", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80" },
  { id: "dark-gradient", name: "Dark Gradient", url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1600&q=80" },
  { id: "blue-gradient", name: "Blue Gradient", url: "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1600&q=80" },
  { id: "glass-gradient", name: "Glass Gradient", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80" },
  { id: "business", name: "Business Architecture", url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80" },
  { id: "technology", name: "Technology Mesh", url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80" },
  { id: "wood-texture", name: "Wood Texture", url: "https://images.unsplash.com/photo-1546484475-7f7bd55792da?auto=format&fit=crop&w=1600&q=80" },
  { id: "paper-texture", name: "Paper Texture", url: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=1600&q=80" },
  { id: "marble", name: "Luxury Marble", url: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=1600&q=80" },
  { id: "carbon", name: "Carbon Fiber", url: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1600&q=80" },
  { id: "luxury-office", name: "Executive Hall", url: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1600&q=80" },
  { id: "minimal-geometry", name: "Minimal Geometry", url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1600&q=80" },
  { id: "calm-clouds", name: "Calm Clouds", url: "https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=1600&q=80" },
];

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [activeThemeId, setActiveThemeId] = useState(() => {
    return localStorage.getItem("beereddy_theme_id") || "beereddy-executive";
  });

  const [customColors, setCustomColors] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("beereddy_custom_colors") || "{}");
    } catch (_) {
      return {};
    }
  });

  const [wallpaperSettings, setWallpaperSettings] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("beereddy_wallpaper_settings") ||
          JSON.stringify({
            url: "",
            blur: 0,
            brightness: 100,
            opacity: 100,
            contrast: 100,
            saturation: 100,
            position: "center center",
            repeat: "no-repeat",
            size: "cover",
            parallax: false,
          })
      );
    } catch (_) {
      return { url: "", blur: 0, brightness: 100, opacity: 100 };
    }
  });

  const [compactMode, setCompactMode] = useState(() => {
    return localStorage.getItem("beereddy_compact_mode") === "true";
  });

  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("beereddy_theme_favorites") || "[]");
    } catch (_) {
      return [];
    }
  });

  const [recentlyUsed, setRecentlyUsed] = useState([]);

  // Load from backend on startup if logged in
  useEffect(() => {
    const fetchUserTheme = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch("/api/auth/theme", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success && data.themePreferences) {
          const pref = data.themePreferences;
          if (pref.activeTheme) setActiveThemeId(pref.activeTheme);
          if (pref.customColors) setCustomColors(pref.customColors);
          if (pref.wallpaperSettings) setWallpaperSettings(pref.wallpaperSettings);
          if (pref.compactMode != null) setCompactMode(pref.compactMode);
          if (pref.favoriteThemes) setFavorites(pref.favoriteThemes);
        }
      } catch (err) {
        console.warn("Failed to fetch theme from server:", err.message);
      }
    };
    fetchUserTheme();
  }, []);

  // Save to DB and LocalStorage whenever state changes
  const saveThemePreferences = async (newThemeId, newCustomColors, newWallpaper, newCompact, newFavs) => {
    const themeId = newThemeId !== undefined ? newThemeId : activeThemeId;
    const colors = newCustomColors !== undefined ? newCustomColors : customColors;
    const wallpaper = newWallpaper !== undefined ? newWallpaper : wallpaperSettings;
    const compact = newCompact !== undefined ? newCompact : compactMode;
    const favs = newFavs !== undefined ? newFavs : favorites;

    localStorage.setItem("beereddy_theme_id", themeId);
    localStorage.setItem("beereddy_custom_colors", JSON.stringify(colors));
    localStorage.setItem("beereddy_wallpaper_settings", JSON.stringify(wallpaper));
    localStorage.setItem("beereddy_compact_mode", compact ? "true" : "false");
    localStorage.setItem("beereddy_theme_favorites", JSON.stringify(favs));

    const token = localStorage.getItem("token");
    if (token) {
      try {
        await fetch("/api/auth/theme", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            themePreferences: {
              activeTheme: themeId,
              customColors: colors,
              wallpaperSettings: wallpaper,
              compactMode: compact,
              favoriteThemes: favs,
            },
          }),
        });
      } catch (err) {
        console.warn("Theme save to server error:", err.message);
      }
    }
  };

  // Apply CSS Variables to Document
  useEffect(() => {
    const selected = BUILTIN_THEMES.find((t) => t.id === activeThemeId) || BUILTIN_THEMES[0];
    const root = document.documentElement;

    const primary = selected.id === "custom-builder" && customColors.primary ? customColors.primary : selected.primary;
    const accent = selected.id === "custom-builder" && customColors.accent ? customColors.accent : selected.accent;
    const bg = selected.id === "custom-builder" && customColors.bg ? customColors.bg : selected.bg;
    const sidebarBg = selected.id === "custom-builder" && customColors.sidebarBg ? customColors.sidebarBg : selected.sidebarBg;
    const cardBg = selected.id === "custom-builder" && customColors.cardBg ? customColors.cardBg : selected.cardBg;
    const navbarBg = selected.id === "custom-builder" && customColors.navbarBg ? customColors.navbarBg : selected.navbarBg;
    const borderRadius = selected.id === "custom-builder" && customColors.borderRadius ? customColors.borderRadius : selected.borderRadius;

    root.style.setProperty("--theme-primary", primary);
    root.style.setProperty("--theme-accent", accent);
    root.style.setProperty("--theme-bg", bg);
    root.style.setProperty("--theme-sidebar-bg", sidebarBg);
    root.style.setProperty("--theme-card-bg", cardBg);
    root.style.setProperty("--theme-navbar-bg", navbarBg);
    root.style.setProperty("--theme-border-radius", borderRadius);
    root.style.setProperty("--theme-text-color", selected.textColor);

    if (selected.mode === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [activeThemeId, customColors]);

  const selectTheme = (themeId) => {
    setActiveThemeId(themeId);
    setRecentlyUsed((prev) => Array.from(new Set([themeId, ...prev])).slice(0, 5));
    saveThemePreferences(themeId);
  };

  const updateCustomColors = (newColors) => {
    const updated = { ...customColors, ...newColors };
    setCustomColors(updated);
    setActiveThemeId("custom-builder");
    saveThemePreferences("custom-builder", updated);
  };

  const updateWallpaper = (newSettings) => {
    const updated = { ...wallpaperSettings, ...newSettings };
    setWallpaperSettings(updated);
    saveThemePreferences(undefined, undefined, updated);
  };

  const toggleFavorite = (themeId) => {
    const updated = favorites.includes(themeId)
      ? favorites.filter((id) => id !== themeId)
      : [...favorites, themeId];
    setFavorites(updated);
    saveThemePreferences(undefined, undefined, undefined, undefined, updated);
  };

  const resetTheme = () => {
    setActiveThemeId("beereddy-executive");
    setCustomColors({});
    setWallpaperSettings({ url: "", blur: 0, brightness: 100, opacity: 100 });
    setCompactMode(false);
    saveThemePreferences("beereddy-executive", {}, { url: "", blur: 0, brightness: 100, opacity: 100 }, false);
  };

  return (
    <ThemeContext.Provider
      value={{
        activeThemeId,
        activeTheme: BUILTIN_THEMES.find((t) => t.id === activeThemeId) || BUILTIN_THEMES[0],
        builtinThemes: BUILTIN_THEMES,
        wallpaperPresets: WALLPAPER_PRESETS,
        customColors,
        wallpaperSettings,
        compactMode,
        favorites,
        recentlyUsed,
        selectTheme,
        updateCustomColors,
        updateWallpaper,
        setCompactMode: (val) => {
          setCompactMode(val);
          saveThemePreferences(undefined, undefined, undefined, val);
        },
        toggleFavorite,
        resetTheme,
      }}
    >
      <div
        className={`app-theme-wrapper transition-colors duration-300 min-h-screen ${
          compactMode ? "compact-ui" : ""
        }`}
        style={{
          background: wallpaperSettings.url
            ? `url(${wallpaperSettings.url})`
            : "var(--theme-bg, #f8fafc)",
          backgroundSize: wallpaperSettings.size || "cover",
          backgroundPosition: wallpaperSettings.position || "center center",
          backgroundRepeat: wallpaperSettings.repeat || "no-repeat",
          backdropFilter: wallpaperSettings.blur ? `blur(${wallpaperSettings.blur}px)` : "none",
          filter: `brightness(${wallpaperSettings.brightness || 100}%) contrast(${wallpaperSettings.contrast || 100}%) saturation(${wallpaperSettings.saturation || 100}%)`,
        }}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
