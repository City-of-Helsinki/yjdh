FROM nginx:1.24-alpine-slim

RUN apk update && apk add bash openssl

COPY entrypoint.sh /usr/local/bin

RUN chmod +x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
