/**
 * CodeClash: Programming Competition Leaderboard
 * Three.js Background Module - Abstract Data Flow Theme
 *
 * This file creates a refined, professional, and interesting background
 * visualizing abstract data flow and algorithmic processes.
 */

// Export the initialization function to be called from main.js
export function initializeThreeBackground() {
    const bgCanvasContainer = document.getElementById('bg-canvas-container');

    if (bgCanvasContainer) {
        if (typeof THREE === 'undefined') {
            console.error('Three.js library is not loaded. Background effects will not be displayed.');
            return;
        }

        try {
            initAbstractDataFlowBackground(bgCanvasContainer);
            document.dispatchEvent(new CustomEvent('threeBackground:loaded'));
        } catch (error) {
            console.error('Error initializing Abstract Data Flow background:', error);
            document.dispatchEvent(new CustomEvent('threeBackground:error'));
        }
    }
}

// --- Private Implementation ---

let scene, camera, renderer, nodes = [], lines = [];
const nodeCount = 30; // Number of abstract nodes
const lineColor = 0x00ffff; // Cyan for lines
const nodeColor = 0x00ccff; // Lighter blue for nodes
const backgroundColor = 0x0a0a0a; // Very dark grey/black

/**
 * Initialize the Abstract Data Flow background
 * @param {HTMLElement} container - The container element for the Three.js canvas
 */
function initAbstractDataFlowBackground(container) {
    console.log('Initializing Abstract Data Flow background');

    // Scene, camera, and renderer setup
    scene = createScene();
    camera = createCamera();
    renderer = createRenderer(container);

    // Add lighting (subtle ambient light)
    addLighting(scene);

    // Add background elements (nodes and lines)
    addAbstractElements(scene);

    // Set up window resize handler
    handleWindowResize(camera, renderer);

    // Animation loop
    animate();

    console.log('Abstract Data Flow background initialized successfully');
}

/**
 * Create the Three.js scene
 * @return {THREE.Scene} The created scene
 */
function createScene() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(backgroundColor); // Set background color
    return scene;
}

/**
 * Create the camera
 * @return {THREE.PerspectiveCamera} The created camera
 */
function createCamera() {
    const camera = new THREE.PerspectiveCamera(
        60, // Slightly narrower FOV
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 15; // Position camera further back
    return camera;
}

/**
 * Create the renderer and add it to the container
 * @param {HTMLElement} container - The container element for the Three.js canvas
 * @return {THREE.WebGLRenderer} The created renderer
 */
function createRenderer(container) {
    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false // Background color is set on the scene
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    return renderer;
}

/**
 * Add lighting to the scene
 * @param {THREE.Scene} scene - The Three.js scene
 */
function addLighting(scene) {
    // Subtle ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    // Directional light for subtle highlights
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);
}

/**
 * Add abstract data flow elements (nodes and lines) to the scene
 * @param {THREE.Scene} scene - The Three.js scene
 */
function addAbstractElements(scene) {
    // Create nodes
    const nodeGeometry = new THREE.SphereGeometry(0.3, 16, 16); // Smaller spheres
    const nodeMaterial = new THREE.MeshStandardMaterial({
        color: nodeColor,
        emissive: nodeColor, // Emissive color for glow effect
        emissiveIntensity: 0.5, // Subtle glow
        metalness: 0.8,
        roughness: 0.2
    });

    for (let i = 0; i < nodeCount; i++) {
        const node = new THREE.Mesh(nodeGeometry, nodeMaterial.clone());
        // Distribute nodes in a larger volume
        node.position.set(
            (Math.random() - 0.5) * 30,
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 30
        );
        node.userData.floatSpeed = new THREE.Vector3(
            (Math.random() - 0.5) * 0.01,
            (Math.random() - 0.5) * 0.01,
            (Math.random() - 0.5) * 0.01
        );
        scene.add(node);
        nodes.push(node);
    }

    // Create lines between nearby nodes
    const lineMaterial = new THREE.LineBasicMaterial({
        color: lineColor,
        transparent: true,
        opacity: 0.3, // Subtle opacity
        blending: THREE.AdditiveBlending // Additive blending for glow
    });

    const maxDistance = 8; // Maximum distance for lines between nodes

    for (let i = 0; i < nodeCount; i++) {
        for (let j = i + 1; j < nodeCount; j++) {
            const nodeA = nodes[i];
            const nodeB = nodes[j];
            const distance = nodeA.position.distanceTo(nodeB.position);

            if (distance < maxDistance) {
                const points = [nodeA.position, nodeB.position];
                const geometry = new THREE.BufferGeometry().setFromPoints(points);
                const line = new THREE.Line(geometry, lineMaterial.clone());
                line.userData.nodes = [nodeA, nodeB]; // Store connected nodes
                scene.add(line);
                lines.push(line);
            }
        }
    }
}

// Store mouse position for interactive effects
const mouse = {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    speed: 0.05 // Easing factor
};

// Add mouse move event listener
window.addEventListener('mousemove', (event) => {
    mouse.targetX = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.targetY = -(event.clientY / window.innerHeight) * 2 + 1;
});

/**
 * Handle window resize events
 * @param {THREE.PerspectiveCamera} camera - The Three.js camera
 * @param {THREE.WebGLRenderer} renderer - The Three.js renderer
 */
function handleWindowResize(camera, renderer) {
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

/**
 * Animation loop
 */
function animate() {
    requestAnimationFrame(animate);

    // Apply mouse easing for smooth effects
    mouse.x += (mouse.targetX - mouse.x) * mouse.speed;
    mouse.y += (mouse.targetY - mouse.y) * mouse.speed;

    // Subtly move camera based on mouse position
    camera.position.x += (mouse.x * 1 - camera.position.x) * 0.01; // Increased sensitivity slightly
    camera.position.y += (mouse.y * 1 - camera.position.y) * 0.01; // Increased sensitivity slightly
    camera.lookAt(scene.position);

    // Animate nodes (floating movement)
    nodes.forEach(node => {
        node.position.add(node.userData.floatSpeed);

        // Wrap around if nodes go too far
        if (Math.abs(node.position.x) > 20) node.position.x *= -1;
        if (Math.abs(node.position.y) > 15) node.position.y *= -1;
        if (Math.abs(node.position.z) > 20) node.position.z *= -1;
    });

    // Update lines to follow nodes
    lines.forEach(line => {
        const nodeA = line.userData.nodes[0];
        const nodeB = line.userData.nodes[1];
        const positions = line.geometry.attributes.position.array;

        positions[0] = nodeA.position.x;
        positions[1] = nodeA.position.y;
        positions[2] = nodeA.position.z;

        positions[3] = nodeB.position.x;
        positions[4] = nodeB.position.y;
        positions[5] = nodeB.position.z;

        line.geometry.attributes.position.needsUpdate = true;
    });

    renderer.render(scene, camera);
}