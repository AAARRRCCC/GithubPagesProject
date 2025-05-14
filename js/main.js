/**
 * CodeClash: Programming Competition Leaderboard
 * Main JavaScript File
 *
 * This file handles initialization and core functionality for the CodeClash website.
 * It coordinates the various components and ensures they work together seamlessly.
 */

// Import modules
import { initializeThreeBackground } from './three-background.js';
import { initializeCountdownTimer } from './timer.js';
import { initializeLeaderboard } from './leaderboard.js';
import { loadCompetitionData, loadTopParticipants } from './data.js';
import {
    setupTheme,
    setupResponsiveNavigation,
    highlightCurrentPageInNav,
    setupScrollEffects,
    setupGitHubSubmissionForm,
    showGitHubSubmissionForm,
    handleUrlHash
} from './ui.js';

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
    initializeThreeBackground();
    registerComponentCallbacks();

    // Initialize other components
    initializeCountdownTimer();
    initializeLeaderboard();

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
 * Load data needed for the current page
 */
function loadPageData() {
    // Determine which page we're on based on URL path or HTML structure
    const path = window.location.pathname;

    // Home page
    if (path.endsWith('index.html') || path.endsWith('/') || document.querySelector('.leaderboard-preview')) {
        // Load next competition info
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
    loadCompetitionData()
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