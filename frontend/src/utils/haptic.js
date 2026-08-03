/**
 * Native HTML5 Web Vibration API Haptic Feedback Utility
 * Provides subtle tactile feedback on mobile devices for key user interactions.
 */

export const hapticSuccess = () => {
  if (typeof window !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(50);
    } catch (_) {}
  }
};

export const hapticError = () => {
  if (typeof window !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate([100, 50, 100]);
    } catch (_) {}
  }
};

export const hapticOrderSuccess = () => {
  if (typeof window !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate([100, 50, 200]);
    } catch (_) {}
  }
};

export const hapticTap = () => {
  if (typeof window !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(20);
    } catch (_) {}
  }
};
