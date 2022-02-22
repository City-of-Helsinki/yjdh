# YJDH services

## kesaseteli employer

YJDH-Kesäseteli service for employers to fulfill employee applications

### kesaseteli-employer Development with Docker

1. Run `yarn` to install necessary packages

2. Copy the contents of `.env.kesaseteli.example` to `.env.kesaseteli` and modify it if needed.

3. Run `yarn employer` or, if you want to rebuild, then `yarn employer --build`
  - The Frontend is now running at [localhost:3000](https://localhost:3000)
  - The backend is now running at [localhost:8000](https://localhost:8000)
4. If services fail to get up, `yarn clean` or `docker system prune --all` might help.

## kesaseteli youth

YJDH-Kesäseteli service for young people to send kesäseteli applications

### kesaseteli-youth Development with Docker

1. Run `yarn` to install necessary packages

2. Copy the contents of `.env.kesaseteli.example` to `.env.kesaseteli` and modify it if needed.

3. Run `yarn youth` or, if you want to rebuild, then `yarn youth --build`
  - The Frontend is now running at [localhost:3100](https://localhost:3100)
  - The backend is now running at [localhost:8000](https://localhost:8000)
4. If services fail to get up, `yarn clean` might help.

## kesaseteli handler

YJDH-Kesäseteli service for young people to send kesäseteli applications

### kesaseteli-handler Development with Docker

1. Run `yarn` to install necessary packages

2. Copy the contents of `.env.kesaseteli.example` to `.env.kesaseteli` and modify it if needed.

3. Run `yarn handler` or, if you want to rebuild, then `yarn handler --build`
- The Frontend is now running at [localhost:3200](https://localhost:3200)
- The backend is now running at [localhost:8000](https://localhost:8000)
4. If services fail to get up, `yarn clean` might help.
5. 
## Benefit

YJDH-Benefit

### Benefit Development with Docker

1. Run `yarn` to install necessary packages

2. Copy the contents of `.env.benefit-*.example` to `.env.benefit-*` and modify them if needed.

3. Run `yarn benefit` or, if you want to rebuild, then `yarn benefit --build`
  - The Applicant Frontend is now running at [localhost:3000](https://localhost:3000)
  - The Handler Frontend is now running at [localhost:3100](https://localhost:3100)
  - The backend is now running at [localhost:8000](https://localhost:8000)

## TET Admin

YJDH-TET-Admin is a UI for Helsinki city employees to add TET job postings.

### tet-admin development with Docker

1. Run `yarn` to install necessary packages

2. Copy the contents of `.env.tet.example` to `.env.tet` and modify it if needed.

3. Run `yarn tet-admin` or, if you want to rebuild, then `yarn tet-admin --build`
  - The Frontend is now running at [localhost:3002](https://localhost:3002)
  - The backend is now running at [localhost:8000](https://localhost:8000)

## Setting up Husky pre-commit hooks:

1. Run `yarn install` and `yarn prepare` on project root
2. Try `git commit -m foo`. It does not commit anything for real but pre-commit hook should be triggered.

## Known errors

1.  If github action deploy fail with error like this in your pull-request:
    

    Error: rendered manifests contain a resource that already exists. 
    Unable to continue with install: Service "yjdh-135-send-localization-param-to-suomifi-yjdh-ks-service" 
    in namespace "yjdh-yjdh-135-send-localization-param-to-suomifi-227" exists and cannot be 
    imported into the current release: invalid ownership metadata; annotation validation error: 
    key "meta.helm.sh/release-name" must equal "yjdh-135-send-localization-par-review-yjdh-ks-bknd": 
    current value is "yjdh-135-send-localization-par-review-yjdh-ks-empl"

   The reason is that your pr's branch name is too long. You have to rename it and create new pr.
   Instructions: https://stackoverflow.com/questions/30590083/how-do-i-rename-both-a-git-local-and-remote-branch-name


