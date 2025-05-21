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
];

const CreatePostModal = () => {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [eventDate, setEventDate] = useState<Date>(new Date());
    const [selectedHobbies, setSelectedHobbies] = useState<string[]>([]);

    const [user] = useAuthState(auth);
    if (!user) {
        return null;
    }

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
        const storageRef = ref(storage, `groups/${id}`);
        await uploadBytes(storageRef, image);
        const url = await getDownloadURL(storageRef);
        const groupRef = doc(db, 'groups', id);
        await setDoc(groupRef, { image: url }, { merge: true });
    };

    const toggleDialog = () => setOpen((prev) => !prev);

    const handleSubmit = () => {
        const newGroup: Omit<Group, 'id'> = {
            creatorId: user.uid,
            dateCreated: new Date().toISOString(),
            description,
            eventDate,
            image: 'https://thumbs.dreamstime.com/b/group-friends-playing-football-garden-summertime-having-fun-35610168.jpg',
            location,
            noParticipants: 1,
            title,
            participants: [{ id: user.uid, username }],
            pendingRequest: [],
            hobbyTags: selectedHobbies,
        };
        createDocument('groups', newGroup).then((id) => {
            uploadImage(id).then(() => {
                toggleDialog();
                Swal.fire({
                    icon: 'success',
                    title: 'Succes',
                    text: 'Evenimentul a fost creat cu succes!',
                    confirmButtonColor: '#307014',
                    iconColor: '#307014',
                }).then(() => {
                    window.location.reload();
                });
            });
        });
    };

    return (
        <div className="flex flex-col">
            <Button
                onClick={toggleDialog}
                style={{ backgroundColor: '#307014' }}
                className="self-center mx-2 my-4 rounded-2xl shadow-2xl"
            >
                Create event
            </Button>

            <Dialog
                open={open}
                handler={toggleDialog}
                className="overflow-y-auto max-h-screen max-w-3xl"
                style={{ backgroundColor: '#bfe3bf' }}
                contentClassName="rounded-2xl shadow-2xl"
            >
                <DialogHeader>Publish a new event!</DialogHeader>
                <DialogBody className="overflow-y-auto max-h-[70vh]">
                    {[ 
                        { label: 'Event name', value: title, setter: setTitle },
                        { label: 'Event description', value: description, setter: setDescription },
                        { label: 'Event location', value: location, setter: setLocation },
                    ].map(({ label, value, setter }) => (
                        <div className="mb-5" key={label}>
                            <Typography variant="h6">{label}</Typography>
                            <Input
                                className="bg-gray-200 rounded-xl shadow-xl"
                                value={value}
                                onChange={(e) => setter(e.target.value)}
                            />
                        </div>
                    ))}

                    <div className="mb-5">
                        <Typography variant="h6">Event date</Typography>
                        <input
                            type="date"
                            className="bg-gray-200 rounded-xl shadow-xl p-2"
                            onChange={(e) => setEventDate(new Date(e.target.value))}
                        />
                    </div>

                    <div className="mb-5">
                        <Typography variant="h6">Upload an image</Typography>
                        <input
                            type="file"
                            className="bg-gray-200 rounded-xl shadow-xl p-2"
                            onChange={(e) => setImage(e.target.files?.[0] ?? null)}
                        />
                    </div>

                    <div className="mb-5">
                        <Typography variant="h6">Select hobbies related to the event</Typography>
                        <div className="grid grid-cols-2 gap-2">
                            {predefinedHobbies.map((hobby) => (
                                <label key={hobby} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        value={hobby}
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
                </DialogBody>

                <DialogFooter className="space-x-2">
                    <Button
                        variant="text"
                        color="red"
                        onClick={toggleDialog}
                        className="rounded-xl shadow-xl"
                    >
                        <span>Cancel</span>
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        style={{ backgroundColor: '#307014' }}
                        className="text-white rounded-xl shadow-xl"
                    >
                        <span>Create</span>
                    </Button>
                </DialogFooter>
            </Dialog>
        </div>
    );
};

export default CreatePostModal;
