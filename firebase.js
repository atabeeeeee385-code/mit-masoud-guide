import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {
    getAuth
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    getStorage
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-storage.js";


const firebaseConfig = {

    apiKey: "AIzaSyCr7D-Vv1SLUEso0VeCmJKDJr1SVADzNUw",

    authDomain: "services-met-masoud.firebaseapp.com",

    projectId: "services-met-masoud",

    storageBucket: "services-met-masoud.firebasestorage.app",

    messagingSenderId: "335040058260",

    appId: "1:335040058260:web:51ab069e0ff90e42137581"

};


const app = initializeApp(firebaseConfig);


export const db = getFirestore(app);

export const auth = getAuth(app);

export const storage = getStorage(app);