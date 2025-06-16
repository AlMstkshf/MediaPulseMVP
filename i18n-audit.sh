#!/bin/bash

# Directory paths
ASSETS_DIR="./attached_assets"
LOCALES_DIR="./client/src/lib/i18n/locales"

# Check if new translation files exist
if [ ! -f "$ASSETS_DIR/new_en.ts" ] || [ ! -f "$ASSETS_DIR/new_ar.ts" ]; then
  echo "Error: New translation files not found in $ASSETS_DIR"
  exit 1
fi

# Check if target directories and files exist
if [ ! -d "$LOCALES_DIR" ]; then
  echo "Error: Locales directory not found: $LOCALES_DIR"
  exit 1
fi

if [ ! -f "$LOCALES_DIR/en.ts" ] || [ ! -f "$LOCALES_DIR/ar.ts" ]; then
  echo "Error: Target translation files not found in $LOCALES_DIR"
  exit 1
fi

# Create backup of original files
cp "$LOCALES_DIR/en.ts" "$LOCALES_DIR/en.ts.bak"
cp "$LOCALES_DIR/ar.ts" "$LOCALES_DIR/ar.ts.bak"

echo "Backup of original translation files created"

# Copy new translation files to replace existing ones
cp "$ASSETS_DIR/new_en.ts" "$LOCALES_DIR/en.ts"
cp "$ASSETS_DIR/new_ar.ts" "$LOCALES_DIR/ar.ts"

echo "Translation files updated successfully"

# Count translation keys in old and new files
EN_KEYS_BEFORE=$(grep -o '"[^"]*":' "$LOCALES_DIR/en.ts.bak" | wc -l)
AR_KEYS_BEFORE=$(grep -o '"[^"]*":' "$LOCALES_DIR/ar.ts.bak" | wc -l)
EN_KEYS_AFTER=$(grep -o '"[^"]*":' "$LOCALES_DIR/en.ts" | wc -l)
AR_KEYS_AFTER=$(grep -o '"[^"]*":' "$LOCALES_DIR/ar.ts" | wc -l)

# Generate summary report
echo ""
echo "Translation Update Report"
echo "======================="
echo ""
echo "English Translations:"
echo "- Keys before update: $EN_KEYS_BEFORE"
echo "- Keys after update: $EN_KEYS_AFTER"
echo "- Net change: $((EN_KEYS_AFTER - EN_KEYS_BEFORE))"
echo ""
echo "Arabic Translations:"
echo "- Keys before update: $AR_KEYS_BEFORE"
echo "- Keys after update: $AR_KEYS_AFTER"
echo "- Net change: $((AR_KEYS_AFTER - AR_KEYS_BEFORE))"
echo ""
echo "Translation files have been updated successfully."