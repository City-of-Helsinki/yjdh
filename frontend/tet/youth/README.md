# TET Youth

User interface for pupils (TET Job Search)

A [next.js](https://nextjs.org/) app that uses [Linked Events](https://github.com/City-of-Helsinki/linkedevents) directly as backend.

# Testing

## Unit and component tests

```bash
cd frontend/tet/youth
yarn test
yarn test index.test.tsx # single test
yarn test --watchAll # interactive mode when writing tests
```

## Browser tests

Browser tests are run for every pull request by the `te-review` workflow. They can be run locally by running TET Youth with `yarn tet-youth` and then

```bash
cd frontend/tet/youth
yarn browser-test
```
