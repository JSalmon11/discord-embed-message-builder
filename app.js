let embedData = {
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
let isTemplateView = false;
let currentTemplateId = null;
let originalTemplateState = null;

const APP_VERSION = "1.2.0";

let timestampUpdateInterval = null;
let globalModalKeydownListener = null;
let isTimestampLive = false;

const memoryStorage = {};

const StorageManager = {
  PREFIX: 'discord_embed_',

  _canUseStorage() {
    try {
      const test = '__storage_test__';
      const storage = window['local' + 'Storage'];
      storage.setItem(test, test);
      storage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  },

  _setItem(key, value) {
    memoryStorage[key] = value;
    if (this._canUseStorage()) {
      try {
        const storage = window['local' + 'Storage'];
        storage.setItem(key, value);
      } catch (e) {

      }
    }
  },

  _getItem(key) {
    if (this._canUseStorage()) {
      try {
        const storage = window['local' + 'Storage'];
        const value = storage.getItem(key);
        if (value !== null) {
          memoryStorage[key] = value;
          return value;
        }
      } catch (e) {

      }
    }
    return memoryStorage[key] || null;
  },

  _removeItem(key) {
    delete memoryStorage[key];
    if (this._canUseStorage()) {
      try {
        const storage = window['local' + 'Storage'];
        storage.removeItem(key);
      } catch (e) {

      }
    }
  },

  savePreferences(prefs) {
    const data = {
      theme: prefs.theme || 'light',
      language: prefs.language || 'en',
      timestamp: new Date().toISOString()
    };
    this._setItem(this.PREFIX + 'preferences', JSON.stringify(data));
  },

  loadPreferences() {
    try {
      const data = this._getItem(this.PREFIX + 'preferences');
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  },

  saveWebhooks(webhooks) {
    this._setItem(this.PREFIX + 'webhooks', JSON.stringify(webhooks));
  },

  loadWebhooks() {
    try {
      const data = this._getItem(this.PREFIX + 'webhooks');
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  saveTemplates(templates) {
    this._setItem(this.PREFIX + 'templates', JSON.stringify(templates));
  },

  loadTemplates() {
    try {
      const data = this._getItem(this.PREFIX + 'templates');
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  },

  saveEmbedState(embedData, messageData) {
    const state = { embedData, messageData };
    this._setItem(this.PREFIX + 'currentEmbed', JSON.stringify(state));
  },

  loadEmbedState() {
    try {
      const data = this._getItem(this.PREFIX + 'currentEmbed');
      const state = data ? JSON.parse(data) : null;

      return state;
    } catch (e) {
      return null;
    }
  },

  saveActiveWebhook(index) {
    this._setItem(this.PREFIX + 'activeWebhook', String(index));
  },

  loadActiveWebhook() {
    const data = this._getItem(this.PREFIX + 'activeWebhook');
    return data !== null ? parseInt(data) : null;
  },

  saveMainWebhooks(webhooks) {
    this._setItem(this.PREFIX + 'mainWebhooks', JSON.stringify(webhooks));
  },

  loadMainWebhooks() {
    try {
      const data = this._getItem(this.PREFIX + 'mainWebhooks');
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  saveMainActiveWebhook(index) {
    this._setItem(this.PREFIX + 'mainActiveWebhook', String(index));
  },

  loadMainActiveWebhook() {
    const data = this._getItem(this.PREFIX + 'mainActiveWebhook');
    return data !== null ? parseInt(data) : null;
  },

  saveTemplateWebhooks(webhooks) {
    this._setItem(this.PREFIX + 'templateWebhooks', JSON.stringify(webhooks));
  },

  loadTemplateWebhooks() {
    try {
      const data = this._getItem(this.PREFIX + 'templateWebhooks');
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  saveTemplateActiveWebhook(index) {
    this._setItem(this.PREFIX + 'templateActiveWebhook', String(index));
  },

  loadTemplateActiveWebhook() {
    const data = this._getItem(this.PREFIX + 'templateActiveWebhook');
    return data !== null ? parseInt(data) : null;
  },

  clearAllData() {
    Object.keys(memoryStorage).forEach(key => {
      if (key.startsWith(this.PREFIX)) {
        delete memoryStorage[key];
      }
    });
    if (this._canUseStorage()) {
      try {
        const storage = window['local' + 'Storage'];
        Object.keys(storage).forEach(key => {
          if (key.startsWith(this.PREFIX)) {
            storage.removeItem(key);
          }
        });
      } catch (e) {

      }
    }
  }
};


const WebhookManager = {
  saveWebhooks: function () {
    if (isTemplateView) {
      StorageManager.saveTemplateWebhooks(webhooks);
      updateSaveTemplateChangesButton();
    } else {
      StorageManager.saveMainWebhooks(webhooks);
    }
  },
  loadWebhooks: function () {
    if (isTemplateView) {
      return StorageManager.loadTemplateWebhooks();
    } else {
      return StorageManager.loadMainWebhooks();
    }
  },
  saveActiveWebhook: function () {
    if (isTemplateView) {
      StorageManager.saveTemplateActiveWebhook(activeWebhook);
      updateSaveTemplateChangesButton();
    } else {
      StorageManager.saveMainActiveWebhook(activeWebhook);
    }
  },
  loadActiveWebhook: function () {
    if (isTemplateView) {
      return StorageManager.loadTemplateActiveWebhook();
    } else {
      return StorageManager.loadMainActiveWebhook();
    }
  }
};


let autoSaveInterval = null;


function showConfirmationModal(title, message, onConfirm, onCancel) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.setAttribute('tabindex', '-1');
  modal.innerHTML = `
    <div class="modal-content confirmation-modal">
      <div class="modal-header">
        <h3>${title}</h3>
      </div>
      <div class="modal-body">
        <p>${message}</p>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeConfirmationModal(this, false)">
          <span data-i18n="btn_cancel">${t('btn_cancel')}</span>
        </button>
        <button class="btn btn-danger" onclick="closeConfirmationModal(this, true)">
          <span data-i18n="btn_confirm">${t('btn_confirm')}</span>
        </button>
      </div>
    </div>
  `;

  modal.confirmCallback = onConfirm;
  modal.cancelCallback = onCancel;

  document.body.appendChild(modal);
  setTimeout(() => modal.focus(), 0);
}

function closeConfirmationModal(btn, confirmed) {
  const modal = btn.closest('.modal-overlay');
  if (confirmed && modal.confirmCallback) {
    modal.confirmCallback();
  } else if (!confirmed && modal.cancelCallback) {
    modal.cancelCallback();
  }
  modal.remove();
}

function showSuccessModal(title, message) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.setAttribute('tabindex', '-1');
  modal.innerHTML = `
    <div class="modal-content success-modal">
      <div class="modal-header">
        <h3>✓ ${title}</h3>
      </div>
      <div class="modal-body">
        <p>${message}</p>
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary" onclick="this.closest('.modal-overlay').remove()">
          <span data-i18n="btn_close">${t('btn_close')}</span>
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  setTimeout(() => modal.focus(), 0);
  setTimeout(() => {
    if (document.body.contains(modal)) {
      modal.remove();
    }
  }, 5000);
}

function showErrorModal(title, message) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.setAttribute('tabindex', '-1');
  modal.innerHTML = `
    <div class="modal-content error-modal">
      <div class="modal-header">
        <h3>✕ ${title}</h3>
      </div>
      <div class="modal-body">
        <p>${message}</p>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">
          <span data-i18n="btn_close">${t('btn_close')}</span>
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  setTimeout(() => modal.focus(), 0);
}

function showInfoModal(title, message) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.setAttribute('tabindex', '-1');
  modal.innerHTML = `
    <div class="modal-content info-modal">
      <div class="modal-header">
        <h3>${title}</h3>
      </div>
      <div class="modal-body">
        <p>${message}</p>
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary" onclick="this.closest('.modal-overlay').remove()">
          <span data-i18n="btn_close">${t('btn_close')}</span>
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  setTimeout(() => modal.focus(), 0);
}

const translations = {
  en: {
    "app_title": "Discord Embed Creator",
    "btn_webhooks": "Webhooks",
    "btn_json": "JSON",
    "btn_templates": "Templates",
    "btn_settings": "Settings",
    "theme_toggle": "Toggle Theme",
    "lang_en": "English",
    "lang_es": "Español",
    "optional_elements": "OPTIONAL ELEMENTS",
    "element_author": "Author",
    "element_footer": "Footer",
    "element_image": "Image",
    "element_thumbnail": "Thumbnail",
    "element_fields": "Fields",
    "drag_to_add": "Drag to preview",
    "click_to_add": "Click to add",
    "btn_clear_all": "Clear All",
    "btn_send_message": "Send Message",
    "btn_sending": "Sending...",
    "btn_change_webhook": "Change Webhook",
    "webhook_not_configured": "No Webhook Configured",
    "webhook_configure_message": "To send messages to Discord, you need to configure a webhook first.",
    "webhook_click_to_add": "Click Webhooks to add one.",
    "webhook_sending_to": "Sending to:",
    "msg_sent_success": "Message sent successfully!",
    "msg_sent_error": "Error sending message",
    "confirm_clear_title": "Clear All Content",
    "confirm_clear_message": "This will clear the preview. Your saved preferences, webhooks, and templates will not be affected.",
    "msg_success": "Success",
    "msg_cleared": "Preview cleared successfully!",
    "msg_template_saved": "Template saved!",
    "msg_template_loaded": "Template loaded!",
    "msg_copied_clipboard": "Copied to clipboard!",
    "btn_save_template_changes": "Save Template Changes",
    "msg_error": "Error",
    "msg_invalid_url": "Invalid URL format",
    "msg_invalid_json": "Invalid JSON",
    "msg_invalid_color": "Invalid color",
    "msg_template_not_found": "Template not found",
    "btn_confirm": "Confirm",
    "btn_cancel": "Cancel",
    "btn_close": "Close",
    "footer_copyright": "© 2025 Discord Embed Creator.",
    "footer_privacy": "Privacy Policy",
    "footer_terms": "Terms of Use",
    "footer_cookies": "Cookie Policy",
    "footer_donate": "Donate",
    "footer_legal_notice": "Legal Notice",
    "app_version": "Version",
    "modal_privacy_policy": "Privacy Policy",
    "modal_terms_of_use": "Terms of Use",
    "modal_cookie_policy": "Cookie Policy",
    "modal_legal_notice": "Legal Notice",
    "legal_updated": "Last updated: July 2026",
    "privacy_intro": "This Privacy Policy describes how Discord Embed Creator handles information when you use the application.",
    "privacy_section_controller": "Data Controller",
    "privacy_controller_text": "The entity responsible for the processing of your data can be consulted at the following link:",
    "privacy_controller_link_text": "Legal Identity of the Controller",
    "privacy_section_data_collection": "Data Collected",
    "privacy_data_collection_text": "This application stores data exclusively in your browser's localStorage for strictly functional purposes. The following data is stored locally on your device:",
    "privacy_data_theme": "Theme preference (light/dark)",
    "privacy_data_language": "Language selection",
    "privacy_data_webhooks": "Webhook URLs you configure",
    "privacy_data_templates": "Embed templates you save",
    "privacy_data_embed": "Current embed editing state",
    "privacy_data_consent": "Cookie consent acknowledgment status",
    "privacy_data_banner": "Donation banner display tracking",
    "privacy_data_tutorial": "Help tutorial shown status",
    "privacy_section_no_server": "No Server-Side Processing",
    "privacy_no_server_text": "This application does NOT transmit, collect, or store any personal data on external servers. All data processing happens exclusively within your browser. No user accounts, registrations, or personal data submissions exist.",
    "privacy_section_external": "Third-Party Services",
    "privacy_external_text": "The application interacts with the following external services only when you initiate the action:",
    "privacy_external_discord": "Discord Webhooks API: When you explicitly send an embed message. The data you compose is sent directly to Discord's servers. Please refer to Discord's Privacy Policy.",
    "privacy_external_github": "GitHub Pages: The application is hosted on GitHub Pages. GitHub may collect standard server logs (IP address, browser type). Please refer to GitHub's Privacy Policy.",
    "privacy_external_lemon": "Lemon Squeezy: If you choose to make a voluntary donation via Lemon Squeezy, your payment data is processed exclusively by Lemon Squeezy. We never receive or store your payment details. Please refer to Lemon Squeezy's Privacy Policy.",
    "privacy_section_image_uploads": "Image Uploads",
    "privacy_image_uploads_text": "When you upload an image from your device, the application converts it into Base64 text format and handles it entirely within your browser. This data is NOT sent to any server and is only used to generate the preview and the JSON code you send to Discord.",
    "privacy_section_retention": "Data Retention",
    "privacy_retention_text": "All locally stored data persists until you manually clear your browser's localStorage or use the browser's built-in data clearing tools. You can delete specific data at any time.",
    "privacy_section_rights": "Your Rights (ARSULIPO)",
    "privacy_rights_text": "Under the General Data Protection Regulation (GDPR), you have the following rights: Access, Rectification, Suppression, Limitation, Portability, and Opposition. Since this application does not collect personal data on any server, these rights are effectively exercised by you directly through your browser's storage controls. For any concerns, contact the data controller through the link provided above.",
    "privacy_section_contact": "Contact",
    "privacy_contact_text": "For any privacy-related questions, you may contact the developer through the legal identity link above or via the project's GitHub repository.",
    "terms_section_object": "Object",
    "terms_object_text": "These Terms of Use govern the access and use of the web application Discord Embed Creator, a visual tool for creating and sending Discord embed messages via webhooks.",
    "terms_section_license": "License & Intellectual Property",
    "terms_license_text": "This application is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0). You are free to use, modify, and distribute the source code under the terms of this license. Any modified version deployed as a network service must also make its source code available. All original design, code, and creative assets are the intellectual property of the author.",
    "terms_section_liability": "Limitation of Liability",
    "terms_liability_text": "The application is provided \"AS IS\" without any warranty. The developer shall not be held liable for any direct, indirect, incidental, or consequential damages arising from the use or inability to use this application, including but not limited to data loss or unauthorized access to Discord servers.",
    "terms_section_discord": "Discord Terms Compliance",
    "terms_discord_text": "Users must comply with Discord's Terms of Service and Community Guidelines when using webhooks through this application. The developer is not responsible for any misuse of the Discord API.",
    "terms_section_prohibited": "Prohibited Uses",
    "terms_prohibited_text": "The following uses of this application are strictly prohibited:",
    "terms_prohibited_spam": "Spam, bulk messaging, or automated mass sending",
    "terms_prohibited_harassment": "Harassment, abuse, or targeted attacks",
    "terms_prohibited_discord": "Any activity that violates Discord's Terms of Service",
    "terms_prohibited_illegal": "Any illegal activity under applicable law",
    "terms_section_changes": "Modifications",
    "terms_changes_text": "The developer reserves the right to modify these Terms at any time. Continued use of the application after changes constitutes acceptance of the new terms.",
    "terms_section_law": "Applicable Law",
    "terms_law_text": "These Terms are governed by Spanish law. Any dispute shall be submitted to the courts of the developer's domicile.",
    "cookies_section_what": "Storage Technologies Used",
    "cookies_what_text": "This application uses exclusively your browser's localStorage (not HTTP cookies) to store strictly functional data. No tracking, analytics, or marketing technologies are used.",
    "cookies_section_table_title": "Detailed Storage Table",
    "cookies_table_key": "Key",
    "cookies_table_purpose": "Purpose",
    "cookies_table_retention": "Retention",
    "cookies_table_preferences": "Stores your theme (light/dark) and language selection",
    "cookies_table_webhooks": "Stores the webhook URLs you configure",
    "cookies_table_templates": "Stores the embed templates you save",
    "cookies_table_embed": "Stores your current embed editing state",
    "cookies_table_active_webhook": "Stores which webhook is currently selected",
    "cookies_table_consent": "Records that you acknowledged the storage notice",
    "cookies_table_banner": "Tracks when the donation banner was last shown",
    "cookies_table_tutorial": "Tracks if the welcome tutorial was already shown",
    "cookies_table_retention_value": "Until you clear browser data",
    "cookies_section_exemption": "Legal Exemption Notice",
    "cookies_exemption_text": "In accordance with AEPD (Spanish Data Protection Agency) guidelines, all storage used by this application qualifies as strictly technical and necessary for the service requested by the user. Therefore, no interactive consent panel with 'Accept/Reject' options is required. The informative banner is provided as a transparency measure.",
    "cookies_section_purpose": "Purpose",
    "cookies_purpose_text": "All stored data serves exclusively to preserve your working session and preferences between visits. No data is shared with third parties or used for tracking purposes.",
    "cookies_section_control": "Your Control",
    "cookies_control_text": "You can delete all stored data at any time by clearing your browser's localStorage for this site through your browser's settings.",
    "cookies_control_note": "Note: The \"Clear All\" button in the app only clears the embed preview content, not your saved preferences, webhooks, or templates.",
    "cookie_consent_message": "This app only uses your browser's localStorage for strictly technical purposes (saving your preferences and work). No tracking or analytics cookies are used.",
    "cookie_accept": "Got it",
    "cookie_learn_more": "Learn More",
    "legal_section_object": "Object",
    "legal_object_text": "In compliance with Spanish Law 34/2002, of July 11, on Information Society Services and Electronic Commerce (LSSI-CE), the following general information about this website is provided.",
    "legal_section_ip": "Intellectual Property",
    "legal_ip_text": "All source code, design, graphic elements, and textual content of this website are the intellectual property of the author and are protected under the GNU Affero General Public License v3.0 (AGPL-3.0), as well as applicable intellectual property laws. Reproduction, distribution, or public communication is permitted exclusively under the terms of said license.",
    "legal_section_liability": "Liability Exemption",
    "legal_liability_text": "The owner is not responsible for the content of external links, the information generated by users through webhooks, or any damage derived from the improper use of this tool. The owner reserves the right to modify, suspend, or discontinue the service at any time without prior notice.",
    "legal_section_law": "Applicable Law & Jurisdiction",
    "legal_law_text": "This Legal Notice is governed by Spanish law. For the resolution of any dispute, the parties submit to the courts and tribunals of the owner's domicile.",
    "legal_section_identity": "Owner Identity",
    "legal_identity_text": "The identification details of the owner of this website, in compliance with LSSI-CE, can be consulted at the following link:",
    "legal_identity_link_text": "Legal Identity of the Owner",
    "donation_title": "Support Development",
    "donation_message": "If you find this tool useful, consider supporting the developer with a voluntary donation.",
    "donation_button": "☕ Buy me a coffee",
    "btn_donate_tooltip": "Support the developer",
    "donation_modal_title": "Support the Project 💖",
    "donation_modal_description": "Choose the method that works best for you. Every contribution helps keep this project alive and free!",
    "donation_option_lemon": "☕ Buy me a coffee (Apple Pay, Google Pay, Card, PayPal)",
    "donation_option_github": "🐙 GitHub Sponsors (one-time or recurring)",
    "donation_success": "Thank you so much for your support! 💖",
    "donation_dismiss_forever": "Don't show again",
    "donation_dismiss_title": "No problem! 💙",
    "donation_dismiss_message": "The banner won't appear again. If you ever want to support the project, you can always find the donation options through the 💖 heart icon in the header or the \"Donate\" link at the bottom of the page. Thank you for using the tool!",
    "webhooks": "Webhooks",
    "json": "JSON",
    "templates": "Templates",
    "toggle_theme": "Toggle theme",
    "home": "Home",
    "no_webhook": "⚠️ No webhook configured. Click the <svg class='webhook-icon-inline' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71'/><path d='M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71'/></svg> 'Webhooks' button in the header to add one.",
    "webhook_ready": "✅ Ready to send to:",
    "msg_confirm_delete": "This will clear all content. Continue?",
    "edit_title": "Edit Title",
    "edit_description": "Edit Description",
    "edit_bot": "Edit Bot Settings",
    "edit_message": "Edit Message Content",
    "edit_color": "Edit Embed Color",
    "edit_author": "Edit Author",
    "edit_footer": "Edit Footer",
    "edit_image": "Edit Image",
    "edit_thumbnail": "Edit Thumbnail",
    "add_field": "Add Field",
    "edit_field": "Edit Field",
    "webhook_management": "Webhook Management",
    "add_webhook": "Add Webhook",
    "webhook_url": "Webhook URL",
    "webhook_nickname": "Nickname (optional)",
    "saved_webhooks": "Saved Webhooks",
    "template_management": "Template Management",
    "save_template": "Save Current Template",
    "saved_templates": "Saved Templates",
    "load": "Load",
    "share": "Share",
    "delete": "Delete",
    "json_management": "JSON Management",
    "import_json": "Import JSON",
    "export_json": "Export JSON",
    "copy_json": "Copy JSON",
    "view_json": "View JSON",
    "cancel": "Cancel",
    "save": "Save",
    "ok": "OK",
    "title": "Title",
    "description": "Description",
    "url": "URL",
    "url_optional": "URL (optional - makes title clickable)",
    "color": "Color",
    "text_click_to_edit": "Click to edit",
    "formatting": "Formatting",
    "bold": "Bold",
    "italic": "Italic",
    "underline": "Underline",
    "strikethrough": "Strikethrough",
    "code": "Code",
    "link": "Link",
    "bot_username": "Bot Username",
    "avatar_url": "Avatar URL",
    "message_content": "Message Content",
    "author_name": "Author Name",
    "author_url": "Author URL (optional)",
    "author_icon": "Author Icon URL",
    "footer_text": "Footer Text",
    "footer_icon": "Footer Icon URL",
    "image_url": "Image URL",
    "thumbnail_url": "Thumbnail URL",
    "field_name": "Field Name",
    "field_value": "Field Value",
    "inline": "Inline",
    "remove": "Remove",
    "placeholder_username": "Click to add bot username",
    "placeholder_message": "Click to add message content",
    "placeholder_title": "Click to add title",
    "placeholder_description": "Click to add description",
    "webhook_help_title": "How to get a Webhook URL",
    "webhook_help_intro": "There are two ways to create a webhook:",
    "webhook_method_1_title": "Method 1: Server Settings",
    "webhook_method_1_step1": "1. Go to your Discord server",
    "webhook_method_1_step2": "2. Click on Server Settings (gear icon)",
    "webhook_method_1_step3": "3. Go to the Integrations section",
    "webhook_method_1_step4": "4. Click on Webhooks",
    "webhook_method_1_step5": "5. Click \"Create Webhook\"",
    "webhook_method_1_step6": "6. Select the channel where messages will be sent",
    "webhook_method_1_step7": "7. Copy the webhook URL and paste it above",
    "webhook_method_2_title": "Method 2: Channel Settings (Faster)",
    "webhook_method_2_step1": "1. Right-click on the channel where you want to send messages",
    "webhook_method_2_step2": "2. Click \"Edit Channel\"",
    "webhook_method_2_step3": "3. Go to the Integrations section (left sidebar)",
    "webhook_method_2_step4": "4. Click on Webhooks",
    "webhook_method_2_step5": "5. Click \"Create Webhook\"",
    "webhook_method_2_step6": "6. Copy the webhook URL and paste it above",
    "no_webhooks_saved": "No webhooks saved",
    "no_templates_saved": "No templates saved",
    "template_name": "Template Name:",
    "placeholder_template_name": "My Template",
    "use_current_time": "Use Current Time",
    "timestamp": "Timestamp",
    "timestamp_set": "Timestamp set",
    "max_fields": "Maximum 25 fields allowed",
    "invalid_webhook": "Invalid Discord webhook URL",
    "enter_webhook": "Please enter a webhook URL",
    "webhook_added": "Webhook added!",
    "template_deleted": "Template deleted",
    "failed_copy": "Failed to copy",
    "json_imported": "JSON imported successfully!",
    "message_sent": "Message sent successfully!",
    "btn_open_link": "Open in New Tab",
    "btn_share_link": "Copy URL",
    "label_url": "URL",
    "paste_json": "Paste JSON:",
    "color_purple": "Purple",
    "color_cyan": "Cyan",
    "color_green": "Green",
    "color_yellow": "Yellow",
    "color_red": "Red",
    "color_white": "White",
    "btn_delete": "Delete",
    "live_timestamp": "Live Timestamp",
    "shift_enter_newline": "Shift + Enter for new line",
    "field_name_value_required": "Both field name and value are required.",
    "remove_timestamp": "Remove Timestamp",
    "btn_upload_image": "Upload Image",
    "msg_img_too_large": "Image is too large. Max size: 8MB",
    "msg_img_upload_success": "Image uploaded successfully",
    "msg_img_upload_error": "Error uploading image",
    "msg_processing_image": "Processing image...",
    "msg_avatar_must_be_url": "Bot Avatar must be a public URL (http/https), local files are not supported for this field.",
    "help": "Help",
    "welcome_modal_title": "Welcome to Discord Embed Creator!",
    "welcome_modal_text": "Click the (?) button in the header to see full tutorials. If you hide this message, you can get back to the tutorials from the help button.",
    "btn_view_tutorials": "View Tutorials",
    "btn_dont_show_again": "Don't show again",
    "help_center_title": "Help Center",
    "help_section_webhooks": "Webhook Setup",
    "help_section_templates": "Template Management",
    "help_section_json": "JSON Import/Export",
    "help_section_language": "Change Language",
    "help_section_theme": "Change Theme",
    "help_section_basic": "Basic Creation",
    "help_section_editing": "Editing Elements",
    "help_section_optional": "Optional Elements",
    "help_section_fields": "Fields",
    "help_section_clear": "Clear All",
    "help_section_send": "Send Message",
    "help_title_webhooks": "Webhook Setup",
    "help_webhooks_what_is_it": "It's a Discord URL to send messages without needing to create a bot.",
    "help_webhooks_method_1": "Method 1: Server Settings",
    "help_webhooks_method_1_steps": "1. Go to your Discord server<br>2. Click on Server Settings (gear icon)<br>3. Go to the Integrations section<br>4. Click on Webhooks<br>5. Click 'Create Webhook'<br>6. Select the channel where messages will be sent<br>7. Copy the webhook URL",
    "help_webhooks_method_2": "Method 2: Channel Settings (Faster)",
    "help_webhooks_method_2_steps": "1. Right-click on the channel<br>2. Click 'Edit Channel'<br>3. Go to the Integrations section<br>4. Click 'Create Webhook'<br>5. Copy the webhook URL",
    "help_webhooks_usage": "How to use it in the app",
    "help_webhooks_usage_steps": "Click the 'Webhooks' button in the header, paste your URL, give it an optional nickname, and click 'Add Webhook'.",
    "help_webhooks_security": "Security",
    "help_webhooks_security_text": "⚠️ Never share your webhook URL publicly. Anyone with the URL can send messages to your channel.",
    "help_webhooks_templates": "Webhooks in Templates",
    "help_webhooks_templates_text": "Each saved template can have its own independent webhook.",
    "help_title_templates": "Template Management",
    "help_templates_what_are_they": "They allow you to save complete embeds in your browser's local storage for later use.",
    "help_templates_create": "How to create a template",
    "help_templates_create_steps": "Design your embed in the main preview, click the 'Templates' button in the header, and then 'Save Current Template'.",
    "help_templates_manage": "Manage Templates",
    "help_templates_manage_load": "<strong>Load:</strong> Applies the saved template to the editor, overwriting the current content.",
    "help_templates_manage_copy": "<strong>Copy URL:</strong> ⚠️ This creates a URL that only works in YOUR browser. It is NOT for sharing with others.",
    "help_templates_manage_open": "<strong>Open in new tab:</strong> Opens the template URL in a new tab.",
    "help_templates_manage_delete": "<strong>Delete:</strong> Permanently deletes the template.",
    "help_templates_webhooks": "Independent Webhooks",
    "help_templates_webhooks_text": "Each template can be associated with a specific webhook, which is saved with it.",
    "help_templates_tips": "Tips",
    "help_templates_tips_text": "Use templates for recurring messages like announcements or statuses. Save the URLs in favorites for quick access.",
    "help_video_button": "Practical Example",
    "help_video_title": "Practical Example of Use",
    "help_title_json": "JSON Import/Export",
    "help_json_what_is_it": "JSON is the official data format that Discord uses for embeds. This is what the app sends to Discord.",
    "help_json_copy": "Copy JSON",
    "help_json_copy_steps": "Click the 'JSON' button in the header, then 'Copy JSON'. This copies your current embed's code to the clipboard.",
    "help_json_import": "Import JSON",
    "help_json_import_steps": "Click 'JSON', then 'Import JSON'. Paste your code into the text area and click 'Save'.",
    "help_json_uses": "What is it for?",
    "help_json_uses_text": "It's useful for making backups, sharing the embed code with other developers, or integrating it into your own bots.",
    "help_json_errors": "Common Errors",
    "help_json_errors_text": "The most common error is 'Invalid JSON'. Make sure the code is well-formatted and all URLs are valid.",
    "help_title_language": "Change Language",
    "help_lang_available": "Available Languages",
    "help_lang_available_text": "The interface is available in English and Spanish.",
    "help_lang_selector": "Selector Location",
    "help_lang_selector_text": "You can find the language selector in the header, on the right.",
    "help_lang_saving": "Saving",
    "help_lang_saving_text": "Your language preference is automatically saved in your browser for your next visit.",
    "help_title_theme": "Change Theme",
    "help_theme_button": "Theme Button",
    "help_theme_button_text": "You can find the button to change the theme (sun/moon icon) in the header.",
    "help_theme_function": "Functionality",
    "help_theme_function_text": "Toggles the interface between a light and a dark theme.",
    "help_theme_saving": "Saving",
    "help_theme_saving_text": "Your theme preference is saved in your browser.",
    "help_theme_dark": "Dark Theme",
    "help_theme_dark_text": "Recommended to reduce eye strain, especially in low-light environments.",
    "help_theme_light": "Light Theme",
    "help_theme_light_text": "Offers better visibility in brightly lit places.",
    "help_title_basic": "Basic Creation",
    "help_basic_elements": "Main Elements",
    "help_basic_elements_text": "The core of an embed consists of a color, a title, and a description.",
    "help_basic_message": "Message Content",
    "help_basic_message_text": "You can add a standard text message above the embed by clicking 'Click to add message content'.",
    "help_basic_color": "Embed Color",
    "help_basic_color_text": "Click the color bar to open the editor. You can choose a color from the visual selector, enter a hex code, or select one of the predefined colors.",
    "help_basic_edit": "How to Edit",
    "help_basic_edit_text": "To edit the title or description, simply click on them in the preview.",
    "help_title_editing": "Editing Elements",
    "help_editing_process": "General Process",
    "help_editing_process_text": "Click on any element in the preview (title, description, author, etc.) to open an editing modal. Modify the content in the modal and click 'Save' to apply the changes or 'Cancel' to discard them. Some elements also offer a 'Remove' button to delete them completely.",
    "help_title_optional": "Optional Elements",
    "help_optional_author": "<strong>Author:</strong> Adds a section at the top with a name, an optional avatar, and a link.",
    "help_optional_footer": "<strong>Footer:</strong> A small text at the bottom, which can include an icon.",
    "help_optional_image": "<strong>Image:</strong> A large image displayed below the embed content.",
    "help_optional_thumbnail": "<strong>Thumbnail:</strong> A small image that appears in the upper right corner.",
    "help_optional_fields": "<strong>Fields:</strong> Blocks of text with a title and value, which can be displayed inline.",
    "help_optional_pc": "How to add (PC)",
    "help_optional_pc_text": "Drag the element from the left panel and drop it onto the preview, or click on it.",
    "help_optional_mobile": "How to add (Mobile)",
    "help_optional_mobile_text": "On mobile devices, you cannot drag. Simply tap the element in the left panel to open its editing modal.",
    "help_optional_reorder": "Reorder Fields",
    "help_optional_reorder_text": "Use the ⬆ and ⬇ arrow buttons that appear next to each field to change their order.",
    "help_optional_remove": "Remove Elements",
    "help_optional_remove_text": "Inside the editing modal of each optional element, you will find a 'Remove' button.",
    "help_title_fields": "Fields",
    "help_fields_block": "Block Fields",
    "help_fields_block_text": "By default, a field occupies the entire width of the embed.",
    "help_fields_max": "Maximum Fields",
    "help_fields_max_text": "Discord allows a maximum of 25 fields per embed.",
    "help_fields_reorder": "Reorder",
    "help_fields_reorder_text": "Use the arrow buttons next to each field in the preview to change its position.",
    "help_title_clear": "Clear All",
    "help_clear_resets": "Resets the Preview",
    "help_clear_resets_text": "The 'Clear All' button completely resets the preview area, deleting all message and embed content.",
    "help_clear_confirmation": "Asks for Confirmation",
    "help_clear_confirmation_text": "To prevent accidental deletions, a confirmation modal will appear.",
    "help_clear_no_delete": "What it does NOT delete",
    "help_clear_no_delete_text": "This action does not affect your saved webhooks, templates, or application preferences (like theme and language).",
    "help_title_send": "Send Message",
    "help_send_requires": "Requires Webhook",
    "help_send_requires_text": "You cannot send a message without having configured and selected an active webhook.",
    "help_send_active": "Button Activation",
    "help_send_active_text": "The 'Send Message' button will only be activated when a valid webhook is selected.",
    "help_send_sends": "Sends to Discord",
    "help_send_sends_text": "When clicked, it sends the complete embed and message to the Discord channel associated with your active webhook.",
    "btn_report_bug": "Report",
    "modal_report_bug_title": "Report",
    "report_bug_explanation": "Found a bug or have a suggestion? Help us improve the application by reporting it on GitHub Issues.",
    "report_bug_version": "Current version:",
    "report_bug_type_title": "Report type",
    "report_bug_type_explanation": "When you create your report on GitHub, use the appropriate labels:",
    "report_bug_type_bug_desc": "To report errors or problems in the application",
    "report_bug_type_enhancement_desc": "To suggest improvements or new features",
    "report_bug_type_documentation_desc": "For suggestions about the documentation",
    "report_bug_type_question_desc": "To ask questions about how it works",
    "report_bug_type_outro": "These labels help organize and prioritize reports.",
    "report_bug_info_title": "What information to include in the report?",
    "report_bug_info_1": "Clear description of the problem you encountered",
    "report_bug_info_2": "What steps you followed for the error to occur",
    "report_bug_info_3": "What you expected to happen and what actually happened",
    "report_bug_info_4": "Your browser and operating system",
    "report_bug_info_5": "Screenshots if possible",
    "report_bug_info_title_clarification": "This format is mainly for reporting errors/bugs.",
    "btn_open_github_issues": "Open GitHub Issues",
    "btn_faq": "FAQ",
    "modal_faq_title": "Frequently Asked Questions",
    "faq_q1": "How do I get my webhook URL?",
    "faq_a1_step1": "Go to your Discord server",
    "faq_a1_step2": "Click on Server Settings (gear icon)",
    "faq_a1_step3": "Go to the Integrations section",
    "faq_a1_step4": "Click on Webhooks",
    "faq_a1_step5": "Click 'Create Webhook'",
    "faq_a1_step6": "Select the channel where messages will be sent",
    "faq_a1_step7": "Copy the webhook URL",
    "faq_q2": "Can I use multiple webhooks?",
    "faq_a2": "Yes, you can add multiple webhooks and switch between them using the Webhooks button in the application header.",
    "faq_q3": "Are my webhooks and templates saved?",
    "faq_a3": "Yes, they are saved locally in your browser. They are not sent to any external server.",
    "faq_q4": "How do I export my embed to JSON?",
    "faq_a4_step1": "Click the JSON button in the header",
    "faq_a4_step2": "Click 'Copy JSON'",
    "faq_a4_step3": "You can now paste the code where you need it.",
    "faq_q5": "Can I import an embed from JSON?",
    "faq_a5_step1": "Yes, click the JSON button in the header",
    "faq_a5_step2": "Click 'Import JSON'",
    "faq_a5_step3": "Paste your JSON code and click 'Save'.",
    "faq_q6": "What webhook URL formats are valid?",
    "faq_a6_format1": "discord.com/api/webhooks/...",
    "faq_a6_format2": "discordapp.com/api/webhooks/...",
    "faq_a6_format3": "ptb.discord.com/api/webhooks/ (PTB)",
    "faq_a6_format4": "canary.discord.com/api/webhooks/ (Canary)",
    "faq_q7": "Do colors work in Discord?",
    "faq_a7": "Yes, Discord supports colors in embeds. Use the color picker or enter a hex code.",
    "faq_q8": "What is the character limit?",
    "faq_a8_title": "Title: 256 characters",
    "faq_a8_description": "Description: 4096 characters",
    "faq_a8_fields_max": "Fields: 25 fields maximum",
    "faq_a8_field_name": "Field name: 256 characters",
    "faq_a8_field_value": "Field value: 1024 characters",
    "faq_a8_embed_total": "Total embed: 6000 characters",
    "avatar_url_help_title": "About Bot Avatar URLs",
    "avatar_url_help_text": "Only public and internet-accessible URLs are allowed as bot avatars. Discord can only display the image if the address is public and does not require authentication. Private URLs, from services like Drive or local storage, will not work. For this reason, image uploads are not allowed for this field."
  },
  es: {
    "app_title": "Creador de Embeds para Discord",
    "btn_webhooks": "Webhooks",
    "btn_json": "JSON",
    "btn_templates": "Plantillas",
    "btn_settings": "Ajustes",
    "theme_toggle": "Cambiar tema",
    "lang_en": "Inglés",
    "lang_es": "Español",
    "optional_elements": "ELEMENTOS OPCIONALES",
    "element_author": "Autor",
    "element_footer": "Pie de página",
    "element_image": "Imagen",
    "element_thumbnail": "Miniatura",
    "element_fields": "Campos",
    "drag_to_add": "Arrastra a la vista previa",
    "click_to_add": "Click para añadir",
    "btn_clear_all": "Limpiar Todo",
    "btn_send_message": "Enviar Mensaje",
    "btn_sending": "Enviando...",
    "btn_change_webhook": "Cambiar Webhook",
    "webhook_not_configured": "No hay Webhook Configurado",
    "webhook_configure_message": "Para enviar mensajes a Discord, necesita configurar un webhook primero.",
    "webhook_click_to_add": "Haga clic en Webhooks para agregar uno.",
    "webhook_sending_to": "Enviando a:",
    "msg_sent_success": "¡Mensaje enviado exitosamente!",
    "msg_sent_error": "Error al enviar el mensaje",
    "confirm_clear_title": "Limpiar Todo el Contenido",
    "confirm_clear_message": "Esto limpiará la vista previa. Tus preferencias guardadas, webhooks y plantillas no serán afectados.",
    "msg_success": "Éxito",
    "msg_cleared": "¡Vista previa limpiada exitosamente!",
    "msg_template_saved": "¡Plantilla guardada!",
    "msg_template_loaded": "¡Plantilla cargada!",
    "msg_copied_clipboard": "¡Copiado al portapapeles!",
    "btn_save_template_changes": "Guardar Cambios de Plantilla",
    "msg_error": "Error",
    "msg_invalid_url": "Formato de URL inválido",
    "msg_invalid_json": "JSON inválido",
    "msg_invalid_color": "Color inválido",
    "msg_template_not_found": "Plantilla no encontrada",
    "btn_confirm": "Confirmar",
    "btn_cancel": "Cancelar",
    "btn_close": "Cerrar",
    "footer_copyright": "© 2025 Creador de Embeds de Discord.",
    "footer_privacy": "Política de Privacidad",
    "footer_terms": "Términos de Uso",
    "footer_cookies": "Política de Cookies",
    "footer_donate": "Donar",
    "footer_legal_notice": "Aviso Legal",
    "app_version": "Versión",
    "modal_privacy_policy": "Política de Privacidad",
    "modal_terms_of_use": "Términos de Uso",
    "modal_cookie_policy": "Política de Cookies",
    "modal_legal_notice": "Aviso Legal",
    "legal_updated": "Última actualización: Julio 2026",
    "privacy_intro": "Esta Política de Privacidad describe cómo Discord Embed Creator gestiona la información cuando utilizas la aplicación.",
    "privacy_section_controller": "Responsable del Tratamiento",
    "privacy_controller_text": "La entidad responsable del tratamiento de tus datos puede consultarse en el siguiente enlace:",
    "privacy_controller_link_text": "Identidad Legal del Responsable",
    "privacy_section_data_collection": "Datos Recogidos",
    "privacy_data_collection_text": "Esta aplicación almacena datos exclusivamente en el localStorage de tu navegador con fines estrictamente funcionales. Los siguientes datos se almacenan localmente en tu dispositivo:",
    "privacy_data_theme": "Preferencia de tema (claro/oscuro)",
    "privacy_data_language": "Selección de idioma",
    "privacy_data_webhooks": "URLs de webhooks que configuras",
    "privacy_data_templates": "Plantillas de embeds que guardas",
    "privacy_data_embed": "Estado actual de edición del embed",
    "privacy_data_consent": "Estado de reconocimiento del aviso de almacenamiento",
    "privacy_data_banner": "Control de visualización del banner de donación",
    "privacy_data_tutorial": "Estado del tutorial de bienvenida mostrado",
    "privacy_section_no_server": "Sin Procesamiento en Servidor",
    "privacy_no_server_text": "Esta aplicación NO transmite, recopila ni almacena ningún dato personal en servidores externos. Todo el procesamiento de datos ocurre exclusivamente dentro de tu navegador. No existen cuentas de usuario, registros ni envíos de datos personales.",
    "privacy_section_external": "Servicios de Terceros",
    "privacy_external_text": "La aplicación interactúa con los siguientes servicios externos únicamente cuando tú inicias la acción:",
    "privacy_external_discord": "API de Webhooks de Discord: Cuando envías explícitamente un mensaje embed. Los datos que compones se envían directamente a los servidores de Discord. Consulta la Política de Privacidad de Discord.",
    "privacy_external_github": "GitHub Pages: La aplicación está alojada en GitHub Pages. GitHub puede recopilar registros de servidor estándar (dirección IP, tipo de navegador). Consulta la Política de Privacidad de GitHub.",
    "privacy_external_lemon": "Lemon Squeezy: Si eliges realizar una donación voluntaria a través de Lemon Squeezy, tus datos de pago son procesados exclusivamente por Lemon Squeezy. Nosotros nunca recibimos ni almacenamos tus datos de pago. Consulta la Política de Privacidad de Lemon Squeezy.",
    "privacy_section_image_uploads": "Subida de Imágenes",
    "privacy_image_uploads_text": "Cuando subes una imagen desde tu dispositivo, la aplicación la convierte a formato de texto Base64 y la gestiona íntegramente dentro de tu navegador. Estos datos NO se envían a ningún servidor y solo se utilizan para generar la vista previa y el código JSON que envías a Discord.",
    "privacy_section_retention": "Retención de Datos",
    "privacy_retention_text": "Todos los datos almacenados localmente persisten hasta que borres manualmente el localStorage de tu navegador o utilices las herramientas de borrado de datos integradas en el navegador. Puedes eliminar datos específicos en cualquier momento.",
    "privacy_section_rights": "Tus Derechos (ARSULIPO)",
    "privacy_rights_text": "En virtud del Reglamento General de Protección de Datos (RGPD), tienes los siguientes derechos: Acceso, Rectificación, Supresión, Limitación, Portabilidad y Oposición. Dado que esta aplicación no recopila datos personales en ningún servidor, estos derechos los ejerces directamente a través de los controles de almacenamiento de tu navegador. Para cualquier consulta, contacta al responsable del tratamiento a través del enlace proporcionado anteriormente.",
    "privacy_section_contact": "Contacto",
    "privacy_contact_text": "Para cualquier pregunta relacionada con la privacidad, puedes contactar al desarrollador a través del enlace de identidad legal anterior o mediante el repositorio de GitHub del proyecto.",
    "terms_section_object": "Objeto",
    "terms_object_text": "Estos Términos de Uso regulan el acceso y uso de la aplicación web Discord Embed Creator, una herramienta visual para crear y enviar mensajes embed de Discord mediante webhooks.",
    "terms_section_license": "Licencia y Propiedad Intelectual",
    "terms_license_text": "Esta aplicación está licenciada bajo la GNU Affero General Public License v3.0 (AGPL-3.0). Eres libre de usar, modificar y distribuir el código fuente bajo los términos de esta licencia. Cualquier versión modificada desplegada como servicio en red debe también hacer disponible su código fuente. Todo el diseño original, código y activos creativos son propiedad intelectual del autor.",
    "terms_section_liability": "Limitación de Responsabilidad",
    "terms_liability_text": "La aplicación se proporciona \"TAL CUAL\" sin ninguna garantía. El desarrollador no será responsable de ningún daño directo, indirecto, incidental o consecuente derivado del uso o la imposibilidad de uso de esta aplicación, incluyendo pero sin limitarse a la pérdida de datos o el acceso no autorizado a servidores de Discord.",
    "terms_section_discord": "Cumplimiento de los Términos de Discord",
    "terms_discord_text": "Los usuarios deben cumplir con los Términos de Servicio y las Directrices de la Comunidad de Discord al usar webhooks a través de esta aplicación. El desarrollador no es responsable de ningún uso indebido de la API de Discord.",
    "terms_section_prohibited": "Usos Prohibidos",
    "terms_prohibited_text": "Los siguientes usos de esta aplicación están estrictamente prohibidos:",
    "terms_prohibited_spam": "Spam, mensajes masivos o envío automatizado masivo",
    "terms_prohibited_harassment": "Acoso, abuso o ataques dirigidos",
    "terms_prohibited_discord": "Cualquier actividad que viole los Términos de Servicio de Discord",
    "terms_prohibited_illegal": "Cualquier actividad ilegal bajo la legislación aplicable",
    "terms_section_changes": "Modificaciones",
    "terms_changes_text": "El desarrollador se reserva el derecho de modificar estos Términos en cualquier momento. El uso continuado de la aplicación tras los cambios constituye la aceptación de los nuevos términos.",
    "terms_section_law": "Legislación Aplicable",
    "terms_law_text": "Estos Términos se rigen por la legislación española. Cualquier controversia se someterá a los juzgados y tribunales del domicilio del desarrollador.",
    "cookies_section_what": "Tecnologías de Almacenamiento Utilizadas",
    "cookies_what_text": "Esta aplicación utiliza exclusivamente el localStorage de tu navegador (no cookies HTTP) para almacenar datos estrictamente funcionales. No se emplean tecnologías de seguimiento, analítica ni marketing.",
    "cookies_section_table_title": "Tabla Detallada de Almacenamiento",
    "cookies_table_key": "Clave",
    "cookies_table_purpose": "Propósito",
    "cookies_table_retention": "Retención",
    "cookies_table_preferences": "Almacena tu tema (claro/oscuro) y selección de idioma",
    "cookies_table_webhooks": "Almacena las URLs de webhooks que configuras",
    "cookies_table_templates": "Almacena las plantillas de embeds que guardas",
    "cookies_table_embed": "Almacena el estado actual de edición del embed",
    "cookies_table_active_webhook": "Almacena qué webhook está actualmente seleccionado",
    "cookies_table_consent": "Registra que reconociste el aviso de almacenamiento",
    "cookies_table_banner": "Controla cuándo se mostró por última vez el banner de donación",
    "cookies_table_tutorial": "Controla si el tutorial de bienvenida ya fue mostrado",
    "cookies_table_retention_value": "Hasta que borres los datos del navegador",
    "cookies_section_exemption": "Aviso de Exención Legal",
    "cookies_exemption_text": "De conformidad con las directrices de la AEPD (Agencia Española de Protección de Datos), todo el almacenamiento utilizado por esta aplicación se califica como estrictamente técnico y necesario para el servicio solicitado por el usuario. Por tanto, no se requiere un panel de consentimiento interactivo con opciones 'Aceptar/Rechazar'. El banner informativo se proporciona como medida de transparencia.",
    "cookies_section_purpose": "Propósito",
    "cookies_purpose_text": "Todos los datos almacenados sirven exclusivamente para preservar tu sesión de trabajo y preferencias entre visitas. Ningún dato se comparte con terceros ni se utiliza con fines de seguimiento.",
    "cookies_section_control": "Tu Control",
    "cookies_control_text": "Puedes eliminar todos los datos almacenados en cualquier momento borrando el localStorage de tu navegador para este sitio desde la configuración de tu navegador.",
    "cookies_control_note": "Nota: El botón \"Limpiar Todo\" en la aplicación solo limpia el contenido de la vista previa del embed, no tus preferencias guardadas, webhooks o plantillas.",
    "cookie_consent_message": "Esta aplicación solo utiliza el localStorage de tu navegador con fines estrictamente técnicos (guardar tus preferencias y trabajo). No se emplean cookies de seguimiento ni analítica.",
    "cookie_accept": "Entendido",
    "cookie_learn_more": "Más información",
    "legal_section_object": "Objeto",
    "legal_object_text": "En cumplimiento de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se facilita la siguiente información general sobre este sitio web.",
    "legal_section_ip": "Propiedad Intelectual",
    "legal_ip_text": "Todo el código fuente, diseño, elementos gráficos y contenido textual de este sitio web son propiedad intelectual del autor y están protegidos bajo la GNU Affero General Public License v3.0 (AGPL-3.0), así como bajo las leyes de propiedad intelectual aplicables. La reproducción, distribución o comunicación pública está permitida exclusivamente bajo los términos de dicha licencia.",
    "legal_section_liability": "Exención de Responsabilidad",
    "legal_liability_text": "El titular no se hace responsable del contenido de los enlaces externos, de la información generada por los usuarios a través de webhooks, ni de cualquier daño derivado del uso indebido de esta herramienta. El titular se reserva el derecho de modificar, suspender o descontinuar el servicio en cualquier momento sin previo aviso.",
    "legal_section_law": "Legislación Aplicable y Jurisdicción",
    "legal_law_text": "Este Aviso Legal se rige por la legislación española. Para la resolución de cualquier controversia, las partes se someten a los juzgados y tribunales del domicilio del titular.",
    "legal_section_identity": "Identidad del Titular",
    "legal_identity_text": "Los datos identificativos del titular de este sitio web, en cumplimiento de la LSSI-CE, pueden consultarse en el siguiente enlace:",
    "legal_identity_link_text": "Identidad Legal del Titular",
    "donation_title": "Apoya el Desarrollo",
    "donation_message": "Si encuentras útil esta herramienta, considera apoyar al desarrollador con una donación voluntaria.",
    "donation_button": "☕ Cómprame un café",
    "btn_donate_tooltip": "Apoya al desarrollador",
    "donation_modal_title": "Apoya el Proyecto 💖",
    "donation_modal_description": "Elige la forma que más cómoda te resulte. ¡Cada aportación ayuda a mantener este proyecto vivo y gratuito!",
    "donation_option_lemon": "☕ Cómprame un café (Apple Pay, Google Pay, Tarjeta, PayPal)",
    "donation_option_github": "🐙 GitHub Sponsors (puntual o periódica)",
    "donation_success": "¡Muchísimas gracias por tu apoyo! 💖",
    "donation_dismiss_forever": "No volver a mostrar",
    "donation_dismiss_title": "¡Sin problema! 💙",
    "donation_dismiss_message": "El banner no volverá a aparecer. Si en algún momento valoras el trabajo de esta web, siempre puedes encontrar las opciones de donación en el icono 💖 del corazón en la cabecera o en el enlace \"Donar\" en la parte inferior de la página. ¡Gracias por usar la herramienta!",
    "webhooks": "Webhooks",
    "json": "JSON",
    "templates": "Plantillas",
    "toggle_theme": "Cambiar tema",
    "home": "Inicio",
    "no_webhook": "⚠️ Sin webhook configurado. Haz clic en el botón <svg class='webhook-icon-inline' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71'/><path d='M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71'/></svg> 'Webhooks' en el encabezado para añadir uno.",
    "webhook_ready": "✅ Listo para enviar a:",
    "msg_confirm_delete": "Esto limpiará todo el contenido. ¿Continuar?",
    "edit_title": "Editar Título",
    "edit_description": "Editar Descripción",
    "edit_bot": "Editar Configuración del Bot",
    "edit_message": "Editar Contenido del Mensaje",
    "edit_color": "Editar Color del Embed",
    "edit_author": "Editar Autor",
    "edit_footer": "Editar Pie de página",
    "edit_image": "Editar Imagen",
    "edit_thumbnail": "Editar Miniatura",
    "add_field": "Añadir Campo",
    "edit_field": "Editar Campo",
    "webhook_management": "Gestión de Webhooks",
    "add_webhook": "Añadir Webhook",
    "webhook_url": "URL del Webhook",
    "webhook_nickname": "Apodo (opcional)",
    "saved_webhooks": "Webhooks Guardados",
    "template_management": "Gestión de Plantillas",
    "save_template": "Guardar Plantilla Actual",
    "saved_templates": "Plantillas Guardadas",
    "load": "Cargar",
    "share": "Compartir",
    "delete": "Eliminar",
    "json_management": "Gestión de JSON",
    "import_json": "Importar JSON",
    "export_json": "Exportar JSON",
    "copy_json": "Copiar JSON",
    "view_json": "Ver JSON",
    "cancel": "Cancelar",
    "save": "Guardar",
    "ok": "OK",
    "title": "Título",
    "description": "Descripción",
    "url": "URL",
    "url_optional": "URL (opcional - hace el título clickeable)",
    "color": "Color",
    "text_click_to_edit": "Haz clic para editar",
    "formatting": "Formato",
    "bold": "Negrita",
    "italic": "Cursiva",
    "underline": "Subrayado",
    "strikethrough": "Tachado",
    "code": "Código",
    "link": "Enlace",
    "bot_username": "Nombre del Bot",
    "avatar_url": "URL del Avatar",
    "message_content": "Contenido del Mensaje",
    "author_name": "Nombre del Autor",
    "author_url": "URL del Autor (opcional)",
    "author_icon": "URL del Icono del Autor",
    "footer_text": "Texto del Pie",
    "footer_icon": "URL del Icono del Pie",
    "image_url": "URL de la Imagen",
    "thumbnail_url": "URL de la Miniatura",
    "field_name": "Nombre del Campo",
    "field_value": "Valor del Campo",
    "inline": "Inline",
    "remove": "Quitar",
    "placeholder_username": "Haz clic para añadir nombre del bot",
    "placeholder_message": "Haz clic para añadir contenido del mensaje",
    "placeholder_title": "Haz clic para añadir título",
    "placeholder_description": "Haz clic para añadir descripción",
    "webhook_help_title": "Cómo obtener una URL de Webhook",
    "webhook_help_intro": "Hay dos formas de crear un webhook:",
    "webhook_method_1_title": "Método 1: Ajustes del Servidor",
    "webhook_method_1_step1": "1. Ve a tu servidor de Discord",
    "webhook_method_1_step2": "2. Haz clic en Ajustes del Servidor (icono de engranaje)",
    "webhook_method_1_step3": "3. Ve a la sección Integraciones",
    "webhook_method_1_step4": "4. Haz clic en Webhooks",
    "webhook_method_1_step5": "5. Haz clic en \"Crear Webhook\"",
    "webhook_method_1_step6": "6. Selecciona el canal donde se enviarán los mensajes",
    "webhook_method_1_step7": "7. Copia la URL del webhook y pégala arriba",
    "webhook_method_2_title": "Método 2: Ajustes del Canal (Más rápido)",
    "webhook_method_2_step1": "1. Haz clic derecho en el canal donde quieres enviar mensajes",
    "webhook_method_2_step2": "2. Haz clic en \"Editar Canal\"",
    "webhook_method_2_step3": "3. Ve a la sección Integraciones (barra lateral izquierda)",
    "webhook_method_2_step4": "4. Haz clic en Webhooks",
    "webhook_method_2_step5": "5. Haz clic en \"Crear Webhook\"",
    "webhook_method_2_step6": "6. Copia la URL del webhook y pégala arriba",
    "no_webhooks_saved": "No hay webhooks guardados",
    "no_templates_saved": "No hay plantillas guardadas",
    "template_name": "Nombre de la Plantilla:",
    "placeholder_template_name": "Mi Plantilla",
    "use_current_time": "Usar Hora Actual",
    "timestamp": "Marca de Tiempo",
    "timestamp_set": "Marca de tiempo establecida",
    "max_fields": "Máximo 25 campos permitidos",
    "invalid_webhook": "URL de webhook de Discord inválida",
    "enter_webhook": "Por favor ingresa una URL de webhook",
    "webhook_added": "¡Webhook añadido!",
    "template_deleted": "Plantilla eliminada",
    "failed_copy": "Error al copiar",
    "json_imported": "¡JSON importado exitosamente!",
    "message_sent": "¡Mensaje enviado exitosamente!",
    "btn_open_link": "Abrir en Nueva Pestaña",
    "btn_share_link": "Copiar URL",
    "label_url": "URL",
    "paste_json": "Pegar JSON:",
    "color_purple": "Púrpura",
    "color_cyan": "Cián",
    "color_green": "Verde",
    "color_yellow": "Amarillo",
    "color_red": "Rojo",
    "color_white": "Blanco",
    "btn_delete": "Eliminar",
    "live_timestamp": "Marca de Tiempo en Vivo",
    "shift_enter_newline": "Shift + Enter para nueva línea",
    "field_name_value_required": "Se requieren tanto el nombre como el valor del campo.",
    "remove_timestamp": "Eliminar Marca de Tiempo",
    "btn_upload_image": "Subir Imagen",
    "msg_img_too_large": "La imagen es muy grande. Tamaño máximo: 8MB",
    "msg_img_upload_success": "Imagen subida correctamente",
    "msg_img_upload_error": "Error al subir la imagen",
    "msg_processing_image": "Procesando imagen...",
    "msg_avatar_must_be_url": "El Avatar del Bot debe ser una URL pública (http/https), no se soportan archivos locales para este campo.",
    "help": "Ayuda",
    "welcome_modal_title": "¡Bienvenido a Discord Embed Creator!",
    "welcome_modal_text": "Haz clic en el botón (?) en la cabecera para ver tutoriales completos. Si ocultas este mensaje, podrás volver a los tutoriales desde el botón de ayuda.",
    "btn_view_tutorials": "Ver Tutoriales",
    "btn_dont_show_again": "No volver a mostrar",
    "help_center_title": "Centro de Ayuda",
    "help_section_webhooks": "Configuración de Webhooks",
    "help_section_templates": "Gestión de Plantillas",
    "help_section_json": "Importar/Exportar JSON",
    "help_section_language": "Cambiar Idioma",
    "help_section_theme": "Cambiar Tema",
    "help_section_basic": "Creación Básica",
    "help_section_editing": "Editar Elementos",
    "help_section_optional": "Elementos Opcionales",
    "help_section_fields": "Campos",
    "help_section_clear": "Limpiar Todo",
    "help_section_send": "Enviar Mensaje",
    "help_title_webhooks": "Configuración de Webhooks",
    "help_webhooks_what_is_it": "Es una URL de Discord para enviar mensajes sin necesidad de crear un bot.",
    "help_webhooks_method_1": "Método 1: Ajustes del Servidor",
    "help_webhooks_method_1_steps": "1. Ve a tu servidor de Discord<br>2. Haz clic en Ajustes del Servidor (icono de engranaje)<br>3. Ve a la sección Integraciones<br>4. Haz clic en Webhooks<br>5. Haz clic en 'Crear Webhook'<br>6. Selecciona el canal donde se enviarán los mensajes<br>7. Copia la URL del webhook",
    "help_webhooks_method_2": "Método 2: Ajustes del Canal (Más rápido)",
    "help_webhooks_method_2_steps": "1. Haz clic derecho en el canal<br>2. Haz clic en 'Editar Canal'<br>3. Ve a la sección Integraciones<br>4. Haz clic en 'Crear Webhook'<br>5. Copia la URL del webhook",
    "help_webhooks_usage": "Cómo usarlo en la app",
    "help_webhooks_usage_steps": "Haz clic en el botón 'Webhooks' en la cabecera, pega tu URL, dale un apodo opcional y haz clic en 'Añadir Webhook'.",
    "help_webhooks_security": "Seguridad",
    "help_webhooks_security_text": "⚠️ Nunca compartas tu URL de webhook públicamente. Cualquiera con la URL puede enviar mensajes a tu canal.",
    "help_webhooks_templates": "Webhooks en Plantillas",
    "help_webhooks_templates_text": "Cada plantilla guardada puede tener su propio webhook independiente.",
    "help_title_templates": "Gestión de Plantillas",
    "help_templates_what_are_they": "Permiten guardar embeds completos en el almacenamiento local de tu navegador para usarlos más tarde.",
    "help_templates_create": "Cómo crear una plantilla",
    "help_templates_create_steps": "Diseña tu embed en la vista previa principal, haz clic en el botón 'Plantillas' en la cabecera y luego en 'Guardar Plantilla Actual'.",
    "help_templates_manage": "Gestionar Plantillas",
    "help_templates_manage_load": "<strong>Cargar:</strong> Aplica la plantilla guardada al editor, sobreescribiendo el contenido actual.",
    "help_templates_manage_copy": "<strong>Copiar URL:</strong> ⚠️ Esto crea una URL que solo funciona en TU navegador. NO es para compartir con otros.",
    "help_templates_manage_open": "<strong>Abrir en nueva pestaña:</strong> Abre la URL de la plantilla en una nueva pestaña.",
    "help_templates_manage_delete": "<strong>Eliminar:</strong> Borra la plantilla permanentemente.",
    "help_templates_webhooks": "Webhooks Independientes",
    "help_templates_webhooks_text": "Cada plantilla puede asociarse con un webhook específico, que se guarda junto a ella.",
    "help_templates_tips": "Consejos",
    "help_templates_tips_text": "Usa plantillas para mensajes recurrentes como anuncios o estados. Guarda las URLs en favoritos para acceso rápido.",
    "help_video_button": "Ejemplo Práctico",
    "help_video_title": "Ejemplo Práctico de Uso",
    "help_title_json": "Importar/Exportar JSON",
    "help_json_what_is_it": "JSON es el formato de datos oficial que Discord usa para los embeds. Esto es lo que la app envía a Discord.",
    "help_json_copy": "Copiar JSON",
    "help_json_copy_steps": "Haz clic en el botón 'JSON' en la cabecera, luego 'Copiar JSON'. Esto copia el código de tu embed actual al portapapeles.",
    "help_json_import": "Importar JSON",
    "help_json_import_steps": "Haz clic en 'JSON', luego 'Importar JSON'. Pega tu código en el área de texto y haz clic en 'Guardar'.",
    "help_json_uses": "¿Para qué sirve?",
    "help_json_uses_text": "Es útil para hacer copias de seguridad, compartir el código del embed con otros desarrolladores o integrarlo en tus propios bots.",
    "help_json_errors": "Errores Comunes",
    "help_json_errors_text": "El error más común es 'JSON inválido'. Asegúrate de que el código esté bien formateado y que todas las URLs sean válidas.",
    "help_title_language": "Cambiar Idioma",
    "help_lang_available": "Idiomas Disponibles",
    "help_lang_available_text": "La interfaz está disponible en Inglés y Español.",
    "help_lang_selector": "Ubicación del Selector",
    "help_lang_selector_text": "Puedes encontrar el selector de idioma en la cabecera, a la derecha.",
    "help_lang_saving": "Guardado",
    "help_lang_saving_text": "Tu preferencia de idioma se guarda automáticamente en tu navegador para tu próxima visita.",
    "help_title_theme": "Cambiar Tema",
    "help_theme_button": "Botón de Tema",
    "help_theme_button_text": "Puedes encontrar el botón para cambiar de tema (icono de sol/luna) en la cabecera.",
    "help_theme_function": "Funcionalidad",
    "help_theme_function_text": "Alterna la interfaz entre un tema claro y uno oscuro.",
    "help_theme_saving": "Guardado",
    "help_theme_saving_text": "Tu preferencia de tema se guarda en tu navegador.",
    "help_theme_dark": "Tema Oscuro",
    "help_theme_dark_text": "Recomendado para reducir la fatiga visual, especialmente en entornos con poca luz.",
    "help_theme_light": "Tema Claro",
    "help_theme_light_text": "Ofrece mejor visibilidad en lugares muy iluminados.",
    "help_title_basic": "Creación Básica",
    "help_basic_elements": "Elementos Principales",
    "help_basic_elements_text": "El núcleo de un embed se compone de un color, un título y una descripción.",
    "help_basic_message": "Contenido del Mensaje",
    "help_basic_message_text": "Puedes añadir un mensaje de texto estándar encima del embed haciendo clic en 'Haz clic para añadir contenido del mensaje'.",
    "help_basic_color": "Color del Embed",
    "help_basic_color_text": "Haz clic en la barra de color para abrir el editor. Puedes elegir un color del selector visual, introducir un código hexadecimal o seleccionar uno de los colores predefinidos.",
    "help_basic_edit": "Cómo Editar",
    "help_basic_edit_text": "Para editar el título o la descripción, simplemente haz clic sobre ellos en la vista previa.",
    "help_title_editing": "Editar Elementos",
    "help_editing_process": "Proceso General",
    "help_editing_process_text": "Haz clic en cualquier elemento de la vista previa (título, descripción, autor, etc.) para abrir un modal de edición. Modifica el contenido en el modal y haz clic en 'Guardar' para aplicar los cambios o 'Cancelar' para descartarlos. Algunos elementos también ofrecen un botón 'Quitar' para eliminarlos por completo.",
    "help_title_optional": "Elementos Opcionales",
    "help_optional_author": "<strong>Autor:</strong> Añade una sección en la parte superior con un nombre, un avatar opcional y un enlace.",
    "help_optional_footer": "<strong>Pie de página:</strong> Un texto pequeño en la parte inferior, que puede incluir un icono.",
    "help_optional_image": "<strong>Imagen:</strong> Una imagen grande que se muestra debajo del contenido del embed.",
    "help_optional_thumbnail": "<strong>Miniatura:</strong> Una imagen pequeña que aparece en la esquina superior derecha.",
    "help_optional_fields": "<strong>Campos:</strong> Bloques de texto con título y valor, que pueden mostrarse en línea.",
    "help_optional_pc": "Cómo añadir (PC)",
    "help_optional_pc_text": "Arrastra el elemento desde el panel izquierdo y suéltalo sobre la vista previa, o haz clic en él.",
    "help_optional_mobile": "Cómo añadir (Móvil)",
    "help_optional_mobile_text": "En dispositivos móviles, no se puede arrastrar. Simplemente pulsa el elemento en el panel izquierdo para abrir su modal de edición.",
    "help_optional_reorder": "Reordenar Campos",
    "help_optional_reorder_text": "Usa los botones de flecha ⬆ y ⬇ que aparecen junto a cada campo para cambiar su orden.",
    "help_optional_remove": "Eliminar Elementos",
    "help_optional_remove_text": "Dentro del modal de edición de cada elemento opcional, encontrarás un botón 'Quitar'.",
    "help_title_fields": "Campos (Fields)",
    "help_fields_block": "Campos de Bloque",
    "help_fields_block_text": "Por defecto, un campo ocupa todo el ancho del embed.",
    "help_fields_max": "Máximo de Campos",
    "help_fields_max_text": "Discord permite un máximo de 25 campos por embed.",
    "help_fields_reorder": "Reordenar",
    "help_fields_reorder_text": "Usa los botones de flecha junto a cada campo en la vista previa para cambiar su posición.",
    "help_title_clear": "Limpiar Todo",
    "help_clear_resets": "Resetea la Vista Previa",
    "help_clear_resets_text": "El botón 'Limpiar Todo' resetea por completo el área de vista previa, borrando todo el contenido del mensaje y del embed.",
    "help_clear_confirmation": "Pide Confirmación",
    "help_clear_confirmation_text": "Para evitar borrados accidentales, aparecerá un modal de confirmación.",
    "help_clear_no_delete": "Qué NO borra",
    "help_clear_no_delete_text": "Esta acción no afecta a tus webhooks guardados, plantillas ni a las preferencias de la aplicación (como el tema y el idioma).",
    "help_title_send": "Enviar Mensaje",
    "help_send_requires": "Requiere Webhook",
    "help_send_requires_text": "No puedes enviar un mensaje sin haber configurado y seleccionado un webhook activo.",
    "help_send_active": "Activación del Botón",
    "help_send_active_text": "El botón 'Enviar Mensaje' solo se activará cuando haya un webhook válido seleccionado.",
    "help_send_sends": "Envía a Discord",
    "help_send_sends_text": "Al hacer clic, envía el embed y mensaje completos al canal de Discord asociado a tu webhook activo.",
    "btn_report_bug": "Reportar",
    "modal_report_bug_title": "Reportar",
    "report_bug_explanation": "¿Encontraste un error o tienes una sugerencia? Ayúdanos a mejorar la aplicación reportándolo en GitHub Issues.",
    "report_bug_version": "Versión actual:",
    "report_bug_type_title": "Tipo de reporte",
    "report_bug_type_explanation": "Cuando crees tu reporte en GitHub, usa las etiquetas (labels) apropiadas:",
    "report_bug_type_bug_desc": "Para reportar errores o problemas en la aplicación",
    "report_bug_type_enhancement_desc": "Para sugerir mejoras o nuevas funcionalidades",
    "report_bug_type_documentation_desc": "Para sugerencias sobre la documentación",
    "report_bug_type_question_desc": "Para hacer preguntas sobre el funcionamiento",
    "report_bug_type_outro": "Estas etiquetas ayudan a organizar y priorizar los reportes.",
    "report_bug_info_title": "¿Qué información incluir en el reporte?",
    "report_bug_info_1": "Descripción clara del problema que encontraste",
    "report_bug_info_2": "Qué pasos seguiste para que ocurriera el error",
    "report_bug_info_3": "Qué esperabas que pasara y qué pasó realmente",
    "report_bug_info_4": "Tu navegador y sistema operativo",
    "report_bug_info_5": "Capturas de pantalla si es posible",
    "report_bug_info_title_clarification": "Este formato es sobre todo para el reporte de errores/bugs.",
    "btn_open_github_issues": "Abrir GitHub Issues",
    "btn_faq": "FAQ",
    "modal_faq_title": "Preguntas Frecuentes",
    "faq_q1": "¿Cómo obtengo la URL de mi webhook?",
    "faq_a1_step1": "Ve a tu servidor de Discord",
    "faq_a1_step2": "Haz clic en Ajustes del Servidor (icono de engranaje)",
    "faq_a1_step3": "Ve a la sección Integraciones",
    "faq_a1_step4": "Haz clic en Webhooks",
    "faq_a1_step5": "Haz clic en 'Crear Webhook'",
    "faq_a1_step6": "Selecciona el canal donde se enviarán los mensajes",
    "faq_a1_step7": "Copia la URL del webhook",
    "faq_q2": "¿Puedo usar varios webhooks?",
    "faq_a2": "Sí, puedes añadir múltiples webhooks y cambiar entre ellos usando el botón Webhooks en la cabecera de la aplicación.",
    "faq_q3": "¿Se guardan mis webhooks y plantillas?",
    "faq_a3": "Sí, se guardan localmente en tu navegador. No se envían a ningún servidor externo.",
    "faq_q4": "¿Cómo exporto mi embed a JSON?",
    "faq_a4_step1": "Haz clic en el botón JSON en la cabecera",
    "faq_a4_step2": "Haz clic en 'Copiar JSON'",
    "faq_a4_step3": "Ya puedes pegar el código donde lo necesites.",
    "faq_q5": "¿Puedo importar un embed desde JSON?",
    "faq_a5_step1": "Sí, haz clic en el botón JSON en la cabecera",
    "faq_a5_step2": "Haz clic en 'Importar JSON'",
    "faq_a5_step3": "Pega tu código JSON y haz clic en 'Guardar'.",
    "faq_q6": "¿Qué formatos de URL de webhook son válidos?",
    "faq_a6_format1": "discord.com/api/webhooks/...",
    "faq_a6_format2": "discordapp.com/api/webhooks/...",
    "faq_a6_format3": "ptb.discord.com/api/webhooks/ (PTB)",
    "faq_a6_format4": "canary.discord.com/api/webhooks/ (Canary)",
    "faq_q7": "¿Los colores funcionan en Discord?",
    "faq_a7": "Sí, Discord soporta colores en los embeds. Usa el selector de color o introduce un código hexadecimal.",
    "faq_q8": "¿Cuál es el límite de caracteres?",
    "faq_a8_title": "Título: 256 caracteres",
    "faq_a8_description": "Descripción: 4096 caracteres",
    "faq_a8_fields_max": "Campos: 25 campos máximo",
    "faq_a8_field_name": "Nombre de campo: 256 caracteres",
    "faq_a8_field_value": "Valor de campo: 1024 caracteres",
    "faq_a8_embed_total": "Total del embed: 6000 caracteres",
    "avatar_url_help_title": "Sobre las URLs de Avatar del Bot",
    "avatar_url_help_text": "Solo se permiten URLs públicas y accesibles desde internet como avatar del bot. Discord solo puede mostrar la imagen si la dirección es pública y no requiere autenticación. Las URLs privadas, de servicios como Drive o almacenamiento local, no funcionarán. Por este motivo, no se permite la subida de imágenes para este campo."
  }
};



const colorPresets = [
  { name: 'color_purple', hex: '#7c3aed', decimal: 8140525 },
  { name: 'color_cyan', hex: '#06b6d4', decimal: 441044 },
  { name: 'color_green', hex: '#57F287', decimal: 5763719 },
  { name: 'color_yellow', hex: '#FEE75C', decimal: 16705372 },
  { name: 'color_red', hex: '#ED4245', decimal: 15548997 },
  { name: 'color_white', hex: '#FFFFFF', decimal: 16777215 }
];


function t(key) {
  return translations[currentLang][key] || key;
}

function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (e) {
    return false;
  }
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

function createImageUploadControl(targetInputId, value) {
  const fileInputId = `file-upload-${targetInputId}`;
  return `
    <div class="image-upload-wrapper">
      <input type="url" class="form-input" id="${targetInputId}" value="${value}">
      <button type="button" class="btn btn-secondary btn-upload" onclick="document.getElementById('${fileInputId}').click()">
        <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="17 8 12 3 7 8"></polyline>
          <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>
      </button>
      <input type="file" id="${fileInputId}" style="display: none;" accept="image/*" onchange="handleImageUpload(event, '${targetInputId}')">
    </div>
  `;
}

function handleImageUpload(event, targetInputId) {
  const file = event.target.files[0];
  if (!file) return;

  const maxSize = 8 * 1024 * 1024; // 8MB
  if (file.size > maxSize) {
    showErrorModal(t('msg_error'), t('msg_img_too_large'));
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    document.getElementById(targetInputId).value = e.target.result;
    showNotification(t('msg_img_upload_success'), 'success');
  };
  reader.onerror = function() {
    showErrorModal(t('msg_error'), t('msg_img_upload_error'));
  };
  reader.readAsDataURL(file);
}

function openAvatarUrlHelpModal() {
  showInfoModal(t('avatar_url_help_title'), t('avatar_url_help_text'));
}



function dataURLtoBlob(dataurl) {
  let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

function init() {

  const prefs = StorageManager.loadPreferences();


  currentTheme = prefs.theme || 'light';
  document.documentElement.setAttribute('data-theme', currentTheme);



  let initialLang = prefs.language;
  if (!initialLang) {
    const browserLang = navigator.language || navigator.userLanguage;
    if (browserLang.toLowerCase().startsWith('es')) {
      initialLang = 'es';
    } else {
      initialLang = 'en';
    }
  }
  currentLang = initialLang;

  document.documentElement.lang = currentLang;
  document.documentElement.setAttribute('data-language', currentLang);
  document.getElementById('languageSelect').value = currentLang;


  templates = StorageManager.loadTemplates();

  const params = new URLSearchParams(window.location.search);
  const templateId = params.get('template');

  if (templateId && templates[templateId]) {



    isTemplateView = true;

    currentTemplateId = templateId;

    loadTemplate(templateId);

    document.getElementById('btnTemplates').style.display = 'none';

    document.getElementById('btnSaveTemplateChanges').style.display = 'block';

    document.getElementById('btnHome').style.display = 'block';



  } else {



    isTemplateView = false;



    currentTemplateId = null;



    webhooks = StorageManager.loadMainWebhooks();



    activeWebhook = StorageManager.loadMainActiveWebhook();



    const savedState = StorageManager.loadEmbedState();

    if (savedState) {

      embedData = savedState.embedData || embedData;

      messageData = savedState.messageData || messageData;

      if (embedData.timestamp) {

        startTimestampUpdate();

      } else {

        stopTimestampUpdate();

      }

    }

    document.getElementById('btnHome').style.display = 'none';

  }



  applyTranslations();

  updateButtonTitles();

  updatePreview();

  updateWebhookStatus();

  initDragAndDrop();

  setupEventListeners();

  setupAutoSave();

  checkCookieConsent();



  checkDonationBanner();



  showWelcomeTutorialModal();

}



function goHome() {

  const url = new URL(window.location.href);

  url.searchParams.delete('template');

  window.location.href = url.toString();

}

function setupAutoSave() {
  const params = new URLSearchParams(window.location.search);
  if (params.has('template')) {

    if (autoSaveInterval) clearInterval(autoSaveInterval);
    return;
  }

  if (autoSaveInterval) clearInterval(autoSaveInterval);
  autoSaveInterval = setInterval(() => {
    StorageManager.saveEmbedState(embedData, messageData, isTimestampLive);
  }, 30000);
}

function checkCookieConsent() {
  const cookieConsent = StorageManager._getItem('discord_embed_cookieConsent');
  if (!cookieConsent) {
    document.getElementById('cookieConsent').style.display = 'block';
  }
}


function initDonationBanner() {
  const params = new URLSearchParams(window.location.search);
  const templateId = params.get('template');

  if (templateId) {

    handleTemplateURLBanner(templateId);
  } else {

    handleDailyBanner();
  }
}

function handleDailyBanner() {
  const permanentlyDismissed = StorageManager._getItem('discord_embed_donationDismissed');
  const banner = document.getElementById('donationBanner');
  if (!banner) return;

  if (permanentlyDismissed === 'true') {
    banner.style.display = 'none';
  } else {
    banner.style.display = 'flex';
  }
}

function handleTemplateURLBanner(templateId) {
  const permanentlyDismissed = StorageManager._getItem('discord_embed_donationDismissed');
  if (permanentlyDismissed === 'true') {
    const banner = document.getElementById('donationBanner');
    if (banner) banner.style.display = 'none';
    return;
  }

  const bannerShownKey = 'discord_embed_templateBanner_' + templateId;
  const hasShownBanner = StorageManager._getItem(bannerShownKey);
  const banner = document.getElementById('donationBanner');

  if (!hasShownBanner) {
    if (banner) {
      banner.style.display = 'flex';
      StorageManager._setItem(bannerShownKey, 'true');


      setTimeout(() => {
        if (banner.style.display === 'flex') {
          banner.style.display = 'none';
        }
      }, 10000);
    }
  } else {

    if (banner) {
      banner.style.display = 'none';
    }
  }
}

function checkDonationBanner() {

  initDonationBanner();
}

function setupEventListeners() {
  document.getElementById('btnWebhooks').addEventListener('click', openWebhooksModal);
  document.getElementById('btnJSON').addEventListener('click', openJSONModal);
  document.getElementById('btnTemplates').addEventListener('click', openTemplatesModal);
  document.getElementById('btnHelp').addEventListener('click', openHelpCenter);
  document.getElementById('btnHome').addEventListener('click', goHome);
  document.getElementById('btnTheme').addEventListener('click', toggleTheme);
  document.getElementById('btnClearAll').addEventListener('click', clearAllContent);
  document.getElementById('btnSaveTemplateChanges').addEventListener('click', saveTemplateChanges);
  document.getElementById('btnSendMessage').addEventListener('click', sendMessage);
  document.getElementById('btnChangeWebhook').addEventListener('click', openWebhooksModal);
  document.getElementById('btnDonate').addEventListener('click', () => openDonationModal());
  document.getElementById('languageSelect').addEventListener('change', (e) => changeLang(e.target.value));
  document.getElementById('botAvatarWrapper').addEventListener('click', editBotSettings);


  document.getElementById('botUsername').addEventListener('click', editBotSettings);
  document.getElementById('messageText').addEventListener('click', editMessageContent);
  document.getElementById('embedColorIndicator').addEventListener('click', editColor);
  document.getElementById('embedTitle').addEventListener('click', editTitle);
  document.getElementById('embedDescription').addEventListener('click', editDescription);


  document.getElementById('acceptCookies').addEventListener('click', () => {
    StorageManager._setItem('discord_embed_cookieConsent', 'true');
    document.getElementById('cookieConsent').style.display = 'none';
  });


  const closeDonationBtn = document.getElementById('closeDonationBanner');
  if (closeDonationBtn) {
    closeDonationBtn.addEventListener('click', () => {
      const banner = document.getElementById('donationBanner');
      if (banner) {
        banner.style.display = 'none';
      }
    });
  }

  const dismissForeverBtn = document.getElementById('dismissDonationForever');
  if (dismissForeverBtn) {
    dismissForeverBtn.addEventListener('click', () => {
      const banner = document.getElementById('donationBanner');
      if (banner) banner.style.display = 'none';
      StorageManager._setItem('discord_embed_donationDismissed', 'true');
      showInfoModal(t('donation_dismiss_title'), t('donation_dismiss_message'));
    });
  }
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[currentLang][key]) {
      el.textContent = translations[currentLang][key];
    }
  });

  const appVersionEl = document.getElementById('appVersion');
  if (appVersionEl) {
    appVersionEl.textContent = t('app_version') + ' ' + APP_VERSION;
  }
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

function saveCurrentState() {
  if (!isTemplateView) {
    StorageManager.saveEmbedState(embedData, messageData);
  }
}

function changeLang(lang) {
  currentLang = lang;
  document.documentElement.lang = lang;
  document.documentElement.setAttribute('data-language', lang);
  applyTranslations();
  updateButtonTitles();
  updateWebhookStatus();
  updatePreview();


  const prefs = StorageManager.loadPreferences();
  prefs.language = lang;
  StorageManager.savePreferences(prefs);
}

function toggleTheme() {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', currentTheme);
  updatePreview();


  const prefs = StorageManager.loadPreferences();
  prefs.theme = currentTheme;
  StorageManager.savePreferences(prefs);
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

  // Remove all optional elements before re-adding them
  embed.querySelectorAll('.embed-author, .embed-fields, .embed-image, .embed-thumbnail, .embed-footer').forEach(el => el.remove());

  // Re-add elements in the correct order
  if (embedData.author) {
    const authorEl = document.createElement('div');
    authorEl.className = 'embed-author';
    authorEl.onclick = editAuthor;
    authorEl.innerHTML = `
      ${embedData.author.icon_url ? `<img src="${embedData.author.icon_url}" class="author-icon" onerror="this.style.display='none'">` : ''}
      <span class="author-name">${parseMarkdown(embedData.author.name)}</span>
    `;
    embed.insertBefore(authorEl, titleEl);
  }

  if (embedData.fields.length > 0) {
    const fieldsEl = document.createElement('div');
    fieldsEl.className = 'embed-fields';
    fieldsEl.innerHTML = embedData.fields.map((field, idx) => `
      <div class="embed-field ${!field.inline ? 'full' : ''}">
        <div class="field-content" onclick="editFieldByIndex(${idx})">
          <div class="field-name">${parseMarkdown(field.name)}</div>
          <div class="field-value">${parseMarkdown(field.value)}</div>
        </div>
        <div class="field-actions">
          <button class="btn-icon move-up" onclick="event.stopPropagation(); moveFieldUp(${idx})" ${idx === 0 ? 'disabled' : ''}>⬆</button>
          <button class="btn-icon move-down" onclick="event.stopPropagation(); moveFieldDown(${idx})" ${idx === embedData.fields.length - 1 ? 'disabled' : ''}>⬇</button>
        </div>
      </div>
    `).join('');
    embed.appendChild(fieldsEl);
  }

  if (embedData.image) {
    const imageEl = document.createElement('img');
    imageEl.className = 'embed-image';
    imageEl.onclick = editImage;
    imageEl.src = embedData.image.url;
    imageEl.onerror = function () { this.style.display = 'none'; };
    embed.appendChild(imageEl);
  }

  if (embedData.thumbnail) {
    const thumbnailEl = document.createElement('img');
    thumbnailEl.className = 'embed-thumbnail';
    thumbnailEl.onclick = editThumbnail;
    thumbnailEl.src = embedData.thumbnail.url;
    thumbnailEl.onerror = function () { this.style.display = 'none'; };
    embed.appendChild(thumbnailEl);
  }

  if (embedData.footer || embedData.timestamp) {
    const footerEl = document.createElement('div');
    footerEl.className = 'embed-footer';
    footerEl.onclick = editFooter;
    let footerHTML = '';
    if (embedData.footer) {
      if (embedData.footer.icon_url) {
        footerHTML += `<img src="${embedData.footer.icon_url}" class="footer-icon" onerror="this.style.display='none'">`;
      }
      footerHTML += `<span>${parseMarkdown(embedData.footer.text)}</span>`;
    }
    if (embedData.timestamp) {
      const date = new Date(embedData.timestamp);
      footerHTML += `<span>${embedData.footer ? ' • ' : ''}${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>`;
    }
    footerEl.innerHTML = footerHTML;
    embed.appendChild(footerEl);
  }
}


function initDragAndDrop() {
  const draggableItems = document.querySelectorAll('.draggable-item');

  draggableItems.forEach(item => {
    item.addEventListener('dragstart', (e) => {
      const elementType = e.target.dataset.elementType;
      e.dataTransfer.effectAllowed = 'copy';
      e.dataTransfer.setData('text/plain', elementType);
      e.target.classList.add('dragging');
    });

    item.addEventListener('click', (e) => {
      const elementType = e.currentTarget.dataset.elementType;
      handleElementClick(elementType);
    });
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
    handleElementClick(elementType);
  });

  document.addEventListener('dragend', (e) => {
    if (e.target.classList.contains('draggable-item')) {
      e.target.classList.remove('dragging');
    }
  });
}

function handleElementClick(elementType) {
  switch (elementType) {
    case 'author': editAuthor(); break;
    case 'footer': editFooter(); break;
    case 'image': editImage(); break;
    case 'thumbnail': editThumbnail(); break;
    case 'fields': addField(); break;
  }
}


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
    const urlInput = document.getElementById('modalTitleUrl').value;
    if (urlInput && !isValidUrl(urlInput)) {
      showNotification(t('msg_invalid_url'), 'error');
      return;
    }
    embedData.url = urlInput || null;
    updatePreview();
    if (isTemplateView) updateSaveTemplateChangesButton();
    saveCurrentState();
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
      <small class="form-help-text">${t('shift_enter_newline')}</small>
    </div>
  `, () => {
    embedData.description = document.getElementById('modalDescription').value || null;
    updatePreview();
    if (isTemplateView) updateSaveTemplateChangesButton();
    saveCurrentState();
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
      <div class="form-label-group">
        <label class="form-label">${t('avatar_url')}</label>
        <span class="help-icon" onclick="openAvatarUrlHelpModal()">?</span>
      </div>
      <input type="url" class="form-input" id="modalAvatarUrl" value="${messageData.avatar_url || ''}">
    </div>
  `, () => {
    messageData.username = document.getElementById('modalUsername').value || null;
    const avatarUrlInput = document.getElementById('modalAvatar').value;
    if (avatarUrlInput && !isValidUrl(avatarUrlInput)) {
      showNotification(t('msg_invalid_url'), 'error');
      return;
    }
    messageData.avatar_url = avatarUrlInput || null;
    updatePreview();
    if (isTemplateView) updateSaveTemplateChangesButton();
    saveCurrentState();
  });
}

function editMessageContent() {
  showModal(t('edit_message'), `
    ${createFormattingToolbar('modalContent')}
    <div class="form-group">
      <label class="form-label">${t('message_content')}</label>
      <textarea class="form-textarea" id="modalContent" maxlength="2000">${messageData.content || ''}</textarea>
      <div class="char-counter" id="contentCounter">0 / 2000</div>
      <small class="form-help-text">${t('shift_enter_newline')}</small>
    </div>
  `, () => {
    messageData.content = document.getElementById('modalContent').value || null;
    updatePreview();
    if (isTemplateView) updateSaveTemplateChangesButton();
    saveCurrentState();
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
            ${t(p.name)}
          </div>
        `).join('')}
      </div>
    </div>
  `, () => {
    const hexInput = document.getElementById('modalColorHex').value;
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

    if (!hexInput) {
      embedData.color = null;
    } else if (hexRegex.test(hexInput)) {
      embedData.color = parseInt(hexInput.replace('#', ''), 16);
    } else {
      showNotification(t('msg_invalid_color'), 'error');
      return;
    }
    updatePreview();
    if (isTemplateView) updateSaveTemplateChangesButton();
    saveCurrentState();
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
      ${createImageUploadControl('modalAuthorIcon', embedData.author?.icon_url || '')}
    </div>
  `, () => {
    const name = document.getElementById('modalAuthorName').value;
    const urlInput = document.getElementById('modalAuthorUrl').value;
    const iconUrlInput = document.getElementById('modalAuthorIcon').value;

    if (urlInput && !isValidUrl(urlInput)) {
      showNotification(t('msg_invalid_url'), 'error');
      return;
    }
    if (iconUrlInput && !isValidUrl(iconUrlInput) && !iconUrlInput.startsWith('data:image')) {
      showNotification(t('msg_invalid_url'), 'error');
      return;
    }

    if (name) {
      embedData.author = {
        name: name,
        url: urlInput || undefined,
        icon_url: iconUrlInput || undefined
      };
    } else {
      embedData.author = null;
    }
    updatePreview();
    if (isTemplateView) updateSaveTemplateChangesButton();
    saveCurrentState();
  }, embedData.author ? t('remove') : null, () => {
    embedData.author = null;
    updatePreview();
    if (isTemplateView) updateSaveTemplateChangesButton();
    saveCurrentState();
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
      ${createImageUploadControl('modalFooterIcon', embedData.footer?.icon_url || '')}
    </div>
    <div class="form-group">
      <label class="form-label">${t('timestamp')}</label>
      <div style="display: flex; align-items: center; gap: 10px;">
        <button type="button" class="btn btn-secondary" onclick="setTimestampNow()" style="flex-grow: 1;">${t('use_current_time')}</button>
        <button type="button" class="btn btn-danger" onclick="removeTimestamp()" style="flex-grow: 1;" ${embedData.timestamp ? '' : 'disabled'}>${t('remove_timestamp')}</button>
      </div>
    </div>
  `, () => {
    const text = document.getElementById('modalFooterText').value;
    const iconUrlInput = document.getElementById('modalFooterIcon').value;

    if (iconUrlInput && !isValidUrl(iconUrlInput) && !iconUrlInput.startsWith('data:image')) {
      showNotification(t('msg_invalid_url'), 'error');
      return;
    }

    if (text) {
      embedData.footer = {
        text: text,
        icon_url: iconUrlInput || undefined
      };
    } else {
      embedData.footer = null;
    }




    if (embedData.timestamp) {
      startTimestampUpdate();
    } else {
      stopTimestampUpdate();
    }
    updatePreview();
    if (isTemplateView) updateSaveTemplateChangesButton();
    saveCurrentState();
  }, embedData.footer || embedData.timestamp ? t('remove') : null, () => {
    embedData.footer = null;
    embedData.timestamp = null;
    stopTimestampUpdate();
    updatePreview();
    if (isTemplateView) updateSaveTemplateChangesButton();
    saveCurrentState();
  });


}

function setTimestampNow() {
  embedData.timestamp = new Date().toISOString();
  startTimestampUpdate();
  updatePreview();
  showNotification(t('timestamp_set'), 'success');
  if (isTemplateView) updateSaveTemplateChangesButton();
  saveCurrentState();
}

function removeTimestamp() {
  embedData.timestamp = null;
  stopTimestampUpdate();
  updatePreview();
  if (isTemplateView) updateSaveTemplateChangesButton();
  saveCurrentState();
}

function editImage() {
  showModal(t('edit_image'), `
    <div class="form-group">
      <label class="form-label">${t('image_url')}</label>
      ${createImageUploadControl('modalImageUrl', embedData.image?.url || '')}
    </div>
  `, () => {
    const urlInput = document.getElementById('modalImageUrl').value;
    if (urlInput && !isValidUrl(urlInput) && !urlInput.startsWith('data:image')) {
      showNotification(t('msg_invalid_url'), 'error');
      return;
    }
    embedData.image = urlInput ? { url: urlInput } : null;
    updatePreview();
    if (isTemplateView) updateSaveTemplateChangesButton();
    saveCurrentState();
  }, embedData.image ? t('remove') : null, () => {
    embedData.image = null;
    updatePreview();
    if (isTemplateView) updateSaveTemplateChangesButton();
    saveCurrentState();
  });
}

function editThumbnail() {
  showModal(t('edit_thumbnail'), `
    <div class="form-group">
      <label class="form-label">${t('thumbnail_url')}</label>
      ${createImageUploadControl('modalThumbnailUrl', embedData.thumbnail?.url || '')}
    </div>
  `, () => {
    const urlInput = document.getElementById('modalThumbnailUrl').value;
    if (urlInput && !isValidUrl(urlInput) && !urlInput.startsWith('data:image')) {
      showNotification(t('msg_invalid_url'), 'error');
      return;
    }
    embedData.thumbnail = urlInput ? { url: urlInput } : null;
    updatePreview();
    if (isTemplateView) updateSaveTemplateChangesButton();
    saveCurrentState();
  }, embedData.thumbnail ? t('remove') : null, () => {
    embedData.thumbnail = null;
    updatePreview();
    if (isTemplateView) updateSaveTemplateChangesButton();
    saveCurrentState();
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
      <small class="form-help-text">${t('shift_enter_newline')}</small>
    </div>

  `, () => {
    const name = document.getElementById('modalFieldName').value;
    const value = document.getElementById('modalFieldValue').value;
    if (!name || !value) {
      showNotification(t('field_name_value_required'), 'error');
      return;
    }
    embedData.fields.push({ name, value });
    updatePreview();
    if (isTemplateView) updateSaveTemplateChangesButton();
    saveCurrentState();
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
      <small class="form-help-text">${t('shift_enter_newline')}</small>
    </div>

  `, () => {
    const name = document.getElementById('modalFieldName').value;
    const value = document.getElementById('modalFieldValue').value;
    if (!name || !value) {
      showNotification(t('field_name_value_required'), 'error');
      return;
    }
    embedData.fields[index] = { name, value };
    updatePreview();
    if (isTemplateView) updateSaveTemplateChangesButton();
    saveCurrentState();
  }, t('remove'), () => {
    embedData.fields.splice(index, 1);
    updatePreview();
    if (isTemplateView) updateSaveTemplateChangesButton();
    saveCurrentState();
  });
}

function moveFieldUp(index) {
  if (index > 0) {
    const field = embedData.fields[index];
    embedData.fields.splice(index, 1);
    embedData.fields.splice(index - 1, 0, field);
    updatePreview();
    if (isTemplateView) updateSaveTemplateChangesButton();
    saveCurrentState();
  }
}

function moveFieldDown(index) {
  if (index < embedData.fields.length - 1) {
    const field = embedData.fields[index];
    embedData.fields.splice(index, 1);
    embedData.fields.splice(index + 1, 0, field);
    updatePreview();
    if (isTemplateView) updateSaveTemplateChangesButton();
    saveCurrentState();
  }
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

  setTimeout(() => {
    const urlInput = document.getElementById('newWebhookUrl');
    const nickInput = document.getElementById('newWebhookNick');
    const listener = (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        addWebhook();
      }
    };
    urlInput?.addEventListener('keydown', listener);
    nickInput?.addEventListener('keydown', listener);
  }, 100);
}

function renderWebhookList() {
  if (webhooks.length === 0) return `<p style="text-align: center; color: var(--text-secondary);">${t('no_webhooks_saved')}</p>`;
  return webhooks.map((w, i) => `
    <div class="webhook-item ${activeWebhook === i ? 'active' : ''}" onclick="selectWebhook(${i})">
      <div class="webhook-name">${w.nickname || 'Webhook ' + (i + 1)}</div>
      <div class="webhook-url">${w.url}</div>
      <div class="webhook-actions">
        <button class="btn-danger" onclick="event.stopPropagation(); deleteWebhook(${i})">${t('btn_delete')}</button>
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

  const webhookRegex = /^https:\/\/(?:(?:canary|ptb)\.)?discord(?:app)?\.com\/api\/webhooks\/\d+\/[\w-]+(?:(?:\/slack|\/github))?$/;
  if (!webhookRegex.test(url)) {
    showNotification(t('invalid_webhook'), 'error');
    return;
  }
  webhooks.push({ url, nickname });
  activeWebhook = webhooks.length - 1;
  document.getElementById('newWebhookUrl').value = '';
  document.getElementById('newWebhookNick').value = '';
  document.getElementById('webhookList').innerHTML = renderWebhookList();
  updateWebhookStatus();


  WebhookManager.saveWebhooks();
  WebhookManager.saveActiveWebhook();

  showNotification(t('webhook_added'), 'success');
  if (isTemplateView) updateSaveTemplateChangesButton();
}

function selectWebhook(index) {
  activeWebhook = index;
  document.getElementById('webhookList').innerHTML = renderWebhookList();
  WebhookManager.saveActiveWebhook();
  updateWebhookStatus();
  if (isTemplateView) updateSaveTemplateChangesButton();
}

function deleteWebhook(index) {
  webhooks.splice(index, 1);
  if (activeWebhook === index) activeWebhook = null;
  if (activeWebhook > index) activeWebhook--;
  document.getElementById('webhookList').innerHTML = renderWebhookList();
  updateWebhookStatus();


  WebhookManager.saveWebhooks();
  WebhookManager.saveActiveWebhook();
  if (isTemplateView) updateSaveTemplateChangesButton();
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
  if (activeWebhook === null || !webhooks[activeWebhook]) {
    showNotification(t('webhook_not_configured'), 'error');
    return;
  }

  // Validate avatar_url before doing anything else
  if (messageData.avatar_url && messageData.avatar_url.startsWith('data:image')) {
    showErrorModal(t('msg_error'), t('msg_avatar_must_be_url'));
    return;
  }

  const btn = document.getElementById('btnSendMessage');
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner"></span> ${t('btn_sending')}`;

  const webhookUrl = webhooks[activeWebhook].url;
  let payload = {
    username: messageData.username,
    avatar_url: messageData.avatar_url,
    content: messageData.content,
    embeds: embedData.title || embedData.description || embedData.fields.length > 0 ? [embedData] : []
  };

  // Deep copy payload to modify it for attachments without affecting the main state
  let payloadCopy = JSON.parse(JSON.stringify(payload));
  const formData = new FormData();
  let fileIndex = 0;
  let hasAttachments = false;

  const processImage = (obj, key) => {
    if (obj && obj[key] && obj[key].startsWith('data:image')) {
      hasAttachments = true;
      const filename = `file${fileIndex++}.png`;
      const blob = dataURLtoBlob(obj[key]);
      formData.append(`files[${fileIndex-1}]`, blob, filename);
      obj[key] = `attachment://${filename}`;
    }
  };

  // Check embed images
  if (payloadCopy.embeds && payloadCopy.embeds.length > 0) {
    const embed = payloadCopy.embeds[0];
    processImage(embed.author, 'icon_url');
    processImage(embed.footer, 'icon_url');
    processImage(embed.image, 'url');
    processImage(embed.thumbnail, 'url');
  }

  let fetchOptions;

  if (hasAttachments) {
    formData.append('payload_json', JSON.stringify(payloadCopy));
    fetchOptions = {
      method: 'POST',
      body: formData
    };
  } else {
    fetchOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    };
  }

  try {
    const response = await fetch(webhookUrl, fetchOptions);
    if (response.ok) {
      showNotification(t('msg_sent_success'), 'success');
    } else {
      const errorData = await response.json();
      showErrorModal(t('msg_sent_error'), `<pre>${JSON.stringify(errorData, null, 2)}</pre>`);
    }
  } catch (error) {
    showErrorModal(t('msg_sent_error'), error.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = t('btn_send_message');
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
      if (isTemplateView) updateSaveTemplateChangesButton();
      saveCurrentState();
    } catch (err) {
      showNotification(t('invalid_json') + ' ' + err.message, 'error');
    }
  });
}

const helpContent = {
  webhooks: {
    title: "help_title_webhooks",
    content: [
      { type: 'h4', key: 'help_webhooks_what_is_it' },
      { type: 'p', key: 'help_webhooks_method_1' },
      { type: 'p', key: 'help_webhooks_method_1_steps' },
      { type: 'p', key: 'help_webhooks_method_2' },
      { type: 'p', key: 'help_webhooks_method_2_steps' },
      { type: 'h4', key: 'help_webhooks_usage' },
      { type: 'p', key: 'help_webhooks_usage_steps' },
      { type: 'h4', key: 'help_webhooks_security' },
      { type: 'p', key: 'help_webhooks_security_text' },
      { type: 'h4', key: 'help_webhooks_templates' },
      { type: 'p', key: 'help_webhooks_templates_text' }
    ]
  },
  templates: {
    title: "help_title_templates",
    content: [
      { type: 'h4', key: 'help_templates_what_are_they' },
      { type: 'p', key: 'help_templates_create' },
      { type: 'p', key: 'help_templates_create_steps' },
      { type: 'h4', key: 'help_templates_manage' },
      { type: 'ul', items: ['help_templates_manage_load', 'help_templates_manage_copy', 'help_templates_manage_open', 'help_templates_manage_delete'] },
      { type: 'h4', key: 'help_templates_webhooks' },
      { type: 'p', key: 'help_templates_webhooks_text' },
      { type: 'h4', key: 'help_templates_tips' },
      { type: 'p', key: 'help_templates_tips_text' }
    ]
  },
  json: {
    title: "help_title_json",
    content: [
      { type: 'h4', key: 'help_json_what_is_it' },
      { type: 'p', key: 'help_json_copy' },
      { type: 'p', key: 'help_json_copy_steps' },
      { type: 'h4', key: 'help_json_import' },
      { type: 'p', key: 'help_json_import_steps' },
      { type: 'h4', key: 'help_json_uses' },
      { type: 'p', key: 'help_json_uses_text' },
      { type: 'h4', key: 'help_json_errors' },
      { type: 'p', key: 'help_json_errors_text' }
    ]
  },
  language: {
    title: "help_title_language",
    content: [
      { type: 'h4', key: 'help_lang_available' },
      { type: 'p', key: 'help_lang_available_text' },
      { type: 'h4', key: 'help_lang_selector' },
      { type: 'p', key: 'help_lang_selector_text' },
      { type: 'h4', key: 'help_lang_saving' },
      { type: 'p', key: 'help_lang_saving_text' }
    ]
  },
  theme: {
    title: "help_title_theme",
    content: [
      { type: 'h4', key: 'help_theme_button' },
      { type: 'p', key: 'help_theme_button_text' },
      { type: 'h4', key: 'help_theme_function' },
      { type: 'p', key: 'help_theme_function_text' },
      { type: 'h4', key: 'help_theme_saving' },
      { type: 'p', key: 'help_theme_saving_text' },
      { type: 'h4', key: 'help_theme_dark' },
      { type: 'p', key: 'help_theme_dark_text' },
      { type: 'h4', key: 'help_theme_light' },
      { type: 'p', key: 'help_theme_light_text' }
    ]
  },
  basic: {
    title: "help_title_basic",
    content: [
      { type: 'h4', key: 'help_basic_elements' },
      { type: 'p', key: 'help_basic_elements_text' },
      { type: 'h4', key: 'help_basic_message' },
      { type: 'p', key: 'help_basic_message_text' },
      { type: 'h4', key: 'help_basic_color' },
      { type: 'p', key: 'help_basic_color_text' },
      { type: 'h4', key: 'help_basic_edit' },
      { type: 'p', key: 'help_basic_edit_text' }
    ]
  },
  editing: {
    title: "help_title_editing",
    content: [
      { type: 'h4', key: 'help_editing_process' },
      { type: 'p', key: 'help_editing_process_text' }
    ]
  },
  optional: {
    title: "help_title_optional",
    content: [
      { type: 'ul', items: ['help_optional_author', 'help_optional_footer', 'help_optional_image', 'help_optional_thumbnail', 'help_optional_fields'] },
      { type: 'h4', key: 'help_optional_pc' },
      { type: 'p', key: 'help_optional_pc_text' },
      { type: 'h4', key: 'help_optional_mobile' },
      { type: 'p', key: 'help_optional_mobile_text' },
      { type: 'h4', key: 'help_optional_reorder' },
      { type: 'p', key: 'help_optional_reorder_text' },
      { type: 'h4', key: 'help_optional_remove' },
      { type: 'p', key: 'help_optional_remove_text' }
    ]
  },
  fields: {
    title: "help_title_fields",
    content: [
      { type: 'h4', key: 'help_fields_block' },
      { type: 'p', key: 'help_fields_block_text' },
      { type: 'h4', key: 'help_fields_max' },
      { type: 'p', key: 'help_fields_max_text' },
      { type: 'h4', key: 'help_fields_reorder' },
      { type: 'p', key: 'help_fields_reorder_text' }
    ]
  },
  clear: {
    title: "help_title_clear",
    content: [
      { type: 'h4', key: 'help_clear_resets' },
      { type: 'p', key: 'help_clear_resets_text' },
      { type: 'h4', key: 'help_clear_confirmation' },
      { type: 'p', key: 'help_clear_confirmation_text' },
      { type: 'h4', key: 'help_clear_no_delete' },
      { type: 'p', key: 'help_clear_no_delete_text' }
    ]
  },
  send: {
    title: "help_title_send",
    content: [
      { type: 'h4', key: 'help_send_requires' },
      { type: 'p', key: 'help_send_requires_text' },
      { type: 'h4', key: 'help_send_active' },
      { type: 'p', key: 'help_send_active_text' },
      { type: 'h4', key: 'help_send_sends' },
      { type: 'p', key: 'help_send_sends_text' }
    ]
  }
};

function showWelcomeTutorialModal() {
  const alreadyShown = StorageManager._getItem(StorageManager.PREFIX + 'helpTutorialShown');
  if (alreadyShown === 'true') {
    return;
  }

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.setAttribute('tabindex', '-1');
  modal.innerHTML = `
        <div class="modal-content confirmation-modal">
            <div class="modal-header">
                <h3>${t('welcome_modal_title')}</h3>
            </div>
            <div class="modal-body">
                <p>${t('welcome_modal_text')}</p>
            </div>
            <div class="modal-footer">
                <div class="modal-footer-buttons">
                    <button class="btn btn-secondary" id="closeWelcomeBtn">${t('btn_close')}</button>
                    <button class="btn btn-secondary" id="dontShowWelcomeBtn">${t('btn_dont_show_again')}</button>
                    <button class="btn btn-primary" id="viewTutorialsBtn">${t('btn_view_tutorials')}</button>
                    <button class="btn btn-secondary" onclick="showYoutubeModal('https://www.youtube.com/embed/je17Pf_jp7Q', t('help_video_title'))">${t('help_video_button')}</button>
                </div>
            </div>
        </div>
    `;

  document.body.appendChild(modal);
  setTimeout(() => modal.focus(), 0);

  const closeModal = () => modal.remove();

  document.getElementById('closeWelcomeBtn').addEventListener('click', closeModal);
  document.getElementById('dontShowWelcomeBtn').addEventListener('click', () => {
    StorageManager._setItem(StorageManager.PREFIX + 'helpTutorialShown', 'true');
    closeModal();
  });
  document.getElementById('viewTutorialsBtn').addEventListener('click', () => {
    closeModal();
    openHelpCenter();
  });
}

function openHelpCenter() {

  if (globalModalKeydownListener) {
    document.removeEventListener('keydown', globalModalKeydownListener);
    globalModalKeydownListener = null;
  }

  const modal = document.createElement('div');
  modal.className = 'modal-overlay help-center-overlay';
  modal.setAttribute('tabindex', '-1');

  const sections = [
    { id: 'webhooks', icon: `<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>` },
    { id: 'templates', icon: `<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>` },
    { id: 'json', icon: `<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>` },
    { id: 'language', icon: `<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10zM2.5 7h19M2.5 17h19"></path></svg>` },
    { id: 'theme', icon: `<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>` },
    { id: 'basic', icon: `<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>` },
    { id: 'editing', icon: `<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>` },
    { id: 'optional', icon: `<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>` },
    { id: 'fields', icon: `<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>` },
    { id: 'clear', icon: `<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>` },
    { id: 'send', icon: `<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>` }
  ];

  modal.innerHTML = `
        <div class="modal-content help-center-modal">
            <div class="modal-header help-center-header">
                <h3 class="modal-title">${t('help_center_title')}</h3>
                <div class="help-header-actions">
                    <button class="btn btn-secondary btn--sm" onclick="showYoutubeModal('https://www.youtube.com/embed/je17Pf_jp7Q', t('help_video_title'))" title="${t('help_video_button')}">
                        <span class="btn-text-full">📺 ${t('help_video_button')}</span>
                    </button>
                    <button class="btn btn-secondary btn--sm" onclick="openReportBugModal()" title="${t('btn_report_bug')}">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                        <span class="btn-text-short" data-i18n="btn_report_bug">${t('btn_report_bug')}</span>
                    </button>
                    <button class="btn btn-secondary btn--sm" onclick="openFAQModal()" title="${t('btn_faq')}">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                        <span class="btn-text-short" data-i18n="btn_faq">${t('btn_faq')}</span>
                    </button>
                </div>
                <button class="modal-close" id="closeHelpCenterBtn">&times;</button>
            </div>
            <div class="help-center-body">
                <aside class="help-sidebar">
                    ${sections.map(s => `<button class="help-nav-btn" data-section="${s.id}">${s.icon}<span>${t('help_section_' + s.id)}</span></button>`).join('')}
                </aside>
                <main class="help-content" id="helpContent"></main>
            </div>
        </div>
    `;

  document.body.appendChild(modal);
  setTimeout(() => modal.focus(), 0);

  const contentContainer = document.getElementById('helpContent');
  const navButtons = modal.querySelectorAll('.help-nav-btn');

  const switchSection = (sectionId) => {
    renderHelpContent(sectionId, contentContainer);
    navButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.section === sectionId);
    });
  };

  navButtons.forEach(button => {
    button.addEventListener('click', () => switchSection(button.dataset.section));
  });

  const closeAndCleanup = () => {
    modal.remove();
    document.removeEventListener('keydown', helpCenterKeyListener);
  };

  const helpCenterKeyListener = (e) => {
    if (document.querySelector('.youtube-modal')) {
      return;
    }
    if (e.key === 'Escape') {
      closeAndCleanup();
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  };

  document.getElementById('closeHelpCenterBtn').addEventListener('click', closeAndCleanup);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeAndCleanup();
    }
  });
  document.addEventListener('keydown', helpCenterKeyListener);

  switchSection('webhooks');
}

function renderHelpContent(sectionId, container) {
  const section = helpContent[sectionId];
  if (!section) {
    container.innerHTML = 'Content not found.';
    return;
  }

  let html = `<h2>${t(section.title)}</h2>`;
  section.content.forEach(item => {
    switch (item.type) {
      case 'h4':
        html += `<h4>${t(item.key)}</h4>`;
        break;
      case 'p':
        if (item.markdown) {
          html += `<p><strong>${t(item.key)}:</strong> ${item.markdown}</p>`;
        } else {
          html += `<p>${t(item.key)}</p>`;
        }
        break;
      case 'ul':
        html += '<ul>';
        item.items.forEach(liKey => {
          html += `<li>${t(liKey)}</li>`;
        });
        html += '</ul>';
        break;
      case 'button':
        html += `<button class="btn btn-primary" onclick="${item.action}">${t(item.key)}</button>`;
        break;
    }
  });
  container.innerHTML = html;
}

function showYoutubeModal(url, title) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.setAttribute('tabindex', '-1');

  let youtubeUrl = url.replace('www.youtube.com', 'www.youtube-nocookie.com');
  const params = new URLSearchParams();
  params.append('enablejsapi', '1');
  params.append('modestbranding', '1');
  params.append('rel', '0');


  if (window.location.protocol !== 'file:') {
    params.append('origin', window.location.origin);
  }

  youtubeUrl += '?' + params.toString();

  modal.innerHTML = `
        <div class="modal-content youtube-modal">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="modal-close" id="closeYoutubeBtn">&times;</button>
            </div>
            <div class="modal-body">
                <iframe src="${youtubeUrl}" title="${title}" frameborder="0" allow="autoplay; picture-in-picture" allowfullscreen referrerPolicy="strict-origin-when-cross-origin"></iframe>
            </div>
        </div>
    `;
  document.body.appendChild(modal);
  setTimeout(() => modal.focus(), 0);

  const closeAndCleanup = () => {
    modal.remove();
    document.removeEventListener('keydown', youtubeModalKeyListener);
  };

  const youtubeModalKeyListener = (event) => {
    if (event.key === 'Escape') {
      event.stopImmediatePropagation();
      closeAndCleanup();
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  };

  document.getElementById('closeYoutubeBtn').addEventListener('click', closeAndCleanup);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeAndCleanup();
    }
  });
  document.addEventListener('keydown', youtubeModalKeyListener);
}



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
  window.open(templateUrl, '_blank', 'noopener,noreferrer');
}

