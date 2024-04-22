// 画像の読み込み
const catDownImage = '../svg/catDown.svg';
const catUpImage = '../svg/catUp.svg';
const catLeftImage = '../svg/catLeft.svg';
const catRightImage = '../svg/catRight.svg';
const mouseDownImage = '../svg/mouseDown.svg';
const mouseUpImage = '../svg/mouseUp.svg';
const mouseLeftImage = '../svg/mouseLeft.svg';
const mouseRightImage = '../svg/mouseRight.svg';
const cheeseImage = '../svg/cheese.svg';

// ゲームの状態
let game = {
    player: { x: 25, y: 9, direction: 'right', image: mouseRightImage, score: 0, moving: false }, // プレイヤーの初期位置、画像、得点、移動状態を調整
    cheese: [], // チーズの位置を空の配列で初期化
    cat: { x: 10, y: 4, direction: 'left', image: catRightImage, moving: false }, // 猫の位置、画像、移動状態を調整
    maze: generateMaze(52, 20), // 迷路のサイズを縦21×横51に変更
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
    game.cheeseImage = new Image();
    game.cheeseImage.src = cheeseImage; // チーズの画像パスを設定
    window.addEventListener('keydown', handleKeyDown);
    gameLoop();
}

// チーズの位置を生成する関数を迷路生成後に呼び出す
game.cheese = generateCheesePositions(game.maze);

