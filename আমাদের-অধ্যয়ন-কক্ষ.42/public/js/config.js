/* ===== Firebase কনফিগারেশন ===== */
const firebaseConfig = {
  apiKey: "AIzaSyBjPzDkuhfj5WqcgmM0EtmcJ_-w0Ai9H1o",
  authDomain: "reading-room-14320.firebaseapp.com",
  databaseURL: "https://reading-room-14320-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "reading-room-14320",
  appId: "1:951726333059:web:a432bb5adcd40b2e6f8fb6"
};

// গ্লোবাল ভ্যারিয়েবল যেন পুরনো ও নতুন সব কোড পায়
var FB_CONFIG = firebaseConfig;

// ফায়ারবেস ইনিশিয়ালাইজ
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// ডাটাবেস ও অথ রেফারেন্স
const db = firebase.database();
window.db = db;

// ফায়ারবেস অথ সেশন নিশ্চিতকরণ (যাতে সিকিউরিটি রুলসে PERMISSION_DENIED না হয়)
if (firebase.auth) {
  try {
    const auth = firebase.auth();
    window.auth = auth;
    auth.onAuthStateChanged(function(user) {
      if (!user) {
        var token = localStorage.getItem("firebase_auth_token") || localStorage.getItem("admin_auth_token");
        if (token) {
          auth.signInWithCustomToken(token).catch(function() {
            auth.signInAnonymously().catch(function(){});
          });
        } else {
          auth.signInAnonymously().catch(function(){});
        }
      }
    });
  } catch (authErr) {
    console.warn("Auth initialization notice:", authErr);
  }
}
/* ================================= */