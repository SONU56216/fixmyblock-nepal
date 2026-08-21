const functions = require('firebase-functions');
const admin = require('firebase-admin');
const sgMail = require('@sendgrid/mail');

admin.initializeApp();

// Get configuration values set via Firebase CLI
const SENDGRID_API_KEY = functions.config().sendgrid.key;
const ADMIN_EMAIL = functions.config().admin.email;

sgMail.setApiKey(SENDGRID_API_KEY);

/**
 * Cloud Function to send an email alert when an admin logs in.
 * Called from the admin dashboard.
 */
exports.sendLoginAlert = functions.https.onCall(async (data, context) => {
    // Ensure the user is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'You must be logged in to send this alert.');
    }

    // Verify the user is an admin (check Firestore)
    const uid = context.auth.uid;
    const adminDoc = await admin.firestore().doc(`admins/${uid}`).get();
    if (!adminDoc.exists || adminDoc.data().role !== 'admin') {
        throw new functions.https.HttpsError('permission-denied', 'You are not authorized.');
    }

    // Extract data sent from client
    const { email, displayName, timestamp, ip, userAgent } = data;

    // Prepare email
    const msg = {
        to: ADMIN_EMAIL,
        from: 'noreply@fixmyblock.gov.np', // Must be a verified sender in SendGrid
        subject: '🔐 Admin Login Alert - FixMyBlock Nepal',
        html: `
            <h2>Admin Login Detected</h2>
            <p><strong>Admin Email:</strong> ${email}</p>
            <p><strong>Name:</strong> ${displayName || 'N/A'}</p>
            <p><strong>Time:</strong> ${new Date(timestamp).toLocaleString()}</p>
            <p><strong>IP Address:</strong> ${ip || 'Unknown'}</p>
            <p><strong>Device/Browser:</strong> ${userAgent || 'Unknown'}</p>
            <hr>
            <p>If you did not initiate this login, please secure your account immediately.</p>
            <p>If this was you, you can ignore this email.</p>
        `
    };

    try {
        await sgMail.send(msg);
        return { success: true, message: 'Alert email sent.' };
    } catch (error) {
        console.error('Error sending email:', error);
        throw new functions.https.HttpsError('internal', 'Failed to send email alert.');
    }
});