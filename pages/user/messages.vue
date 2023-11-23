<script setup>
    import { ref } from 'vue'
    import { getAuth, onAuthStateChanged  } from "firebase/auth";
    import { getFirestore, collection, updateDoc, getDocs, setDoc, doc, query, where, orderBy, or } from 'firebase/firestore';
    import { v4 as uuidv4 } from 'uuid';
    import * as chatController from '../controllers/chatController.js'
    const auth = getAuth()
    auth.languageCode = auth.useDeviceLanguage();
    const db = getFirestore();

    // Variables
    const loggedIn = ref(false)
    const infoMsg = ref('')
    const errorMsg = ref('')
    const chats = ref([])
    const messages = ref([])
    const newMessage = ref('')
    const selectedChat = ref(null)

    var unsubscribe = null

    onAuthStateChanged(auth, (user) => {
    if (user) {
        chatController.loadChats(auth.currentUser).then((data) => {
            chats.value = data
        });
        loggedIn.value = true
    } else {
        loggedIn.value = false
    }
    });

    const selectChat = (chat) => {
        if (unsubscribe) {
            unsubscribe()
        }
        selectedChat.value = chat
        unsubscribe = chatController.subscribeToChat(chat);
    }

    // Send new message in a chat
    // const sendMessage = async () => {
    //     try {
    //         if (newMessage.value == '') {
    //             infoMsg.value = 'Poruka ne može biti prazna'
    //             return
    //         }
    //         const chatId = selectedChatId.value

    //         var id = uuidv4();

    //         const docRef = doc(db, "messages", chatId + '_' + id);
    //         const docData = {
    //             chatId: chatId,
    //             messageId: id,
    //             date: Date.now(),
    //             sender: auth.currentUser.displayName,
    //             senderId: auth.currentUser.uid,
    //             text: newMessage.value
    //         }
    //         await setDoc(docRef, docData);

    //         // Update last message and last message date in chats collection
    //         await updateDoc(doc(db, "chats", chatId), {
    //             lastMessage: newMessage.value,
    //             lastMessageDate: Date.now()
    //         });
    //         await loadChats();

    //         newMessage.value = ''
    //         loadMessages(chatId)
    //     } catch (error) {
    //         errorMsg.value = error.message
    //     }
    // }


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
</script>

<style>
    @media screen and (max-width: 768px) {
        .grid {
            grid-template-columns: 1fr;
        }
    }
</style>

<template>
    <div class="grid gap-x-4 gap-y-4 lg:grid-cols-3 grid-cols-1 w-3/4">
        <div class="card order-first flex flex-col col-span-1">
        <!-- This card holds list of chats which are indetified by ad they are talking about and to which user is the logged in user talking to  -->
            <h3 class="defaultHeader mb-2">
                Razgovori
            </h3>
            <div v-if="chats.length == 0">
                <div class="cardSmallPadding text-center">
                    <span class="defaultText">Nemate razgovore</span>
                </div>
            </div>
            <div v-else>
                <div v-for="chat in chats" :key="chat.id" @click="selectChat(chat)" :class="{ 'errorCardSmallPadding' : selectedChat == chat, 'cardSmallPadding' : selectedChat != chat}" class="mb-2 flex flex-col">
                    <div class="defaultMediumHeader">
                        {{ chat.oglasNaziv }}
                    </div>
                    <span class="defaultText textOverflow">Poruka: {{ chat.lastMessage }}</span>
                    <span class="defaultText">Datum: {{ getDateFormatted(chat.lastMessageDate) }}</span>
                    <span class="defaultText">Korisnici: {{ chat.users }}</span>
                </div>
            </div>
            <NuxtLink to="/" class="w-full lg:w-1/4 lg:self-end mt-2">
                <button class="defaultButton w-full"><span class="defaultLightText">Nazad</span></button>
            </NuxtLink>
        </div>
        <div v-if="loggedIn" class="cardSmallPadding lg:col-span-2 col-span-1 flex flex-col justify-between">
            <!-- This card holds the list of messages and a text area with a button to send a new message -->
            <h3 class="defaultHeader mb-2">
                Poruke
            </h3>
            <div v-if="!selectedChat" class="cardSmallPadding mx-auto lg:w-1/4 md:w-1/2 mb-2">
                <span class="defaultText">Nije izabran razgovor</span>
            </div>
            <div v-else>
                <div v-if="selectedChat.messages.length == 0" class="cardSmallPadding text-center">
                    <span class="defaultText">Nemate poruke</span>
                </div>
                <div v-else v-for="message in selectedChat.messages" :key="message.id" class="cardSmallPadding flex flex-col mb-1">
                    <span class="defaultMediumHeader mb-1">{{ message.sender }}</span>
                    <span class="defaultText">{{ message.text }}</span>
                    <div class="w-full mt-2">
                        <span class="defaultItalicText float-right">{{ getDateFormatted(message.timestamp) }}</span>
                    </div>
                </div>
                <div class="cardSmallPadding flex flex-col mt-2">
                    <textarea v-model="newMessage" class="defaultInput" placeholder="Unesite poruku"></textarea>
                    <button @click="chatController.sendMessage(selectedChat, auth.currentUser, newMessage)" class="defaultButton lg:w-1/4 lg:self-end mt-2 w-full"><span class="defaultLightText">Pošalji</span></button>
                </div>
            </div>
        </div>
    </div>
    <div v-if="infoMsg" class="card mt-2 text-center">
        <span class="defaultText">{{ infoMsg }}</span>
    </div>
    <div v-if="errorMsg" class="errorCard mt-2 text-center">
        <span class="defaultText">Došlo je do greške: {{ errorMsg }}</span>
    </div>
</template>