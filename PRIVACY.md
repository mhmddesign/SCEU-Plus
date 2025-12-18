# Privacy Policy for Simple Chrome Extension Utilities

**Last Updated:** December 19, 2025

## 1. Introduction
"Simple Chrome Extension Utilities" (the "Extension") is a browser extension created by MHMD EL MAACHI. We respect your privacy. This policy describes how we handle information when you use our extension.

## 2. Data Collection and Usage
**We do not collect, store, or transmit your personal data.**

The Extension operates entirely locally on your device. No data is sent to external servers, analytics platforms, or third parties.

### 2.1 Local Storage
We use the browser's local storage API (`chrome.storage`) solely to save your preferences on your own device. This includes:
* **Feature Toggles:** Whether you have enabled the "Text Randomizer" or "Unicode Warning" modules.
* **Theme Preferences:** Your choice of Dark Mode or Light Mode.
* **Security Settings:** Lists of trusted domains you have whitelisted for the Unicode Warning module.

This data never leaves your browser.

## 3. Permissions and Justification
The Extension requires specific permissions to function. Here is how they are used:

* **Host Permissions (All Sites):** This is required **strictly** for the "Unicode Domain Warning" security feature. The Extension checks the URL of the pages you visit to detect malicious "homograph" phishing attacks (e.g., fake domain names using foreign characters). This check happens locally in your browser; your browsing history is **never** recorded or sent anywhere.
* **ActiveTab:** Used to allow the "Text Randomizer" tool to modify the text on the specific page you are currently viewing, only when you click the extension icon.

## 4. Third-Party Services
We do not use any third-party tracking, advertising, or analytics services.

## 5. Contact
If you have questions about this policy, you may contact the developer at: me@mohelmaachi.com
