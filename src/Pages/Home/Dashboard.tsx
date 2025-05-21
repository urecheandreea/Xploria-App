import { useAuthState } from 'react-firebase-hooks/auth';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spinner, Button } from '@material-tailwind/react';
import Swal from 'sweetalert2';
import { collection, orderBy, query, getDocs, where, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../Firebase/firebase';
import Post from '../../components/group/Post';
import CreatePostModal from '../../components/modals/CreatePostModal';  
import NavbarComponent from '../../components/navbar/NavbarComponent';

const Dashboard = () => {
    const [user] = useAuthState(auth);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState<'all' | 'matchmaking'>('all');
    const navigate = useNavigate();
    const groupsRef = collection(db, 'groups');

    if (!user) {
        navigate('/login');
        return null;
    }

    useEffect(() => {
        checkTwoFactorAuth();
    }, [mode]);

    const checkTwoFactorAuth = async () => {
        const documentRefDatabase = doc(db, 'users', user?.uid);
        const documentSnapshot = await getDoc(documentRefDatabase);
        if (documentSnapshot.exists()) {
            const data = documentSnapshot.data();
            if (!data?.twoFactorAuth) {
                Swal.fire({
                    title: 'Atentie',
                    text: 'Trebuie sa treci de verificarea in doi pasi pentru a accesa acest continut',
                    icon: 'warning',
                    iconColor: '#307014',
                    confirmButtonText: 'Ok',
                    confirmButtonColor: '#307014',
                });
                navigate('/verification');
                return;
            }

            const seeAllPosts = data?.seeAllPosts;
            const userHobbies = data?.hobbyTags || [];
            const friendUsernames = data?.friendsList.map((friend) => friend.username);
            const friendIdsQuery = query(collection(db, 'users'), where('username', 'in', friendUsernames));
            const friendIdsQuerySnapshot = await getDocs(friendIdsQuery);
            const friendIdsData = friendIdsQuerySnapshot.docs.map((document) => document.id);

            const friendsData = friendIdsQuerySnapshot.docs.map((document) => ({
                id: document.id,
                username: document.data().username,
                hobbyTags: document.data().hobbyTags || []
            }));

            const fetchQuery = query(groupsRef, orderBy('dateCreated', 'desc'));
            const querySnapshot = await getDocs(fetchQuery);

            let filteredGroups = [];

            if (mode === 'all') {
                if (seeAllPosts) {
                    filteredGroups = querySnapshot.docs.map((document) => ({
                        id: document.id,
                        group: document.data(),
                    }));
                } else {
                    filteredGroups = querySnapshot.docs
                        .filter(
                            (document) => friendIdsData.includes(document.data().creatorId) || document.data().creatorId === user.uid
                        )
                        .map((document) => ({
                            id: document.id,
                            group: document.data(),
                        }));
                }
            } else if (mode === 'matchmaking') {
                filteredGroups = querySnapshot.docs.map((doc) => {
                    const group = doc.data();
                    const eventHobbies = group.hobbyTags || [];
                    const matchingFriends = friendsData.filter(friend =>
                        friend.hobbyTags.some(hobby => eventHobbies.includes(hobby) && userHobbies.includes(hobby))
                    );
                    const commonHobbies = eventHobbies.filter(hobby => userHobbies.includes(hobby));

                    if (matchingFriends.length > 0 && commonHobbies.length > 0) {
                        const friendNames = matchingFriends.map(f => f.username);
                        const message = `Tu și ${friendNames.join(', ')} aveți în comun hobby-ul ${commonHobbies.join(', ')} – vezi acest eveniment!`;
                        return {
                            id: doc.id,
                            group,
                            matchMessage: message
                        };
                    }
                    return null;
                }).filter(Boolean);
            }

            setGroups(filteredGroups);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-turq">
                <div className="grid gap-2">
                    <div className="flex items-center justify-center ">
                        <div className="w-40 h-40 border-t-4 border-b-4 border-white rounded-full animate-spin"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full">
            <NavbarComponent />
            <div className="mx-96 mt-10 h-full">
                <div className="bg-formAuth rounded-lg shadow-lg pb-10">
                    <div className="my-5 mx-5">
                        <CreatePostModal />
                        <div className="flex space-x-4 mt-4">
                            <Button
                                onClick={() => setMode('all')}
                                className={mode === 'all' ? 'bg-green-700 text-white' : 'bg-white text-green-700'}
                            >
                                All Events
                            </Button>
                            <Button
                                onClick={() => setMode('matchmaking')}
                                className={mode === 'matchmaking' ? 'bg-green-700 text-white' : 'bg-white text-green-700'}
                            >
                                Matchmaking Events
                            </Button>
                        </div>
                    </div>
                    {groups.map((groupData) => (
                        <Post key={groupData.id} group={groupData.group} groupId={groupData.id} matchMessage={groupData.matchMessage} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
