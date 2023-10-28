<script setup>
    import {ref as vueRef} from 'vue'
    import { getAuth, onAuthStateChanged } from "firebase/auth";
    import { getStorage  } from 'firebase/storage';
    var auth = getAuth()
    var storage = getStorage();
    auth.languageCode = auth.useDeviceLanguage();

    var loggedIn = vueRef(false);
    var pageUser = vueRef(auth.currentUser);
    var img = vueRef('');

    onAuthStateChanged(auth, (user) => {
    if (user) {
        pageUser = user;
        loggedIn.value = true;
        if (user.photoURL == null) {
            img.value = 'https://dummyimage.com/400/7d7d7d/212121&text=Nema+slike';
        } else {
            img.value = user.photoURL;
        }
    } else {
        pageUser = null;
        loggedIn.value = false;
        img.value = 'https://dummyimage.com/400/7d7d7d/212121&text=Nema+slike';
    }
    });

    const logOut = () => {
        auth.signOut().then(() => {
            loggedIn.value = false;
        }).catch((error) => {
            errorMsg = error.message;
        });
    }
</script>

<template>
    <div class="grid gap-x-4 gap-y-4 grid-cols-3">
        <div class="card col-span-2">
            <h3 class="defaultHeader mb-2">Pretraži oglase</h3>
        </div>
        <div class="cardSmallPadding">
            <h3 class="defaultHeader mb-2">Vaš profil</h3>
            <div v-if="loggedIn">
                <div class="grid gap-y-2 gap-x-2 grid-cols-2">
                    <img :src="img" class="imageCard w-full h-26" referrerpolicy="no-referrer">
                    <span class="defaultMediumHeader mb-1">{{ pageUser?.displayName }}</span>
                    <NuxtLink to="/user/newOglas" v-if="loggedIn" class="w-full">
                        <button class="confirmButton w-full"><span class="defaultLightGreenText">Novi oglas</span></button>
                    </NuxtLink>
                    <NuxtLink to="/user/oglasi" v-if="loggedIn" class="w-full">
                        <button class="defaultButton w-full"><span class="defaultLightText">Oglasi</span></button>
                    </NuxtLink>
                    <NuxtLink to="/user/edit" v-if="loggedIn" class="w-full">
                        <button class="defaultButton w-full"><span class="defaultLightText">Izmeni profil</span></button>
                    </NuxtLink>
                    <button @click="logOut" v-if="loggedIn" class="defaultButton w-full"><span class="defaultLightText">Log out</span></button>
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