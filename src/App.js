// Importing libraries
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from "firebase/auth";

// Importing components
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';

// Importing config
import { auth } from './firebase/firebase-config.js';

// Importing style
import './App.css';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

function App() {

  // States
  const [isAuth, setIsAuth] = useState("loading");
  const [userDetails, setUserDetails] = useState();


  // UseEffect for login checking
  useEffect(async () => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserDetails(user);
      setIsAuth(user ? "loggedIn" : "notLoggedIn");
    });

    return () => unsubscribe();
  }, []);


  if (isAuth === "loading") {
    return (
      <div className='container'>
        <h3>Loading...</h3>
      </div>
    );
  }

  if (isAuth === "loggedIn") {
    return <Dashboard isAuth={isAuth} userDetails={userDetails} />;
  }

  return (
    <div className='app__container'>
      <Auth />
    </div>
  );
}

export default App;
