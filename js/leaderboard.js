/**
 * CodeClash: Programming Competition Leaderboard
 * Leaderboard Module
 *
 * This file handles the leaderboard functionality, displaying competition winners
 * and rankings based on the data stored in the data directory.
 */

// Export the initialization functions to be called from main.js
export function initializeLeaderboard() {
    // Check if we're on a page that has a leaderboard element
    const leaderboardElement = document.querySelector('.leaderboard-preview');
    const fullLeaderboardElement = document.getElementById('full-leaderboard');

    // Initialize appropriate leaderboard display
    if (leaderboardElement) {
        // We're on the home page with a preview
        initializeLeaderboardPreview();
    } else if (fullLeaderboardElement) {
        // We're on the dedicated leaderboard page
        initializeFullLeaderboard();
    }

    // Dispatch event to notify main.js that the leaderboard is loaded
    document.dispatchEvent(new CustomEvent('leaderboard:loaded'));
}

/**
 * Initialize the leaderboard preview on the homepage
 */
// Private function to initialize the leaderboard preview
function initializeLeaderboardPreview() {
    console.log('Leaderboard preview initialized');

    // Load top participants data
    loadTopParticipants()
        .then(participants => {
            displayLeaderboardPreview(participants);
        })
        .catch(error => {
            console.error('Error loading leaderboard data:', error);
            displayLeaderboardError();
        });
}

/**
 * Initialize the full leaderboard on the leaderboard page
 */
// Private function to initialize the full leaderboard
function initializeFullLeaderboard() {
    console.log('Full leaderboard initialized');

    // Load all participants data
    loadAllParticipants()
        .then(participants => {
            displayFullLeaderboard(participants);
        })
        .catch(error => {
            console.error('Error loading full leaderboard data:', error);
            displayLeaderboardError();
        });
}

/**
 * Load top participants data from the data files
 * @param {number} limit - Number of participants to return
 * @return {Promise} Promise resolving to participants data
 */
// Data loading functions
function loadTopParticipants(limit = 3) {
    return fetch('data/participants.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load participants data');
            }
            return response.json();
        })
        .then(data => {
            // Sort participants by number of wins
            const sortedParticipants = [...data.participants].sort((a, b) => {
                return b.wins.length - a.wins.length;
            });

            // Return top N participants
            return sortedParticipants.slice(0, limit);
        });
}

/**
 * Load all participants data from the data files
 * @return {Promise} Promise resolving to all participants data
 */
function loadAllParticipants() {
    return fetch('data/participants.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load participants data');
            }
            return response.json();
        })
        .then(data => {
            // Sort participants by number of wins
            return data.participants.sort((a, b) => {
                return b.wins.length - a.wins.length;
            });
        });
}

/**
 * Load competitions data
 * @param {number} limit - Number of competitions to return (0 for all)
 * @return {Promise} Promise resolving to competitions data
 */
function loadCompetitions(limit = 0) {
    return fetch('data/competitions.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load competitions data');
            }
            return response.json();
        })
        .then(data => {
            // Sort competitions by date (newest first)
            const sortedCompetitions = [...data.competitions].sort((a, b) => {
                return new Date(b.endDate) - new Date(a.endDate);
            });

            // Return all or limited number of competitions
            return limit > 0 ? sortedCompetitions.slice(0, limit) : sortedCompetitions;
        });
}

/**
 * Display the leaderboard preview on the homepage
 * @param {Array} participants - Array of participant data
 */
