# Development Workflow

This document outlines the development workflow and practices for the Media Pulse platform.

## Table of Contents

1. [Development Environment](#development-environment)
2. [Git Workflow](#git-workflow)
3. [Code Quality](#code-quality)
4. [Testing](#testing)
5. [CI/CD Pipeline](#cicd-pipeline)
6. [Deployment](#deployment)
7. [Documentation](#documentation)
8. [Issue Tracking](#issue-tracking)

## Development Environment

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-organization/media-pulse.git
   cd media-pulse
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your local configuration
   ```

4. Set up the database:
   ```bash
   npm run db:push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

### Dependencies

- Node.js (v18+)
- PostgreSQL
- Git

## Git Workflow

The Media Pulse project follows a trunk-based development workflow:

### Branches

- `main`: Production-ready code
- `feature/*`: New features or enhancements
- `fix/*`: Bug fixes
- `refactor/*`: Code refactoring
- `docs/*`: Documentation updates

### Pull Requests

All changes must be made through pull requests:

1. Create a new branch from `main`:
   ```bash
   git checkout -b feature/new-feature
   ```

2. Commit your changes with clear messages:
   ```bash
   git commit -m "feat: add new feature"
   ```

3. Push your branch:
   ```bash
   git push origin feature/new-feature
   ```

4. Create a pull request in GitHub
5. Wait for CI checks to pass
6. Get approval from at least one reviewer
7. Merge into `main`

### Commit Message Format

We follow the Conventional Commits specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Types:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: Code changes that neither fix a bug nor add a feature
- `perf`: Performance improvements
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

## Code Quality

### Linting and Formatting

We use ESLint and Prettier to ensure code quality and consistency:

- Run linting:
  ```bash
  npm run lint
  ```

- Fix lint issues:
  ```bash
  npm run lint:fix
  ```

### TypeScript

- We use TypeScript for type safety
- Run type checking:
  ```bash
  npm run type-check
  ```

### Code Reviews

Code reviews focus on:
- Functionality: Does the code work as expected?
- Quality: Is the code well-written and maintainable?
- Performance: Are there any performance concerns?
- Security: Are there any security vulnerabilities?
- Tests: Is the code adequately tested?

## Testing

We use Jest for testing:

### Running Tests

- Run all tests:
  ```bash
  npm test
  ```

- Run tests with coverage:
  ```bash
  npm run test:coverage
  ```

- Run specific test types:
  ```bash
  ./run-tests.sh basic     # Basic tests
  ./run-tests.sh frontend  # Frontend tests
  ./run-tests.sh backend   # Backend tests
  ./run-tests.sh integration # Integration tests
  ```

### Writing Tests

- Unit tests should be placed next to the file they test with a `.test.ts` or `.test.tsx` extension
- Integration tests should be placed in the `tests/integration` directory
- Test files should follow the same naming convention as the files they test

## CI/CD Pipeline

Our CI/CD pipeline is defined in `.github/workflows/ci.yml` and includes:

### Pipeline Stages

1. **Lint**: Check code quality
2. **Test**: Run all tests
3. **Build**: Create production build
4. **Security**: Run security scans
5. **i18n Validation**: Check translation completeness
6. **E2E Tests**: Run end-to-end tests (if applicable)

### Workflow

1. Commit and push changes to a feature branch
2. Create a pull request
3. CI pipeline runs automatically
4. Fix any issues identified by the pipeline
5. Get PR approval and merge
6. Deployment pipeline runs automatically

## Deployment

Deployment is handled through our CI/CD pipeline:

### Environments

- **Development**: Automatic deployment from the `main` branch
- **Staging**: Manual approval required after successful build
- **Production**: Manual approval required after staging verification

### Deployment Process

1. Code is merged into `main`
2. CI/CD pipeline builds and tests the code
3. Deployment to development environment happens automatically
4. For staging/production, a manual approval step is required
5. After approval, deployment proceeds automatically

## Documentation

We maintain several types of documentation:

### Code Documentation

- Use JSDoc/TSDoc comments for functions, classes, and interfaces
- Include detailed descriptions for complex functions
- Document any non-obvious behavior

### API Documentation

- API endpoints are documented using OpenAPI/Swagger
- Documentation is available at `/api/docs` in development mode

### Project Documentation

- Architecture and design documents are in the `docs` directory
- README.md contains project overview and quickstart guide
- CONTRIBUTING.md contains contribution guidelines

## Issue Tracking

We use GitHub Issues for tracking work:

### Issue Types

- **Feature**: New functionality
- **Bug**: Something isn't working
- **Enhancement**: Improvement to existing functionality
- **Documentation**: Documentation updates
- **Task**: General task that needs to be completed

### Issue Labels

- `priority/high`: High priority issues
- `priority/medium`: Medium priority issues
- `priority/low`: Low priority issues
- `status/blocked`: Blocked by another issue
- `status/in-progress`: Currently being worked on
- `type/bug`: Bug report
- `type/feature`: Feature request
- `type/enhancement`: Enhancement request

### Issue Template

```
## Description
[Describe the issue or feature]

## Acceptance Criteria
- [What needs to be done for this to be considered complete]

## Additional Context
[Any additional information or screenshots]
```