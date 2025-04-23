import { Button, Card, CardBody, select } from '@material-tailwind/react';
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { doc, getDoc, setDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate } from 'react-router-dom';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '../../Firebase/firebase';

const OwnProfile = () => {
   
    return (
        <div className="col flex mx-20 mt-10 gap-10">
            <Card className="mx-auto bg-cardColor w-1/3">
               <CardBody>
                    
                </CardBody>
            </Card>
            
        </div>
    );
};
export default OwnProfile;
