function appendScript(URL) {
    var el = document.createElement('script');
    el.src = URL;
    el.type = 'module'; // typeをmoduleに設定
    document.body.appendChild(el);
};

appendScript('js/sounds.js');
appendScript('js/switchGameVisibility.js');
appendScript('js/GenerateMaze.js');
appendScript('js/achievement.js');
appendScript('js/firebase.js');


import { achievements } from './achievement.js';
console.log(achievements);

import { updateAchievements } from './achievement.js';
import { loadAchievements } from './achievement.js';

import { generateMaze } from './GenerateMaze.js';
window.gamePlaying = false;
window.gameState = 'title';

const images = {};

function loadImages(callback) {
    let loadedImagesCount = 0;
    const imageSources = {
        catDown: '../img/catDown.png',
        catUp: '../img/catUp.png',
        catLeft: '../img/catLeft.png',
        catRight: '../img/catRight.png',
        mouseDown: '../img/mouseDown.png',
        mouseUp: '../img/mouseUp.png',
        mouseLeft: '../img/mouseLeft.png',
        mouseRight: '../img/mouseRight.png',
        cheese: '../img/cheese.png',
        mouseDead: '../img/mouseDead.png',
        title: '../img/packmouseTitle.png',
        cheeseWall: '../img/cheeseWall.png',
        rainbowCheese: '../img/rainbowCheese.gif',
        poisonCheese: '../img/poisonCheese.png',
        controller: '../img/controller.png',
    };

    const imageKeys = Object.keys(imageSources);
    const imagesToLoad = imageKeys.length;

    imageKeys.forEach(key => {
        const img = new Image();
        img.onload = () => {
            loadedImagesCount++;
            if (loadedImagesCount === imagesToLoad) {
                callback(); // すべての画像が読み込まれたらコールバックを実行
            }
        };
        img.src = imageSources[key];
        images[key] = img;
    });
}


// ゲームの状態----------------------------------------------------------------------------------
let game = {
    selection: 'start',
    state: 'title', // ゲームの状態を追加 ('title','howToPlay','playing',"gameover', 'scoreScreen','victory')
    level: 1,
    player: { x: 30, y: 8, direction: 'right', imageKey: 'mouseRight', score: 0, moving: false, lives: 3, condition: 'normal' },
    cats: [ // 猫を配列で管理
        { x: 10, y: 3, prevX: 0, prevY: 0, direction: 'left', imageKey: 'catRight', moving: false },
        { x: 5, y: 14, prevX: 0, prevY: 0, direction: 'right', imageKey: 'catLeft', moving: false },
        { x: 40, y: 14, prevX: 0, prevY: 0, direction: 'left', imageKey: 'catLeft', moving: false }
    ],
    maze: generateMaze(52, 18),

    cheese: [],
    poisonCheese: [],
    bigCheese: [],
    rainbowCheese: [],
    cheeseImage: null,
    poisonCheeseImage: null,
    scoreHistory: JSON.parse(localStorage.getItem('scoreHistory') || '[]') // スコア履歴をキャッシュから読み込む
};

// スコア履歴をキャッシュに保存する関数
function saveScoreHistory() {
    game.scoreHistory.push(game.player.score);
    game.scoreHistory.sort((a, b) => b - a); // スコア履歴を高い順にソート
    game.scoreHistory = game.scoreHistory.slice(0, 10);  // 上位10位のスコアのみを保持
    localStorage.setItem('scoreHistory', JSON.stringify(game.scoreHistory));
}



// 迷路のサイズ設定、迷路のサイズに合わせたキャンパス設定--------------------------------------------
let tileSize = window.innerWidth <= 768 ? 15 : 25; // スマホサイズの時はtileSizeを15に、それ以外は25に設定
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = game.maze[0].length * tileSize; // キャンバスの幅を迷路の幅に合わせて調整
canvas.height = game.maze.length * tileSize; // キャンバスの高さを迷路の高さに合わせて調整
document.getElementById('game-wrapper').style.width = `${canvas.width}px`;
ctx.fillStyle = '#FDE44F'; // 背景色を黄色に変更
ctx.fillRect(0, 0, canvas.width, canvas.height); // キャンバス全体を黄色で塗りつぶす


// ゲームの初期化---------------------------------------------------------------------------------
export function initGame() {
    // スコア履歴をローカルストレージから読み込む
    game.scoreHistory = JSON.parse(localStorage.getItem('scoreHistory') || '[]');
    loadAchievements();
    updateAchievements();

    updated = true;
    loadImages(() => {
        game.cheeseImage = images.cheese; // チーズの画像を設定
        game.poisonCheeseImage = images.poisonCheese;
        window.addEventListener('keydown', handleKeyDown);
        gameLoop();
    });
}

// アイテムの生成-----------------------------------------------------------------------------------
function generateItems(maze) {
    let cheesePositions = [];
    let poisonCheesePositions = [];
    let rainbowCheesePosition = [];
    let poisonCheeseCount = 0; // 毒チーズの数をカウント
    let maxPoisonCheese = 3 * game.level; // 毒チーズの最大数
    let line = 0;

    // 迷路の各マスをチェック
    for (let y = 0; y < maze.length; y++) {
        for (let x = 0; x < maze[y].length; x++) {
            // 壁がない場所を探す
            if (maze[y][x] === 0) {
                // レインボーチーズの位置で5%の確率で出現
                if ((x === 17 && y === 9) || (x === 36 && y === 11)) {
                    rainbowCheesePosition.push({ x: x, y: y, image: images.rainbowCheese });
                } else if (poisonCheeseCount < maxPoisonCheese && Math.random() < 0.03 && line < 0) {
                    // 毒チーズの数が最大数未満で、かつ5%の確率で出現
                    poisonCheesePositions.push({ x: x, y: y, image: images.poisonCheese });
                    poisonCheeseCount++; // 毒チーズの数をインクリメント
                    line = 32; // 10個先には生成されない
                } else {
                    // それ以外の場合はチーズを配置
                    cheesePositions.push({ x: x, y: y, image: images.cheese });
                }
            }
            line--;
        }
    }
    return { poisonCheesePositions, cheesePositions, rainbowCheesePosition };
}




