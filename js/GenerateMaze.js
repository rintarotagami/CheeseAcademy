// generateMaze関数の定義
export function generateMaze(width, height) {
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
