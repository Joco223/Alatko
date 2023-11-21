import { doc, collection, setDoc, getDoc, getDocs, onSnapshot } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';
import { db } from "../util/initFirebase.js";

// Load oglas data based on oglas id
export async function loadOglas(oglasId) {
    const oglasRef = doc(db, "oglasi", oglasId);
    const oglasSnapshot = await getDoc(oglasRef);
    const oglas = oglasSnapshot.val();

    return oglas;
}