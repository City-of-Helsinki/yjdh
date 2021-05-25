# YJDH services

## kesaseteli
YJDH-Kesäseteli

### kesaseteli Development with Docker

1. Copy the contents of `.env.kesaseteli.example` to `.env.kesaseteli` and modify it if needed.

2. Run `docker-compose -f docker-compose.kesaseteli.yml up`

The Frontend is now running at [localhost:3000](http://localhost:3000)
The backend is now running at [localhost:8000](http://localhost:8000)

## Setting up Husky pre-commit hooks:

1. Run `yarn install` and `yarn prepare` on project root
2. Try `git commit -m foo`. It does not commit anything for real but pre-commit hook should be triggered.
