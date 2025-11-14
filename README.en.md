# Discord Embed Creator

[🇪🇸 Versión en español](README.md)

---

**🌐 App URL:**  
> [https://salmonidas.github.io/discord-embed-message-builder](https://salmonidas.github.io/discord-embed-message-builder/)

---

## What is Discord Embed Creator?

An advanced visual generator for Discord embed messages, designed to facilitate professional creation, management, and sending of rich media messages via webhooks.  
It allows you to save templates, change languages and themes, and manage multiple webhooks locally and securely.

---

## Main Features

- **Visual embed creation:** Fill in the fields from the side panel and view changes in real time.
- **Light/dark theme and instant language switching (ES/EN).**
- **Local webhook management:** Add, modify, or remove your Discord webhook URLs. Completely isolated between main page and templates.
- **Smart templates:** Save, load, and share designs as unique links. Templates maintain their own independent webhook configuration.
- **Real-time preview of the final result.**
- **Clear modal system** for notifications, errors, and confirmations (no invasive popups).
- **Character counters** in all fields to respect Discord limits.
- **Help center** with practical video tutorial and step-by-step guide.
- **Full support for emojis, special characters, URLs, and multimedia elements.**
- **Private and secure configuration:** All your data (webhooks, templates, preferences) is stored exclusively in your browser.
- **Complete legal information:** Privacy Policy, Terms of Use, and Cookies accessible in the footer.

---

## How to use each section

### 1. Embeds

- Complete the data in the side panel (title, description, color, author, footer, image, thumbnail, custom fields).
- Changes are shown in the preview immediately.
- Use the integrated validator to ensure all fields meet Discord requirements.

### 2. Webhooks

- Add your Discord webhook URL(s).
- Switch between them quickly or assign one per template.
- The system prevents contamination between main page and templates (each context has its own webhooks).
- Test your webhook before sending important messages.

### 3. Templates

- Save any design as a template, generate a unique link, and share it.
- Load saved templates from the template manager.
- Templates are completely independent in terms of webhook configuration and data.
- Export templates as JSON for backups or import into other systems.

### 4. Help Center

- Access visual tutorials, practical examples, and frequently asked questions.
- Report bugs or suggest improvements using the GitHub Issues button.
- Check the video tutorial section to learn advanced features.

---

## Best Practices and Tips

- **Save links to your favorite templates** as shortcuts to always have them at hand.
- **Don't worry about privacy:** Everything stays in your browser; no one accesses your embeds or webhooks.
- **Use the notification system** to know if there are errors, save confirmations, etc.
- **Always check Discord limits:** The integrated validator prevents sending malformed embeds.
- **Report any bugs** using the Issues button in the help center.
- **Change the language and theme** to your liking at any time; your preferences are saved automatically.
- **The donation banner** and heart are optional and don't affect your experience.

---

## Technical and Security Notes

### Validations

- URLs must have a valid format (`http://` or `https://`).
- Hexadecimal colors are validated before saving.
- Each required field shows an error if information is missing.
- Embeds are validated against Discord's official limits before sending.

### Webhook Management

- Webhooks and templates are independent; changes to templates do NOT affect your main configuration.
- Each webhook is tested before being assigned to prevent sending errors.
- Webhooks are stored locally in your browser securely.

### Export and Import

- You can export any embed as valid JSON for use in other bots or tools.
- Import templates from JSON to reuse designs from other users.
- All exported data maintains compatibility with the Discord API.

### Internationalization

- The web is available in Spanish and English, with automatic translation of the entire interface.
- Language changes are applied instantly without losing your work.

---

## How to Report Bugs or Suggest Improvements

- Go to the **Help Center** (question mark icon).
- Click the **"Report Error"** button to open an issue on GitHub.
- Attach screenshots, a clear description, and steps to reproduce the problem if possible.
- You can also suggest new features in the same way.

---

## Privacy and Storage

All your data is stored exclusively in your browser:
- **Webhooks:** Stored on your device, not on remote servers.
- **Templates:** Saved locally with shareable access via unique link.
- **Preferences:** Language, theme, and settings saved in your browser.
- **Embeds:** Never transmitted or stored on external servers.

Check the **Privacy Policy** in the footer for more details.

---

## Requirements and Supported Browsers

- **Browsers:** Chrome, Firefox, Safari, Edge (recent versions).
- **JavaScript:** Must be enabled.
- **Local Storage:** Your browser must allow local storage (localStorage).

---

Enjoy creating your Discord embed messages!

For more information or support, contact through the Help Center or open an issue on GitHub.