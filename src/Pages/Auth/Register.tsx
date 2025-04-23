import { Button, Card } from '@material-tailwind/react';
import { useState } from 'react';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { auth, db } from '../../Firebase/firebase';
import 'sweetalert2/src/sweetalert2.scss';
import { FaUserPlus } from 'react-icons/fa';

const RegisterPage = () => {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const registerNewUser = async () => {
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const { user } = userCredential;

                setDoc(doc(db, 'users', user.uid), {
                    username,
                    email,
                    hobbyList: [],
                    friendsList: [],
                    pendingRequest: [],
                    name: '',
                    biography: '',
                    profilePicture:
                        'https://media.istockphoto.com/id/1223671392/vector/default-profile-picture-avatar-photo-placeholder-vector-illustration.jpg?s=612x612&w=0&k=20&c=s0aTdmT5aU6b8ot7VKm11DeID6NctRCpB755rA1BIP0=',
                    twoFactorAuth: false,
                    seeAllPosts: false,
                });

                if (!user.emailVerified) {
                    sendEmailVerification(user)
                        .then(() => {
                            Swal.fire({
                                icon: 'info',
                                iconColor: '#16a34a',
                                title: 'Confirmă email-ul',
                                text: 'Instructiunile de verificare au fost trimise pe email',
                                confirmButtonText: 'Înapoi la login',
                                confirmButtonColor: '#16a34a',
                            }).then(() => {
                                navigate('/login');
                            });
                        })
                        .catch(console.log);
                } else {
                    navigate('/');
                }
            })
            .catch((error) => {
                Swal.fire({
                    icon: 'error',
                    iconColor: '#16a34a',
                    title: 'Înregistrare eșuată!',
                    text: 'Câmpuri introduse incorect',
                    confirmButtonText: 'Încearcă din nou',
                    confirmButtonColor: '#16a34a',
                });
                console.log(error);
            });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-100 to-green-300 flex flex-col items-center justify-start pt-12 px-4 font-[Poppins]">
            <h1 className="text-6xl font-extrabold text-green-800 mb-8 text-center drop-shadow-lg">Xploria</h1>

            <Card className="w-full max-w-md bg-white shadow-xl rounded-3xl p-10 animate-fade-in">
                <div className="flex justify-center mb-6">
                    <img
                        src="https://cdn-icons-png.flaticon.com/512/1077/1077114.png"
                        alt="avatar"
                        className="w-20 h-20 rounded-full"
                    />
                </div>
                <h2 className="text-center text-3xl font-semibold text-green-700 mb-6">Sign Up</h2>
                <form className="flex flex-col gap-4">
                    <div>
                        <label className="text-lg font-medium text-gray-700" htmlFor="email">Email</label>
                        <input
                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                            type="email"
                            id="email"
                            placeholder="Email"
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="text-lg font-medium text-gray-700" htmlFor="username">Username</label>
                        <input
                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                            type="text"
                            id="username"
                            placeholder="Username"
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="text-lg font-medium text-gray-700" htmlFor="password">Password</label>
                        <input
                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                            type="password"
                            id="password"
                            placeholder="Password"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </form>
                <Button
                    className="bg-green-500 hover:bg-green-600 text-white text-sm mt-6 w-full flex items-center justify-center gap-2"
                    onClick={registerNewUser}
                >
                    <FaUserPlus />
                    Sign Up
                </Button>
            </Card>
        </div>
    );
};

export default RegisterPage;
