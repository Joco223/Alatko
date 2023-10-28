<script setup>
    import { initializeApp } from "firebase/app";
    import { getAuth, setPersistence, browserSessionPersistence } from "firebase/auth";

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
    const auth = getAuth()

    await setPersistence(auth, browserSessionPersistence).catch((error) => {console.log(error)})

</script>

<template>
    <div class="container items-center flex flex-col mx-auto">
        <div class="w-1/2">
            <h2 class="text-6xl self-start font-bold text-orange-400 mb-6 mt-12">Alatko</h2>
            <NuxtPage/>
        </div>
    </div>
</template>
