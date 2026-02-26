# Changelog (Español)
Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto se adhiere al Control de Versiones Semántico (o un equivalente visual ya que no existe package.json).

*Leer en otros idiomas: [English](CHANGELOG.md)*

## [1.1.0] - 2026-02-26
### Añadido
- Estructura de documentación estandarizada (`Utilidades/`) para persistencia de memoria de la IA.
- Archivos `sitemap.xml` y `robots.txt` para indexación en motores de búsqueda (SEO).
- Generado e implementado un Favicon moderno usando IA, libre de derechos de autor (`.png`).

### Arreglado
- Se solucionó el error de diseño en la barra lateral izquierda que se aplastaba incorrectamente en monitores verticales/retrato implementando CSS `clamp()`.
- Servicio local: Se añadió un script dinámico `<base href>` en `index.html` para permitir el funcionamiento fluido tanto en localhost como en GitHub Pages.

## [1.0.0] - 2025-11-19
### Añadido
- Lanzamiento inicial de Discord Embed Creator.
- Creación visual de embeds con vista previa en tiempo real.
- Tema claro/oscuro y cambio de idioma instantáneo (ES/EN).
- Gestión local de webhooks.
- Plantillas inteligentes para guardar, cargar y compartir diseños.
- Configuración privada y segura (todos los datos se almacenan localmente en el navegador).

[1.1.0]: https://github.com/Salmonidas/discord-embed-message-builder/compare/1.0.0...1.1.0
[1.0.0]: https://github.com/Salmonidas/discord-embed-message-builder/releases/tag/1.0.0