function generateCheesePositions(maze) {
    let cheesePositions = [];
    for (let y = 0; y < maze.length; y++) {
        for (let x = 0; x < maze[y].length; x++) {
            if (maze[y][x] === 0) { // 壁がない場所を探す
                cheesePositions.push({ x: x, y: y, image: cheeseImage }); // 壁がない場所にチーズを配置
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
    // x5,y5からx6,y14まで壁に変更
    for (let y = 5; y <= 14; y++) {
        maze[y][5] = 1;
        maze[y][6] = 1;
    }
    // x7,y5からx12,y6まで壁に変更
    for (let x = 7; x <= 12; x++) {
        maze[5][x] = 1;
        maze[6][x] = 1;
    }
    // x7,y12からx12,y14まで壁に変更
    for (let y = 12; y <= 14; y++) {
        for (let x = 7; x <= 12; x++) {
            maze[y][x] = 1;
        }
    }
    // x14,y5からx16,y14まで壁に変更
    for (let y = 5; y <= 14; y++) {
        for (let x = 14; x <= 16; x++) {
            maze[y][x] = 1;
        }
    }
    // x17,y8からx19,y9まで壁に変更
    for (let y = 8; y <= 9; y++) {
        for (let x = 17; x <= 19; x++) {
            maze[y][x] = 1;
        }
    }
    // x18,y10からx19,y14まで壁に変更
    for (let y = 10; y <= 14; y++) {
        for (let x = 18; x <= 19; x++) {
            maze[y][x] = 1;
        }
    }

    // x21,y8からx22,y14まで壁に変更
    for (let y = 8; y <= 14; y++) {
        for (let x = 21; x <= 22; x++) {
            maze[y][x] = 1;
        }
    }
    // x23,y8からx26,y8まで壁に変更
    for (let x = 23; x <= 26; x++) {
        maze[8][x] = 1;
    }
    // x23,y10からx26,y11まで壁に変更
    for (let y = 10; y <= 11; y++) {
        for (let x = 23; x <= 26; x++) {
            maze[y][x] = 1;
        }
    }
    // x23,y13からx26,y14まで壁に変更
    for (let y = 13; y <= 14; y++) {
        for (let x = 23; x <= 26; x++) {
            maze[y][x] = 1;
        }
    }

    // E------------------------------------------------
    // x28,y8からx29,y14まで壁に変更
    for (let y = 8; y <= 14; y++) {
        for (let x = 28; x <= 29; x++) {
            maze[y][x] = 1;
        }
    }
    // x30,y8からx33,y8まで壁に変更
    for (let x = 30; x <= 33; x++) {
        maze[8][x] = 1;
    }
    // x30,y10からx33,y11まで壁に変更
    for (let y = 10; y <= 11; y++) {
        for (let x = 30; x <= 33; x++) {
            maze[y][x] = 1;
        }
    }
    // x30,y13からx33,y14まで壁に変更
    for (let y = 13; y <= 14; y++) {
        for (let x = 30; x <= 33; x++) {
            maze[y][x] = 1;
        }
    }

    // S------------------------------------------------
    // x35,y8からx36,y11まで壁に変更
    for (let y = 8; y <= 11; y++) {
        for (let x = 35; x <= 36; x++) {
            maze[y][x] = 1;
        }
    }

    // x37,y8からx39,y8まで壁に変更
    for (let x = 37; x <= 39; x++) {
        maze[8][x] = 1;
    }

    // x37,y10からx39,y11まで壁に変更
    for (let y = 10; y <= 11; y++) {
        for (let x = 37; x <= 39; x++) {
            maze[y][x] = 1;
        }
    }

    // x35,y13からx39,y14まで壁に変更
    for (let y = 13; y <= 14; y++) {
        for (let x = 35; x <= 39; x++) {
            maze[y][x] = 1;
        }
    }

    // x38,y12からx39,y12まで壁に変更
    for (let x = 38; x <= 39; x++) {
        maze[12][x] = 1;
    }

    // E------------------------------------------------
    // x41,y8からx42,y14まで壁に変更
    for (let y = 8; y <= 14; y++) {
        for (let x = 41; x <= 42; x++) {
            maze[y][x] = 1;
        }
    }
    // x43,y8からx46,y8まで壁に変更
    for (let x = 43; x <= 46; x++) {
        maze[8][x] = 1;
    }
    // x43,y10からx46,y11まで壁に変更
    for (let y = 10; y <= 11; y++) {
        for (let x = 43; x <= 46; x++) {
            maze[y][x] = 1;
        }
    }
    // x43,y13からx46,y14まで壁に変更
    for (let y = 13; y <= 14; y++) {
        for (let x = 43; x <= 46; x++) {
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

function handleKeyDown(event) {
    // 移動中でも方向を変更できるように修正
    switch (event.key) {
        case 'ArrowUp':
        case 'w':
            game.player.direction = 'top';
            game.player.image = mouseUpImage; // 上向きの画像に変更
            game.player.moving = true;
            break;
        case 'ArrowDown':
        case 's':
            game.player.direction = 'down';
            game.player.image = mouseDownImage; // 下向きの画像に変更
            game.player.moving = true;
            break;
        case 'ArrowLeft':
        case 'a':
            game.player.direction = 'left';
            game.player.image = mouseLeftImage; // 左向きの画像に変更
            game.player.moving = true;
            break;
        case 'ArrowRight':
        case 'd':
            game.player.direction = 'right';
            game.player.image = mouseRightImage; // 右向きの画像に変更
            game.player.moving = true;
            break;
    }
}

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
            return true; // 衝突した場合はtrueを返す
        }
    } else {
        game.cat.moving = false; // 移動を停止
    }
    return false; // 衝突していない場合はfalseを返す
}


// ゲームの更新と描画
function gameLoop() {
    updateGame();
    drawGame();
    requestAnimationFrame(gameLoop);
}

function updateGame() {
    // プレイヤーの連続移動処理
    if (game.player.moving) {
        let newX = game.player.x;
        let newY = game.player.y;
        let newCatX = game.cat.x;
        let newCatY = game.cat.y;
        switch (game.player.direction) {
            case 'top':
                newY -= 1; // プレイヤーの移動量を調整
                break;
            case 'down':
                newY += 1; // プレイヤーの移動量を調整
                break;
            case 'left':
                newX -= 1; // プレイヤーの移動量を調整
                break;
            case 'right':
                newX += 1; // プレイヤーの移動量を調整
                break;
        }
        // 迷路との衝突判定を新しい位置で行う
        if (!checkMazeCollision(newX, newY)) {
            game.player.x = newX;
            game.player.y = newY;
        }
        if (!checkCatMazeCollision(newCatX, newCatY)) {
            game.cat.x = newCatX;
            game.cat.y = newCatY;
        }

    }

    // 壁にぶつかった場合は壁の方向以外でプレイヤーに最も近い方向へ移動するように修正
    if (!game.cat.moving) {
        game.cat.moving = true;
        setTimeout(() => {
            let newX = game.cat.x;
            let newY = game.cat.y;
            let directionX = game.player.x - game.cat.x;
            let directionY = game.player.y - game.cat.y;
            let possibleMoves = [];
            if (directionX !== 0) {
                possibleMoves.push({ x: newX + Math.sign(directionX), y: newY });
            }
            if (directionY !== 0) {
                possibleMoves.push({ x: newX, y: newY + Math.sign(directionY) });
            }
            // 壁にぶつかった場合、可能な移動を試みる
            for (let move of possibleMoves) {
                if (!checkCatMazeCollision(move.x, move.y)) {
                    newX = move.x;
                    newY = move.y;
                    break; // 最初に見つかった可能な移動に更新
                }
            }
            // 移動可能な場合、猫の位置を更新
            if (newX !== game.cat.x || newY !== game.cat.y) {
                game.cat.x = newX;
                game.cat.y = newY;
            }
            game.cat.moving = false;
        }, 500); // 猫の移動間隔を500msに設定
    }

    // プレイヤーが猫に捕まったかの判定
    if (game.player.x === game.cat.x && game.player.y === game.cat.y) {
        // ゲームオーバー時にプレイヤーと猫の位置を初期値に戻す
        game.player.x = 25;
        game.player.y = 9;
        game.player.direction = 'right';
        game.player.image = mouseRightImage; // 初期の画像に戻す
        game.player.moving = false; // 移動を停止
        game.cat.x = 10;
        game.cat.y = 5;
        game.cat.direction = 'left';
        game.cat.image = catRightImage; // 初期の画像に戻す
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
    const playerImage = new Image();
    playerImage.src = game.player.image;
    ctx.drawImage(playerImage, game.player.x * 20, game.player.y * 20, 20, 20);

    // 猫の描画
    const catImage = new Image();
    catImage.src = game.cat.image;
    ctx.drawImage(catImage, game.cat.x * 20, game.cat.y * 20, 20, 20);
}
