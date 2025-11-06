/* ===========================================
   DISCORD EMBED CREATOR PRO - ALL FUNCTIONALITY
   Professional modular JavaScript
   =========================================== */

// Global State
let embedData = {
  title: null,
  description: null,
  url: null,
  color: 8388863, // Purple default
  timestamp: null,
  footer: null,
  image: null,
  thumbnail: null,
  author: null,
  fields: []
};

let messageData = {
  username: null,
  avatar_url: null,
  content: null
};

let webhooks = [];
let activeWebhook = null;
let templates = {};
let currentLang = 'en';
let currentTheme = 'light';

// Translations
const translations = {
  en: {
    // App & Header
    "app_title": "Discord Embed Creator",
    "btn_webhooks": "Webhooks",
    "btn_json": "JSON",
    "btn_templates": "Templates",
    "btn_settings": "Settings",
    "theme_toggle": "Toggle Theme",
    "lang_en": "English",
    "lang_es": "Español",
    // Left Column
    "optional_elements": "OPTIONAL ELEMENTS",
    "element_author": "Author",
    "element_footer": "Footer",
    "element_image": "Image",
    "element_thumbnail": "Thumbnail",
    "element_fields": "Fields",
    "drag_to_add": "Drag to preview",
    // Action Buttons
    "btn_clear_all": "Clear All",
    "btn_reset": "Reset",
    // Send & Webhook
    "btn_send_message": "Send Message",
    "btn_sending": "Sending...",
    "btn_change_webhook": "Change Webhook",
    "webhook_not_configured": "No Webhook Configured",
    "webhook_configure_message": "To send messages to Discord, you need to configure a webhook first.",
    "webhook_click_to_add": "Click Webhooks to add one.",
    "webhook_sending_to": "Sending to:",
    "msg_sent_success": "Message sent successfully!",
    "msg_sent_error": "Error sending message",
    
    "app_title": "Discord Embed Creator",
    "webhooks": "Webhooks",
    "json": "JSON",
    "templates": "Templates",
    "toggle_theme": "Toggle theme",
    "btn_webhooks": "Webhooks",
    "btn_json": "JSON",
    "btn_templates": "Templates",
    "btn_settings": "Settings",
    "optional_elements": "OPTIONAL ELEMENTS",
    "element_author": "Author",
    "element_footer": "Footer",
    "element_image": "Image",
    "element_thumbnail": "Thumbnail",
    "element_fields": "Fields",
    "drag_to_add": "Drag to preview",
    "no_webhook": "⚠️ No webhook configured. Click Webhooks to add one.",
    "webhook_ready": "✅ Ready to send to:",
    "send_message": "Send Message",
    "sending": "Sending...",
    "clear": "Clear",
    "reset": "Reset",
    "btn_clear_all": "Clear All",
    "btn_reset": "Reset",
    "btn_sending": "Sending...",
    "msg_sent_success": "Message sent successfully!",
    "msg_sent_error": "Error sending message",
    msg_cleared: 'Preview cleared!',
    msg_reset_complete: 'Reset to default state.',
    msg_confirm_delete: 'This will clear all content. Continue?',
    msg_confirm_reset: 'This will reset everything to default. Continue?',
    edit_title: 'Edit Title',
    edit_description: 'Edit Description',
    edit_bot: 'Edit Bot Settings',
    edit_message: 'Edit Message Content',
    edit_color: 'Edit Embed Color',
    edit_author: 'Edit Author',
    edit_footer: 'Edit Footer',
    edit_image: 'Edit Image',
    edit_thumbnail: 'Edit Thumbnail',
    add_field: 'Add Field',
    edit_field: 'Edit Field',
    webhook_management: 'Webhook Management',
    add_webhook: 'Add Webhook',
    webhook_url: 'Webhook URL',
    webhook_nickname: 'Nickname (optional)',
    saved_webhooks: 'Saved Webhooks',
    template_management: 'Template Management',
    save_template: 'Save Current Template',
    saved_templates: 'Saved Templates',
    load: 'Load',
    share: 'Share',
    delete: 'Delete',
    json_management: 'JSON Management',
    import_json: 'Import JSON',
    export_json: 'Export JSON',
    copy_json: 'Copy JSON',
    view_json: 'View JSON',
    cancel: 'Cancel',
    save: 'Save',
    ok: 'OK',
    title: 'Title',
    description: 'Description',
    url: 'URL',
    url_optional: 'URL (optional - makes title clickable)',
    color: 'Color',
    text_click_to_edit: 'Click to edit',
    formatting: 'Formatting',
    bold: 'Bold',
    italic: 'Italic',
    underline: 'Underline',
    strikethrough: 'Strikethrough',
    code: 'Code',
    link: 'Link',
    bot_username: 'Bot Username',
    avatar_url: 'Avatar URL',
    message_content: 'Message Content',
    author_name: 'Author Name',
    author_url: 'Author URL (optional)',
    author_icon: 'Author Icon URL',
    footer_text: 'Footer Text',
    footer_icon: 'Footer Icon URL',
    image_url: 'Image URL',
    thumbnail_url: 'Thumbnail URL',
    field_name: 'Field Name',
    field_value: 'Field Value',
    inline: 'Inline',
    remove: 'Remove',
    placeholder_username: 'Click to add bot username',
    placeholder_message: 'Click to add message content',
    placeholder_title: 'Click to add title',
    placeholder_description: 'Click to add description',
    webhook_help_title: 'How to get a Webhook URL',
    webhook_help_intro: 'There are two ways to create a webhook:',
    webhook_method_1_title: 'Method 1: Server Settings',
    webhook_method_1_step1: '1. Go to your Discord server',
    webhook_method_1_step2: '2. Click on Server Settings (gear icon)',
    webhook_method_1_step3: '3. Go to Integrations section',
    webhook_method_1_step4: '4. Click on Webhooks',
    webhook_method_1_step5: '5. Click "Create Webhook"',
    webhook_method_1_step6: '6. Select the channel where messages will be sent',
    webhook_method_1_step7: '7. Copy the webhook URL and paste it above',
    webhook_method_2_title: 'Method 2: Channel Settings (Faster)',
    webhook_method_2_step1: '1. Right-click on the channel where you want to send messages',
    webhook_method_2_step2: '2. Click "Edit Channel"',
    webhook_method_2_step3: '3. Go to Integrations section (left sidebar)',
    webhook_method_2_step4: '4. Click on Webhooks',
    webhook_method_2_step5: '5. Click "Create Webhook"',
    webhook_method_2_step6: '6. Copy the webhook URL and paste it above',
    webhook_sending_to: 'Sending to:',
    btn_change_webhook: 'Change Webhook',
    no_webhooks_saved: 'No webhooks saved',
    no_templates_saved: 'No templates saved',
    template_name: 'Template Name:',
    use_current_time: 'Use Current Time',
    timestamp: 'Timestamp',
    timestamp_set: 'Timestamp set to now',
    max_fields: 'Maximum 25 fields allowed',
    invalid_webhook: 'Invalid Discord webhook URL',
    enter_webhook: 'Please enter a webhook URL',
    webhook_added: 'Webhook added!',
    template_deleted: 'Template deleted',
    failed_copy: 'Failed to copy',
    invalid_json: 'Invalid JSON:',
    json_imported: 'JSON imported successfully!',
    message_sent: 'Message sent successfully!',
    template_saved: 'Template saved!',
    template_loaded: 'Template loaded!',
    msg_copied_clipboard: 'Copied to clipboard!',
    btn_open_link: 'Open in New Tab',
    btn_share_link: 'Copy URL',
    label_url: 'URL',
    paste_json: 'Paste JSON:'
  },
  es: {
    "app_title": "Creador de Embeds de Discord",
    "webhooks": "Webhooks",
    "json": "JSON",
    "templates": "Plantillas",
    "toggle_theme": "Cambiar tema",
    "btn_webhooks": "Webhooks",
    "btn_json": "JSON",
    "btn_templates": "Plantillas",
    "btn_settings": "Ajustes",
    "optional_elements": "ELEMENTOS OPCIONALES",
    "element_author": "Autor",
    "element_footer": "Pie de página",
    "element_image": "Imagen",
    "element_thumbnail": "Miniatura",
    "element_fields": "Campos",
    "drag_to_add": "Arrastra a la vista previa",
    "no_webhook": "⚠️ Sin webhook configurado. Haz clic en Webhooks para añadir uno.",
    "webhook_ready": "✅ Listo para enviar a:",
    "send_message": "Enviar Mensaje",
    "sending": "Enviando...",
    "clear": "Limpiar",
    "reset": "Reiniciar",
    "btn_clear_all": "Limpiar Todo",
    "btn_reset": "Reiniciar",
    "btn_sending": "Enviando...",
    "msg_sent_success": "¡Mensaje enviado exitosamente!",
    "msg_sent_error": "Error al enviar el mensaje",
    msg_cleared: '¡Vista previa limpiada!',
    msg_reset_complete: 'Reiniciado al estado predeterminado.',
    msg_confirm_delete: 'Esto limpiará todo el contenido. ¿Continuar?',
    msg_confirm_reset: 'Esto reiniciará todo al estado predeterminado. ¿Continuar?',
    edit_title: 'Editar Título',
    edit_description: 'Editar Descripción',
    edit_bot: 'Editar Configuración del Bot',
    edit_message: 'Editar Contenido del Mensaje',
    edit_color: 'Editar Color del Embed',
    edit_author: 'Editar Autor',
    edit_footer: 'Editar Pie de página',
    edit_image: 'Editar Imagen',
    edit_thumbnail: 'Editar Miniatura',
    add_field: 'Añadir Campo',
    edit_field: 'Editar Campo',
    webhook_management: 'Gestión de Webhooks',
    add_webhook: 'Añadir Webhook',
    webhook_url: 'URL del Webhook',
    webhook_nickname: 'Apodo (opcional)',
    saved_webhooks: 'Webhooks Guardados',
    template_management: 'Gestión de Plantillas',
    save_template: 'Guardar Plantilla Actual',
    saved_templates: 'Plantillas Guardadas',
    load: 'Cargar',
    share: 'Compartir',
    delete: 'Eliminar',
    json_management: 'Gestión de JSON',
    import_json: 'Importar JSON',
    export_json: 'Exportar JSON',
    copy_json: 'Copiar JSON',
    view_json: 'Ver JSON',
    cancel: 'Cancelar',
    save: 'Guardar',
    ok: 'OK',
    title: 'Título',
    description: 'Descripción',
    url: 'URL',
    url_optional: 'URL (opcional - hace el título clickeable)',
    color: 'Color',
    text_click_to_edit: 'Haz clic para editar',
    formatting: 'Formato',
    bold: 'Negrita',
    italic: 'Cursiva',
    underline: 'Subrayado',
    strikethrough: 'Tachado',
    code: 'Código',
    link: 'Enlace',
    bot_username: 'Nombre del Bot',
    avatar_url: 'URL del Avatar',
    message_content: 'Contenido del Mensaje',
    author_name: 'Nombre del Autor',
    author_url: 'URL del Autor (opcional)',
    author_icon: 'URL del Icono del Autor',
    footer_text: 'Texto del Pie',
    footer_icon: 'URL del Icono del Pie',
    image_url: 'URL de la Imagen',
    thumbnail_url: 'URL de la Miniatura',
    field_name: 'Nombre del Campo',
    field_value: 'Valor del Campo',
    inline: 'En línea',
    remove: 'Quitar',
    placeholder_username: 'Haz clic para añadir nombre del bot',
    placeholder_message: 'Haz clic para añadir contenido del mensaje',
    placeholder_title: 'Haz clic para añadir título',
    placeholder_description: 'Haz clic para añadir descripción',
    webhook_help_title: 'Cómo obtener una URL de Webhook',
    webhook_help_intro: 'Hay dos formas de crear un webhook:',
    webhook_method_1_title: 'Método 1: Ajustes del Servidor',
    webhook_method_1_step1: '1. Ve a tu servidor de Discord',
    webhook_method_1_step2: '2. Haz clic en Ajustes del Servidor (icono de engranaje)',
    webhook_method_1_step3: '3. Ve a la sección Integraciones',
    webhook_method_1_step4: '4. Haz clic en Webhooks',
    webhook_method_1_step5: '5. Haz clic en "Crear Webhook"',
    webhook_method_1_step6: '6. Selecciona el canal donde se enviarán los mensajes',
    webhook_method_1_step7: '7. Copia la URL del webhook y pégala arriba',
    webhook_method_2_title: 'Método 2: Ajustes del Canal (Más rápido)',
    webhook_method_2_step1: '1. Haz clic derecho en el canal donde quieres enviar mensajes',
    webhook_method_2_step2: '2. Haz clic en "Editar Canal"',
    webhook_method_2_step3: '3. Ve a la sección Integraciones (barra lateral izquierda)',
    webhook_method_2_step4: '4. Haz clic en Webhooks',
    webhook_method_2_step5: '5. Haz clic en "Crear Webhook"',
    webhook_method_2_step6: '6. Copia la URL del webhook y pégala arriba',
    webhook_sending_to: 'Enviando a:',
    btn_change_webhook: 'Cambiar Webhook',
    no_webhooks_saved: 'No hay webhooks guardados',
    no_templates_saved: 'No hay plantillas guardadas',
    template_name: 'Nombre de la Plantilla:',
    use_current_time: 'Usar Hora Actual',
    timestamp: 'Marca de Tiempo',
    timestamp_set: 'Marca de tiempo establecida',
    max_fields: 'Máximo 25 campos permitidos',
    invalid_webhook: 'URL de webhook de Discord inválida',
    enter_webhook: 'Por favor ingresa una URL de webhook',
    webhook_added: '¡Webhook añadido!',
    template_deleted: 'Plantilla eliminada',
    failed_copy: 'Error al copiar',
    invalid_json: 'JSON inválido:',
    json_imported: '¡JSON importado exitosamente!',
    message_sent: '¡Mensaje enviado exitosamente!',
    template_saved: '¡Plantilla guardada!',
    template_loaded: '¡Plantilla cargada!',
    msg_copied_clipboard: '¡Copiado al portapapeles!',
    btn_open_link: 'Abrir en Nueva Pestaña',
    btn_share_link: 'Copiar URL',
    label_url: 'URL',
    paste_json: 'Pegar JSON:'
  }
};

