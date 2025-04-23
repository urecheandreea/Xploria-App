import { useEffect, useState } from 'react';
import { Navbar, Typography, IconButton, Button, Input, Card } from '@material-tailwind/react';
import { Menu, MenuItem } from '@material-tailwind/react';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate } from 'react-router-dom';
import { collection, query, doc, getDoc, setDoc } from 'firebase/firestore';
import { db, signOutProcess, auth } from '../../Firebase/firebase';

export default function NavbarComponent() {
    const [searchText, setSearchText] = useState('');
    const [searchResults, setSearchResults] = useState([]); // this will be an array of user objects
    const [searchTimeout, setSearchTimeout] = useState(null); // holds the reference to the timeout function

    const navigate = useNavigate();

    const handleSearchInputChange = (event) => {
        setSearchText(event.target.value);
    };

    const usersRef = collection(db, 'users');
    const fetchQuery = query(usersRef);
    const data = useCollectionData(fetchQuery);

    const [user] = useAuthState(auth);

    useEffect(() => {
        if (searchText === '') {
            setSearchResults([]);
            return;
        }
        // clear any previous timeout
        if (searchTimeout !== null) {
            clearTimeout(searchTimeout);
        }
        // set a new timeout to fetch data after 500ms
        setSearchTimeout(
            setTimeout(() => {
                const results = data?.[0].filter((user) => {
                    return user.username.toLowerCase().includes(searchText.toLowerCase());
                });
                console.log(results);
                setSearchResults(results);
            }, 500),
        );
    }, [searchText]);

    const handleProfileClick = () => {
        navigate('/own-profile');
    };




    return (
        <div className="mx-auto max-w-screen-xl px-4 py-3 relative">
            <div className="flex items-center justify-center gap-4">
                <div className="relative z-10 -mr-9 animate-pulse"> {/* Ajustare offset cu ml-negativ */}
                    <img
                        src="src/assets/leafs-svgrepo-com (1).svg"
                        alt="Frunze"
                        className="w-20 h-20 transform -rotate-45 opacity-90"
                    />
                </div>

                {/* Titlul */}
                <Typography
                    variant="h6"
                    className="cursor-pointer py-1.5 text-green-700 text-6xl font-bold font-poppins"
                    onClick={() => navigate('/')}
                >
                    Xploria
                </Typography>
            </div>

            {/* Dunga verde sub titlu */}
            <hr className="border-t-4 border-green-500 w-1/2 mx-auto my-4" />



            {/* Butoanele */}
            <div className="flex flex-col items-center space-y-4 mt-4">
                <Button
                    buttonType="filled"
                    size="regular"
                    rounded={false}
                    block={false}
                    iconOnly={false}
                    ripple="light"
                    className="bg-green-700 text-white"
                    onClick={handleProfileClick}
                >
                    My Profile
                </Button>
            </div>

            {/* Căutare și Log Out */}
            <div className="flex flex-col items-center space-y-6 mt-4">
                <input
                    type="search"
                    className="p-2 rounded-lg text-black text-center w-full"
                    value={searchText}
                    onChange={handleSearchInputChange}
                    placeholder="Search"
                />
                <Button
                    size="sm"
                    className="!absolute right-1 top-1 rounded w-32 bg-green-700"
                    onClick={() => {
                        // set TwoFactorAuth to false
                        const documentRefDatabaseUser = doc(db, 'users', user.uid);
                        setDoc(
                            documentRefDatabaseUser,
                            {
                                twoFactorAuth: false,
                            },
                            {
                                merge: true,
                            },
                        );
                        signOutProcess();
                        navigate('/login');
                    }}
                >
                    Log Out
                </Button>
                <Menu
                    className="absolute z-50 w-full"
                    direction="bottom"
                    open={searchText !== '' && searchResults.length > 0}
                    onClose={() => setSearchResults([])}
                >
                    {searchResults.map((result) => (
                        <MenuItem
                            className="text-turq bg-transparent hover:bg-turq hover:text-white"
                            key={result.id}
                            onClick={() => {
                                navigate(`/profile/${result.username}`);
                                setSearchText('');
                                setSearchResults([]);
                                window.location.reload();
                            }}
                        >
                            {result.username}
                        </MenuItem>
                    ))}
                </Menu>
            </div>
        </div>
    );


}
