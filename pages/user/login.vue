<script setup>
    import { ref } from 'vue'
    import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from "firebase/auth";
    const auth = getAuth()
    auth.languageCode = auth.useDeviceLanguage();

    const email = ref('')
    const password = ref('')
    var errorMsg = ref('')
    var infoMsg = ref('')

    const logInUser = async() => {
        signInWithEmailAndPassword(auth, email.value, password.value)
        .then((userCredential) => {
            // Signed in 
            const user = userCredential.user;
            console.log('Log in')
            navigateTo('/');
        })
        .catch((error) => {
            const errorCode = error.code;
            errorMsg.value = error.message;
            console.log(errorCode, errorMsg)
        });
    }

    const logInWithGoogle = async() => {
        const provider = new GoogleAuthProvider();
        signInWithPopup(auth, provider)
            .then((result) => {
                console.log('google log in')
                navigateTo('/');
            }).catch((error) => {
                const errorCode = error.code;
                errorMsg.value = error.message;
                console.log(errorCode, errorMsg)
            });
    }

    const forgotPassword = async() => {
        sendPasswordResetEmail(auth, email.value)
            .then(() => {
                infoMsg.value = 'Mail za resetovanje šifre je poslat'
                setTimeout(() => {
                    infoMsg.value = ''
                }, 5000);
            })
            .catch((error) => {
                const errorCode = error.code;
                errorMsg.value = error.message;
                console.log(errorCode, errorMsg)
            });
    }

</script>

<template>
    <div class="card flex flex-col w-2/5">
        <h5 class="defaultHeader mb-4">Log In</h5>
        <div class="grid gap-x-2 grid-cols-2">
            <label class="flex flex-col">
                <span class="defaultText">E-Mail:</span>
                <input class="defaultInput" v-model="email" type="email" placeholder="Unesite E-Mail adresu">
            </label>
            <label class="flex flex-col">
                <span class="defaultText">Lozinka:</span>
                <input class="defaultInput" v-model="password" type="password" placeholder="Unesite lozinku">
            </label>
        </div>
        
        <div class="flex gap-x-1 mt-4">
            <button class="defaultButton" @click="logInUser"><span class="defaultLightText">Uloguj se</span></button>
            <button class="defaultButton" @click="logInWithGoogle">
                <svg class="fill-orange-100" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="25" height="25" viewBox="0 0 50 50">
                    <path d="M 25.996094 48 C 13.3125 48 2.992188 37.683594 2.992188 25 C 2.992188 12.316406 13.3125 2 25.996094 2 C 31.742188 2 37.242188 4.128906 41.488281 7.996094 L 42.261719 8.703125 L 34.675781 16.289063 L 33.972656 15.6875 C 31.746094 13.78125 28.914063 12.730469 25.996094 12.730469 C 19.230469 12.730469 13.722656 18.234375 13.722656 25 C 13.722656 31.765625 19.230469 37.269531 25.996094 37.269531 C 30.875 37.269531 34.730469 34.777344 36.546875 30.53125 L 24.996094 30.53125 L 24.996094 20.175781 L 47.546875 20.207031 L 47.714844 21 C 48.890625 26.582031 47.949219 34.792969 43.183594 40.667969 C 39.238281 45.53125 33.457031 48 25.996094 48 Z"></path>
                </svg>
            </button>
        </div>

        <div class="flex gapx-x-1 mt-4">
            <span class="defaultText">
                Nemate nalog?
                <NuxtLink to="/user/register">
                    <button class="defaultButton ml-2"><span class="defaultLightText">Registruj se</span></button>
                </NuxtLink>
            </span>
            <button class="defaultButton"><span class="defaultLightText" @click="forgotPassword">Zaboravili ste lozinku?</span></button>
            <div class="grow">
                <NuxtLink to="/" class="float-right">
                    <button class="defaultButton"><span class="defaultLightText">Nazad</span></button>
                </NuxtLink>
            </div>
        </div>
    </div>
    <div v-if="infoMsg" class="card mt-2 text-center">
        <span class="defaultText">{{ infoMsg }}</span>
    </div>
    <div v-if="errorMsg" class="errorCard mt-2 text-center">
        <span class="defaultText">Došlo je do greške: {{ errorMsg }}</span>
    </div>
</template>