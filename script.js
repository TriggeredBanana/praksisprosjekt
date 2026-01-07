// DOM-elementer
const navbar = document.querySelector('.navbar');
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const contactForm = document.getElementById('contactForm');
const scrollToTopBtn = document.getElementById('scrollToTop');

// Initialiser applikasjonen
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initialiserer applikasjon...');
    
    // Last email-konfigurasjonen fra API
    loadEmailConfig().then(() => {
        initializeNavigation();
        initializeScrollEffects();
        initializeContactForm();
        initializeScrollToTop();
    }).catch(error => {
        console.error('Feil ved lasting av email-konfigurasjon:', error);
        // Initialiser resten av appen selv om email ikke fungerer
        initializeNavigation();
        initializeScrollEffects();
        initializeContactForm();
        initializeScrollToTop();
    });
});

// Last EmailJS-konfigurasjonen
async function loadEmailConfig() {
    try {
        const response = await fetch('/api/config');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const config = await response.json();
        
        // Lagre konfigurasjonen globalt
        window.EMAIL_CONFIG = config;
        
        // Initialiser EmailJS
        if (typeof emailjs !== 'undefined') {
            console.log('Initialiserer EmailJS med config fra API');
            emailjs.init({
                publicKey: config.publicKey
            });
        } else {
            console.warn('EmailJS library ikke lastet ennå');
        }
        
        return config;
        
    } catch (error) {
        console.error('Kunne ikke laste email-konfigurasjon:', error);
        throw error;
    }
}

// Navigasjonsfunksjonalitet
function initializeNavigation() {
    // Mobilmeny-veksling
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.classList.toggle('nav-open');
    });

    // Lukk mobilmeny når man klikker på en lenke
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.classList.remove('nav-open');
        });
    });

    // Lukk mobilmeny når man klikker utenfor
    document.addEventListener('click', function(e) {
        if (!navbar.contains(e.target)) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.classList.remove('nav-open');
        }
    });

    // Jevn rulling for navigasjonslenker
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            
            // Håndter kun interne hash-lenker (eks: #home)
            if (targetId && targetId.startsWith('#')) {
                e.preventDefault();
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    const offsetTop = targetSection.offsetTop - 70; // Juster for navbar
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            }
            // Hvis lenken ikke starter med # så håndterer browseren den normalt
        });
    });
}

// Rulleeffekter
function initializeScrollEffects() {
    window.addEventListener('scroll', function() {
        // Oppdater aktiv navigasjonslenke
        updateActiveNavLink();
        
        // Navbar scroll animation
        updateNavbarOnScroll();
        
        // Scroll to top button visibility
        updateScrollToTopButton();
    });
}

// Oppdater navbar basert på scroll posisjon
function updateNavbarOnScroll() {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}

// Oppdater scroll to top button synlighet
function updateScrollToTopButton() {
    if (scrollToTopBtn) {
        if (window.scrollY > 300) {
            scrollToTopBtn.classList.add('visible');
        } else {
            scrollToTopBtn.classList.remove('visible');
        }
    }
}

// Initialiser scroll to top funksjonalitet
function initializeScrollToTop() {
    if (scrollToTopBtn) {
        scrollToTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// Oppdater aktiv navigasjonslenke basert på rulleposisjon
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.scrollY + 100;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
        
        if (navLink) {
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                navLinks.forEach(link => link.classList.remove('active'));
                navLink.classList.add('active');
            }
        }
    });
}

