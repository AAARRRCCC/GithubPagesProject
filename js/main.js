/**
 * CodeClash: Programming Competition Leaderboard
 * Main JavaScript File
 *
 * This file handles initialization and core functionality for the CodeClash website.
 * It coordinates the various components and ensures they work together seamlessly.
 */

// Global state to track initialization status
const appState = {
    componentsLoaded: {
        threeBackground: false,
        timer: false,
        leaderboard: false
    },
    darkMode: localStorage.getItem('darkMode') === 'enabled',
    mobileMenuOpen: false
};

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('CodeClash application initialized');

    // Initialize components in the correct sequence
    initializeApp();
});

/**
 * Initialize the application
 * This function handles the setup of various components and features in the proper sequence
 */
function initializeApp() {
    // First, set up UI components that don't depend on data
    setupTheme();
    setupResponsiveNavigation();
    highlightCurrentPageInNav();
    setupScrollEffects();

    // Next, initialize components that may take time to load
    initializeThreeJsBackground();
    registerComponentCallbacks();

    // Load page-specific data
    loadPageData();

    // Set up interactive elements and forms
    setupEventListeners();
    setupGitHubSubmissionForm();

    // Check for URL hash to handle direct links
    handleUrlHash();
}

/**
 * Register callback functions for component initialization
 * This helps coordinate the loading sequence and interactions between components
 */
function registerComponentCallbacks() {
    // Custom event listeners for component initialization completion
    document.addEventListener('threeBackground:loaded', () => {
        appState.componentsLoaded.threeBackground = true;
        checkAllComponentsLoaded();
    });

    document.addEventListener('timer:loaded', () => {
        appState.componentsLoaded.timer = true;
        checkAllComponentsLoaded();
    });

    document.addEventListener('leaderboard:loaded', () => {
        appState.componentsLoaded.leaderboard = true;
        checkAllComponentsLoaded();
    });

    // Fallback to ensure UI is responsive even if components are slow to load
    setTimeout(() => {
        const loadingIndicators = document.querySelectorAll('.loading-indicator');
        loadingIndicators.forEach(indicator => {
            indicator.classList.add('hidden');
        });
    }, 3000);
}

/**
 * Check if all components are loaded and perform final initialization steps
 */
function checkAllComponentsLoaded() {
    const allLoaded = Object.values(appState.componentsLoaded).every(status => status);

    if (allLoaded) {
        console.log('All components successfully loaded');

        // Hide any loading indicators
        const loadingIndicators = document.querySelectorAll('.loading-indicator');
        loadingIndicators.forEach(indicator => {
            indicator.classList.add('hidden');
        });

        // Trigger any animations or effects that should happen after full load
        document.body.classList.add('fully-loaded');
    }
}

/**
 * Initialize Three.js background with error handling
 */
function initializeThreeJsBackground() {
    try {
        // The three-background.js file initializes itself via DOMContentLoaded
        // Here we just add error handling and cross-component coordination
        console.log('Three.js background initialization requested');

        // Create a timeout to detect if Three.js fails to initialize
        setTimeout(() => {
            const bgCanvasContainer = document.getElementById('bg-canvas-container');
            if (bgCanvasContainer && bgCanvasContainer.children.length === 0) {
                console.warn('Three.js background failed to initialize within timeout period');
                // Dispatch event so other components know Three.js failed
                document.dispatchEvent(new CustomEvent('threeBackground:error'));

                // Fallback to static background
                document.body.classList.add('static-background');
            }
        }, 2000);

    } catch (error) {
        console.error('Error in Three.js background initialization:', error);
        // Fallback to ensure site usability if Three.js fails
        document.body.classList.add('static-background');
    }
}

/**
 * Highlight the current page in the navigation menu
 */
function highlightCurrentPageInNav() {
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

/**
 * Setup responsive navigation menu for mobile devices
 */
function setupResponsiveNavigation() {
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
        if (window.innerWidth > 768 && appState.mobileMenuOpen) {
            document.querySelector('nav').classList.remove('mobile-open');
            appState.mobileMenuOpen = false;
        }
    });
}

/**
 * Toggle mobile navigation menu
 */
function toggleMobileMenu() {
    const nav = document.querySelector('nav');
    const menuToggle = document.querySelector('.mobile-menu-toggle');

    appState.mobileMenuOpen = !appState.mobileMenuOpen;

    if (appState.mobileMenuOpen) {
        nav.classList.add('mobile-open');
        menuToggle.classList.add('active');
        document.body.classList.add('menu-open');
    } else {
        nav.classList.remove('mobile-open');
        menuToggle.classList.remove('active');
        document.body.classList.remove('menu-open');
    }
}

/**
 * Setup dark/light theme toggle and apply saved preference
 */
