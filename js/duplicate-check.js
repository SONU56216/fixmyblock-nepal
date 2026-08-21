// ================================================================
// FIXMYBLOCK NEPAL - SMART DUPLICATE DETECTION (IMPROVED)
// ================================================================

import { db } from './firebase-config.js';
import {
    collection,
    query,
    where,
    getDocs,
    limit
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';
import { calculateDistance, formatDistance } from './haversine.js';
import { getPriorityDetails } from './priority.js';

const DUPLICATE_RADIUS = 50; // meters
const STATUS_IGNORED = ['resolved', 'closed', 'rejected'];

/**
 * Check for duplicate reports near a location
 * @param {string} category - Report category
 * @param {number} lat - User's latitude
 * @param {number} lng - User's longitude
 * @param {string} currentUserId - Current user's UID (optional - used only to highlight)
 * @returns {Promise<object|null>} Duplicate report or null
 */
export async function checkForDuplicate(category, lat, lng, currentUserId = null) {
    try {
        // Query reports with same category and non-resolved status
        const reportsRef = collection(db, 'reports');
        let q = query(
            reportsRef,
            where('category', '==', category),
            where('status', 'not-in', STATUS_IGNORED),
            limit(50) // Prevent excessive reads
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return null;
        }

        // Check each report for proximity
        for (const doc of snapshot.docs) {
            const report = { id: doc.id, ...doc.data() };
            
            // Skip if no location data
            if (!report.latitude || !report.longitude) continue;
            
            // ⚠️ REMOVED the "skip if already supported" check
            // Users should still see the duplicate modal even if they supported it

            // Calculate distance
            const distance = calculateDistance(
                lat, lng,
                report.latitude, report.longitude
            );

            if (distance <= DUPLICATE_RADIUS) {
                // Found a duplicate
                return {
                    ...report,
                    distance: distance,
                    distanceDisplay: formatDistance(distance)
                };
            }
        }

        return null;

    } catch (error) {
        console.error('Error checking for duplicates:', error);
        return null; // On error, allow report creation (fail open)
    }
}

/**
 * Get duplicate report modal data
 * @param {object} duplicate - Duplicate report object
 * @param {string} userDisplayName - User's display name (optional)
 * @returns {object} Formatted data for modal
 */
export function formatDuplicateData(duplicate, userDisplayName = '') {
    const priorityDetails = getPriorityDetails(duplicate.priority || 'LOW');
    
    return {
        id: duplicate.id,
        category: duplicate.category,
        description: duplicate.description || 'No description provided',
        photoUrl: duplicate.photoUrl || '',
        location: duplicate.location || 'Unknown location',
        createdAt: duplicate.createdAt,
        status: duplicate.status || 'submitted',
        affectedCount: duplicate.affectedCount || 0,
        supportedBy: duplicate.supportedBy || [],
        distance: duplicate.distanceDisplay || 'Nearby',
        priority: duplicate.priority || 'LOW',
        priorityColor: priorityDetails.color,
        priorityLabel: priorityDetails.label,
        reporter: duplicate.submittedBy || 'Anonymous',
        userDisplayName: userDisplayName
    };
}