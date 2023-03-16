import React, { useRef, useState } from "react";
import "./App.css";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import DefaultUser from "./images/icons8-user-16.png";
import GoogleLogo from "./images/pngwing.com.png";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

// initializing firebase
firebase.initializeApp({
	apiKey: "AIzaSyD1toMRXvqNshSUCSdXF-KTk61tuhWQXyI",
	authDomain: "chat-box-app-fe7bb.firebaseapp.com",
	projectId: "chat-box-app-fe7bb",
	storageBucket: "chat-box-app-fe7bb.appspot.com",
	messagingSenderId: "222364255944",
	appId: "1:222364255944:web:2768ccb8a500b8f6a247fd",
	measurementId: "G-20FZNSZG8E",
});
// user authentication
const auth = firebase.auth();
// firestore database
const firestore = firebase.firestore();

function App() {
	const [user] = useAuthState(auth);
	return (
		<div className="App">
			<header>
				<h1>Chat App 💬</h1>
				<SignOut />
			</header>
			{/* if user is authenticated it should be directed to the chatroom */}
			<section>{user ? <ChatRoom /> : <SignIn />}</section>
		</div>
	);
}
// sign in with google
function SignIn() {
	const signInWithGoogle = () => {
		const provider = new firebase.auth.GoogleAuthProvider();
		auth.signInWithPopup(provider);
	};

	return (
		<>
			<button className="sign-in" onClick={signInWithGoogle}>
				<img src={GoogleLogo} width="" alt="" />
				Sign in with Google
			</button>
		</>
	);
}
// sign out functionality
function SignOut() {
	return (
		auth.currentUser && (
			<button className="sign-out" onClick={() => auth.signOut()}>
				Sign Out
			</button>
		)
	);
}
// creating a message section
function ChatRoom() {
	const dummy = useRef();
	const messagesRef = firestore.collection("messages");
	const query = messagesRef.orderBy("createdAt").limit(25);

	const [messages] = useCollectionData(query, { idField: "id" });

	const [formValue, setFormValue] = useState("");

	const sendMessage = async (e) => {
		e.preventDefault();

		const { uid, photoURL } = auth.currentUser;

		await messagesRef.add({
			text: formValue,
			createdAt: firebase.firestore.FieldValue.serverTimestamp(),
			uid,
			photoURL,
		});

		setFormValue("");
		dummy.current.scrollIntoView({ behavior: "smooth" });
	};

	return (
		<>
			<main>
				{messages &&
					messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}

				<span ref={dummy}></span>
			</main>
			{/* user input field with send button */}
			<form onSubmit={sendMessage}>
				<input
					value={formValue}
					onChange={(e) => setFormValue(e.target.value)}
					placeholder="Enter your message"
				/>

				<button type="submit" disabled={!formValue}>
					<i class="bx bx-paper-plane"></i>
				</button>
			</form>
		</>
	);
}
// each message component
function ChatMessage(props) {
	const { text, uid, photoURL } = props.message;

	const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

	return (
		<>
			<div className={`message ${messageClass}`}>
				<img src={photoURL || DefaultUser} />
				<p>{text}</p>
			</div>
		</>
	);
}

export default App;
