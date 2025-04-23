import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import CryptoJS from 'crypto-js';
import speakeasy from 'speakeasy';
import { Buffer } from 'buffer';
import { useNavigate } from 'react-router-dom';
import { Card, Button } from '@material-tailwind/react';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import 'sweetalert2/src/sweetalert2.scss';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { GeneratedSecret } from '../../utils/Types';
import { generatedSecret } from '../../utils/Config';
import { db, auth } from '../../Firebase/firebase';

const Verification = () => {
    const [image, setImage] = useState('');
    const [secret, setSecret] = useState<GeneratedSecret | null>(null);
    const [inputValue, setInputValue] = useState('');
    const [twoFactorAuth, setTwoFactorAuth] = useState(false);
    const [user] = useAuthState(auth);
    const navigate = useNavigate();

    useEffect(() => {
        const backupCodes = [];
        const hashedBackupCodes = [];

        for (let i = 0; i < 10; i++) {
            const randomCode = (Math.random() * 10000000000).toFixed();
            const encrypted = CryptoJS.AES.encrypt(randomCode, generatedSecret.base32).toString();
            backupCodes.push(randomCode);
            hashedBackupCodes.push(encrypted);
        }

        QRCode.toDataURL(generatedSecret.otpauth_url)
            .then((imageData) => {
                setImage(imageData);
                setSecret(generatedSecret);
            })
            .catch((err) => {
                console.error(err);
            });
    }, []);

    const verifyCode = async () => {
        if (!secret) return;
        const { hex } = secret;
        console.log(Buffer.from(hex));
        console.log(Buffer.from(hex).toString());
        const isVerified = speakeasy.totp.verify({
            secret: Buffer.from(hex, 'hex') as unknown as string,
            encoding: 'hex',
            token: inputValue,
            window: 1,
        });
        if (!isVerified) {
            Swal.fire({
                icon: 'error',
                iconColor: '#11AABE',
                title: 'Eroare',
                text: 'Codul introdus este incorect',
                confirmButtonText: 'Incearca din nou',
                confirmButtonColor: '#11AABE',
            });
        } else {
            // modify the twoFactorAuth field in the database
            const documentRefDatabaseUser = doc(db, 'users',user.uid);
            setDoc(
                documentRefDatabaseUser,
                {
                    twoFactorAuth: true,
                },
                {
                    merge: true,
                },
            );
            navigate('/');
        }
    };

    return (
        <div className="h-screen flex xl:flex-row flex-col gap-20 container mt-20 mx-auto">
            <Card className="h-4/5  bg-carousel w-3/5 mx-auto">
                <img className="mx-auto p-10" width="350px mt-32" src={`${image}`} />

                <label className="text-3xl text-center font-bold text-gray-700 dark:text-gray-200" htmlFor="text">
                    Cod de verificare
                </label>
                <input
                    className="mx-64 px-2 py-2 mt-2 border-2 border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:border-turq"
                    type="text"
                    id="text"
                    value={inputValue}
                    placeholder="Introduceti codul..."
                    onChange={(e) => {
                        setInputValue(e.target.value);
                    }}
                />
                <Button className="bg-turq text-sm mt-2 mx-auto" onClick={verifyCode}>
                    Verificare
                </Button>
            </Card>
        </div>
    );
};

export default Verification;