// Legg til CSS-animasjonsstiler dynamisk
function addAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .nav-link.active {
            color: var(--primary-color);
            background-color: var(--gray-50);
        }
        
        body.nav-open {
            overflow: hidden;
        }
    `;
    document.head.appendChild(style);
}

// Kontaktskjemafunksjonalitet
function initializeContactForm() {
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Hent skjemadata
        const formData = new FormData(this);
        const data = Object.fromEntries(formData);
        
        // Valider skjema
        if (validateContactForm(data)) {
            submitContactForm(data);
        }
    });
    
    // Sanntidsvalidering
    const inputs = contactForm.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            clearFieldError(this);
        });
    });
}

// Valider kontaktskjema
function validateContactForm(data) {
    let isValid = true;
    
    // Påkrevde felt
    const requiredFields = ['company', 'name', 'email'];
    
    requiredFields.forEach(field => {
        if (!data[field] || data[field].trim() === '') {
            showFieldError(field, 'Dette feltet er påkrevd');
            isValid = false;
        }
    });
    
    // E-postvalidering
    if (data.email && !isValidEmail(data.email)) {
        showFieldError('email', 'Vennligst oppgi en gyldig e-postadresse');
        isValid = false;
    }
    
    return isValid;
}

// Valider individuelt felt
function validateField(field) {
    const value = field.value.trim();
    const name = field.name;
    
    clearFieldError(field);
    
    if (field.hasAttribute('required') && !value) {
        showFieldError(name, 'Dette feltet er påkrevd');
        return false;
    }
    
    if (name === 'email' && value && !isValidEmail(value)) {
        showFieldError(name, 'Vennligst oppgi en gyldig e-postadresse');
        return false;
    }
    
    return true;
}

// Vis feltfeil
function showFieldError(fieldName, message) {
    const field = contactForm.querySelector(`[name="${fieldName}"]`);
    if (!field) return;
    
    field.classList.add('error');
    
    // Fjern eksisterende feilmelding
    const existingError = field.parentElement.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Legg til feilmelding
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    errorElement.style.cssText = `
        color: #ef4444;
        font-size: 0.875rem;
        margin-top: 4px;
        display: block;
    `;
    
    field.parentElement.appendChild(errorElement);
    
    // Legg til feilstiler
    field.style.borderColor = '#ef4444';
    field.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
}

// Fjern feltfeil
function clearFieldError(field) {
    field.classList.remove('error');
    field.style.borderColor = '';
    field.style.boxShadow = '';
    
    const errorMessage = field.parentElement.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
}

// E-postvalidering
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Send kontaktskjema
function submitContactForm(data) {
    const submitButton = contactForm.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    
    // Vis lastestatus
    submitButton.innerHTML = 'Sender...';
    submitButton.disabled = true;
    
    // Debug logging
    console.log('EmailJS tilgjengelig:', typeof emailjs !== 'undefined');
    console.log('EMAIL_CONFIG tilgjengelig:', typeof window.EMAIL_CONFIG !== 'undefined');
    console.log('EMAIL_CONFIG innhold:', window.EMAIL_CONFIG);
    
    // Sjekk om EmailJS er tilgjengelig
    if (typeof emailjs !== 'undefined' && emailjs.send && window.EMAIL_CONFIG) {
        console.log('Prøver å sende e-post via EmailJS...');
        
        // Send e-post via EmailJS
        const templateParams = {
            from_company: data.company,
            from_name: data.name,
            from_email: data.email,
            message: data.message,
            to_name: 'Daniel Møgster',
            to_email: 'mogsterdaniel@gmail.com',
            reply_to: data.email
        };
        
        console.log('Template parametere:', templateParams);
        
        emailjs.send(window.EMAIL_CONFIG.serviceId, window.EMAIL_CONFIG.templateId, templateParams)
            .then(function(response) {
                console.log('E-post sendt!', response.status, response.text);
                
                // Vis suksessmelding
                showNotification('Takk for din melding! Vi tar kontakt snart.', 'success');
                
                // Nullstill skjema
                contactForm.reset();
                
            }, function(error) {
                console.log('Feil ved sending av e-post:', error);
                console.log('Feiltype:', error.status, error.text);
                
                // Fallback til mailto
                openMailtoFallback(data);
            })
            .finally(function() {
                // Nullstill knapp
                submitButton.innerHTML = originalText;
                submitButton.disabled = false;
            });
    } else {
        console.log('EmailJS ikke tilgjengelig, bruker fallback');
        console.log('emailjs definert:', typeof emailjs !== 'undefined');
        console.log('emailjs.send definert:', typeof emailjs !== 'undefined' && typeof emailjs.send !== 'undefined');
        console.log('EMAIL_CONFIG definert:', typeof window.EMAIL_CONFIG !== 'undefined');
        
        // Fallback til mailto hvis EmailJS ikke er tilgjengelig
        openMailtoFallback(data);
        
        // Nullstill knapp
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
    }
}

// Fallback funksjon som åpner mailto
function openMailtoFallback(data) {
    const subject = encodeURIComponent(`Henvendelse fra ${data.company} - ${data.name}`);
    const body = encodeURIComponent(`
