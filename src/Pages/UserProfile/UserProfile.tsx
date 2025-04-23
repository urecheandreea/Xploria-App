import { Button, Card, CardBody, Image } from '@material-tailwind/react';
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { doc, getDoc, setDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate } from 'react-router-dom';
import { db, auth, storage } from '../../Firebase/firebase';



const UserProfile = (props: UserProfileProps = { id: '' }) => {
 
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

    /* get the data of the user that is logged in */
    useEffect(() => {
        checkTwoFactorAuth();
        //getUserData();
    }, []);

   

    return (
        <div className="col flex mx-20 mt-10 gap-10">
        </div>
    );
};
export default UserProfile;
