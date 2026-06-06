#!/bin/sh
envsubst < /usr/share/nginx/html/env.template.js > /usr/share/nginx/html/env.js
nginx -g 'daemon off;'