//迷路とプレイヤーの衝突判定 ----------------------------------------------------------------------------------------------
function checkMazeCollision(x, y) {
    const playerPosition = game.maze[y][x];

    if (powerupEffectDuration > 0) {
        // プレイヤーの周囲8つの位置をチェック
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (game.maze[y + i] && game.maze[y + i][x + j] === 1) {
                    game.player.moving = false; // 移動を停止
                    return true; // 衝突した場合はtrueを返す
                } else if (game.maze[y + i] && (game.maze[y + i][x + j] === 2 || game.maze[y + i][x + j] === 3)) {
                    game.maze[y + i][x + j] = 0; // 2と3の壁を壊す
                    if (!blokenSound.paused) {
                        blokenSound.currentTime = 0;
                    }
                    blokenSound.play();
                    game.player.score += 50; // スコアに50点を追加
                }
            }
        }
    } else if (playerPosition === 1 || playerPosition === 2 || playerPosition === 3) {
        // 壁に衝突した場合の処理
        game.player.moving = false; // 移動を停止
        return true; // 衝突した場合はtrueを返す
    }
    return false; // 衝突していない場合はfalseを返す
}

//迷路と猫の衝突判定 ----------------------------------------------------------------------------------------------
function checkCatMazeCollision(cat, x, y) {
    const catPosition = game.maze[y][x];
    if (catPosition === 1 || x === cat.prevX && y === cat.prevY || catPosition === 2 || catPosition === 3) {
        return true; // 衝突した場合はtrueを返す
    }
    cat.moving = false; // 移動を停止
    return false; // 衝突していない場合はfalseを返す
}

function checkCatCatCollision(x, y, currentIndex) {
    return game.cats.some((otherCat, index) => index !== currentIndex && otherCat.x === x && otherCat.y === y);
}

function gameStart() {
    game.state = 'playing';
    window.gameState = game.state;
    if (!playAudio.paused) {
        playAudio.currentTime = 0;
    }
    playAudio.play();
    achievements.playCount += 1;
    Object.assign(game, {
        level: 1,
        player: { x: 27, y: 8, direction: 'right', imageKey: 'mouseRight', score: 0, moving: false, lives: 3 },
        cheese: [],
        cats: [ // 猫を配列で管理
            { x: 10, y: 3, prevX: 0, prevY: 0, direction: 'left', imageKey: 'catRight', moving: false },
            { x: 5, y: 14, prevX: 0, prevY: 0, direction: 'right', imageKey: 'catLeft', moving: false },
            { x: 40, y: 14, prevX: 0, prevY: 0, direction: 'left', imageKey: 'catLeft', moving: false },
        ],
        maze: generateMaze(52, 18)
    });

    const generatedItems = generateItems(game.maze);
    game.cheese = generatedItems.cheesePositions;
    game.poisonCheese = generatedItems.poisonCheesePositions;
    game.rainbowCheese = generatedItems.rainbowCheesePosition;
    updated = true;
}

function howToPlayStart() {
    if (!playAudio.paused) {
        playAudio.currentTime = 0;
    }
    playAudio.play();
    game.state = 'howToPlay';
    updated = true;
    setTimeout(() => {
        game.selection = 'back';
    }, 500);
}

//Playerの操作-----------------------------------------------------------------------
function handleKeyDown(event) {
    event.preventDefault(); // デフォルトのキー機能を一時的に無効に
    if (game.state === 'title') {
        switch (event.key.toLowerCase()) { // キーの大文字小文字を区別しない
            case 'arrowup':
            case 'arrowdown':
            case 'w':
            case 's':
                game.selection = game.selection === 'start' ? 'howToPlay' : 'start';
                if (!cursorSound.paused) {
                    cursorSound.currentTime = 0;
                }
                cursorSound.play();
                updated = true;
                break;
            case ' ':
            case 'enter':
                if (game.selection === 'start') {
                    gameStart();

                } else if (game.selection === 'howToPlay') {
                    howToPlayStart();
                }
                break;
        }
    }

    if (game.state === 'howToPlay') {
        if ((event.key.toLowerCase() === ' ' || event.key.toLowerCase() === 'enter') && game.selection === 'back') { // キーの大文字小文字を区別しない
            if (!playAudio.paused) {
                playAudio.currentTime = 0;
            }
            playAudio.play();
            game.state = 'title';
            game.selection = 'start';
            updated = true;
        }
    }

    if (game.state === 'playing') {
        let newDirection;
        let newImageKey;
        switch (event.key.toLowerCase()) { // 小文字に変換して比較
            case 'arrowup':
            case 'w':
                newDirection = 'top';
                newImageKey = 'mouseUp';
                break;
            case 'arrowdown':
            case 's':
                newDirection = 'down';
                newImageKey = 'mouseDown';
                break;
            case 'arrowleft':
            case 'a':
                newDirection = 'left';
                newImageKey = 'mouseLeft';
                break;
            case 'arrowright':
            case 'd':
                newDirection = 'right';
                newImageKey = 'mouseRight';
                break;
            case ' ':
                // game.cheese = [];
                break;
        }
        if (newDirection && newImageKey) {
            // 移動方向と画像キーのみを更新し、移動中フラグは変更しない
            game.player.direction = newDirection;
            game.player.imageKey = newImageKey;
            if (!game.player.moving) {
                // プレイヤーが移動中でない場合のみ、移動を開始する
                game.player.moving = true;
            }
        }
    }

    if (game.state === 'scoreScreen') {
        if ((event.key.toLowerCase() === ' ' || event.key.toLowerCase() === 'enter') && game.selection === 'back') { // キーの大文字小文字を区別しない
            document.querySelectorAll('audio').forEach(audio => audio.pause());
            document.querySelectorAll('audio').forEach(audio => {
                audio.currentTime = 0;
            });
            if (!playAudio.paused) {
                playAudio.currentTime = 0;
            }
            playAudio.play();

            game.maze = generateMaze(52, 18);
            document.getElementById('lives1').src = 'img/dotheart.png';
            document.getElementById('lives2').src = 'img/dotheart.png';
            document.getElementById('lives3').src = 'img/dotheart.png';
            game.state = 'title';
            game.selection = 'start';
            updated = true;
        }
    }
}

