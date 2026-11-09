// Pega aquí la configuración de tu app web (Firebase > Configuración del proyecto > Tus apps)
import {initializeApp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {getFirestore,doc,getDoc,setDoc,collection,addDoc,getDocs,query,where,deleteDoc} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {getAuth,signInWithEmailAndPassword,signOut,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
const app=initializeApp({
  apiKey:"AIzaSyDM9ZzaoI9b5vUu6M_7OcCqrozF4-S7ySc",
  authDomain:"decoweb-5b885.firebaseapp.com",
  projectId:"decoweb-5b885",
  appId:"1:271703434158:web:7ec8d8565d558cd5ef5e3f"
});
export const db=getFirestore(app),auth=getAuth(app);
export {doc,getDoc,setDoc,collection,addDoc,getDocs,query,where,deleteDoc,signInWithEmailAndPassword,signOut,onAuthStateChanged};
