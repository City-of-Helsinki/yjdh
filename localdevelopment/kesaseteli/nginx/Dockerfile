FROM debian:buster

RUN  apt-get update && apt-get install -y openssl 

CMD [ -f "/etc/nginx/localhost.crt" ] || { \
  cd /etc/nginx && \
  openssl genrsa -passout pass:password -des3 -out localhost.pass.key 4096  && \
  openssl rsa -passin pass:password -in localhost.pass.key -out localhost.key && \
  rm localhost.pass.key && \
  openssl req -new -key localhost.key -out localhost.csr \
  -subj "/C=FI/ST=Uusimaa/L=Helsinki/O=CityOfHelsinki/OU=Kanslia/CN=localhost" && \
  openssl x509 -req -days 365 -in localhost.csr -signkey localhost.key -out localhost.crt ; }