// Ensure translation map is as exhaustive as instructions (see instructions for all keys).

const colorPresets = [
  { name: 'Purple', hex: '#7c3aed', decimal: 8140525 },
  { name: 'Cyan', hex: '#06b6d4', decimal: 441044 },
  { name: 'Green', hex: '#57F287', decimal: 5763719 },
  { name: 'Yellow', hex: '#FEE75C', decimal: 16705372 },
  { name: 'Red', hex: '#ED4245', decimal: 15548997 },
  { name: 'White', hex: '#FFFFFF', decimal: 16777215 }
];

// Utility Functions
function t(key) {
  return translations[currentLang][key] || key;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text || '';
  return div.innerHTML;
}

function parseMarkdown(text) {
  if (!text) return '';
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
  html = html.replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^\*]+)\*/g, '<em>$1</em>');
  html = html.replace(/__([^_]+)__/g, '<u>$1</u>');
  html = html.replace(/~~([^~]+)~~/g, '<s>$1</s>');
  html = html.replace(/`([^`]+)`/g, '<code style="background: rgba(0,0,0,0.3); padding: 2px 4px; border-radius: 3px; font-family: monospace;">$1</code>');
  html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" target="_blank" style="color: #00b0f4; text-decoration: underline;">$1</a>');
  const lines = html.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('&gt;')) {
      lines[i] = '<span style="border-left: 3px solid #4f545c; padding-left: 8px; display: block; color: #b9bbbe;">' + lines[i].substring(4).trim() + '</span>';
    }
  }
  html = lines.join('\n');
  html = html.replace(/^- (.+)$/gm, '<span style="display: block;">• $1</span>');
  html = html.replace(/\n/g, '<br>');
  return html;
}

function showNotification(message, type = 'info') {
  const notif = document.createElement('div');
  notif.className = `notification notification-${type} ${type}` + (type === 'warning' ? ' notification-warning' : '');
  notif.setAttribute('translate', 'yes');
  notif.textContent = message;
  document.body.appendChild(notif);
  setTimeout(() => {
    notif.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notif.remove(), 300);
  }, 3000);
}

function copyToClipboard(text, successMsg) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showNotification(successMsg || t('msg_copied_clipboard'), 'success');
    }).catch(() => {
      fallbackCopy(text, successMsg);
    });
  } else {
    fallbackCopy(text, successMsg);
  }
}

function fallbackCopy(text, successMsg) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  document.body.appendChild(textArea);
  try {
    textArea.select();
    document.execCommand('copy');
    showNotification(successMsg || t('msg_copied_clipboard'), 'success');
  } catch (err) {
    showNotification(t('failed_copy'), 'error');
  }
  document.body.removeChild(textArea);
}

// Initialize
function init() {
  const browserLang = navigator.language.startsWith('es') ? 'es' : 'en';
  currentLang = browserLang;
  document.documentElement.lang = currentLang;
  document.documentElement.setAttribute('data-language', currentLang);
  document.getElementById('languageSelect').value = browserLang;
  applyTranslations();
  updateButtonTitles();
  checkURLParams();
  updatePreview();
  updateWebhookStatus();
  initDragAndDrop();
  setupEventListeners();
}

function setupEventListeners() {
  document.getElementById('btnWebhooks').addEventListener('click', openWebhooksModal);
  document.getElementById('btnJSON').addEventListener('click', openJSONModal);
  document.getElementById('btnTemplates').addEventListener('click', openTemplatesModal);
  document.getElementById('btnTheme').addEventListener('click', toggleTheme);
  document.getElementById('btnClearAll').addEventListener('click', clearAllContent);
  document.getElementById('btnReset').addEventListener('click', resetToDefault);
  document.getElementById('btnSendMessage').addEventListener('click', sendMessage);
  document.getElementById('btnChangeWebhook').addEventListener('click', openWebhooksModal);
  document.getElementById('languageSelect').addEventListener('change', (e) => changeLang(e.target.value));
  document.getElementById('botAvatarWrapper').addEventListener('click', editBotSettings);
  
  // Click handlers for preview elements
  document.getElementById('botUsername').addEventListener('click', editBotSettings);
  document.getElementById('messageText').addEventListener('click', editMessageContent);
  document.getElementById('embedColorIndicator').addEventListener('click', editColor);
  document.getElementById('embedTitle').addEventListener('click', editTitle);
  document.getElementById('embedDescription').addEventListener('click', editDescription);
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[currentLang][key]) {
      el.textContent = translations[currentLang][key];
    }
  });
  updateAllPlaceholders();
}

function updateButtonTitles() {
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.dataset.i18nTitle;
    const translatedText = translations[currentLang][key] || key;
    el.title = translatedText;
    el.setAttribute('aria-label', translatedText);
  });
}

function updateAllPlaceholders() {
  const placeholderMap = {
    'messageText': 'placeholder_message',
    'embedTitle': 'placeholder_title',
    'embedDescription': 'placeholder_description'
  };
  Object.entries(placeholderMap).forEach(([elemId, i18nKey]) => {
    const elem = document.getElementById(elemId);
    if (elem && elem.classList.contains('empty')) {
      elem.setAttribute('data-placeholder', t(i18nKey));
    }
  });
}

function changeLang(lang) {
  currentLang = lang;
  document.documentElement.lang = lang;
  document.documentElement.setAttribute('data-language', lang);
  applyTranslations();
  updateButtonTitles();
  updateWebhookStatus();
  updatePreview();
}

function toggleTheme() {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', currentTheme);
  updatePreview();
}

function updatePreview() {
  const username = messageData.username || 'Webhook Bot';
  const avatar = messageData.avatar_url;
  document.getElementById('botUsername').textContent = username;
  
  const currentColor = embedData.color !== null ? '#' + embedData.color.toString(16).padStart(6, '0') : '#7c3aed';
  document.getElementById('embedColorBox').style.backgroundColor = currentColor;
  
  const avatarEl = document.getElementById('botAvatar');
  if (avatar) {
    avatarEl.style.backgroundImage = `url(${avatar})`;
    avatarEl.style.backgroundSize = 'cover';
    avatarEl.textContent = '';
  } else {
    avatarEl.style.backgroundImage = 'none';
    avatarEl.textContent = username.charAt(0).toUpperCase();
  }

  const messageTextEl = document.getElementById('messageText');
  if (messageData.content) {
    messageTextEl.innerHTML = parseMarkdown(messageData.content);
    messageTextEl.classList.remove('empty');
  } else {
    messageTextEl.innerHTML = '';
    messageTextEl.classList.add('empty');
    messageTextEl.setAttribute('data-placeholder', t('placeholder_message'));
  }

  const embed = document.getElementById('embedPreview');
  const color = embedData.color !== null ? '#' + embedData.color.toString(16).padStart(6, '0') : '#7c3aed';
  embed.style.borderLeftColor = color;

  const titleEl = document.getElementById('embedTitle');
  if (embedData.title) {
    titleEl.innerHTML = parseMarkdown(embedData.title);
    titleEl.classList.remove('empty');
    if (embedData.url) {
      titleEl.classList.add('has-url');
    } else {
      titleEl.classList.remove('has-url');
    }
  } else {
    titleEl.innerHTML = '';
    titleEl.classList.add('empty');
    titleEl.classList.remove('has-url');
    titleEl.setAttribute('data-placeholder', t('placeholder_title'));
  }

  const descEl = document.getElementById('embedDescription');
  if (embedData.description) {
    descEl.innerHTML = parseMarkdown(embedData.description);
    descEl.classList.remove('empty');
  } else {
    descEl.innerHTML = '';
    descEl.classList.add('empty');
    descEl.setAttribute('data-placeholder', t('placeholder_description'));
  }

  // Author
  let existingAuthor = embed.querySelector('.embed-author');
  if (embedData.author) {
    if (!existingAuthor) {
      existingAuthor = document.createElement('div');
      existingAuthor.className = 'embed-author';
      existingAuthor.onclick = editAuthor;
      embed.insertBefore(existingAuthor, titleEl);
    }
    existingAuthor.innerHTML = `
      ${embedData.author.icon_url ? `<img src="${embedData.author.icon_url}" class="author-icon" onerror="this.style.display='none'">` : ''}
      <span class="author-name">${parseMarkdown(embedData.author.name)}</span>
    `;
  } else if (existingAuthor) {
    existingAuthor.remove();
  }

  // Fields
  let existingFields = embed.querySelector('.embed-fields');
  if (embedData.fields.length > 0) {
    if (!existingFields) {
      existingFields = document.createElement('div');
      existingFields.className = 'embed-fields';
      embed.appendChild(existingFields);
    }
    existingFields.innerHTML = embedData.fields.map((field, idx) => `
      <div class="embed-field ${!field.inline ? 'full' : ''}" onclick="editFieldByIndex(${idx})">
        <div class="field-name">${parseMarkdown(field.name)}</div>
        <div class="field-value">${parseMarkdown(field.value)}</div>
      </div>
    `).join('');
  } else if (existingFields) {
    existingFields.remove();
  }

  // Image
  let existingImage = embed.querySelector('.embed-image');
  if (embedData.image) {
    if (!existingImage) {
      existingImage = document.createElement('img');
      existingImage.className = 'embed-image';
      existingImage.onclick = editImage;
      embed.appendChild(existingImage);
    }
    existingImage.src = embedData.image.url;
    existingImage.onerror = function() { this.style.display = 'none'; };
  } else if (existingImage) {
    existingImage.remove();
  }

  // Thumbnail
  let existingThumbnail = embed.querySelector('.embed-thumbnail');
  if (embedData.thumbnail) {
    if (!existingThumbnail) {
      existingThumbnail = document.createElement('img');
      existingThumbnail.className = 'embed-thumbnail';
      existingThumbnail.onclick = editThumbnail;
      embed.appendChild(existingThumbnail);
    }
    existingThumbnail.src = embedData.thumbnail.url;
    existingThumbnail.onerror = function() { this.style.display = 'none'; };
  } else if (existingThumbnail) {
    existingThumbnail.remove();
  }

  // Footer
  let existingFooter = embed.querySelector('.embed-footer');
  if (embedData.footer || embedData.timestamp) {
    if (!existingFooter) {
      existingFooter = document.createElement('div');
      existingFooter.className = 'embed-footer';
      existingFooter.onclick = editFooter;
      embed.appendChild(existingFooter);
    }
    let footerHTML = '';
    if (embedData.footer) {
      if (embedData.footer.icon_url) {
        footerHTML += `<img src="${embedData.footer.icon_url}" class="footer-icon" onerror="this.style.display='none'">`;
      }
      footerHTML += `<span>${parseMarkdown(embedData.footer.text)}</span>`;
    }
    if (embedData.timestamp) {
      const date = new Date(embedData.timestamp);
      footerHTML += `<span>${embedData.footer ? ' • ' : ''}${date.toLocaleDateString()} ${date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</span>`;
    }
    existingFooter.innerHTML = footerHTML;
  } else if (existingFooter) {
    existingFooter.remove();
  }
}

// Drag and Drop
function initDragAndDrop() {
  document.addEventListener('dragstart', (e) => {
    if (e.target.classList.contains('draggable-item')) {
      const elementType = e.target.dataset.elementType;
      e.dataTransfer.effectAllowed = 'copy';
      e.dataTransfer.setData('text/plain', elementType);
      e.target.classList.add('dragging');
    }
  });

  const embedPreview = document.getElementById('embedPreview');
  embedPreview.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    embedPreview.classList.add('drag-over');
  });

  embedPreview.addEventListener('dragleave', (e) => {
    if (e.target === embedPreview) {
      embedPreview.classList.remove('drag-over');
    }
  });

  embedPreview.addEventListener('drop', (e) => {
    e.preventDefault();
    embedPreview.classList.remove('drag-over');
    const elementType = e.dataTransfer.getData('text/plain');
    
    switch(elementType) {
      case 'author': editAuthor(); break;
      case 'footer': editFooter(); break;
      case 'image': editImage(); break;
      case 'thumbnail': editThumbnail(); break;
      case 'fields': addField(); break;
    }
  });

  document.addEventListener('dragend', (e) => {
    if (e.target.classList.contains('draggable-item')) {
      e.target.classList.remove('dragging');
    }
  });
}

// Edit Functions
function editTitle() {
  showModal(t('edit_title'), `
    <div class="form-group">
      <label class="form-label">${t('title')}</label>
      <input type="text" class="form-input" id="modalTitle" value="${escapeHtml(embedData.title || '')}" maxlength="256">
      <div class="char-counter" id="titleCounter">0 / 256</div>
    </div>
    <div class="form-group">
      <label class="form-label">${t('url_optional')}</label>
      <input type="url" class="form-input" id="modalTitleUrl" value="${embedData.url || ''}">
    </div>
    <div class="form-group">
      <label class="form-label">${t('formatting')}</label>
      ${createFormattingToolbar('modalTitle')}
    </div>
  `, () => {
    embedData.title = document.getElementById('modalTitle').value || null;
    embedData.url = document.getElementById('modalTitleUrl').value || null;
    updatePreview();
  });
  setTimeout(() => {
    const input = document.getElementById('modalTitle');
    input.focus();
    updateCounter('modalTitle', 'titleCounter', 256);
    input.addEventListener('input', () => updateCounter('modalTitle', 'titleCounter', 256));
  }, 100);
}

function editDescription() {
  showModal(t('edit_description'), `
    ${createFormattingToolbar('modalDescription')}
    <div class="form-group">
      <label class="form-label">${t('description')}</label>
      <textarea class="form-textarea" id="modalDescription" maxlength="4096">${embedData.description || ''}</textarea>
      <div class="char-counter" id="descCounter">0 / 4096</div>
    </div>
  `, () => {
    embedData.description = document.getElementById('modalDescription').value || null;
    updatePreview();
  });
  setTimeout(() => {
    const input = document.getElementById('modalDescription');
    input.focus();
    updateCounter('modalDescription', 'descCounter', 4096);
    input.addEventListener('input', () => updateCounter('modalDescription', 'descCounter', 4096));
  }, 100);
}

function editBotSettings() {
  showModal(t('edit_bot'), `
    <div class="form-group">
      <label class="form-label">${t('bot_username')}</label>
      <input type="text" class="form-input" id="modalUsername" value="${messageData.username || ''}" maxlength="80">
    </div>
    <div class="form-group">
      <label class="form-label">${t('avatar_url')}</label>
      <input type="url" class="form-input" id="modalAvatar" value="${messageData.avatar_url || ''}">
    </div>
  `, () => {
    messageData.username = document.getElementById('modalUsername').value || null;
    messageData.avatar_url = document.getElementById('modalAvatar').value || null;
    updatePreview();
  });
}

function editMessageContent() {
  showModal(t('edit_message'), `
    ${createFormattingToolbar('modalContent')}
    <div class="form-group">
      <label class="form-label">${t('message_content')}</label>
      <textarea class="form-textarea" id="modalContent" maxlength="2000">${messageData.content || ''}</textarea>
      <div class="char-counter" id="contentCounter">0 / 2000</div>
    </div>
  `, () => {
    messageData.content = document.getElementById('modalContent').value || null;
    updatePreview();
  });
  setTimeout(() => {
    const input = document.getElementById('modalContent');
    input.focus();
    updateCounter('modalContent', 'contentCounter', 2000);
    input.addEventListener('input', () => updateCounter('modalContent', 'contentCounter', 2000));
  }, 100);
}

function editColor() {
  const currentHex = embedData.color !== null ? '#' + embedData.color.toString(16).padStart(6, '0') : '#7c3aed';
  showModal(t('edit_color'), `
    <div class="form-group">
      <label class="form-label">${t('color')}</label>
      <div class="color-picker-group">
        <input type="color" class="color-input" id="modalColor" value="${currentHex}">
        <input type="text" class="form-input" id="modalColorHex" value="${currentHex}" placeholder="#FFFFFF" style="flex: 1;">
      </div>
      <div class="color-presets">
        ${colorPresets.map(p => `
          <div class="color-preset" style="background-color: ${p.hex}; color: ${p.hex === '#FFFFFF' ? '#000' : '#fff'};" onclick="setPresetColor('${p.hex}')">
            ${p.name}
          </div>
        `).join('')}
      </div>
    </div>
  `, () => {
    const hex = document.getElementById('modalColorHex').value;
    embedData.color = parseInt(hex.replace('#', ''), 16);
    updatePreview();
  });
  setTimeout(() => {
    document.getElementById('modalColor').addEventListener('input', (e) => {
      document.getElementById('modalColorHex').value = e.target.value;
    });
    document.getElementById('modalColorHex').addEventListener('input', (e) => {
      const hex = e.target.value;
      if (hex.match(/^#[0-9A-Fa-f]{6}$/)) {
        document.getElementById('modalColor').value = hex;
      }
    });
  }, 100);
}

function setPresetColor(hex) {
  document.getElementById('modalColor').value = hex;
  document.getElementById('modalColorHex').value = hex;
}

function editAuthor() {
  showModal(t('edit_author'), `
    <div class="form-group">
      <label class="form-label">${t('author_name')}</label>
      <input type="text" class="form-input" id="modalAuthorName" value="${embedData.author?.name || ''}" maxlength="256">
    </div>
    <div class="form-group">
      <label class="form-label">${t('author_url')}</label>
      <input type="url" class="form-input" id="modalAuthorUrl" value="${embedData.author?.url || ''}">
    </div>
    <div class="form-group">
      <label class="form-label">${t('author_icon')}</label>
      <input type="url" class="form-input" id="modalAuthorIcon" value="${embedData.author?.icon_url || ''}">
    </div>
  `, () => {
    const name = document.getElementById('modalAuthorName').value;
    if (name) {
      embedData.author = {
        name: name,
        url: document.getElementById('modalAuthorUrl').value || undefined,
        icon_url: document.getElementById('modalAuthorIcon').value || undefined
      };
    } else {
      embedData.author = null;
    }
    updatePreview();
  }, embedData.author ? t('remove') : null, () => {
    embedData.author = null;
    updatePreview();
  });
}

function editFooter() {
  showModal(t('edit_footer'), `
    <div class="form-group">
      <label class="form-label">${t('footer_text')}</label>
      <input type="text" class="form-input" id="modalFooterText" value="${embedData.footer?.text || ''}" maxlength="2048">
    </div>
    <div class="form-group">
      <label class="form-label">${t('footer_icon')}</label>
      <input type="url" class="form-input" id="modalFooterIcon" value="${embedData.footer?.icon_url || ''}">
    </div>
    <div class="form-group">
      <label class="form-label">${t('timestamp')}</label>
      <button type="button" class="btn btn-secondary" onclick="setTimestampNow()" style="width: 100%;">${t('use_current_time')}</button>
    </div>
  `, () => {
    const text = document.getElementById('modalFooterText').value;
    if (text) {
      embedData.footer = {
        text: text,
        icon_url: document.getElementById('modalFooterIcon').value || undefined
      };
    } else {
      embedData.footer = null;
    }
    updatePreview();
  }, embedData.footer ? t('remove') : null, () => {
    embedData.footer = null;
    embedData.timestamp = null;
    updatePreview();
  });
}

function setTimestampNow() {
  embedData.timestamp = new Date().toISOString();
  updatePreview();
  showNotification(t('timestamp_set'), 'success');
}

function editImage() {
  showModal(t('edit_image'), `
    <div class="form-group">
      <label class="form-label">${t('image_url')}</label>
      <input type="url" class="form-input" id="modalImageUrl" value="${embedData.image?.url || ''}">
    </div>
  `, () => {
    const url = document.getElementById('modalImageUrl').value;
    embedData.image = url ? { url: url } : null;
    updatePreview();
  }, embedData.image ? t('remove') : null, () => {
    embedData.image = null;
    updatePreview();
  });
}

function editThumbnail() {
  showModal(t('edit_thumbnail'), `
    <div class="form-group">
      <label class="form-label">${t('thumbnail_url')}</label>
      <input type="url" class="form-input" id="modalThumbnailUrl" value="${embedData.thumbnail?.url || ''}">
    </div>
  `, () => {
    const url = document.getElementById('modalThumbnailUrl').value;
    embedData.thumbnail = url ? { url: url } : null;
    updatePreview();
  }, embedData.thumbnail ? t('remove') : null, () => {
    embedData.thumbnail = null;
    updatePreview();
  });
}

function addField() {
  if (embedData.fields.length >= 25) {
    showNotification(t('max_fields'), 'error');
    return;
  }
  showModal(t('add_field'), `
    <div class="form-group">
      <label class="form-label">${t('field_name')}</label>
      <input type="text" class="form-input" id="modalFieldName" maxlength="256">
    </div>
    <div class="form-group">
      <label class="form-label">${t('field_value')}</label>
      <textarea class="form-textarea" id="modalFieldValue" maxlength="1024"></textarea>
    </div>
    <div class="form-group">
      <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
        <input type="checkbox" id="modalFieldInline">
        <span>${t('inline')}</span>
      </label>
    </div>
  `, () => {
    const name = document.getElementById('modalFieldName').value;
    const value = document.getElementById('modalFieldValue').value;
    const inline = document.getElementById('modalFieldInline').checked;
    if (name && value) {
      embedData.fields.push({ name, value, inline });
      updatePreview();
    }
  });
}

function editFieldByIndex(index) {
  const field = embedData.fields[index];
  showModal(t('edit_field'), `
    <div class="form-group">
      <label class="form-label">${t('field_name')}</label>
      <input type="text" class="form-input" id="modalFieldName" value="${field.name}" maxlength="256">
    </div>
    <div class="form-group">
      <label class="form-label">${t('field_value')}</label>
      <textarea class="form-textarea" id="modalFieldValue" maxlength="1024">${field.value}</textarea>
    </div>
    <div class="form-group">
      <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
        <input type="checkbox" id="modalFieldInline" ${field.inline ? 'checked' : ''}>
        <span>${t('inline')}</span>
      </label>
    </div>
  `, () => {
    const name = document.getElementById('modalFieldName').value;
    const value = document.getElementById('modalFieldValue').value;
    const inline = document.getElementById('modalFieldInline').checked;
    if (name && value) {
      embedData.fields[index] = { name, value, inline };
      updatePreview();
    }
  }, t('remove'), () => {
    embedData.fields.splice(index, 1);
    updatePreview();
  });
}

function createFormattingToolbar(textareaId) {
  return `
    <div class="formatting-toolbar">
      <button type="button" class="format-btn" onclick="applyFormat('${textareaId}', '**', '**')" title="${t('bold')}">
        <strong>B</strong>
      </button>
      <button type="button" class="format-btn" onclick="applyFormat('${textareaId}', '*', '*')" title="${t('italic')}">
        <em>I</em>
      </button>
      <button type="button" class="format-btn" onclick="applyFormat('${textareaId}', '__', '__')" title="${t('underline')}">
        <u>U</u>
      </button>
      <button type="button" class="format-btn" onclick="applyFormat('${textareaId}', '~~', '~~')" title="${t('strikethrough')}">
        <s>S</s>
      </button>
      <button type="button" class="format-btn" onclick="applyFormat('${textareaId}', '\`', '\`')" title="${t('code')}">
        &lt;/&gt;
      </button>
      <button type="button" class="format-btn" onclick="applyLink('${textareaId}')" title="${t('link')}">
        🔗
      </button>
    </div>
  `;
}

function applyFormat(textareaId, prefix, suffix) {
  const textarea = document.getElementById(textareaId);
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const text = textarea.value;
  const selectedText = text.substring(start, end) || 'text';
  const newText = text.substring(0, start) + prefix + selectedText + suffix + text.substring(end);
  textarea.value = newText;
  textarea.focus();
  textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
}

function applyLink(textareaId) {
  const textarea = document.getElementById(textareaId);
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const text = textarea.value;
  const selectedText = text.substring(start, end) || 'link text';
  const newText = text.substring(0, start) + '[' + selectedText + '](url)' + text.substring(end);
  textarea.value = newText;
  textarea.focus();
}

function updateCounter(inputId, counterId, limit) {
  const input = document.getElementById(inputId);
  const counter = document.getElementById(counterId);
  if (!input || !counter) return;
  const len = input.value.length;
  counter.textContent = `${len} / ${limit}`;
  counter.classList.toggle('over', len > limit);
}

// Webhooks
function openWebhooksModal() {
  showModal(t('webhook_management'), `
    <div class="help-box">
      <strong>${t('webhook_help_title')}</strong>
      <p style="margin: 0.5rem 0;">${t('webhook_help_intro')}</p>
      <div style="margin: 0.75rem 0;">
        <strong>${t('webhook_method_1_title')}</strong>
        <div style="margin-left: 0.5rem; font-size: 0.85rem;">
          <div>${t('webhook_method_1_step1')}</div>
          <div>${t('webhook_method_1_step2')}</div>
          <div>${t('webhook_method_1_step3')}</div>
          <div>${t('webhook_method_1_step4')}</div>
          <div>${t('webhook_method_1_step5')}</div>
          <div>${t('webhook_method_1_step6')}</div>
          <div>${t('webhook_method_1_step7')}</div>
        </div>
      </div>
      <div style="margin: 0.75rem 0;">
        <strong>${t('webhook_method_2_title')}</strong>
        <div style="margin-left: 0.5rem; font-size: 0.85rem;">
          <div>${t('webhook_method_2_step1')}</div>
          <div>${t('webhook_method_2_step2')}</div>
          <div>${t('webhook_method_2_step3')}</div>
          <div>${t('webhook_method_2_step4')}</div>
          <div>${t('webhook_method_2_step5')}</div>
          <div>${t('webhook_method_2_step6')}</div>
        </div>
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">${t('webhook_url')}</label>
      <input type="url" class="form-input" id="newWebhookUrl" placeholder="https://discord.com/api/webhooks/...">
    </div>
    <div class="form-group">
      <label class="form-label">${t('webhook_nickname')}</label>
      <input type="text" class="form-input" id="newWebhookNick" placeholder="${t('webhook_nickname')}">
    </div>
    <button class="btn btn-primary" onclick="addWebhook()" style="width: 100%; margin-bottom: 1rem;">${t('add_webhook')}</button>
    <div class="webhook-list" id="webhookList">${renderWebhookList()}</div>
  `, null, null, null, true);
}

function renderWebhookList() {
  if (webhooks.length === 0) return `<p style="text-align: center; color: var(--text-secondary);">${t('no_webhooks_saved')}</p>`;
  return webhooks.map((w, i) => `
    <div class="webhook-item ${activeWebhook === i ? 'active' : ''}" onclick="selectWebhook(${i})">
      <div class="webhook-name">${w.nickname || 'Webhook ' + (i + 1)}</div>
      <div class="webhook-url">${w.url}</div>
      <div class="webhook-actions">
        <button class="btn-danger" onclick="event.stopPropagation(); deleteWebhook(${i})">Delete</button>
      </div>
    </div>
  `).join('');
}

function addWebhook() {
  const url = document.getElementById('newWebhookUrl').value;
  const nickname = document.getElementById('newWebhookNick').value;
  if (!url) {
    showNotification(t('enter_webhook'), 'error');
    return;
  }
  if (!url.includes('discord.com/api/webhooks/')) {
    showNotification(t('invalid_webhook'), 'error');
    return;
  }
  webhooks.push({ url, nickname });
  activeWebhook = webhooks.length - 1;
  document.getElementById('newWebhookUrl').value = '';
  document.getElementById('newWebhookNick').value = '';
  document.getElementById('webhookList').innerHTML = renderWebhookList();
  updateWebhookStatus();
  showNotification(t('webhook_added'), 'success');
}

function selectWebhook(index) {
  activeWebhook = index;
  document.getElementById('webhookList').innerHTML = renderWebhookList();
  updateWebhookStatus();
}

function deleteWebhook(index) {
  webhooks.splice(index, 1);
  if (activeWebhook === index) activeWebhook = null;
  if (activeWebhook > index) activeWebhook--;
  document.getElementById('webhookList').innerHTML = renderWebhookList();
  updateWebhookStatus();
}

function updateWebhookStatus() {
  const statusEl = document.getElementById('webhookStatus');
  const sendBtn = document.getElementById('btnSendMessage');
  const changeBtn = document.getElementById('btnChangeWebhook');
  
  if (activeWebhook !== null && webhooks[activeWebhook]) {
    const webhook = webhooks[activeWebhook];
    statusEl.className = 'webhook-status success';
    statusEl.innerHTML = `<div class="status-text"><strong>✅ ${t('webhook_sending_to')}</strong> ${escapeHtml(webhook.nickname || 'Webhook')}</div>`;
    sendBtn.disabled = false;
    changeBtn.style.display = 'block';
  } else {
    statusEl.className = 'webhook-status warning';
    statusEl.innerHTML = `<div class="status-text">${t('no_webhook')}</div>`;
    sendBtn.disabled = true;
    changeBtn.style.display = 'none';
  }
}

async function sendMessage() {
  if (activeWebhook === null) return;
  const webhook = webhooks[activeWebhook];
  const payload = buildPayload();
  const btnSend = document.getElementById('btnSendMessage');
  const btnContent = btnSend.querySelector('.btn-content');
  const btnLoading = btnSend.querySelector('.btn-loading');

  // Show loading spinner
  btnContent.style.display = 'none';
  btnLoading.style.display = 'flex';
  btnSend.disabled = true;
  // Translate loading spinner text
  btnLoading.querySelector('.loading-text').textContent = t('btn_sending');

  try {
    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (response.ok) {
      showNotification(t('msg_sent_success'), 'success');
    } else {
      const error = await response.text();
      showNotification(t('msg_sent_error') + ': ' + error, 'error');
    }
  } catch (err) {
    showNotification(t('msg_sent_error') + ': ' + err.message, 'error');
  } finally {
    btnContent.style.display = 'flex';
    btnLoading.style.display = 'none';
    btnSend.disabled = false;
  }
}

function buildPayload() {
  const payload = {};
  if (messageData.username) payload.username = messageData.username;
  if (messageData.avatar_url) payload.avatar_url = messageData.avatar_url;
  if (messageData.content) payload.content = messageData.content;
  const embed = {};
  if (embedData.title) embed.title = embedData.title;
  if (embedData.description) embed.description = embedData.description;
  if (embedData.url) embed.url = embedData.url;
  if (embedData.color !== null) embed.color = embedData.color;
  if (embedData.timestamp) embed.timestamp = embedData.timestamp;
  if (embedData.footer) embed.footer = embedData.footer;
  if (embedData.image) embed.image = embedData.image;
  if (embedData.thumbnail) embed.thumbnail = embedData.thumbnail;
  if (embedData.author) embed.author = embedData.author;
  if (embedData.fields.length > 0) embed.fields = embedData.fields;
  if (Object.keys(embed).length > 0) payload.embeds = [embed];
  return payload;
}

// JSON
function openJSONModal() {
  const payload = buildPayload();
  const json = JSON.stringify(payload, null, 2);
  showModal(t('json_management'), `
    <div style="margin-bottom: 1rem;">
      <button class="btn btn-secondary" onclick="copyJSONToClipboard()" style="width: 100%; margin-bottom: 0.5rem;">
        📋 ${t('copy_json')}
      </button>
      <button class="btn btn-secondary" onclick="importJSONPrompt()" style="width: 100%;">
        📥 ${t('import_json')}
      </button>
    </div>
    <div style="background: var(--bg-tertiary); padding: 1rem; border-radius: 0.5rem; max-height: 400px; overflow-y: auto; font-family: monospace; font-size: 0.8rem; white-space: pre;">${escapeHtml(json)}</div>
  `, null, null, null, true);
}

function copyJSONToClipboard() {
  const payload = buildPayload();
  const json = JSON.stringify(payload, null, 2);
  copyToClipboard(json, t('msg_copied_clipboard'));
}

function importJSONPrompt() {
  closeModal();
  showModal(t('import_json'), `
    <div class="form-group">
      <label class="form-label">${t('paste_json')}</label>
      <textarea class="form-textarea" id="importJSON" style="min-height: 200px; font-family: monospace;"></textarea>
    </div>
  `, () => {
    try {
      const json = JSON.parse(document.getElementById('importJSON').value);
      if (json.username) messageData.username = json.username;
      if (json.avatar_url) messageData.avatar_url = json.avatar_url;
      if (json.content) messageData.content = json.content;
      if (json.embeds && json.embeds[0]) {
        const embed = json.embeds[0];
        embedData.title = embed.title || null;
        embedData.description = embed.description || null;
        embedData.url = embed.url || null;
        embedData.color = embed.color !== undefined ? embed.color : null;
        embedData.timestamp = embed.timestamp || null;
        embedData.footer = embed.footer || null;
        embedData.image = embed.image || null;
        embedData.thumbnail = embed.thumbnail || null;
        embedData.author = embed.author || null;
        embedData.fields = embed.fields || [];
      }
      updatePreview();
      showNotification(t('json_imported'), 'success');
    } catch (err) {
      showNotification(t('invalid_json') + ' ' + err.message, 'error');
    }
  });
}

// Templates
function openTemplatesModal() {
  showModal(t('template_management'), `
    <button class="btn btn-primary" onclick="saveTemplate()" style="width: 100%; margin-bottom: 1rem;">${t('save_template')}</button>
    <div class="template-list" id="templateList">${renderTemplateList()}</div>
  `, null, null, null, true);
}

function renderTemplateList() {
  const templateArr = Object.values(templates);
  if (templateArr.length === 0) return `<p style="text-align: center; color: var(--text-secondary);">${t('no_templates_saved')}</p>`;
  return templateArr.map(tmpl => {
    const url = generateTemplateUrl(tmpl.id);
    return `
      <div class="template-item">
        <div class="template-name">${escapeHtml(tmpl.name)}</div>
        <div class="template-meta">${new Date(tmpl.created).toLocaleString()}</div>
        <div class="template-url"><small>${t('label_url')}: <code>${url}</code></small></div>
        <div class="template-actions">
          <button class="btn btn-primary" onclick="loadTemplate('${tmpl.id}')">${t('load')}</button>
          <button class="btn-copy-url" onclick="copyTemplateUrlToClipboard('${tmpl.id}')" title="Copy URL to clipboard">📋 ${t('btn_share_link')}</button>
          <button class="btn-open-url" onclick="openTemplateInNewTab('${tmpl.id}')" title="Open in new tab">🔗 ${t('btn_open_link')}</button>
          <button class="btn-danger" onclick="deleteTemplate('${tmpl.id}')">${t('delete')}</button>
        </div>
      </div>
    `;
  }).join('');
}

function generateTemplateUrl(templateId) {
  const baseURL = window.location.origin + window.location.pathname;
  return `${baseURL}?template=${templateId}`;
}

function openTemplateInNewTab(templateId) {
  const templateUrl = generateTemplateUrl(templateId);
  window.open(templateUrl, '_blank');
}

function copyTemplateUrlToClipboard(templateId) {
  const templateUrl = generateTemplateUrl(templateId);
  copyToClipboard(templateUrl, t('msg_copied_clipboard'));
}

function saveTemplate() {
  closeModal();
  showModal(t('save_template'), `
    <div class="form-group">
      <label class="form-label">${t('template_name')}</label>
      <input type="text" class="form-input" id="templateName" placeholder="My Template">
    </div>
  `, () => {
    const name = document.getElementById('templateName').value;
    if (!name) return;
    const templateId = `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    templates[templateId] = {
      id: templateId,
      name: name,
      embedData: JSON.parse(JSON.stringify(embedData)),
      messageData: JSON.parse(JSON.stringify(messageData)),
      created: new Date().toISOString()
    };
    showNotification(t('template_saved'), 'success');
    setTimeout(() => openTemplatesModal(), 500);
  });
}

