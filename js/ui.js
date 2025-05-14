/**
 * CodeClash: Programming Competition Leaderboard
 * UI Module
 * 
 * This file handles UI-related functionality such as theme toggling, responsive navigation,
 * scroll effects, and other user interface interactions.
 */

// Export UI-related functions
export function setupTheme() {
    // Create theme toggle button if it doesn't exist
    if (!document.getElementById('theme-toggle')) {
        const header = document.querySelector('header');

        if (header) {
            const themeToggle = document.createElement('button');
            themeToggle.id = 'theme-toggle';
            themeToggle.className = 'theme-toggle';
            themeToggle.setAttribute('aria-label', 'Toggle dark/light theme');
            themeToggle.innerHTML = '<svg class="sun-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2a7 7 0 1 1 0-14 7 7 0 0 1 0 14zm0-15a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0V5a1 1 0 0 1 1-1zm0 15a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1zM5 12a1 1 0 0 1 1-1h1a1 1 0 1 1 0 2H6a1 1 0 0 1-1-1zm12 0a1 1 0 0 1 1-1h1a1 1 0 1 1 0 2h-1a1 1 0 0 1-1-1zm-7.071 3.536a1 1 0 0 1 0 1.414l-.707.707a1 1 0 1 1-1.414-1.414l.707-.707a1 1 0 0 1 1.414 0zm8.485-8.486a1 1 0 0 1 0 1.414l-.707.707a1 1 0 1 1-1.414-1.414l.707-.707a1 1 0 0 1 1.414 0zm-9.9.707a1 1 0 1 1-1.414-1.414l.707-.707a1 1 0 0 1 1.414 1.414l-.707.707zm8.486 8.486a1 1 0 1 1-1.414-1.414l.707-.707a1 1 0 0 1 1.414 1.414l-.707.707z"/></svg><svg class="moon-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M9.57 3.38a8 8 0 0 0 10.4 10.4 8 8 0 1 1-10.4-10.4zm1.02-2.83a10 10 0 1 0 11.6 11.6 10 10 0 1 1-11.6-11.6z"/></svg>';

            header.appendChild(themeToggle);

            // Add event listener for theme toggle
            themeToggle.addEventListener('click', toggleTheme);
        }
    } else {
        // Just add event listener if button already exists
        document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    }

    // Apply saved theme
    const darkMode = localStorage.getItem('darkMode') === 'enabled';
    if (darkMode) {
        document.documentElement.classList.add('dark-theme');
        document.getElementById('theme-toggle')?.classList.add('dark');
    }
}

export function toggleTheme() {
    const darkMode = document.documentElement.classList.contains('dark-theme');
    const newDarkMode = !darkMode;

    if (newDarkMode) {
        document.documentElement.classList.add('dark-theme');
        localStorage.setItem('darkMode', 'enabled');
    } else {
        document.documentElement.classList.remove('dark-theme');
        localStorage.setItem('darkMode', 'disabled');
    }

    // Update button state
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.classList.toggle('dark', newDarkMode);
    }

    // Notify Three.js background to update colors if needed
    document.dispatchEvent(new CustomEvent('theme:changed', {
        detail: { darkMode: newDarkMode }
    }));
}

export function setupResponsiveNavigation() {
    // Create mobile menu toggle button if it doesn't exist
    if (!document.querySelector('.mobile-menu-toggle')) {
        const header = document.querySelector('header');

        if (header) {
            const menuToggle = document.createElement('button');
            menuToggle.className = 'mobile-menu-toggle';
            menuToggle.setAttribute('aria-label', 'Toggle navigation menu');
            menuToggle.innerHTML = '<span></span><span></span><span></span>';

            header.appendChild(menuToggle);

            // Add event listener to toggle menu
            menuToggle.addEventListener('click', toggleMobileMenu);
        }
    } else {
        // Just add event listener if button already exists
        document.querySelector('.mobile-menu-toggle').addEventListener('click', toggleMobileMenu);
    }

    // Handle window resize to reset menu state on desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && document.querySelector('nav').classList.contains('mobile-open')) {
            document.querySelector('nav').classList.remove('mobile-open');
            document.querySelector('.mobile-menu-toggle')?.classList.remove('active');
            document.body.classList.remove('menu-open');
        }
    });
}

export function toggleMobileMenu() {
    const nav = document.querySelector('nav');
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const isOpen = nav.classList.contains('mobile-open');

    if (!isOpen) {
        nav.classList.add('mobile-open');
        menuToggle.classList.add('active');
        document.body.classList.add('menu-open');
    } else {
        nav.classList.remove('mobile-open');
        menuToggle.classList.remove('active');
        document.body.classList.remove('menu-open');
    }
}

