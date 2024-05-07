//音楽ファイルのインスタンス作成------------------------------------------
// オーディオ要素を作成し、DOMに追加する関数
function createAndAppendAudio(globalKey, src) {
    let basePath = '';
    if (window.location.hostname === 'rin-study.sakura.ne.jp') {
        basePath = 'https://rin-study.sakura.ne.jp/cheese-academy/sound/';
    } else {
        basePath = '../sound/';
    }
    window[globalKey] = new Audio(basePath + src);
    document.body.appendChild(window[globalKey]);
}

// オーディオ要素の作成と追加
createAndAppendAudio('audioPlayer', 'EscapeTheChase.mp3');
createAndAppendAudio('wallAudio', 'zubashu.mp3');
createAndAppendAudio('toBeContinued', 'toBeContinued.mp3');
createAndAppendAudio('playAudio', 'play.mp3');
createAndAppendAudio('cursorSound', 'cursor_1.mp3');
createAndAppendAudio('araraSound', 'arara.mp3');
createAndAppendAudio('poisonSound', 'poison.mp3');
createAndAppendAudio('blokenSound', 'bloken.mp3');
createAndAppendAudio('victorySound', 'victory.mp3');
createAndAppendAudio('rainbowSound', 'rainbow.mp3');


// rainbowSoundとblokenSoundの音量を80%に設定
rainbowSound.volume = 0.3;
blokenSound.volume = 0.5;
poisonSound.volume = 0.5;

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