function loadTemplate(templateId) {
  const tmpl = templates[templateId];
  if (!tmpl) return;
  embedData = JSON.parse(JSON.stringify(tmpl.embedData));
  messageData = JSON.parse(JSON.stringify(tmpl.messageData));
  updatePreview();
  closeModal();
  showNotification(t('template_loaded'), 'success');
}

function deleteTemplate(templateId) {
  delete templates[templateId];
  document.getElementById('templateList').innerHTML = renderTemplateList();
  showNotification(t('template_deleted'), 'info');
}

function checkURLParams() {
  const params = new URLSearchParams(window.location.search);
  const templateId = params.get('template');
  if (templateId && templates[templateId]) {
    loadTemplate(templateId);
    showNotification(t('template_loaded') + ' ✅', 'success');
  }
}

// Actions
function clearAllContent() {
  if (confirm(t('msg_confirm_delete'))) {
    embedData = {
      title: null,
      description: null,
      url: null,
      color: 8388863,
      timestamp: null,
      footer: null,
      image: null,
      thumbnail: null,
      author: null,
      fields: []
    };
    messageData = { username: null, avatar_url: null, content: null };
    updatePreview();
    showNotification(t('msg_cleared'), 'info');
  }
}

function resetToDefault() {
  if (confirm(t('msg_confirm_reset'))) {
    embedData = {
      title: null,
      description: null,
      url: null,
      color: 8388863,
      timestamp: null,
      footer: null,
      image: null,
      thumbnail: null,
      author: null,
      fields: []
    };
    messageData = { username: null, avatar_url: null, content: null };
    updatePreview();
    showNotification(t('msg_reset_complete'), 'info');
  }
}

