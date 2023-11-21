import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserSessionPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBRBLnKvsCP8WtkaXXqWfg9nvwzePRZjt4",
    authDomain: "alatko-223.firebaseapp.com",
    projectId: "alatko-223",
    storageBucket: "alatko-223.appspot.com",
    messagingSenderId: "857495608080",
    appId: "1:857495608080:web:d972739c47c88962832395",
    measurementId: "G-9K9DQR3T9Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

await setPersistence(auth, browserSessionPersistence).catch((error) => {console.log(error)})

export function initApp() {
    return app;
}

export {app, auth, db}