/* Import the functions you need from the SDKs you need */
import { initializeApp } from 'firebase/app';
import { getAuth, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

/* Your web app's Firebase configuration */
const firebaseConfig = {
apiKey: "AIzaSyAWydz9yIagGNRUrvYop7EXwgKXuUW5-YA",
  authDomain: "xploria-fe167.firebaseapp.com",
  projectId: "xploria-fe167",
  storageBucket: "xploria-fe167.firebasestorage.app",
  messagingSenderId: "362031361011",
  appId: "1:362031361011:web:755e219c143dee2c678086",
  measurementId: "G-RF7K077744"
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
