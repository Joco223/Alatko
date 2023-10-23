<script setup>
    import { ref } from 'vue'
    import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, setPersistence, browserSessionPersistence } from "firebase/auth";
    const auth = getAuth()
    const provider = new GoogleAuthProvider();
    auth.languageCode = auth.useDeviceLanguage();

    const email = ref('')
    const password = ref('')
    var errorMsg = ref('')

    setPersistence(auth, browserSessionPersistence).catch((error) => {console.log(error)})

    const logInUser = async() => {
        signInWithEmailAndPassword(auth, email.value, password.value)
        .then((userCredential) => {
            // Signed in 
            const user = userCredential.user;
            console.log('Log in')
            console.log(user)

            navigateTo('/');
        })
        .catch((error) => {
            const errorCode = error.code;
            errorMsg = error.message;
            console.log(errorMsg)
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

</script>

<template>
    <h2>Ovo je stranica za log in</h2>

    <input v-model="email" type="email" placeholder="Unesite E-Mail adresu"><br>
    <input v-model="password" type="password" placeholder="Unesite lozinku"><br>
    <button @click="logInUser">Uloguj se</button><br>
    <button @click="logInWithGoogle">Uloguj se sa guglom</button><br>
    <NuxtLink to="/user/register">Registruj se</NuxtLink><br>
    <div>{{ errorMsg }}</div>
</template>