function displayEmotionImage(x, y) {
    const emotionImage = images['heart']; // 事前に読み込んだ感情の絵文字画像
    ctx.drawImage(emotionImage, x * tileSize, y * tileSize, tileSize, tileSize);
}


//ゲームの処理を行う関数↓ -------------------------------------------------------------

function updateGame() {
    // ゲームの状態をグローバル変数に保存して他のJSファイルからアクセス可能にする

    // プレイヤーがチーズと重なったかの判定と、チーズの削除、スコアの更新
    game.cheese = game.cheese.filter(cheese => {
        if (powerupEffectDuration > 0) {
            // プレイヤーの周囲8つの位置をチェック
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    if (cheese.x === game.player.x + j && cheese.y === game.player.y + i) {
                        game.player.score += 100; // スコアに100点を追加
                        achievements.cheeseCount += 1; // チーズを取った回数を1増やす
                        return false; // このチーズを配列から削除
                    }
                }
            }
        } else if (cheese.x === game.player.x && cheese.y === game.player.y) {
            game.player.score += 100; // スコアに100点を追加
            achievements.cheeseCount += 1; // チーズを取った回数を1増やす
            return false; // このチーズを配列から削除
        }
        return true; // このチーズを配列に残す
    });


    // プレイヤーがpoisonCheeseを取ったら、チーズの削除操作の反転
    game.poisonCheese = game.poisonCheese.filter(poisonCheese => {
        if (poisonCheeseEffectDuration > 0) {
            return true; // この毒チーズを配列に残す
        } else if (poisonCheese.x === game.player.x && poisonCheese.y === game.player.y) {
            poisonCheeseEffectDuration = 15; //playerの移動15回分。
            achievements.poisonCheeseCount += 1; // 毒チーズを取った回数を1増やす
            return false; // この毒チーズを配列から削除
        }
        return true; // この毒チーズを配列に残す
    });


    // プレイヤーがレインボーチーズと重なったかの判定と、レインボーチーズの削除、スコアの更新
    game.rainbowCheese = game.rainbowCheese.filter(rainbowCheese => {
        if (rainbowCheese.x === game.player.x && rainbowCheese.y === game.player.y) {
            if (!rainbowSound.paused) {
                rainbowSound.currentTime = 0;
            }
            rainbowSound.play();
            achievements.rainbowCheeseCount += 1; // レインボーチーズのカウントを1増やす
            game.player.score += 3000; // スコアに3000点を追加
            powerupEffectDuration = 40;
            return false; // このレインボーチーズを配列から削除
        }
        return true; // このレインボーチーズを配列に残す
    });

    // プレイヤーが猫に捕まったかの判定と、プレイヤーのライフの減少、ゲームオーバーの処理
    game.cats.forEach(cat => {
        if (powerupEffectDuration > 0 && game.player.x === cat.x && game.player.y === cat.y) {

        } else if (game.player.x === cat.x && game.player.y === cat.y) {
            // プレイヤーのライフを減らす
            game.player.lives -= 1;
            achievements.caughtByCatCount += 1; // 猫に捕まった回数を1増やす
            // HPが減るアニメーションを再生
            araraSound.play();

            playLivesDecreaseAnimation();
            if (game.player.lives > 0 && game.state === 'playing') {
                game.state = 'loading';
                poisonCheeseEffectDuration = 0;

                const gameElement = document.getElementById('game');
                gameElement.src = '../img/cheeseTransition.gif';
                setTimeout(() => {
                    setTimeout(() => {
                        gameElement.src = '../img/dummy.png'; // GIFを再設定して再生リセット
                    }, 600);
                    // ゲームオーバーではない場合、プレイヤーと猫の位置を初期値に戻す
                    let newPosition;
                    do {
                        newPosition = {
                            x: Math.floor(Math.random() * game.maze[0].length),
                            y: Math.floor(Math.random() * game.maze.length)
                        };
                    } while (game.maze[newPosition.y][newPosition.x] !== 0 || game.poisonCheese.some(poisonCheese => poisonCheese.x === newPosition.x && poisonCheese.y === newPosition.y)); // 壁がない場所かつ毒チーズがない場所を探す
                    game.player.x = newPosition.x;
                    game.player.y = newPosition.y;
                    game.player.direction = 'right';
                    game.player.imageKey = 'mouseRight'; // 初期の画像キーに戻す
                    game.player.moving = false; // 移動を停止
                    let occupiedPositions = new Set(); // 既に配置された位置を記録するセット
                    game.cats.forEach(cat => {
                        do {
                            newPosition = {
                                x: Math.floor(Math.random() * game.maze[0].length),
                                y: Math.floor(Math.random() * game.maze.length)
                            };
                        } while (
                            game.maze[newPosition.y][newPosition.x] !== 0 ||
                            occupiedPositions.has(`${newPosition.x},${newPosition.y}`) ||
                            (newPosition.x >= game.player.x - 5 && newPosition.x <= game.player.x + 5 &&
                                newPosition.y >= game.player.y - 5 && newPosition.y <= game.player.y + 5)
                        ); // 壁がない場所かつ他の猫がいない場所かつプレイヤーの周囲縦10×横10の範囲ではない場所を探す
                        cat.x = newPosition.x; // 猫の位置をランダムに設定
                        cat.y = newPosition.y;
                        occupiedPositions.add(`${newPosition.x},${newPosition.y}`); // 位置を記録
                        cat.direction = 'left';
                        cat.imageKey = 'catRight'; // 初期の画像キーに戻す
                        cat.moving = false; // 移動を停止
                        game.state = 'playing';
                    });
                }, 700); // 3秒後に初期化の処理を行う
            } else {// ライフが0、ゲームオーバーの場合
                handleGameOver();
            }
        }
    });

    // すべてのチーズを集めたかの判定、処理。
    if (game.state === 'playing' && game.cheese.length === 0) { // 勝利時の処理---------------------------------
        game.state = 'victory';
        powerupEffectDuration = 0;
        poisonCheeseEffectDuration = 0;
        if (!victorySound.paused) {
            victorySound.currentTime = 0;
        }
        victorySound.play();
        game.level++;
        achievements.maxLevel += 1; // 最高レベルを1増やす
        setTimeout(() => {
            game.maze = generateMaze(52, 18);
            // プレイヤーと猫の位置を初期値に戻す
            let newPosition;
            do {
                newPosition = {
                    x: Math.floor(Math.random() * game.maze[0].length),
                    y: Math.floor(Math.random() * game.maze.length)
                };
            } while (game.maze[newPosition.y][newPosition.x] !== 0 || game.poisonCheese.some(poisonCheese => poisonCheese.x === newPosition.x && poisonCheese.y === newPosition.y)); // 壁がない場所かつ毒チーズがない場所を探す
            game.player.x = newPosition.x;
            game.player.y = newPosition.y;
            game.player.direction = 'right';
            game.player.imageKey = 'mouseRight'; // 初期の画像キーに戻す
            game.player.moving = false; // 移動を停止
            let occupiedPositions = new Set(); // 既に配置された位置を記録するセット

            const generatedItems = generateItems(game.maze);
            game.cheese = generatedItems.cheesePositions;
            game.poisonCheese = generatedItems.poisonCheesePositions;
            game.rainbowCheese = generatedItems.rainbowCheesePosition;
            updated = true;

            game.cats.push(
                { x: 20, y: 10, prevX: 0, prevY: 0, direction: 'left', imageKey: 'catRight', moving: false },
                { x: 30, y: 15, prevX: 0, prevY: 0, direction: 'right', imageKey: 'catLeft', moving: false }
            );

            game.cats.forEach(cat => {
                do {
                    newPosition = {
                        x: Math.floor(Math.random() * game.maze[0].length),
                        y: Math.floor(Math.random() * game.maze.length)
                    };
                } while (
                    game.maze[newPosition.y][newPosition.x] !== 0 ||
                    occupiedPositions.has(`${newPosition.x},${newPosition.y}`) ||
                    (newPosition.x >= game.player.x - 5 && newPosition.x <= game.player.x + 5 &&
                        newPosition.y >= game.player.y - 5 && newPosition.y <= game.player.y + 5)
                ); // 壁がない場所かつ他の猫がいない場所かつプレイヤーの周囲縦10×横10の範囲ではない場所を探す
                cat.x = newPosition.x; // 猫の位置をランダムに設定
                cat.y = newPosition.y;
                occupiedPositions.add(`${newPosition.x},${newPosition.y}`); // 位置を記録
                cat.direction = 'left';
                cat.imageKey = 'catRight'; // 初期の画像キーに戻す
                cat.moving = false; // 移動を停止
                game.state = 'playing';
            });
        }, 700);
    }
}

