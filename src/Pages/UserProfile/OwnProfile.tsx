import { Button, Card, CardBody, select } from '@material-tailwind/react';
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { doc, getDoc, setDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate } from 'react-router-dom';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '../../Firebase/firebase';

const OwnProfile = () => {
    const [user] = useAuthState(auth);
    const [userName, setUserName] = useState('');
    const [name, setName] = useState('');
    const [biography, setBiography] = useState('');
    const [hobbyList, setHobbyList] = useState([]);
    const [friendsList, setFriendsList] = useState([]);
    const [pendingRequest, setPendingRequest] = useState([]);
    const [imageUpload, setImageUpload] = useState(null);
    const [profilePicture, setProfilePicture] = useState('');
    const [friendsListWithPictures, setFriendsListWithPictures] = useState([]);
    const [pendingRequestsWithPictures, setPendingRequestsWithPictures] = useState([]);
    const [seeAllPosts, setSeeAllPosts] = useState(false);
    const navigate = useNavigate();

    if (!user) {
        navigate('/login');
        return;
    }

    const getUserData = async () => {
        const documentRefDatabase = doc(db, 'users', user?.uid);
        const documentSnapshot = await getDoc(documentRefDatabase);

        if (documentSnapshot.exists()) {
            const data = documentSnapshot.data();
            setUserName(data?.username);
            setName(data?.name);
            setBiography(data?.biography);
            setHobbyList(data?.hobbyList);
            setFriendsList(data?.friendsList);
            setPendingRequest(data?.pendingRequest);
            setProfilePicture(data?.profilePicture);
            setSeeAllPosts(data?.seeAllPosts);

            const temp = [];

            for (const friend of data?.friendsList) {
                const q = query(collection(db, 'users'), where('username', '==', friend.username));
                const querySnapshot = await getDocs(q);

                querySnapshot.forEach((doc) => {
                    // doc.data() is never undefined for query doc snapshots
                    temp.push({
                        username: doc.data().username,
                        profilePicture: doc.data().profilePicture,
                        userId: doc.id,
                    });
                });
            }
            setFriendsListWithPictures(temp);

            const temp2 = [];

            for (const request of data?.pendingRequest) {
                const requestUser = await getDoc(doc(db, 'users', request.userId));
                temp2.push({
                    username: requestUser.data().username,
                    profilePicture: requestUser.data().profilePicture,
                    userId: request.userId,
                });
            }
            setPendingRequestsWithPictures(temp2);
            console.log(temp2);
        }
    };

    const editUserData = async () => {
        Swal.fire({
            title: 'Editeaza datele',
            html: `<input id="swal-input1" class="swal2-input" placeholder="Nume" value="${name}">
                     <input id="swal-input2" class="swal2-input" placeholder="Descriere" value="${biography}">`,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonColor: '#307014',
            iconColor: '#307014',
            preConfirm: () => {
                const name = (document.getElementById('swal-input1') as HTMLInputElement).value;
                const biography = (document.getElementById('swal-input2') as HTMLInputElement).value;
                setDoc(
                    doc(db, 'users', user?.uid),
                    {
                        name: name,
                        biography: biography,
                    },
                    {
                        merge: true,
                    },
                );
                setName(name);
                setBiography(biography);
            },
        });
    };

    const addAHobby = async () => {
        Swal.fire({
            title: 'Adauga un hobby',
            input: 'text',
            inputLabel: 'Hobby',
            inputPlaceholder: 'Hobby',
            showCancelButton: true,
            confirmButtonColor: '#307014',
            iconColor: '#307014',
            inputValidator: (value) => {
                if (!value) {
                    return 'Trebuie sa introduci un hobby!';
                }
            },
        }).then((result) => {
            if (result.isConfirmed) {
                setDoc(
                    doc(db, 'users', user?.uid),
                    {
                        hobbyList: [...hobbyList, result.value],
                    },
                    {
                        merge: true,
                    },
                );
                setHobbyList([...hobbyList, result.value]);
            }
        });
    };

    const removeHobby = async (hobby) => {
        setDoc(
            doc(db, 'users', user?.uid),
            {
                hobbyList: hobbyList?.filter((hobbyItem) => hobbyItem !== hobby),
            },
            {
                merge: true,
            },
        );
        setHobbyList(hobbyList?.filter((hobbyItem) => hobbyItem !== hobby));
    };

    const handleSeeAllPosts = async () => {
        setDoc(
            doc(db, 'users', user?.uid),
            {
                seeAllPosts: !seeAllPosts,
            },
            {
                merge: true,
            },
        );
        setSeeAllPosts(!seeAllPosts);
    };

    const acceptRequest = (requestObject) => {
        /* remove from pending request and add to friends list */

        const friendUsername = requestObject.username;

        const newPendingRequest = pendingRequest?.filter((friend) => friend.username !== friendUsername);
        setPendingRequest(newPendingRequest);

        const newPeindingRequestsWithPictures = pendingRequestsWithPictures?.filter(
            (friend) => friend.username !== friendUsername,
        );
        setPendingRequestsWithPictures(newPeindingRequestsWithPictures);

        const newFriendsList = [
            ...friendsList,
            {
                username: friendUsername,
            },
        ];

        setFriendsList(newFriendsList);

        const newFriendsListWithPictures = [
            ...friendsListWithPictures,
            {
                username: friendUsername,
                profilePicture: requestObject.profilePicture,
                userId: requestObject.userId,
            },
        ];

        setFriendsListWithPictures(newFriendsListWithPictures);

        setDoc(
            doc(db, 'users', user?.uid),
            {
                pendingRequest: newPendingRequest,
                friendsList: newFriendsList,
            },
            {
                merge: true,
            },
        );

        /* get the friends list of the friend and add the user to it */
        const friendListWithYou = [];

        getDoc(doc(db, 'users', requestObject.userId))
            .then((doc) => {
                if (doc.exists()) {
                    const data = doc.data();
                    friendListWithYou.push(data?.friendsList);
                }
            })
            .catch((error) => {
                console.log('Error getting document:', error);
            });

        /* add the user to the friend list */
        friendListWithYou.push({
            username: userName,
        });

        /* update the friend list */
        setDoc(
            doc(db, 'users', requestObject.userId),
            {
                friendsList: friendListWithYou,
            },
            {
                merge: true,
            },
        );

        /* display a success message */
        Swal.fire({
            icon: 'success',
            title: 'Cererea a fost acceptata!',
            showConfirmButton: false,
            timer: 1500,
            confirmButtonColor: '#307014',
            iconColor: '#307014',
        });
    };

    const declineRequest = (requestObject) => {
        /* remove from pending request and add to friends list */

        const friendUsername = requestObject.username;

        const newPendingRequest = pendingRequest?.filter((friend) => friend.username !== friendUsername);

        setPendingRequest(newPendingRequest);

        setDoc(
            doc(db, 'users', user?.uid),
            {
                pendingRequest: newPendingRequest,
            },
            {
                merge: true,
            },

            /* display a success message */
        );

        Swal.fire({
            icon: 'success',
            title: 'Cererea a fost refuzata!',
            showConfirmButton: false,
            timer: 1500,
            confirmButtonColor: '#307014',
            iconColor: '#307014',
        });

        /* update pending request of the friend */
        setPendingRequestsWithPictures([]);
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
    }, [user]);

    const uploadImage = async () => {
        if (imageUpload === null) {
            return;
        }

        const imageRef = ref(storage, `profilePictures/${userName}`);
        // get the download url and save it in the profilePicture field of the current user
        getDownloadURL(imageRef).then((url) => {
            setDoc(
                doc(db, 'users', user?.uid),
                {
                    profilePicture: url,
                },
                {
                    merge: true,
                },
            );
            setProfilePicture(url);
        });
        uploadBytes(imageRef, imageUpload).then(() => {
            Swal.fire({
                icon: 'success',
                title: 'Poza de profil a fost schimbata!',
                showConfirmButton: false,
                timer: 1500,
                confirmButtonColor: '#307014',
                iconColor: '#307014',
            });
        });
    };

    return (
        <div className="col flex mx-20 mt-10 gap-10">
            <Card className="mx-auto bg-cardColor w-1/3">
                <CardBody>
                    <img src={profilePicture} className="w-32 h-32 rounded-full object-cover" alt="" />
                    {/* add a form to change the profile picture */}
                    <div className="flex flex-col gap-2 mt-2">
                        <input
                            type="file"
                            onChange={(event) => {
                                setImageUpload(event.target.files[0]);
                            }}
                        ></input>
                        <Button className="bg-green-700 text-white" onClick={uploadImage}>
                            Schimba poza
                        </Button>
                    </div>
                    <h1 className="text-white text-2xl mt-5 font-bold dark">{name} </h1>
                    <h1 className="text-gray-500 text-xl mt-1">@{userName}</h1>
                    <Button className="text-center mt-4 bg-green-700 text-sm" onClick={editUserData}>
                        Editeaza
                    </Button>
                    <Button className="text-center mt-4 bg-green-700 text-sm mx-4" onClick={handleSeeAllPosts}>
                        {seeAllPosts ? 'Vezi postarile prietenilor' : 'Vezi toate postarile'}
                    </Button>
                    <p className="text-white text-xl mt-5 italic">{biography} </p>
                    <Button className="text-center mt-4 bg-green-700 text-sm" onClick={addAHobby}>
                        Adauga hobby
                    </Button>
                    {hobbyList?.map((hobby) => (
                        <div className="flex justify-between mt-5">
                            <h1 className="text-white text-lg">{hobby}</h1>
                            <Button className="text-center mt-4 bg-red-500 text-sm" onClick={() => removeHobby(hobby)}>
                                Sterge
                            </Button>
                        </div>
                    ))}{' '}
                </CardBody>
            </Card>
            <Card className="bg-cardColor w-2/3">
                <CardBody>
                    <div className="flex flex-row gap-64 mx-16">
                        <div className="row">
                            <h1 className="text-4xl text-white text-center">PRIETENII TAI</h1>
                            {friendsListWithPictures?.map((friend) => (
                                <div className="flex mt-5">
                                    <img src={friend.profilePicture} className="w-20 h-20 rounded-full" alt="" />
                                    <h1
                                        className="text-white text-xl italic my-auto cursor-pointer mx-2 hover:text-green-700"
                                        onClick={() => navigate(`/profile/${friend.username}`)}
                                    >
                                        @{friend.username}
                                    </h1>
                                </div>
                            ))}
                        </div>
                        <div className="row">
                            <h1 className="text-4xl text-white text-center">CERERI DE PRIETENIE</h1>
                            {pendingRequestsWithPictures?.map((request) => (
                                <div className="flex mt-5">
                                    <img src={request.profilePicture} className="w-20 h-20 rounded-full" alt="" />
                                    <h1
                                        className="text-white text-xl italic my-auto cursor-pointer mx-2"
                                        onClick={() => navigate(`/profile/${request.username}`)}
                                    >
                                        @{request.username}
                                    </h1>
                                    <div className="flex gap-1 mt-5">
                                        <Button
                                            className="text-center bg-green-500 w-20 h-10 px-1"
                                            onClick={() => acceptRequest(request)}
                                        >
                                            Accepta
                                        </Button>
                                        <Button
                                            className="text-center bg-red-500 w-20 h-10 px-1"
                                            onClick={() => declineRequest(request)}
                                        >
                                            Respinge
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
};
export default OwnProfile;
