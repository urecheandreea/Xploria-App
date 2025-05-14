import { Button, DialogBody, DialogFooter, DialogHeader, Dialog, Input, Typography } from '@material-tailwind/react';
import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import Swal from 'sweetalert2';
import { Group } from '../../utils/Types';
import { auth, db, storage } from '../../Firebase/firebase';
import { createDocument } from '../../utils/util-functions';
import Group from '../group/Group';

const CreatePostModal = () => {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [category, setCategory] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [eventDate, setEventDate] = useState<Date>(new Date());

    const [user] = useAuthState(auth);
    if (!user) {
        return null;
    }

    /* get the username of the user logged in */
    const documentRefDatabase = doc(db, 'users', user.uid);
    const [username, setUsername] = useState<string>('');

    useEffect(() => {
        getDoc(documentRefDatabase).then((doc) => {
            if (doc.exists()) {
                setUsername(doc.data().username);
            }
        });
    }, []);

    const uploadImage = async (id) => {
        if (image === null) {
            return;
        }
        // upload image to storage
        const storageRef = ref(storage, `groups/${id}`);
        await uploadBytes(storageRef, image);
        // get image url
        const url = await getDownloadURL(storageRef);
        // update group with image url
        const groupRef = doc(db, 'groups', id);
        await setDoc(groupRef, { image: url }, { merge: true });
    };

    const toggleDialog = () => setOpen((prev) => !prev);

    const handleSubmit = () => {
        const newGroup: Omit<Group, 'id'> = {
            creatorId: user.uid,
            category,
            dateCreated: new Date().toISOString(),
            description,
            eventDate,
            image: 'https://thumbs.dreamstime.com/b/group-friends-playing-football-garden-summertime-having-fun-35610168.jpg',
            location,
            noParticipants: 1,
            title,
            participants: [{ id: user.uid, username }],
            pendingRequest: [],
        };
        createDocument('groups', newGroup).then((id) => {
            uploadImage(id).then(() => {
                toggleDialog();
                Swal.fire({
                    icon: 'success',
                    title: 'Succes',
                    text: 'Evenimentul a fost creat cu succes!',
                    confirmButtonColor: '#11aabe',
                    iconColor: '#11aabe',
                }).then(() => {
                    window.location.reload();
                });
            });
        });
    };

    return (
        <div className="flex flex-col">
            <Button onClick={toggleDialog} className="self-center bg-turq mx-2 my-4">
                Creeaza eveniment
            </Button>
            <Dialog open={open} handler={toggleDialog}>
                <DialogHeader>Publica un nou eveniment!</DialogHeader>
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
                    <div className="mb-5">
                        <Typography variant="h6">Incarca o imagine</Typography>
                        <input
                            type="file"
                            className="bg-gray-200"
                            onChange={(e) => {
                                setImage(e.target.files[0]);
                            }}
                        />
                    </div>
                </DialogBody>
                <DialogFooter>
                    <Button variant="text" color="red" onClick={toggleDialog} className="mr-1">
                        <span>Anulare</span>
                    </Button>
                    <Button className="bg-turq" onClick={handleSubmit}>
                        <span>Creeaza</span>
                    </Button>
                </DialogFooter>
            </Dialog>
        </div>
    );
};

export default CreatePostModal;
