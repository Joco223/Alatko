import { doc, collection, setDoc, getDoc, getDocs, onSnapshot } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';
import { db } from "../util/initFirebase.js";

// Load user data based on user id
export async function loadUser(userId) {
    const userRef = doc(db, "users", userId);
    const userSnapshot = await getDoc(userRef);
    const user = userSnapshot.val();

    return user;
}