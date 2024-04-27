function appendScript(URL) {
    var el = document.createElement('script');
    el.src = URL;
    el.type = 'module'; // typeをmoduleに設定
    document.body.appendChild(el);
};

appendScript('js/sounds.js');
appendScript('js/switchGameVisibility.js');
appendScript('js/generateMaze.js');


import { generateMaze } from './GenerateMaze.js';
window.gamePlaying = false;

// 画像の読み込み------------------------------------------------------------------------------
const images = {};

function loadImages(callback) {
    let loadedImagesCount = 0;
    const imageSources = {
        catDown: '../svg/catDown.svg',
        catUp: '../svg/catUp.svg',
        catLeft: '../svg/catLeft.svg',
        catRight: '../svg/catRight.svg',
        mouseDown: '../svg/mouseDown.svg',
        mouseUp: '../svg/mouseUp.svg',
        mouseLeft: '../svg/mouseLeft.svg',
        mouseRight: '../svg/mouseRight.svg',
        cheese: '../svg/cheese.svg',
        mouseDead: '../svg/mouseDead.svg',
        title: '../img/packmouseTitle.png',
        heart: '../svg/emote/heart.svg',
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
    state: 'title', // ゲームの状態を追加 ('title','howToPlay','playing',"gameover', 'scoreScreen')
    player: { x: 26, y: 8, direction: 'right', imageKey: 'mouseRight', score: 0, moving: false, lives: 3 },
    cheese: [],
    cats: [ // 猫を配列で管理
        { x: 10, y: 3, prevX: 0, prevY: 0, direction: 'left', imageKey: 'catRight', moving: false },
        { x: 5, y: 14, prevX: 0, prevY: 0, direction: 'right', imageKey: 'catLeft', moving: false },
        { x: 25, y: 15, prevX: 0, prevY: 0, direction: 'right', imageKey: 'catLeft', moving: false },
        { x: 40, y: 14, prevX: 0, prevY: 0, direction: 'left', imageKey: 'catLeft', moving: false },
        { x: 46, y: 3, prevX: 0, prevY: 0, direction: 'right', imageKey: 'catLeft', moving: false },
    ],
    maze: generateMaze(50, 18),
    cheeseImage: null,
    scoreHistory: JSON.parse(localStorage.getItem('scoreHistory') || '[]') // スコア履歴をキャッシュから読み込む
};

// スコア履歴をキャッシュに保存する関数
function saveScoreHistory() {
    localStorage.setItem('scoreHistory', JSON.stringify(game.scoreHistory));
}



// 迷路のサイズ設定、迷路のサイズに合わせたキャンパス設定--------------------------------------------
const tileSize = 25;// 迷路の1マスの幅と高さを定義

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = game.maze[0].length * tileSize; // キャンバスの幅を迷路の幅に合わせて調整
canvas.height = game.maze.length * tileSize; // キャンバスの高さを迷路の高さに合わせて調整
document.getElementById('game-wrapper').style.width = `${canvas.width}px`;
ctx.fillStyle = '#FDE44F'; // 背景色を黄色に変更
ctx.fillRect(0, 0, canvas.width, canvas.height); // キャンバス全体を黄色で塗りつぶす


// ゲームの初期化---------------------------------------------------------------------------------
export function initGame() {
    loadImages(() => {
        game.cheeseImage = images.cheese; // チーズの画像を設定
        window.addEventListener('keydown', handleKeyDown);
        gameLoop();
    });
}

// チーズの生成-----------------------------------------------------------------------------------
function generateCheesePositions(maze) {
    let cheesePositions = [];
    for (let y = 0; y < maze.length; y++) {
        for (let x = 0; x < maze[y].length; x++) {
            if (maze[y][x] === 0) { // 壁がない場所を探す
                cheesePositions.push({ x: x, y: y, image: images.cheese }); // 壁がない場所にチーズを配置
            }
        }
    }
    return cheesePositions;
}






//迷路とプレイヤーの衝突判定 ----------------------------------------------------------------------------------------------
function checkMazeCollision(x, y) {
    // プレイヤーの新しい位置が迷路の範囲内にあるか確認
    if (y >= 0 && y < game.maze.length && x >= 0 && x < game.maze[0].length) {
        const playerPosition = game.maze[y][x];
        if (playerPosition === 1) {
            // 壁に衝突した場合の処理
            game.player.moving = false; // 移動を停止
            return true; // 衝突した場合はtrueを返す
        }
    } else {
        game.player.moving = false; // 移動を停止
    }
    return false; // 衝突していない場合はfalseを返す
}

//迷路と猫の衝突判定 ----------------------------------------------------------------------------------------------
function checkCatMazeCollision(cat, x, y) {
    // 猫の新しい位置が迷路の範囲内にあるか確認
    if (y >= 0 && y < game.maze.length && x >= 0 && x < game.maze[0].length) {
        const catPosition = game.maze[y][x];
        if (catPosition === 1) {
            return true; // 衝突した場合はtrueを返す
        } else if (x === cat.prevX && y === cat.prevY) {
            return true; // 以前の位置に戻ろうとした場合はtrueを返す
        }
    } else {
        cat.moving = false; // 移動を停止
    }
    return false; // 衝突していない場合はfalseを返す
}


//Playerの操作-----------------------------------------------------------------------
function handleKeyDown(event) {
    if (game.state === 'title') {
        switch (event.key.toLowerCase()) { // キーの大文字小文字を区別しない
            case 'arrowup':
            case 'arrowdown':
            case 'w':
            case 's':
                game.selection = game.selection === 'start' ? 'howToPlay' : 'start';
                if (!playAudio.paused) {
                    playAudio.currentTime = 0;
                }
                playAudio.play();
                break;
            case ' ':
                if (game.selection === 'start') {
                    game.state = 'playing';
                    Object.assign(game, {
                        player: { x: 26, y: 8, direction: 'right', imageKey: 'mouseRight', score: 0, moving: false, lives: 3 },
                        cheese: [],
                        cats: [ // 猫を配列で管理
                            { x: 10, y: 3, prevX: 0, prevY: 0, direction: 'left', imageKey: 'catRight', moving: false },
                            { x: 5, y: 14, prevX: 0, prevY: 0, direction: 'right', imageKey: 'catLeft', moving: false },
                            { x: 25, y: 15, prevX: 0, prevY: 0, direction: 'right', imageKey: 'catLeft', moving: false },
                            { x: 40, y: 14, prevX: 0, prevY: 0, direction: 'left', imageKey: 'catLeft', moving: false },
                            { x: 46, y: 3, prevX: 0, prevY: 0, direction: 'right', imageKey: 'catLeft', moving: false },
                        ],
                        maze: generateMaze(50, 18)
                    });
                    game.cheese = generateCheesePositions(game.maze);
                } else if (game.selection === 'howToPlay') {
                    game.state = 'howToPlay';
                    console.log('ゲームの状態が変更されました: ' + game.state);
                    setTimeout(() => {
                        game.selection = 'back';
                    }, 500);
                }
                break;
        }
    }

    if (game.state === 'howToPlay') {
        if (event.key.toLowerCase() === ' ' && game.selection === 'back') { // キーの大文字小文字を区別しない
            game.state = 'title';
            game.selection = 'start';
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
                displayEmotionImage(game.player.x, game.player.y);
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
        if (event.key.toLowerCase() === ' ' && game.selection === 'back') { // キーの大文字小文字を区別しない
            document.querySelectorAll('audio').forEach(audio => audio.pause());
            game.maze = generateMaze(50, 18);
            document.getElementById('lives1').src = 'img/dotheart.png';
            document.getElementById('lives2').src = 'img/dotheart.png';
            document.getElementById('lives3').src = 'img/dotheart.png';
<br />            game.state = 'title';
            game.selection = 'start';
        }
    }
}

function displayEmotionImage(x, y) {
    const emotionImage = images['heart']; // 事前に読み込んだ感情の絵文字画像
    ctx.drawImage(emotionImage, x * tileSize, y * tileSize, tileSize, tileSize);
}





//ゲームの処理を行う関数↓ -------------------------------------------------------------

function updateGame() {
    // プレイヤーがチーズと重なったかの判定と、チーズの削除、スコアの更新
    game.cheese = game.cheese.filter(cheese => {
        if (cheese.x === game.player.x && cheese.y === game.player.y) {
            game.player.score += 100; // スコアに100点を追加
            return false; // このチーズを配列から削除
        }
        return true; // このチーズを配列に残す
    });

    // プレイヤーが猫に捕まったかの判定と、プレイヤーのライフの減少、ゲームオーバーの処理
    game.cats.forEach(cat => {
        if (game.player.x === cat.x && game.player.y === cat.y) {
            // プレイヤーのライフを減らす
            game.player.lives -= 1;
            // HPが減るアニメーションを再生
            playLivesDecreaseAnimation();

            if (game.player.lives > 0) {
                // ゲームオーバーではない場合、プレイヤーと猫の位置を初期値に戻す
                alert("猫に捕まった! 残りライフ: " + game.player.lives);
                let newPosition;
                do {
                    newPosition = {
                        x: Math.floor(Math.random() * game.maze[0].length),
                        y: Math.floor(Math.random() * game.maze.length)
                    };
                } while (game.maze[newPosition.y][newPosition.x] !== 0); // 壁がない場所を探す
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
                        (newPosition.x >= game.player.x - 3 && newPosition.x <= game.player.x + 3 &&
                            newPosition.y >= game.player.y - 2 && newPosition.y <= game.player.y + 2)
                    ); // 壁がない場所かつ他の猫がいない場所かつプレイヤーの周囲縦5×横7の範囲ではない場所を探す
                    cat.x = newPosition.x; // 猫の位置をランダムに設定
                    cat.y = newPosition.y;
                    occupiedPositions.add(`${newPosition.x},${newPosition.y}`); // 位置を記録
                    cat.direction = 'left';
                    cat.imageKey = 'catRight'; // 初期の画像キーに戻す
                    cat.moving = false; // 移動を停止
                });
            } else {// ライフが0、ゲームオーバーの場合
                handleGameOver();
            }
        }
    });

    // すべてのチーズを集めたかの判定、処理。
    if (game.cheese.length === 0 && gamePlaying === false) {
        alert("You Win!");
        // 勝利時の処理
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
    game.scoreHistory.push(game.player.score);
    game.scoreHistory.sort((a, b) => b - a); // スコア履歴を高い順にソート
    game.scoreHistory = game.scoreHistory.slice(0, 10);  // 上位10位のスコアのみを保持

    localStorage.setItem('highScore', JSON.stringify(game.scoreHistory[0])); // 最高スコアをlocalStorageに保存
    saveScoreHistory(); //スコア履歴をキャッシュに保存
    let row = 0;

    function dissolveWalls() {
        if (row < game.maze.length) {
            // 迷路の壁が上から順に消える演出
            for (let col = 0; col < game.maze[row].length; col++) {
                if (game.maze[row][col] === 1) {
                    game.maze[row][col] = 0; // 壁を消す
                }
            }
            if (!wallAudio.ended && wallAudio.currentTime > 0) {
                wallAudio.currentTime = 0;
            }
            wallAudio.play();
            row++;
            setTimeout(dissolveWalls, 100); // 次の行の壁を消すためにタイマーを設定
        } else {
            game.state = 'gameover';
            setTimeout(() => {
                document.querySelectorAll('audio').forEach(audio => audio.pause());
                game.state = 'scoreScreen';
                setTimeout(() => {
                    game.selection = 'back';
                }, 400);
            }, 4000);
        }
    }
    dissolveWalls(); // 壁の消去を開始
}

