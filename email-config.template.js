// EmailJS Configuration Template
// INSTRUKSJONER:
// 1. Kopier denne filen til 'email-config.js'
// 2. Erstatt verdiene nedenfor med dine ekte EmailJS-nøkler
// 3. 'email-config.js' er i .gitignore og vil ikke bli commitet

const EMAIL_CONFIG = {
    publicKey: 'YOUR_EMAILJS_PUBLIC_KEY_HERE',
    serviceId: 'YOUR_EMAILJS_SERVICE_ID_HERE', 
    templateId: 'YOUR_EMAILJS_TEMPLATE_ID_HERE'
};

// Eksporter konfigurasjonen
window.EMAIL_CONFIG = EMAIL_CONFIG;