//Hpが減った時に画像を変更する関数↓-------------------------------------------------------
function playLivesDecreaseAnimation() {
    if (game.player.lives === 2) {
        const lives3 = document.getElementById('lives3');
        lives3.src = 'img/dotheart.gif';
        setTimeout(() => {
            lives3.src = 'img/blackHeart.png';
        }, 1000);
    } else if (game.player.lives === 1) {
        const lives2 = document.getElementById('lives2');
        lives2.src = 'img/dotheart.gif';
        setTimeout(() => {
            lives2.src = 'img/blackHeart.png';
        }, 1000);
    } else if (game.player.lives === 0) {
        const lives1 = document.getElementById('lives1');
        lives1.src = 'img/dotheart.gif';
        setTimeout(() => {
            lives1.src = 'img/blackHeart.png';
        }, 1000);
    }
}


//ゲームオーバーの処理↓-------------------------------------------------------
function handleGameOver() {
    audioPlayer.pause();
    game.cats = []; // 猫をすべて削除
    game.player.moving = false; // プレイヤーの動きを停止
    game.state = 'loading';
    game.cheese = []; // チーズを全て削除

    saveScoreHistory(); //スコア履歴をキャッシュに保存
    updateAchievements();

    let row = 0;

    function dissolveWalls() {
        if (row < game.maze.length) {
            // 迷路の壁が上から順に消える演出
            for (let col = 0; col < game.maze[row].length; col++) {
                if (game.maze[row][col] === 1 || game.maze[row][col] === 2 || game.maze[row][col] === 3) {
                    game.maze[row][col] = 0; // 壁を消す
                }
            }
            if (!wallAudio.ended && wallAudio.currentTime > 0) {
                wallAudio.currentTime = 0;
            }
            wallAudio.play();
            updated = true;
            row++;
            setTimeout(dissolveWalls, 100); // 次の行の壁を消すためにタイマーを設定
        } else {
            game.state = 'gameover';
            updated = true;
            setTimeout(() => {
                document.querySelectorAll('audio').forEach(audio => audio.pause());
                document.querySelectorAll('audio').forEach(audio => {
                    audio.currentTime = 0;
                });
                game.state = 'scoreScreen';
                updated = true;
                setTimeout(() => {
                    game.selection = 'back';
                }, 400);
            }, 4000);
        }
    }
    dissolveWalls(); // 壁の消去を開始
}


