<script setup>
    import { ref } from 'vue'
    import { getAuth, updateProfile, onAuthStateChanged, sendEmailVerification } from "firebase/auth";
    import { getFirestore, getDoc, doc, updateDoc, setDoc } from 'firebase/firestore';
    import { getStorage, ref as strRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
    const storage = getStorage();
    const auth = getAuth()
    const db = getFirestore();
    auth.languageCode = auth.useDeviceLanguage();

    var name = ref('')
    var email = ref('')
    var img = ref('')
    var brTel = ref('')
    var errorMsg = ref('')
    var infoMsg = ref('')
    var opisText = ref('')
    var loc = ref('')
    var userId = null

    var uploadProgress = ref(0)
    var uploadStatus = ref(false)

    onAuthStateChanged(auth, (user) => {
    if (user) {
        name.value = user.displayName;
        email.value = user.email;
        img.value = user.photoURL;
        userId = user.uid;
        getUserInfo();
    } else {
        name.value = '';
        brTel.value = '';
        email.value = '';
        img.value = '';
        userId = null;
    }
    });

    const updateUser = async() => {
        console.log(name.value, brTel.value)
        updateProfile(auth.currentUser, {
            displayName: name.value
        }).then(async () => {
            console.log('Name update successful')
        }).catch((error) => {
            errorMsg = error.message;
            console.log(errorMsg)
        });
    }

    const getUserInfo = async() => {
        if (userId != null) {
            const docRef = doc(db, "users", auth.currentUser.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                opisText.value = docSnap.data().opis;
                loc.value = docSnap.data().lokacija;
                brTel.value = docSnap.data().telefon;
            }
        }
    }

    const updateUserInfo = async() => {
        if (userId != null) {
            const docRef = doc(db, "users", auth.currentUser.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                await updateDoc(doc(db, "users", auth.currentUser.uid), {
                    opis: opisText.value,
                    lokacija: loc.value,
                    telefon: brTel.value
                });
            } else {
                await setDoc(doc(db, "users", auth.currentUser.uid), {
                    opis: opisText.value,
                    lokacija: loc.value,
                    telefon: brTel.value
                });
            }
        }
    }

    const updateAllInfo = async() => {
        await updateUser();
        await updateUserInfo();
        infoMsg.value = 'Uspešno ste izmenili Vaše podatke'
        setInterval(() => {
            infoMsg.value = ''
        }, 5000);
    }

    const handleFiles = (file) => {
        file = event.target.files[0];

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
                uploadProgress.value = progress;
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
                // Handle successful uploads on complete
                // For instance, get the download URL: https://firebasestorage.googleapis.com/...
                uploadStatus.value = false;
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    console.log('File available at', downloadURL);
                    img.value = downloadURL;

                    if (userId != null) {
                        updateProfile(auth.currentUser, {
                            photoURL: downloadURL
                        }).then(async () => {
                            console.log('Image update successful')
                        }).catch((error) => {
                            errorMsg = error.message;
                        });
                    }
                });
            }
        );
    }

    const sendEmailVer = async() => {
        sendEmailVerification(auth.currentUser)
            .then(() => {
                infoMsg.value = 'Uspešno ste poslali verifikacioni E-Mail';
                setInterval(() => {
                    infoMsg.value = ''
                }, 5000);
            });
    }
</script>

<template>
    <div class="card">
        <h3 class="defaultHeader mb-2">{{ auth.currentUser?.displayName }}</h3>
        <div class="grid gap-x-3 grid-cols-4">
            <div class="imageCard w-42 h-44 overflow-hidden">
                <img v-if="img" :src="img" class="rounded-lg object-center" referrerpolicy="no-referrer">
            </div>
            <div class="flex flex-col justify-between col-span-2">
                <div class="flex flex-col">
                    <span class="defaultText mb-1">E-Mail: {{ auth.currentUser?.email }}</span>
                    <div class="flex items-center">
                        <span class="defaultText mb-1">E-Mail verifikovan: </span>
                        <svg class="fill-orange-400 defaultText mb-1 ml-1" v-if="auth.currentUser?.emailVerified" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z"/></svg>
                        <svg class="fill-orange-400 defaultText mb-1 ml-1" v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path d="M23 20.168l-8.185-8.187 8.185-8.174-2.832-2.807-8.182 8.179-8.176-8.179-2.81 2.81 8.186 8.196-8.186 8.184 2.81 2.81 8.203-8.192 8.18 8.192z"/></svg>
                    </div>
                    <span class="defaultText mb-1">Broj telefona: {{ brTel }}</span>
                    <span class="defaultText mb-1">Lokacija: {{ loc }}</span>
                </div>
                <div>
                    <button type="button" class="defaultButton" @click="$refs.file.click()">
                        <div class="flex items-center">
                            <span class="defaultLightText">Izmenite Vašu sliku</span>
                            <svg class="animate-spin ml-1 h-5 w-5 text-white" v-if="uploadStatus" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                    </button>
                    <span class="defaultItalicText">Maksimum 2 MB</span>
                    <input type="file" ref="file" @change="handleFiles"  style="display:none;">
                </div>
            </div>
        </div>
        <div class="grid gap-x-2 grid-cols-2 mt-2">
            <label class="flex flex-col">
                <span class="defaultText">Ime i prezime:</span>
                <input class="defaultInput" v-model="name" type="text" placeholder="Unesite Vaše ime i prezime">
                <div>
                    <span class="defaultText">Broj telefona:</span>
                    <span class="float-right defaultItalicText">Opcionalno</span>
                </div>
                <input class="defaultInput" v-model="brTel" type="text" placeholder="Unesite Vaš broj telefona">
            </label>
            <label class="flex flex-col">
                <span class="defaultText">E-Mail:</span>
                <input class="defaultInput disabled:opacity-50 italic" v-model="email" type="email" placeholder="Unesite E-Mail adresu" readonly disabled>
                <div>
                    <span class="defaultText">Vaša lokacija:</span>
                    <span class="float-right defaultItalicText">Opcionalno</span>
                </div>
                <input class="defaultInput" v-model="loc" type="text" placeholder="Unesite Vašu lokaciju">
            </label>
        </div>
        <label class="flex flex-col mt-2">
            <div>
                <span class="defaultText">Kratak opis o Vama:</span>
                <span class="float-right defaultItalicText">Opcionalno</span>
            </div>
            <textarea class="defaultInput" v-model="opisText" cols="30" rows="5"></textarea>
        </label>
        <div class="mt-2">
            <button class="defaultButton" @click="updateAllInfo"><span class="defaultLightText">Sačuvaj izmene</span></button>
            <button class="defaultButton" @click="sendEmailVer" v-if="!auth.currentUser?.emailVerified"><span class="defaultLightText">Pošalji verifikacioni E-Mail</span></button>
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
    <button type="button" className="bg-indigo-500" disabled>
        
    </button>
</template>