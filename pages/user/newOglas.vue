<script setup>
    import { ref } from 'vue'
    import { getAuth, updateProfile, onAuthStateChanged, sendEmailVerification, reauthenticateWithCredential, EmailAuthProvider, reauthenticateWithPopup, OAuthProvider } from "firebase/auth";
    import { getFirestore, getDoc, doc, updateDoc, setDoc } from 'firebase/firestore';
    import { getStorage, ref as strRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
    const storage = getStorage();
    const auth = getAuth()
    const db = getFirestore();
    auth.languageCode = auth.useDeviceLanguage();

    var errorMsg = ref('')
    var infoMsg = ref('')
    var userId = null

    var uploadStatus = ref(false)

    var mainImg = ref('https://dummyimage.com/400/7d7d7d/212121&text=Nema+slike')
    var imgUrls = []
    var oglasName = ref('')
    var cena = ref(0)
    var kategorija = ref(1)
    var oglasOpis = ref('')

    onAuthStateChanged(auth, (user) => {
    if (user) {
        userId = user.uid;
    } else {
        userId = null;
    }
    });

    const handleFiles = () => {
        var files = event.target.files;
        var urls = [];

        files.forEach(file => {
            errorMsg.value = '';
            if (file.size > 1024 * 1024 * 2) {
                errorMsg.value = 'Slika ne sme biti veća od 2 MB';
                setInterval(() => {
                    errorMsg.value = ''
                }, 5000);
                return;
            }
    
            var storageRef = strRef(storage, 'userImages/' + auth.currentUser.uid);
            var uploadTask = uploadBytesResumable(storageRef, file);
    
            uploadTask.on('state_changed',
                (snapshot) => {
                    // Observe state change events such as progress, pause, and resume
                    // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                    var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    switch (snapshot.state) {
                        case 'paused':
                            uploadImagesStatus.value = false;
                            break;
                        case 'running':
                            uploadImagesStatus.value = true;
                            break;
                    }
                },
                (error) => {
                    console.log(error.message)
                },
                () => {
                    // Handle successful uploads on complete
                    // For instance, get the download URL: https://firebasestorage.googleapis.com/...
                    uploadStatus.value = false;
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        console.log('File available at', downloadURL);
                        urls.push(downloadURL);
                    });
                });
        });

        imgUrls = urls;
    };

    const handleFile = () => {
        file = event.target.files[0];

        errorMsg.value = '';
        if (file.size > 1024 * 1024 * 2) {
            errorMsg.value = 'Slika ne sme biti veća od 2 MB';
            setInterval(() => {
                errorMsg.value = ''
            }, 5000);
            return;
        }

        var storageRef = strRef(storage, 'oglasImages/' + auth.currentUser.uid);
        var uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed',
            (snapshot) => {
                // Observe state change events such as progress, pause, and resume
                // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                switch (snapshot.state) {
                    case 'paused':
                        uploadStatus.value = false;
                        break;
                    case 'running':
                        uploadStatus.value = true;
                        break;
                }
            },
            (error) => {
                console.log(error.message)
            },
            () => {
                uploadStatus.value = false;
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    console.log('File available at', downloadURL);
                    mainImg.value = downloadURL;
                });
            }
        );
    }
</script>

<template>
    <div class="card">
        <h3 class="defaultHeader mb-2">Novi oglas</h3>
        <div class="grid gap-x-3 grid-cols-4">
            <img :src="mainImg" class="imageCard w-42 h-44 overflow-hidden" referrerpolicy="no-referrer">
            <div class="flex flex-col justify-between col-span-2">
                <div class="flex flex-col">
                    <span class="defaultText">Naziv oglasa:</span>
                    <input class="defaultInput" type="text" v-model="oglasName" placeholder="Unesite naziv oglasa">
                </div>
                <div>
                    <button type="button" class="defaultButton" @click="$refs.file.click()">
                        <div class="flex items-center">
                            <span class="defaultLightText">Izmenite sliku oglasa</span>
                            <svg class="animate-spin ml-1 h-5 w-5 text-white" v-if="uploadStatus" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                    </button>
                    <span class="defaultItalicText">Maksimum 2 MB</span>
                    <input type="file" ref="file" @change="handleFiles" style="display:none;">
                </div>
            </div>
        </div>
        <div class="grid gap-x-2 grid-cols-2 mt-2">
            <label class="flex flex-col">
                <div>
                    <span class="defaultText">Cena:</span>
                    <span class="float-right defaultItalicText">U RSD</span>
                </div>
                <input class="defaultInput" type="number" v-model="cena" placeholder="Unesite cenu">
            </label>
            <label class="flex flex-col">
                <span class="defaultText">Kategorija:</span>
                <select class="defaultInput" v-model="kategorija">
                    <option value="1" selected>Automobili</option>
                    <option value="2">Nekretnine</option>
                    <option value="3">Računari</option>
                    <option value="4">Mobilni telefoni</option>
                    <option value="5">Kućni ljubimci</option>
                    <option value="6">Ostalo</option>
                </select>
            </label>
        </div>
        <label class="flex flex-col mt-2">
            <div>
                <span class="defaultText">Kratak opis o oglasu:</span>
                <span class="float-right defaultItalicText">Opcionalno</span>
            </div>
            <textarea class="defaultInput" v-model="oglasOpis" cols="30" rows="5"></textarea>
        </label>
        <div class="mt-2">
            <button class="defaultButton" @click="updateAllInfo"><span class="defaultLightText">Sačuvaj izmene</span></button>
            <NuxtLink to="/" class="float-right">
                <button class="defaultButton"><span class="defaultLightText">Nazad</span></button>
            </NuxtLink>
        </div>
    </div>
    <div v-if="errorMsg" class="errorCard mt-2 text-center">
        <span class="defaultText">Došlo je do greške: {{ errorMsg }}</span>
    </div>
    <div v-else-if="infoMsg" class="card mt-2 text-center">
        <span class="defaultText">{{ infoMsg }}</span>
    </div>
</template>