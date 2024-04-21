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

    // 3Dモデルの読み込みとクローンの作成
    const loader = new THREE.GLTFLoader();
    loader.load(
        //3Dモデルファイルのパスを指定
        './models/cheese_3d.glb',
        function (glb) {
            const originalModel = glb.scene;
            originalModel.name = "original_cheese";
            originalModel.scale.set(80.0, 80.0, 80.0);
            originalModel.position.set(0, -200, 0);
            scene.add(originalModel);

            // クローンを作成してシーンに追加
            for (let i = 0; i < 10; i++) {
                const clone = originalModel.clone();
                clone.position.x = Math.random() * 40 - 20;
                clone.position.y = Math.random() * 40 - 20;
                clone.position.z = Math.random() * 40 - 20;
            
                clone.rotation.x = Math.random() * Math.PI;
                clone.rotation.y = Math.random() * Math.PI;
                clone.rotation.z = Math.random() * Math.PI;
            
                let scale = Math.random() * 0.15;
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