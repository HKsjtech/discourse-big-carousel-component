# CODEBUDDY.md

This file provides guidance to CodeBuddy when working with code in this repository.

## Project Overview

This is a **Discourse theme component** that renders a full-width hero carousel with configurable slides. Slides can be static content or dynamic user profile cards that fetch activity data via Discourse's API.

## Development Commands

- **Install dependencies**: `yarn install`
- **Lint JavaScript**: `yarn eslint javascripts/`
- **Format code**: Add/format command via Prettier (`.prettierrc` is empty/default)
- **Template linting**: Run via Discourse CI workflow (`.github/workflows/discourse-theme.yml`)

Linting is configured via:
- `.eslintrc` - Uses `eslint-config-discourse`, ignores `javascripts/vendor/*` and `assets/*`
- `.template-lintrc.js` - Uses `ember-template-lint-plugin-discourse` with `discourse:recommended` rules

## Architecture

### Component Lifecycle

The carousel uses Discourse's plugin outlet system with two mount points configurable via `settings.yml`:
- `below-site-header` - Below the site header
- `above-main-container` - Above the main content

Connectors (`javascripts/discourse/connectors/*/big-connector.hbs`) conditionally render the `{{big-carousel}}` component based on the `plugin_outlet` setting.

### JavaScript Component (`big-carousel.js`)

The Ember component:
1. Parses `settings.big_carousel_slides` JSON on init
2. Listens to `page:changed` events via `appEvents.on("page:changed", ...)` to reinitialize on route changes
3. Filters slides by `slide_type`:
   - **"slide"** - Static slides with headline, text, button, background
   - **"user"** - Dynamic slides fetching `/u/{username}.json` and `/user_actions.json` for user profile cards
4. Calls `ensureSlider()` which loads tiny-slider from `settings.theme_uploads_local.tiny_slider` and initializes the carousel

### Template Structure (`big-carousel.hbs`)

- Outer wrapper `.custom-big-carousel` contains slides container, nav, and prev/next buttons
- Two `{{#each}}` blocks render `bigStaticSlides` and `bigUserSlides` separately
- User slides include `{{avatar}}` helper and `{{html-safe}}` for activity excerpts
- Navigation dots created by iterating over combined slides array
- `{{conditional-loading-spinner}}` shows during data fetching

### Styling Organization

| File | Purpose |
|------|---------|
| `common/common.scss` | Main carousel layout, slide positioning, user activity cards |
| `mobile/mobile.scss` | Hides nav arrows on mobile, adjusts padding |
| `stylesheets/tiny-slider/tiny-slider.scss` | Tiny-slider library base styles (vendor reset) |

Key selectors: `.custom-big-carousel`, `.custom-big-carousel-slide`, `.custom-big-carousel-content`, `.user-slide`, `.bc-user-activity`

### Settings (`settings.yml`)

| Setting | Type | Purpose |
|---------|------|---------|
| `show_on` | enum | Display condition: `homepage`, `top_menu`, `all` |
| `big_carousel_slides` | JSON | Array of slide objects |
| `big_carousel_min_height` | string | Minimum height (default: `300px`) |
| `big_carousel_autoplay` | bool | Enable autoplay |
| `big_carousel_speed` | integer | Transition speed in ms |
| `plugin_outlet` | enum | Mount point location |

Slide object schema: `link`, `headline`, `text`, `text_bg`, `button_text`, `image_url`, `slide_bg_color`, `slide_type`

### Globals Available

ESLint config exposes these as read-only:
- `settings` - Theme settings object
- `themePrefix` - Theme prefix string