function displayLeaderboardPreview(participants) {
    const leaderboardPreview = document.querySelector('.leaderboard-preview');

    if (!leaderboardPreview) return;

    let html = `
        <div class="search-filter">
            <input type="text" id="participant-search" placeholder="Search participants..." aria-label="Search participants">
        </div>
        <ul class="top-participants">
    `;

    participants.forEach((participant, index) => {
        // Add medal classes for top 3
        let medalClass = '';
        if (index === 0) medalClass = 'gold-medal';
        else if (index === 1) medalClass = 'silver-medal';
        else if (index === 2) medalClass = 'bronze-medal';

        html += `
            <li class="participant-item ${medalClass}">
                <span class="rank">#${index + 1}</span>
                <span class="name">${participant.displayName}</span>
                <span class="avatar"><img src="${participant.avatar}" alt="${participant.displayName}" loading="lazy"></span>
                <span class="wins">${participant.wins.length} ${participant.wins.length === 1 ? 'win' : 'wins'}</span>
                <span class="participation-rate">Win rate: ${Math.round(participant.stats.winRate * 100)}%</span>
            </li>
        `;
    });

    html += '</ul>';

    // Add a section for recent competitions
    html += `
        <div class="recent-competitions">
            <h3>Recent Competitions</h3>
            <div id="recent-competitions-container">Loading recent competitions...</div>
        </div>
    `;

    leaderboardPreview.innerHTML = html;

    // Load recent competitions for the preview
    loadCompetitions(3)
        .then(competitions => {
            displayRecentCompetitions(competitions, 'recent-competitions-container');
        })
        .catch(error => {
            console.error('Error loading competition data:', error);
            document.getElementById('recent-competitions-container').innerHTML =
                '<p class="error">Failed to load recent competitions.</p>';
        });

    // Add event listener for search
    const searchInput = document.getElementById('participant-search');
    if (searchInput) {
        searchInput.addEventListener('input', (event) => {
            const searchTerm = event.target.value.toLowerCase();
            const participantItems = document.querySelectorAll('.participant-item');

            participantItems.forEach(item => {
                const name = item.querySelector('.name').textContent.toLowerCase();
                if (name.includes(searchTerm)) {
                    item.style.display = '';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }
}

/**
 * Display the full leaderboard on the leaderboard page
 * @param {Array} participants - Array of all participant data
 */
function displayFullLeaderboard(participants) {
    const fullLeaderboardElement = document.getElementById('full-leaderboard');

    if (!fullLeaderboardElement) return;

    let html = `
        <div class="leaderboard-controls">
            <div class="search-filter">
                <input type="text" id="full-participant-search" placeholder="Search participants..." aria-label="Search participants">
            </div>
            <div class="view-toggle">
                <button id="leaderboard-view-btn" class="active" aria-label="Show leaderboard">Leaderboard</button>
                <button id="history-view-btn" aria-label="Show competition history">Competition History</button>
            </div>
            <div class="sort-controls">
                <label for="sort-select">Sort by:</label>
                <select id="sort-select" aria-label="Sort options">
                    <option value="wins">Most Wins</option>
                    <option value="participation">Most Participations</option>
                    <option value="rate">Highest Win Rate</option>
                </select>
            </div>
        </div>

        <div id="leaderboard-view" class="active-view">
            <table class="leaderboard-table">
                <thead>
                    <tr>
                        <th scope="col">Rank</th>
                        <th scope="col">Participant</th>
                        <th scope="col">Wins</th>
                        <th scope="col">Participations</th>
                        <th scope="col">Win Rate</th>
                    </tr>
                </thead>
                <tbody>
    `;

    participants.forEach((participant, index) => {
        // Add medal classes for top 3
        let medalClass = '';
        if (index === 0) medalClass = 'gold-medal';
        else if (index === 1) medalClass = 'silver-medal';
        else if (index === 2) medalClass = 'bronze-medal';

        html += `
            <tr class="participant-row ${medalClass}" data-username="${participant.username}">
                <td class="rank">${index + 1}</td>
                <td class="participant-info">
                    <img src="${participant.avatar}" alt="" class="participant-avatar">
                    <div class="participant-details">
                        <span class="participant-name">${participant.displayName}</span>
                        <span class="participant-username">@${participant.username}</span>
                    </div>
                </td>
                <td class="wins">${participant.wins.length}</td>
                <td class="participations">${participant.stats.totalParticipations}</td>
                <td class="win-rate">${Math.round(participant.stats.winRate * 100)}%</td>
            </tr>
        `;
    });

    html += `
                </tbody>
            </table>
        </div>

        <div id="history-view" class="hidden-view">
            <h2>Competition History</h2>
            <div class="competition-filter">
                <input type="text" id="competition-search" placeholder="Search competitions..." aria-label="Search competitions">
            </div>
            <div id="competitions-container">Loading competition history...</div>
        </div>
    `;

    fullLeaderboardElement.innerHTML = html;

    // Load competitions for history view
    loadCompetitions()
        .then(competitions => {
            if (document.getElementById('competitions-container')) {
                displayCompetitionHistory(competitions, 'competitions-container');
            }
        })
        .catch(error => {
            console.error('Error loading competition history:', error);
            if (document.getElementById('competitions-container')) {
                document.getElementById('competitions-container').innerHTML =
                    '<p class="error">Failed to load competition history.</p>';
            }
        });

    // Add event listeners for view toggle
    const leaderboardViewBtn = document.getElementById('leaderboard-view-btn');
    const historyViewBtn = document.getElementById('history-view-btn');
    const leaderboardView = document.getElementById('leaderboard-view');
    const historyView = document.getElementById('history-view');

    if (leaderboardViewBtn && historyViewBtn) {
        leaderboardViewBtn.addEventListener('click', () => {
            leaderboardViewBtn.classList.add('active');
            historyViewBtn.classList.remove('active');
            leaderboardView.classList.remove('hidden-view');
            leaderboardView.classList.add('active-view');
            historyView.classList.remove('active-view');
            historyView.classList.add('hidden-view');
        });

        historyViewBtn.addEventListener('click', () => {
            historyViewBtn.classList.add('active');
            leaderboardViewBtn.classList.remove('active');
            historyView.classList.remove('hidden-view');
            historyView.classList.add('active-view');
            leaderboardView.classList.remove('active-view');
            leaderboardView.classList.add('hidden-view');
        });
    }

    // Add event listener for search
    const searchInput = document.getElementById('full-participant-search');
    if (searchInput) {
        searchInput.addEventListener('input', (event) => {
            const searchTerm = event.target.value.toLowerCase();
            const participantRows = document.querySelectorAll('.participant-row');

            participantRows.forEach(row => {
                const name = row.querySelector('.participant-name').textContent.toLowerCase();
                const username = row.querySelector('.participant-username').textContent.toLowerCase();

                if (name.includes(searchTerm) || username.includes(searchTerm)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }

    // Add event listener for sorting
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            const sortValue = sortSelect.value;
            const tbody = document.querySelector('.leaderboard-table tbody');
            const rows = Array.from(tbody.querySelectorAll('tr'));

            rows.sort((a, b) => {
                let valA, valB;

                if (sortValue === 'wins') {
                    valA = parseInt(a.querySelector('.wins').textContent);
                    valB = parseInt(b.querySelector('.wins').textContent);
                } else if (sortValue === 'participation') {
                    valA = parseInt(a.querySelector('.participations').textContent);
                    valB = parseInt(b.querySelector('.participations').textContent);
                } else if (sortValue === 'rate') {
                    valA = parseInt(a.querySelector('.win-rate').textContent);
                    valB = parseInt(b.querySelector('.win-rate').textContent);
                }

                return valB - valA; // Descending order
            });

            // Re-add rows in the new order
            rows.forEach(row => tbody.appendChild(row));

            // Update ranks
            Array.from(tbody.querySelectorAll('tr')).forEach((row, index) => {
                row.querySelector('.rank').textContent = index + 1;

                // Update medal classes
                row.classList.remove('gold-medal', 'silver-medal', 'bronze-medal');
                if (index === 0) row.classList.add('gold-medal');
                else if (index === 1) row.classList.add('silver-medal');
                else if (index === 2) row.classList.add('bronze-medal');
            });
        });
    }

    // Add event listener for competition search
    const competitionSearch = document.getElementById('competition-search');
    if (competitionSearch) {
        competitionSearch.addEventListener('input', (event) => {
            const searchTerm = event.target.value.toLowerCase();
            const competitionCards = document.querySelectorAll('.competition-card');

            competitionCards.forEach(card => {
                const title = card.querySelector('.competition-title').textContent.toLowerCase();
                const theme = card.querySelector('.competition-theme').textContent.toLowerCase();

                if (title.includes(searchTerm) || theme.includes(searchTerm)) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }
}

/**
 * Display an error message when leaderboard data can't be loaded
 */
function displayLeaderboardError() {
    const leaderboardElements = document.querySelectorAll('.leaderboard-preview, #full-leaderboard');

    leaderboardElements.forEach(element => {
        if (element) {
            element.innerHTML = `
                <div class="error-message">
                    <p>Sorry, we couldn't load the leaderboard data.</p>
                    <p>Please try again later.</p>
                </div>
            `;
        }
    });
}

/**
 * Display recent competitions in the specified container
 * @param {Array} competitions - Array of competition data
 * @param {string} containerId - ID of the container element
 */
function displayRecentCompetitions(competitions, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (competitions.length === 0) {
        container.innerHTML = '<p>No competitions found.</p>';
        return;
    }

    let html = '<div class="competition-list">';

    competitions.forEach(competition => {
        const date = new Date(competition.endDate);
        const formattedDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        // Find winner details
        let winnerName = 'Unknown';
        let winnerUsername = '';
        if (competition.winner && competition.winner.username) {
            // This is simplistic - in a real app you would likely have this data already joined
            // For now, we'll just display the username
            winnerUsername = competition.winner.username;
            winnerName = competition.winner.username; // This would be replaced with actual name
        }

        html += `
            <div class="competition-card">
                <div class="competition-header">
                    <h4 class="competition-title">${competition.title}</h4>
                    <span class="competition-date">${formattedDate}</span>
                </div>
                <p class="competition-theme">${competition.theme}</p>
                <div class="competition-winner">
                    <span class="winner-label">Winner:</span>
                    <span class="winner-name">${winnerName}</span>
                    ${winnerUsername ? `<a href="https://github.com/${winnerUsername}" target="_blank" rel="noopener" class="github-link">@${winnerUsername}</a>` : ''}
                </div>
                <div class="competition-projects">
                    <span class="projects-count">${competition.participants ? competition.participants.length : 0} Projects</span>
                </div>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
}

/**
 * Display full competition history
 * @param {Array} competitions - Array of competition data
 * @param {string} containerId - ID of the container element
 */
function displayCompetitionHistory(competitions, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (competitions.length === 0) {
        container.innerHTML = '<p>No competitions found.</p>';
        return;
    }

    let html = '<div class="competition-timeline">';

    competitions.forEach((competition, index) => {
        const startDate = new Date(competition.startDate);
        const endDate = new Date(competition.endDate);

        const formattedStartDate = startDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        const formattedEndDate = endDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        // Determine if this competition has a winner
        const hasWinner = competition.winner && competition.winner.username;

        html += `
            <div class="competition-entry ${hasWinner ? 'has-winner' : 'no-winner'}">
                <div class="timeline-marker"></div>
                <div class="competition-card detailed">
                    <div class="competition-header">
                        <h3 class="competition-title">${competition.title}</h3>
                        <span class="competition-date">${formattedStartDate} to ${formattedEndDate}</span>
                    </div>
                    <div class="competition-content">
                        <p class="competition-theme">${competition.theme}</p>
                        
                        <div class="competition-participants">
                            <h4>Participants</h4>
                            <ul class="participant-list">
        `;

        // Add participants
        if (competition.participants && competition.participants.length > 0) {
            competition.participants.forEach(participant => {
                const isWinner = hasWinner && participant.username === competition.winner.username;
                html += `
                    <li class="participant-entry ${isWinner ? 'winner' : ''}">
                        ${isWinner ? '<span class="winner-badge" aria-label="Winner">🏆</span>' : ''}
                        <span class="participant-name">${participant.username}</span>
                        <a href="${participant.repositoryUrl}" target="_blank" rel="noopener" class="project-link">
                            ${participant.projectTitle || 'View Project'}
                        </a>
                    </li>
                `;
            });
        } else {
            html += '<li>No participants recorded.</li>';
        }

        html += `
                            </ul>
                        </div>
                        
                        <div class="competition-resources">
                            <h4>Resources</h4>
                            <ul class="resource-list">
        `;

        // Add resources
        if (competition.resources && competition.resources.length > 0) {
            competition.resources.forEach(resource => {
                html += `
                    <li class="resource-entry">
                        <span class="resource-type">${resource.type}</span>
                        <a href="${resource.url}" target="_blank" rel="noopener">${resource.title}</a>
                    </li>
                `;
            });
        } else {
            html += '<li>No resources available.</li>';
        }

        html += `
                            </ul>
                        </div>
                        
                        ${competition.notes ? `<div class="competition-notes">${competition.notes}</div>` : ''}
                    </div>
                </div>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
}