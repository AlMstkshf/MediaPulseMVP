# Scripts Documentation

The `scripts/` directory contains a collection of utility scripts designed to automate various development, maintenance, and administrative tasks within the MediaPulse MVP project. These scripts are typically executed from the command line and help streamline workflows, manage data, and assist with internationalization (i18n) processes.

## 1. Project Structure and Overview

The scripts are primarily written in TypeScript or JavaScript and cover a range of functionalities:

*   **Data Management**: Scripts for seeding databases, adding specific data, or updating existing data.
*   **Internationalization (i18n)**: Tools for extracting, merging, and updating translation files.
*   **Build and Deployment Helpers**: Scripts that assist with the build process or prepare the application for deployment.
*   **Testing Utilities**: Scripts that support testing workflows.

## 2. Detailed Script Descriptions

### `scripts/add-ajman-posts.ts`

*   **Purpose**: This script is likely used to add specific "Ajman posts" data to the database. This could be for initial data population, testing, or specific content updates.
*   **Usage**: `ts-node scripts/add-ajman-posts.ts` (assuming `ts-node` is configured).

### `scripts/append-translations.ts`

*   **Purpose**: Appends new translation entries to existing translation files. This is useful when new keys are introduced and need to be added to language files without overwriting existing translations.
*   **Usage**: `ts-node scripts/append-translations.ts [options]`

### `scripts/direct-update-lang.js`

*   **Purpose**: A JavaScript script for directly updating language files. This might be a simpler or older version of translation update logic compared to the TypeScript ones.
*   **Usage**: `node scripts/direct-update-lang.js [options]`

### `scripts/extract-translations.ts`

*   **Purpose**: Scans the codebase to extract translatable strings (e.g., marked with an i18n function) and generates a base translation file (e.g., `en.json` or `template.json`). This is a crucial step in the i18n workflow.
*   **Usage**: `ts-node scripts/extract-translations.ts [options]`

### `scripts/fix-build.js`

*   **Purpose**: This script is likely used to address specific issues that arise during the build process, potentially patching files or adjusting configurations to ensure a successful build.
*   **Usage**: `node scripts/fix-build.js`

### `scripts/fix-translations.ts`

*   **Purpose**: A script designed to fix inconsistencies or errors in translation files, possibly by reformatting, removing duplicates, or aligning keys.
*   **Usage**: `ts-node scripts/fix-translations.ts [options]`

### `scripts/generate-hashed-password.ts`

*   **Purpose**: Generates a hashed password, likely for administrative users or for testing purposes, ensuring that passwords are not stored in plain text.
*   **Usage**: `ts-node scripts/generate-hashed-password.ts [password]`

### `scripts/merge-translations-manual.ts`

*   **Purpose**: Merges translation files, possibly with manual conflict resolution or specific merging strategies. This might be used when automated merging is insufficient.
*   **Usage**: `ts-node scripts/merge-translations-manual.ts [options]`

### `scripts/merge-translations.ts`

*   **Purpose**: Automates the merging of translation files, combining new translations with existing ones. This is a standard part of the i18n workflow.
*   **Usage**: `ts-node scripts/merge-translations.ts [options]`

### `scripts/run-i18n-audit.ts`

*   **Purpose**: Performs an audit of the internationalization setup, checking for missing translations, unused keys, or other i18n-related issues.
*   **Usage**: `ts-node scripts/run-i18n-audit.ts`

### `scripts/run-seed.ts`

*   **Purpose**: Executes the database seeding process, populating the database with initial data required for the application to function or for development/testing. This often calls `server/seed.ts`.
*   **Usage**: `ts-node scripts/run-seed.ts`

### `scripts/seed-achievements.js`

*   **Purpose**: Specifically seeds achievement-related data into the database.
*   **Usage**: `node scripts/seed-achievements.js`

### `scripts/test-build-structure.js`

*   **Purpose**: Verifies the structure of the built application, ensuring that all necessary files are present and correctly organized after a build process.
*   **Usage**: `node scripts/test-build-structure.js`

### `scripts/update-from-combined-json.ts`

*   **Purpose**: Updates translation files or other configurations from a combined JSON source, possibly for centralized translation management.
*   **Usage**: `ts-node scripts/update-from-combined-json.ts [options]`

## 3. Usage

Most TypeScript-based scripts can be run using `ts-node` (if installed globally or as a dev dependency) or by compiling them to JavaScript first and then running with `node`. JavaScript scripts can be run directly with `node`.

**General Command Structure:**
```bash
ts-node scripts/[script-name].ts [arguments]
node scripts/[script-name].js [arguments]
```

Refer to individual script files for specific command-line arguments and usage details.