function setupTheme() {
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
    if (appState.darkMode) {
        document.documentElement.classList.add('dark-theme');
        document.getElementById('theme-toggle')?.classList.add('dark');
    }
}

/**
 * Toggle between dark and light theme
 */
function toggleTheme() {
    appState.darkMode = !appState.darkMode;

    if (appState.darkMode) {
        document.documentElement.classList.add('dark-theme');
        localStorage.setItem('darkMode', 'enabled');
    } else {
        document.documentElement.classList.remove('dark-theme');
        localStorage.setItem('darkMode', 'disabled');
    }

    // Update button state
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.classList.toggle('dark', appState.darkMode);
    }

    // Notify Three.js background to update colors if needed
    document.dispatchEvent(new CustomEvent('theme:changed', {
        detail: { darkMode: appState.darkMode }
    }));
}

/**
 * Setup scroll-based effects and animations
 */
function setupScrollEffects() {
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

/**
 * Load data needed for the current page
 */
function loadPageData() {
    // Determine which page we're on based on URL path or HTML structure
    const path = window.location.pathname;

    // Home page
    if (path.endsWith('index.html') || path.endsWith('/') || document.querySelector('.leaderboard-preview')) {
        // The leaderboard.js and timer.js modules initialize themselves
        // But we can add additional page-specific data loading here
        loadNextCompetitionInfo();
    }
    // Leaderboard page (if separate from homepage)
    else if (path.endsWith('leaderboard.html') || document.getElementById('full-leaderboard-page')) {
        // Any leaderboard page specific loading
        console.log('Loading full leaderboard page data');
    }
    // Competition history page
    else if (path.endsWith('history.html') || document.getElementById('history-page')) {
        // History page specific loading
        console.log('Loading competition history page data');
    }
    // Current competition page
    else if (path.endsWith('current.html') || document.getElementById('current-competition-page')) {
        // Current competition page specific loading
        console.log('Loading current competition page data');
    }
}

/**
 * Load information about the next competition
 */
function loadNextCompetitionInfo() {
    fetch('data/competitions.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load competition data');
            }
            return response.json();
        })
        .then(data => {
            if (data.nextCompetition) {
                displayNextCompetition(data.nextCompetition);
            }
        })
        .catch(error => {
            console.error('Error loading next competition data:', error);

            // Show error message in next competition section if it exists
            const nextCompetitionSection = document.getElementById('next-competition-info');
            if (nextCompetitionSection) {
                nextCompetitionSection.innerHTML = `
                    <div class="error-message">
                        <p>Sorry, we couldn't load information about the next competition.</p>
                        <p>Please try again later.</p>
                    </div>
                `;
            }
        });
}

/**
 * Display information about the next competition
 * @param {Object} competition - The next competition data object
 */
function displayNextCompetition(competition) {
    const nextCompetitionSection = document.getElementById('next-competition-info');

    // Create section if it doesn't exist
    if (!nextCompetitionSection) {
        const main = document.querySelector('main');
        if (!main) return;

        const section = document.createElement('section');
        section.id = 'next-competition-info';
        section.className = 'fade-in';

        // Insert after countdown section
        const countdownSection = document.getElementById('countdown-section');
        if (countdownSection && countdownSection.nextElementSibling) {
            main.insertBefore(section, countdownSection.nextElementSibling);
        } else {
            main.appendChild(section);
        }

        displayNextCompetitionContent(section, competition);
    } else {
        displayNextCompetitionContent(nextCompetitionSection, competition);
    }
}

/**
 * Populate the next competition section with content
 * @param {HTMLElement} container - The container element
 * @param {Object} competition - The competition data
 */
function displayNextCompetitionContent(container, competition) {
    // Format dates
    const startDate = new Date(competition.startDate);
    const endDate = new Date(competition.endDate);

    const formattedStartDate = startDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const formattedEndDate = endDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Create HTML content
    container.innerHTML = `
        <h2>Next Competition: ${competition.title}</h2>
        <div class="competition-details">
            <div class="competition-theme">
                <h3>Theme</h3>
                <p>${competition.theme}</p>
            </div>
            
            <div class="competition-dates">
                <p><strong>Starts:</strong> ${formattedStartDate}</p>
                <p><strong>Ends:</strong> ${formattedEndDate}</p>
            </div>
            
            <div class="competition-resources">
                <h3>Resources</h3>
                <ul class="resources-list">
                    ${competition.resources.map(resource => `
                        <li>
                            <a href="${resource.url}" target="_blank" rel="noopener noreferrer">
                                ${resource.title}
                                <span class="resource-type">(${resource.type})</span>
                            </a>
                        </li>
                    `).join('')}
                </ul>
            </div>
            
            <div class="competition-notes">
                <h3>Notes</h3>
                <p>${competition.notes || 'No additional notes for this competition.'}</p>
            </div>
        </div>
        
        <div class="participation-cta">
            <h3>Ready to Participate?</h3>
            <button id="show-submission-form" class="cta-button">Submit Your Repository</button>
        </div>
    `;

    // Add event listener for submission form
    const showFormButton = container.querySelector('#show-submission-form');
    if (showFormButton) {
        showFormButton.addEventListener('click', () => {
            showGitHubSubmissionForm(competition.id);
        });
    }
}