Hei Gruppe 8,

Bedrift: ${data.company}
Navn: ${data.name}
E-post: ${data.email}

Melding:
${data.message || 'Ingen melding oppgitt'}

Mvh,
${data.name}
    `);
    
    const mailtoLink = `mailto:mogsterdaniel@gmail.com?subject=${subject}&body=${body}`;
    
    // Åpne mailto
    window.location.href = mailtoLink;
    
    // Vis melding til bruker
    showNotification('Åpner e-postklienten din. Hvis den ikke åpnes automatisk, send direkte til mogsterdaniel@gmail.com', 'info');
    
    // Nullstill skjema
    contactForm.reset();
}

// Vis varsling
function showNotification(message, type = 'info') {
    // Fjern eksisterende varslinger
    document.querySelectorAll('.notification').forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        max-width: 400px;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        display: flex;
        align-items: center;
        gap: 12px;
    `;
    
    document.body.appendChild(notification);
    
    // Glid inn
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Lukk-knappfunksjonalitet
    const closeButton = notification.querySelector('.notification-close');
    closeButton.addEventListener('click', () => {
        closeNotification(notification);
    });
    
    // Lukk automatisk etter 5 sekunder
    setTimeout(() => {
        closeNotification(notification);
    }, 4000);
}

// Lukk varsling
function closeNotification(notification) {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 300);
}

// E-postvalidering
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Initialiser stiler
addAnimationStyles();

// Åpne prosjekt modal
function openProjectModal(card) {
    const modal = document.getElementById('projectModal');
    const modalBody = document.getElementById('modalBody');
    const detailedContent = card.querySelector('.project-detailed-content');
    
    if (detailedContent && modal && modalBody) {
        // Klon innholdet
        modalBody.innerHTML = detailedContent.innerHTML;
        
        // Vis modal med animasjon
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Utløs animasjon
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
    }
}

// Lukk prosjekt modal
function closeProjectModal(event) {
    const modal = document.getElementById('projectModal');
    
    if (modal) {
        modal.classList.remove('active');
        
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
            
            // Tøm innhold
            const modalBody = document.getElementById('modalBody');
            if (modalBody) {
                modalBody.innerHTML = '';
            }
        }, 300);
    }
}

// Lukk modal med Escape-tast
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeProjectModal();
        closeTeamModal();
    }
});

// Åpne team medlem modal
function openTeamModal(card) {
    const modal = document.getElementById('teamModal');
    const modalBody = document.getElementById('teamModalBody');
    const detailedContent = card.querySelector('.member-detailed-content');
    
    if (detailedContent && modal && modalBody) {
        // Klon innholdet
        modalBody.innerHTML = detailedContent.innerHTML;
        
        // Vis modal med animasjon
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Utløs animasjon
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
    }
}

// Lukk team medlem modal
function closeTeamModal(event) {
    const modal = document.getElementById('teamModal');
    
    if (modal) {
        modal.classList.remove('active');
        
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
            
            // Tøm innhold
            const modalBody = document.getElementById('teamModalBody');
            if (modalBody) {
                modalBody.innerHTML = '';
            }
        }, 300);
    }
}
