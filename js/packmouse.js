let gamePlaying = false;

let soundEnabled = true; // ゲームの音の初期状態を設定

// soundtoggle要素にクリックイベントを追加
document.getElementById('soundtoggle').addEventListener('click', function () {
    soundEnabled = !soundEnabled; // 音の状態を切り替え
    if (soundEnabled) {
        document.getElementById('soundtoggle').style.backgroundImage = 'url("../img/soundON.jpg")'; // 音がONの時の画像
        // 音を有効にする処理
    } else {
        document.getElementById('soundtoggle').style.backgroundImage = 'url("../img/soundOff.jpg")'; // 音がOFFの時の画像
        // 音を無効にする処理
    }
});

let audioPlayer = new Audio('../sound/EscapeTheChase.mp3');

document.getElementById('mouse-wrapper').addEventListener('click', function () {
    gamePlaying = true;
    audioPlayer.play();
    console.log(gamePlaying + "に変更");

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
    packmouse.style.zIndex = '9999'; // 一番上に表示されるようにz-indexを設定

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
});

document.getElementById('closeButton').addEventListener('click', function () {
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
});
//---------------------------------------------------------------

// 画像の読み込み
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
        cheese: '../svg/cheese.svg'
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

// ゲームの状態
let game = {
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
    cheeseImage: null
};

// キャンバスとコンテキストの取得
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 迷路の1マスの幅と高さを定義
const tileSize = 25;

canvas.width = game.maze[0].length * tileSize; // キャンバスの幅を迷路の幅に合わせて調整
canvas.height = game.maze.length * tileSize; // キャンバスの高さを迷路の高さに合わせて調整
document.getElementById('game-wrapper').style.width = `${canvas.width}px`;
ctx.fillStyle = 'yellow'; // 背景色を黄色に変更
ctx.fillRect(0, 0, canvas.width, canvas.height); // キャンバス全体を黄色で塗りつぶす

// ゲームの初期化
function initGame() {
    loadImages(() => {
        game.cheeseImage = images.cheese; // チーズの画像を設定
        window.addEventListener('keydown', handleKeyDown);
        gameLoop();
    });
}

// チーズの位置を生成する関数を迷路生成後に呼び出す
game.cheese = generateCheesePositions(game.maze);

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

