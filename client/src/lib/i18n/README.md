# Internationalization (i18n) Guide

## Overview

This directory contains the internationalization (i18n) framework for the Ajman Police Media Intelligence Platform. The platform supports both Arabic and English languages with a consistent translation key structure.

## Structure

- `locales/`: Directory containing translation files
  - `en.ts`: English translations (source of truth)
  - `ar.ts`: Arabic translations
- `i18n.ts`: Main i18n configuration using react-i18next
- `i18n-audit.ts`: Utilities for auditing translation completeness

## Translation Key Guidelines

1. **Nesting**: Use nested objects to organize translations by feature/module:

   ```javascript
   export const enTranslations = {
     "featureName": {
       "subFeature": {
         "actionButton": "Click Me"
       }
     }
   }
   ```

2. **Interpolation**: Use double curly braces for variable interpolation:

   ```javascript
   "welcome": "Welcome, {{name}}!"
   ```

3. **Pluralization**: Use the count param and plurals:

   ```javascript
   "results": "{{count}} result",
   "results_plural": "{{count}} results"
   ```

## Using Translations in Components

```jsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('featureName.title')}</h1>
      <p>{t('featureName.description', { count: 5 })}</p>
      <button>{t('common.save')}</button>
    </div>
  );
}
```

## Adding New Translations

1. Add new keys to `en.ts` first (English is the source of truth)
2. Add corresponding keys to `ar.ts` with Arabic translations
3. Run the i18n audit to verify completeness:

```bash
npx tsx scripts/run-i18n-audit.ts
```

## Auditing Translation Status

The i18n audit will check for:

1. Missing translation keys
2. Interpolation inconsistencies
3. Overall completeness percentage

Always run the audit before submitting changes to ensure translation completeness.

## Common Keys

Frequently used keys are organized under the `common` namespace:

- `common.save`: "Save" / "حفظ"
- `common.cancel`: "Cancel" / "إلغاء"
- `common.delete`: "Delete" / "حذف"
- etc.

Always check if a common key exists before creating a new, similar key.

## Translation Maintenance Cycle

1. **Extract**: Identify new UI text that needs translation
2. **Translate**: Add translations in both languages
3. **Audit**: Run the audit script to ensure completeness
4. **Review**: Conduct visual inspection of UI in both languages
5. **Document**: Update this guide if translation patterns change