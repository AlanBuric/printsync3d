FROM node:24-alpine AS builder

WORKDIR /app

COPY package*json ./

RUN npm ci

COPY . .

RUN npm run build

FROM node:24-alpine

COPY package*json ./
RUN npm ci --omit=dev

# Install udevadm for device management, used by serialport NPM package
RUN apk add --no-cache udev

COPY --from=builder /app/dist ./dist

EXPOSE 8000

CMD ["node", "dist/server.js"]