// generateMaze関数の定義
function generateMaze(width, height) {
    let maze = new Array(height);
    for (let y = 0; y < height; y++) {
        maze[y] = new Array(width).fill(0); // 全て通路で初期化
    }
    // 迷路の外周一周壁を設定
    for (let y = 0; y < height; y++) {
        maze[y][0] = 1; // 左端に壁を設定
        maze[y][width - 1] = 1; // 右端に壁を設定
    }
    for (let x = 0; x < width; x++) {
        maze[0][x] = 1; // 上端に壁を設定
        maze[height - 1][x] = 1; // 下端に壁を設定
    }

    // C------------------------------------------------
    // x4,y4からx5,y13まで壁に変更
    for (let y = 4; y <= 13; y++) {
        maze[y][4] = 1;
        maze[y][5] = 1;
    }
    // x6,y4からx11,y5まで壁に変更
    for (let x = 6; x <= 11; x++) {
        maze[4][x] = 1;
        maze[5][x] = 1;
    }
    // x6,y11からx11,y13まで壁に変更
    for (let y = 11; y <= 13; y++) {
        for (let x = 6; x <= 11; x++) {
            maze[y][x] = 1;
        }
    }
    // x13,y4からx15,y13まで壁に変更
    for (let y = 4; y <= 13; y++) {
        for (let x = 13; x <= 15; x++) {
            maze[y][x] = 1;
        }
    }
    // x16,y7からx18,y8まで壁に変更
    for (let y = 7; y <= 8; y++) {
        for (let x = 16; x <= 18; x++) {
            maze[y][x] = 1;
        }
    }
    // x17,y9からx18,y13まで壁に変更
    for (let y = 9; y <= 13; y++) {
        for (let x = 17; x <= 18; x++) {
            maze[y][x] = 1;
        }
    }

    // x20,y7からx21,y13まで壁に変更
    for (let y = 7; y <= 13; y++) {
        for (let x = 20; x <= 21; x++) {
            maze[y][x] = 1;
        }
    }
    // x22,y7からx25,y7まで壁に変更
    for (let x = 22; x <= 25; x++) {
        maze[7][x] = 1;
    }
    // x22,y9からx25,y10まで壁に変更
    for (let y = 9; y <= 10; y++) {
        for (let x = 22; x <= 25; x++) {
            maze[y][x] = 1;
        }
    }
    // x22,y12からx25,y13まで壁に変更
    for (let y = 12; y <= 13; y++) {
        for (let x = 22; x <= 25; x++) {
            maze[y][x] = 1;
        }
    }

    // E------------------------------------------------
    // x27,y7からx28,y13まで壁に変更
    for (let y = 7; y <= 13; y++) {
        for (let x = 27; x <= 28; x++) {
            maze[y][x] = 1;
        }
    }
    // x29,y7からx32,y7まで壁に変更
    for (let x = 29; x <= 32; x++) {
        maze[7][x] = 1;
    }
    // x29,y9からx32,y10まで壁に変更
    for (let y = 9; y <= 10; y++) {
        for (let x = 29; x <= 32; x++) {
            maze[y][x] = 1;
        }
    }
    // x29,y12からx32,y13まで壁に変更
    for (let y = 12; y <= 13; y++) {
        for (let x = 29; x <= 32; x++) {
            maze[y][x] = 1;
        }
    }

    // S------------------------------------------------
    // x34,y7からx35,y10まで壁に変更
    for (let y = 7; y <= 10; y++) {
        for (let x = 34; x <= 35; x++) {
            maze[y][x] = 1;
        }
    }

    // x36,y7からx38,y7まで壁に変更
    for (let x = 36; x <= 38; x++) {
        maze[7][x] = 1;
    }

    // x36,y9からx38,y10まで壁に変更
    for (let y = 9; y <= 10; y++) {
        for (let x = 36; x <= 38; x++) {
            maze[y][x] = 1;
        }
    }

    // x34,y12からx38,y13まで壁に変更
    for (let y = 12; y <= 13; y++) {
        for (let x = 34; x <= 38; x++) {
            maze[y][x] = 1;
        }
    }

    // x37,y11からx38,y11まで壁に変更
    for (let x = 37; x <= 38; x++) {
        maze[11][x] = 1;
    }

    // E------------------------------------------------
    // x40,y7からx41,y13まで壁に変更
    for (let y = 7; y <= 13; y++) {
        for (let x = 40; x <= 41; x++) {
            maze[y][x] = 1;
        }
    }
    // x42,y7からx45,y7まで壁に変更
    for (let x = 42; x <= 45; x++) {
        maze[7][x] = 1;
    }
    // x42,y9からx45,y10まで壁に変更
    for (let y = 9; y <= 10; y++) {
        for (let x = 42; x <= 45; x++) {
            maze[y][x] = 1;
        }
    }
    // x42,y12からx45,y13まで壁に変更
    for (let y = 12; y <= 13; y++) {
        for (let x = 42; x <= 45; x++) {
            maze[y][x] = 1;
        }
    }



    return maze;
}


// -------------------------------------------------------------
// 迷路との衝突判定関数を修正
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


//Playerの操作関係--------------------------------------------
function handleKeyDown(event) {
    let newDirection;
    let newImageKey;
    switch (event.key) {
        case 'ArrowUp':
        case 'w':
            newDirection = 'top';
            newImageKey = 'mouseUp';
            break;
        case 'ArrowDown':
        case 's':
            newDirection = 'down';
            newImageKey = 'mouseDown';
            break;
        case 'ArrowLeft':
        case 'a':
            newDirection = 'left';
            newImageKey = 'mouseLeft';
            break;
        case 'ArrowRight':
        case 'd':
            newDirection = 'right';
            newImageKey = 'mouseRight';
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

//ゲームの処理を行う関数↓ -------------------------------------------------------------

function updateGame() {
    // プレイヤーがチーズと重なったかの判定とチーズの削除、スコアの更新
    game.cheese = game.cheese.filter(cheese => {
        if (cheese.x === game.player.x && cheese.y === game.player.y) {
            game.player.score += 100; // スコアに100点を追加
            return false; // このチーズを配列から削除
        }
        return true; // このチーズを配列に残す
    });

    // プレイヤーが猫に捕まったかの判定
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
            } else {
                // ライフが0の場合、ゲームオーバー
                alert("ゲームオーバー!");
                game.player.score = 0; // スコアを0にリセット
                initGame(); // ゲームを再読み込み
            }
        }
    });

    // すべてのチーズを集めたかの判定
    if (game.cheese.length === 0 && gamePlaying === false) {
        alert("You Win!");
        // 勝利時の処理
    }
}

