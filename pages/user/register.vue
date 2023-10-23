<script setup>
    import { ref } from 'vue'
    import { getAuth, createUserWithEmailAndPassword, sendEmailVerification, GoogleAuthProvider, signInWithPopup, updateProfile } from "firebase/auth";
    const auth = getAuth()
    const provider = new GoogleAuthProvider();
    auth.languageCode = auth.useDeviceLanguage();
    console.log(auth.currentUser)

    const name = ref('')
    const email = ref('')
    const password = ref('')
    var errorMsg = ref('')

    // const getUser = async() => {
    //     console.log(auth.currentUser)
    // }

    const registerUser = async() => {
        createUserWithEmailAndPassword(auth, email.value, password.value)
            .then((userCredential) => {
                const user = userCredential.user;
                console.log('Register')
                console.log(user)

                updateProfile(auth.currentUser, {
                    displayName: name.value
                }).then(() => {
                    console.log('Name update successful')
                }).catch((error) => {
                    errorMsg = error.message;
                });

                verifyEmail();
                navigateTo('/user/login');
            })
            .catch((error) => {
                const errorCode = error.code;
                errorMsg = error.message;
            });
    }

    const verifyEmail = async() => {
        sendEmailVerification(auth.currentUser)
            .then(() => {
                console.log('Verification email sent')
            });
    }

    const logInWithGoogle = async() => {
        signInWithPopup(auth, provider)
            .then((result) => {
                // This gives you a Google Access Token. You can use it to access the Google API.
                const credential = GoogleAuthProvider.credentialFromResult(result);
                const token = credential.accessToken;
                // The signed-in user info.
                const user = result.user;
                console.log('google log in')
                console.log(credential)
                console.log(user)
                navigateTo('/');
            }).catch((error) => {
                // Handle Errors here.
                const errorCode = error.code;
                errorMsg = error.message;
            });
    }

    // const logOut = async() => {
    //     signOut(auth).then(() => {
    //         console.log('logout')
    //     }).catch((error) => {
    //         errorMsg = error.message;
    //     });
    // }
</script>

<template>
    <h2>Ovo je stranica za registraciju</h2>

    <input v-model="name" type="text" placeholder="Unesite Vaše ime i prezime"><br>
    <input v-model="email" type="email" placeholder="Unesite E-Mail adresu"><br>
    <input v-model="password" type="password" placeholder="Unesite lozinku"><br>
    <button @click="registerUser">Registruj se</button><br>
    <button @click="logInWithGoogle">Registuj se sa guglom</button><br>
    <NuxtLink to="/user/login">Uloguj se</NuxtLink><br>
    <div>{{ errorMsg }}</div>
</template>