function checkCatCatCollision(x, y, currentIndex) {
    return game.cats.some((otherCat, index) => index !== currentIndex && otherCat.x === x && otherCat.y === y);
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
            // 迷路の外周のみ描画
            for (let y = 0; y < game.maze.length; y++) {
                for (let x = 0; x < game.maze[y].length; x++) {
                    if ((y === 0 || y === game.maze.length - 1 || x === 0 || x === game.maze[y].length - 1) && game.maze[y][x] === 1) {
                        ctx.fillStyle = 'black';
                        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
                    }
                }
            }

            // ハイスコアの表示
            ctx.font = '30px DotGothic16';
            ctx.fillStyle = 'black';
            let highScoreText = 'High Score: ' + localStorage.getItem('highScore');
            let highScoreWidth = ctx.measureText(highScoreText).width;
            ctx.fillText(highScoreText, (canvas.width * 2 / 3) - (highScoreWidth / 2), canvas.height / 2 - 40);

            // スタートの表示
            let startText = 'Start';
            let startWidth = ctx.measureText(startText).width;
            let startHeight = parseInt(ctx.font, 10); // フォントサイズを取得して整数に変換
            ctx.fillStyle = 'black'; // テキストの色を設定
            ctx.fillText(startText, (canvas.width * 2 / 3) - (startWidth / 2), canvas.height / 2 + (startHeight / 2));
            ctx.fillText(game.selection === 'start' ? '>' : '', (canvas.width * 2 / 3) - (startWidth / 2) - 30, canvas.height / 2 + (startHeight / 2));

            // プレイ方法の表示
            let howToPlayText = 'How to Play';
            let howToPlayWidth = ctx.measureText(howToPlayText).width;
            let howToPlayHeight = parseInt(ctx.font, 10); // フォントサイズを取得して整数に変換
            ctx.fillStyle = 'black'; // テキストの色を設定
            ctx.fillText(howToPlayText, (canvas.width * 2 / 3) - (howToPlayWidth / 2), canvas.height / 2 + (howToPlayHeight / 2) + 40);
            ctx.fillText(game.selection === 'howToPlay' ? '>' : '', (canvas.width * 2 / 3) - (howToPlayWidth / 2) - 30, canvas.height / 2 + (howToPlayHeight / 2) + 40);
            ctx.textAlign = 'left'; // title画面に戻ったらctx.textAlignを解除
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
                    }
                }
            }

            // チーズの描画
            game.cheese.forEach(function (cheese) {
                ctx.drawImage(game.cheeseImage, cheese.x * tileSize + 5, cheese.y * tileSize + 5, 10, 10);
            });

            // プレイヤーの描画
            const playerImage = images[game.player.imageKey];
            ctx.drawImage(playerImage, game.player.x * tileSize, game.player.y * tileSize, tileSize, tileSize);

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
                    }
                }
            }
            const playerImageLoading = images[game.player.imageKey];
            ctx.drawImage(playerImageLoading, game.player.x * tileSize, game.player.y * tileSize, tileSize, tileSize);
            break;
        case 'gameover':
            document.getElementById('gameLeft').style.backgroundImage = "";
            // ゲームオーバー画面の描画
            ctx.font = '55px DotGothic16';
            ctx.fillStyle = 'black';
            const text = 'Had cheese!';
            const textWidth = ctx.measureText(text).width;
            const textX = canvas.width / 2 - textWidth / 2;
            const textY = canvas.height / 2 - 60; // テキストのY座標を調整

            const mouseDeadImage = images['mouseDead'];
            const imageX = canvas.width / 2 - mouseDeadImage.width / 2;
            const imageY = canvas.height / 2; // 画像のY座標を調整

            // テキストと画像を中央に配置
            ctx.fillText(text, textX, textY);
            ctx.drawImage(mouseDeadImage, imageX, imageY, mouseDeadImage.width, mouseDeadImage.height);
            break;


        case 'scoreScreen':
            toBeContinued.loop = true;
            toBeContinued.play();
            document.getElementById('gameLeft').style.backgroundImage = "";
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