function playLivesDecreaseAnimation() {
    if (game.player.lives === 2) {
        document.getElementById('lives3').src = 'img/dotheart.gif';
    }
    if (game.player.lives === 1) {
        document.getElementById('lives2').src = 'img/dotheart.gif';
    }
    if (game.player.lives === 0) {
        document.getElementById('lives1').src = 'img/dotheart.gif';
    }
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
    ctx.fillStyle = 'yellow'; // 背景色を黄色に再設定
    ctx.fillRect(0, 0, canvas.width, canvas.height); // キャンバス全体を黄色で塗りつぶす

    // 迷路の描画
    for (let y = 0; y < game.maze.length; y++) {
        for (let x = 0; x < game.maze[y].length; x++) {
            if (game.maze[y][x] === 1) {
                ctx.fillStyle = 'black';
                ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
            }
        }
    }

    // チーズの描画の最適化
    game.cheese.forEach(function (cheese) {
        // 再利用可能なチーズのImageオブジェクトを使用
        ctx.drawImage(game.cheeseImage, cheese.x * tileSize + 5, cheese.y * tileSize + 5, 10, 10);
    });

    // プレイヤーの描画
    const playerImage = images[game.player.imageKey]; // 画像キーを使用してImageオブジェクトを取得
    ctx.drawImage(playerImage, game.player.x * tileSize, game.player.y * tileSize, tileSize, tileSize);

    // 猫の描画を更新
    drawCats();

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
    ctx.fillStyle = 'yellow'; // 背景色を黄色に再設定
    ctx.fillRect(0, 0, canvas.width, canvas.height); // キャンバス全体を黄色で塗りつぶす

    // 迷路の描画
    for (let y = 0; y < game.maze.length; y++) {
        for (let x = 0; x < game.maze[y].length; x++) {
            if (game.maze[y][x] === 1) {
                ctx.fillStyle = 'black';
                ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
            }
        }
    }

    // チーズの描画の最適化
    game.cheese.forEach(function (cheese) {
        // 再利用可能なチーズのImageオブジェクトを使用
        ctx.drawImage(game.cheeseImage, cheese.x * tileSize + 5, cheese.y * tileSize + 5, 10, 10);
    });

    // プレイヤーの描画
    const playerImage = images[game.player.imageKey]; // 画像キーを使用してImageオブジェクトを取得
    ctx.drawImage(playerImage, game.player.x * tileSize, game.player.y * tileSize, tileSize, tileSize);

    // 猫の描画を更新
    drawCats();

    // スコアを表示する
    document.getElementById('scoreDisplay').innerHTML = 'SCORE: ' + game.player.score;
}


// ゲームの更新と描画-------------------------------------------------------
let playerMoveCounter = 0;
let catMoveCounter = 0;
const playerMoveInterval = 20; // プレイヤーの移動間隔をフレーム単位で設定
const catMoveInterval = 30; // 猫の移動間隔をフレーム単位で設定

function gameLoop() {
    if (gamePlaying === true) {
        if (playerMoveCounter >= playerMoveInterval) {
            updatePlayer(); // プレイヤーの位置を更新
            playerMoveCounter = 0; // カウンターをリセット
        }
        if (catMoveCounter >= catMoveInterval) {
            updateCats(); // 猫の位置を更新
            catMoveCounter = 0; // カウンターをリセット
        }

        updateGame(); // その他のゲームの更新処理
        drawGame(); // ゲームの描画

        console.log(`playerMoveCounter: ${playerMoveCounter}, catMoveCounter: ${catMoveCounter}`); // カウンターの値をコンソールに出力

        playerMoveCounter++;
        catMoveCounter++;
        requestAnimationFrame(gameLoop); // フレームの終わりにgameLoopを呼び出すことで、ゲームをフレーム単位で管理
    }
}