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
  const [users, setUsers] = useState([]);
  const [showFields, setShowFields] = useState(false);

  useEffect(() => {
    function getUser() {
      const user = window.localStorage.getItem("userEmail");
      setSignedInUser(user ?? "Not signed In");
    }

    getUser();
  }, []);

  useEffect(() => {
    async function userList() {
      const userEmail = window.localStorage.getItem("userEmail");

      const _collection = collection(firestore, `Users/${userEmail}`);

      const data = (await getDocs(_collection)).docs.map((item) => item.data());

      console.log(data);
      setUsers(data);
    }
    userList();
  }, []);

  useEffect(() => {
    async function fetchList() {
      const userEmail = window.localStorage.getItem("userEmail");

      const _collection = collection(firestore, `Todos/${userEmail}/List`);

      const data = (await getDocs(_collection)).docs.map((item) => item.data());

      console.log(data);
      setTodos(data);
    }
    fetchList();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (state.trim().length === 0) {
      return;
    }

    if (editIndex === -1) {
      setTodos([...todos, { task: state, date: date, completed: false }]);

      const userEmail = window.localStorage.getItem("userEmail");
      const id = uuidv4();
      const _doc = doc(firestore, `Todos/${userEmail}/List/${id}`);
      const data = {
        id: id,
        task: state,
        date: date,
        completed: false,
      };

      setDoc(_doc, data, { merge: true });
    } else {
      const updatedTodos = todos.map((todo, i) => {
        if (i === editIndex) {
          return { ...todo, task: state };
        }
        return todo;
      });

      setTodos(updatedTodos);
      setEditIndex(-1);
    }

    setState("");
    setShowFields(false);
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
        return { ...todo, completed: !todo.completed };
      }
      return todo;
    });

    setTodos(updatedTodos);
  };

  const deleteTask = (index) => {
    const updatedTodos = todos.filter((todo, i) => i !== index);
    setTodos(updatedTodos);
    const userEmail = window.localStorage.getItem("userEmail");
    const id = todos[index].id;
    const _doc = doc(firestore, `Todos/${userEmail}/List/${id}`);
    console.log(_doc);

    deleteDoc(_doc);

    setState("");
    setShowFields(false);
  };

  const editTask = (index) => {
    const todo = todos[index];
    setState(todo.task);
    setDate(todo.date);
    setEditIndex(index);
    setShowFields(true);
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
                Add
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
            <h6>There's nothing to do :(</h6>
          ) : (
            <div>
              {todos.map((todo, index) => (
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
                      <div style={{ fontSize: 20 }}>{todo.task}</div>
                      <div style={{ color: "green" }}>
                        {/* {todo.date && todo.date()} */}
                      </div>
                    </div>

                    <div
                      onClick={() => editTask(index)}
                      style={{ cursor: "pointer" }}
                    >
                      <ion-icon
                        name="create-outline"
                        size="large"
                        color={"#181820"}
                      ></ion-icon>
                    </div>

                    <div
                      onClick={() => deleteTask(index)}
                      style={{ cursor: "pointer" }}
                    >
                      <ion-icon
                        name="trash-outline"
                        size="large"
                        color={"#181820"}
                      ></ion-icon>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      </div>
    </div>
  );
}

export default Home;
