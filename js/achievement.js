export let achievements = {
    playCount: 0,
    maxLevel: 0,
    caughtByCatCount: 0,
    cheeseCount: 0,
    rainbowCheeseCount: 0,
    poisonCheeseCount: 0,

    played: false,
    caughtByCat: false,
    gotCheese: false,
    gotPoison: false,
    gotRainbow: false,
    levelCleared1: false,
    levelCleared3: false,
    levelCleared5: false,
    levelCleared7: false,
    levelCleared10: false
};

export function loadAchievements() {
    // ローカルストレージから 'achievements' というキーで保存された実績データを取得
    const storedAchievements = localStorage.getItem('achievements');
    // 取得した実績データが存在する場合
    if (storedAchievements) {
        // 取得したJSON形式の文字列をオブジェクトに変換し、achievementsオブジェクトにマージする
        Object.assign(achievements, JSON.parse(storedAchievements));
    }
}


export function updateAchievements() {
    // ローカルストレージに現在のアチーブメントオブジェクトの差分を保存
    const storedAchievements = localStorage.getItem('achievements');
    const currentAchievements = JSON.stringify(achievements);
    if (storedAchievements !== currentAchievements) {
        localStorage.setItem('achievements', currentAchievements);
    }

    if (achievements.playCount >= 1) {
        document.getElementById('achievementMiniMouse').querySelector('img').src = './img/achievement/achievementMiniMouse.PNG';
        document.getElementById('achievementMiniMouse').querySelector('h2').textContent = 'A piece of Cheese';
        document.getElementById('achievementMiniMouse').querySelector('h3').textContent = '達成条件:初プレイ';
        document.getElementById('achievementMiniMouse').querySelector('p').textContent = 'プレイ回数：' + achievements.playCount + '/1';
        if (!achievements.played) {
            achievements.played = true;
        }
    }
    if (achievements.maxLevel1 >= 1) {
        document.getElementById('achievement1').style.display = 'block';
        document.getElementById('achievement1').querySelector('img').src = './img/achievement/achievementMiniMouse.PNG';
        document.getElementById('achievement1').querySelector('h2').textContent = 'Some cheese!';
        document.getElementById('achievement1').querySelector('h3').textContent = '達成条件:レベル１クリア';
        document.getElementById('achievement1').querySelector('p').textContent = '最高到達レベル：' + achievements.maxLevel1 + '/1';
        if (!achievements.levelCleared1) {
            achievements.levelCleared1 = true;
        }
    }
    if (achievements.maxLevel3 >= 3) {
        document.getElementById('achievement3').style.display = 'block';
        document.getElementById('achievement3').querySelector('img').src = './img/achievement/achievement3.PNG';
        document.getElementById('achievement3').querySelector('h2').textContent = 'Many cheeese!';
        document.getElementById('achievement3').querySelector('h3').textContent = '達成条件:レベル3クリア';
        document.getElementById('achievement3').querySelector('p').textContent = '最高到達レベル：' + achievements.maxLevel3 + '/3';
        if (!achievements.levelCleared3) {
            achievements.levelCleared3 = true;
        }
    }
    if (achievements.maxLevel5 >= 5) {
        document.getElementById('achievement5').style.display = 'block';
        document.getElementById('achievement5').querySelector('img').src = './img/achievement/achievement5.PNG';
        document.getElementById('achievement5').querySelector('h2').textContent = 'A lots of cheeese!!';
        document.getElementById('achievement5').querySelector('h3').textContent = '達成条件:レベル5クリア';
        document.getElementById('achievement5').querySelector('p').textContent = '最高到達レベル：' + achievements.maxLevel5 + '/5';
        if (!achievements.levelCleared5) {
            achievements.levelCleared5 = true;
        }
    }
    if (achievements.maxLevel >= 7) {
        document.getElementById('achievement7').querySelector('img').src = './img/achievement/achievement7.PNG';
        document.getElementById('achievement7').querySelector('h2').textContent = 'A ton of cheeeese!!!';
        document.getElementById('achievement7').querySelector('h3').textContent = '達成条件:レベル7クリア';
        document.getElementById('achievement7').querySelector('p').textContent = '最高到達レベル：' + achievements.maxLevel7 + '/7';
        if (!achievements.levelCleared7) {
            achievements.levelCleared7 = true;
        }
    }
    if (achievements.maxLevel >= 10) {
        document.getElementById('achievement10').querySelector('img').src = './img/achievement/achievement10.PNG';
        document.getElementById('achievement10').querySelector('h2').textContent = 'Plenty of cheeeeeese!!!!';
        document.getElementById('achievement10').querySelector('h3').textContent = '達成条件:レベル10クリア';
        document.getElementById('achievement10').querySelector('p').textContent = '最高到達レベル：' + achievements.maxLevel10 + '/10';
        if (!achievements.levelCleared10) {
            achievements.levelCleared10 = true;
        }
    }
    if (achievements.caughtByCatCount >= 100) {
        document.getElementById('achievementCat').style.display = 'block';
        document.getElementById('achievementCat').querySelector('img').src = './img/achievement/achievementCat.PNG';
        document.getElementById('achievementCat').querySelector('h2').textContent = 'Hateful cat!';
        document.getElementById('achievementCat').querySelector('h3').textContent = '達成条件:猫に１００回捕まる';
        document.getElementById('achievementCat').querySelector('p').textContent = '猫に捕まった回数:' + achievements.caughtByCatCount + '/100';
        if (!achievements.caughtByCat) {
            achievements.caughtByCat = true;
        }
    }
    if (achievements.cheeseCount >= 1000) {
        document.getElementById('achievementCheese').style.display = 'block';
        document.getElementById('achievementCheese').querySelector('img').src = './img/achievement/achievementCheese.PNG';
        document.getElementById('achievementCheese').querySelector('h2').textContent = 'Master of Cheese.';
        document.getElementById('achievementCheese').querySelector('h3').textContent = '達成条件:チーズを1000回取る';
        document.getElementById('achievementCheese').querySelector('p').textContent = 'チーズを取った回数:' + achievements.cheeseCount + '/1000';
        if (!achievements.gotCheese) {
            achievements.gotCheese = true;
        }
    }
    if (achievements.rainbowCheeseCount >= 100) {
        document.getElementById('achievementRainbow').style.display = 'block';
        document.getElementById('achievementRainbow').querySelector('img').src = './img/achievement/achievementRainbow.PNG';
        document.getElementById('achievementRainbow').querySelector('h2').textContent = 'You got a Rainbow!!';
        document.getElementById('achievementRainbow').querySelector('h3').textContent = '達成条件:レインボーチーズを１００回取る';
        document.getElementById('achievementRainbow').querySelector('p').textContent = 'レインボーチーズを取った回数' + achievements.rainbowCheeseCount + '/100';
        if (!achievements.gotRainbow) {
            achievements.gotRainbow = true;
        }
    }
    if (achievements.poisonCheeseCount >= 100) {
        document.getElementById('achievementPoison').style.display = 'block';
        document.getElementById('achievementPoison').querySelector('img').src = './img/achievement/achievementPoison.PNG';
        document.getElementById('achievementPoison').querySelector('h2').textContent = 'A pot of Cheese is ruined by a drop of Poison.';
        document.getElementById('achievementPoison').querySelector('h3').textContent = '達成条件:ポイズンチーズを１００回取る';
        document.getElementById('achievementPoison').querySelector('p').textContent = 'ポイズンチーズを取った回数' + achievements.poisonCheeseCount + '/100';
        if (!achievements.gotPoison) {
            achievements.gotPoison = true;
        }
    }

    let clearedAchievements = Object.values(achievements).filter(value => value === true).length;
    document.getElementById('achievementProgress').textContent = clearedAchievements + '/10';
}


