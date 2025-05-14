/**
 * CodeClash: Programming Competition Leaderboard
 * Countdown Timer Module
 *
 * This file manages the countdown timer functionality, displaying the time remaining
 * until the next competition deadline (8:30pm on 5/14).
 */

// Export the initialization function to be called from main.js
export function initializeCountdownTimer() {
    // Initialize the countdown timer if it exists on the page
    const countdownElement = document.getElementById('countdown-timer');
    if (countdownElement) {
        initializeCountdown();
        // Dispatch event to notify main.js that the timer is loaded
        document.dispatchEvent(new CustomEvent('timer:loaded'));
    }
}

/**
 * Initialize the countdown timer functionality
 */
// Private function to initialize the countdown
function initializeCountdown() {
    console.log('Countdown timer initialized');

    // Add ARIA labels for accessibility
    const countdownElement = document.getElementById('countdown-timer');
    countdownElement.setAttribute('aria-live', 'polite');
    countdownElement.setAttribute('aria-label', 'Countdown to submission deadline');

    // Update the timer immediately and then use requestAnimationFrame for smoother updates
    updateCountdown();

    // Use requestAnimationFrame for smoother animation and better performance
    let lastTime = 0;
    const frameInterval = 1000; // Update every second

    function animateCountdown(timestamp) {
        if (!lastTime || timestamp - lastTime >= frameInterval) {
            lastTime = timestamp;
            updateCountdown();
        }
        requestAnimationFrame(animateCountdown);
    }

    requestAnimationFrame(animateCountdown);
}

/**
 * Calculate and update the time remaining until the deadline
 */
function updateCountdown() {
    try {
        // Target date: May 14, 2025 at 8:30 PM
        const targetDate = new Date('May 14, 2025 20:30:00').getTime();

        // Current date and time
        const now = new Date().getTime();

        // Calculate the time remaining
        const timeRemaining = targetDate - now;

        const countdownElement = document.getElementById('countdown-timer');

        // If the countdown is over
        if (timeRemaining < 0) {
            countdownElement.innerHTML =
                '<div class="countdown-complete" aria-live="assertive">Submission period closed</div>';
            return;
        }

        // Time calculations for days, hours, minutes and seconds
        const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

        // Create accessible time display
        const timeDisplay = document.createElement('div');
        timeDisplay.className = 'countdown-display';

        // Create spans with proper attributes for each time unit
        const daysSpan = createTimeUnit(days, 'days');
        const hoursSpan = createTimeUnit(hours, 'hours');
        const minutesSpan = createTimeUnit(minutes, 'minutes');
        const secondsSpan = createTimeUnit(seconds, 'seconds');

        // Add all time units to the display
        timeDisplay.appendChild(daysSpan);
        timeDisplay.appendChild(hoursSpan);
        timeDisplay.appendChild(minutesSpan);
        timeDisplay.appendChild(secondsSpan);

        // Update the countdown timer element
        // We're recreating the elements each time rather than updating text content
        // to ensure all accessibility attributes are properly maintained
        countdownElement.innerHTML = '';
        countdownElement.appendChild(timeDisplay);

        // Update the SR-only announcement at appropriate intervals (not every second)
        if (seconds === 0 || timeRemaining <= 60000) { // Update on the minute or if less than a minute left
            updateAriaAnnouncement(days, hours, minutes, seconds);
        }

        // Add visual effects as the deadline approaches
        applyDeadlineEffects(timeRemaining);
    } catch (error) {
        console.error('Error updating countdown:', error);
        document.getElementById('countdown-timer').innerHTML =
            '<div class="countdown-error">Error calculating time remaining</div>';
    }
}

/**
 * Creates a time unit element with proper accessibility attributes
 * @param {number} value - The time value
 * @param {string} unit - The time unit (days, hours, minutes, seconds)
 * @return {HTMLElement} The created time unit element
 */
