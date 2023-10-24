<script setup>
    import { ref } from 'vue'
    import { getAuth, updateProfile, onAuthStateChanged } from "firebase/auth";
    import { getFirestore, getDoc, doc, updateDoc, setDoc } from 'firebase/firestore';
    const auth = getAuth()
    const db = getFirestore();
    auth.languageCode = auth.useDeviceLanguage();

    var name = ref('')
    var brTel = ref('')
    var errorMsg = ref('')
    var opisText = ref('')
    var loc = ref('')
    var userId = null

    onAuthStateChanged(auth, (user) => {
    if (user) {
        name.value = user.displayName;
        userId = user.uid;
        getUserInfo();
    } else {
        name.value = '';
        brTel.value = '';
        userId = null;
    }
    });

    const updateUser = async() => {
        console.log(name.value, brTel.value)
        updateProfile(auth.currentUser, {
            displayName: name.value
        }).then(async () => {
            console.log('Name update successful')
            await navigateTo('/');
        }).catch((error) => {
            errorMsg = error.message;
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
</script>

<template>
    <h2>Ovo je stranica za update</h2>

    <input v-model="name" type="text" placeholder="Unesite Vaše ime i prezime"><br>
    <button @click="updateUser">Sacuvaj ime i prezime</button><br>
    <input v-model="brTel" type="text" placeholder="Unesite Vas broj telefona"><br>
    <button @click="updateUserInfo">Sacuvaj broj telefona</button><br>
    <div>{{ errorMsg }}</div>

    <br>
    <br>
    <br>
    <label>Kratak opis o Vama:</label><br>
    <textarea v-model="opisText" cols="30" rows="10"></textarea><br>
    <label>Vasa lokacija</label><br>
    <input type="text" v-model="loc" placeholder="Unesite Vašu lokaciju"><br>
    <button @click="updateUserInfo">Sacuvaj izmene</button><br>
</template>