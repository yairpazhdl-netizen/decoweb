// Pega aquí la configuración de tu app web (Firebase > Configuración del proyecto > Tus apps)
import {initializeApp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {getFirestore,doc,getDoc,setDoc,collection,addDoc,getDocs,query,where,deleteDoc} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {getAuth,signInWithEmailAndPassword,signOut,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
const app=initializeApp({
  apiKey:"PEGA_AQUI",
  authDomain:"PEGA_AQUI.firebaseapp.com",
  projectId:"PEGA_AQUI",
  appId:"PEGA_AQUI"
});
export const db=getFirestore(app),auth=getAuth(app);
export {doc,getDoc,setDoc,collection,addDoc,getDocs,query,where,deleteDoc,signInWithEmailAndPassword,signOut,onAuthStateChanged};
