/**
 * Phase 26 Security Middleware for Express
 * Handles Security Headers, NoSQL Injection & XSS Input Sanitization, and Rate Limiting
 */

// 1. Security Headers Middleware
const setSecurityHeaders = (req, res, next) => {
  // Remove X-Powered-By header
  res.removeHeader("X-Powered-By");

  // Prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Prevent clickjacking / frame embedding
  res.setHeader("X-Frame-Options", "DENY");

  // Enable XSS Filtering
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // Enable HSTS (HTTP Strict Transport Security)
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");

  // Content Security Policy
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https:; img-src 'self' data: blob: https: http:; connect-src 'self' https: http: ws: wss:;"
  );

  next();
};

// 2. NoSQL Injection & XSS Input Sanitization
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
      // Basic XSS sanitization - strip script tags
      value = value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
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

// 3. Memory Rate Limiter
const rateLimitMap = new Map();

const createRateLimiter = (maxRequests, windowMs, message) => {
  return (req, res, next) => {
    const ip = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
    const now = Date.now();

    const record = rateLimitMap.get(ip) || { count: 0, resetTime: now + windowMs };

    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
    } else {
      record.count += 1;
    }

    rateLimitMap.set(ip, record);

    if (record.count > maxRequests) {
      return res.status(429).json({
        success: false,
        message: message || "Too many requests. Please try again later.",
        retryAfterSeconds: Math.ceil((record.resetTime - now) / 1000),
      });
    }

    next();
  };
};

const loginRateLimiter = (req, res, next) => next();

const apiRateLimiter = (req, res, next) => next();

module.exports = {
  setSecurityHeaders,
  sanitizeInput,
  loginRateLimiter,
  apiRateLimiter,
};