function createTimeUnit(value, unit) {
    const container = document.createElement('div');
    container.className = 'time-unit';

    const valueSpan = document.createElement('span');
    valueSpan.id = unit;
    valueSpan.textContent = formatTime(value);
    valueSpan.setAttribute('aria-label', `${value} ${unit}`);

    const labelSpan = document.createElement('span');
    labelSpan.className = 'time-label';
    labelSpan.textContent = unit.charAt(0).toUpperCase() + unit.slice(1);

    container.appendChild(valueSpan);
    container.appendChild(labelSpan);

    return container;
}

/**
 * Updates the screen reader announcement for the countdown
 * @param {number} days - Days remaining
 * @param {number} hours - Hours remaining
 * @param {number} minutes - Minutes remaining
 * @param {number} seconds - Seconds remaining
 */
function updateAriaAnnouncement(days, hours, minutes, seconds) {
    const srAnnouncement = document.getElementById('sr-announcement') ||
        createSrAnnouncementElement();

    let announcementText = 'Time remaining until submission deadline: ';

    if (days > 0) {
        announcementText += `${days} days, ${hours} hours, ${minutes} minutes, and ${seconds} seconds.`;
    } else if (hours > 0) {
        announcementText += `${hours} hours, ${minutes} minutes, and ${seconds} seconds.`;
    } else if (minutes > 0) {
        announcementText += `${minutes} minutes and ${seconds} seconds.`;
    } else {
        announcementText += `${seconds} seconds.`;
    }

    srAnnouncement.textContent = announcementText;
}

/**
 * Creates a screen reader announcement element
 * @return {HTMLElement} The created SR announcement element
 */
function createSrAnnouncementElement() {
    const srAnnouncement = document.createElement('div');
    srAnnouncement.id = 'sr-announcement';
    srAnnouncement.className = 'sr-only';
    srAnnouncement.setAttribute('aria-live', 'polite');

    const countdownSection = document.getElementById('countdown-section');
    countdownSection.appendChild(srAnnouncement);

    return srAnnouncement;
}

/**
 * Format time values to always have two digits
 * @param {number} time - The time value to format
 * @return {string} Formatted time with leading zero if needed
 */
function formatTime(time) {
    return time < 10 ? '0' + time : time.toString();
}

/**
 * Apply visual effects as the deadline gets closer
 * @param {number} timeRemaining - Time remaining in milliseconds
 */
function applyDeadlineEffects(timeRemaining) {
    const countdownElement = document.getElementById('countdown-timer');
    const oneDay = 24 * 60 * 60 * 1000;
    const twoHours = 2 * 60 * 60 * 1000;
    const thirtyMinutes = 30 * 60 * 1000;

    // Reset all classes first
    countdownElement.classList.remove('urgent', 'very-urgent', 'final-warning');

    // Apply different classes based on time remaining
    if (timeRemaining < thirtyMinutes) {
        // Less than 30 minutes - final warning with animation
        countdownElement.classList.add('final-warning');
        if (!countdownElement.querySelector('.pulse-animation')) {
            addPulseAnimation(countdownElement);
        }
    } else if (timeRemaining < twoHours) {
        // Less than 2 hours - very urgent
        countdownElement.classList.add('very-urgent');
    } else if (timeRemaining < oneDay) {
        // Less than 24 hours - urgent
        countdownElement.classList.add('urgent');
    }

    // Update the accent color intensity based on time remaining
    // This creates a smooth transition effect as the deadline approaches
    if (timeRemaining < oneDay) {
        const intensity = Math.max(0, Math.min(100, 100 - (timeRemaining / oneDay * 100)));
        document.documentElement.style.setProperty('--timer-urgency', intensity + '%');
    }
}

/**
 * Adds a pulsing animation to the countdown timer when very close to deadline
 * @param {HTMLElement} element - The element to add the animation to
 */
function addPulseAnimation(element) {
    const pulseDiv = document.createElement('div');
    pulseDiv.className = 'pulse-animation';
    element.appendChild(pulseDiv);
}