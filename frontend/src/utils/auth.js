export const saveAuth = (token, user) => {
  try {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    console.log("[saveAuth] Token stored successfully:", localStorage.getItem("token"));
    console.log("[saveAuth] User stored successfully:", localStorage.getItem("user"));
  } catch (err) {
    console.error("[saveAuth] LocalStorage save error:", err);
  }
};

export const getToken = () => {
  try {
    const token = localStorage.getItem("token");
    console.log("[getToken] Retrieved token:", token ? `${token.substring(0, 15)}...` : null);
    return token;
  } catch (err) {
    console.error("[getToken] Error reading token:", err);
    return null;
  }
};

export const getUser = () => {
  try {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    return JSON.parse(userStr);
  } catch (err) {
    console.error("[getUser] Error parsing user:", err);
    return null;
  }
};

export const logout = () => {
  try {
    console.log("[logout] Clearing token and user from localStorage...");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    console.log("[logout] LocalStorage cleared successfully.");
  } catch (err) {
    console.error("[logout] Error during logout:", err);
  }
};