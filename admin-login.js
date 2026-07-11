import { auth } from "./firebase.js";

import {
    signInWithEmailAndPassword,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


const loginForm = document.getElementById("loginForm");
const passwordInput = document.getElementById("password");
const loginButton = document.getElementById("loginButton");
const loginMessage = document.getElementById("loginMessage");


// بريد حساب الإدارة المسجل داخل Firebase Authentication
const ADMIN_EMAIL = "admin@metmasoud.com";


/**
 * عرض رسالة للمستخدم.
 */
function showMessage(message, type = "error") {

    if (!loginMessage) {
        return;
    }

    loginMessage.textContent = message;
    loginMessage.className = type === "success"
        ? "login-message success"
        : "login-message error";
}


/**
 * تغيير حالة زر تسجيل الدخول.
 */
function setLoading(isLoading) {

    if (!loginButton) {
        return;
    }

    loginButton.disabled = isLoading;

    loginButton.textContent = isLoading
        ? "جاري تسجيل الدخول..."
        : "دخول";
}


/**
 * ترجمة أخطاء Firebase إلى رسائل مفهومة.
 */
function getLoginErrorMessage(errorCode) {

    const errorMessages = {

        "auth/invalid-credential":
            "كلمة المرور غير صحيحة.",

        "auth/wrong-password":
            "كلمة المرور غير صحيحة.",

        "auth/user-not-found":
            "حساب الإدارة غير موجود.",

        "auth/too-many-requests":
            "تم إجراء محاولات كثيرة. حاول مرة أخرى لاحقًا.",

        "auth/network-request-failed":
            "تعذر الاتصال بالإنترنت. تحقق من الشبكة.",

        "auth/user-disabled":
            "تم تعطيل حساب الإدارة.",

        "auth/operation-not-allowed":
            "تسجيل الدخول بالبريد وكلمة المرور غير مفعل في Firebase."
    };

    return errorMessages[errorCode] ||
        "تعذر تسجيل الدخول. تحقق من كلمة المرور وحاول مرة أخرى.";
}


/**
 * إذا كان المدير مسجلًا بالفعل، يتم تحويله للوحة الإدارة.
 */
onAuthStateChanged(auth, (user) => {

    if (user && user.email === ADMIN_EMAIL) {
        window.location.replace("admin.html");
    }

});


/**
 * تسجيل الدخول.
 */
if (loginForm) {

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const password = passwordInput.value.trim();

        if (!password) {
            showMessage("أدخل كلمة المرور.");
            passwordInput.focus();
            return;
        }

        setLoading(true);
        showMessage("");

        try {

            const userCredential =
                await signInWithEmailAndPassword(
                    auth,
                    ADMIN_EMAIL,
                    password
                );

            const user = userCredential.user;

            if (user.email !== ADMIN_EMAIL) {
                throw new Error("unauthorized-admin");
            }

            showMessage(
                "تم تسجيل الدخول بنجاح، جاري فتح لوحة الإدارة...",
                "success"
            );

            window.location.replace("admin.html");

        } catch (error) {

            console.error(
                "Firebase login error:",
                error
            );

            if (error.message === "unauthorized-admin") {
                showMessage("هذا الحساب غير مصرح له بدخول الإدارة.");
            } else {
                showMessage(
                    getLoginErrorMessage(error.code)
                );
            }

            passwordInput.value = "";
            passwordInput.focus();

        } finally {

            setLoading(false);
        }

    });

}