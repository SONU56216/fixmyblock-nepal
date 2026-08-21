// ================================================================
// FIXMYBLOCK NEPAL - COMMUNITY SUPPORT
// ================================================================

import { db, auth } from './firebase-config.js';
import {
    doc,
    updateDoc,
    arrayUnion,
    arrayRemove,
    increment,
    getDoc
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';
import { calculatePriority } from './priority.js';

/**
 * Support an existing report
 * @param {string} reportId - Report ID to support
 * @param {string} userId - User's UID
 * @returns {Promise<object>} Result of support action
 */
export async function supportReport(reportId, userId) {
    try {
        const reportRef = doc(db, 'reports', reportId);
        const reportSnap = await getDoc(reportRef);

        if (!reportSnap.exists()) {
            return { success: false, error: 'Report not found' };
        }

        const report = reportSnap.data();
        const supportedBy = report.supportedBy || [];

        // Check if user already supported
        if (supportedBy.includes(userId)) {
            return { 
                success: false, 
                error: 'You have already supported this report.',
                alreadySupported: true
            };
        }

        // Calculate new affected count
        const newAffectedCount = (report.affectedCount || 0) + 1;
        const newPriority = calculatePriority(newAffectedCount);

        // Update the report
        await updateDoc(reportRef, {
            affectedCount: newAffectedCount,
            supportedBy: arrayUnion(userId),
            priority: newPriority,
            updatedAt: new Date().toISOString()
        });

        return {
            success: true,
            affectedCount: newAffectedCount,
            priority: newPriority,
            message: 'Thank you for supporting this report!'
        };

    } catch (error) {
        console.error('Error supporting report:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Remove support from a report (un-support)
 * @param {string} reportId - Report ID
 * @param {string} userId - User's UID
 * @returns {Promise<object>} Result
 */
export async function unsupportReport(reportId, userId) {
    try {
        const reportRef = doc(db, 'reports', reportId);
        const reportSnap = await getDoc(reportRef);

        if (!reportSnap.exists()) {
            return { success: false, error: 'Report not found' };
        }

        const report = reportSnap.data();
        const supportedBy = report.supportedBy || [];

        if (!supportedBy.includes(userId)) {
            return { 
                success: false, 
                error: 'You have not supported this report.' 
            };
        }

        const newAffectedCount = Math.max(0, (report.affectedCount || 0) - 1);
        const newPriority = calculatePriority(newAffectedCount);

        await updateDoc(reportRef, {
            affectedCount: newAffectedCount,
            supportedBy: arrayRemove(userId),
            priority: newPriority,
            updatedAt: new Date().toISOString()
        });

        return {
            success: true,
            affectedCount: newAffectedCount,
            priority: newPriority
        };

    } catch (error) {
        console.error('Error removing support:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Check if a user has supported a report
 * @param {string} reportId - Report ID
 * @param {string} userId - User's UID
 * @returns {Promise<boolean>} True if supported
 */
export async function hasUserSupported(reportId, userId) {
    try {
        const reportRef = doc(db, 'reports', reportId);
        const reportSnap = await getDoc(reportRef);
        
        if (!reportSnap.exists()) return false;
        
        const report = reportSnap.data();
        return (report.supportedBy || []).includes(userId);
        
    } catch (error) {
        console.error('Error checking support status:', error);
        return false;
    }
}