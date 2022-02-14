#!/bin/bash

if [ ! -f "/etc/nginx/localhost.crt" ]; then
  cd /etc/nginx && \
  openssl genrsa -passout pass:password -des3 -out localhost.pass.key 4096  && \
  openssl rsa -passin pass:password -in localhost.pass.key -out localhost.key && \
  rm localhost.pass.key && \
  openssl req -new -key localhost.key -out localhost.csr \
  -subj "/C=FI/ST=Uusimaa/L=Helsinki/O=CityOfHelsinki/OU=Kanslia/CN=localhost" && \
  openssl x509 -req -days 365 -in localhost.csr -signkey localhost.key -out localhost.crt && \
  chmod 644 localhost.csr localhost.key localhost.crt
fi

nginx -g 'daemon off;';

nginx -s reload;
