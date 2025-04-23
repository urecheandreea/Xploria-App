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

    useEffect(() => {
        checkTwoFactorAuth();
  
    }, []);

    return (
        <div className="col flex mx-20 mt-10 gap-10">
            <Card className="mx-auto bg-cardColor w-full">
                <CardBody>
                  
                </CardBody>
            </Card>
        </div>
    );
};

export default Group;
