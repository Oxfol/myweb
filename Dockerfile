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
RUN useradd --create-home --shell /usr/sbin/nologin appuser
COPY --from=build --chown=appuser:appuser /app/.vinext ./.vinext
COPY --from=build --chown=appuser:appuser /app/public ./public
COPY --from=build --chown=appuser:appuser /app/package*.json ./
COPY --from=deps --chown=appuser:appuser /app/node_modules ./node_modules
USER appuser
EXPOSE 3000
CMD ["npm", "run", "start"]
