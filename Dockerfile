# ==========================================
# Beereddy ERP - Production Dockerfile for Render
# Multi-Stage Build: React Frontend + Node.js Backend
# ==========================================

# ---------- Stage 1: Build Frontend ----------
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend .
RUN npm run build

# ---------- Stage 2: Production Runner ----------
FROM node:20-alpine AS runner

WORKDIR /app

# Install production backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --omit=dev

# Copy backend source
COPY backend ./backend

# Copy built frontend assets into backend serve directory
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Copy frontend public assets (manifest.json, sw.js, icons, favicon, etc.)
COPY frontend/public ./frontend/public

# Production environment defaults
ENV NODE_ENV=production

# Render assigns PORT dynamically (EXPOSE 5000 as documentation)
EXPOSE 5000

# Start backend server
CMD ["node", "backend/server.js"]