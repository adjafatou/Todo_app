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

function Home() {
  const navigate = useNavigate();
  const [signedInUser, setSignedInUser] = useState("");
  const [editIndex, setEditIndex] = useState(-1);

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
  const [selectedUser, setSelectedUser] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [buttonText, setButtonText] = useState("Add");
  const [showEditForm, setShowEditForm] = useState(false);

  useEffect(() => {
    function getUser() {
      const user = window.localStorage.getItem("userEmail");
      setSignedInUser(user ?? "Not signed In");
    }

    getUser();
  }, []);

  async function fetchList() {
    const userEmail = window.localStorage.getItem("userEmail");

    const _collection = collection(firestore, `Todos/${userEmail}/List`);

    const data = (await getDocs(_collection)).docs.map((item) => item.data());

    console.log(data);
    setTodos(data);
  }
  // fetchList();

  useEffect(() => {
    fetchList();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (state.trim().length === 0) {
      return;
    }

    if (editIndex === -1) {
      const newTask = {
        id: uuidv4(),
        task: state,
        date: date,
        completed: false,
        progress: 0,
        assignedUser: null,
      };

      setTodos([...todos, newTask]);

      const userEmail = window.localStorage.getItem("userEmail");
      const _doc = doc(firestore, `Todos/${userEmail}/List/${newTask.id}`);
      const data = {
        id: newTask.id,
        task: state,
        date: date,
        completed: false,
      };

      await setDoc(_doc, data, { merge: true });
    } else {
      const updatedTodos = todos.map((todo, i) => {
        if (i === editIndex) {
          return {
            ...todo,
            task: state,
            date: date,
          };
        }
        return todo;
      });

      setTodos(updatedTodos);

      const userEmail = window.localStorage.getItem("userEmail");
      const id = todos[editIndex].id;
      const _doc = doc(firestore, `Todos/${userEmail}/List/${id}`);
      const data = {
        task: state,
        date: date,
      };

      await setDoc(_doc, data, { merge: true });

      setEditIndex(-1);
    }

    setState("");
    setDate(null);
    setSelectedUser("");
    setShowFields(false);
    setButtonText("Add");
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

  const completeTask = (index) => {
    const updatedTodos = todos.map((todo, i) => {
      if (i === index) {
        const completed = !todo.completed;
        const progress = completed ? 100 : 0;
        return { ...todo, completed, progress };
      }
      return todo;
    });

    setTodos(updatedTodos);

    const userEmail = window.localStorage.getItem("userEmail");
    const id = todos[index].id;
    const _doc1 = doc(firestore, `Todos/${userEmail}/List/${id}`);
    setDoc(_doc1, updatedTodos[index]);
  };

  const deleteTask = async (id) => {
    // const updatedTodos = todos.filter((todo, i) => todo.id !== id);
    // setTodos(updatedTodos);
    console.log(id);
    const userEmail = window.localStorage.getItem("userEmail");
    const _doc = doc(firestore, `Todos/${userEmail}/List/${id}`);
    console.log(_doc);

    await deleteDoc(_doc);
    fetchList();
    setState("");
    setDate(null);
    setSelectedUser("");
    setShowFields(false);
  };

  const editTask = (index) => {
    const todo = todos[index];
    setState(todo.task);
    setDate(todo.date);
    setEditIndex(index);
    setShowFields(true);
    setSelectedUser(todo.assignedTo);
    setButtonText("Update");
    setShowEditForm(true);
  };

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
            style={{ cursor: "pointer", height: "fit" }}
          >
            signout
          </button>
        </div>
      </div>
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
                Cancel
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="" style={{}}>
        <>
          <h3>Tasks - {todos.length}</h3>
          {todos.length === 0 ? (
            <h6>There's nothing to do :(</h6>
          ) : (
            <div>
              <table
                style={{
                  width: 100,
                }}
              >
                {todos.map((todo, index) => (
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
                        <div style={{ fontSize: 20, width: "14em" }}>
                          {todo.task}
                        </div>
                        <div style={{ color: "green" }}>
                          {todo.date &&
                            `${new Date(
                              todo.date.toDate()
                            ).toLocaleDateString()}`}{" "}
                        </div>
                        <div>Progress: {todo.progress}%</div>
                        <div>
                          {todo.assignedTo ? (
                            <div>Assigned: Yes </div>
                          ) : (
                            <div>Assigned: Not Assigned</div>
                          )}
                        </div>
                        {todo.documents ? (
                          <div>
                            {" "}
                            Documents :{" "}
                            <ul>
                              {Array.from(todo.documents).map((file, index) => (
                                <li key={index}>{file}</li>
                              ))}
                            </ul>{" "}
                          </div>
                        ) : (
                          <div> Documents : None</div>
                        )}
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
                ))}
              </table>
            </div>
          )}
        </>
      </div>
    </div>
  );
}

export default Home;
