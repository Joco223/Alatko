<script setup>
    import {ref as vueRef} from 'vue'
    import { getAuth, onAuthStateChanged } from "firebase/auth";
    import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
    var auth = getAuth()
    var storage = getStorage();
    auth.languageCode = auth.useDeviceLanguage();

    var loggedIn = vueRef(false);
    var uploadProgress = vueRef(0);
    var uploadStatus = vueRef('Not uploading');
    var uploadPath = vueRef('');
    var pageUser = vueRef(auth.currentUser);

    console.log('page user', auth.currentUser)

    onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/auth.user
        const uid = user.uid;
        pageUser = user;
        loggedIn.value = true;
    } else {
        // User is signed out
        pageUser = null;
        loggedIn.value = false;
    }
    });
    
    const getLoggedIn = () => {
        var val = auth.currentUser != null ? true : false;
        console.log('checking log in', val)
        loggedIn.value = val;
    };
    
    getLoggedIn();

    const logOut = () => {
        auth.signOut().then(() => {
            loggedIn.value = false;
        }).catch((error) => {
            errorMsg = error.message;
        });
    }

    const handleFiles = (file) => {
        file = event.target.files[0];
        var storageRef = ref(storage, 'oglasImages/' + file.name);
        var uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed',
            (snapshot) => {
                // Observe state change events such as progress, pause, and resume
                // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                uploadProgress.value = progress;
                switch (snapshot.state) {
                    case 'paused':
                        uploadStatus.value = 'Paused';
                        break;
                    case 'running':
                        uploadStatus.value = 'Uploading';
                        break;
                }
            },
            (error) => {
                console.log(error.message)
            },
            () => {
                // Handle successful uploads on complete
                // For instance, get the download URL: https://firebasestorage.googleapis.com/...
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    console.log('File available at', downloadURL);
                    uploadPath.value = downloadURL;
                });
            }
        );
        // uploadBytes(storageRef, file).then((snapshot) => {
        //     console.log('Uploaded a blob or file!');
        // });
    }
</script>

<template>
    <h2>Ovo je prva stranica</h2>
    <div v-if="loggedIn">
        <h4>Korisnicko ime: {{ pageUser?.displayName }}</h4>
        <NuxtLink to="/user/edit" v-if="loggedIn">Izmeni korisnicko ime</NuxtLink><br>
        <h4>E-Mail: {{ pageUser?.email }}</h4>
        <h4>E-Mail verifikovan: {{ pageUser?.emailVerified }}</h4>
        <button @click="logOut" v-if="loggedIn">Log out</button>
        <br>
        <br>
        <br>
        <input type="file" id="fileElem" accept="image/*" @change="handleFiles(this)">
        <h5> Upload status - {{ uploadProgress }}%</h5>
        <img :src="uploadPath" v-if="uploadPath != ''">
    </div>
    <div v-else>
        <NuxtLink to="/user/register">Registruj se</NuxtLink><br>
        <NuxtLink to="/user/login">Uloguj se</NuxtLink>
    </div>
</template>