// Importing libraries
import React, { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';

// Importing config
import { auth, db, provider } from "../firebase/firebase-config.js";


function Auth() {
	
	// States
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [errorMessage, setErrorMessage] = useState('');

	// Refs
	const usersRef = collection(db, "users");

	// Function for google login
	// const signInWithGoogle = async () => {
	// 	try {
	// 		const response = await signInWithPopup(auth, provider);
	// 		console.log("result =====> ", response);
	// 	} catch (error) {
	// 		console.error(error)
	// 	}
	// }

	// Function for login
	const handleLogin = async (e) => {
		e.preventDefault();
		try {
			const response = await signInWithEmailAndPassword(auth, email, password);
		} catch (error) {
			setErrorMessage(error.message);
		}
	};

	// Function for register
	const handleRegister = async (e) => {
		e.preventDefault();
		try {
			const userCredential = await createUserWithEmailAndPassword(auth, email, password);
			await addDoc(usersRef, {
				uid: userCredential.user.uid,
				email: email
			});

		} catch (error) {
			setErrorMessage(error.message);
		}
	};

	return (


		<div>
			<h1>Login or Register</h1>
			<form onSubmit={handleLogin}>
				<input
					type="email"
					placeholder="Email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					required
				/>
				<input
					type="password"
					placeholder="Password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					required
				/>
				<button type="submit">Login</button>
			</form>
			<form onSubmit={handleRegister}>
				<input
					type="email"
					placeholder="Email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					required
				/>
				<input
					type="password"
					placeholder="Password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					required
				/>
				<button type="submit">Register</button>
			</form>
			{errorMessage && <p>{errorMessage}</p>}

			{/* <div>
				<p>Sign in with Google to continue</p>
				<button onClick={signInWithGoogle}>Sign In With Google</button>
			</div> */}
		</div>
	)
}

export default Auth;