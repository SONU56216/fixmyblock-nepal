// ================================================================
// FIXMYBLOCK NEPAL - REPORT FUNCTIONS
// ================================================================

import { db, auth } from './firebase-config.js';
import {
    collection,
    addDoc,
    serverTimestamp,
    doc,
    getDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    getDocs,
    onSnapshot,
    orderBy,
    limit
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';
import { uploadPhoto } from './storage.js';
import { checkForDuplicate, formatDuplicateData } from './duplicate-check.js';
import { calculatePriority } from './priority.js';

// ================================================================
//  SUBMIT REPORT (WITH DUPLICATE CHECK)
// ================================================================

export async function submitReport(data, userId, userDisplayName = '') {
    try {
        // Step 1: Check for duplicates
        const duplicate = await checkForDuplicate(
            data.category,
            data.latitude,
            data.longitude,
            userId
        );

        if (duplicate) {
            // Return duplicate info so UI can show modal
            return {
                success: false,
                duplicate: formatDuplicateData(duplicate, userDisplayName)
            };
        }

        // Step 2: Upload photo if exists
        let photoUrl = '';
        if (data.photoFile) {
            const uploadResult = await uploadPhoto(data.photoFile);
            if (uploadResult.success) {
                photoUrl = uploadResult.url;
            }
        }

        // Step 3: Create new report
        const reportData = {
            category: data.category,
            description: data.description || 'No description provided',
            location: data.location || 'Unknown location',
            latitude: data.latitude || null,
            longitude: data.longitude || null,
            photoUrl: photoUrl || '',
            status: 'submitted',
            submittedBy: data.submittedBy || 'Anonymous',
            reportedBy: userId || null,
            createdAt: serverTimestamp(),
            updatedAt: new Date().toISOString(),
            // New fields for community support
            affectedCount: 0,
            supportedBy: [],
            priority: 'LOW'
        };

        const docRef = await addDoc(collection(db, 'reports'), reportData);

        return {
            success: true,
            id: docRef.id,
            message: 'Report submitted successfully!'
        };

    } catch (error) {
        console.error('Error submitting report:', error);
        return { success: false, error: error.message };
    }
}

// ... (existing functions: fetchReports, listenToReports, updateStatus, deleteReport, etc.)