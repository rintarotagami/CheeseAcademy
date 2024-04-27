```mermaid
sequenceDiagram
    participant U as User
    participant MW as mouse-wrapper
    participant G as Game

    U->>MW: click
    Note over MW: ゲームのプレイ状態をtrueに変更
    MW->>G: gamePlaying = true
    MW->>G: audioPlayer.loop = true
    MW->>G: audioPlayer.play()
    Note over G: BGMの再生を開始
    MW->>G: packmouse style adjustments
    Note over G: packmouseを画面中央に表示
    MW->>G: cheeseBackground.style.display = 'none'
    Note over G: cheeseBackgroundを非表示に変更
    MW->>G: initGame()
    Note over G: ゲームの初期化と開始

    U->>MW: click (closeButton)
    Note over MW: ゲームのプレイ状態をfalseに変更
    MW->>G: gamePlaying = false
    MW->>G: packmouse style reset
    Note over G: packmouseを非表示に戻す
    MW->>G: cheeseBackground.style.display = 'block'
    Note over G: cheeseBackgroundを表示に戻す
    MW->>G: document.body.style.overflow = ''
    Note over G: スクロールを有効化


drawGameが毎フレーム読みこまれていて、処理が重くなってしまっている。

【修正案】
updateという変数をgameloopの外でも機能するようにし、
title,scoreDisplay,howtoplayの時は、
プレイヤーの操作が行われたら、updateをtrueにする。
updateがtrueの時は、drawGameを実行するように修正します。
