import { doc, collection, setDoc, getDoc, getDocs, onSnapshot } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';
import { db } from "../util/initFirebase.js";
import { Chat, chatConverter } from "../models/chatModel.js";
import { Message, messageConverter } from "../models/messageModel.js";

// Create a new chat with two user ids using db

export async function createChat(user1, user2, oglas) {
    // Check if chat with both recipients already exists
    const existingChat = await findExistingChat(user1, user2);
    if (existingChat) {
        return existingChat.id;
    }
    
    const chatId = uuidv4();
    const chatRef = doc(db, "chats", chatId).withConverter(chatConverter);

    const chat = new Chat(chatId, [user1, user2], oglas.oglasId);

    console.log(chat);

    await setDoc(chatRef, chat);

    return chatId;
}

// Find existing chat with both recipients
async function findExistingChat(user1Id, user2Id) {
    const chatsRef = collection(db, 'chats');
    const snapshot = await getDocs(chatsRef);

    for (const doc of snapshot.docs) {
        const chat = doc.data();
        if (chat.users.includes(user1Id) && chat.users.includes(user2Id)) {
            return { id: doc.id, ...chat };
        }
    }

    return null;
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
    const chatRef = doc(db, "chats", chat.id).withConverter(chatConverter);
    const newMessage = new Message(sender.uid, message);

    console.log(newMessage)

    chat.messages.push(newMessage);

    await setDoc(chatRef, chat);
}

// Subscribe to a chat using db and set chat.messages to chatSnapshot
export function subscribeToChat(chat, updateMessages) {
    const chatRef = doc(db, "chats", chat.id);
    const unsubscribe = onSnapshot(chatRef, (chatSnapshot) => {
        console.log(chatSnapshot.data());
        updateMessages(chatSnapshot.data().messages);
    });

    return unsubscribe;
}