// ================================================================
// FIXMYBLOCK NEPAL - STORAGE UTILITIES
// ================================================================

import { storage } from './firebase-config.js';
import { ref, uploadBytes, getDownloadURL, deleteObject, listAll } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-storage.js';

// ================================================================
//  UPLOAD PHOTO
// ================================================================

export async function uploadPhoto(file, path = 'photos') {
    try {
        const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const storageRef = ref(storage, `${path}/${fileName}`);
        const snapshot = await uploadBytes(storageRef, file);
        const url = await getDownloadURL(snapshot.ref);
        return { success: true, url, fileName };
    } catch (error) {
        console.error('Error uploading photo:', error);
        return { success: false, error: error.message };
    }
}

// ================================================================
//  DELETE PHOTO
// ================================================================

export async function deletePhoto(url) {
    try {
        const photoRef = ref(storage, url);
        await deleteObject(photoRef);
        return { success: true };
    } catch (error) {
        console.error('Error deleting photo:', error);
        return { success: false, error: error.message };
    }
}

// ================================================================
//  LIST ALL PHOTOS
// ================================================================

export async function listPhotos(path = 'photos') {
    try {
        const folderRef = ref(storage, path);
        const result = await listAll(folderRef);
        const photos = await Promise.all(
            result.items.map(async (item) => {
                const url = await getDownloadURL(item);
                return { name: item.name, url };
            })
        );
        return { success: true, photos };
    } catch (error) {
        console.error('Error listing photos:', error);
        return { success: false, error: error.message };
    }
}

// ================================================================
//  GET PHOTO URL
// ================================================================

export async function getPhotoUrl(path) {
    try {
        const photoRef = ref(storage, path);
        const url = await getDownloadURL(photoRef);
        return { success: true, url };
    } catch (error) {
        console.error('Error getting photo URL:', error);
        return { success: false, error: error.message };
    }
}

// ================================================================
//  UPLOAD MULTIPLE PHOTOS
// ================================================================

export async function uploadMultiplePhotos(files, path = 'photos') {
    const results = [];
    for (const file of files) {
        const result = await uploadPhoto(file, path);
        results.push(result);
    }
    return results;
}