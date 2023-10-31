<script setup>
    import { ref, onMounted } from 'vue'
    import { getAuth, onAuthStateChanged  } from "firebase/auth";
    import { getFirestore, getDoc, setDoc, doc } from 'firebase/firestore';
    import { getStorage, ref as strRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
    import { v4 as uuidv4 } from 'uuid';
    const storage = getStorage();
    const auth = getAuth()
    const db = getFirestore();
    auth.languageCode = auth.useDeviceLanguage();

    var errorMsg = ref('')
    var infoMsg = ref('')
    var userId = null

    var uploadStatus = ref(false)

    var mainImg = ref('https://dummyimage.com/400/7d7d7d/212121&text=Nema+slike')
    var oglasName = ref('')
    var cena = ref(0)
    var izabranaKat = ref(null)
    var oglasOpis = ref('')
    var kategorija = ref({})

    const docRef = doc(db, "kategorije", "kategorije");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        kategorija = docSnap.data();
        // sort kategorija
        kategorija = Object.fromEntries(
            Object.entries(kategorija).sort(([,a],[,b]) => a-b)
        );
    } else {
        console.log("No such document!");
    }

    onMounted(() => {
        var sel = document.getElementById('kategorijaSelect');
        izabranaKat.value = sel.options[0];
        console.log('1')
    })

    console.log(kategorija)


    onAuthStateChanged(auth, (user) => {
    if (user) {
        userId = user.uid;
    } else {
        userId = null;
        navigateTo('/login');
    }
    });

    const handleFile = (file) => {
        file = event.target.files[0];

        errorMsg.value = '';
        if (file.size > 1024 * 1024 * 2) {
            errorMsg.value = 'Slika ne sme biti veća od 2 MB';
            setTimeout(() => {
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

    const saveOglas = async() => {
        if (userId == null) {
            redirectTo('/user/login');
        }

        if (oglasName.value == '') {
            errorMsg.value = 'Morate uneti naziv oglasa';
            setTimeout(() => {
                errorMsg.value = ''
            }, 5000);
            return;
        }

        if (cena.value == 0) {
            errorMsg.value = 'Morate uneti cenu oglasa';
            setTimeout(() => {
                errorMsg.value = ''
            }, 5000);
            return;
        }

        if (izabranaKat == null) {
            errorMsg.value = 'Morate izabrati kategoriju oglasa';
            setTimeout(() => {
                errorMsg.value = ''
            }, 5000);
            return;
        }

        var id = uuidv4();

        await setDoc(doc(db, "oglasi", id), {
            naziv: oglasName.value,
            cena: cena.value,
            kategorija: izabranaKat.value,
            opis: oglasOpis.value,
            slika: mainImg.value,
            creationTime: Date.now(),
            userNaziv: auth.currentUser.displayName,
            user: userId,
            oglasId: id
        });

        infoMsg.value = 'Oglas je uspešno sačuvan';
        setTimeout(() => {
            infoMsg.value = ''
            navigateTo('/')
        }, 5000);
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
                    <input type="file" ref="file" @change="handleFile" style="display:none;">
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
                <select class="defaultInput" id="kategorijaSelect" v-model="izabranaKat">
                    <option :value="null" disabled selected>Izaberite kategoriju</option>
                    <option v-for="(val, key) in kategorija" :key="val" :value="val">{{ key }}</option>
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
            <button class="defaultButton" @click="saveOglas"><span class="defaultLightText">Sačuvaj oglas</span></button>
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