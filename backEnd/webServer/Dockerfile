FROM debian:bullseye-slim

RUN apt update && apt install nginx -y

COPY conf/default.conf /etc/nginx/conf.d/default.conf
COPY conf/website/ /var/www/html

CMD ["nginx", "-g", "daemon off;"]