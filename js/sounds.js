//音楽ファイルのインスタンス作成------------------------------------------
// オーディオ要素を作成し、DOMに追加する関数
function createAndAppendAudio(globalKey, src) {
    window[globalKey] = new Audio(src);
    document.body.appendChild(window[globalKey]);
}

// オーディオ要素の作成と追加
createAndAppendAudio('audioPlayer', '../sound/EscapeTheChase.mp3');
createAndAppendAudio('wallAudio', '../sound/zubashu.mp3');
createAndAppendAudio('toBeContinued', 'sound/toBeContinued.mp3');
createAndAppendAudio('playAudio', '../sound/play.mp3');

//---------------------------------------------------------------------
let soundEnabled = true; // ゲームの音の初期状態を設定

//---------------------------------------------------------------------

// soundtoggle要素にクリックイベントを追加
document.getElementById('soundtoggle').addEventListener('click', function () {
    soundEnabled = !soundEnabled; // 音の状態を切り替え
    if (soundEnabled) {
        document.getElementById('soundtoggle').style.backgroundImage = 'url("../img/soundON.jpg")'; // 音がONの時の画像
        // 全てのオーディオ要素のミュートを解除
        document.querySelectorAll('audio').forEach(audio => audio.muted = false);
    } else {
        document.getElementById('soundtoggle').style.backgroundImage = 'url("../img/soundOff.jpg")'; // 音がOFFの時の画像
        // 全てのオーディオ要素をミュート
        document.querySelectorAll('audio').forEach(audio => audio.muted = true);
    }
});
