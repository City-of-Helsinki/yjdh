# YJDH services

[backend/README.md](https://github.com/City-of-Helsinki/yjdh/blob/develop/backend/README.md) contains information about authentication and backend development.

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

YJDH-TET-Admin is a UI for Helsinki city employees or private employers to add TET job advertisements (also called job postings in the code).

### tet-admin development with Docker

1. Run `yarn` to install necessary packages

2. Copy the contents of `.env.tet.example` to `.env.tet` and modify it if needed.

3. You need to set `LINKEDEVENTS_API_KEY` in `.env.tet` for this service to work. Usually this is set to Linked Events test environment (default in `.env.tet.example`), so you need to ask for this.

4. Run `yarn tet-admin up` or, if you want to rebuild, then `yarn tet-admin up --build`
  - The Frontend is now running at [localhost:3002](https://localhost:3002)
  - The backend is now running at [localhost:8000](https://localhost:8000)

Running `yarn tet-admin down` brings down all services.

## TET Youth

YJDH-TET-Youth is a UI for pupils to search for TET job advertisements.

### tet-youth development with Docker

1. Run `yarn` to install necessary packages

2. Copy the contents of `.env.tet.example` to `.env.tet` and modify it if needed.

3. Run `yarn tet-youth up` or, if you want to rebuild, then `yarn tet-youth up --build`
  - The Frontend is now running at [localhost:3002](https://localhost:3001)
  - The backend is now running at [localhost:8000](https://localhost:8000)

Running `yarn tet-youth down` brings down all services.

## Setting up Husky pre-commit hooks:

1. Run `yarn install` and `yarn prepare` on project root
2. Try `git commit -m foo`. It does not commit anything for real but pre-commit hook should be triggered.

If the pre-commit hook hangs, or you want to push changes with failing tests, you can disable the hook with
`npx husky uninstall`. Running `yarn prepare` reactivates the hook.

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


