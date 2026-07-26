import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDo6jZqQ26o5_5cPMj9WX1OhBiVAtU4imU",
  authDomain: "beereddy-agency-erp.firebaseapp.com",
  projectId: "beereddy-agency-erp",
  storageBucket: "beereddy-agency-erp.firebasestorage.app",
  messagingSenderId: "412103679398",
  appId: "1:412103679398:web:cc9894f3e5efb1008ec367",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export default app;