//描画するための関数↓--------------------------------------------------------

// 猫の描画を更新
function drawCats() {
    game.cats.forEach(cat => {
        let imageKey;
        switch (cat.direction) {
            case 'top':
                imageKey = 'catUp';
                break;
            case 'down':
                imageKey = 'catDown';
                break;
            case 'right':
                imageKey = 'catRight';
                break;
            case 'left':
                imageKey = 'catLeft';
                break;
            default:
                imageKey = cat.imageKey; // 万が一directionが設定されていない場合のためのデフォルト
                break;
        }
        const catImage = images[imageKey];
        ctx.drawImage(catImage, cat.x * tileSize, cat.y * tileSize, tileSize, tileSize);
    });
}



function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#FDE44F'; // 背景色を黄色に再設定
    ctx.fillRect(0, 0, canvas.width, canvas.height); // キャンバス全体を黄色で塗りつぶす

    switch (game.state) {
        case 'title':
            audioPlayer.loop = true;
            audioPlayer.play(); //BGMの再生を開始
            document.getElementById('gameLeft').style.backgroundImage = "url('../img/packmouseTitle.png')";
            document.getElementById('gameRight').style.display = 'none';
            // 迷路の外周のみ描画
            for (let y = 0; y < game.maze.length; y++) {
                for (let x = 0; x < game.maze[y].length; x++) {
                    if ((y === 0 || y === game.maze.length - 1 || x === 0 || x === game.maze[y].length - 1) && game.maze[y][x] === 1) {
                        ctx.fillStyle = 'black';
                        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
                    }
                }
            }
            ctx.textAlign = 'left'; // title画面に戻ったらctx.textAlignを解除

            // ハイスコアの表示
            ctx.font = '30px DotGothic16';
            ctx.fillStyle = 'black';
            let highScoreText = 'High Score: ' + (game.scoreHistory[0] || 0);
            let highScoreWidth = ctx.measureText(highScoreText).width;
            ctx.fillText(highScoreText, (canvas.width * 2 / 3) - (highScoreWidth / 2), canvas.height / 2 - 40);

            break;

        case 'howToPlay':
            // 迷路の外周のみ描画
            for (let y = 0; y < game.maze.length; y++) {
                for (let x = 0; x < game.maze[y].length; x++) {
                    if ((y === 0 || y === game.maze.length - 1 || x === 0 || x === game.maze[y].length - 1) && game.maze[y][x] === 1) {
                        ctx.fillStyle = 'black';
                        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
                    }
                }
            }

            document.getElementById('gameLeft').style.backgroundImage = "";
            ctx.font = '20px DotGothic16';
            ctx.fillStyle = 'black';
            ctx.textAlign = 'center';
            ctx.fillText("CHEESE IT!! は猫から逃げながらチーズを集めるゲームです。", canvas.width / 2, canvas.height / 2 - 120);
            ctx.fillText("フィールド上の全てのチーズを食べ終わると、次のレベルに進みます", canvas.width / 2, canvas.height / 2 - 90);
            ctx.fillText("ハイスコアを目指して、チーズを沢山食べましょう！", canvas.width / 2, canvas.height / 2 - 60);

            ctx.fillText("W/↑ : 上方向に進む", canvas.width / 2, canvas.height / 2);
            ctx.fillText("A/← : 左方向に進む", canvas.width / 2, canvas.height / 2 + 30);
            ctx.fillText("S/↓ : 下方向に進む", canvas.width / 2, canvas.height / 2 + 60);
            ctx.fillText("D/→ : 右方向に進む", canvas.width / 2, canvas.height / 2 + 90);
            ctx.fillText("SPACE : 選択, エモート", canvas.width / 2, canvas.height / 2 + 120);

            ctx.fillText("> Back to the title", canvas.width / 2, canvas.height / 2 + 180);
            break;

        case 'playing':
            document.getElementById('gameLeft').style.backgroundImage = "";
            // 迷路の描画
            for (let y = 0; y < game.maze.length; y++) {
                for (let x = 0; x < game.maze[y].length; x++) {

                    if (game.maze[y][x] === 1) {
                        ctx.fillStyle = 'black';
                        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
                    } else if (game.maze[y][x] === 2) {
                        if (powerupEffectDuration > 0) {
                            ctx.drawImage(images.cheeseWall, x * tileSize, y * tileSize, tileSize, tileSize);
                        } else {
                            ctx.fillStyle = 'black';
                            ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
                        }
                    } else if (game.maze[y][x] === 3) {
                        if (powerupEffectDuration > 0) {
                            ctx.drawImage(images.cheeseWall, x * tileSize, y * tileSize, tileSize, tileSize);
                        } else {
                            ctx.fillStyle = '#9A6C3E';
                            ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
                        }
                    }
                }
            }

            // チーズの描画
            game.cheese.forEach(function (cheese) {
                ctx.drawImage(game.cheeseImage, cheese.x * tileSize + 5, cheese.y * tileSize + 5, 10, 10);
            });

            // 毒チーズの描画
            game.poisonCheese.forEach(function (poisonCheese) {
                ctx.drawImage(poisonCheese.image, poisonCheese.x * tileSize + 5, poisonCheese.y * tileSize + 5, 10, 10);
            });

            // レインボーチーズの描画
            game.rainbowCheese.forEach(function (rainbowCheese) {
                ctx.drawImage(rainbowCheese.image, rainbowCheese.x * tileSize + tileSize / 2 - 10, rainbowCheese.y * tileSize + tileSize / 2 - 10, 20, 20);
            });
            // プレイヤーの描画
            const playerImage = images[game.player.imageKey];
            if (poisonCheeseEffectDuration > 0) {
                ctx.filter = 'hue-rotate(180deg) saturate(300%)';
            }
            if (powerupEffectDuration > 0) {
                ctx.drawImage(playerImage, game.player.x * tileSize - tileSize, game.player.y * tileSize - tileSize, tileSize * 3, tileSize * 3);
            } else {
                ctx.drawImage(playerImage, game.player.x * tileSize, game.player.y * tileSize, tileSize, tileSize);
            }
            ctx.filter = 'none';



            // 猫の描画
            drawCats();
            break;

        case 'loading':
            // 迷路の描画
            for (let y = 0; y < game.maze.length; y++) {
                for (let x = 0; x < game.maze[y].length; x++) {
                    if (game.maze[y][x] === 1) {
                        ctx.fillStyle = 'black';
                        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
                    } else if (game.maze[y][x] === 2) {
                        ctx.fillStyle = 'black';
                        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
                    } else if (game.maze[y][x] === 3) {
                        ctx.fillStyle = '#9A6C3E';
                        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
                    }
                }
            }
            const playerImageLoading = images[game.player.imageKey];
            ctx.drawImage(playerImageLoading, game.player.x * tileSize, game.player.y * tileSize, tileSize, tileSize);
            break;
        case 'victory':
            ctx.font = '70px DotGothic16';
            ctx.fillStyle = 'black';
            const Winnertext = 'To the Next Level';
            const WinnertextWidth = ctx.measureText(Winnertext).width;
            const WinnertextX = canvas.width / 2 - WinnertextWidth / 2; // テキストを中央に配置
            const WinnertextY = canvas.height / 2; // テキストのY座標を中央に設定

            // テキストを中央に配置
            ctx.fillText(text, textX, textY);
            break;
        case 'gameover':
            document.getElementById('gameLeft').style.backgroundImage = "";            // ゲームオーバー画面の描画
            ctx.font = '70px DotGothic16';
            ctx.fillStyle = 'black';
            const text = 'Had cheese!';
            const textWidth = ctx.measureText(text).width;
            const textX = canvas.width / 2 - textWidth / 2 + 120; // テキストを右にずらして配置
            const textY = canvas.height / 2 + 20; // テキストのY座標を中央に設定

            const mouseDeadImage = images['mouseDead'];
            const imageX = canvas.width / 5; // 画像を右側中央に配置
            const imageY = canvas.height / 2 - 125; // 画像のY座標を中央に設定

            // テキストと画像を右にずらして配置
            ctx.fillText(text, textX, textY);
            ctx.drawImage(mouseDeadImage, imageX, imageY, 250, 250); // 画像のY座標を修正して中央に配置
            break;


        case 'scoreScreen':
            toBeContinued.loop = true;
            toBeContinued.play();
            document.getElementById('gameLeft').style.backgroundImage = "";
            document.getElementById('gameRight').style.display = 'block';
            // スコア画面の描画
            ctx.font = '24px DotGothic16';
            ctx.fillStyle = 'black';
            const leftAlignX = canvas.width / 4; // 画面の左半分の中央に左揃えで表示するためのX座標
            ctx.fillText('Final Score: ' + game.player.score, leftAlignX, 70);
            game.scoreHistory.forEach((score, index) => {
                ctx.fillText((index + 1) + '. ' + score, leftAlignX, 80 + 30 * (index + 1));
            });
            const backToTitleY = 90 + 30 * (game.scoreHistory.length + 1);
            ctx.fillText("> Back to the title", leftAlignX, backToTitleY);
    }

    // スコアを表示する
    document.getElementById('scoreDisplay').innerHTML = 'SCORE: ' + game.player.score;
}
function updatePlayer() {
    if (game.player.moving) {
        let newX = game.player.x;
        let newY = game.player.y;
        switch (game.player.direction) {
            case 'top':
                newY -= 1;
                break;
            case 'down':
                newY += 1;
                break;
            case 'left':
                newX -= 1;
                // プレイヤーが左端からさらに左に移動しようとした場合
                if (newX < 0 && (game.player.y === 8 || game.player.y === 9)) {
                    newX = 51; // 右端に移動
                }
                break;
            case 'right':
                newX += 1;
                // プレイヤーが右端からさらに右に移動しようとした場合
                if (newX > 51 && (game.player.y === 8 || game.player.y === 9)) {
                    newX = 0; // 左端に移動
                }
                break;
        }
        if (poisonCheeseEffectDuration > 0) {
            if (poisonSound.paused) {
                poisonSound.currentTime = 0;
            }
            poisonSound.play();
            // 毒チーズの効果時間中は操作を反転
            newX = game.player.x;
            newY = game.player.y;
            switch (game.player.direction) {
                case 'top':
                    newY += 1;
                    break;
                case 'down':
                    newY -= 1;
                    break;
                case 'left':
                    newX += 1;
                    // プレイヤーが右端からさらに右に移動しようとした場合
                    if (newX > 51 && (game.player.y === 8 || game.player.y === 9)) {
                        newX = 0; // 左端に移動
                    }
                    break;
                case 'right':
                    newX -= 1;
                    // プレイヤーが左端からさらに左に移動しようとした場合
                    if (newX < 0 && (game.player.y === 8 || game.player.y === 9)) {
                        newX = 51; // 右端に移動
                    }
                    break;
            }
        }
        if (!checkMazeCollision(newX, newY)) {
            game.player.x = newX;
            game.player.y = newY;
        }
    }
}

