'use strict';
const firebaseConfig={apiKey:"AIzaSyCaRUNFgahPC8CNjHOMiay-tRVBHv76er0",authDomain:"financial-ceo-routine-builder.firebaseapp.com",projectId:"financial-ceo-routine-builder",storageBucket:"financial-ceo-routine-builder.firebasestorage.app",messagingSenderId:"722352983217",appId:"1:722352983217:web:9af538b68c54cedc496690"};
firebase.initializeApp(firebaseConfig);
const fbAuth=firebase.auth(),fbDb=firebase.firestore();
window.vipBackend={
 watch(callback){return fbAuth.onAuthStateChanged(callback)},
 async register(email,password){return fbAuth.createUserWithEmailAndPassword(email,password)},
 async login(email,password){return fbAuth.signInWithEmailAndPassword(email,password)},
 async reset(email){return fbAuth.sendPasswordResetEmail(email)},
 async logout(){return fbAuth.signOut()},
 async load(user){const snap=await fbDb.collection('users').doc(user.uid).collection('weeklyCheckins').orderBy('createdAt','desc').limit(100).get();return snap.docs.map(d=>{const v=d.data();try{return v.routineJson?JSON.parse(v.routineJson):v.routine}catch{return null}}).filter(v=>v&&v.id&&v.id!=='connection-test')},
 async test(user){const ref=fbDb.collection('users').doc(user.uid).collection('weeklyCheckins').doc('connection-test');await ref.set({createdAt:new Date().toISOString(),routine:{id:'connection-test',date:'test',createdAt:new Date().toISOString(),questions:[]}});await ref.delete();return true},
 async save(user,routine){const ref=fbDb.collection('users').doc(user.uid).collection('weeklyCheckins').doc(routine.id);await ref.set({routineJson:JSON.stringify(routine),createdAt:routine.createdAt,updatedAt:new Date().toISOString()})}
};
