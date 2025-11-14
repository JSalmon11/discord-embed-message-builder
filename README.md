# Discord Embed Creator

[English version](README.en.md)

---

**🌐 URL de la app:**   
> [https://salmonidas.github.io/discord-embed-message-builder](https://salmonidas.github.io/discord-embed-message-builder/)

---

## ¿Qué es Discord Embed Creator?

Un generador visual avanzado de mensajes embed para Discord, diseñado para facilitar la creación profesional, gestión y envío de mensajes rich media mediante webhooks.  
Permite guardar plantillas, cambiar idiomas y temas, y gestionar múltiples webhooks de forma local y segura.

---

## Funcionalidades Principales

- **Creación visual de embeds:** Rellena los campos desde el panel lateral y visualiza los cambios en tiempo real.
- **Tema claro/oscuro y cambio de idioma instantáneo (ES/EN).**
- **Gestión local de webhooks:** Añade, modifica o elimina tus URLs de Discord webhooks. Totalmente aislados entre página principal y plantillas.
- **Plantillas inteligentes:** Guarda, carga y comparte diseños como enlaces únicos. Las plantillas mantienen su configuración de webhooks independiente.
- **Previsualización en tiempo real del resultado final.**
- **Sistema claro de modales** para notificaciones, errores y confirmaciones (sin popups invasivos).
- **Contadores de caracteres** en todos los campos para respetar los límites de Discord.
- **Centro de ayuda** con tutorial práctico en video y guía paso a paso.
- **Soporte completo para emojis, caracteres especiales, URLs y elementos multimedia.**
- **Configuración privada y segura:** Todos tus datos (webhooks, plantillas, preferencias) se guardan únicamente en tu navegador.
- **Legal completo:** Política de Privacidad, Términos de Uso y Cookies accesibles en el footer.

---

## Cómo usar cada apartado

### 1. Embeds

- Completa los datos en el panel lateral (título, descripción, color, autor, pie, imagen, miniatura, campos personalizados).
- Los cambios se muestran en la vista previa de inmediato.
- Utiliza el validador integrado para asegurar que todos los campos cumplen con los requisitos de Discord.

### 2. Webhooks

- Añade tu(s) URL(s) de webhook de Discord.
- Cambia entre ellas rápidamente o asigna una por plantilla.
- El sistema previene la contaminación entre página principal y plantillas (cada contexto tiene sus propios webhooks).
- Prueba tu webhook antes de enviar mensajes importantes.

### 3. Plantillas

- Guarda cualquier diseño como plantilla, genera un enlace único y compártelo.
- Carga plantillas guardadas desde el gestor de plantillas.
- Las plantillas son totalmente independientes en cuanto a configuración de webhooks y datos.
- Exporta plantillas como JSON para respaldos o importación en otros sistemas.

### 4. Centro de Ayuda

- Accede a tutoriales visuales, ejemplos prácticos y preguntas frecuentes.
- Reporta errores o sugiere mejoras usando el botón de GitHub Issues.
- Consulta la sección de video tutorial para aprender funciones avanzadas.

---

## Buenas prácticas y consejos

- **Guarda enlaces de tus plantillas favoritas** como acceso directo para tenerlas siempre a mano.
- **No te preocupes por la privacidad:** Todo se queda en tu navegador; nadie accede a tus embeds o webhooks.
- **Utiliza el sistema de notificaciones** para saber si hay errores, confirmaciones de guardado, etc.
- **Siempre revisa los límites de Discord:** El validador integrado evita enviar embeds malformados.
- **Reporta cualquier bug** mediante el botón de Issues en la ayuda.
- **Cambia el idioma y el tema** a tu gusto en cualquier momento; tus preferencias se guardan automáticamente.
- **El banner de donación** y el corazón son opcionales y no afectan tu experiencia.

---

## Notas Técnicas y de Seguridad

### Validaciones

- Las URLs deben tener formato válido (`http://` o `https://`).
- Los colores hexadecimales se validan antes de guardar.
- Cada campo requerido muestra error si falta información.
- Los embeds se validan contra los límites oficiales de Discord antes de enviar.

### Gestión de Webhooks

- Los webhooks y plantillas son independientes; los cambios en plantillas NO afectan tu configuración principal.
- Cada webhook se prueba antes de asignarse para evitar errores en el envío.
- Los webhooks se guardan localmente en tu navegador de forma segura.

### Exportación e Importación

- Puedes exportar cualquier embed como JSON válido para usarlo en otros bots o herramientas.
- Importa plantillas desde JSON para reutilizar diseños de otros usuarios.
- Todos los datos exportados mantienen compatibilidad con la API de Discord.

### Internacionalización

- La web está disponible en español e inglés, con traducción automática de toda la interfaz.
- Los cambios de idioma se aplican instantáneamente sin perder tu trabajo.

---

## Cómo reportar errores o sugerir mejoras

- Dirígete al **Centro de Ayuda** (ícono de signo de interrogación).
- Pulsa el botón **"Reportar error"** para abrir un Issue en GitHub.
- Adjunta capturas de pantalla, descripción clara y pasos para reproducir el problema si es posible.
- También puedes sugerir nuevas funcionalidades de la misma forma.

---

## Privacidad y Almacenamiento

Todos tus datos se almacenan exclusivamente en tu navegador:
- **Webhooks:** Almacenados en tu dispositivo, no en servidores remotos.
- **Plantillas:** Guardadas localmente con acceso compartible mediante enlace único.
- **Preferencias:** Idioma, tema y configuración guardados en tu navegador.
- **Embeds:** Nunca se transmiten ni se almacenan en servidores externos.

Consulta la **Política de Privacidad** en el footer para más detalles.

---

## Requisitos y Navegadores Soportados

- **Navegadores:** Chrome, Firefox, Safari, Edge (versiones recientes).
- **JavaScript:** Debe estar habilitado.
- **Almacenamiento local:** Tu navegador debe permitir almacenamiento local (localStorage).

---

¡Disfruta creando tus mensajes embed para Discord!

Para más información o soporte, contacta a través del Centro de Ayuda o abre un Issue en GitHub.