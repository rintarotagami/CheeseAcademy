window.addEventListener("DOMContentLoaded", init);
function init() {
    // レンダラーを作成
    const canvasElement = document.querySelector('#cheeseCanvas'); //canvas要素のクラスを指定
    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas: canvasElement,
    });

    // サイズ指定
    const cheeseBackground = document.querySelector('#cheeseBackground');
    const width = window.innerWidth;
    const height = cheeseBackground.clientHeight;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);

    // シーンを作成
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfef549);//背景色を指定

    // 環境光源を作成
    const ambientLight = new THREE.AmbientLight(0xffffff);
    ambientLight.intensity = 2;
    scene.add(ambientLight);

    // 平行光源を作成
    const directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.intensity = 2;
    directionalLight.position.set(0, 3, 6); //x,y,zの位置を指定
    scene.add(directionalLight);

    // カメラを作成
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
    camera.position.set(0, 0, 1500);

    // カメラコントローラーを作成
    const controls = new THREE.OrbitControls(camera, canvasElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.2;
    controls.enableZoom = false; // スクロールでのズームイン・ズームアウトを無効化

    // 3Dモデルの読み込みとランダム配置のクローン作成、画面外も含む
    const loader = new THREE.GLTFLoader();
    loader.load(
        //3Dモデルファイルのパスを指定
        './models/cheese_3d.glb',
        function (glb) {
            const originalModel = glb.scene;
            originalModel.name = "original_cheese";
            originalModel.scale.set(80.0, 80.0, 80.0); // 元のモデルの大きさを設定
            // 元のモデルはシーンに追加しない

            // クローンをランダムな位置と大きさで作成してシーンに追加、画面外も含む
            for (let i = 0; i < 150; i++) { // クローンの数を増やす
                const clone = originalModel.clone();
                // 画面外を含めた全体にランダムに配置
                clone.position.x = (Math.random() - 0.5) * width * 2; // 幅の2倍の範囲でランダム
                clone.position.y = (Math.random() - 0.5) * height * 2; // 高さの2倍の範囲でランダム
                clone.position.z = (Math.random() - 0.5) * 2000; // 奥行きの範囲を広げる
                
                clone.rotation.x = Math.random() * Math.PI;
                clone.rotation.y = Math.random() * Math.PI;
                clone.rotation.z = Math.random() * Math.PI;
                
                let scale = 15 + Math.random() * 6.5; // 大きさをランダムに
                clone.scale.set(scale, scale, scale);
                scene.add(clone);
            }
        },
        function (error) {
            console.log(error);
        }
    );

    

    // リアルタイムレンダリング
    tick();
    function tick() {
        controls.update();
        renderer.render(scene, camera);
        requestAnimationFrame(tick);
    }
} 

// ウィンドウのリサイズイベントに対応
window.addEventListener('resize', () => {
    // カメラのアスペクト比を更新
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    // レンダラーのサイズを更新
    renderer.setSize(window.innerWidth, window.innerHeight);
});
