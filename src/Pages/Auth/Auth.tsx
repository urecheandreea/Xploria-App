import { Button, Card } from '@material-tailwind/react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { auth } from '../../Firebase/firebase';
import 'sweetalert2/src/sweetalert2.scss';

const AuthPage = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const signInNewUser = async () => {
        signInWithEmailAndPassword(auth, email, password)
            .then(() => {
                // Signed in
                console.log('Signed in');
                navigate('/verification');
            })
            .catch(() => {
                Swal.fire({
                    icon: 'error',
                    iconColor: '#2D6A4F', // verde specific
                    title: 'Autentificare esuata!',
                    text: 'Email sau parola introduse incorect!',
                    confirmButtonText: 'Incearca din nou',
                    confirmButtonColor: '#2D6A4F', // verde specific
                });
            });
    };

    return (
        <div className="h-screen flex flex-col items-center justify-center bg-green-100">
            {/* Titlul Xploria pe mijlocul paginii */}
            <h1 className="text-4xl font-bold text-green-700 mb-10">Xploria</h1>

            {/* Cardul de autentificare dedesubt */}
            <Card className="h-4/5 bg-green-200 w-2/5">
                <h1 className="text-center text-5xl font-bold text-green-800 mt-10">Welcome Back!</h1>
                <form className="mt-10 mx-10">
                    <div className="flex flex-col">
                        <label className="text-xl font-bold text-gray-700" htmlFor="email">
                            Email
                        </label>
                        <input
                            className="px-4 py-2 mt-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                            type="email"
                            id="email"
                            placeholder="Email"
                            onChange={(e) => {
                                setEmail(e.target.value);
                            }}
                        />

                        <label className="text-xl font-bold text-gray-700" htmlFor="password">
                            Password
                        </label>
                        <input
                            className="px-4 py-2 mt-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                            type="password"
                            id="password"
                            placeholder="Parola"
                            onChange={(e) => {
                                setPassword(e.target.value);
                            }}
                        />
                    </div>
                </form>
                <Button className="bg-green-500 text-sm mt-2 mx-auto hover:bg-green-600" onClick={signInNewUser}>
                    Log In
                </Button>
                <Button className="bg-green-500 text-sm mt-2 mx-auto hover:bg-green-600" onClick={() => navigate('/register')}>
                    Sign Up
                </Button>
                <Button className="bg-green-500 text-sm mt-2 mx-auto hover:bg-green-600" onClick={() => navigate('/reset-password')}>
                    Reset Password
                </Button>
            </Card>
        </div>
    );
};

export default AuthPage;
