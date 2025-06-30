FROM node:20-slim AS builder
WORKDIR /usr/src/app
COPY package*.json ./
COPY tailwind.config.js ./
RUN npm install
COPY tsconfig.json ./
RUN mkdir -p conf/website/
COPY conf/website/ ./conf/website/

#compilar los .ts
RUN npm run build 
#crear output.css con tailwind en base a todos los archivos .ts y .html
RUN npx tailwindcss -i ./conf/website/src/input.css -o ./conf/website/dist/output.css

FROM debian:bullseye-slim

RUN apt update && apt install nginx -y

COPY conf/default.conf /etc/nginx/conf.d/default.conf
COPY conf/website/ /var/www/html
COPY --from=builder /usr/src/app/conf/website/dist /var/www/html/dist/

CMD ["nginx", "-g", "daemon off;"]