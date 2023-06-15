import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../App.css";

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { firestore } from "../Firebase";
import { auth } from "../Firebase";
import { useNavigate } from "react-router-dom";
// import { storage } from './firebase';
// import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";

function Home() {
  const navigate = useNavigate();
  const [signedInUser, setSignedInUser] = useState("");
  const [editIndex, setEditIndex] = useState(-1);
  // const [idBeingEdited, setIdBeingEdited] = useState("");
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

  const [state, setState] = useState("");
  const [date, setDate] = useState(null);
  const [todos, setTodos] = useState([]);
  const [showFields, setShowFields] = useState(false);
  const [userList, setUserList] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [showUserList, setShowUserList] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [completedTasks, setCompletedTasks] = useState([]);
  const [showEditForm, setShowEditForm] = useState(false);
  const [buttonText, setButtonText] = useState("Add");
  const [attachedDocuments, setAttachedDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [fileContent, setFileContent] = useState("");

  // const [isEditing, setIsEditing] = useState(false);

  async function fnserList() {
    const userCollection = collection(firestore, "Users");
    const users = (await getDocs(userCollection)).docs.map((doc) => doc.data());
    setUserList(users);
  }

  const handleIconClick = () => {
    setShowUserList(!showUserList);
  };

  useEffect(() => {
    fnserList();
  }, []);

  useEffect(() => {
    function getUser() {
      const user = window.localStorage.getItem("userEmail");
      setSignedInUser(user ?? "Not signed In");
    }

    getUser();
  }, []);

  async function fnfetchList() {
    const userEmail = window.localStorage.getItem("userEmail");

    const _collection = collection(firestore, `Todos/${userEmail}/List`);

    const data = (await getDocs(_collection)).docs.map((item) => item.data());

    console.log(data);
    setTodos(data);
  }

  useEffect(() => {
    fnfetchList();
  }, []);

  const updateTaskProgress = async (index, progress) => {
    const updatedTodos = todos.map((todo, i) => {
      if (i === index) {
        return { ...todo, progress };
      }
      return todo;
    });

    setTodos(updatedTodos);

    const userEmail = window.localStorage.getItem("userEmail");
    const id = todos[index].id;
    const _doc = doc(firestore, `Todos/${userEmail}/List/${id}`);
    setDoc(_doc, { progress }, { merge: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (state.trim().length === 0) {
      return;
    }

    if (editIndex === -1) {
      const id = uuidv4();
      const completed = selectedUser ? false : true;
      const newTask = {
        id,
        task: state,
        date: date,
        completed: completed,
        assignedTo: selectedUser ? selectedUser : "Not Assigned",
        progress: 0,
        documents: attachedDocuments,
      };
      const userEmail = window.localStorage.getItem("userEmail");
      const userDoc = doc(firestore, `Todos/${userEmail}/List/${id}`);
      const userData = {
        id: newTask.id,
        task: state,
        date: date,
        completed: false,
        assignedTo: selectedUser ? selectedUser : "Not Assigned",
        documents: attachedDocuments ? attachedDocuments : "none",
      };
      await setDoc(userDoc, userData, { merge: true });

      if (selectedUser) {
        const assignedUserDoc = doc(
          firestore,
          `Todos/${selectedUser}/List/${id}`
        );

        const assignedUserData = {
          id: id,
          ...newTask,
        };
        await setDoc(assignedUserDoc, assignedUserData, { merge: true });
      }

      fnfetchList();
    } else {
      const userEmail = window.localStorage.getItem("userEmail");
      const id = todos[editIndex].id;
      const _doc = doc(firestore, `Todos/${userEmail}/List/${id}`);
      const data = {
        task: state,
        date: date,
      };
      await setDoc(_doc, data, { merge: true });
      fnfetchList();

      setEditIndex(-1);
    }

    setState("");
    setDate(null);
    setSelectedUser("");
    setShowFields(false);
    setButtonText("Add");
    setAttachedDocuments([]); // Réinitialiser la liste des documents attachés
  };

  const uuidv4 = () => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0,
          v = c === "x" ? r : (r & 0x3) | 0x8;

        return v.toString(16);
      }
    );
  };

  const handleDocumentUpload = (event) => {
    const files = event.target.files;
    const fileNames = Array.from(files).map((file) => file.name);

    setAttachedDocuments(fileNames);
  };

  const handleDocumentClick = (document) => {
    setSelectedDocument(document);
  };

  const assignTask = (index) => {
    const updatedTodos = todos.map((todo, i) => {
      if (i === index) {
        const assigned = !todo.assigned;
        return { ...todo, assigned };
      }
      return todo;
    });

    const task = updatedTodos[index];
    if (task.assigned) {
      console.log(`this task  ${index} is assigned`);
    } else {
      console.log(`this task ${index} is not assigned.`);
    }
  };

  const completeTask = (index) => {
    const userEmail = window.localStorage.getItem("userEmail");
    const id = todos[index].id;
    const _doc = doc(firestore, `Todos/${userEmail}/List/${id}`);

    const updatedTodos = todos.map((todo, i) => {
      if (i === index) {
        const completed = !todo.completed;
        const progress = completed ? 100 : 0;
        const updatedTodo = { ...todo, completed, progress };
        setDoc(_doc, updatedTodo, { merge: true });
        return updatedTodo;
      }
      return todo;
    });

    setTodos(updatedTodos);

    const _doc1 = doc(firestore, `Todos/${userEmail}/List/${id}`);
    setDoc(_doc1, updatedTodos[index]);
    //Update for user
    // const user = userEmail;
    // const _admindoc = doc(firestore, `Todos/${user}/List/${id}`);
    // setDoc(_admindoc, updatedTodos[index]);
  };

  const deleteTask = async (id) => {
    console.log(id);

    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );
    if (!confirmed) {
      return;
    }

    try {
      const userEmail = window.localStorage.getItem("userEmail");
      const _doc = doc(firestore, `Todos/${userEmail}/List/${id}`);
      console.log(`Todos/${userEmail}/List/${id}`);
      await deleteDoc(_doc);

      if (selectedUser) {
        const assignedUserDoc = doc(firestore, `Todos/${userEmail}/List/${id}`);
        await deleteDoc(assignedUserDoc);
      }

      fnfetchList();
    } catch (error) {
      console.log(error);
    }

    setState("");
    setDate(null);
    setSelectedUser("");
    setShowFields(false);
  };

  const deleteUser = async (email) => {
    if (userList.find((user) => user.email === email && user.isAdmin)) {
      const errorMessage = "This user is an admin. You can't delete him.";
      setErrorMessage(errorMessage);
      alert(errorMessage);
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this user?"
    );
    if (!confirmed) {
      return;
    }

    const updatedUserList = userList.filter((user) => user.email !== email);
    setUserList(updatedUserList);
    const userDoc = doc(firestore, `Users/${email}`);
    await deleteDoc(userDoc);
    const successMessage = "User deleted successfully";
    setErrorMessage(successMessage);
    alert(successMessage);
  };

  const editTask = (index) => {
    const todo = todos[index];

    setState("");
    setDate(null);
    setSelectedUser("");
    setEditIndex(index);
    setShowFields(true);
    // setIsEditing(true);
    setButtonText("Update");
    setShowEditForm(true);
  };

  async function saveEdit(id) {
    if (id === "") return console.log({ id });
    const todo = todos.find((item) => item.id == id);
    console.log({ id, todo });
    const update = {
      task: state ?? todo.task,
      date: date ?? todo.date,
      assignedTo: selectedUser ? selectedUser : "Not Assigned",
    };

    const userEmail = window.localStorage.getItem("userEmail");
    const _doc2 = doc(firestore, `Todos/${userEmail}/List/${todo.id}`);
    await setDoc(_doc2, update, { merge: true });

    setShowFields(false);
    fnfetchList();
  }

  return (
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

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 5,
          }}
        >
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
        <ion-icon name="ellipsis-horizontal-sharp"></ion-icon> View the users's
        list
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
              <div
                onClick={() => deleteUser(user.email)}
                style={{
                  cursor: "pointer",
                  position: "relative",
                  marginLeft: 280,
                }}
              >
                <ion-icon
                  name="trash-outline"
                  size="large"
                  color={"white"}
                ></ion-icon>
              </div>
            </div>
          ))}
        </div>
      )}

      <div
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
        }}
      >
        <div
          onClick={() => setShowFields(true)}
          style={{
            borderRadius: 10,
            backgroundColor: "#f276a1",
            height: 30,
            cursor: "pointer",
            width: 30,
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ion-icon name="add-outline" color={"#181820"}></ion-icon>
        </div>{" "}
        <div onClick={() => setShowFields(true)}>Add a task</div>{" "}
      </div>
      {showFields && (
        <div className="second">
          <form onSubmit={handleSubmit}>
            <input
              style={{
                borderRadius: 10,
                backgroundColor: "#e0e0e022",
                height: 15,
                cursor: "pointer",
                width: "100%",
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                borderColor: "#e0e0e055",
                marginBlock: 10,
                color: "white",
              }}
              type="text"
              placeholder="What needs to be done"
              value={state}
              onChange={(e) => setState(e.target.value)}
            />

            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                marginTop: 10,
                gap: 15,
              }}
            >
              <DatePicker
                className="custom-datepicker"
                selected={date}
                onChange={(date) => setDate(date)}
                dateFormat="dd/MM/yyyy"
                placeholderText="Select a date"
                style={{
                  backgroundColor: "#e0e0e022",
                }}
              />
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
              >
                <option value="">Assign To</option>
                {userList.map((user) => (
                  <option key={user.email} value={user.email}>
                    {user.email}
                  </option>
                ))}
                <option value=" ">Not Assigned</option>
              </select>

              <div
                onClick={handleSubmit}
                style={{
                  cursor: "pointer",
                  backgroundColor: "#7fffd4",
                  borderRadius: 3,
                  paddingBlock: 3,
                  color: "black",
                  paddingInline: 20,
                }}
              >
                {editIndex === -1 ? "Add" : "Update"}
              </div>

              <div
                onClick={() => setShowFields(false)}
                style={{
                  cursor: "pointer",
                  backgroundColor: "#ff6347",
                  borderRadius: 3,
                  paddingBlock: 3,
                  color: "black",
                  paddingInline: 20,
                }}
              >
                cancel
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="" style={{}}>
        <>
          <h3>Tasks - {todos.length}</h3>
          {todos.length === 0 ? (
            <h6>there's nothing to do :(</h6>
          ) : (
            <div>
              <table
                style={{
                  width: 100,
                  justifyContent: "center",
                  alignItems: "center",
                  // display: "r",
                }}
              >
                {todos.map((todo, index) => {
                  return (
                    <tr
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
                      }}
                      key={index}
                    >
                      <div
                        style={{
                          width: 50,
                          height: 50,
                          display: "block",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={todo.completed}
                          onChange={() => completeTask(index)}
                          style={{ color: "#f276a1" }}
                        />
                      </div>

                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          width: "100%",
                          gap: 20,
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: 20,
                              width: "14em",
                            }}
                          >
                            {todo.task}
                          </div>
                          <div style={{ color: "green" }}>
                            {todo.date &&
                              `${new Date(
                                todo.date.toDate()
                              ).toLocaleDateString()}`}
                          </div>
                          <div>Progress: {todo.progress}%</div>
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={todo.progress}
                            onChange={(e) =>
                              updateTaskProgress(index, e.target.value)
                            }
                          />
                          <div>
                            {todo.assignedTo ? (
                              <div>Assigned: {todo.assignedTo}</div>
                            ) : (
                              <div>Assigned: Not Assigned</div>
                            )}
                          </div>

                          {/* <div>Assigné: {isAssigned ? '' : 'Non'}</div> */}
                        </div>

                        <div
                          onClick={() => editTask(index)}
                          style={{ cursor: "pointer" }}
                        >
                          <table
                            style={{
                              width: 100,
                            }}
                          >
                            <tr>
                              <td
                                style={{
                                  display: "block",
                                  margin: 10,
                                }}
                              >
                                <ion-icon
                                  name="create-outline"
                                  size="large"
                                  color={"#181820"}
                                ></ion-icon>
                              </td>
                            </tr>
                          </table>
                        </div>

                        <div
                          onClick={() => deleteTask(todo.id)}
                          style={{ cursor: "pointer" }}
                        >
                          <ion-icon
                            name="trash-outline"
                            size="large"
                            color={"#181820"}
                          ></ion-icon>
                        </div>
                      </div>
                    </tr>
                  );
                })}
              </table>
            </div>
          )}
        </>
      </div>
    </div>
  );
}

export default Home;
