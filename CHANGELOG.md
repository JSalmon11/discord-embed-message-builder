# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to Semantic Versioning (or visual equivalent since no package.json exists).

*Read this in other languages: [Español](CHANGELOG-es.md)*

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

[1.1.0]: https://github.com/Salmonidas/discord-embed-message-builder/compare/1.0.0...1.1.0
[1.0.0]: https://github.com/Salmonidas/discord-embed-message-builder/releases/tag/1.0.0