let newX = game.player.x;
let newY = game.player.y;
switch (game.player.direction) {
    case 'top':
        newY -= 1; // プレイヤーのY座標を減少
        break;
    case 'down':
        newY += 1; // プレイヤーのY座標を増加
        break;
    case 'left':
        newX -= 1; // プレイヤーのX座標を減少
        break;
    case 'right':
        newX += 1; // プレイヤーのX座標を増加
        break;
}
// 新しい位置で迷路との衝突判定を行い、衝突していなければ位置を更新
if (!checkMazeCollision(newX, newY)) {
    game.player.x = newX;
    game.player.y = newY;
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
                break;
            case 'right':
                newX += 1;
                break;
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
    });
}


// ゲームの更新と描画-------------------------------------------------------
let playerMoveCounter = 0;
let catMoveCounter = 0;
const playerMoveInterval = 40; // プレイヤーの移動間隔をフレーム単位で設定
const catMoveInterval = 50; // 猫の移動間隔をフレーム単位で設定

const UPDATE_LOAD_COEFF = 0.5;
let targetInterval = 1000 / 60; // 60 FPSを目標とする
let prevTime = Date.now() - targetInterval;

function gameLoop() {
    let currentTime = Date.now();
    let updated = false;

    while (currentTime - prevTime > targetInterval * 0.5) {
        if (gamePlaying === true && game.state === 'playing') {
            if (playerMoveCounter >= playerMoveInterval) {
                updatePlayer(); // プレイヤーの位置を更新
                playerMoveCounter = 0; // カウンターをリセット
                updated = true; // 更新フラグをtrueに設定
            }
            if (catMoveCounter >= catMoveInterval) {
                updateCats(); // 猫の位置を更新
                catMoveCounter = 0; // カウンターをリセット
                updated = true; // 更新フラグをtrueに設定
            }
        }

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

    if (updated && game.state === 'playing') {
        updateGame(); // その他のゲームの更新処理
    }

    playerMoveCounter++;
    catMoveCounter++;
    drawGame(); // ゲームの描画
    requestAnimationFrame(gameLoop); // フレームの終わりにgameLoopを呼び出すことで、ゲームをフレーム単位で管理
}


