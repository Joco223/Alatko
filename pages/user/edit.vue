<script setup>
    import { ref } from 'vue'
    import { getAuth, updateProfile, onAuthStateChanged, sendEmailVerification, reauthenticateWithCredential, EmailAuthProvider, reauthenticateWithPopup, OAuthProvider } from "firebase/auth";
    import { getFirestore, getDoc, getDocs, doc, updateDoc, setDoc, collection, where, query } from 'firebase/firestore';
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

    var uploadStatus = ref(false)

    var confirmPass = ref(false)
    var password = ref('')
    var confirmDelete = ref(false)

    onAuthStateChanged(auth, (user) => {
    if (user) {
        name.value = user.displayName;
        email.value = user.email;
        if (user.photoURL == null) {
            img.value = 'https://dummyimage.com/400/7d7d7d/212121&text=Nema+slike';
        } else {
            img.value = user.photoURL;
        }
        userId = user.uid;
        getUserInfo();
    } else {
        name.value = '';
        brTel.value = '';
        email.value = '';
        img.value = 'https://dummyimage.com/400/7d7d7d/212121&text=Nema+slike';
        userId = null;
    }
    });

    const updateUser = async() => {
        console.log(name.value,)
        updateProfile(auth.currentUser, {
            displayName: name.value
        }).then(async () => {
            console.log('Name update successful')
        }).catch((error) => {
            errorMsg = error.message;
            console.log(errorMsg)
        });

        var docRef = query(collection(db, "oglasi"), where("user", "==", auth.currentUser.uid));
        await getDocs(docRef).then((querySnapshot) => {
            querySnapshot.forEach(async(docs) => {
                await updateDoc(doc(db, "oglasi", docs.id), {
                    userNaziv: name.value
                });
            });
        }).catch((error) => {
            console.log("Error getting documents: ", error);
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
        setTimeout(() => {
            infoMsg.value = ''
        }, 5000);
    }

    const handleFiles = (file) => {
        file = event.target.files[0];

        errorMsg.value = '';
        if (file.size > 1024 * 1024 * 2) {
            errorMsg.value = 'Slika ne sme biti veća od 2 MB';
            setTimeout(() => {
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
                setTimeout(() => {
                    infoMsg.value = ''
                }, 5000);
            });
    }

    const deleteUserOglasi = async() => {
        var docRef = collection(db, "oglasi").where('user', '==', auth.currentUser.uid);
        await getDocs(docRef).then((querySnapshot) => {
            querySnapshot.forEach(async(docs) => {
                docs.ref.delete();
            });
        }).catch((error) => {
            console.log("Error getting documents: ", error);
        });
    }


    const deleteUser = () => {
        if (auth.currentUser.providerData[0].providerId == 'password') {
            confirmPass.value = true;
        }else{
            var provider = new OAuthProvider(auth.currentUser.providerData[0].providerId);
            reauthenticateWithPopup(auth.currentUser, provider).then(() => {
                // User re-authenticated.
                console.log('reauthenticated')
                deleteUserOglasi();
                auth.currentUser.delete().then(() => {
                    // User deleted.
                    console.log('user deleted')
                    navigateTo('/')
                }).catch((error) => {
                    console.log('error', error)
                    errorMsg.value = error.code + ' ' + error.message;
                });
            }).catch((error) => {
                console.log('error', error)
                errorMsg.value = error.code + ' ' + error.message;
            });
        }
        
    }
    const verifyDelete = async () => {
        var credential = EmailAuthProvider.credential(
            auth.currentUser.email,
            password.value
        );

        reauthenticateWithCredential(auth.currentUser, credential).then(() => {
            deleteUserOglasi();
            auth.currentUser.delete().then(() => {
                console.log('user deleted')
                navigateTo('/')
            }).catch((error) => {
                console.log('error', error)
                errorMsg.value = error.code + ' ' + error.message;
            });
        }).catch((error) => {
            console.log('error', error)
            errorMsg.value = error.code + ' ' + error.message;
        });
    }
</script>

<style>
    @media screen and (max-width: 768px) {
        .grid {
            grid-template-columns: 1fr;
        }
    }
</style>

<template>
    <div v-if="confirmPass" class="card w-1/2 mx-auto">
        <h3 class="defaultSmallHeader mb-2">Unesite Vašu šifru da bi potvrdili identitet</h3>
        <div class="flex flex-col mb-2">
            <label class="defaultText mb-1" for="password">Šifra:</label>
            <input type="password" class="defaultInput" v-model="password" placeholder="Šifra" autocomplete="confirm-password">
        </div>
        <div class="flex justify-between items-center mt-2">
            <button class="defaultButton" @click="verifyDelete"><span class="defaultLightText">Potvrdi</span></button>
            <button class="defaultButton" @click="confirmPass = false; password = ''; confirmDelete = false"><span class="defaultLightText">Nazad</span></button>
        </div>
    </div>
    <div v-else class="card">
        <h3 class="defaultHeader mb-2">{{ auth.currentUser?.displayName }}</h3>
        <div class="grid gap-x-3 grid-cols-4">
            <img :src="img" class="imageCard w-full col-span-2 md:col-span-1 md:w-42 md:h-44 overflow-hidden" referrerpolicy="no-referrer">
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
            <div class="flex flex-col gap-y-2">
                <button class="defaultButton w-full" @click="sendEmailVer" v-if="!auth.currentUser?.emailVerified"><span class="defaultLightText">Pošalji verifikacioni E-Mail</span></button>
                <NuxtLink to="/user/changePassword" class="w-full mt-2">
                    <button class="defaultButton w-full"><span class="defaultLightText">Promeni lozinku</span></button>
                </NuxtLink>
                <button v-if="!confirmDelete" class="warningButton w-full" @click="confirmDelete = true"><span class="defaultLightText">Obriši nalog</span></button>
                <div v-else class="flex flex-col">
                    <span class="defaultText mb-1">Da li ste sigurni?</span>
                    <div class="grid gap-x-2 grid-cols-2">
                        <button class="warningButton w-full" @click="deleteUser"><span class="defaultLightText">Obriši</span></button>
                        <button class="defaultButton w-full mt-2 md:mt-0" @click="confirmDelete = false"><span class="defaultLightText">Nazad</span></button>
                    </div>
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
        <div class="mt-2 flex flex-col md:flex-row md:justify-end">
            <button class="defaultButton w-full md:w-1/5" @click="updateAllInfo"><span class="defaultLightText">Sačuvaj izmene</span></button>
            <NuxtLink to="/" class="float-right">
                <button class="defaultButton mt-2 w-full md:1/5 md:mt-0"><span class="defaultLightText">Nazad</span></button>
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