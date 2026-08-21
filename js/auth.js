// ================================================================
// FIXMYBLOCK NEPAL - AUTHENTICATION
// ================================================================

import { auth } from './firebase-config.js';
import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js';
import { db } from './firebase-config.js';
import { doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';

// ================================================================
//  ADMIN LOGIN
// ================================================================

export async function adminLogin(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Check if user is an admin
        const adminDoc = await getDoc(doc(db, 'admins', user.uid));
        if (!adminDoc.exists() || adminDoc.data().role !== 'admin') {
            await signOut(auth);
            throw new Error('You are not authorized as an admin.');
        }

        return { success: true, user };
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: error.message };
    }
}

// ================================================================
//  CHECK ADMIN STATUS
// ================================================================

export async function isAdmin(user) {
    if (!user) return false;
    try {
        const adminDoc = await getDoc(doc(db, 'admins', user.uid));
        return adminDoc.exists() && adminDoc.data().role === 'admin';
    } catch (error) {
        console.error('Error checking admin:', error);
        return false;
    }
}

// ================================================================
//  LOGOUT
// ================================================================

export async function adminLogout() {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error) {
        console.error('Logout error:', error);
        return { success: false, error: error.message };
    }
}

// ================================================================
//  AUTH STATE LISTENER (for admin guard)
// ================================================================

export function onAuthChange(callback) {
    return onAuthStateChanged(auth, callback);
}

// ================================================================
//  CREATE ADMIN (Run once to set up first admin)
// ================================================================

export async function createAdmin(email, password) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, 'admins', user.uid), {
            email: email,
            role: 'admin',
            createdAt: new Date().toISOString()
        });

        return { success: true, user };
    } catch (error) {
        console.error('Create admin error:', error);
        return { success: false, error: error.message };
    }
}

// ================================================================
//  PASSWORD RESET
// ================================================================

export async function resetPassword(email) {
    try {
        await sendPasswordResetEmail(auth, email);
        return { success: true };
    } catch (error) {
        console.error('Password reset error:', error);
        return { success: false, error: error.message };
    }
}