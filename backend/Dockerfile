# Gunakan image Node.js versi ringan dan stabil
FROM node:18-alpine

# Set direktori kerja di dalam container
WORKDIR /app

# Salin file dependensi dan install
COPY package*.json ./
RUN npm install

# Salin semua source code ke dalam container
COPY . .

# Set timezone (opsional tapi best practice untuk Asia)
ENV TZ=Asia/Jakarta
ENV NODE_ENV=production

# Ekspose port yang digunakan backend
EXPOSE 5000

# Jalankan file utama backend
CMD ["node", "telegram.js"]