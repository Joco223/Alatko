<script setup>
  import { initializeApp } from "firebase/app";
  import { getAuth, onAuthStateChanged } from "firebase/auth";

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

  onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/auth.user
    const uid = user.uid;
    // ...
  } else {
    // User is signed out
    // ...
  }});
  
</script>

<template>
  <div>
    <NuxtPage/>
  </div>
</template>
