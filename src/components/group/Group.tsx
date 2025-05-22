import React, { useState, useEffect } from 'react';
import { db, storage } from '../../Firebase/firebase';
import { User } from '../../utils/Types';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { onSnapshot } from 'firebase/firestore';
import Swal from 'sweetalert2';
import { Button } from '@material-tailwind/react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../Firebase/firebase';
import { getDownloadURL, ref } from 'firebase/storage';
import { Card, CardBody } from '@material-tailwind/react';
import { useNavigate } from 'react-router-dom';


const Group = ({ groupId }) => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [participants, setParticipants] = useState<User[]>([]);
    const [comments, setComments] = useState([]);
    const [location, setLocation] = useState('');
    const [eventDate, setEventDate] = useState<Date>(new Date());
    const [image, setImage] = useState<string>('');
    const [hobbies, setHobbies] = useState<string[]>([]);
    const [eventDateString, setEventDateString] = useState<string>('');
    const [user] = useAuthState(auth);

    if (!user) {
        navigate('/login');
        return;
    }

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
            }
        }
    };

    const getGroupData = async () => {
        const documentRefDatabase = doc(db, 'groups', groupId);
        const documentSnapshot = await getDoc(documentRefDatabase);

        if (documentSnapshot.exists()) {
            const data = documentSnapshot.data();
            setTitle(data?.title);
            setDescription(data?.description);
            setParticipants(data?.participants);
            setImage(data?.image);
            setHobbies(data?.hobbyTags || []);
            setLocation(data?.location);
            setEventDate(data?.eventDate);
            setEventDateString(data?.eventDate?.toDate().toLocaleDateString());
            // check if the user is in the participants list
            const userIsParticipant = data?.participants.find((participant) => participant.id === user?.uid);
            if (!userIsParticipant) {
                Swal.fire({
                    title: 'Atentie',
                    text: 'Trebuie sa fii participant la eveniment pentru a accesa grupul',
                    icon: 'warning',
                    iconColor: '#307014',
                    confirmButtonText: 'Ok',
                    confirmButtonColor: '#307014',
                });
                navigate('/');
                return;
            }
        }

        const commentsRef = doc(db, 'comments', groupId);

        if (!(await getDoc(commentsRef)).exists()) {
            setDoc(commentsRef, {
                comments: [],
            });
        }

        const dataRef = await getDoc(commentsRef);

        const commentsDataRef = dataRef?.data()?.comments;

        setComments(commentsDataRef);
    };

    const addComment = () => {
        Swal.fire({
            title: 'Adauga comentariu',
            html: `<input id="swal-input1" class="swal2-input" placeholder="Comentariu">`,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonColor: '#307014',
            cancelButtonText: 'Anuleaza',
            confirmButtonText: 'Adauga',
            preConfirm: async () => {
                const userRef = doc(db, 'users', user?.uid);
                const userSnapshot = await getDoc(userRef);
                const userNameLogged = userSnapshot?.data()?.username;

                const comment = {
                    text: (document.getElementById('swal-input1') as HTMLInputElement).value,
                    id_user: user?.uid,
                    id_group: groupId,
                    date_created: new Date().toString(),
                    username: userNameLogged,
                    user_profile_picture: userSnapshot?.data()?.profilePicture,
                };

                const commentsRef = doc(db, 'comments', groupId);
                const dataRef = await getDoc(commentsRef);

                const comments = dataRef?.data()?.comments;

                const newComments = comments ? [...comments, comment] : [comment];

                setDoc(
                    doc(db, 'comments', groupId),
                    {
                        comments: newComments,
                    },
                    {
                        merge: true,
                    },
                );

                setComments(newComments);
            },
        });
    };

    const deleteComment = async (commentIndex) => {
        const commentsRef = doc(db, 'comments', groupId);
        const dataRef = await getDoc(commentsRef);
        const existingComments = dataRef?.data()?.comments;

        const updatedComments = existingComments.filter((_, index) => index !== commentIndex);

        await setDoc(commentsRef, { comments: updatedComments }, { merge: true });
        setComments(updatedComments);
    };

    useEffect(() => {
        checkTwoFactorAuth();
        getGroupData();
        const commentsRef = doc(db, 'comments', groupId);
        const unsubscribe = onSnapshot(commentsRef, (snapshot) => {
            const data = snapshot.data();
            const commentsData = data?.comments || [];
            setComments(commentsData);
        });
    }, []);

    return (
        <div className="col flex mx-20 mt-10 gap-10">
            <Card className="mx-auto bg-cardColor w-full">
                <CardBody>
                    <div className="flex flex-row gap-4 w-full h-full">
                        <div className="w-1/3">
                            <h1 className="text-3xl font-bold text-white">
                                Titlu: <span className="text-3xl font-bold text-center text-green-700">{title}</span>
                            </h1>
                            <p className="text-xl font-bold text-left text-white pt-10">Descriere:</p>
                            <p className="text-lg text-left text-white">{description}</p>
                            <br />
                            <p className="text-xl font-bold text-left text-white">Hobby-uri:</p>
                            <div className="flex flex-wrap gap-2 mb-4">
                            {hobbies.map((hobby, index) => (
                                <span key={index} className="px-3 py-1 bg-green-700 text-white rounded-full text-sm">
                                {hobby}
                                </span>
                            ))}
                            </div>
                            <p className="text-xl font-bold text-left text-white">Locatie:</p>
                            <p className="text-lg text-left text-white">{location}</p>
                            <br />
                            <p className="text-xl font-bold text-left text-white">Data eveniment:</p>
                            <p className="text-lg text-left text-white">{eventDateString}</p>

                            <br />

                            <p className="text-xl font-bold text-left text-white">Lista de participanti:</p>
                            {participants.map((participant) => (
                                <p
                                    className="text-xl text-left text-white cursor-pointer hover:text-green-700"
                                    onClick={() => navigate(`/profile/${participant.username}`)}
                                >
                                    @{participant.username}
                                </p>
                            ))}
                        </div>

                        <div>
                        <div className="w-96 h-96 rounded-xl overflow-hidden">
                            <div
                                className="w-full h-full"
                                style={{ backgroundImage: `url(${image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                            ></div>
                            </div>
                        </div>
                        <div className="w-1/3 ml-20">
                            <h1 className="text-2xl font-bold text-left text-white mb-10">Comentarii:</h1>
                            <div className="flex flex-col">
                                {/* {comments.map((comment) => (
                                    <div className="flex flex-row gap-5">
                                        <img src={comment.user_profile_picture} className="w-10 h-10 rounded-full object-cover" />
                                        <div className="flex flex-col gap-1">
                                            <p
                                                className="text-lg text-left text-white cursor-pointer hover:text-green-700"
                                                onClick={() => navigate(`/profile/${comment.username}`)}
                                            >
                                                {comment.username}
                                            </p>
                                            <p className="text-lg text-left text-white">{comment.text}</p>
                                        </div>
                                    </div>
                                ))} */}
                                {comments.map((comment, index) => (
                                <div key={index} className="flex flex-row gap-5 items-start mb-4">
                                    <img src={comment.user_profile_picture} className="w-10 h-10 rounded-full object-cover" />
                                    <div className="flex flex-col gap-1 flex-1">
                                    <p
                                        className="text-lg text-left text-white cursor-pointer hover:text-green-700"
                                        onClick={() => navigate(`/profile/${comment.username}`)}
                                    >
                                        {comment.username}
                                    </p>
                                    <p className="text-lg text-left text-white">{comment.text}</p>
                                    </div>
                                    {user?.uid === comment.id_user && (
                                    <button
                                        onClick={() => deleteComment(index)}
                                        className="text-red-500 text-sm hover:text-red-700"
                                        title="Șterge comentariul"
                                    >
                                        ✕
                                    </button>
                                    )}
                                </div>
                                ))}
                            </div>
                            <Button className="mt-10 bg-green-700" onClick={addComment}>
                                Adauga comentariu
                            </Button>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
};

export default Group;
