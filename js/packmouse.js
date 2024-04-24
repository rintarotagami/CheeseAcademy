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
    player: { x: 25, y: 10, direction: 'right', imageKey: 'mouseRight', score: 0, moving: false }, // プレイヤーの初期位置、画像キー、得点、移動状態を調整
    cheese: [], // チーズの位置を空の配列で初期化
    cat: { x: 10, y: 4, direction: 'left', imageKey: 'catRight', moving: false }, // 猫の位置、画像キー、移動状態を調整
    maze: generateMaze(54, 22), // 迷路のサイズを縦21×横51に変更
    cheeseImage: null // チーズのImageオブジェクトを格納するためのプロパティを追加
};

// キャンバスとコンテキストの取得
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = game.maze[0].length * 20; // キャンバスの幅を迷路の幅に合わせて調整
canvas.height = game.maze.length * 20; // キャンバスの高さを迷路の高さに合わせて調整
canvas.style.position = 'absolute';
canvas.style.left = '50%';
canvas.style.top = '50%';
canvas.style.transform = 'translate(-50%, -50%)';
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
    // x6,y6からx7,y15まで壁に変更
    for (let y = 6; y <= 15; y++) {
        maze[y][6] = 1;
        maze[y][7] = 1;
    }
    // x8,y6からx13,y7まで壁に変更
    for (let x = 8; x <= 13; x++) {
        maze[6][x] = 1;
        maze[7][x] = 1;
    }
    // x8,y13からx13,y15まで壁に変更
    for (let y = 13; y <= 15; y++) {
        for (let x = 8; x <= 13; x++) {
            maze[y][x] = 1;
        }
    }
    // x15,y6からx17,y15まで壁に変更
    for (let y = 6; y <= 15; y++) {
        for (let x = 15; x <= 17; x++) {
            maze[y][x] = 1;
        }
    }
    // x18,y9からx20,y10まで壁に変更
    for (let y = 9; y <= 10; y++) {
        for (let x = 18; x <= 20; x++) {
            maze[y][x] = 1;
        }
    }
    // x19,y11からx20,y15まで壁に変更
    for (let y = 11; y <= 15; y++) {
        for (let x = 19; x <= 20; x++) {
            maze[y][x] = 1;
        }
    }

    // x22,y9からx23,y15まで壁に変更
    for (let y = 9; y <= 15; y++) {
        for (let x = 22; x <= 23; x++) {
            maze[y][x] = 1;
        }
    }
    // x24,y9からx27,y9まで壁に変更
    for (let x = 24; x <= 27; x++) {
        maze[9][x] = 1;
    }
    // x24,y11からx27,y12まで壁に変更
    for (let y = 11; y <= 12; y++) {
        for (let x = 24; x <= 27; x++) {
            maze[y][x] = 1;
        }
    }
    // x24,y14からx27,y15まで壁に変更
    for (let y = 14; y <= 15; y++) {
        for (let x = 24; x <= 27; x++) {
            maze[y][x] = 1;
        }
    }

    // E------------------------------------------------
    // x29,y9からx30,y15まで壁に変更
    for (let y = 9; y <= 15; y++) {
        for (let x = 29; x <= 30; x++) {
            maze[y][x] = 1;
        }
    }
    // x31,y9からx34,y9まで壁に変更
    for (let x = 31; x <= 34; x++) {
        maze[9][x] = 1;
    }
    // x31,y11からx34,y12まで壁に変更
    for (let y = 11; y <= 12; y++) {
        for (let x = 31; x <= 34; x++) {
            maze[y][x] = 1;
        }
    }
    // x31,y14からx34,y15まで壁に変更
    for (let y = 14; y <= 15; y++) {
        for (let x = 31; x <= 34; x++) {
            maze[y][x] = 1;
        }
    }

    // S------------------------------------------------
    // x36,y9からx37,y12まで壁に変更
    for (let y = 9; y <= 12; y++) {
        for (let x = 36; x <= 37; x++) {
            maze[y][x] = 1;
        }
    }

    // x38,y9からx40,y9まで壁に変更
    for (let x = 38; x <= 40; x++) {
        maze[9][x] = 1;
    }

    // x38,y11からx40,y12まで壁に変更
    for (let y = 11; y <= 12; y++) {
        for (let x = 38; x <= 40; x++) {
            maze[y][x] = 1;
        }
    }

    // x36,y14からx40,y15まで壁に変更
    for (let y = 14; y <= 15; y++) {
        for (let x = 36; x <= 40; x++) {
            maze[y][x] = 1;
        }
    }

    // x39,y13からx40,y13まで壁に変更
    for (let x = 39; x <= 40; x++) {
        maze[13][x] = 1;
    }

    // E------------------------------------------------
    // x42,y9からx43,y15まで壁に変更
    for (let y = 9; y <= 15; y++) {
        for (let x = 42; x <= 43; x++) {
            maze[y][x] = 1;
        }
    }
    // x44,y9からx47,y9まで壁に変更
    for (let x = 44; x <= 47; x++) {
        maze[9][x] = 1;
    }
    // x44,y11からx47,y12まで壁に変更
    for (let y = 11; y <= 12; y++) {
        for (let x = 44; x <= 47; x++) {
            maze[y][x] = 1;
        }
    }
    // x44,y14からx47,y15まで壁に変更
    for (let y = 14; y <= 15; y++) {
        for (let x = 44; x <= 47; x++) {
            maze[y][x] = 1;
        }
    }

    return maze;
}

