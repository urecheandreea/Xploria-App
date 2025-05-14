import { Button, DialogBody, DialogFooter, DialogHeader, Dialog, Input, Typography } from '@material-tailwind/react';
import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Group } from '../../utils/Types';
import { auth } from '../../Firebase/firebase';
import { createDocument, updateDocument } from '../../utils/util-functions';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../Firebase/firebase';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const AdminPage = ({ groupId }) => {
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [category, setCategory] = useState('');
    const [eventDate, setEventDate] = useState<Date>(new Date());
    const [pendingRequest, setPendingRequest] = useState([]);
    const [participants, setParticipants] = useState([]);
    const [creatorId, setCreatorId] = useState('');
    let currentDate = new Date();

    const [user] = useAuthState(auth);
    if (!user) {
        return null;
    }
    const getUserData = async () => {
        const documentRefDatabase = doc(db, 'groups', groupId);
        const documentSnapshot = await getDoc(documentRefDatabase);

        if (documentSnapshot.exists()) {
            const data = documentSnapshot.data();
            setTitle(data?.title);
            setDescription(data?.description);
            setLocation(data?.location);
            setCategory(data?.category);
            setEventDate(data?.eventDate);
            setPendingRequest(data?.pendingRequest);
            setParticipants(data?.participants);
            setCreatorId(data?.creatorId);
            currentDate = data?.eventDate;
            console.log(data?.creatorId);
            if (data?.creatorId !== user.uid) {
                Swal.fire({
                    title: 'Atentie',
                    text: 'Nu esti administratorul acestui grup',
                    icon: 'warning',
                    iconColor: '#307014',
                    confirmButtonText: 'Ok',
                    confirmButtonColor: '#307014',
                });
                navigate('/');
                return;
            }
        }
    };

    const updateDataGroup = async () => {
        console.log(eventDate);
        const newDate = eventDate !== null ? eventDate : currentDate.toISOString();
        console.log(eventDate);
        await updateDocument('groups', groupId, {
            title: title,
            description: description,
            location: location,
            category: category,
            eventDate: newDate,
        });

        Swal.fire({
            icon: 'success',
            title: 'Succes',
            text: 'Evenimentul a fost modificat cu succes!',
            iconColor: '#307014',
            confirmButtonColor: '#307014',
        });
    };

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
                    iconColor: '#307014',
                    confirmButtonText: 'Ok',
                    confirmButtonColor: '#307014',
                });
                navigate('/verification');
            }
        }
    };

    useEffect(() => {
        checkTwoFactorAuth();
        getUserData();
    }, []);

    const acceptRequest = async (request) => {
        const documentRefDatabase = doc(db, 'groups', groupId);

        const documentSnapshot = await getDoc(documentRefDatabase);

        if (documentSnapshot.exists()) {
            /* add a new member to the group */
            const newParticipants = [
                ...participants,
                {
                    username: request.username,
                    id: request.id,
                },
            ];

            // add member to group using setDoc and merge: true
            await setDoc(documentRefDatabase, { participants: newParticipants }, { merge: true });

            /* remove the request from the pending requests */
            const newPendingRequests = pendingRequest.filter((pendingRequest) => pendingRequest.id !== request.id);

            const newNoParticipants = documentSnapshot.data()?.noParticipants + 1;

            // remove request from group using setDoc and merge: true
            await setDoc(
                documentRefDatabase,
                { pendingRequest: newPendingRequests, noParticipants: newNoParticipants },
                { merge: true },
            );

            Swal.fire({
                icon: 'success',
                title: 'Succes',
                text: 'Cererea a fost acceptata cu succes!',
                iconColor: '#307014',
                confirmButtonColor: '#307014',
            });
            setPendingRequest(newPendingRequests);
        }
    };

    const rejectRequest = async (request) => {
        const documentRefDatabase = doc(db, 'groups', groupId);

        const documentSnapshot = await getDoc(documentRefDatabase);

        if (documentSnapshot.exists()) {
            /* remove the request from the pending requests */
            const newPendingRequests = pendingRequest.filter((pendingRequest) => pendingRequest.id !== request.id);

            // remove request from group using setDoc and merge: true

            await setDoc(documentRefDatabase, { pendingRequest: newPendingRequests }, { merge: true });

            Swal.fire({
                icon: 'success',
                title: 'Succes',
                text: 'Cererea a fost respinsa cu succes!',
                iconColor: '#307014',
                confirmButtonColor: '#307014',
            });
            setPendingRequest(newPendingRequests);
        }
    };

    return (
        <div className="flex flex-col mx-96">
            <DialogHeader>Modifica evenimentul</DialogHeader>
            <DialogBody>
                <div className="mb-5">
                    <Typography variant="h6">Denumirea evenimentului</Typography>
                    <Input
                        className="bg-gray-200"
                        value={title}
                        onChange={(e) => {
                            setTitle(e.target.value);
                        }}
                    />
                </div>
                <div className="mb-5">
                    <Typography variant="h6">Descrierea evenimentului</Typography>
                    <Input
                        className="bg-gray-200"
                        value={description}
                        onChange={(e) => {
                            setDescription(e.target.value);
                        }}
                    />
                </div>
                <div className="mb-5">
                    <Typography variant="h6">Locatia evenimentului</Typography>
                    <Input
                        className="bg-gray-200"
                        value={location}
                        onChange={(e) => {
                            setLocation(e.target.value);
                        }}
                    />
                </div>
                <div className="mb-5">
                    <Typography variant="h6">Categoria evenimentului</Typography>
                    <Input
                        className="bg-gray-200"
                        value={category}
                        onChange={(e) => {
                            setCategory(e.target.value);
                        }}
                    />
                </div>
                <div className="mb-5">
                    <Typography variant="h6">Data evenimentului</Typography>
                    <input
                        type="date"
                        className="bg-gray-200"
                        onChange={(e) => {
                            setEventDate(new Date(e.target.value));
                        }}
                    />
                </div>
                <div>
                    <h1 className="font-bold dark text-2xl"> Cereri de participare </h1>
                    {pendingRequest.map((request) => (
                        <div>
                            <h1
                                className="text-xl cursor-pointer hover:text-green-700 mt-4"
                                onClick={() => {
                                    navigate(`/profile/${request.username}`);
                                }}
                            >
                                @{request.username}
                            </h1>
                            <Button
                                className="bg-green-700 mr-2 my-2"
                                onClick={() => {
                                    acceptRequest(request);
                                }}
                            >
                                <span>Accepta</span>
                            </Button>
                            <Button
                                className="bg-red-500 mx-2 my-2"
                                onClick={() => {
                                    rejectRequest(request);
                                }}
                            >
                                <span>Respinge</span>
                            </Button>
                        </div>
                    ))}
                </div>
            </DialogBody>
            <DialogFooter>
                <Button variant="text" color="red" className="mr-1" onClick={() => navigate('/')}>
                    <span>Anulare</span>
                </Button>
                <Button className="bg-green-700" onClick={updateDataGroup}>
                    <span>Modifica</span>
                </Button>
            </DialogFooter>
        </div>
    );
};

export default AdminPage;
