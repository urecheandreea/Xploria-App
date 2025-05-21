import React, { FC, useEffect } from 'react';
import { Avatar, Card } from '@material-tailwind/react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@material-tailwind/react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import Swal from 'sweetalert2';
import { PostProps } from './Post.types';
import { User } from '../../utils/Types';
import { getDocument } from '../../utils/util-functions';
import { auth, db } from '../../Firebase/firebase';

const Post: FC<PostProps> = ({ group, groupId }) => {
    const navigate = useNavigate();
    const [postCreator, setPostCreator] = React.useState<User>();
    /* status button for admin user */
    const [statusAdminButton, setStatusAdminButton] = React.useState<boolean>(false);
    /* status button for participant user */
    const [statusParticipantButton, setStatusParticipantButton] = React.useState<boolean>(false);
    const [avatar, setAvatar] = React.useState<string>('');
    /* check if user is admin */
    const user = useAuthState(auth);
    const [eventDateString, setEventDateString] = React.useState<string>('');

    useEffect(() => {
        if (user) {
            if (user[0].uid === group.creatorId) {
                setStatusAdminButton(true);
                setStatusParticipantButton(true);
            }

            /* check if the pending request is already sent */
            const pendingRequest = group.pendingRequest;

            if (pendingRequest) {
                pendingRequest.forEach((element) => {
                    if (element.id === user[0].uid) {
                        setStatusParticipantButton(true);
                    }
                });
            }

            /* check if the user is already a participant */
            const participants = group.participants;

            if (participants) {
                participants.forEach((element) => {
                    if (element.id === user[0].uid) {
                        setStatusParticipantButton(true);
                    }
                });
            }
        }
    }, []);

    useEffect(() => {
        getDocument<User>('users', group.creatorId).then((user) => setPostCreator(user));
        const documentRefDatabase = doc(db, 'users', group.creatorId);

        getDoc(documentRefDatabase).then((doc) => {
            if (doc.exists()) {
                setAvatar(doc.data().profilePicture);
            }
        });

        setEventDateString(group.eventDate.toDate().toLocaleString().split(',')[0]);
    }, []);

    const sendRequestToParticipate = async () => {
        const documentRefDatabase = doc(db, 'groups', groupId);

        const documentSnapshot = await getDoc(documentRefDatabase);

        const documentRefDatabaseUser = doc(db, 'users', user[0].uid);

        const documentSnapshotUser = await getDoc(documentRefDatabaseUser);

        const usernameLogged = documentSnapshotUser.data()?.username;

        if (documentSnapshot.exists()) {
            const newPendingRequests = [
                ...documentSnapshot.data()?.pendingRequest,
                {
                    id: user[0].uid,
                    username: usernameLogged,
                },
            ];

            await setDoc(documentRefDatabase, { pendingRequest: newPendingRequests }, { merge: true });
        }

        Swal.fire({
            icon: 'success',
            title: 'Cererea a fost trimisa cu succes!',
            showConfirmButton: false,
            timer: 1500,
        });

        setStatusParticipantButton(true);
    };

    const tryOneEvent = () => {
        /* check if the user is already a participant */
        const participants = group.participants;
        let findParticipant = false;

        if (participants) {
            participants.forEach((element) => {
                if (element.id === user[0].uid) {
                    navigate('/group/' + groupId);
                    findParticipant = true;
                }
            });
        }

        if (findParticipant === false) {
            Swal.fire({
                icon: 'error',
                title: 'Atentie...',
                text: 'Trebuie sa fii participant pentru a vedea grupul!',
                confirmButtonColor: '#307014',
            });
        }
    };
    return (
        <Card className="mb-10 bg-cardColor mx-10 h-full py-2">
            <div className="flex items-center w-full">
                <div className="w-1/2 ml-10">
                    <Avatar src={avatar} variant="circular" size="md" className="rounded-full" />
                    <div
                        className="text-md cursor-default cursor-pointer hover:text-green-700"
                        onClick={() => navigate('/profile/' + postCreator?.username)}
                    >
                        @{postCreator?.username}
                    </div>
                    <div
                        className="pr-4 text-white text-4xl font-bold dark hover:text-green-700 cursor-pointer"
                        onClick={tryOneEvent}
                    >
                        {`${group.title}`}
                    </div>
                    {group.hobbyTags?.length > 0 && (
                        <div className="text-sm italic text-gray-400 mt-1">
                            Hobby-uri: {group.hobbyTags.join(', ')}
                        </div>
                    )}
                    <div className="text-white mt-1">{eventDateString}</div>
                    <div className="text-green-700 mt-1">{`${group.noParticipants} participanti`}</div>
                    <div className="text-white mt-1">{group.description}</div>

                    <div className="flex gap-3">
                        <Button
                            hidden={statusParticipantButton}
                            onClick={sendRequestToParticipate}
                            className="bg-green-700 hover:bg-white hover:text-green-700 mt-4"
                        >
                            Participa
                        </Button>
                        <Button
                            className="bg-green-700 hover:bg-white hover:text-green-700 mt-4"
                            hidden={!statusAdminButton}
                            /* navigate to admin page adn send group id */
                            onClick={() => navigate('/admin-page' + '/' + groupId)}
                        >
                            Administreaza
                        </Button>
                    </div>
                </div>
                <div className="w-1/2 my-10">
                    <img className="w-96 h-72 object-cover rounded-lg" src={group.image} alt="group image" />
                </div>
            </div>
        </Card>
    );
};

export default Post;
