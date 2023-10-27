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
    <div class="grid gap-x-4 gap-y-4 grid-cols-3">
        <div class="card col-span-2">
            <h3 class="defaultHeader mb-2">Oglasi</h3>
        </div>
        <div class="card col-span-1">
            <h3 class="defaultHeader mb-2">Vaš profil</h3>
            <div v-if="loggedIn">
                <div class="grid grid-cols-2 mb-2">
                    <img v-if="pageUser?.photoURL" :src="pageUser?.photoURL" class="imageCard w-24 h-24" referrerpolicy="no-referrer">
                    <div class="flex flex-col">
                        <h6 class="defaultMediumHeader mb-1">{{ pageUser?.displayName }}</h6>
                    </div>
                </div>
                <NuxtLink to="/user/edit" v-if="loggedIn" class="">
                    <button class="defaultButton"><span class="defaultLightText">Izmeni profil</span></button>
                </NuxtLink>
                <button @click="logOut" v-if="loggedIn" class="defaultButton"><span class="defaultLightText">Log out</span></button>
                <div class="grid grid-cols-2">
                </div>
            </div>
            <div v-else>
                <NuxtLink to="/user/login">
                    <button class="defaultButton"><span class="defaultLightText">Uloguj se</span></button>
                </NuxtLink>
                <NuxtLink to="/user/register">
                    <button class="defaultButton"><span class="defaultLightText">Registruj se</span></button>
                </NuxtLink>
            </div>
        </div>
    </div>
</template>