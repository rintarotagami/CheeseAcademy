import { initGame } from './packmouse.js';


document.getElementById('mouse-wrapper').addEventListener('click', function () {
    if (!gamePlaying) { // gamePlayingがfalseの時のみ以下を実行
        gamePlaying = true; //gameのプレイ状態をtrueに変更

        const packmouse = document.getElementById('packmouse');
        packmouse.style.display = 'flex'; // ブロック表示に変更
        packmouse.style.position = 'fixed';
        packmouse.style.left = '50%';
        packmouse.style.top = '50%';
        packmouse.style.transform = 'translate(-50%, -50%) scale(0)';
        packmouse.style.width = '200vw';
        packmouse.style.height = '200vh';
        packmouse.style.borderRadius = '50%';
        packmouse.style.backgroundColor = 'White';
        packmouse.style.transition = 'transform 0.5s ease-in-out';
        packmouse.style.zIndex = '9999';

        // cheeseBackgroundを非表示に変更
        const cheeseBackground = document.getElementById('cheeseBackground');
        cheeseBackground.style.display = 'none';

        setTimeout(() => {
            packmouse.style.transform = 'translate(-50%, -50%) scale(1)';
        }, 10);

        setTimeout(() => {
            packmouse.style.width = '100vw';
            packmouse.style.height = '100vh';
            packmouse.style.transition = 'transform 0.5s ease-in-out, borderRadius 0.5s ease-in-out'; // borderRadiusのアニメーションを修正
            packmouse.style.borderRadius = '0%';
            document.body.style.overflow = 'hidden'; // スクロールを無効化
            window.scrollTo(0, 0); // スクロール位置をトップにリセット
            // ゲームの開始
            initGame();
        }, 510); // transformのアニメーション時間徫実行
    }
});

document.getElementById('closeButton').addEventListener('click', function () {
    if (gamePlaying) {
        gamePlaying = false;

        const packmouse = document.getElementById('packmouse');
        packmouse.style.display = 'none'; // 元の表示状態に戻す
        packmouse.style.position = '';
        packmouse.style.left = '';
        packmouse.style.top = '';
        packmouse.style.transform = '';
        packmouse.style.width = '';
        packmouse.style.height = '';
        packmouse.style.borderRadius = '';
        packmouse.style.backgroundColor = '';
        packmouse.style.transition = '';
        packmouse.style.zIndex = '';

        // cheeseBackgroundを表示に戻す
        const cheeseBackground = document.getElementById('cheeseBackground');
        cheeseBackground.style.display = 'block';

        document.body.style.overflow = ''; // スクロールを有効化
        // ゲームの終了処理
    }
});
//---------------------------------------------------------------