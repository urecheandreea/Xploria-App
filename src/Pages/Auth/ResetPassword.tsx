import { Button, Card } from '@material-tailwind/react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import 'sweetalert2/src/sweetalert2.scss';
import { sendPasswordResetEmail } from 'firebase/auth';
import Swal from 'sweetalert2';
import { auth } from '../../Firebase/firebase';

const ResetPasswordPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');

    const resetPasswordUser = () => {
        sendPasswordResetEmail(auth, email)
            .then(() => {
                Swal.fire({
                    icon: 'info',
                    iconColor: '#16a34a',
                    title: 'Check your email!',
                    text: 'Follow the instructions to reset your password',
                    confirmButtonText: 'Log In',
                    confirmButtonColor: '#16a34a',
                }).then(() => {
                    navigate('/login');
                });
            })
            .catch(() => {
                Swal.fire({
                    icon: 'error',
                    iconColor: '#16a34a',
                    title: 'Error',
                    text: 'The e-mail address is incorrect.',
                    confirmButtonText: 'Try again',
                    confirmButtonColor: '#16a34a',
                });
            });
    };

    return (
        <div className="min-h-screen bg-green-50 flex flex-col items-center justify-start pt-12 px-4">
            <h1 className="text-6xl font-serif text-green-700 mb-10 text-center">Xploria</h1>

            <Card className="w-full max-w-md bg-green-100 shadow-md p-8">
                <h2 className="text-center text-3xl font-serif text-green-700 mb-6">Reset Password</h2>
                <form className="flex flex-col gap-4">
                    <div>
                        <label className="text-lg font-serif text-gray-700" htmlFor="email">
                            E-mail
                        </label>
                        <input
                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                            type="email"
                            id="email"
                            placeholder="Email"
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </form>
                <Button
                    className="bg-green-500 hover:bg-green-600 text-white text-sm mt-6 w-full"
                    onClick={resetPasswordUser}
                >
                    Send link
                </Button>
            </Card>
        </div>
    );
};

export default ResetPasswordPage;