/**
 * Setup event listeners for interactive elements on the page
 */
function setupEventListeners() {
    // Setup leaderboard and competition history toggle functionality
    setupLeaderboardToggle();

    // Add event delegation for dynamic elements
    document.addEventListener('click', (e) => {
        // Handle resource clicks for analytics
        if (e.target.closest('.resources-list a')) {
            const resourceLink = e.target.closest('.resources-list a');
            const resourceTitle = resourceLink.textContent.trim();

            console.log(`Resource clicked: ${resourceTitle}`);
            // Could add analytics tracking here
        }
    });
}

/**
 * Setup leaderboard and competition history toggle functionality
 */
function setupLeaderboardToggle() {
    // Full leaderboard toggle
    const showFullLeaderboardBtn = document.getElementById('show-full-leaderboard');
    const fullLeaderboardSection = document.getElementById('full-leaderboard');
    const closeBtns = document.querySelectorAll('.close-button');

    // Show full leaderboard when "View Full Leaderboard" is clicked
    if (showFullLeaderboardBtn && fullLeaderboardSection) {
        showFullLeaderboardBtn.addEventListener('click', (e) => {
            e.preventDefault();
            fullLeaderboardSection.classList.remove('hidden');
            document.body.style.overflow = 'hidden'; // Prevent scrolling behind modal
        });
    }

    // Close expanded sections when close button is clicked
    if (closeBtns) {
        closeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const section = btn.closest('.expanded-section');
                if (section) {
                    section.classList.add('hidden');
                    document.body.style.overflow = ''; // Restore scrolling
                }
            });
        });
    }

    // Close expanded sections when clicking outside of them
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('expanded-section')) {
            e.target.classList.add('hidden');
            document.body.style.overflow = ''; // Restore scrolling
        }
    });

    // Escape key to close expanded sections
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const expandedSections = document.querySelectorAll('.expanded-section:not(.hidden)');
            if (expandedSections.length > 0) {
                expandedSections.forEach(section => {
                    section.classList.add('hidden');
                });
                document.body.style.overflow = ''; // Restore scrolling
            }
        }
    });

    // Handle show competition history button
    const showHistoryBtn = document.getElementById('show-competition-history');
    if (showHistoryBtn && fullLeaderboardSection) {
        showHistoryBtn.addEventListener('click', (e) => {
            e.preventDefault();
            fullLeaderboardSection.classList.remove('hidden');

            // Switch to history view if leaderboard is shown with tabs
            const historyViewBtn = document.getElementById('history-view-btn');
            const historyView = document.getElementById('history-view');
            const leaderboardView = document.getElementById('leaderboard-view');
            const leaderboardViewBtn = document.getElementById('leaderboard-view-btn');

            if (historyViewBtn && historyView && leaderboardView && leaderboardViewBtn) {
                historyViewBtn.classList.add('active');
                leaderboardViewBtn.classList.remove('active');
                historyView.classList.remove('hidden-view');
                historyView.classList.add('active-view');
                leaderboardView.classList.remove('active-view');
                leaderboardView.classList.add('hidden-view');
            }

            document.body.style.overflow = 'hidden'; // Prevent scrolling behind modal
        });
    }
}

/**
 * Set up GitHub repository submission form
 */
function setupGitHubSubmissionForm() {
    // Create modal container if it doesn't exist
    if (!document.getElementById('submission-modal')) {
        const modal = document.createElement('div');
        modal.id = 'submission-modal';
        modal.className = 'modal hidden';

        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Submit Your GitHub Repository</h2>
                    <button class="close-modal" aria-label="Close">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="github-submission-form">
                        <div class="form-group">
                            <label for="github-username">GitHub Username:</label>
                            <input type="text" id="github-username" required
                                placeholder="Your GitHub username">
                        </div>
                        <div class="form-group">
                            <label for="repository-url">Repository URL:</label>
                            <input type="url" id="repository-url" required
                                placeholder="https://github.com/username/repository">
                        </div>
                        <div class="form-group">
                            <label for="project-title">Project Title:</label>
                            <input type="text" id="project-title" required
                                placeholder="A descriptive title for your project">
                        </div>
                        <div class="form-group">
                            <label for="project-description">Project Description:</label>
                            <textarea id="project-description" rows="4"
                                placeholder="Brief description of your project and approach"></textarea>
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="submit-btn">Submit Entry</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add event listeners for the modal
        const closeBtn = modal.querySelector('.close-modal');
        closeBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
            document.body.classList.remove('modal-open');
        });

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
                document.body.classList.remove('modal-open');
            }
        });

        // Handle form submission
        const form = document.getElementById('github-submission-form');
        form.addEventListener('submit', handleSubmissionFormSubmit);
    }
}

