# How to implement Accessibility

This guide establishes the accessibility (a11y) standards for developing components in **Migasfree Play**. The goal is to comply with WCAG standards and ensure the application is usable by people with diverse abilities.

---

## 1. General Rules

- **Button Identification**: Any button that contains only an icon MUST have a descriptive `aria-label` attribute.
- **Heading Hierarchy**: Do not skip heading levels. Use `h1` for the page title, `h2` for main sections, and `h3` for subsections or cards.
- **Images and Logos**: All decorative images must have `alt=""`. Informative images or logos must have a descriptive alternative text.
- **Contrast**: Ensure text has sufficient contrast with the background, especially in Dark Mode.

## 2. Common Components

### Buttons (`q-btn`)

Always use the `aria-label` property if the button has no visible text.

```vue
<q-btn icon="mdi-sync" :aria-label="$gettext('Synchronize')" />
```

### Text Inputs (`q-input`)

Always provide a label or an `aria-label` if the placeholder is not sufficient for search contexts.

```vue
<q-input v-model="search" :aria-label="$gettext('Search applications')" />
```

### Loading Indicators (`q-spinner` / `q-progress`)

When a spinner or progress bar appears dynamically, use `aria-live="polite"` on the container to inform screen reader users that activity is in progress.

## 3. Keyboard Navigation

- **Visible Focus**: Never remove the focus outline (`outline: none`) without providing a clear visual alternative.
- **Tab Order**: The tab order must be logical and follow the visual flow of the page.
- **Skip Links**: Keep the "Skip to main content" link updated in the layout.

## 4. Automation and Verification

- **ESLint**: We have enabled `eslint-plugin-vuejs-accessibility`. DO NOT ignore warnings from this plugin unless there is a justified technical reason (documented with a comment).
- **Tools**: Before releasing a new feature, verify accessibility using tools like Lighthouse or Axe DevTools in the browser.

---

_Back to [Documentation Index](../../README.md#📚-documentation)_
