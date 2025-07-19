# === PHASE 1: BUILD REACT APP ===
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# === PHASE 2: SERVE WITH NGINX ===
FROM nginx:alpine

# Hapus default Nginx config (opsional, tapi bagus)
RUN rm -rf /etc/nginx/conf.d/default.conf

# Salin hasil build ke Nginx
COPY --from=build /app/build /usr/share/nginx/html

# (Opsional) Tambahkan konfigurasi Nginx sendiri kalau perlu routing SPA
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
