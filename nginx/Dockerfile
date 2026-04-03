FROM nginx:alpine

COPY /nginx/nginx.conf.template /etc/nginx/nginx.conf.template
COPY /frontend /usr/share/nginx/html

CMD envsubst '\$PORT \$SERVER_URL' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf && nginx -g 'daemon off;'