document.getElementById('mouse-wrapper').addEventListener('click', function () {
    const packmouse = document.getElementById('packmouse');
    packmouse.style.display = 'block'; // ブロック表示に変更
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

// -------------------------------------------------------------

var cheese = document.getElementById('cheese-wrapper');
var lottiePlayer = cheese.querySelector('lottie-player');

window.addEventListener('scroll', function () {
    var cheesePosition = cheese.getBoundingClientRect().top;
    var screenPosition = window.innerHeight;
    if (cheesePosition < screenPosition) {
        lottiePlayer.play();
    }
});

// 迷路との衝突判定関数を修正
function checkMazeCollision(x, y) {
    // プレイヤーの新しい位置が迷路の範囲内にあるか確認
    if (y >= 0 && y < game.maze.length && x >= 0 && x < game.maze[0].length) {
        const playerPosition = game.maze[y][x];
        if (playerPosition === 1) {
            // 壁に衝突した場合の処理
            console.log("壁に衝突しました。");
            game.player.moving = false; // 移動を停止
            return true; // 衝突した場合はtrueを返す
        }
    } else {
        console.log("迷路の範囲外です。");
        game.player.moving = false; // 移動を停止
    }
    return false; // 衝突していない場合はfalseを返す
}

function checkCatMazeCollision(x, y) {
    // 猫の新しい位置が迷路の範囲内にあるか確認
    if (y >= 0 && y < game.maze.length && x >= 0 && x < game.maze[0].length) {
        const catPosition = game.maze[y][x];
        if (catPosition === 1) {
            console.log("猫が壁にぶつかりました。"); // ログを流す
            return true; // 衝突した場合はtrueを返す
        }
    } else {
        console.log("猫が迷路の範囲外に移動しようとしました。"); // ログを流す
        game.cat.moving = false; // 移動を停止
    }
    return false; // 衝突していない場合はfalseを返す
}

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

function updateGame() {
    // プレイヤーの移動更新頻度を管理するためのカウンタを初期化
    if (game.player.moveCounter === undefined) {
        game.player.moveCounter = 0;
    }
    // プレイヤーが移動中の場合の処理
    if (game.player.moving) {
        game.player.moveCounter++;
        // 移動更新頻度を管理するカウンタが8に達した場合にのみ移動処理を実行
        if (game.player.moveCounter >= 8) {
            let newX = game.player.x;
            let newY = game.player.y;
            let newCatX = game.cat.x;
            let newCatY = game.cat.y;
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
            // 移動処理後、カウンタをリセット
            game.player.moveCounter = 0;
        }
    }

    // プレイヤーがチーズと重なったかの判定とチーズの削除、スコアの更新
    game.cheese = game.cheese.filter(cheese => {
        if (cheese.x === game.player.x && cheese.y === game.player.y) {
            game.player.score += 100; // スコアに100点を追加
            return false; // このチーズを配列から削除
        }
        return true; // このチーズを配列に残す
    });

    // 猫が壁越しにプレイヤーを追いかける際の迂回ロジックの改善
    if (!game.cat.moving) {
        game.cat.moving = true;
        setTimeout(() => {
            let newX = game.cat.x;
            let newY = game.cat.y;
            let directionX = game.player.x - game.cat.x;
            let directionY = game.player.y - game.cat.y;

            // X軸とY軸のどちらに移動するかを決定するための優先度を再評価し、迂回ルートを計算
            let priority = Math.abs(directionX) > Math.abs(directionY) ? ['x', 'y'] : ['y', 'x'];

            let moved = false;
            for (let i = 0; i < priority.length && !moved; i++) {
                if (priority[i] === 'x') {
                    newX = game.cat.x + Math.sign(directionX);
                    if (!checkCatMazeCollision(newX, game.cat.y)) {
                        game.cat.x = newX; // X座標を更新
                        moved = true;
                    }
                } else if (priority[i] === 'y') {
                    newY = game.cat.y + Math.sign(directionY);
                    if (!checkCatMazeCollision(game.cat.x, newY)) {
                        game.cat.y = newY; // Y座標を更新
                        moved = true;
                    }
                }
            }

            // 移動できなかった場合、迂回ルートを計算
            if (!moved) {
                // 迂回ルートの計算
                let alternativeRoutes = [
                    { x: game.cat.x + 1, y: game.cat.y },
                    { x: game.cat.x - 1, y: game.cat.y },
                    { x: game.cat.x, y: game.cat.y + 1 },
                    { x: game.cat.x, y: game.cat.y - 1 }
                ];
                for (let route of alternativeRoutes) {
                    if (!checkCatMazeCollision(route.x, route.y)) {
                        game.cat.x = route.x;
                        game.cat.y = route.y;
                        moved = true;
                        break;
                    }
                }
            }

            game.cat.moving = false;
        }, 500); // 猫の移動間隔を500msに設定
    }

    // プレイヤーが猫に捕まったかの判定
    if (game.player.x === game.cat.x && game.player.y === game.cat.y) {
        // ゲームオーバー時にプレイヤーと猫の位置を初期値に戻す
        alert("猫に捕まった!");
        game.player.x = 25;
        game.player.y = 10;
        game.player.direction = 'right';
        game.player.imageKey = 'mouseRight'; // 初期の画像キーに戻す
        game.player.moving = false; // 移動を停止
        game.cat.x = 10;
        game.cat.y = 7;
        game.cat.direction = 'left';
        game.cat.imageKey = 'catRight'; // 初期の画像キーに戻す
        game.cat.moving = false; // 移動を停止
        // ゲームを再読み込み
        initGame();
    }

    // すべてのチーズを集めたかの判定
    if (game.cheese.length === 0) {
        alert("You Win!");
        // 勝利時の処理
    }
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
                ctx.fillRect(x * 20, y * 20, 20, 20);
            }
        }
    }

    // チーズの描画の最適化
    game.cheese.forEach(function (cheese) {
        // 再利用可能なチーズのImageオブジェクトを使用
        ctx.drawImage(game.cheeseImage, cheese.x * 20 + 5, cheese.y * 20 + 5, 10, 10);
    });

    // プレイヤーの描画
    const playerImage = images[game.player.imageKey]; // 画像キーを使用してImageオブジェクトを取得
    ctx.drawImage(playerImage, game.player.x * 20, game.player.y * 20, 20, 20);

    // 猫の描画
    const catImage = images[game.cat.imageKey]; // 画像キーを使用してImageオブジェクトを取得
    ctx.drawImage(catImage, game.cat.x * 20, game.cat.y * 20, 20, 20);
}


// ゲームの更新と描画
function gameLoop() {
    updateGame();
    drawGame();
    requestAnimationFrame(gameLoop);
}
