// ======================================================
// 3D GALAXY BACKGROUND ANIMATION (THREE.JS)
// ======================================================

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg-canvas'),
    antialias: true,
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(5);

// Galaxy Generation
const parameters = {};
parameters.count = 100000;
parameters.size = 0.01;
parameters.radius = 5;
parameters.branches = 3;
parameters.spin = 1;
parameters.randomness = 0.2;
parameters.randomnessPower = 3;
parameters.insideColor = '#ff6030';
parameters.outsideColor = '#1b3984';

let geometry = null;
let material = null;
let points = null;

const generateGalaxy = () => {
    if (points !== null) {
        geometry.dispose();
        material.dispose();
        scene.remove(points);
    }

    geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(parameters.count * 3);
    const colors = new Float32Array(parameters.count * 3);

    const colorInside = new THREE.Color(parameters.insideColor);
    const colorOutside = new THREE.Color(parameters.outsideColor);

    for (let i = 0; i < parameters.count; i++) {
        const i3 = i * 3;
        const radius = Math.random() * parameters.radius;
        const spinAngle = radius * parameters.spin;
        const branchAngle = ((i % parameters.branches) / parameters.branches) * Math.PI * 2;

        const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1);
        const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1);
        const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1);

        positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
        positions[i3 + 1] = randomY;
        positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

        const mixedColor = colorInside.clone();
        mixedColor.lerp(colorOutside, radius / parameters.radius);

        colors[i3] = mixedColor.r;
        colors[i3 + 1] = mixedColor.g;
        colors[i3 + 2] = mixedColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    material = new THREE.PointsMaterial({
        size: parameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
    });

    points = new THREE.Points(geometry, material);
    scene.add(points);
};

generateGalaxy();

// Animation loop
const clock = new THREE.Clock();
function animate() {
    const elapsedTime = clock.getElapsedTime();
    points.rotation.y = elapsedTime * 0.1;

    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();

// Handle window resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});


// ======================================================
// VIDEO GENERATOR LOGIC (UNCHANGED)
// ======================================================

const promptInput = document.getElementById('prompt-input');
const generateBtn = document.getElementById('generate-btn');
const videoContainer = document.getElementById('video-container');
const videoPlayer = document.getElementById('video-player');
const loader = document.getElementById('loader');

generateBtn.addEventListener('click', async () => {
    const prompt = promptInput.value;

    if (!prompt) {
        alert('Please enter a prompt.');
        return;
    }

    videoContainer.classList.add('hidden');
    loader.classList.remove('hidden');
    generateBtn.disabled = true;

    try {
        const response = await fetch('http://localhost:5000/generate-video', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.video_url) {
            videoPlayer.src = data.video_url;
            videoContainer.classList.remove('hidden');
        } else {
            alert('Error: Could not find a video URL in the response.');
        }
    } catch (error) {
        alert('An error occurred: ' + error.message);
        console.error(error);
    } finally {
        loader.classList.add('hidden');
        generateBtn.disabled = false;
    }
});
