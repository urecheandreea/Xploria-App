/* Import the functions you need from the SDKs you need */
import { initializeApp } from 'firebase/app';
import { getAuth, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

/* Your web app's Firebase configuration */
const firebaseConfig = {
    apiKey: 'AIzaSyCQ_Bl4twjuu0g58C3nHzJuEOQBJHc3flg',
    authDomain: 'vreausamergla-921d5.firebaseapp.com',
    projectId: 'vreausamergla-921d5',
    storageBucket: 'vreausamergla-921d5.appspot.com',
    messagingSenderId: '1060999734392',
    appId: '1:1060999734392:web:2dcd4b34f61392e1e2798d',
    measurementId: 'G-J7N9W4G6YY',
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