export function highlightCurrentPageInNav() {
    // Get the current page path
    const currentPath = window.location.pathname;

    // Find all navigation links
    const navLinks = document.querySelectorAll('nav a');

    // Loop through links and highlight the current one
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath.substring(currentPath.lastIndexOf('/') + 1)) {
            link.classList.add('active');
        }
    });
}

export function setupScrollEffects() {
    // Add intersection observer for fade-in elements
    const fadeElements = document.querySelectorAll('.fade-in');

    if (fadeElements.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        fadeElements.forEach(element => {
            observer.observe(element);
        });
    }

    // Add scroll-to-top button if not already present
    if (!document.getElementById('scroll-to-top')) {
        const scrollBtn = document.createElement('button');
        scrollBtn.id = 'scroll-to-top';
        scrollBtn.className = 'scroll-to-top-btn hidden';
        scrollBtn.setAttribute('aria-label', 'Scroll to top');
        scrollBtn.innerHTML = '&uarr;';

        document.body.appendChild(scrollBtn);

        // Show/hide button based on scroll position
        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) {
                scrollBtn.classList.remove('hidden');
            } else {
                scrollBtn.classList.add('hidden');
            }
        });

        // Add click handler
        scrollBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

export function setupGitHubSubmissionForm() {
    const form = document.getElementById('github-submission-form');
    const modal = document.getElementById('submission-modal');
    const closeButtons = document.querySelectorAll('.close-modal, .modal-content .close-button');

    if (form) {
        form.addEventListener('submit', handleSubmissionFormSubmit);
    }

    if (closeButtons.length > 0) {
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                if (modal) {
                    modal.classList.add('hidden');
                    document.body.classList.remove('modal-open');
                }
            });
        });
    }

    // Close modal when clicking outside content
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
                document.body.classList.remove('modal-open');
            }
        });
    }

    // Close success message
    const closeSuccessBtn = document.querySelector('.close-success');
    if (closeSuccessBtn) {
        closeSuccessBtn.addEventListener('click', () => {
            document.getElementById('submission-success').classList.add('hidden');
        });
    }
}

export function showGitHubSubmissionForm(competitionId) {
    const modal = document.getElementById('submission-modal');
    const competitionIdInput = document.getElementById('competition-id');

    if (modal && competitionIdInput) {
        competitionIdInput.value = competitionId || '';
        modal.classList.remove('hidden');
        document.body.classList.add('modal-open');

        // Focus on first input
        const firstInput = modal.querySelector('input[type="text"]');
        if (firstInput) {
            setTimeout(() => {
                firstInput.focus();
            }, 100);
        }
    }
}

export function handleSubmissionFormSubmit(event) {
    event.preventDefault();

    const username = document.getElementById('github-username').value;
    const repoUrl = document.getElementById('repository-url').value;
    const projectTitle = document.getElementById('project-title').value;
    const description = document.getElementById('project-description').value;
    const competitionId = document.getElementById('competition-id').value;

    // Validate GitHub URL
    if (!validateGitHubUrl(repoUrl)) {
        showFormError('Please enter a valid GitHub repository URL');
        return;
    }

    // Log submission (in a real app, this would be sent to a server)
    console.log('Submission received:', {
        username,
        repositoryUrl: repoUrl,
        projectTitle,
        description,
        competitionId
    });

    // Show success message and hide modal
    document.getElementById('submission-modal').classList.add('hidden');
    showSubmissionSuccessMessage();
}

export function validateGitHubUrl(url) {
    // Simple validation for GitHub repository URL
    const githubPattern = /^https:\/\/github\.com\/[\w-]+\/[\w-]+\/?$/;
    return githubPattern.test(url);
}

export function showFormError(message) {
    // Get or create error element
    let errorElement = document.querySelector('.form-error');

    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'form-error';
        const form = document.getElementById('github-submission-form');
        form.insertBefore(errorElement, form.querySelector('.form-actions'));
    }

    errorElement.textContent = message;
    errorElement.style.display = 'block';

    // Hide error after 5 seconds
    setTimeout(() => {
        errorElement.style.display = 'none';
    }, 5000);
}

export function showSubmissionSuccessMessage() {
    const successMessage = document.getElementById('submission-success');

    if (successMessage) {
        successMessage.classList.remove('hidden');

        // Hide success message after 5 seconds
        setTimeout(() => {
            successMessage.classList.add('hidden');
        }, 5000);
    }
}

export function handleUrlHash() {
    const hash = window.location.hash;

    if (hash) {
        const targetId = hash.substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
            // If it's a hidden section, show it
            if (targetElement.classList.contains('hidden')) {
                targetElement.classList.remove('hidden');
            }

            // Scroll to the element
            setTimeout(() => {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    }
}