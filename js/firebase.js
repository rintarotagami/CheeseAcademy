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
const rankingRef = ref(ranking, 'ranking'); //RealtimeDatabase"ranking"を使うよ

// Add a declaration for rankingList variable before using it
const rankingList = $("#ranking-output");

// 読み込み時に処理
$(document).ready(function() {
    // ローカルストレージにすでにユーザー名が保存されている場合、ローカルストレージからユーザー名を取得して入力フィールドにセット
    const savedplayername = localStorage.getItem('playername');
    if (savedplayername) {
        $("#playername").text(savedplayername);
        $("#playername").css("display", "block");
        $("#playername-input").remove(); // ユーザー名入力フィールドを削除
    } 
});

// ランキングデータを送信する部分
$("#ranking-send").on("click", function () {
    if ($("#playername-input").length > 0) { // playername-inputがあるかどうかをチェック
        const name = $("#playername-input").val().trim(); // 名前の前後の空白を削除
        if (name === "") {
            alert("名前を入力してください");
            return;
        }
        const highScore = JSON.parse(localStorage.getItem('scoreHistory'))[0];
        const newRankingRef = push(rankingRef); // pushを使用して新しい参照を作成
        const newRanking = {
            name: name,
            score: highScore,
            date: new Date().toLocaleString()
        };

        // 既存のリストをチェックして同じ名前とスコアの組み合わせがあるか確認
        let isDuplicate = false;
        rankingList.children().each(function () {
            const text = $(this).text();
            const [existingName, existingScore] = text.split(': ');
            if (existingName === newRanking.name && parseInt(existingScore) === newRanking.score) {
                isDuplicate = true;
                return false; // ループを抜ける
            }
        });

        if (!isDuplicate) {
            set(newRankingRef, newRanking); // 新しい参照にデータをセット
            localStorage.setItem('playername', name); // ユーザー名をローカルストレージに保存
            $("#playername-input").remove(); // ユーザー名入力フィールドを削除
            $("#playername").text(name);
            $("#playername").css("display", "block");
            
        } else {
            console.log("同じ名前とスコアのデータが既に存在します:", newRanking);
        }
    }
});

// ランキングデータを取得して表示する部分
onChildAdded(rankingRef, function (snapshot, prevChildKey) {
    const rankingData = snapshot.val();
    console.log("取得したランキングデータ:", rankingData);
    if (rankingData && typeof rankingData === 'object' && rankingData.name && rankingData.score) {
        // li要素としてリストの先頭に追加し、CSSで順位を表示
        rankingList.prepend(`<li class="ranking">${rankingData.name}: ${rankingData.score}</li>`);
    } else {
        console.log("不正なデータ形式:", rankingData);
    }
}, {
    // スコアを基に降順でデータを取得
    orderByChild: 'score'
});

$("#rankingButton").on("click", function (event) {
    const rankingRight = $("#rankingRight");
    if (rankingRight.css("display") === "none") {
        rankingRight.css("display", "flex");
    } else {
        rankingRight.css("display", "none");
    }
});
