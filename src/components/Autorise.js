import React, { useEffect, useState } from "react";
import { firestore } from "../Firebase";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { auth } from "../Firebase";
import { useNavigate } from "react-router-dom";

function Auto() {
  const [userList, setUserList] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState("fatou02@gmail.com");
  const [isApproved, setIsApproved] = useState(false);
  const [showUserList, setShowUserList] = useState(false);
  const [signedInUser, setSignedInUser] = useState("");
  const [state, setState] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const signOut = async () => {
    auth
      .signOut()
      .then(() => {
        console.log("User signed out successfully");
        navigate("/log");
      })
      .catch((error) => {
        console.log(error.message);
      });
  };

  useEffect(() => {
    function getUser() {
      const user = window.localStorage.getItem("userEmail");
      setSignedInUser(user ?? "Not signed In");
    }

    getUser();
  }, []);

  async function fetchUserList() {
    const userCollection = collection(firestore, "Users");
    const users = (await getDocs(userCollection)).docs.map((doc) => doc.data());

    setUserList(users);
  }

  const handleIconClick = () => {
    setShowUserList(!showUserList);
  };

  useEffect(() => {
    fetchUserList();
  }, []);

  const autorisation = async (user) => {
    if (user.email === isAdmin) {
      const errorMessage = "Tyou can't approve yourself.";
      setErrorMessage(errorMessage);
      alert(errorMessage);
      console.error("you can't approve yourself.");

      return;
    }

    const userDocRef = doc(firestore, `Users/${user.email}`);

    try {
      await setDoc(
        userDocRef,
        { isApproved: !user.isApproved },
        { merge: true }
      );
      fetchUserList();
    } catch (error) {
      console.error("error", error);
    }
  };

  return (
    <div>
      <div
        className="first home-page"
        style={{ color: "#e0e0e0", paddingInline: "30%" }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h1
            style={{
              color: "white",
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              gap: 10,
            }}
          >
            <ion-icon name="list-outline"></ion-icon>TodoList
          </h1>

          <div style={{ fontSize: 10 }}>{signedInUser}</div>
          <button
            onClick={() => signOut()}
            style={{
              outline: "2px solid #e0e0e022",
              borderRadius: 10,
              paddingBlock: 5,
              marginBlock: 15,
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              gap: 10,
              cursor: "pointer",
            }}
          >
            signout
          </button>
        </div>

        <div
          onClick={handleIconClick}
          style={{
            outline: "2px solid #e0e0e022",
            borderRadius: 10,
            color: "white",
            paddingBlock: 5,
            marginBlock: 15,
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 10,
            cursor: "pointer",
          }}
        >
          <ion-icon name="ellipsis-horizontal-sharp"></ion-icon> View the
          users's list
        </div>

        {showUserList && (
          <div style={{ fontSize: 20, width: "27em" }}>
            {userList.map((user) => (
              <div
                style={{
                  backgroundColor: "#e0e0e011",
                  borderRadius: 20,
                  marginBottom: 5,
                  paddingBlock: 5,
                  paddingInline: 20,
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  wordWrap: "break-word",
                  justifyContent: "center",
                  gap: 20,
                }}
                key={user.email}
              >
                <div style={{}} key={user.email} value={user.email}>
                  {user.email}
                </div>
                <button
                  style={{
                    borderRadius: "5px",
                    padding: "5px",
                  }}
                  onClick={() => autorisation(user)}
                >
                  <span
                    style={{
                      color: user.isApproved ? "red" : "green",
                    }}
                  >
                    {user.isApproved ? "Una" : "A"}uthorise user
                  </span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Auto;