function copyTemplateUrlToClipboard(templateId) {
  const templateUrl = generateTemplateUrl(templateId);
  copyToClipboard(templateUrl, t('msg_copied_clipboard'));
}





function deleteTemplate(templateId) {
  showConfirmationModal(t('delete') + ' ' + templates[templateId].name, 'Are you sure you want to delete this template? This cannot be undone.', () => {
    delete templates[templateId];
    StorageManager.saveTemplates(templates);
    document.getElementById('templateList').innerHTML = renderTemplateList();
    showNotification(t('template_deleted'), 'success');
  });
}

function hasTemplateChanged() {
  if (!isTemplateView || !originalTemplateState) {
    return false;
  }
  const currentState = JSON.stringify({
    embedData,
    messageData,
    webhooks,
    activeWebhook
  });
  return currentState !== originalTemplateState;
}

function updateSaveTemplateChangesButton() {
  const btn = document.getElementById('btnSaveTemplateChanges');
  if (!btn) return;
  const changed = hasTemplateChanged();
  btn.disabled = !changed;
  btn.classList.toggle('has-changes', changed);
}

function saveTemplateChanges() {
  if (!isTemplateView || !currentTemplateId) return;

  const template = templates[currentTemplateId];
  if (!template) {
    showErrorModal(t('msg_error'), t('msg_template_not_found'));
    return;
  }


  template.embedData = JSON.parse(JSON.stringify(embedData));
  template.messageData = JSON.parse(JSON.stringify(messageData));
  template.templateWebhooks = JSON.parse(JSON.stringify(webhooks));
  template.templateActiveWebhook = activeWebhook;


  StorageManager.saveTemplates(templates);


  originalTemplateState = JSON.stringify({
    embedData,
    messageData,
    webhooks,
    activeWebhook
  });


  updateSaveTemplateChangesButton();
  showSuccessModal(t('msg_success'), t('msg_template_saved'));
}

