/**
 * CodeClash: Programming Competition Leaderboard
 * Data Module
 * 
 * This file handles data loading and management for the CodeClash application.
 * It provides functions to load competition and participant data from JSON files.
 */

// Export data loading functions
export async function loadCompetitionData(limit = 0) {
    try {
        const response = await fetch('data/competitions.json');
        if (!response.ok) {
            throw new Error('Failed to load competition data');
        }

        const data = await response.json();

        // Sort competitions by date (newest first)
        const sortedCompetitions = [...data.competitions].sort((a, b) => {
            return new Date(b.endDate) - new Date(a.endDate);
        });

        // Return all or limited number of competitions
        return {
            competitions: limit > 0 ? sortedCompetitions.slice(0, limit) : sortedCompetitions,
            nextCompetition: data.nextCompetition
        };
    } catch (error) {
        console.error('Error loading competition data:', error);
        throw error;
    }
}

export async function loadParticipantData() {
    try {
        const response = await fetch('data/participants.json');
        if (!response.ok) {
            throw new Error('Failed to load participant data');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error loading participant data:', error);
        throw error;
    }
}

export async function loadTopParticipants(limit = 3) {
    try {
        const data = await loadParticipantData();

        // Sort participants by number of wins
        const sortedParticipants = [...data.participants].sort((a, b) => {
            return b.wins.length - a.wins.length;
        });

        // Return top N participants
        return sortedParticipants.slice(0, limit);
    } catch (error) {
        console.error('Error loading top participants:', error);
        throw error;
    }
}

export async function loadAllParticipants() {
    try {
        const data = await loadParticipantData();

        // Sort participants by number of wins
        return data.participants.sort((a, b) => {
            return b.wins.length - a.wins.length;
        });
    } catch (error) {
        console.error('Error loading all participants:', error);
        throw error;
    }
}

export function formatDate(dateString, options = {}) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        ...options
    });
}

export function calculateTimeRemaining(targetDateString) {
    const targetDate = new Date(targetDateString).getTime();
    const now = new Date().getTime();
    return targetDate - now;
}