function updateCats() {
    game.cats.forEach((cat, index) => {
        if (!cat.moving) {
            if (powerupEffectDuration > 0) {
                // プレイヤーがpowerup状態の場合、猫はプレイヤーから逃げる
                let directionX = cat.x - game.player.x;
                let directionY = cat.y - game.player.y;

                let priority = Math.abs(directionX) > Math.abs(directionY) ? ['x', 'y'] : ['y', 'x'];

                for (let i = 0; i < priority.length; i++) {
                    if (priority[i] === 'x' && directionX !== 0) {
                        let newX = cat.x + Math.sign(directionX);
                        if (!checkCatMazeCollision(cat, newX, cat.y) && !checkCatCatCollision(newX, cat.y, index)) {
                            cat.prevX = cat.x;
                            cat.x = newX;
                            cat.direction = Math.sign(directionX) === 1 ? 'right' : 'left';
                            break;
                        }
                    } else if (priority[i] === 'y' && directionY !== 0) {
                        let newY = cat.y + Math.sign(directionY);
                        if (!checkCatMazeCollision(cat, cat.x, newY) && !checkCatCatCollision(cat.x, newY, index)) {
                            cat.prevY = cat.y;
                            cat.y = newY;
                            cat.direction = Math.sign(directionY) === 1 ? 'down' : 'top';
                            break;
                        }
                    }
                }
            } else {
                cat.moving = true;
                let newX = cat.x;
                let newY = cat.y;
                let directionX = game.player.x - cat.x;
                let directionY = game.player.y - cat.y;

                let priority = Math.abs(directionX) > Math.abs(directionY) ? ['x', 'y'] : ['y', 'x'];
                let moved = false;

                for (let i = 0; i < priority.length && !moved; i++) {
                    if (priority[i] === 'x' && directionX !== 0) {
                        newX = cat.x + Math.sign(directionX);
                        // 猫が左端からさらに左に移動しようとした場合
                        if (newX < 0 && (cat.y === 8 || cat.y === 9)) {
                            newX = 51; // 右端に移動
                        }
                        // 猫が右端からさらに右に移動しようとした場合
                        if (newX > 51 && (cat.y === 8 || cat.y === 9)) {
                            newX = 0; // 左端に移動
                        }
                        if (!checkCatMazeCollision(cat, newX, cat.y) && !checkCatCatCollision(newX, cat.y, index)) {
                            cat.prevX = cat.x;
                            cat.x = newX;
                            moved = true;
                            cat.direction = Math.sign(directionX) === 1 ? 'right' : 'left';
                        }
                    } else if (priority[i] === 'y' && directionY !== 0) {
                        newY = cat.y + Math.sign(directionY);
                        if (!checkCatMazeCollision(cat, cat.x, newY) && !checkCatCatCollision(cat.x, newY, index)) {
                            cat.prevY = cat.y;
                            cat.y = newY;
                            moved = true;
                            cat.direction = Math.sign(directionY) === 1 ? 'down' : 'top';
                        }
                    }
                }

                if (!moved) {
                    let alternativeRoutes = priority[0] === 'x' ? [
                        { x: cat.x, y: cat.y + 1 },
                        { x: cat.x, y: cat.y - 1 },
                        { x: cat.x + 1, y: cat.y },
                        { x: cat.x - 1, y: cat.y }
                    ] : [
                        { x: cat.x + 1, y: cat.y },
                        { x: cat.x - 1, y: cat.y },
                        { x: cat.x, y: cat.y + 1 },
                        { x: cat.x, y: cat.y - 1 }
                    ];

                    alternativeRoutes = alternativeRoutes.filter(route =>
                        !checkCatMazeCollision(cat, route.x, route.y) &&
                        !checkCatCatCollision(route.x, route.y, index) &&
                        !(route.x === cat.prevX && route.y === cat.prevY)
                    );

                    if (alternativeRoutes.length > 0) {
                        let selectedRoute = alternativeRoutes[0];
                        cat.prevX = cat.x;
                        cat.prevY = cat.y;
                        cat.x = selectedRoute.x;
                        cat.y = selectedRoute.y;
                        moved = true;
                        // 移動方向を更新
                        if (selectedRoute.x > cat.x) {
                            cat.direction = 'right';
                        } else if (selectedRoute.x < cat.x) {
                            cat.direction = 'left';
                        } else if (selectedRoute.y > cat.y) {
                            cat.direction = 'down';
                        } else if (selectedRoute.y < cat.y) {
                            cat.direction = 'top';
                        }
                    }
                }
                cat.moving = false;
            }
        }

    });
}

