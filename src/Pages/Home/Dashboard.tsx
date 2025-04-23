import { useAuthState } from 'react-firebase-hooks/auth';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spinner } from '@material-tailwind/react';
import Swal from 'sweetalert2';
import { collection, orderBy, query, getDocs, where, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../Firebase/firebase';
import Post from '../../components/group/Post';
import CreatePostModal from '../../components/modals/CreatePostModal';  
import useDasboard from './useDasboard';
import NavbarComponent from '../../components/navbar/NavbarComponent';

const Dashboard = () => {
    const [user] = useAuthState(auth);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const groupsRef = collection(db, 'groups');

    if (!user) {
        navigate('/login');
        return null;
    }

    useEffect(() => {
        checkTwoFactorAuth();
    });

    console.log(groups)

    const checkTwoFactorAuth = async () => {
        const documentRefDatabase = doc(db, 'users', user?.uid);
        const documentSnapshot = await getDoc(documentRefDatabase);
        if (documentSnapshot.exists()) {
            const data = documentSnapshot.data();
            // Check two-factor authentication value here
            if (!data?.twoFactorAuth) {
                Swal.fire({
                    title: 'Atentie',
                    text: 'Trebuie sa treci de verificarea in doi pasi pentru a accesa acest continut',
                    icon: 'warning',
                    iconColor: '#11AABE',
                    confirmButtonText: 'Ok',
                    confirmButtonColor: '#11AABE',
                });
                navigate('/verification');
                return;
            }

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
                        (document) => friendIdsData.includes(document.data().creatorId) || document.data().creatorId === user.uid
                    )
                    .map((document) => ({
                        id: document.id,
                        group: document.data(),
                    }));
                setGroups(groupsData);
            }
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
        
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
