<script setup>
    import { ref } from 'vue'
    import { getAuth, updateProfile, onAuthStateChanged, PhoneAuthProvider, updatePhoneNumber, RecaptchaVerifier } from "firebase/auth";
    import { getFirestore, getDoc, doc, updateDoc, setDoc } from 'firebase/firestore';
    const auth = getAuth()
    const phoneAuth = new PhoneAuthProvider(auth);
    const db = getFirestore();
    auth.languageCode = auth.useDeviceLanguage();

    var appVerifier = new RecaptchaVerifier(auth, 'sign-in-button', {
        'size': 'invisible',
        'callback': (response) => {
            // reCAPTCHA solved, allow signInWithPhoneNumber.
            onSignInSubmit();
        }
    });

    var name = ref('')
    var brTel = ref('')
    var errorMsg = ref('')
    var opisText = ref('')
    var loc = ref('')
    var userId = null

    onAuthStateChanged(auth, (user) => {
    if (user) {
        name.value = user.displayName;
        brTel.value = user.phoneNumber;
        userId = user.uid;
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

    const updateUserNumber = async() => {
        if (userId != null) {
            console.log('update user number')
            phoneAuth.verifyPhoneNumber(brTel.value, appVerifier)
                .then((verificationId) => {
                    console.log('verification id', verificationId)
                    // Once the user enters the verification code, get a PhoneAuthCredential object
                    const verificationCode = prompt('Ukucajte kod koji je poslat na vas broj telefona');
                    const credential = phoneAuth.credential(verificationId, verificationCode);

                    // Update the user's phone number
                    user.updatePhoneNumber(credential)
                    .then(() => {
                        console.log('Phone number updated successfully');
                    })
                    .catch((error) => {
                        console.error('Error updating phone number:', error);
                    });
                })
                .catch((error) => {
                    console.error('Error sending verification code:', error);
                });
        }
    }

    const updateUserInfo = async() => {
        if (userId != null) {
            const docRef = doc(db, "users", auth.currentUser.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                await updateDoc(doc(db, "users", auth.currentUser.uid), {
                    opis: opisText.value,
                    lokacija: loc.value
                });
            } else {
                await setDoc(doc(db, "users", auth.currentUser.uid), {
                    opis: opisText.value,
                    lokacija: loc.value
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
    <button @click="updateUserNumber">Sacuvaj broj telefona</button><br>
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