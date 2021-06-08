# YJDH services

## kesaseteli

YJDH-Kesäseteli

### kesaseteli Development with Docker

### generate certificate
1. create folder `/frontend/shared/certificates`
2. Run command

```
openssl req -x509 -out localhost.crt -keyout localhost.key \
  -days 3650 \
  -newkey rsa:2048 -nodes -sha256 \
  -subj '/CN=localhost' -extensions EXT -config <( \
   printf "[dn]\nCN=localhost\n[req]\ndistinguished_name = dn\n[EXT]\nsubjectAltName=DNS:localhost\nkeyUsage=digitalSignature\nextendedKeyUsage=serverAuth")
```

3. Add your Cert to Keychain. Follow instructions here: https://medium.com/responsetap-engineering/nextjs-https-for-a-local-dev-server-98bb441eabd7

4. Copy the contents of `.env.kesaseteli.example` to `.env.kesaseteli` and modify it if needed.

5. Run `yarn kesaseteli:up`

The Frontend is now running at [localhost:3000](https://localhost:3000)
The backend is now running at [localhost:8000](http://localhost:8000)

## Benefit

YJDH-Benefit

### Benefit Development with Docker

1. Copy the contents of `.env.benefit.example` to `.env.benefit` and modify it if needed.

2. Run `docker-compose -f docker-compose.benefit.yml up`

The Frontend is now running at [localhost:3000](http://localhost:3000)
The backend is now running at [localhost:8000](http://localhost:8000)

## Setting up Husky pre-commit hooks:

1. Run `yarn install` and `yarn prepare` on project root
2. Try `git commit -m foo`. It does not commit anything for real but pre-commit hook should be triggered.
