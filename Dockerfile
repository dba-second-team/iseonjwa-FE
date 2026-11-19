# 빌드
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 실행
FROM nginx:stable-alpine
LABEL org.opencontainers.image.source=https://github.com/dba-second-team/iseonjwa-FE
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80