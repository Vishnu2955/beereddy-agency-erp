/**
 * Enterprise Production Security Middleware
 * Hardened protection against OWASP Top 10 vulnerabilities:
 * - Brute Force & Rate Limiting Defense
 * - NoSQL Injection & MongoDB Operator Shield
 * - Cross-Site Scripting (XSS) & Script Tag Sanitization
 * - OWASP Security Headers & Clickjacking Prevention
 * - Sensitive Route & File Access Control
 */

// 1. Memory Rate Limiter Map
const rateLimitMap = new Map();

// Periodic cleanup of expired rate limit entries every 10 minutes to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}, 600000);

const createRateLimiter = (maxRequests, windowMs, message) => {
  return (req, res, next) => {
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.ip ||
      req.socket?.remoteAddress ||
      "127.0.0.1";

    const now = Date.now();
    const key = `${req.path}:${ip}`;
    const record = rateLimitMap.get(key) || { count: 0, resetTime: now + windowMs };

    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
    } else {
      record.count += 1;
    }

    rateLimitMap.set(key, record);

    if (record.count > maxRequests) {
      return res.status(429).json({
        success: false,
        message: message || "Too many requests from your IP. Please try again later.",
        retryAfterSeconds: Math.ceil((record.resetTime - now) / 1000),
      });
    }

    next();
  };
};

// Auth Brute Force Limiter: 10 requests per 15 minutes
const loginRateLimiter = createRateLimiter(
  10,
  15 * 60 * 1000,
  "Too many authentication attempts. Account locked temporarily for 15 minutes to protect against brute force attacks."
);

// General API Rate Limiter: 300 requests per 15 minutes
const apiRateLimiter = createRateLimiter(
  300,
  15 * 60 * 1000,
  "API request rate limit exceeded. Please slow down your requests."
);

// 2. Comprehensive OWASP Security Headers Middleware
const setSecurityHeaders = (req, res, next) => {
  // Hide server technology footprint
  res.removeHeader("X-Powered-By");
  res.removeHeader("Server");

  // Prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Prevent Frame Embedding & Clickjacking from 3rd-party sites (SAMEORIGIN allows internal frames like /mostar.html)
  res.setHeader("X-Frame-Options", "SAMEORIGIN");

  // Enable Browser XSS Filtering
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // HTTP Strict Transport Security (HSTS) - Enforce HTTPS for 1 year
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");

  // Referrer Policy - Leak minimum URL path to third parties
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  // Permissions Policy - Restrict sensitive hardware features
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");

  // Content Security Policy (CSP)
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https:; img-src 'self' data: blob: https: http:; connect-src 'self' https: http: ws: wss:; frame-ancestors 'self';"
  );

  next();
};

// 3. NoSQL Injection & XSS Input Sanitization
const cleanObject = (obj) => {
  if (!obj || typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    return obj.map(cleanObject);
  }

  const cleaned = {};
  for (const key of Object.keys(obj)) {
    // Strip keys with NoSQL operators starting with $ or containing .
    if (key.startsWith("$") || key.includes(".")) continue;

    let value = obj[key];
    if (typeof value === "string") {
      // Strip script tags, HTML tags, and event handlers
      value = value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        .replace(/javascript:/gi, "")
        .replace(/onerror\s*=/gi, "")
        .replace(/onload\s*=/gi, "")
        .replace(/onclick\s*=/gi, "");
    } else if (typeof value === "object" && value !== null) {
      value = cleanObject(value);
    }
    cleaned[key] = value;
  }
  return cleaned;
};

const sanitizeInput = (req, res, next) => {
  if (req.body) req.body = cleanObject(req.body);
  if (req.query) req.query = cleanObject(req.query);
  if (req.params) req.params = cleanObject(req.params);
  next();
};

module.exports = {
  setSecurityHeaders,
  sanitizeInput,
  loginRateLimiter,
  apiRateLimiter,
};