function drawButtons(){
    switch (game.state) {
        case 'title':
            // スタートの表示
            let startText = 'Start';
            let startWidth = ctx.measureText(startText).width;
            let startHeight = parseInt(ctx.font, 10); // フォントサイズを取得して整数に変換
            ctx.fillStyle = 'black'; // テキストの色を設定
            ctx.fillText(startText, (canvas.width * 2 / 3) - (startWidth / 2), canvas.height / 2 + (startHeight / 2));
            ctx.fillText(game.selection === 'start' ? '>' : '', (canvas.width * 2 / 3) - (startWidth / 2) - 30, canvas.height / 2 + (startHeight / 2));
            // スタートをクリック可能にする
            document.getElementById('gameCanvas').addEventListener('click', function (event) {
                let startX = (canvas.width * 2 / 3) - (startWidth / 2) - 30;
                let endX = (canvas.width * 2 / 3) + (startWidth / 2) - 30;
                let startY = canvas.height / 2 - (startHeight / 2);
                let endY = canvas.height / 2 + (startHeight / 2);
                if (event.clientX > startX && event.clientX < endX &&
                    event.clientY > startY && event.clientY < endY) {
                    gameStart();
                }
            });

            // プレイ方法の表示
            let howToPlayText = 'How to Play';
            let howToPlayWidth = ctx.measureText(howToPlayText).width;
            let howToPlayHeight = parseInt(ctx.font, 10); // フォントサイズを取得して整数に変換
            ctx.fillStyle = 'black'; // テキストの色を設定
            ctx.fillText(howToPlayText, (canvas.width * 2 / 3) - (howToPlayWidth / 2), canvas.height / 2 + (howToPlayHeight / 2) + 40);
            ctx.fillText(game.selection === 'howToPlay' ? '>' : '', (canvas.width * 2 / 3) - (howToPlayWidth / 2) - 30, canvas.height / 2 + (howToPlayHeight / 2) + 40);
            // プレイ方法をクリック可能にする
            document.getElementById('gameCanvas').addEventListener('click', function (event) {
                let howToPlayStartX = (canvas.width * 2 / 3) - (howToPlayWidth / 2) - 30;
                let howToPlayEndX = (canvas.width * 2 / 3) + (howToPlayWidth / 2) - 30;
                let howToPlayStartY = canvas.height / 2 + 40 - (howToPlayHeight / 2);
                let howToPlayEndY = canvas.height / 2 + 40 + (howToPlayHeight / 2);
                if (event.clientX > howToPlayStartX && event.clientX < howToPlayEndX &&
                    event.clientY > howToPlayStartY && event.clientY < howToPlayEndY) {
                    howToPlayStart();
                }
            });
        case 'howToPlay':


        case 'scoreScreen':


    }
}


