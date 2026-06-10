# ---- Build stage ----
FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build -- --configuration production

# ---- Runtime stage ----
FROM nginx:alpine
RUN apk add --no-cache gettext

COPY --from=builder /app/dist/*/browser /usr/share/nginx/html
COPY docker/env.template.js /usr/share/nginx/html/env.template.js
COPY nginx.conf.template /etc/nginx/templates/nginx.conf.template
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80
ENTRYPOINT ["/entrypoint.sh"]
