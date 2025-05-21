import { useAuthState } from 'react-firebase-hooks/auth';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spinner } from '@material-tailwind/react';
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
    const [mode, setMode] = useState<'all' | 'matchmaking' | 'joined'>('all');
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

            if (mode === 'all') {
                await fetchAllEvents(data);
            } else if (mode === 'matchmaking') {
                await fetchMatchmakingEvents(data);
            } else if (mode === 'joined') {
                await fetchJoinedEvents();
            }
        }
    };

    const fetchAllEvents = async (data) => {
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
                .filter((document) => friendIdsData.includes(document.data().creatorId) || document.data().creatorId === user.uid)
                .map((document) => ({
                    id: document.id,
                    group: document.data(),
                }));
            setGroups(groupsData);
        }
    };

    const fetchMatchmakingEvents = async (data) => {
        const userHobbies = (data?.hobbyTags || data?.hobbyList || []).map(h => h.toLowerCase());
        const friendList = data?.friendsList || [];

        const friendUsernames = friendList.map((friend) => friend.username);
        const friendsQuery = query(collection(db, 'users'), where('username', 'in', friendUsernames));
        const friendsSnapshot = await getDocs(friendsQuery);
        const friendData = friendsSnapshot.docs.map(doc => ({
            id: doc.id,
            username: doc.data().username,
            hobbies: (doc.data().hobbyTags || doc.data().hobbyList || []).map(h => h.toLowerCase()),
        }));

        const groupQuery = query(groupsRef);
        const groupSnapshot = await getDocs(groupQuery);

        const matchingGroups = [];

        groupSnapshot.docs.forEach(doc => {
            const group = doc.data();

            if (group.creatorId === user.uid) return;

            const groupHobbies = (group.hobbyTags || group.hobbyList || []).map(h => h.toLowerCase());
            const matchWithUser = groupHobbies.some(hobby => userHobbies.includes(hobby));
            const matchingFriends = friendData.filter(friend => groupHobbies.some(h => friend.hobbies.includes(h)));

            if (matchWithUser && matchingFriends.length > 0) {
                matchingGroups.push({
                    id: doc.id,
                    group,
                    matchInfo: {
                        commonFriends: matchingFriends.map(f => f.username),
                        sharedHobbies: groupHobbies.filter(h => userHobbies.includes(h)),
                    },
                });
            }
        });

        setGroups(matchingGroups);
    };

    const fetchJoinedEvents = async () => {
        const querySnapshot = await getDocs(groupsRef);
        const joinedGroups = querySnapshot.docs
            .filter(doc => {
                const participants = doc.data().participants || [];
                return participants.some(p => p.id === user.uid);
            })
            .map(doc => ({
                id: doc.id,
                group: doc.data(),
            }));
        setGroups(joinedGroups);
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

                    <div className="flex justify-center gap-4 my-5">
                        <button
                            onClick={() => setMode('all')}
                            className={`px-6 py-2 rounded-lg font-semibold ${mode === 'all' ? 'bg-green-700 text-white' : 'bg-white text-black shadow-md'}`}
                        >
                            All Events
                        </button>
                        <button
                            onClick={() => setMode('matchmaking')}
                            className={`px-6 py-2 rounded-lg font-semibold ${mode === 'matchmaking' ? 'bg-green-700 text-white' : 'bg-white text-black shadow-md'}`}
                        >
                            Matchmaking Events
                        </button>
                        <button
                            onClick={() => setMode('joined')}
                            className={`px-6 py-2 rounded-lg font-semibold ${mode === 'joined' ? 'bg-green-700 text-white' : 'bg-white text-black shadow-md'}`}
                        >
                            Joined Events
                        </button>
                    </div>

                    <div className="my-5 mx-5">
                        <CreatePostModal />
                    </div>

                    {groups.map((groupData) => (
                        <div key={groupData.id}>
                            {mode === 'matchmaking' && groupData.matchInfo && (
                                <div className="italic text-gray-500 text-sm mx-10">
                                    Tu și {groupData.matchInfo.commonFriends.join(', ')} aveți în comun hobby-uri ({groupData.matchInfo.sharedHobbies.join(', ')}) – uite un eveniment pentru voi:
                                </div>
                            )}
                            <Post group={groupData.group} groupId={groupData.id} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
