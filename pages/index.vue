<script setup>
    import { ref } from 'vue'
    import { getAuth, onAuthStateChanged } from "firebase/auth";
    import { getFirestore, collection, getDocs, getDoc, doc } from 'firebase/firestore';
    var auth = getAuth()
    const db = getFirestore();
    auth.languageCode = auth.useDeviceLanguage();


    const loadKategorije = async() => {
        const docRef = doc(db, "kategorije", "kategorije");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            var tmp = docSnap.data();
            // sort kategorija
            tmp = Object.fromEntries(
                Object.entries(tmp).sort(([,a],[,b]) => a-b)
            );
            kategorija = Object.keys(tmp)
        } else {
            console.log("No such document!");
        }
    }

    const loadOglasi = async() => {
        var docRef = collection(db, "oglasi");
        await getDocs(docRef).then((querySnapshot) => {
            querySnapshot.forEach(async(docs) => {
                oglasi.value.push(docs.data())
            });
        }).catch((error) => {
            console.log("Error getting documents: ", error);
        });
    }

    var kategorija = []
    var loggedIn = ref(false);
    var pageUser = ref(auth.currentUser);
    var img = ref('');
    var oglasi = ref([]);

    loadKategorije();
    loadOglasi();

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
            <!-- <div class="grid gap-y-2 gap-x-2 grid-cols-3">
                <div class="flex flex-col">
                    <span class="defaultText">Naziv oglasa:</span>
                    <input class="defaultInput" type="text" v-model="searchName" placeholder="Unesite naziv oglasa">
                </div>
                <div class="flex flex-col">
                    <span class="defaultText">Kategorija:</span>
                    <select class="defaultInput" v-model="searchKat">
                        <option value="0">Sve kategorije</option>
                        <option v-for="kat in kategorije" :value="kat.id">{{ kat.naziv }}</option>
                    </select>
                </div>
                <div class="flex flex-col">
                    <span class="defaultText">Cena:</span>
                    <input class="defaultInput" type="number" v-model="searchCena" placeholder="Unesite cenu oglasa">
                </div>
                <div class="flex flex-col">
                    <span class="defaultText">Datum:</span>
                    <input class="defaultInput" type="date" v-model="searchDate" placeholder="Unesite datum">
                </div>
                <div class="flex flex-col">
                    <span class="defaultText">Sortiraj po:</span>
                    <select class="defaultInput" v-model="sort">
                        <option value="0">Datumu</option>
                        <option value="1">Ceni</option>
                    </select>
                </div>
                <div class="flex flex-col">
                    <span class="defaultText">Redosled:</span>
                    <select class="defaultInput" v-model="order">
                        <option value="0">Rastuće</option>
                        <option value="1">Opadajuće</option>
                    </select>
                </div>
                <div class="flex flex-col">
                    <span class="defaultText">Broj oglasa po strani:</span>
                    <select class="defaultInput" v-model="perPage">
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="20">20</option>
                    </select>
                </div>
                <div class="flex flex-col">
                    <span class="defaultText">Strana:</span>
                    <select class="defaultInput" v-model="page">
                        <option v-for="i in pages" :value="i">{{ i }}</option>
                    </select>
                </div>
                <div class="flex flex-col">
                    <span class="defaultText">Ukupno strana:</span>
                    <span class="defaultText">{{ pages }}</span>
                </div>
            </div> -->
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
        <!-- Prikaži oglase -->
        <div class="col-span-2">
            <div v-for="oglas in oglasi" :key="oglas.id" class="cardSmallPadding mb-2" style="width: 100%;">
                <NuxtLink :to="'/oglas/' + oglas.id" class="grid gap-x-2 grid-cols-3">
                    <img :src="oglas.slika" class="imageCard col-span-1 w-full h-full min-h-32" referrerpolicy="no-referrer">
                    <div class="flex flex-col col-span-2">
                        <span class="defaultHeader mb-1">{{ oglas.naziv }}</span>
                        <span class="defaultText">Kategorija: {{ kategorija[oglas.kategorija] }}</span>
                        <span class="defaultText">Cena: {{ oglas.cena }} RSD</span>
                        <span class="defaultText">{{ oglas.opis }}</span>
                        <div class="w-full mt-2">
                            <span class="defaultItalicText float-right">{{ oglas.userNaziv }}</span>
                        </div>
                    </div>
                </NuxtLink>
            </div>
        </div>
    </div>
</template>