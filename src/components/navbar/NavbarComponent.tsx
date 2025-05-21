import { useEffect, useState } from "react";
import {
  Typography,
  Button,
  Menu,
  MenuItem
} from "@material-tailwind/react";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import { collection, query, doc, getDoc, setDoc } from "firebase/firestore";
import { db, signOutProcess, auth } from "../../Firebase/firebase";

export default function NavbarComponent() {
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchTimeout, setSearchTimeout] = useState(null);

  const navigate = useNavigate();
  const [user] = useAuthState(auth);

  const handleSearchInputChange = (event) => {
    setSearchText(event.target.value);
  };

  const usersRef = collection(db, "users");
  const fetchQuery = query(usersRef);
  const data = useCollectionData(fetchQuery);

  useEffect(() => {
    if (searchText === "") {
      setSearchResults([]);
      return;
    }
    if (searchTimeout !== null) {
      clearTimeout(searchTimeout);
    }
    setSearchTimeout(
      setTimeout(() => {
        const results = data?.[0].filter((user) => {
          return user.username.toLowerCase().includes(searchText.toLowerCase());
        });
        setSearchResults(results);
      }, 500)
    );
  }, [searchText]);

  const handleProfileClick = () => {
    navigate("/own-profile");
  };

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-3 relative">
      {/* Butoane sus dreapta */}
      <div className="absolute top-4 right-4 flex gap-4">
        <Button
          size="sm"
          className="bg-green-700 text-white px-6 py-2 text-sm"
          onClick={handleProfileClick}
        >
          MY PROFILE
        </Button>

        <Button
          size="sm"
          className="bg-green-700 text-white px-6 py-2 text-sm"
          onClick={() => {
            const documentRefDatabaseUser = doc(db, "users", user.uid);
            setDoc(
              documentRefDatabaseUser,
              {
                twoFactorAuth: false,
              },
              { merge: true }
            );
            signOutProcess();
            navigate("/login");
          }}
        >
          LOG OUT
        </Button>
      </div>

      {/* Titlu + frunză */}
      <div className="flex flex-col items-center mt-10 mb-2">
        <div className="flex items-center gap-2">
          <img
            src="src/assets/leafs-svgrepo-com (1).svg"
            alt="Frunze"
            className="w-8 h-8 transform -rotate-45 opacity-90"
          />
          <Typography
            variant="h4"
            className="cursor-pointer text-green-700 text-6xl font-bold font-poppins"
            onClick={() => navigate("/")}
          >
            Xploria
          </Typography>
        </div>

        <hr className="border-t-4 border-green-500 w-1/2 mt-3" />
      </div>

      {/* Search bar */}
      <div className="flex flex-col items-center mt-6">
        <input
          type="search"
          className="p-2 rounded-lg text-black text-center w-full max-w-md"
          value={searchText}
          onChange={handleSearchInputChange}
          placeholder="Search"
        />
      </div>

      {/* Search dropdown */}
      <Menu
        className="absolute z-50 w-full"
        direction="bottom"
        open={searchText !== "" && searchResults.length > 0}
        onClose={() => setSearchResults([])}
      >
        {searchResults.map((result) => (
          <MenuItem
            className="text-turq bg-transparent hover:bg-turq hover:text-white"
            key={result.id}
            onClick={() => {
              navigate(`/profile/${result.username}`);
              setSearchText("");
              setSearchResults([]);
              window.location.reload();
            }}
          >
            {result.username}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}