// Modal System
function showModal(title, bodyHTML, onConfirm = null, dangerBtnText = null, onDanger = null, noFooter = false) {
  const container = document.getElementById('modalContainer');
  const footerHTML = noFooter ? '' : `
    <div class="modal-footer">
      ${dangerBtnText ? `<button class="btn-danger" onclick="modalDangerAction()">${dangerBtnText}</button>` : ''}
      <button class="btn btn-secondary" onclick="closeModal()">${t('cancel')}</button>
      ${onConfirm ? `<button class="btn btn-primary" onclick="modalConfirmAction()">${t('save')}</button>` : ''}
    </div>
  `;
  container.innerHTML = `
    <div class="modal-overlay" onclick="closeModalOnOverlay(event)">
      <div class="modal-box scale-up">
        <div class="modal-header">
          <h3 class="modal-title">${title}</h3>
          <button class="modal-close" onclick="closeModal()">&times;</button>
        </div>
        <div class="modal-body">${bodyHTML}</div>
        ${footerHTML}
      </div>
    </div>
  `;
  window.modalConfirmCallback = onConfirm;
  window.modalDangerCallback = onDanger;
}

function modalConfirmAction() {
  if (window.modalConfirmCallback) window.modalConfirmCallback();
  closeModal();
}

function modalDangerAction() {
  if (window.modalDangerCallback) window.modalDangerCallback();
  closeModal();
}

function closeModalOnOverlay(e) {
  if (e.target.classList.contains('modal-overlay')) closeModal();
}

function closeModal() {
  document.getElementById('modalContainer').innerHTML = '';
  window.modalConfirmCallback = null;
  window.modalDangerCallback = null;
}

// Initialize on load
document.addEventListener('DOMContentLoaded', init);