function saveTemplate() {
  closeModal();
  showModal(t('save_template'), `
    <div class="form-group">
      <label class="form-label">${t('template_name')}</label>
      <input type="text" class="form-input" id="templateName" placeholder="${t('placeholder_template_name')}">
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
      templateWebhooks: JSON.parse(JSON.stringify(webhooks)),
      templateActiveWebhook: activeWebhook,
      created: new Date().toISOString()
    };


    StorageManager.saveTemplates(templates);

    showNotification(t('template_saved'), 'success');
    setTimeout(() => openTemplatesModal(), 500);
  });
}

function loadTemplate(templateId) {
  const tmpl = templates[templateId];
  if (!tmpl) return;
  embedData = JSON.parse(JSON.stringify(tmpl.embedData));
  messageData = JSON.parse(JSON.stringify(tmpl.messageData));
  webhooks = JSON.parse(JSON.stringify(tmpl.templateWebhooks || []));
  activeWebhook = tmpl.templateActiveWebhook !== undefined ? tmpl.templateActiveWebhook : null;

  if (activeWebhook !== null && activeWebhook >= webhooks.length) {
    activeWebhook = null;
  }



  StorageManager.saveTemplateWebhooks(webhooks);
  StorageManager.saveTemplateActiveWebhook(activeWebhook);


  if (embedData.timestamp) {
    startTimestampUpdate();
  } else {
    stopTimestampUpdate();
  }

  originalTemplateState = {
    embedData: JSON.parse(JSON.stringify(embedData)),
    messageData: JSON.parse(JSON.stringify(messageData)),
    webhooks: JSON.parse(JSON.stringify(webhooks)),
    activeWebhook: activeWebhook
  };

  updatePreview();
  updateWebhookStatus();
  updateSaveTemplateChangesButton();
}

function deleteTemplate(templateId) {
  delete templates[templateId];


  StorageManager.saveTemplates(templates);

  document.getElementById('templateList').innerHTML = renderTemplateList();
  showNotification(t('template_deleted'), 'info');
}



function saveTemplateChanges() {
  if (!isTemplateView || !currentTemplateId || !templates[currentTemplateId]) return;

  templates[currentTemplateId].embedData = JSON.parse(JSON.stringify(embedData));
  templates[currentTemplateId].messageData = JSON.parse(JSON.stringify(messageData));
  templates[currentTemplateId].templateWebhooks = JSON.parse(JSON.stringify(webhooks));
  templates[currentTemplateId].templateActiveWebhook = activeWebhook;


  StorageManager.saveTemplates(templates);
  showNotification(t('msg_template_saved'), 'success');

  originalTemplateState = {
    embedData: JSON.parse(JSON.stringify(embedData)),
    messageData: JSON.parse(JSON.stringify(messageData)),
    webhooks: JSON.parse(JSON.stringify(webhooks)),
    activeWebhook: activeWebhook,
    isTimestampLive: isTimestampLive
  };
  updateSaveTemplateChangesButton();
}

function updateSaveTemplateChangesButton() {
  const btn = document.getElementById('btnSaveTemplateChanges');
  if (!btn) return;

  if (hasTemplateChanges()) {
    btn.disabled = false;
    btn.classList.add('has-changes');
  } else {
    btn.disabled = true;
    btn.classList.remove('has-changes');
  }
}

function hasTemplateChanges() {
  if (!originalTemplateState) return false;


  const currentEmbedData = JSON.parse(JSON.stringify(embedData));
  const originalEmbedData = JSON.parse(JSON.stringify(originalTemplateState.embedData));



  if (timestampUpdateInterval) {
    currentEmbedData.timestamp = originalEmbedData.timestamp;
  }

  if (JSON.stringify(currentEmbedData) !== JSON.stringify(originalEmbedData)) return true;

  if (JSON.stringify(messageData) !== JSON.stringify(originalTemplateState.messageData)) return true;

  if (JSON.stringify(webhooks) !== JSON.stringify(originalTemplateState.webhooks)) return true;

  if (activeWebhook !== originalTemplateState.activeWebhook) return true;

  return false;
}


function clearAllContent() {
  showConfirmationModal(
    t('confirm_clear_title'),
    t('confirm_clear_message'),
    () => {
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
      showSuccessModal(t('msg_success'), t('msg_cleared'));
      if (isTemplateView) updateSaveTemplateChangesButton();
      saveCurrentState();
    }
  );
}



let modalStack = [];

function showModal(title, bodyHTML, onConfirm = null, dangerBtnText = null, onDanger = null, noFooter = false) {
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'modal-overlay';
  modalOverlay.setAttribute('tabindex', '-1');

  const modalId = 'modal-' + Date.now() + Math.random().toString(36).substr(2, 9);
  modalOverlay.id = modalId;

  const footerHTML = noFooter ? '' : `
    <div class="modal-footer">
      ${dangerBtnText ? `<button class="btn-danger" onclick="modalDangerAction('${modalId}')">${dangerBtnText}</button>` : ''}
      <button class="btn btn-secondary" onclick="closeModal('${modalId}')">${t('cancel')}</button>
      ${onConfirm ? `<button class="btn btn-primary" onclick="modalConfirmAction('${modalId}')">${t('save')}</button>` : ''}
    </div>
  `;
  modalOverlay.innerHTML = `
    <div class="modal-box scale-up">
      <div class="modal-header">
        <h3 class="modal-title">${title}</h3>
        <button class="modal-close" onclick="closeModal('${modalId}')">&times;</button>
      </div>
      <div class="modal-body">${bodyHTML}</div>
      ${footerHTML}
    </div>
  `;

  document.body.appendChild(modalOverlay);
  setTimeout(() => modalOverlay.focus(), 0);


  modalStack.push({
    id: modalId,
    onConfirm: onConfirm,
    onDanger: onDanger,
    element: modalOverlay,
    keydownListener: null
  });

  const currentModalIndex = modalStack.length - 1;
  const currentModalEntry = modalStack[currentModalIndex];

  const keydownListener = (event) => {

    if (modalStack.length > 0 && modalStack[modalStack.length - 1].id === modalId) {
      if (event.key === 'Escape') {
        closeModal(modalId);
      } else if (onConfirm && event.key === 'Enter') {
        if (event.shiftKey && event.target.tagName === 'TEXTAREA') {

        } else {
          event.preventDefault();
          modalConfirmAction(modalId);
        }
      }
    }
  };
  currentModalEntry.keydownListener = keydownListener;
  document.addEventListener('keydown', keydownListener);


  modalOverlay.style.zIndex = 1000 + modalStack.length;
}

function modalConfirmAction(modalId) {
  const modalEntry = modalStack.find(m => m.id === modalId);
  if (modalEntry && modalEntry.onConfirm) {
    modalEntry.onConfirm();
  }
  closeModal(modalId);
}

function modalDangerAction(modalId) {
  const modalEntry = modalStack.find(m => m.id === modalId);
  if (modalEntry && modalEntry.onDanger) {
    modalEntry.onDanger();
  }
  closeModal(modalId);
}

function closeModalOnOverlay(event) {

  const clickedModalOverlay = event.target.closest('.modal-overlay');
  if (clickedModalOverlay) {
    closeModal(clickedModalOverlay.id);
  }
}

function closeModal(modalIdToClose = null) {
  let modalToClose;
  if (modalIdToClose) {
    const index = modalStack.findIndex(m => m.id === modalIdToClose);
    if (index > -1) {
      modalToClose = modalStack[index];
      modalStack.splice(index, 1);
    }
  } else {

    modalToClose = modalStack.pop();
  }

  if (modalToClose) {
    document.removeEventListener('keydown', modalToClose.keydownListener);
    modalToClose.element.remove();
  }


  if (modalStack.length > 0) {
    const newTopModal = modalStack[modalStack.length - 1].element;
    setTimeout(() => newTopModal.focus(), 0);
  }
}

function startTimestampUpdate() {
  if (timestampUpdateInterval) {
    clearInterval(timestampUpdateInterval);
  }
  isTimestampLive = true;
  timestampUpdateInterval = setInterval(() => {
    embedData.timestamp = new Date().toISOString();
    updatePreview();
    if (isTemplateView) updateSaveTemplateChangesButton();
  }, 1000);
}

function stopTimestampUpdate() {
  if (timestampUpdateInterval) {
    clearInterval(timestampUpdateInterval);
    timestampUpdateInterval = null;
  }
  isTimestampLive = false;
}


function openReportBugModal() {

  const helpCenterModal = document.querySelector('.help-center-modal');
  if (helpCenterModal) {

    const closeBtn = helpCenterModal.querySelector('#closeHelpCenterBtn');
    if (closeBtn) {
      closeBtn.click();
    }
  }

  const githubIssuesUrl = "https://github.com/Salmonidas/discord-embed-message-builder/issues";
  const reportBugModalBodyHtml = `
        <p style="margin-bottom: 1rem;">${t('report_bug_explanation')}</p>
        <p style="margin-bottom: 1rem;"><strong>${t('report_bug_version')}</strong> <strong>${APP_VERSION}</strong></p>
        
        <h4 style="margin-top: 1.5rem;">${t('report_bug_type_title')}</h4>
        <p>${t('report_bug_type_explanation')}</p>
        <ul class="report-labels-list" style="padding-left: 0; margin-top: 0.5rem; list-style-type: none;">
            <li><span class="report-label-bug">bug</span> - ${t('report_bug_type_bug_desc')}</li>
            <li><span class="report-label-enhancement">enhancement</span> - ${t('report_bug_type_enhancement_desc')}</li>
            <li><span class="report-label-documentation">documentation</span> - ${t('report_bug_type_documentation_desc')}</li>
            <li><span class="report-label-question">question</span> - ${t('report_bug_type_question_desc')}</li>
        </ul>
        <p style="margin-top: 0.5rem;">${t('report_bug_type_outro')}</p>

        <h4 style="margin-top: 1.5rem;">${t('report_bug_info_title')}</h4>
        <small style="display: block; margin-bottom: 1rem; font-style: italic;">
            ${t('report_bug_info_title_clarification')}
        </small>
        <ul style="padding-left: 1.25rem;">
            <li>${t('report_bug_info_1')}</li>
            <li>${t('report_bug_info_2')}</li>
            <li>${t('report_bug_info_3')}</li>
            <li>${t('report_bug_info_4')}</li>
            <li>${t('report_bug_info_5')}</li>
        </ul>
        <div style="display: flex; justify-content: center; margin-top: 1.5rem;">
            <a href="${githubIssuesUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
                ${t('btn_open_github_issues')}
            </a>
        </div>
        <div class="modal-footer-report-bug" style="padding-top: var(--spacing-lg); border-top: 2px solid var(--border-color); margin-top: var(--spacing-lg); display: flex; justify-content: flex-end;">
            <button class="btn btn-secondary" onclick="closeModal()">
                ${t('btn_close')}
            </button>
        </div>
    `;
  showModal(t('modal_report_bug_title'), reportBugModalBodyHtml, null, null, null, true);
}

function openFAQModal() {

  const helpCenterModal = document.querySelector('.help-center-modal');
  if (helpCenterModal) {

    const closeBtn = helpCenterModal.querySelector('#closeHelpCenterBtn');
    if (closeBtn) {
      closeBtn.click();
    }
  }

  const faqContentHtml = `
        <div class="faq-section">
            <details class="faq-item">
                <summary class="faq-question">${t('faq_q1')}</summary>
                <div class="faq-answer">
                    <ul>
                        <li>${t('faq_a1_step1')}</li>
                        <li>${t('faq_a1_step2')}</li>
                        <li>${t('faq_a1_step3')}</li>
                        <li>${t('faq_a1_step4')}</li>
                        <li>${t('faq_a1_step5')}</li>
                        <li>${t('faq_a1_step6')}</li>
                        <li>${t('faq_a1_step7')}</li>
                    </ul>
                </div>
            </details>
            <details class="faq-item">
                <summary class="faq-question">${t('faq_q2')}</summary>
                <div class="faq-answer">
                    <p>${t('faq_a2')}</p>
                </div>
            </details>
            <details class="faq-item">
                <summary class="faq-question">${t('faq_q3')}</summary>
                <div class="faq-answer">
                    <p>${t('faq_a3')}</p>
                </div>
            </details>
            <details class="faq-item">
                <summary class="faq-question">${t('faq_q4')}</summary>
                <div class="faq-answer">
                    <ul>
                        <li>${t('faq_a4_step1')}</li>
                        <li>${t('faq_a4_step2')}</li>
                        <li>${t('faq_a4_step3')}</li>
                    </ul>
                </div>
            </details>
            <details class="faq-item">
                <summary class="faq-question">${t('faq_q5')}</summary>
                <div class="faq-answer">
                    <ul>
                        <li>${t('faq_a5_step1')}</li>
                        <li>${t('faq_a5_step2')}</li>
                        <li>${t('faq_a5_step3')}</li>
                    </ul>
                </div>
            </details>
            <details class="faq-item">
                <summary class="faq-question">${t('faq_q6')}</summary>
                <div class="faq-answer">
                    <ul>
                        <li>${t('faq_a6_format1')}</li>
                        <li>${t('faq_a6_format2')}</li>
                        <li>${t('faq_a6_format3')}</li>
                        <li>${t('faq_a6_format4')}</li>
                    </ul>
                </div>
            </details>
            <details class="faq-item">
                <summary class="faq-question">${t('faq_q7')}</summary>
                <div class="faq-answer">
                    <p>${t('faq_a7')}</p>
                </div>
            </details>
            <details class="faq-item">
                <summary class="faq-question">${t('faq_q8')}</summary>
                <div class="faq-answer">
                    <ul>
                        <li>${t('faq_a8_title')}</li>
                        <li>${t('faq_a8_description')}</li>
                        <li>${t('faq_a8_fields_max')}</li>
                        <li>${t('faq_a8_field_name')}</li>
                        <li>${t('faq_a8_field_value')}</li>
                        <li>${t('faq_a8_embed_total')}</li>
                    </ul>
                </div>
            </details>
        </div>
        <div class="modal-footer-faq" style="padding-top: var(--spacing-lg); border-top: 2px solid var(--border-color); margin-top: var(--spacing-lg); display: flex; justify-content: flex-end;">
            <button class="btn btn-secondary" onclick="closeModal()">
                ${t('btn_close')}
            </button>
        </div>
    `;
  showModal(t('modal_faq_title'), faqContentHtml, null, null, null, true);
}

let isDonationProcessing = false;

function openDonationModal() {
  const CHECKOUT_URL = 'https://salmonidas.lemonsqueezy.com/checkout/buy/61c04df0-3855-4fff-87ca-fe084713823e';
  const GITHUB_SPONSORS_URL = 'https://github.com/sponsors/Salmonidas';

  const content = `
    <div class="legal-content" style="text-align: center;">
      <p>${t('donation_modal_description')}</p>
      <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 16px;">
        <button class="btn btn-primary" id="donateOptionLemon" style="width: 100%; padding: 14px 20px; font-size: 1rem;">
          ${t('donation_option_lemon')}
        </button>
        <button class="btn btn-secondary" id="donateOptionGithub" style="width: 100%; padding: 14px 20px; font-size: 1rem;">
          ${t('donation_option_github')}
        </button>
      </div>
    </div>
  `;

  showModal(t('donation_modal_title'), content, null, null, null, true);

  setTimeout(() => {
    const lemonBtn = document.getElementById('donateOptionLemon');
    const githubBtn = document.getElementById('donateOptionGithub');

    if (lemonBtn) {
      lemonBtn.addEventListener('click', () => {
        if (isDonationProcessing) return;
        isDonationProcessing = true;

        if (typeof window !== 'undefined') {
          if (!window.LemonSqueezy && window.createLemonSqueezy) {
            window.createLemonSqueezy();
          }

          if (window.LemonSqueezy) {
            window.LemonSqueezy.Setup({
              eventHandler: (event) => {
                if (event.event === 'Checkout.Success') {
                  showNotification(t('donation_success'), 'success');
                }
              }
            });
            window.LemonSqueezy.Url.Open(CHECKOUT_URL);
            isDonationProcessing = false;
            return;
          }
        }

        window.open(CHECKOUT_URL, '_blank', 'noopener,noreferrer');
        setTimeout(() => { isDonationProcessing = false; }, 500);
      });
    }

    if (githubBtn) {
      githubBtn.addEventListener('click', () => {
        if (isDonationProcessing) return;
        isDonationProcessing = true;
        window.open(GITHUB_SPONSORS_URL, '_blank', 'noopener,noreferrer');
        const modal = githubBtn.closest('.modal-overlay');
        if (modal) modal.remove();
        setTimeout(() => { isDonationProcessing = false; }, 500);
      });
    }
  }, 100);
}

function openLegalModal(type) {
  const LEGAL_IDENTITY_URL = 'https://salmonidas-dev.vercel.app/legal-identity';
  let title, content;

  if (type === 'privacy') {
    title = t('modal_privacy_policy');
    content = `
      <div class="legal-content">
        <h3>${title}</h3>
        <p><strong>${t('legal_updated')}</strong></p>
        <p>${t('privacy_intro')}</p>

        <h4>${t('privacy_section_controller')}</h4>
        <p>${t('privacy_controller_text')}</p>
        <p><a href="${LEGAL_IDENTITY_URL}" target="_blank" rel="noopener noreferrer">${t('privacy_controller_link_text')}</a></p>

        <h4>${t('privacy_section_data_collection')}</h4>
        <p>${t('privacy_data_collection_text')}</p>
        <ul>
          <li>${t('privacy_data_theme')}</li>
          <li>${t('privacy_data_language')}</li>
          <li>${t('privacy_data_webhooks')}</li>
          <li>${t('privacy_data_templates')}</li>
          <li>${t('privacy_data_embed')}</li>
          <li>${t('privacy_data_consent')}</li>
          <li>${t('privacy_data_banner')}</li>
          <li>${t('privacy_data_tutorial')}</li>
        </ul>

        <h4>${t('privacy_section_no_server')}</h4>
        <p>${t('privacy_no_server_text')}</p>

        <h4>${t('privacy_section_external')}</h4>
        <p>${t('privacy_external_text')}</p>
        <ul>
          <li>${t('privacy_external_discord')}</li>
          <li>${t('privacy_external_github')}</li>
          <li>${t('privacy_external_lemon')}</li>
        </ul>

        <h4>${t('privacy_section_image_uploads')}</h4>
        <p>${t('privacy_image_uploads_text')}</p>

        <h4>${t('privacy_section_retention')}</h4>
        <p>${t('privacy_retention_text')}</p>

        <h4>${t('privacy_section_rights')}</h4>
        <p>${t('privacy_rights_text')}</p>

        <h4>${t('privacy_section_contact')}</h4>
        <p>${t('privacy_contact_text')}</p>
      </div>
    `;
  } else if (type === 'terms') {
    title = t('modal_terms_of_use');
    content = `
      <div class="legal-content">
        <h3>${title}</h3>
        <p><strong>${t('legal_updated')}</strong></p>

        <h4>${t('terms_section_object')}</h4>
        <p>${t('terms_object_text')}</p>

        <h4>${t('terms_section_license')}</h4>
        <p>${t('terms_license_text')}</p>

        <h4>${t('terms_section_liability')}</h4>
        <p>${t('terms_liability_text')}</p>

        <h4>${t('terms_section_discord')}</h4>
        <p>${t('terms_discord_text')}</p>

        <h4>${t('terms_section_prohibited')}</h4>
        <p>${t('terms_prohibited_text')}</p>
        <ul>
          <li>${t('terms_prohibited_spam')}</li>
          <li>${t('terms_prohibited_harassment')}</li>
          <li>${t('terms_prohibited_discord')}</li>
          <li>${t('terms_prohibited_illegal')}</li>
        </ul>

        <h4>${t('terms_section_changes')}</h4>
        <p>${t('terms_changes_text')}</p>

        <h4>${t('terms_section_law')}</h4>
        <p>${t('terms_law_text')}</p>
      </div>
    `;
  } else if (type === 'cookies') {
    title = t('modal_cookie_policy');
    content = `
      <div class="legal-content">
        <h3>${title}</h3>
        <p><strong>${t('legal_updated')}</strong></p>

        <h4>${t('cookies_section_what')}</h4>
        <p>${t('cookies_what_text')}</p>

        <h4>${t('cookies_section_table_title')}</h4>
        <table class="legal-table" style="width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 0.9em;">
          <thead>
            <tr style="border-bottom: 2px solid var(--border-color, #444);">
              <th style="text-align: left; padding: 8px;">${t('cookies_table_key')}</th>
              <th style="text-align: left; padding: 8px;">${t('cookies_table_purpose')}</th>
              <th style="text-align: left; padding: 8px;">${t('cookies_table_retention')}</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid var(--border-color, #333);"><td style="padding: 6px 8px; font-family: monospace; font-size: 0.85em;">preferences</td><td style="padding: 6px 8px;">${t('cookies_table_preferences')}</td><td style="padding: 6px 8px;">${t('cookies_table_retention_value')}</td></tr>
            <tr style="border-bottom: 1px solid var(--border-color, #333);"><td style="padding: 6px 8px; font-family: monospace; font-size: 0.85em;">webhooks</td><td style="padding: 6px 8px;">${t('cookies_table_webhooks')}</td><td style="padding: 6px 8px;">${t('cookies_table_retention_value')}</td></tr>
            <tr style="border-bottom: 1px solid var(--border-color, #333);"><td style="padding: 6px 8px; font-family: monospace; font-size: 0.85em;">templates</td><td style="padding: 6px 8px;">${t('cookies_table_templates')}</td><td style="padding: 6px 8px;">${t('cookies_table_retention_value')}</td></tr>
            <tr style="border-bottom: 1px solid var(--border-color, #333);"><td style="padding: 6px 8px; font-family: monospace; font-size: 0.85em;">currentEmbed</td><td style="padding: 6px 8px;">${t('cookies_table_embed')}</td><td style="padding: 6px 8px;">${t('cookies_table_retention_value')}</td></tr>
            <tr style="border-bottom: 1px solid var(--border-color, #333);"><td style="padding: 6px 8px; font-family: monospace; font-size: 0.85em;">activeWebhook</td><td style="padding: 6px 8px;">${t('cookies_table_active_webhook')}</td><td style="padding: 6px 8px;">${t('cookies_table_retention_value')}</td></tr>
            <tr style="border-bottom: 1px solid var(--border-color, #333);"><td style="padding: 6px 8px; font-family: monospace; font-size: 0.85em;">cookieConsent</td><td style="padding: 6px 8px;">${t('cookies_table_consent')}</td><td style="padding: 6px 8px;">${t('cookies_table_retention_value')}</td></tr>
            <tr style="border-bottom: 1px solid var(--border-color, #333);"><td style="padding: 6px 8px; font-family: monospace; font-size: 0.85em;">donationBannerDate</td><td style="padding: 6px 8px;">${t('cookies_table_banner')}</td><td style="padding: 6px 8px;">${t('cookies_table_retention_value')}</td></tr>
            <tr><td style="padding: 6px 8px; font-family: monospace; font-size: 0.85em;">helpTutorialShown</td><td style="padding: 6px 8px;">${t('cookies_table_tutorial')}</td><td style="padding: 6px 8px;">${t('cookies_table_retention_value')}</td></tr>
          </tbody>
        </table>

        <h4>${t('cookies_section_exemption')}</h4>
        <p><strong>${t('cookies_exemption_text')}</strong></p>

        <h4>${t('cookies_section_purpose')}</h4>
        <p>${t('cookies_purpose_text')}</p>

        <h4>${t('cookies_section_control')}</h4>
        <p>${t('cookies_control_text')}</p>
        <p>${t('cookies_control_note')}</p>
      </div>
    `;
  } else if (type === 'legal') {
    title = t('modal_legal_notice');
    content = `
      <div class="legal-content">
        <h3>${title}</h3>
        <p><strong>${t('legal_updated')}</strong></p>

        <h4>${t('legal_section_object')}</h4>
        <p>${t('legal_object_text')}</p>

        <h4>${t('legal_section_ip')}</h4>
        <p>${t('legal_ip_text')}</p>

        <h4>${t('legal_section_liability')}</h4>
        <p>${t('legal_liability_text')}</p>

        <h4>${t('legal_section_law')}</h4>
        <p>${t('legal_law_text')}</p>

        <h4>${t('legal_section_identity')}</h4>
        <p>${t('legal_identity_text')}</p>
        <p><a href="${LEGAL_IDENTITY_URL}" target="_blank" rel="noopener noreferrer">${t('legal_identity_link_text')}</a></p>
      </div>
    `;
  }

  showModal(title, content, null, null, null, true);
}


document.addEventListener('DOMContentLoaded', init);