<script setup>
    import { ref } from 'vue'
    import { getAuth, onAuthStateChanged } from "firebase/auth";
    import { getFirestore, collection, getDocs, getDoc, doc, query, where, orderBy } from 'firebase/firestore';
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
    var searchKat = ref(0)
    var sort = ref(0)
    var order = ref(1)
    var searchName = ref('')
    var searchCenaOd = ref(null)
    var searchCenaDo = ref(null)

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

    const getDateFormatted = (date) => {
        var d = new Date(date);
        var month = '' + (d.getMonth() + 1);
        var day = '' + d.getDate();
        var year = d.getFullYear();

        if (month.length < 2)
            month = '0' + month;
        if (day.length < 2)
            day = '0' + day;

        return [year, month, day].join('-');
    
    }

    const search = () => {
        oglasi.value = [];
        var q = query(collection(db, "oglasi"));

        if (sort.value == 1) {
            if (order.value == 0) {
                q = query(q, orderBy("cena", "asc"))
            } else {
                q = query(q, orderBy("cena", "desc"))
            }
        }else{
            q = query(q, orderBy("cena", "desc"))
        }

        if (searchName.value != '') {
            q = query(q, where("searchTerms", "array-contains-any", searchName.value.toLowerCase().split(' ')));
        }

        if (searchKat.value != 0) {
            q = query(q, where("kategorija", "==", searchKat.value));
        }

        if (searchCenaOd.value != null) {
            q = query(q, where("cena", ">=", searchCenaOd.value));
        }

        if (searchCenaDo.value != null) {
            q = query(q, where("cena", "<=", searchCenaDo.value));
        }

        if (sort.value == 0) {
            if (order.value == 0) {
                q = query(q, orderBy("creationTime", "asc"))
            } else {
                q = query(q, orderBy("creationTime", "desc"))
            }
        }
        
        getDocs(q).then((querySnapshot) => {
            querySnapshot.forEach((docs) => {
                oglasi.value.push(docs.data())
            });
        }).catch((error) => {
            console.log("Error getting documents: ", error);
        });
    
    }

    const clearSearch = () => {
        searchName.value = '';
        searchKat.value = 0;
        searchCenaOd.value = null;
        searchCenaDo.value = null;
        sort.value = 0;
        order.value = 1;
        oglasi.value = [];
        loadOglasi();
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
    <div class="grid gap-x-4 gap-y-4 md:grid-cols-3 w-3/4">
        <div class="card col-span-2 md:order-first">
            <h3 class="defaultHeader mb-2">Pretraži oglase</h3>
            <div class="grid gap-y-2 gap-x-2 grid-cols-2">
                <div class="flex flex-col">
                    <span class="defaultText">Naziv oglasa:</span>
                    <input class="defaultInput" type="text" v-model="searchName" placeholder="Unesite naziv oglasa">
                </div>
                <div class="flex flex-col">
                    <span class="defaultText">Kategorija:</span>
                    <select class="defaultInput" v-model="searchKat">
                        <option value="0" selected>Sve kategorije</option>
                        <option v-for="kat in kategorija" :value="kat">{{ kat }}</option>
                    </select>
                </div>
                <div class="flex flex-col">
                    <span class="defaultText">Cena od:</span>
                    <input class="defaultInput" type="number" v-model="searchCenaOd" placeholder="Unesite cenu oglasa od">
                </div>
                <div class="flex flex-col">
                    <span class="defaultText">Cena do:</span>
                    <input class="defaultInput" type="number" v-model="searchCenaDo" placeholder="Unesite cenu oglasa do">
                </div>
                <div class="flex flex-col">
                    <span class="defaultText">Sortiraj po:</span>
                    <select class="defaultInput" v-model="sort">
                        <option value="0" selected>Datumu</option>
                        <option value="1">Ceni</option>
                    </select>
                </div>
                <div class="flex flex-col">
                    <span class="defaultText">Redosled:</span>
                    <select class="defaultInput" v-model="order">
                        <option value="1" selected>Opadajuće</option>
                        <option value="0">Rastuće</option>
                    </select>
                </div>
            </div>
            <div class="flex flex-col md:justify-end md:flex-row md:transition-all md:grow">
                <button type="button" class="defaultButton float-right mt-2 md:w-1/5" @click="clearSearch"><span class="defaultLightText">Poništi pretragu</span></button>
                <button type="button" class="defaultButton float-right mt-2 md:w-1/5" @click="search"><span class="defaultLightText">Pretraži</span></button>
            </div>
        </div>
        <div v-if="loggedIn" class="cardSmallPadding col-span-2 md:col-span-1 order-first md:order-2">
            <h3 class="defaultHeader mb-2">Vaš profil</h3>
            <div class="grid gap-y-2 gap-x-2 grid-cols-2">
                <img :src="img" class="imageCard w-full md:h-26" referrerpolicy="no-referrer">
                <div class="flex flex-col">
                    <span class="defaultMediumHeader mb-1">{{ pageUser?.displayName }}</span>
                    <span class="defaultText md:text-xs">{{ pageUser?.email }}</span>
                </div>
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
        <div v-else class="cardSmallPadding md:h-1/3 col-span-2 md:col-span-1 order-first md:order-2">
            <h3 class="defaultHeader mb-2">Niste ulogovani</h3>
            <div class="flex flex-col md:col-span-2 md:flex-row md:grow md:space-x-2">
                <NuxtLink to="/user/login" class="md:w-1/2">
                    <button class="defaultButton w-full"><span class="defaultLightText">Uloguj se</span></button>
                </NuxtLink>
                <NuxtLink to="/user/register" class="md:w-1/2">
                    <button class="defaultButton w-full mt-2 md:mt-0"><span class="defaultLightText">Registruj se</span></button>
                </NuxtLink>
            </div>
        </div>
        <!-- Prikaži oglase -->
        <div class="col-span-2 md:order-3">
            <div v-for="oglas in oglasi" :key="oglas.id" class="cardSmallPadding mb-2 w-full">
                <NuxtLink :to="'/oglas/' + oglas.id" class="grid gap-x-2 grid-cols-3">
                    <img :src="oglas.slika" class="imageCard col-span-2 md:col-span-1 w-full h-full min-h-32" referrerpolicy="no-referrer">
                    <div class="flex flex-col col-span-2 justify-between">
                        <div class="flex flex-col">
                            <span class="defaultHeader mb-1">{{ oglas.naziv }}</span>
                            <span class="defaultText">Kategorija: {{ kategorija[oglas.kategorija] }}</span>
                            <span class="defaultText">Cena: {{ oglas.cena }} RSD</span>
                            <span class="defaultText">{{ oglas.opis }}</span>
                        </div>
                        <div class="w-full mt-2">
                            <span class="defaultItalicText float-right">{{ oglas.userNaziv }} - Postavljeno {{ getDateFormatted(oglas.creationTime) }}</span>
                        </div>
                    </div>
                </NuxtLink>
            </div>
        </div>
    </div>
</template>