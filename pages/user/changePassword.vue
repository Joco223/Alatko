<script setup>
    import { ref } from 'vue'
    import { getAuth, onAuthStateChanged, reauthenticateWithCredential, EmailAuthProvider, reauthenticateWithPopup, OAuthProvider, updatePassword } from "firebase/auth";
    const auth = getAuth()
    auth.languageCode = auth.useDeviceLanguage();

    const email = ref('')
    const password = ref('')
    const passwordConfirm = ref('')
    var errorMsg = ref('')
    var confirmPass = ref(false)
    var changePass = ref(false)

    onAuthStateChanged(auth, (user) => {
    if (user) {
        verifyUser();
    } else {
        confirmPass.value = false;
    }
    });

    const verifyUser = async () => {
        if (auth.currentUser.providerData[0].providerId == 'password') {
            confirmPass.value = true;
        }else{
            var provider = new OAuthProvider(auth.currentUser.providerData[0].providerId);
            await reauthenticateWithPopup(auth.currentUser, provider).then(() => {
                console.log('reauthenticated')
                changePass.value = true;
            }).catch((error) => {
                console.log('error', error)
                errorMsg.value = error.code + ' ' + error.message;
            });
        }
        
    }
    
    const verifyPass = async () => {
        var credential = EmailAuthProvider.credential(
            auth.currentUser.email,
            password.value
        );

        await reauthenticateWithCredential(auth.currentUser, credential).then(() => {
            changePass = true;
        }).catch((error) => {
            console.log('error', error)
            errorMsg.value = error.code + ' ' + error.message;
        });
    }

    const changePassword = async () => {
        if (password.value != passwordConfirm.value) {
            errorMsg.value = 'Šifre se ne poklapaju';
        }else{
            updatePassword(auth.currentUser, password.value).then(() => {
                navigateTo('/user/edit')
            }).catch((error) => {
                console.log('error', error)
                errorMsg.value = error.code + ' ' + error.message;
            });
        }
    }

</script>

<template>
    
    <div v-if="confirmPass" class="card w-1/2 mx-auto">
        <h3 class="defaultSmallHeader mb-2">Unesite Vašu šifru da bi potvrdili identitet</h3>
        <div class="flex flex-col mb-2">
            <label class="defaultText mb-1" for="password">Šifra:</label>
            <input type="password" class="defaultInput" v-model="password" placeholder="Šifra" autocomplete="confirm-password">
        </div>
        <div class="flex justify-between items-center mt-2">
            <button class="defaultButton" @click="verifyPass"><span class="defaultLightText">Potvrdi</span></button>
            <NuxtLink to="/user/edit" class="float-right">
                <button class="defaultButton"><span class="defaultLightText">Nazad</span></button>
            </NuxtLink>
        </div>
    </div>
    <div v-if="changePass" class="card flex flex-col">
        <span class="defaultHeader mb-4">Promena šifre</span>
        <div class="grid gap-x-2 grid-cols-2">
            <label class="flex flex-col">
                <span class="defaultText">Nova šifra:</span>
                <input class="defaultInput" v-model="password" type="password" placeholder="Unesite novu šifru">
            </label>
            <label class="flex flex-col">
                <span class="defaultText">Ponovite novu šifru:</span>
                <input class="defaultInput" v-model="passwordConfirm" type="password" placeholder="Ponovite novu šifru">
            </label>
        </div>
        <div class="mt-2">
            <button class="defaultButton" @click="changePassword"><span class="defaultLightText">Promeni šifru</span></button>
            <NuxtLink to="/user/edit" class="float-right">
                <button class="defaultButton"><span class="defaultLightText">Nazad</span></button>
            </NuxtLink>
        </div>
    </div>
    <div v-else class="card w-3/4 mx-auto mt-12">
        <div class="flex flex-col items-center">
            <span class="defaultHeader">Čekanje potvrde identiteta</span>
        </div>
    </div>
    <div v-if="errorMsg" class="errorCard mt-2 text-center">
        <div class="flex flex-col items-center">
            <span class="defaultText mb-2">Došlo je do greške: {{ errorMsg }}</span>
            <NuxtLink to="/user/edit" class="float-right">
                <button class="defaultButton"><span class="defaultLightText">Nazad</span></button>
            </NuxtLink>
        </div>
    </div>
</template>