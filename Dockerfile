FROM node:24.18.0-bookworm-slim AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json ./
RUN --mount=type=secret,id=cloud_ca,required=false \
    if [ -f /run/secrets/cloud_ca ]; then export NODE_EXTRA_CA_CERTS=/run/secrets/cloud_ca; fi; \
    npm install --global npm@11.16.0 --fetch-timeout=45000 --fetch-retries=1 && npm ci --no-audit --no-fund --fetch-timeout=45000 --fetch-retries=1
COPY . .
RUN npm run build

FROM node:24.18.0-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production PORT=8080 HOSTNAME=0.0.0.0
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
USER node
EXPOSE 8080
CMD ["node", "server.js"]
