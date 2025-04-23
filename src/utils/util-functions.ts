import { addDoc, collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { db } from '../Firebase/firebase';

export const getDocument = async <T>(collectionName: string, id: string): Promise<T> => {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    return docSnap.data() as T;
};

export const getCollection = async <T>(collectionName: string): Promise<T[] | null> => {
    const groupsCollectionRef = collection(db, collectionName);
    try {
        const data = await getDocs(groupsCollectionRef);
        const groupsData: T[] = data.docs.map((document) => ({ ...(document.data() as T), id: document.id }));
        return groupsData;
    } catch (e) {
        console.error(e);
        return null;
    }
};

// change the function below to return the id of the created document
export const createDocument = async <T>(collectionName: string, data: T): Promise<string | null> => {
    const docRef = await addDoc(collection(db, collectionName), data);
    return docRef.id;
};

export const updateDocument = async <T>(collectionName: string, id: string, newData: Partial<T>): Promise<boolean> => {
    const docRef = doc(db, collectionName, id);
    try {
        await setDoc(docRef, newData, { merge: true });
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
};
