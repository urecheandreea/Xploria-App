/* Import the functions you need from the SDKs you need */
import { initializeApp } from 'firebase/app';
import { getAuth, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

/* Your web app's Firebase configuration */
const firebaseConfig = {
    apiKey: "AIzaSyAv5vYzA5VEdTJs2YWONDhTrlfiMJEyHhI",
    authDomain: "xploria-c5af3.firebaseapp.com",
    projectId: "xploria-c5af3",
    storageBucket: "xploria-c5af3.firebasestorage.app",
    messagingSenderId: "718153401548",
    appId: "1:718153401548:web:efadc84f08c1c4af58ae69",
    measurementId: "G-63G78QPL18"
  };

/* Initialize Firebase */
export const app = initializeApp(firebaseConfig);

/* Initialize Firebase Authentication and get a reference to the service */
export const auth = getAuth(app);

/* Initialize Firebase Firestore and get a reference to the service */
export const db = getFirestore(app);

export const storage = getStorage(app);

/**
 * This function signs out the user from the application.
 */
export const signOutProcess = () => {
    signOut(auth)
        .then(async () => {
            // Sign-out successful.
            /* reload the page */
            console.log('Sign-out successful.');
        })
        .catch(() => {
            // An error happened.
            console.log('An error happened.');
        });
};
