FROM nginx:1.23.3-alpine-slim

RUN apk update && apk add bash openssl

COPY entrypoint.sh /usr/local/bin

RUN chmod +x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
