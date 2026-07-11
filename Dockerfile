FROM node:22-bookworm-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0
RUN useradd --create-home --shell /usr/sbin/nologin appuser
COPY --from=build --chown=appuser:appuser /app/dist/standalone ./
COPY --from=build --chown=appuser:appuser /app/dist/client ./dist/client
COPY --from=build --chown=appuser:appuser /app/public ./public
USER appuser
EXPOSE 3000
CMD ["node", "server.js"]
