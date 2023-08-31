# YJDH services

Yhteisöjen ja järjestöjen digitaalinen Helsinki (= YJDH).

This monorepo contains code for four different employment services:

1. Kesäseteli
2. Benefit
3. TET Youth
4. TET Admin

## Requirements

* Docker@^19.03.0 (or higher)
* NodeJS@^18.16.0
* Yarn@^1.22

## Get started

Follow these instructions to spin up a service:

* Kesäseteli:
	* [kesaseteli-employer](#kesaseteli-employer-development-with-docker)
	* [kesaseteli-youth](#kesaseteli-youth-development-with-docker)
	* [kesaseteli-handler](#kesaseteli-handler-development-with-docker)
* Benefit aka. Helsinki-lisä:
  * [benefit](#benefit)
* TET:
   * [tet-admin](#tet-admin-development-with-docker) 
   * [tet-youth](#tet-youth-development-with-docker) 

There is additional README's about [authentication and backend development](https://github.com/City-of-Helsinki/yjdh/tree/develop/backend) and [frontend development](https://github.com/City-of-Helsinki/yjdh/tree/develop/frontend).

## Publishing with Release Please & Git workflow

[Release Please](https://github.com/googleapis/release-please) is used to automate release and release tag creation. Release Please creates release pull requests when the `main` branch has new commits after the last release, with commit messages prefixed with specific [Conventional Commits](https://www.conventionalcommits.org/) types (`feat:`, `fix:` or  `deps:`). More info about types [here](https://github.com/googleapis/release-please#releasable-units). Release PR might also already exist (if not merged before). Merging release PR creates appropriate release tag which triggers staging + production deploy. Refer to the [Release Please docs](https://github.com/googleapis/release-please).

More information in [Confluence](https://helsinkisolutionoffice.atlassian.net/wiki/spaces/DD/pages/8278966368/Releases+with+release-please).

### Basics

* Merge to `main` branch triggers dev + test deploys. Merging release pull requests created by Release Please triggers staging + production deploys.
* Use [Conventional Commits](https://www.conventionalcommits.org/)
* Merge with merge commit is disabled on pull requests as it doesn't play well with Release Please. Release Please documentation recommends using squash merge, so keep PR's small enough so that squashing makes sense. Rebase and merge also works if PR is large. More info about merge methods in [GitHub docs](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/about-merge-methods-on-github).
* Pull request title should include Jira handle (for Jira integration to work)
* Release Please figures out how much to increase the version number based on commit messages. Look [SemVer](https://semver.org/) and [Release Please docs](https://github.com/googleapis/release-please#how-should-i-write-my-commits).

### Example workflow

1. Branch off from `main` to feature branch named after Jira handle, e.g. `git checkout -b hl-123-new-feature`
2. Do your changes & commit using Conventional Commits, e.g. `git commit -m "feat: new feature backend"`
3. Make additional changes & commit, e.g. `git commit -m "feat: new feature frontend"`
4. Open a pull request, for example with title `HL-123: New feature`
5. After PR checks are passed and PR is approved, merge with squash merge (set commit message to e.g. `feat: new feature`) or rebase and merge
6. Release Please opens release PR with a title similar to this: `chore(main): release benefit-backend 1.1.1`  
7. Merge release pull request to `main`. This creates a versioned release tag (e.g. `benefit-backend: v1.1.1`) that triggers staging and production deploy (Deploys still must be approved from Azure DevOps).

## Setting up git hooks

Git hooks are run with [pre-commit](https://pre-commit.com/). Pre-commit also runs the frontend hooks that were run with husky and lerna.

1. Install [Pre-commit](https://pre-commit.com/)
2. Install packages from `package.json`
3. Run `pre-commit install`

Git hooks can be disabled temporarily with `--no-verify` when committing.

## Kesäseteli employer

YJDH-Kesäseteli service for employers to fulfill employee applications

### kesaseteli-employer Development with Docker

1. Run `yarn` to install necessary packages

2. Copy the contents of `.env.kesaseteli.example` to `.env.kesaseteli` and modify it if needed.

3. Run `yarn employer up` or, if you want to rebuild, then `yarn employer up --build`
  - The Frontend is now running at [localhost:3000](https://localhost:3000)
  - The backend is now running at [localhost:8000](https://localhost:8000)
4. If services fail to get up, `yarn clean` or `docker system prune --all` might help.

## Kesäseteli youth

YJDH-Kesäseteli service for young people to send kesäseteli applications

### kesaseteli-youth development with Docker

1. Run `yarn` to install necessary packages

2. Copy the contents of `.env.kesaseteli.example` to `.env.kesaseteli` and modify it if needed.

3. Run `yarn youth up` or, if you want to rebuild, then `yarn youth up --build`
  - The Frontend is now running at [localhost:3100](https://localhost:3100)
  - The backend is now running at [localhost:8000](https://localhost:8000)
4. If services fail to get up, `yarn clean` might help.

## Kesäseteli handler

YJDH-Kesäseteli service for young people to send kesäseteli applications

### kesaseteli-handler development with Docker

1. Run `yarn` to install necessary packages

2. Copy the contents of `.env.kesaseteli.example` to `.env.kesaseteli` and modify it if needed.

3. Run `yarn handler up` or, if you want to rebuild, then `yarn handler up --build`
  - The Frontend is now running at [localhost:3200](https://localhost:3200)
  - The backend is now running at [localhost:8000](https://localhost:8000)

4. If services fail to get up, `yarn clean` might help.

## Benefit

YJDH-Benefit provides two services for applying and for handling the application of discretionary support:

* Service for a private or third-sector employer that hires an unemployed Helsinki resident
* Service for the City Of Helsinki backoffice to handle aforementioned applications

### Benefit development with Docker

1. Run `yarn` to install necessary packages

2. Copy the contents of `.env.benefit-*.example` to `.env.benefit-*` and modify them if needed. Or better yet, get one from a fellow contributor.

3. Run `yarn benefit up` or, if you want to rebuild, then `yarn benefit up --build`
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
  - The Frontend is now running at [localhost:3001](https://localhost:3001)
  - The backend is now running at [localhost:8000](https://localhost:8000)

Running `yarn tet-youth down` brings down all services.

## Known errors

1. If github action deploy fail with error like this in your pull-request:

```text
  Error: rendered manifests contain a resource that already exists. 
  Unable to continue with install: Service "yjdh-135-send-localization-param-to-suomifi-yjdh-ks-service" 
  in namespace "yjdh-yjdh-135-send-localization-param-to-suomifi-227" exists and cannot be 
  imported into the current release: invalid ownership metadata; annotation validation error: 
  key "meta.helm.sh/release-name" must equal "yjdh-135-send-localization-par-review-yjdh-ks-bknd": 
  current value is "yjdh-135-send-localization-par-review-yjdh-ks-empl"
```

The reason for this is that your pr's branch name is too long. You have to rename it and create a new pr. See instructions at [StackOverflow](https://stackoverflow.com/questions/30590083/how-do-i-rename-both-a-git-local-and-remote-branch-name).
