(function () {
    var script = document.createElement('script'); script.onload = function () {
        var stats = new Stats(); document.body.appendChild(stats.dom); requestAnimationFrame(function loop() {
            stats.update(); requestAnimationFrame(loop)
        });
    }; script.src = '//mrdoob.github.io/stats.js/build/stats.min.js';
    document.head.appendChild(script);
})()

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

renderer.setClearColor("skyblue", 1)

window.addEventListener('resize', function () {
    var width = window.innerWidth;
    var height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
})

const light = new THREE.AmbientLight(0xFFFFFF);
scene.add(light);

// Globel Variables
var startPositon = 3;
var endPosition = -startPositon;
var text = document.querySelector(".text");
var timelimit = 10;
var gameStatus = "loading"
var isLookingBack = true;


function createCube(size, positionX, rotateY = 0, color = "yellow") {
    var geometry = new THREE.BoxGeometry(size.w, size.h, size.d);
    var material = new THREE.MeshBasicMaterial({ color: color });
    var cube = new THREE.Mesh(geometry, material);
    cube.position.x = positionX;
    cube.rotation.y = rotateY;
    scene.add(cube);
    return cube;
}

camera.position.z = 5

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const loader = new THREE.GLTFLoader();

class Doll {
    constructor() {
        loader.load("models/scene.gltf", (gltf) => {
            scene.add(gltf.scene);
            gltf.scene.scale.set(.4, .4, .4);
            gltf.scene.position.set(0, -1, 0);
            this.doll = gltf.scene;
        });
    }

    lookBack() {
        gsap.to(this.doll.rotation, { y: -3.15, duration: .5 });
        setTimeout(() => {
            isLookingBack = true;
        }, 100);
    };

    lookforward() {
        gsap.to(this.doll.rotation, { y: 0, duration: .5 });
        setTimeout(() => {
            isLookingBack = false;
        }, 500);
    };

    async start() {
        this.lookBack()
        await delay((Math.random() * 1000) + 1000)
        this.lookforward()
        await delay((Math.random() * 750) + 750)
        this.start()
    }
}

var doll = new Doll();

function createTrack() {
    createCube({ w: .2, h: 1.5, d: 1 }, startPositon, -.35);
    createCube({ w: startPositon * 2 + .2, h: 1.5, d: 1 }, 0, 0, "orange").position.z = -1;
    createCube({ w: .2, h: 1.5, d: 1 }, endPosition, .35);
}

class Player {
    constructor() {
        var geometry = new THREE.SphereGeometry(.3, 32, 16);
        var material = new THREE.MeshBasicMaterial({ color: "red" });
        var sphere = new THREE.Mesh(geometry, material);
        sphere.position.z = 1;
        sphere.position.x = startPositon;
        scene.add(sphere);
        this.player = sphere;
        this.playerInfo = {
            positionX: startPositon,
            velocity: 0,
        }
    }
    run() {
        this.playerInfo.velocity = .03;
    };

    stop() {
        gsap.to(this.playerInfo, { velocity: 0, duration: .5 });
    };

    checkStatus() {
        if (this.playerInfo.velocity > 0 && !isLookingBack) {
            gameStatus = "Over"
            text.innerText = "You lost Game";
        }
        if (this.playerInfo.positionX < endPosition) {
            gameStatus = "Over"
            text.innerText = "You won the Game!";
        }
    };

    update() {
        this.checkStatus();
        this.playerInfo.positionX -= this.playerInfo.velocity;
        this.player.position.x = this.playerInfo.positionX;
    };
}

var player = new Player();

async function init() {
    await delay(1000)
    text.innerText = "Starting in 3";
    await delay(1000)
    text.innerText = "Starting in 2";
    await delay(1000)
    text.innerText = "Starting in 1";
    await delay(1000)
    text.innerText = "GO..";
    startGame();
}

function startGame() {
    gameStatus = "started"
    let progessBar = createCube({ w: 5, h: -0.2, d: 1 }, 0);
    progessBar.position.y = 3.35;
    gsap.to(progessBar.scale, { x: 0, duration: timelimit, ease: "none" });
    doll.start();
    setTimeout(() => {
        if (gameStatus != "Over") {
            text.innerText = "You ran out of time"
            gameStatus = "Over"
        }
    }, timelimit * 1000);
}

init();

window.addEventListener("keydown", (event) => {
    if (gameStatus != "started") return
    if (event.key == "ArrowLeft") {
        player.run();
    }
})

window.addEventListener("keyup", (event) => {
    if (event.key == "ArrowLeft") {
        player.stop();
    }
})

var update = function () {
    createTrack();
};

var render = function () {
    renderer.render(scene, camera)
};

var gameloop = function () {
    if (gameStatus == "Over") return;
    requestAnimationFrame(gameloop);
    player.update();
    update();
    render();
};

gameloop();

function startOverGame() {
    window.location.href = "http://127.0.0.1:5500/squid.html";
}