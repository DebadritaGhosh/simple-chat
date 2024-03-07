// Importing libraries
import React, { useEffect, useState } from 'react';
import { EditorState } from 'draft-js';
import { signOut } from "firebase/auth";
import { Editor } from 'react-draft-wysiwyg';
import { convertToHTML } from 'draft-convert';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { addDoc, collection, getDocs, onSnapshot, query, serverTimestamp, where } from 'firebase/firestore';

// Importing config
import { auth, db } from '../firebase/firebase-config.js';

// Importing Utils
import { createMarkup } from '../utils/utils.js';



// Toolbar Options
const toolbarOptions = {
	options: ['inline', 'emoji'],
	inline: {
		options: ['bold', 'italic', 'underline'],
	}
};


function Dashboard({ isAuth, userDetails }) {

	// States
	const [users, setUsers] = useState([]);
	const [selectedUser, setSelectedUser] = useState("");
	const [singleUserMessage, setSingleUserMessage] = useState([]);
	const [editorState, setEditorState] = useState(() => EditorState.createEmpty(),);


	// Refs
	const usersRef = collection(db, "users");
	const messagesRef = collection(db, "messages");

	// UseEffect for fetching all users
	useEffect(() => {
		const fetchUsers = async () => {
			try {
				const usersCollection = await getDocs(usersRef);
				const fetchedUsers = usersCollection.docs.map(doc => ({
					id: doc.id,
					...doc.data()
				}));

				const filteredUsers = fetchedUsers.filter((item) => item.uid !== userDetails.uid);

				setUsers(filteredUsers);
			} catch (error) {
				console.error('Error fetching users: ', error);
			}
		};

		fetchUsers();
	}, []);


	// UseEffect for fetching all messages (Realtime)
	useEffect(() => {
		const fetchMessages = async () => {
			try {
				const queryMessages = query(
					messagesRef,
					where("userIds", "array-contains", userDetails.uid)
				);

				const unsubscribe = onSnapshot(queryMessages, (snapshot) => {
					let allMessages = [];
					snapshot.forEach((doc) => {
						console.log(doc.data());
						if (doc.data().userIds.includes(selectedUser)) {
							allMessages.push({ id: doc.id, ...doc.data() });
						}
					});

					setSingleUserMessage(allMessages);
				});

				return unsubscribe;
			} catch (error) {
				console.error('Error fetching messages: ', error);
			}
		};

		fetchMessages();
	}, [selectedUser]);


	// Function for logout
	const logOutHandler = async () => {
		try {
			await signOut(auth);
		} catch (error) {
			console.error('Error in logOutHandler : ', error);
		}
	}

	// Function for send message to another person
	const sendMessageHandler = async () => {

		try {
			let convertedHtmlContent = await convertToHTML(editorState.getCurrentContent());
			if (convertedHtmlContent.toString() === "<p></p>") {
				alert("Please add some text");
				return;
			}

			await addDoc(messagesRef, {
				text: convertedHtmlContent,
				createdAt: serverTimestamp(),
				senderId: userDetails.uid,
				userIds: [selectedUser, userDetails.uid],
				msgNotSeenBy: selectedUser
			});

			await setEditorState(EditorState.createEmpty());
		} catch (error) {
			console.error("Failed to send message : ", error)
		}


	}


	return (
		<div className='container'>
			<section className='dashboard__sidenav'>
				{
					users.map((item) => (
						<div
							className='users__card'
							key={item.id}
							onClick={() => setSelectedUser(item.uid)}
						>
							<h4>{item.email}</h4>
						</div>
					))
				}
			</section>

			<section className='dashboard__content'>
				<nav className='dashboard__navbar'>
					<h4>Hello, {userDetails.email}</h4>
					<button
						onClick={() => logOutHandler()}
						className='logout__button'
					>
						Logout
					</button>
				</nav>

				<div className='chat__container'>
					<h5> Send message to : {selectedUser}</h5>
					<div className='chat__container__chat'>
						{
							singleUserMessage.map((item) =>
								<div className={item.senderId === userDetails.uid ? 'single__chat__right' : 'single__chat__left'}>
									<p
										dangerouslySetInnerHTML={createMarkup(item.text)}
									></p>
								</div>
							)
						}
					</div>
					<div className='chat__container__editor'>
						<Editor
							editorState={editorState}
							onEditorStateChange={setEditorState}
							wrapperClassName="wrapper-class"
							editorClassName="editor-class"
							toolbarClassName="toolbar-class"
							toolbar={toolbarOptions}
						/>
						<button
							className='send__button'
							onClick={() => sendMessageHandler()}
						> Send message </button>
					</div>
				</div>

			</section>

		</div>
	)
}

export default Dashboard