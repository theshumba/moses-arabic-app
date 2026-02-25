import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAKOV297CvXEOxvqdxAxZzcw11zDGpzLwg",
  authDomain: "moses-arabic-app.firebaseapp.com",
  projectId: "moses-arabic-app",
  storageBucket: "moses-arabic-app.firebasestorage.app",
  messagingSenderId: "946088092633",
  appId: "1:946088092633:web:2f8757af1e835aca1d2fc8",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
