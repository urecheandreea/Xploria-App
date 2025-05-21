import { Button, Card, CardBody, select } from "@material-tailwind/react";
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
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, auth, storage } from "../../Firebase/firebase";
import { useState } from "react";
import { Card, CardBody, Button } from "@material-tailwind/react";

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

const OwnProfile = () => {
  const [activeTab, setActiveTab] = useState<"friends" | "requests" | null>(
    null
  );
  const [user] = useAuthState(auth);
  const [userName, setUserName] = useState("");
  const [name, setName] = useState("");
  const [biography, setBiography] = useState("");
  const [hobbyList, setHobbyList] = useState([]);
  const [friendsList, setFriendsList] = useState([]);
  const [pendingRequest, setPendingRequest] = useState([]);
  const [imageUpload, setImageUpload] = useState(null);
  const [profilePicture, setProfilePicture] = useState("");
  const [friendsListWithPictures, setFriendsListWithPictures] = useState([]);
  const [pendingRequestsWithPictures, setPendingRequestsWithPictures] =
    useState([]);
  const [seeAllPosts, setSeeAllPosts] = useState(false);
  const navigate = useNavigate();

  if (!user) {
    navigate("/login");
    return;
  }

  const getUserData = async () => {
    const documentRefDatabase = doc(db, "users", user?.uid);
    const documentSnapshot = await getDoc(documentRefDatabase);

    if (documentSnapshot.exists()) {
      const data = documentSnapshot.data();
      setUserName(data?.username);
      setName(data?.name);
      setBiography(data?.biography);
      setHobbyList(data?.hobbyList);
      setFriendsList(data?.friendsList);
      setPendingRequest(data?.pendingRequest);
      setProfilePicture(data?.profilePicture);
      setSeeAllPosts(data?.seeAllPosts);

      const temp = [];

      for (const friend of data?.friendsList) {
        const q = query(
          collection(db, "users"),
          where("username", "==", friend.username)
        );
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
          // doc.data() is never undefined for query doc snapshots
          temp.push({
            username: doc.data().username,
            profilePicture: doc.data().profilePicture,
            userId: doc.id,
          });
        });
      }
      setFriendsListWithPictures(temp);

      const temp2 = [];

      for (const request of data?.pendingRequest) {
        const requestUser = await getDoc(doc(db, "users", request.userId));
        temp2.push({
          username: requestUser.data().username,
          profilePicture: requestUser.data().profilePicture,
          userId: request.userId,
        });
      }
      setPendingRequestsWithPictures(temp2);
      console.log(temp2);
    }
  };

  const editUserData = async () => {
    Swal.fire({
      title: "Edit your profile",
      html: `<input id="swal-input1" class="swal2-input" placeholder="Name" value="${name}">
                     <input id="swal-input2" class="swal2-input" placeholder="Description" value="${biography}">`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonColor: "#307014",
      iconColor: "#307014",
      preConfirm: () => {
        const name = (
          document.getElementById("swal-input1") as HTMLInputElement
        ).value;
        const biography = (
          document.getElementById("swal-input2") as HTMLInputElement
        ).value;
        setDoc(
          doc(db, "users", user?.uid),
          {
            name: name,
            biography: biography,
          },
          {
            merge: true,
          }
        );
        setName(name);
        setBiography(biography);
      },
    });
  };

  const addAHobby = async () => {
    const htmlOptions = predefinedHobbies
      .map(
        (hobby) =>
          `<div style="text-align: left; padding: 5px;"><input type="checkbox" id="${hobby}" name="${hobby}" value="${hobby}"> <label for="${hobby}">${hobby}</label></div>`
      )
      .join("");

    const { value: confirmed } = await Swal.fire({
      title: "Select your hobbies",
      html: `<form id="hobbyForm">${htmlOptions}</form>`,
      showCancelButton: true,
      confirmButtonText: "Save",
      confirmButtonColor: "#307014",
      iconColor: "#307014",
      preConfirm: () => {
        const checkboxes = document.querySelectorAll("#hobbyForm input[type=checkbox]:checked");
        const selected = Array.from(checkboxes).map((el) => el.value);
        if (selected.length === 0) {
          Swal.showValidationMessage("Please select at least one hobby");
          return;
        }
        return selected;
      },
    });

    if (confirmed) {
      const newHobbies = [...new Set([...hobbyList, ...confirmed])];
      await setDoc(
        doc(db, "users", user?.uid),
        { hobbyList: newHobbies },
        { merge: true }
      );
      setHobbyList(newHobbies);
    }
  };

  const removeHobby = async (hobby) => {
    setDoc(
      doc(db, "users", user?.uid),
      {
        hobbyList: hobbyList?.filter((hobbyItem) => hobbyItem !== hobby),
      },
      {
        merge: true,
      }
    );
    setHobbyList(hobbyList?.filter((hobbyItem) => hobbyItem !== hobby));
  };

  // const handleSeeAllPosts = async () => {
  //   setDoc(
  //     doc(db, "users", user?.uid),
  //     {
  //       seeAllPosts: !seeAllPosts,
  //     },
  //     {
  //       merge: true,
  //     }
  //   );
  //   setSeeAllPosts(!seeAllPosts);
  // };

  const acceptRequest = (requestObject) => {
    /* remove from pending request and add to friends list */

    const friendUsername = requestObject.username;

    const newPendingRequest = pendingRequest?.filter(
      (friend) => friend.username !== friendUsername
    );
    setPendingRequest(newPendingRequest);

    const newPeindingRequestsWithPictures = pendingRequestsWithPictures?.filter(
      (friend) => friend.username !== friendUsername
    );
    setPendingRequestsWithPictures(newPeindingRequestsWithPictures);

    const newFriendsList = [
      ...friendsList,
      {
        username: friendUsername,
      },
    ];

    setFriendsList(newFriendsList);

    const newFriendsListWithPictures = [
      ...friendsListWithPictures,
      {
        username: friendUsername,
        profilePicture: requestObject.profilePicture,
        userId: requestObject.userId,
      },
    ];

    setFriendsListWithPictures(newFriendsListWithPictures);

    setDoc(
      doc(db, "users", user?.uid),
      {
        pendingRequest: newPendingRequest,
        friendsList: newFriendsList,
      },
      {
        merge: true,
      }
    );

    /* get the friends list of the friend and add the user to it */
    const friendListWithYou = [];

    getDoc(doc(db, "users", requestObject.userId))
      .then((doc) => {
        if (doc.exists()) {
          const data = doc.data();
          friendListWithYou.push(data?.friendsList);
        }
      })
      .catch((error) => {
        console.log("Error getting the document:", error);
      });

    /* add the user to the friend list */
    friendListWithYou.push({
      username: userName,
    });

    /* update the friend list */
    setDoc(
      doc(db, "users", requestObject.userId),
      {
        friendsList: friendListWithYou,
      },
      {
        merge: true,
      }
    );

    /* display a success message */
    Swal.fire({
      icon: "Success",
      title: "The request has been accepted!",
      showConfirmButton: false,
      timer: 1500,
      confirmButtonColor: "#307014",
      iconColor: "#307014",
    });
  };

  const declineRequest = (requestObject) => {
    /* remove from pending request and add to friends list */

    const friendUsername = requestObject.username;

    const newPendingRequest = pendingRequest?.filter(
      (friend) => friend.username !== friendUsername
    );

    setPendingRequest(newPendingRequest);

    setDoc(
      doc(db, "users", user?.uid),
      {
        pendingRequest: newPendingRequest,
      },
      {
        merge: true,
      }

      /* display a success message */
    );

    Swal.fire({
      icon: "Success",
      title: "The request has been declined!",
      showConfirmButton: false,
      timer: 1500,
      confirmButtonColor: "#307014",
      iconColor: "#307014",
    });

    /* update pending request of the friend */
    setPendingRequestsWithPictures([]);
  };

  const checkTwoFactorAuth = async () => {
    const documentRefDatabase = doc(db, "users", user?.uid);
    const documentSnapshot = await getDoc(documentRefDatabase);
    if (documentSnapshot.exists()) {
      const data = documentSnapshot.data();
      // Check two-factor authentication value here
      if (!data?.twoFactorAuth) {
        Swal.fire({
          title: "Attention",
          text: "You need to pass the two-step verification to access this content",
          icon: "warning",
          iconColor: "#307014",
          confirmButtonText: "Ok",
          confirmButtonColor: "#307014",
        });
        navigate("/verification");
      }
    }
  };
  useEffect(() => {
    checkTwoFactorAuth();
    getUserData();
  }, [user]);

  const uploadImage = async () => {
    if (imageUpload === null) {
      return;
    }

    const imageRef = ref(storage, `profilePictures/${userName}`);
    // get the download url and save it in the profilePicture field of the current user
    getDownloadURL(imageRef).then((url) => {
      setDoc(
        doc(db, "users", user?.uid),
        {
          profilePicture: url,
        },
        {
          merge: true,
        }
      );
      setProfilePicture(url);
    });
    uploadBytes(imageRef, imageUpload).then(() => {
      Swal.fire({
        icon: "Success",
        title: "Profile picture updated successfully!",
        showConfirmButton: false,
        timer: 1500,
        confirmButtonColor: "#307014",
        iconColor: "#307014",
      });
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="container mx-auto flex flex-col lg:flex-row gap-10">
        <Card className="bg-white w-full lg:w-1/3 shadow-lg rounded-lg p-6">
          <CardBody className="flex flex-col items-center">
            <img
              src={profilePicture}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-green-600 mb-4"
            />
            <input
              id="uploadInput"
              type="file"
              className="hidden"
              onChange={(e) => setImageUpload(e.target.files[0])}
            />
            <div className="flex flex-col items-center gap-2">
              <Button
                className="bg-green-600 text-white text-sm"
                onClick={() => document.getElementById("uploadInput").click()}
              >
                Select profile picture
              </Button>
              <Button
                className="bg-green-500 text-white text-sm"
                onClick={uploadImage}
                disabled={!imageUpload}
              >
                Confirm upload
              </Button>
            </div>

            <h1 className="text-2xl font-bold text-gray-800 mt-4">{name}</h1>
            <h2 className="text-gray-500">@{userName}</h2>
            <p className="mt-4 text-center italic text-gray-700">{biography}</p>

            {/* Butoane acțiuni */}
            <div className="flex flex-wrap justify-center gap-3 mt-6 w-full">
              <Button
                className="bg-green-700 text-white text-sm"
                onClick={editUserData}
              >
                Edit Profile
              </Button>
             
              
              <Button
                className="bg-green-400 text-white text-sm"
                onClick={addAHobby}
              >
                Add a hobby
              </Button>
            </div>

            {/* Lista hobby-uri */}
            <div className="mt-6 w-full">
              {hobbyList?.map((hobby) => (
                <div
                  key={hobby}
                  className="flex justify-between items-center bg-green-100 text-green-900 px-4 py-2 rounded-md mb-2"
                >
                  <span>{hobby}</span>
                  <Button
                    className="bg-red-500 text-white text-sm px-3 py-1"
                    onClick={() => removeHobby(hobby)}
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* CARD INTERACTIV CU TABURI */}
        <Card className="bg-white w-full lg:w-2/3 shadow-lg rounded-lg p-6">
          <CardBody>
            {/* Butoane tab */}
            <div className="flex justify-center gap-6 mb-6">
              <Button
                className={`${
                  activeTab === "friends" ? "bg-green-700" : "bg-green-400"
                } text-white`}
                onClick={() => setActiveTab("friends")}
              >
                Friends
              </Button>
              <Button
                className={`${
                  activeTab === "requests" ? "bg-green-700" : "bg-green-400"
                } text-white`}
                onClick={() => setActiveTab("requests")}
              >
                Requests
              </Button>
            </div>

            {/* SECȚIUNI CONDIȚIONALE */}
            {activeTab === "friends" && (
              <div>
                <h2 className="text-xl text-green-700 font-semibold mb-4 text-center">
                  Friends
                </h2>
                {friendsListWithPictures?.length === 0 ? (
                  <p className="text-center text-gray-500">
                    You have no friends yet. Start adding some!
                  </p>
                ) : (
                  friendsListWithPictures.map((friend) => (
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
                        className="text-gray-800 cursor-pointer hover:text-green-600"
                        onClick={() => navigate(`/profile/${friend.username}`)}
                      >
                        @{friend.username}
                      </h3>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "requests" && (
              <div>
                <h2 className="text-xl text-green-700 font-semibold mb-4 text-center">
                  Friends requests
                </h2>
                {pendingRequestsWithPictures?.length === 0 ? (
                  <p className="text-center text-gray-500">
                    You don't have new requests
                  </p>
                ) : (
                  pendingRequestsWithPictures.map((request) => (
                    <div
                      key={request.username}
                      className="flex items-center gap-3 mb-4"
                    >
                      <img
                        src={request.profilePicture}
                        className="w-12 h-12 rounded-full border-2 border-green-600"
                        alt=""
                      />
                      <h3
                        className="text-gray-800 cursor-pointer hover:text-green-600"
                        onClick={() => navigate(`/profile/${request.username}`)}
                      >
                        @{request.username}
                      </h3>
                      <div className="flex gap-2 ml-auto">
                        <Button
                          className="bg-green-600 text-white text-sm px-3 py-1"
                          onClick={() => acceptRequest(request)}
                        >
                          Accept
                        </Button>
                        <Button
                          className="bg-red-500 text-white text-sm px-3 py-1"
                          onClick={() => declineRequest(request)}
                        >
                          Decline
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
export default OwnProfile;