/**
 * Show the GitHub submission form modal
 * @param {string} competitionId - ID of the competition to submit to
 */
function showGitHubSubmissionForm(competitionId) {
    const modal = document.getElementById('submission-modal');
    if (!modal) return;

    // Add competition ID to form as hidden field if it doesn't exist
    let competitionField = document.getElementById('competition-id');
    if (!competitionField) {
        competitionField = document.createElement('input');
        competitionField.type = 'hidden';
        competitionField.id = 'competition-id';
        document.getElementById('github-submission-form').appendChild(competitionField);
    }

    // Set competition ID
    competitionField.value = competitionId;

    // Show modal
    modal.classList.remove('hidden');
    document.body.classList.add('modal-open');
}

/**
 * Handle GitHub submission form submissions
 * @param {Event} event - The form submission event
 */
function handleSubmissionFormSubmit(event) {
    event.preventDefault();

    // Get form data
    const username = document.getElementById('github-username').value.trim();
    const repositoryUrl = document.getElementById('repository-url').value.trim();
    const projectTitle = document.getElementById('project-title').value.trim();
    const projectDescription = document.getElementById('project-description').value.trim();
    const competitionId = document.getElementById('competition-id').value;

    // Validate GitHub repository URL format
    if (!validateGitHubUrl(repositoryUrl)) {
        showFormError('Please enter a valid GitHub repository URL');
        return;
    }

    // In a real application, this would send data to a server
    // For now, we'll just log it and show a success message
    console.log('Submission received:', {
        username,
        repositoryUrl,
        projectTitle,
        projectDescription,
        competitionId
    });

    // Show success message
    showSubmissionSuccessMessage();
}

/**
 * Validate GitHub repository URL format
 * @param {string} url - URL to validate
 * @return {boolean} Whether the URL is valid
 */
function validateGitHubUrl(url) {
    // Basic validation for GitHub repository URL format
    return /^https:\/\/github\.com\/[\w-]+\/[\w-]+\/?$/.test(url);
}

/**
 * Show error message for the submission form
 * @param {string} message - Error message to display
 */
function showFormError(message) {
    // Look for existing error message
    let errorElement = document.querySelector('.form-error');

    // Create if it doesn't exist
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'form-error';
        const form = document.getElementById('github-submission-form');
        form.insertBefore(errorElement, form.firstChild);
    }

    // Set message and show
    errorElement.textContent = message;
    errorElement.classList.add('visible');

    // Hide after a delay
    setTimeout(() => {
        errorElement.classList.remove('visible');
    }, 5000);
}

/**
 * Show success message after form submission
 */
function showSubmissionSuccessMessage() {
    // Hide modal
    const modal = document.getElementById('submission-modal');
    modal.classList.add('hidden');
    document.body.classList.remove('modal-open');

    // Create success message if it doesn't exist
    let successMessage = document.getElementById('submission-success');
    if (!successMessage) {
        successMessage = document.createElement('div');
        successMessage.id = 'submission-success';
        successMessage.className = 'success-message hidden';

        successMessage.innerHTML = `
            <div class="success-content">
                <h3>Submission Received!</h3>
                <p>Thank you for submitting your project. Your entry has been recorded.</p>
                <button class="close-success">Close</button>
            </div>
        `;

        document.body.appendChild(successMessage);

        // Add close button event listener
        successMessage.querySelector('.close-success').addEventListener('click', () => {
            successMessage.classList.add('hidden');
        });
    }

    // Show success message
    successMessage.classList.remove('hidden');

    // Reset form
    document.getElementById('github-submission-form').reset();

    // Hide message after delay
    setTimeout(() => {
        successMessage.classList.add('hidden');
    }, 5000);
}

/**
 * Handle URL hash for direct linking to sections
 */
function handleUrlHash() {
    const hash = window.location.hash;

    if (hash) {
        // Remove the # character
        const targetId = hash.substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
            // If it's a hidden element that should be shown
            if (targetElement.classList.contains('expanded-section') &&
                targetElement.classList.contains('hidden')) {
                targetElement.classList.remove('hidden');
                document.body.style.overflow = 'hidden'; // Prevent scrolling behind modal
            }

            // Scroll to the element
            setTimeout(() => {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    }
}