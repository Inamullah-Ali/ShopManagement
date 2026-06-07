import {initializeApp} from "firebase/app"
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: "AIzaSyCYxunutN008n9hJWp-Lm_fvRwciMU_WIE",
  authDomain: "shopdashboard-f1775.firebaseapp.com",
  projectId: "shopdashboard-f1775",
  storageBucket: "shopdashboard-f1775.firebasestorage.app",
  messagingSenderId: "2559232326",
  appId: "1:2559232326:web:7f4f77074058b6e93b3d47",
  measurementId: "G-6JMLJ3JFRX"
};

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);