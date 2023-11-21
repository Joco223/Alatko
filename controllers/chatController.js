import { doc, collection, setDoc, getDoc, getDocs, onSnapshot } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';
import { db } from "../util/initFirebase.js";
import { Chat, chatConverter } from "../models/chatModel.js";
import { Message, messageConverter } from "../models/messageModel.js";

// Create a new chat with two user ids using db

export async function createChat(user1, user2, oglas) {
    const chatId = uuidv4();
    const chatRef = doc(db, "chats", chatId).withConverter(chatConverter);

    const chat = new Chat(chatId, [user1.uid, user2.uid], oglas.oglasId);

    console.log(chat);

    await setDoc(chatRef, chat);

    return chatId;
}

// Load all chats for a user from db
export async function loadChats(user) {
    const chatsRef = collection(db, 'chats');
    const snapshot = await getDocs(chatsRef);
    const chats = [];

    snapshot.forEach((doc) => {
        const chat = doc.data();
        if (chat.users.includes(user.uid)) {
            chats.push(chat);
        }
    });

    return chats;
}

// Send a new message to a chat using db and push with sender user object, message and timestamp
export async function sendMessage(chat, sender, message) {
    const newMessage = new Message(sender, message);

    const messages = chat.messages ? chat.messages : [];

    messages.push(newMessage);
    chat.messages = messages;

    await setDoc(chatRef, chat);
}

// Subscribe to a chat using db and push new messages to the chat
export function subscribeToChat(chat, onSubscribe) {
    const chatRef = doc(db, "chats", chat.id);
    const unsubscribe = onSnapshot(chatRef, (chatSnapshot) => {
        const chat = chatSnapshot.data();
        const messages = chat.messages ? chat.messages : [];
        onSubscribe(messages);
    });

    return unsubscribe;
}