import { Button, DialogBody, DialogFooter, DialogHeader, Dialog, Input, Typography } from '@material-tailwind/react';
import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Group } from '../../utils/Types';
import { auth } from '../../Firebase/firebase';
import { createDocument, updateDocument } from '../../utils/util-functions';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../Firebase/firebase';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';


const predefinedHobbies = [
  "fotbal",
  "baschet",
  "citit",
  "muzică",
  "programare",
  "cooking",
  "călătorii",
  "board games",
  "dans",
  "fotografie",
  "teatru si film"
];

const AdminPage = ({ groupId }) => {
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [eventDate, setEventDate] = useState<Date>(new Date());
    const [pendingRequest, setPendingRequest] = useState([]);
    const [participants, setParticipants] = useState([]);
    const [creatorId, setCreatorId] = useState('');
    const [selectedHobbies, setSelectedHobbies] = useState<string[]>([]);

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
            setEventDate(data?.eventDate);
            setPendingRequest(data?.pendingRequest);
            setParticipants(data?.participants);
            setCreatorId(data?.creatorId);
            setSelectedHobbies(data?.hobbyTags || []);
            currentDate = data?.eventDate;
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

    // const updateDataGroup = async () => {
    //     const newDate = eventDate !== null ? eventDate : currentDate.toISOString();
    //     await updateDocument('groups', groupId, {
    //         title: title,
    //         description: description,
    //         location: location,
    //         eventDate: newDate,
    //         hobbyTags: selectedHobbies,
    //     });

    //     Swal.fire({
    //         icon: 'success',
    //         title: 'Succes',
    //         text: 'Evenimentul a fost modificat cu succes!',
    //         iconColor: '#307014',
    //         confirmButtonColor: '#307014',
    //     });
    // };
    const updateDataGroup = async () => {
    const newDate = eventDate !== null ? eventDate : currentDate.toISOString();
    await updateDocument('groups', groupId, {
        title: title,
        description: description,
        location: location,
        eventDate: newDate,
        hobbyTags: selectedHobbies,
    });

    Swal.fire({
        icon: 'success',
        title: 'Succes',
        text: 'Evenimentul a fost modificat cu succes!',
        iconColor: '#307014',
        confirmButtonColor: '#307014',
    }).then(() => {
        navigate(-1); // ⬅️ Revine la pagina anterioară
    });
};
    const deleteGroup = async () => {
    const confirm = await Swal.fire({
        title: 'Esti sigur?',
        text: 'Evenimentul va fi sters definitiv!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Da, sterge-l',
        cancelButtonText: 'Anuleaza',
    });

    if (confirm.isConfirmed) {
        await deleteDoc(doc(db, 'groups', groupId));
        Swal.fire({
            icon: 'success',
            title: 'Sters!',
            text: 'Evenimentul a fost sters cu succes.',
            iconColor: '#307014',
            confirmButtonColor: '#307014',
        }).then(() => {
            navigate('/'); // Du-l pe user înapoi acasă sau oriunde vrei tu
        });
    }
};



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
            const newParticipants = [
                ...participants,
                {
                    username: request.username,
                    id: request.id,
                },
            ];

            await setDoc(documentRefDatabase, { participants: newParticipants }, { merge: true });

            const newPendingRequests = pendingRequest.filter((pendingRequest) => pendingRequest.id !== request.id);
            const newNoParticipants = documentSnapshot.data()?.noParticipants + 1;

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
            const newPendingRequests = pendingRequest.filter((pendingRequest) => pendingRequest.id !== request.id);

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
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>
                <div className="mb-5">
                    <Typography variant="h6">Descrierea evenimentului</Typography>
                    <Input
                        className="bg-gray-200"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
                <div className="mb-5">
                    <Typography variant="h6">Locatia evenimentului</Typography>
                    <Input
                        className="bg-gray-200"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                    />
                </div>
                <div className="mb-5">
                    <Typography variant="h6">Data evenimentului</Typography>
                    <input
                        type="date"
                        className="bg-gray-200"
                        onChange={(e) => setEventDate(new Date(e.target.value))}
                    />
                </div>
                <div className="mb-5">
                    <Typography variant="h6">Hobby-uri ale evenimentului</Typography>
                    <div className="grid grid-cols-2 gap-2">
                        {predefinedHobbies.map((hobby) => (
                            <label key={hobby} className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    value={hobby}
                                    checked={selectedHobbies.includes(hobby)}
                                    onChange={(e) => {
                                        const isChecked = e.target.checked;
                                        setSelectedHobbies((prev) =>
                                            isChecked
                                                ? [...prev, hobby]
                                                : prev.filter((item) => item !== hobby)
                                        );
                                    }}
                                />
                                <span>{hobby}</span>
                            </label>
                        ))}
                    </div>
                </div>
                <div>
                    <h1 className="font-bold dark text-2xl"> Cereri de participare </h1>
                    {pendingRequest.map((request) => (
                        <div key={request.id}>
                            <h1
                                className="text-xl cursor-pointer hover:text-green-700 mt-4"
                                onClick={() => navigate(`/profile/${request.username}`)}
                            >
                                @{request.username}
                            </h1>
                            <Button className="bg-green-700 mr-2 my-2" onClick={() => acceptRequest(request)}>
                                <span>Accepta</span>
                            </Button>
                            <Button className="bg-red-500 mx-2 my-2" onClick={() => rejectRequest(request)}>
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
                <Button className="bg-red-700" onClick={deleteGroup}>
                <span>Sterge</span>
                </Button>
            </DialogFooter>
        </div>
    );
};

export default AdminPage;
