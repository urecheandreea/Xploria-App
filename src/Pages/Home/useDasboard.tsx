import { useCollectionData } from 'react-firebase-hooks/firestore';
import { collection, orderBy, query, getDocs, where, doc, getDoc } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../../Firebase/firebase';
import { Group } from '../../utils/Types';

const useDasboard = () => {
    const [groups, setGroups] = useState<Group[]>([]);
    const [user] = useAuthState(auth);
    const groupsRef = collection(db, 'groups');

    useEffect(() => {
        const getUsersFriendsFromDatabase = async () => {
            const documentRefDatabase = doc(db, 'users', user.uid);
            const documentSnapshot = await getDoc(documentRefDatabase);
            if (documentSnapshot.exists()) {
                const data = documentSnapshot.data();
                const seeAllPosts = data?.seeAllPosts;
                const friendUsernames = data?.friendsList.map((friend) => friend.username);
                const friendIdsQuery = query(collection(db, 'users'), where('username', 'in', friendUsernames));
                const friendIdsQuerySnapshot = await getDocs(friendIdsQuery);
                const friendIdsData = friendIdsQuerySnapshot.docs.map((document) => document.id);
                const fetchQuery = query(groupsRef, orderBy('dateCreated', 'desc'));
                const querySnapshot = await getDocs(fetchQuery);
                if (seeAllPosts) {
                    const groupsData = querySnapshot.docs.map((document) => ({
                        id: document.id,
                        group: document.data(),
                    }));
                    setGroups(groupsData);
                } else {
                    const groupsData = querySnapshot.docs
                        .filter(
                            (document) => (friendIdsData.includes(document.data().creatorId) || document.data().creatorId === user.uid)).map((document) => ({
                            id: document.id,
                            group: document.data(),
                        }));
                    setGroups(groupsData);
                }
                setLoading(false);
            }
        };
        getUsersFriendsFromDatabase();
    }, []);

    return { groups };
};

export default useDasboard;
