//import firebase from 'firebase/app';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth'; //'firebase/auth';
import 'firebase/compat/firestore'; //'firebase/firestore';
import 'firebase/compat/storage'; //'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyDtXk0VwbQbDGI5yH9kJBjweV5puSYceco",
    authDomain: "sysestoque-ee496.firebaseapp.com",
    projectId: "sysestoque-ee496",
    storageBucket: "sysestoque-ee496.appspot.com",
    messagingSenderId: "215641871156",
    appId: "1:215641871156:web:58b8f52eddb8d8ef0b8b61",
    measurementId: "G-R0VW1KNMNX"
  };
  
if(!firebase.apps.length){
  firebase.initializeApp(firebaseConfig);
  //const firebaseApp = initializeApp(firebaseConfig);
  //const firebase = getFirestore(firebaseApp);
  //const auth = getAuth(firebaseApp);  
}

export default firebase;
//export { firebase };