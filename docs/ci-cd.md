# CI/CD Pipeline Documentation

This document describes the Continuous Integration and Continuous Deployment (CI/CD) pipeline for the Media Pulse platform.

## Overview

The Media Pulse platform uses GitHub Actions for CI/CD pipeline automation. The pipeline is triggered on:
- Push to the `main` branch
- Pull requests targeting the `main` branch

## Pipeline Stages

The CI/CD pipeline consists of several jobs that run in sequence:

```
Lint → Test → Build → Deploy
       ↓
   Security
       ↓
 i18n Validation
       ↓
   E2E Tests
```

### 1. Lint

The lint job checks code quality and style:
- Runs ESLint on all JavaScript and TypeScript files
- Ensures code follows the project's style guide
- Fails the pipeline if there are linting errors

### 2. Test

The test job runs all automated tests:
- Basic tests to verify setup
- Frontend tests (components, hooks, utilities)
- Backend tests (routes, services, middleware)
- Integration tests
- Generates code coverage reports

### 3. Build

The build job compiles and packages the application:
- Compiles TypeScript to JavaScript
- Bundles frontend assets
- Creates production build
- Uploads build artifacts

### 4. Security Scan

The security scan job checks for vulnerabilities:
- Runs npm audit to check for vulnerable dependencies
- Uses Snyk for deeper vulnerability scanning
- Identifies security issues in the code

### 5. i18n Validation

The i18n validation job checks translation completeness:
- Ensures all required translations are present
- Checks for missing translation keys
- Validates translation format

### 6. E2E Tests

The E2E tests job runs end-to-end tests:
- Uses Playwright to test the application in real browsers
- Tests critical user flows
- Captures screenshots and videos

## Pipeline Configuration

The pipeline configuration is defined in `.github/workflows/ci.yml`.

### Environment Variables

The pipeline uses the following environment variables:
- `NODE_ENV`: The environment to run in (set to `test` during tests)
- `CI`: Set to `true` to indicate running in CI environment

### Secrets

The pipeline uses the following GitHub secrets:
- `SNYK_TOKEN`: Token for Snyk security scanning

## Adding Environment Secrets

To add environment secrets for the pipeline:

1. Go to the GitHub repository settings
2. Navigate to "Secrets and variables" → "Actions"
3. Click "New repository secret"
4. Add the secret name and value

## Local Development

Before pushing changes, you can run the same checks locally:

```bash
# Run lint check
npm run lint

# Run tests
./run-tests.sh

# Build application
npm run build
```

## Deployment Process

The deployment process is triggered after successful completion of the CI pipeline:

1. The CI pipeline runs on push to main
2. If all checks pass, deployment is triggered
3. Application is deployed to the target environment

## Troubleshooting

### Common Issues

1. **Failing Lint Checks**:
   - Run `npm run lint -- --fix` to automatically fix issues
   - Check ESLint configuration in `.eslintrc.js`

2. **Failing Tests**:
   - Run `./run-tests.sh` to run tests locally
   - Check Jest configuration in `jest.config.cjs`

3. **Build Failures**:
   - Check for TypeScript errors with `npm run type-check`
   - Verify Vite configuration in `vite.config.ts`

### CI Pipeline Logs

To view CI pipeline logs:

1. Go to the GitHub repository
2. Click on "Actions" tab
3. Select the workflow run
4. Click on the job that failed
5. Expand the step that failed to see logs

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [ESLint Documentation](https://eslint.org/docs/user-guide/getting-started)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Snyk Documentation](https://docs.snyk.io/)