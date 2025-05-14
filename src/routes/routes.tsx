import Auth from '../Pages/Auth/Auth';
import RegisterPage from '../Pages/Auth/Register';
import ResetPasswordPage from '../Pages/Auth/ResetPassword';
import Verification from '../Pages/Auth/Verification';
import UserProfile from '../Pages/UserProfile/UserProfile';
import OwnProfile from '../Pages/UserProfile/OwnProfile';
import Dashboard from '../Pages/Home/Dashboard';
import AdminPage from '../components/group/AdminPage';
import Group from '../components/group/Group';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../Firebase/firebase';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import NavbarComponent from '../components/navbar/NavbarComponent';

/* get all user id's from firebase and add them to the routes array */
const q = query(collection(db, 'users'));

/* create an array with pair username and id */
const users = [];
const querySnapshot = await getDocs(q);
querySnapshot.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
    users.push({ username: doc.data().username, id: doc.id });
});

const qq = query(collection(db, 'groups'));
const groupsId = [];
const querySnapshotGroups = await getDocs(qq);
querySnapshotGroups.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
    groupsId.push({ id: doc.id });
});

export const routes = [
    {
        path: '/',
        element: <Dashboard />,
    },

    ...users.map((user) => ({
        /* check if the user.id is the same as the logged in user return the own profile page */
        path: `/profile/${user.username}`,
        element: (
            <div>
                <NavbarComponent />
                <UserProfile id={user.id} />
            </div>
        ),
    })),

    ...groupsId.map((group) => ({
        path: `/admin-page/${group.id}`,
        element: (
            <div>
                <NavbarComponent />
                <AdminPage groupId={group.id} />
            </div>
        ),
    })),

    ...groupsId.map((group) => ({
        path: `/group/${group.id}`,
        element: (
            <div>
                <NavbarComponent />
                <Group groupId={group.id} />
            </div>
        ),
    })),

    {
        path: '/login',
        element: <Auth />,
    },
    {
        path: '/register',
        element: <RegisterPage />,
    },
    {
        path: '/reset-password',
        element: <ResetPasswordPage />,
    },
    {
        path: '/verification',
        element: <Verification />,
    },
    {
        path: '/admin-page',
        element: <AdminPage />,
    },
    {
        path: '/group',
        element: <Group />,
    },
    {
        path: '/own-profile',
        element: (
            <div>
                <NavbarComponent />
                <OwnProfile />
            </div>
        ),
    },
];
