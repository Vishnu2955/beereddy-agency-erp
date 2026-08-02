const slowRequestsLog = [];
let totalRequests = 0;
let totalResponseTimeMs = 0;

const performanceLogger = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    totalRequests += 1;
    totalResponseTimeMs += duration;

    // Log slow requests (> 500ms)
    if (duration > 500 && req.originalUrl.startsWith("/api")) {
      const slowItem = {
        id: `SLOW-${Date.now()}`,
        url: req.originalUrl,
        method: req.method,
        status: res.statusCode,
        durationMs: duration,
        timestamp: new Date().toISOString(),
      };

      slowRequestsLog.unshift(slowItem);
      if (slowRequestsLog.length > 20) {
        slowRequestsLog.pop();
      }
    }
  });

  next();
};

const getPerformanceMetrics = () => {
  const avgResponseTimeMs = totalRequests > 0 ? Math.round(totalResponseTimeMs / totalRequests) : 0;
  return {
    totalRequests,
    avgResponseTimeMs,
    slowRequests: slowRequestsLog,
  };
};

module.exports = {
  performanceLogger,
  getPerformanceMetrics,
};
