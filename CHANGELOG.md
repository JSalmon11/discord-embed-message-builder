# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to Semantic Versioning (or visual equivalent since no package.json exists).

*Read this in other languages: [Español](CHANGELOG-es.md)*

## [1.2.0] - 2026-07-02
### Added
- Dual donation system (Lemon Squeezy + GitHub Sponsors) via unified modal.
- Permanent "Don't show again" option for the donation banner.
- New Legal Notice page for EU compliance.

### Changed
- Improved donation API calls to prevent rate-limiting issues.
- Major update to Privacy Policy, Terms of Use, and Cookie Policy for EU compliance (ARSULIPO, local storage details, AGPL-3.0).

## [1.1.1] - 2026-03-13
### Changed
- Removed all PayPal references for legal/privacy reasons.
- Enabled GitHub API auto-detection for GitHub Sponsors in the donation button (no code changes needed for future activation).
- Appended cache-busting version parameters to CSS and JS links to satisfy deployment verification hooks.

## [1.1.0] - 2026-02-26
### Added
- Standardized documentation structure (`Utilidades/`) for AI memory persistence.
- Added `sitemap.xml` and `robots.txt` for search engine indexing.
- Generated and implemented an AI, copyright-free `.png` Favicon.

### Fixed
- Fixed left sidebar layout collapsing incorrectly on portrait desktop monitors by implementing CSS `clamp()`.
- Fixed local serving: Added dynamic `<base href>` script to `index.html` to allow seamless local vs GitHub Pages functionality.

## [1.0.0] - 2025-11-19
### Added
- Initial release of Discord Embed Creator.
- Visual creation of embeds with real-time preview.
- Light/Dark theme and instant language switching (ES/EN).
- Local webhook management.
- Smart templates to save, load, and share designs.
- Private and secure configuration (all data is stored locally in the browser).

[1.2.0]: https://github.com/Salmonidas/discord-embed-message-builder/compare/1.1.1...1.2.0
[1.1.1]: https://github.com/Salmonidas/discord-embed-message-builder/compare/1.1.0...1.1.1
[1.1.0]: https://github.com/Salmonidas/discord-embed-message-builder/compare/1.0.0...1.1.0
[1.0.0]: https://github.com/Salmonidas/discord-embed-message-builder/releases/tag/1.0.0
