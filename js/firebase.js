// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getDatabase, ref, push, set, onChildAdded, remove, onChildRemoved }
    from "https://www.gstatic.com/firebasejs/10.11.1/firebase-database.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD5gtALjMPIBGP4ElC-ll7tGH4N_1A8yWg",
    authDomain: "packmouse-b93fb.firebaseapp.com",
    projectId: "packmouse-b93fb",
    storageBucket: "packmouse-b93fb.appspot.com",
    messagingSenderId: "232540098955",
    appId: "1:232540098955:web:d1384aa800055adb799f8e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const ranking = getDatabase(app); //RealtimeDBに接続
const rankingRef = ref(ranking, 'ranking'); //RealtimeDatabase”ranking“を使うよ

$("#ranking-send").on("click", function() { //ranking-sendをクリックしたら
    const name = $("#username").val(); //usernameから入力データを取得
    const highScore =game.scoreHistory[0]; //ハイスコアを取得
    const rankingRef = ref(ranking, 'ranking');
    const newRanking = {
        name: name,
        score: highScore
    };
    set(rankingRef, newRanking); //DBに値をセット
});

onChildAdded(rankingRef, function(snapshot, prevChildKey) {
    const rankingData = snapshot.val();
    const rankingList = $("#ranking-output");
    rankingList.append(`<p>${rankingData.name}: ${rankingData.score}</p>`);
});


