import { Button, Card, CardBody, Image } from "@material-tailwind/react";
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  doc,
  getDoc,
  setDoc,
  query,
  collection,
  where,
  getDocs,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import { db, auth, storage } from "../../Firebase/firebase";
import { useParams } from "react-router-dom";

/* interface for the props of the component */
interface UserProfileProps {
  /* id of the user for which you want to see the profile */
  id: string;
}

/* interface for the friend object list */
interface FriendObjectList {
  userId: string;
  username: string;
  profilePicture: string;
}

/**
 * The component that renders the user profile page
 */
const UserProfile = (props: UserProfileProps = { id: "" }) => {
  /* navigate hook used to redirect to another page */
  const navigate = useNavigate();
  /* get the current user state */
  const [user] = useAuthState(auth);
  /* username of the user */
  const [userName, setUserName] = useState("");
  /* name of the user */
  const [name, setName] = useState("");
  /* biography of the user */
  const [biography, setBiography] = useState("");
  /* hobby list of the user */
  const [hobbyList, setHobbyList] = useState([]);
  /* friends list of the user */
  const [friendsList, setFriendsList] = useState([]);
  const [profilePicture, setProfilePicture] = useState("");
  /* status of the button to add friend this user */
  const [statusAlreadyFriend, setStatusAlreadyFriend] = useState(false);
  const [statusPendingRequest, setStatusPendingRequest] = useState(false);
  const [statusReceivedRequest, setStatusReceivedRequest] = useState(false);

  const [friendsListWithPictures, setFriendsListWithPictures] = useState([]);

  if (!user) {
    navigate("/login");
    return;
  }

  /* rediret to the user own profile if the id is the same as the user id */
  if (user.uid === props.id) {
    navigate("/own-profile");
    return;
  }

  /* get the data of the user that you want to add */
  // const getUserData = async () => {
  //   /* document reference to database of the user */
  //   const documentRefDatabaseUser = doc(db, "users", props.id);
  //   /* get the collection data from the database */
  //   const documentDataUser = await getDoc(documentRefDatabaseUser);

  //   /* get the data from the database */
  //   if (documentDataUser.exists()) {
  //     const data = documentDataUser.data();
  //     /* update the user states */
  //     setUserName(data?.username);
  //     setName(data?.name);
  //     setBiography(data?.biography);
  //     setHobbyList(data?.hobbyList);
  //     setFriendsList(data?.friendsList);
  //     setProfilePicture(data?.profilePicture);

  //     const temp = [];

  //     for (const friend of data?.friendsList) {
  //       const q = query(
  //         collection(db, "users"),
  //         where("username", "==", friend.username)
  //       );
  //       const querySnapshot = await getDocs(q);

  //       querySnapshot.forEach((doc) => {
  //         // doc.data() is never undefined for query doc snapshots
  //         temp.push({
  //           username: doc.data().username,
  //           profilePicture: doc.data().profilePicture,
  //           userId: doc.id,
  //         });
  //       });
  //     }
  //     setFriendsListWithPictures(temp);
  //   }

  //   /* get the list of friends of the user for which you want to see the profile with username */
  //   const userFriendList = documentDataUser.data()?.friendsList;
  //   const friendUsername = documentDataUser.data()?.username;
  //   const userNameFriendList = userFriendList.map(
  //     (friend: FriendObjectList) => friend.username
  //   );

  //   /* get userNames of the user that is logged in */
  //   const documentRefDatabaseUserLogged = doc(db, "users", user?.uid);
  //   const documentDataUserLogged = await getDoc(documentRefDatabaseUserLogged);
  //   const userNameLoggedd = documentDataUserLogged.data()?.username;

  //   /* check if the two users are friends */
  //   if (userNameFriendList.includes(userNameLoggedd)) {
  //     /* hide the button for sending friend request */
  //     setStatusAlreadyFriend(true);
  //   }

  //   /* get the list of pending request of the user for which you want
  //    *  to see the profile with username
  //    */
  //   const userPendingRequestList = documentDataUser.data()?.pendingRequest;
  //   const userNamePendingRequestList = userPendingRequestList.map(
  //     (friend: FriendObjectList) => friend.username
  //   );
  //   const userLoggedPendingRequestList =
  //     documentDataUserLogged.data()?.pendingRequest;
  //   const userNameLoggedPendingRequestList = userLoggedPendingRequestList.map(
  //     (friend: FriendObjectList) => friend.username
  //   );

  //   if (userNameLoggedPendingRequestList.includes(friendUsername)) {
  //     /* hide the button for sending friend request */
  //     setStatusReceivedRequest(true);
  //   }

  //   /* check if the user that is logged in has sent a friend request
  //    *  to the user for which you want to see the profile
  //    */
  //   if (userNamePendingRequestList.includes(userNameLoggedd)) {
  //     /* hide the button for sending friend request */
  //     setStatusPendingRequest(true);
  //   }
  // };

  const getUserData = async () => {
  // Reset all friend status flags first
  setStatusAlreadyFriend(false);
  setStatusPendingRequest(false);
  setStatusReceivedRequest(false);

  // Reset lists
  setFriendsList([]);
  setFriendsListWithPictures([]);

  const documentRefDatabaseUser = doc(db, "users", props.id);
  const documentDataUser = await getDoc(documentRefDatabaseUser);

  if (documentDataUser.exists()) {
    const data = documentDataUser.data();
    setUserName(data?.username);
    setName(data?.name);
    setBiography(data?.biography);
    setHobbyList(data?.hobbyList);
    setFriendsList(data?.friendsList);
    setProfilePicture(data?.profilePicture);

    const temp = [];

    for (const friend of data?.friendsList) {
      const q = query(
        collection(db, "users"),
        where("username", "==", friend.username)
      );
      const querySnapshot = await getDocs(q);

      querySnapshot.forEach((doc) => {
        temp.push({
          username: doc.data().username,
          profilePicture: doc.data().profilePicture,
          userId: doc.id,
        });
      });
    }
    setFriendsListWithPictures(temp);
  }

  const userFriendList = documentDataUser.data()?.friendsList;
  const friendUsername = documentDataUser.data()?.username;
  const userNameFriendList = userFriendList.map(
    (friend: FriendObjectList) => friend.username
  );

  const documentRefDatabaseUserLogged = doc(db, "users", user?.uid);
  const documentDataUserLogged = await getDoc(documentRefDatabaseUserLogged);
  const userNameLoggedd = documentDataUserLogged.data()?.username;

  if (userNameFriendList.includes(userNameLoggedd)) {
    setStatusAlreadyFriend(true);
  }

  const userPendingRequestList = documentDataUser.data()?.pendingRequest || [];
  const userNamePendingRequestList = userPendingRequestList.map(
    (friend: FriendObjectList) => friend.username
  );

  const userLoggedPendingRequestList =
    documentDataUserLogged.data()?.pendingRequest || [];
  const userNameLoggedPendingRequestList =
    userLoggedPendingRequestList.map(
      (friend: FriendObjectList) => friend.username
    );

  if (userNameLoggedPendingRequestList.includes(friendUsername)) {
    setStatusReceivedRequest(true);
  }

  if (userNamePendingRequestList.includes(userNameLoggedd)) {
    setStatusPendingRequest(true);
  }
};

  const checkTwoFactorAuth = async () => {
    const documentRefDatabase = doc(db, "users", user?.uid);
    const documentSnapshot = await getDoc(documentRefDatabase);
    if (documentSnapshot.exists()) {
      const data = documentSnapshot.data();
      // Check two-factor authentication value here
      if (!data?.twoFactorAuth) {
        Swal.fire({
          title: "Atentie",
          text: "Trebuie sa treci de verificarea in doi pasi pentru a accesa acest continut",
          icon: "warning",
          iconColor: "#11AABE",
          confirmButtonText: "Ok",
          confirmButtonColor: "#11AABE",
        });
        navigate("/verification");
      }
    }
  };

  /* get the data of the user that is logged in */
  // useEffect(() => {
  //   checkTwoFactorAuth();
  //   getUserData();
  // }, []);
  useEffect(() => {
  checkTwoFactorAuth();
}, []);

useEffect(() => {
  getUserData();
}, [props.id]);

  /*
   * The function that sends a friend request to the user that you want to add
   */
  const addFriend = async () => {
    /* hide the button for sending friend request */
    setStatusPendingRequest(true);

    /* show a message for the user to know that the request was sent */
    Swal.fire({
      icon: "success",
      title: "Cererea a fost trimisa",
      showConfirmButton: false,
      timer: 1500,
      confirmButtonColor: "#11aabe",
      iconColor: "#11aabe",
    });

    /* get the current username of the user that is logged in */
    const documentRefDatabaseUserLogged = doc(db, "users", user?.uid);
    const documentDataUserLogged = await getDoc(documentRefDatabaseUserLogged);
    const userNameLogged = documentDataUserLogged.data()?.username;

    /* modify pending request of the user that you want to add */
    const documentRefDatabaseUser = doc(db, "users", props.id);

    const documentDataUser = await getDoc(documentRefDatabaseUser);

    /* update the pending request list of the user */
    if (documentDataUser.exists()) {
      /* get the pending request list of the user */
      const pendingRequest = documentDataUser.data()?.pendingRequest;

      /* add the user to the pending request list */
      const newPending = {
        userId: user?.uid,
        username: userNameLogged,
      };

      setDoc(
        doc(db, "users", props.id),
        {
          pendingRequest: [...pendingRequest, newPending],
        },
        {
          merge: true,
        }
      );
    }
  };

  const UndoRequestFriend = async () => {
    /* hide the button for sending friend request */
    setStatusPendingRequest(false);

    /* show a message for the user to know that the request was sent */
    Swal.fire({
      icon: "success",
      title: "Cererea a fost anulata",
      showConfirmButton: false,
      timer: 1500,
      confirmButtonColor: "#11aabe",
      iconColor: "#11aabe",
    });

    /* get the current username of the user that is logged in */
    const documentRefDatabaseUserLogged = doc(db, "users", user?.uid);
    const documentDataUserLogged = await getDoc(documentRefDatabaseUserLogged);
    const userNameLogged = documentDataUserLogged.data()?.username;

    /* modify pending request of the user that you want to add */
    const documentRefDatabaseUser = doc(db, "users", props.id);

    const documentDataUser = await getDoc(documentRefDatabaseUser);

    /* update the pending request list of the user */
    if (documentDataUser.exists()) {
      /* get the pending request list of the user */
      const pendingRequest = documentDataUser.data()?.pendingRequest;

      /* remove the user to the pending request list */
      const newPending = pendingRequest.filter(
        (friend: FriendObjectList) => friend.username !== userNameLogged
      );

      setDoc(
        doc(db, "users", props.id),
        {
          pendingRequest: [...newPending],
        },
        {
          merge: true,
        }
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="container mx-auto flex flex-col lg:flex-row gap-10">
        {/* CARD PROFIL */}
        <Card className="bg-white w-full lg:w-1/3 shadow-lg rounded-lg p-6">
          <CardBody className="flex flex-col items-center">
            <img
              src={profilePicture}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-green-600 mb-4"
            />

            {!statusAlreadyFriend && (
              <Button
                className="text-center mt-4 bg-green-700"
                onClick={statusPendingRequest ? UndoRequestFriend : addFriend}
                disabled={statusReceivedRequest}
              >
                {statusPendingRequest
                  ? "Cancel Request"
                  : statusReceivedRequest
                  ? "Request Received"
                  : "Add Friend"}
              </Button>
            )}

            <h1 className="text-2xl font-bold text-gray-800 mt-4">{name}</h1>
            <h2 className="text-gray-500">@{userName}</h2>
            <p className="mt-4 text-center italic text-gray-700">{biography}</p>

            {/* Lista hobby-uri */}
            <h1 className="italic text-green-800 font-bold text-xl mt-5">
              Hobbies:{" "}
            </h1>
            <div className="flex flex-wrap mt-4">
              {hobbyList?.map((hobby, index) => (
                <div key={index} className="">
                  <Button
                    className={`mx-2 my-2 text-center ${
                      index % 2 === 0
                        ? "bg-green-700 text-white"
                        : "bg-white text-green-700"
                    }`}
                  >
                    {hobby}
                  </Button>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* CARD LISTA PRIETENI */}
        <Card className="bg-white w-full lg:w-2/3 shadow-lg rounded-lg p-6">
          <CardBody>
            <h1 className="text-3xl font-bold text-green-700 text-center mb-6">
              Friends
            </h1>
            {friendsListWithPictures?.length === 0 ? (
              <p className="text-center text-gray-500">
                You have no friends yet. Start adding friends to connect with
                others!
              </p>
            ) : (
              friendsListWithPictures.map((friend: FriendObjectList) => (
                <div
                  key={friend.username}
                  className="flex items-center gap-3 mb-4"
                >
                  <img
                    src={friend.profilePicture}
                    className="w-12 h-12 rounded-full border-2 border-green-600"
                    alt=""
                  />
                  <h3
                    className="text-gray-800 text-lg font-medium cursor-pointer hover:text-green-700"
                    onClick={() => navigate(`/profile/${friend.username}`)}
                  >
                    @{friend.username}
                  </h3>
                </div>
              ))
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
export default UserProfile;
