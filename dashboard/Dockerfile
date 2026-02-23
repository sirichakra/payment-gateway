FROM nginx:alpine

COPY . /usr/share/nginx/html

ARG BACKEND_URL
RUN echo "window.BACKEND_URL='$BACKEND_URL';" > /usr/share/nginx/html/env.js

CMD ["nginx", "-g", "daemon off;"]