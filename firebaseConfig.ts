import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDnrFF5VYcIezxj8t9Q47nq93tnUAIHipA",
  authDomain: "mikra-181ba.firebaseapp.com",
  projectId: "mikra-181ba",
  storageBucket: "mikra-181ba.firebasestorage.app",
  messagingSenderId: "345908910979",
  appId: "1:345908910979:web:d2ba4f3c6c1d378429b4b6",
  measurementId: "G-5V52WJGGMD"
};

// init Firebase
const app = initializeApp(firebaseConfig);

// export tools for use in the rest of the code
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

export default app;