import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


const firebaseConfig = {
  apiKey: "AIzaSyCr7D-Vv1SLUEso0VeCmJKDJr1SVADzNUw",
  authDomain: "services-met-masoud.firebaseapp.com",
  projectId: "services-met-masoud",
  storageBucket: "services-met-masoud.firebasestorage.app",
  messagingSenderId: "335040058260",
  appId: "1:335040058260:web:51ab069e0ff90e42137581"
};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);


const loginForm = document.getElementById("loginForm");


loginForm.addEventListener("submit", async (e) => {

  e.preventDefault();


  const password = document.getElementById("password").value;


  try {

    await signInWithEmailAndPassword(
      auth,
      "admin@metmasoud.com",
      password
    );


    // حفظ تسجيل دخول الإدارة
    localStorage.setItem("adminLogin", "true");


    // الذهاب للوحة التحكم
    window.location.href = "admin.html";


  } catch (error) {

    alert("كلمة المرور غير صحيحة ❌");

  }

});