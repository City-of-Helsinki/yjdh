<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [YJDH services](#yjdh-services)
  - [About YJDH](#about-yjdh)
  - [Service environments (Kesäseteli)](#service-environments-kes%C3%A4seteli)
  - [Requirements](#requirements)
  - [Get started](#get-started)
    - [Quick start](#quick-start)
      - [1. Clone the repository](#1-clone-the-repository)
      - [2. Create all local `.env` files from the examples](#2-create-all-local-env-files-from-the-examples)
      - [3. Start the stack with Docker](#3-start-the-stack-with-docker)
      - [4. Verify backend is running](#4-verify-backend-is-running)
      - [5. (Optional) Create a Django admin user](#5-optional-create-a-django-admin-user)
      - [6. (Optional) Run the test suites](#6-optional-run-the-test-suites)
      - [Switching stacks or cleaning up](#switching-stacks-or-cleaning-up)
    - [Stack commands](#stack-commands)
  - [Testing](#testing)
    - [Backend tests](#backend-tests)
    - [Frontend tests](#frontend-tests)
  - [Local troubleshooting](#local-troubleshooting)
      - [502 Bad Gateway in frontend](#502-bad-gateway-in-frontend)
      - [Login fails or CORS errors in the browser](#login-fails-or-cors-errors-in-the-browser)
      - [Access container shell](#access-container-shell)
  - [Publishing with Release Please & Git workflow](#publishing-with-release-please--git-workflow)
    - [Basics](#basics)
    - [Example workflow](#example-workflow)
  - [Setting up git hooks](#setting-up-git-hooks)
  - [Kesäseteli employer](#kes%C3%A4seteli-employer)
    - [kesaseteli-employer Development with Docker](#kesaseteli-employer-development-with-docker)
  - [Kesäseteli youth](#kes%C3%A4seteli-youth)
    - [kesaseteli-youth development with Docker](#kesaseteli-youth-development-with-docker)
  - [Kesäseteli handler](#kes%C3%A4seteli-handler)
    - [kesaseteli-handler development with Docker](#kesaseteli-handler-development-with-docker)
  - [Benefit](#benefit)
    - [Benefit development with Docker](#benefit-development-with-docker)
  - [Maintaining and known issues](#maintaining-and-known-issues)
    - [Maintenance tasks (Kesäseteli)](#maintenance-tasks-kes%C3%A4seteli)
    - [Known issues](#known-issues)
  - [Git blame ignore refs](#git-blame-ignore-refs)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# YJDH services

Yhteisöjen ja järjestöjen digitaalinen Helsinki (= YJDH).

## About YJDH

**What is it?** A monorepo containing code for employment and benefit services used by the City of Helsinki.

**Why is it?** To provide digital services for managing employment applications and benefits, making it easier for:
* Young people to apply for summer vouchers (Kesäseteli)
* Employers to fulfill employee applications
* City staff to process and handle applications

**Who uses the services?**

* **Youth** - Young people (ages 15-18) who apply for summer vouchers through Kesäseteli Youth UI
* **Employer** - Private or third-sector employers who hire Helsinki residents and submit applications through Kesäseteli Employer UI or Benefit Applicant UI
* **Handler** - City of Helsinki staff who process and review applications through Handler UIs
* **Admin** - System administrators who manage configurations and permissions

This monorepo contains code for three different employment services:

* **Kesäseteli** - Summer voucher system for youth employment
  * Backend
  * Admin
  * Youth UI
  * Employer UI
  * Handler UI
* **Benefit / Helsinki-lisä** - Discretionary support application system
  * Backend
  * Applicant UI
  * Handler UI

* **TET Job Search** - retired and can be found in [here](https://github.com/City-of-Helsinki/yjdh/tree/ab8b87d5466badb37dccb968830ddbb2a51ec170)
  * Backend
  * Youth
  * Admin

## Service environments (Kesäseteli)

| Service | DEV | TEST | STAGING | PROD |
|---------|-----|------|---------|------|
| Employer UI | [kesaseteli.dev.hel.ninja](https://kesaseteli.dev.hel.ninja/) | [yjdh-kesaseteli-ui-test.agw.arodevtest.hel.fi](https://yjdh-kesaseteli-ui-test.agw.arodevtest.hel.fi/) | [kesaseteli.stage.hel.ninja](https://kesaseteli.stage.hel.ninja/) | [kesaseteli.hel.fi](https://kesaseteli.hel.fi) |
| Youth UI | [nuortenkesaseteli.dev.hel.ninja](https://nuortenkesaseteli.dev.hel.ninja/) | [kesaseteli-youth-ui-test.agw.arodevtest.hel.fi](https://kesaseteli-youth-ui-test.agw.arodevtest.hel.fi/) | [nuortenkesaseteli.stage.hel.ninja](https://nuortenkesaseteli.stage.hel.ninja/) | [nuortenkesaseteli.hel.fi](https://nuortenkesaseteli.hel.fi) |
| Handler UI | [kesaseteli-handler-ui.dev.hel.ninja](https://kesaseteli-handler-ui.dev.hel.ninja/) | [kesaseteli-handler-ui-test.agw.arodevtest.hel.fi](https://kesaseteli-handler-ui-test.agw.arodevtest.hel.fi/) | [kesaseteli-handler-ui.stage.hel.ninja](https://kesaseteli-handler-ui.stage.hel.ninja/) | [kesasetelinkasittelija.hel.fi](https://kesasetelinkasittelija.hel.fi/) |
| Backend API & Admin | [yjdh-kesaseteli.api.dev.hel.ninja](https://yjdh-kesaseteli.api.dev.hel.ninja/) | [yjdh-kesaseteli-api-test.agw.arodevtest.hel.fi](https://yjdh-kesaseteli-api-test.agw.arodevtest.hel.fi/) | [kesaseteli-api.stage.hel.ninja](https://kesaseteli-api.stage.hel.ninja) | [kesaseteli.api.hel.fi](https://kesaseteli.api.hel.fi) |

* **Deployments:** Merge to `main` triggers dev/test deploys. Merging a Release Please PR creates a version tag that triggers staging deploy. Production requires manual approval in Azure DevOps.
* **PR review:** Each pull request gets a dynamic review environment and the URL is posted as a comment in the PR.
* **Full URLs and details:** [backend/kesaseteli/docs/kesaseteli-endpoints.md](backend/kesaseteli/docs/kesaseteli-endpoints.md)

## Requirements

Before starting, ensure you have the following installed:

* Docker@^19.03.0 (or higher)
* Docker Compose@^2.20.0 (or higher)
* NodeJS `>=22.13.1 <23.11.0`
* Yarn@^1.22
* [pre-commit](https://pre-commit.com/) `>=4.5.1`

Verify your installations:

```bash
docker --version
docker compose version
node --version
yarn --version
pre-commit --version
```

Ensure Docker Desktop (or the Docker service on Linux) is running before proceeding.

## Get started

### Quick start

#### 1. Clone the repository

```bash
git clone https://github.com/City-of-Helsinki/yjdh.git
cd yjdh
```

#### 2. Create all local `.env` files from the examples

Option A: copy manually in file explorer/editor.

Option B: run these commands:

```bash
cp .env.kesaseteli-backend.example .env.kesaseteli-backend
cp .env.kesaseteli-employer.example .env.kesaseteli-employer
cp .env.kesaseteli-youth.example .env.kesaseteli-youth
cp .env.kesaseteli-handler.example .env.kesaseteli-handler
cp .env.benefit-backend.example .env.benefit-backend
cp .env.benefit-applicant.example .env.benefit-applicant
cp .env.benefit-handler.example .env.benefit-handler
```

The example files already contain everything needed to get a development environment up and running. To change or understand individual variables, see [Environment variables](backend/kesaseteli/README.md#environment-variables) in the Kesäseteli backend README (and the corresponding example `.env` files in the repo root).

**Note:** On Windows Command Prompt, use `copy` instead of `cp`.

#### 3. Start the stack with Docker

* Kesäseteli Employer: `yarn employer up`
* Kesäseteli Youth/Handler: `yarn youth up` or `yarn handler up`
* Benefit: `yarn benefit up`

**Note:** On Linux, use the `:linux` variants (`yarn employer:linux up`, `yarn youth:linux up`, etc.) for proper file permissions.

**Note:** Youth and Handler spin up the same stack; don't run both at the same time.

#### 4. Verify backend is running

```bash
curl -k https://localhost:8000/admin/
```

#### 5. (Optional) Create a Django admin user

If you need the admin site (e.g. for handler workflows or debugging):

```bash
docker exec -it kesaseteli-backend python manage.py createsuperuser
```

#### 6. (Optional) Run the test suites

See [Testing](#testing) below.

#### Switching stacks or cleaning up

To switch stacks or clear issues, run `yarn clean` to remove containers and volumes.

### Stack commands

**Kesäseteli** (run only one stack at a time; Youth and Handler share the same stack):

* [Employer](#kesaseteli-employer-development-with-docker): `yarn employer up`, running at port 3000
* [Youth](#kesaseteli-youth-development-with-docker) / [Handler](#kesaseteli-handler-development-with-docker): `yarn youth up` or `yarn handler up`, running at ports 3100 and 3200

**Benefit (Helsinki-lisä):**

* [Benefit](#benefit): `yarn benefit up`, Applicant at port 3000 and Handler at 3100

Backend is at `https://localhost:8000` in all stacks.

More detail: [Kesäseteli employer](#kesaseteli-employer-development-with-docker), [youth](#kesaseteli-youth-development-with-docker), [handler](#kesaseteli-handler-development-with-docker), [Benefit](#benefit). See also [backend](backend/README.md) and [frontend](frontend/README.md) READMEs.

## Testing

### Backend tests

Backend tests run inside Docker containers using the same setup as development.

From repository root:

**Windows:**
* **Kesäseteli:** `docker compose -f compose/employer.dev.yml run --rm backend pytest`
* **Benefit:** `docker compose -f compose.benefit.yml run --rm backend pytest`

**Linux (recommended for proper permissions):**
* **Kesäseteli:** `UID=$(id -u) GID=$(id -g) docker compose -f compose/employer.dev.yml -f compose/linux.yml run --rm backend pytest`
* **Benefit:** `UID=$(id -u) GID=$(id -g) docker compose -f compose.benefit.yml run --rm backend pytest`

**Note:** On Linux, the UID/GID prefix ensures the container runs with your user's UID/GID, preventing permission issues. Add `-f compose/linux.yml` to the command when using Kesäseteli compose files.

**Note:** Instead of prefixing every command with `UID=$(id -u) GID=$(id -g)`, you can export them once: in your shell for a session (`export UID GID` after setting them), with [direnv](https://direnv.net/) in the project directory, or in `.bashrc`/`.zshrc` (or similar).

### Frontend tests

Frontend tests run locally (not in Docker) and require Node.js and yarn.

**Prerequisites:** Install frontend dependencies first (if not already done). From the repository root run `yarn --cwd frontend install`, or run `yarn install` from the `frontend` directory.

From repository root:

* Run all frontend tests: `yarn --cwd frontend test`
* Run Kesäseteli Employer tests only: `yarn --cwd frontend ks-empl:test`
* Run Kesäseteli Youth tests only: `yarn --cwd frontend ks-youth:test`
* Run Benefit Handler tests only: `yarn --cwd frontend bf-hdlr:test`
* Run Benefit Applicant tests only: `yarn --cwd frontend bf-appl:test`

**Note:** Frontend tests require local Node.js and yarn installation.

## Local troubleshooting

**On Linux:** Use the `:linux` script variants (e.g. `yarn employer:linux up`) when starting the stack, and for backend tests use the `UID/GID` prefix and add `-f compose/linux.yml`. See [Backend tests](#backend-tests) and [Quick start](#quick-start).

#### 502 Bad Gateway in frontend

Usually the backend is not running or has crashed. Check that the backend is up (e.g. `curl -k https://localhost:8000/admin/`) and check logs:

```bash
docker logs -f kesaseteli-backend
```

#### Login fails or CORS errors in the browser

CORS-style errors often mean the backend is not reachable. First confirm the backend is running (e.g. `curl -k https://localhost:8000/admin/`). If the backend is up and login still fails, try a different browser or clear site data.

#### Access container shell

To get a bash shell inside a running container:

```bash
# Kesäseteli backend
docker compose -f compose/employer.dev.yml exec backend bash

# Benefit backend
docker compose -f compose.benefit.yml exec backend bash

# Or using container name directly
docker exec -it kesaseteli-backend bash
docker exec -it benefit-backend bash
```

## Publishing with Release Please & Git workflow

[Release Please](https://github.com/googleapis/release-please) is used to automate release and release tag creation. Release Please creates release pull requests when the `main` branch has new commits after the last release, with commit messages prefixed with specific [Conventional Commits](https://www.conventionalcommits.org/) types (`feat:`, `fix:` or `deps:`). More info about types [here](https://github.com/googleapis/release-please#releasable-units). Release PR might also already exist (if not merged before). Merging release PR creates appropriate release tag which triggers staging + production deploy. Refer to the [Release Please docs](https://github.com/googleapis/release-please).

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

[Husky](https://github.com/typicode/husky) wires Git to run scripts in [`.husky/`](.husky/README.md) when you commit. Those scripts invoke the [pre-commit](https://pre-commit.com/) CLI (see [`.pre-commit-config.yaml`](.pre-commit-config.yaml)) and a few repo-specific steps.

For example, a commit may run:

* Ruff and other checks from `.pre-commit-config.yaml` (lint, format, whitespace, YAML/TOML, large files, ShellCheck)
* [doctoc](https://github.com/thlorenz/doctoc) on staged `README.md` files
* Lerna-driven frontend `pre-commit` scripts for frontend (e.g. lint-staged, ESLint, typecheck)
* Commit message checks (commitlint / pre-commit commit-msg hooks)

See more in [`.husky/README.md`](.husky/README.md).

After cloning, install root Node dependencies (for Husky, doctoc, Commitlint) and wire Git to use Husky:

```bash
yarn install
yarn husky
```

Note: you don't need to run `pre-commit install`, Husky calls `pre-commit run` directly.

Git hooks can be disabled temporarily with `git commit --no-verify`.

## Kesäseteli employer

YJDH-Kesäseteli service for employers to fulfill employee applications

### kesaseteli-employer Development with Docker

Follow the [Quick start](#quick-start) section above to set up your environment files.

Then run `yarn employer up` or, if you want to rebuild, then `yarn employer up --build`
  - The employer frontend is now running at [localhost:3000](https://localhost:3000)
  - The backend is now running at [localhost:8000](https://localhost:8000)

If services fail to get up, `yarn clean` or `docker system prune --all` might help.

## Kesäseteli youth

YJDH-Kesäseteli service for young people to send kesäseteli applications

### kesaseteli-youth development with Docker

Follow the [Quick start](#quick-start) section above to set up your environment files.

Then run `yarn youth up` or, if you want to rebuild, then `yarn youth up --build`
  - The youth frontend is now running at [localhost:3100](https://localhost:3100)
  - The backend is now running at [localhost:8000](https://localhost:8000)

If services fail to get up, `yarn clean` might help.

## Kesäseteli handler

YJDH-Kesäseteli service for city staff to process kesäseteli applications

### kesaseteli-handler development with Docker

Follow the [Quick start](#quick-start) section above to set up your environment files.

Then run `yarn handler up` or, if you want to rebuild, then `yarn handler up --build`
  - The handler frontend is now running at [localhost:3200](https://localhost:3200)
  - The backend is now running at [localhost:8000](https://localhost:8000)

If services fail to get up, `yarn clean` might help.

## Benefit

YJDH-Benefit provides two services for applying and for handling the application of discretionary support:

* Service for a private or third-sector employer that hires an unemployed Helsinki resident
* Service for the City Of Helsinki backoffice to handle aforementioned applications

### Benefit development with Docker

Follow the [Quick start](#quick-start) section above to set up your environment files.

Then run `yarn benefit up` or, if you want to rebuild, then `yarn benefit up --build`
  - The Applicant Frontend is now running at [localhost:3000](https://localhost:3000)
  - The Handler Frontend is now running at [localhost:3100](https://localhost:3100)
  - The backend is now running at [localhost:8000](https://localhost:8000)

## Maintaining and known issues

### Maintenance tasks (Kesäseteli)

* **Annual:** Create summer voucher configuration for the new year:
  ```bash
  docker exec -it kesaseteli-backend python manage.py create_summervoucher_configuration --year <YEAR>
  ```
* **After deploy:** Sync email templates from files to database:
  ```bash
  docker exec -it kesaseteli-backend python manage.py ensure_email_templates
  ```
* **When models change:** Update admin permissions (e.g. after registering new models in Django Admin):
  ```bash
  docker exec -it kesaseteli-backend python manage.py setup_admin_permissions
  ```

Daily jobs (cleanup of old applications, audit log sending) run via deployment infrastructure. See [backend/kesaseteli/README.md](backend/kesaseteli/README.md) for details.

### Known issues

**GitHub action deploy fails with "rendered manifests contain a resource that already exists"**

The branch name is too long. Rename the branch and create a new PR. See [StackOverflow](https://stackoverflow.com/questions/30590083/how-do-i-rename-both-a-git-local-and-remote-branch-name).

## Git blame ignore refs

Project includes a `.git-blame-ignore-revs` file for ignoring certain commits from `git blame`.
This can be useful for ignoring e.g. formatting commits, so that it is more clear from `git blame`
where the actual code change came from. Configure your git to use it for this project with the
following command:

```shell
git config blame.ignoreRevsFile .git-blame-ignore-revs
```
