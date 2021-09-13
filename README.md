# YJDH services

## kesaseteli

YJDH-Kesäseteli

### kesaseteli Development with Docker

1. Copy the contents of `.env.kesaseteli.example` to `.env.kesaseteli` and modify it if needed.

2. Run `yarn kesaseteli` or, if you want to rebuild, then `yarn kesaseteli --build`

The Frontend is now running at [localhost:3000](https://localhost:3000)
The backend is now running at [localhost:8000](https://localhost:8000)

3. If services fail to get up, `yarn clean` might help.

## Benefit

YJDH-Benefit

### Benefit Development with Docker

1. Copy the contents of `.env.benefit-*.example` to `.env.benefit-*` and modify them if needed.

2. Run `docker-compose -f docker-compose.benefit.yml up`

The Applicant Frontend is now running at [localhost:3000](http://localhost:3000)
The Handler Frontend is now running at [localhost:3100](http://localhost:3100)
The backend is now running at [localhost:8000](http://localhost:8000)

## Setting up Husky pre-commit hooks:

1. Run `yarn install` and `yarn prepare` on project root
2. Try `git commit -m foo`. It does not commit anything for real but pre-commit hook should be triggered.
