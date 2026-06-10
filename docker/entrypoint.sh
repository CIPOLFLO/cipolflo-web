#!/bin/sh
envsubst '${AUTH0_DOMAIN} ${AUTH0_CLIENT_ID} ${AUTH0_AUDIENCE}' < /usr/share/nginx/html/env.template.js > /usr/share/nginx/html/env.js
envsubst '${BACKEND_URL}' < /etc/nginx/templates/nginx.conf.template > /etc/nginx/conf.d/default.conf
nginx -g 'daemon off;'