// ゲームの更新と描画-------------------------------------------------------
let playerMoveCounter = 0;
let catMoveCounter = 0;
let poisonCheeseEffectDuration = 0; // 毒チーズの効果時間
let powerupEffectDuration = 0; // パワーアップの効果時間


const playerMoveInterval = 10; // プレイヤーの移動間隔をフレーム単位で設定
const catMoveInterval = 18; // 猫の移動間隔をフレーム単位で設定


const UPDATE_LOAD_COEFF = 0.5;
let targetInterval = 1000 / 60; // 60 FPSを目標とする
let prevTime = Date.now() - targetInterval;
let updated = false;

function gameLoop() {
    let currentTime = Date.now();
    let frameUpdated = false;

    while (currentTime - prevTime > targetInterval * 0.5) {
        frameUpdated = true;
        prevTime += targetInterval;
        const now = Date.now();
        const updateTime = now - currentTime;

        if (updateTime > targetInterval * UPDATE_LOAD_COEFF) {
            // 処理が重い場合はループを抜ける
            if (prevTime < now - targetInterval) {
                // 遅延が蓄積しないように調整
                prevTime = now - targetInterval;
            }
            break;
        }
    }

    if(frameUpdated){
        if (gamePlaying === true && game.state === 'playing') {
            if (playerMoveCounter >= playerMoveInterval) {
                updatePlayer(); // プレイヤーの位置を更新
                playerMoveCounter = 0; // カウンターをリセット
                poisonCheeseEffectDuration--; // 毒チーズの効果時間
                powerupEffectDuration--; // パワーアップの効果時間
                updated = true; // 更新フラグをtrueに設定
            }
            if (catMoveCounter >= catMoveInterval) {
                updateCats(); // 猫の位置を更新
                catMoveCounter = 0; // カウンターをリセット
                updated = true; // 更新フラグをtrueに設定
            }
        }

        if (updated && gamePlaying === true) {
            window.gameState = game.state;
            if (game.state === 'playing') {
                updateGame(); // その他のゲームの更新処理
            }
            drawGame(); // ゲームの描画
        }
        drawButtons();

        playerMoveCounter++;
        catMoveCounter++;
    }

    requestAnimationFrame(gameLoop); // フレームの終わりにgameLoopを呼び出すことで、ゲームをフレーム単位で管理
}