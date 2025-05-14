/**
 * CodeClash: Programming Competition Leaderboard
 * Three.js Background Module
 * 
 * This file handles the Three.js background effects that provide ambient, interactive
 * visual elements to enhance the user experience.
 */

// Ensure Three.js is loaded before executing this code
document.addEventListener('DOMContentLoaded', () => {
    // Check if the background canvas container exists
    const bgCanvasContainer = document.getElementById('bg-canvas-container');

    if (bgCanvasContainer) {
        // Check if Three.js is available
        if (typeof THREE === 'undefined') {
            console.error('Three.js library is not loaded. Background effects will not be displayed.');
            return;
        }

        try {
            initThreeBackground(bgCanvasContainer);
        } catch (error) {
            console.error('Error initializing Three.js background:', error);
            // Allow the site to function without the background
        }
    }
});

/**
 * Initialize the Three.js background
 * @param {HTMLElement} container - The container element for the Three.js canvas
 */
function initThreeBackground(container) {
    console.log('Initializing Three.js background');

    // Scene, camera, and renderer setup
    const scene = createScene();
    const camera = createCamera();
    const renderer = createRenderer(container);

    // Add lighting
    addLighting(scene);

    // Add background elements
    addBackgroundElements(scene);

    // Set up window resize handler
    handleWindowResize(camera, renderer);

    // Animation loop
    animate(scene, camera, renderer);

    console.log('Three.js background initialized successfully');
}

/**
 * Create the Three.js scene
 * @return {THREE.Scene} The created scene
 */
function createScene() {
    // Create a new scene
    const scene = new THREE.Scene();

    // Optional: Set scene background color
    // scene.background = new THREE.Color(0xf0f0f0);

    return scene;
}

/**
 * Create the camera
 * @return {THREE.PerspectiveCamera} The created camera
 */
function createCamera() {
    // Create a perspective camera
    // Parameters: FOV, aspect ratio, near clipping plane, far clipping plane
    const camera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );

    // Position the camera back from the scene
    camera.position.z = 5;

    return camera;
}

/**
 * Create the renderer and add it to the container
 * @param {HTMLElement} container - The container element for the Three.js canvas
 * @return {THREE.WebGLRenderer} The created renderer
 */
function createRenderer(container) {
    // Create WebGL renderer
    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true // Makes background transparent
    });

    // Set renderer size to match the container
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Set pixel ratio for high DPI displays
    renderer.setPixelRatio(window.devicePixelRatio);

    // Add the renderer's canvas to the container
    container.appendChild(renderer.domElement);

    return renderer;
}

/**
 * Add lighting to the scene
 * @param {THREE.Scene} scene - The Three.js scene
 */
function addLighting(scene) {
    // Add ambient light for overall illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Add directional light for subtle highlights
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 10, 5);
    scene.add(directionalLight);
}

/**
 * Add background elements to the scene
 * @param {THREE.Scene} scene - The Three.js scene
 */
function addBackgroundElements(scene) {
    // Create programming-themed visual elements
    addCodeParticles(scene);
    addGeometricElements(scene);
    addBinaryPlanes(scene);
}

/**
 * Add floating code particles to the scene
 * @param {THREE.Scene} scene - The Three.js scene
 */
function addCodeParticles(scene) {
    // Create a particle system for code snippets
    const particleCount = 80;
    const particles = new THREE.BufferGeometry();

    // Create arrays for particle positions, sizes and colors
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    // Define code colors - blues and greens for a programming feel
    const colorPalette = [
        new THREE.Color(0x61dafb), // React blue
        new THREE.Color(0x3178c6), // TypeScript blue
        new THREE.Color(0x41b883), // Vue green
        new THREE.Color(0x3eaf7c), // Vue docs green
        new THREE.Color(0x00d8ff), // Light blue
        new THREE.Color(0x4584b6), // Python blue
        new THREE.Color(0x3572A5)  // Another Python shade
    ];

    // Create particles with random positions, sizes and colors
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;

        // Position particles throughout the scene
        positions[i3] = (Math.random() - 0.5) * 25;  // x
        positions[i3 + 1] = (Math.random() - 0.5) * 25;  // y
        positions[i3 + 2] = (Math.random() - 0.5) * 25;  // z

        // Assign random color from palette
        const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;

        // Random sizes for variety
        sizes[i] = 0.5 + Math.random() * 1.5;
    }

    // Add attributes to particles geometry
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particles.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Create shader material for particles
    const particleMaterial = new THREE.PointsMaterial({
        size: 0.8,
        transparent: true,
        opacity: 0.7,
        vertexColors: true,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending
    });

    // Create the particle system and add to scene
    const particleSystem = new THREE.Points(particles, particleMaterial);
    particleSystem.name = 'codeParticles';
    scene.add(particleSystem);

    // Store particle system data for animation
    particleSystem.userData = {
        particlePositions: positions,
        particleSpeeds: Array(particleCount).fill().map(() => ({
            x: (Math.random() - 0.5) * 0.01,
            y: (Math.random() - 0.5) * 0.01,
            z: (Math.random() - 0.5) * 0.01
        }))
    };
}

/**
 * Add geometric elements to represent programming concepts
 * @param {THREE.Scene} scene - The Three.js scene
 */
function addGeometricElements(scene) {
    // Programming-themed geometric shapes representing data structures and algorithms
    const geometries = [
        // Array/list representation (stacked cubes)
        new THREE.BoxGeometry(0.6, 0.3, 0.3),

        // Binary tree/node representation (icosahedron)
        new THREE.IcosahedronGeometry(0.4, 0),

        // Database/data store representation (cylinder)
        new THREE.CylinderGeometry(0.3, 0.3, 0.5, 16),

        // Networks/connectivity representation (sphere)
        new THREE.SphereGeometry(0.4, 16, 16),

        // Function/module representation (torus)
        new THREE.TorusGeometry(0.4, 0.15, 16, 32),

        // Algorithm flow (TorusKnot)
        new THREE.TorusKnotGeometry(0.3, 0.1, 64, 16)
    ];

    // Colors associated with programming languages and tools
    const colors = [
        0x4584b6,  // Python blue
        0xf7df1e,  // JavaScript yellow
        0xff6c37,  // Rust/Swift orange
        0x41b883,  // Vue green
        0x61dafb,  // React blue
        0xdd0031,  // Angular red
    ];

    // Create 15-20 objects for a dense but not overwhelming scene
    const objectCount = 18;
    for (let i = 0; i < objectCount; i++) {
        // Random geometry
        const geometry = geometries[Math.floor(Math.random() * geometries.length)];

        // Random color
        const color = colors[Math.floor(Math.random() * colors.length)];

        // Create material - mix of standard, phong, and wireframes for variety
        let material;
        const materialType = Math.random();

        if (materialType < 0.4) {
            // Wireframe look for code/algorithm representation
            material = new THREE.MeshBasicMaterial({
                color: color,
                wireframe: true,
                transparent: true,
                opacity: 0.7
            });
        } else if (materialType < 0.7) {
            // Shiny look for modern programming concepts
            material = new THREE.MeshPhongMaterial({
                color: color,
                transparent: true,
                opacity: 0.8,
                shininess: 100,
                specular: 0xffffff
            });
        } else {
            // Standard look with medium opacity
            material = new THREE.MeshStandardMaterial({
                color: color,
                transparent: true,
                opacity: 0.85,
                roughness: 0.5,
                metalness: 0.2
            });
        }

        // Create mesh
        const mesh = new THREE.Mesh(geometry.clone(), material);

        // Distribution - place objects in a somewhat spherical arrangement
        const radius = 5 + Math.random() * 8;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;

        mesh.position.set(
            radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.cos(phi),
            radius * Math.sin(phi) * Math.sin(theta)
        );

        // Random rotation
        mesh.rotation.set(
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2
        );

        // Random scale for visual interest
        const scale = 0.5 + Math.random() * 1.5;
        mesh.scale.set(scale, scale, scale);

        // Store animation properties in userData
        mesh.userData = {
            rotationSpeed: {
                x: (Math.random() - 0.5) * 0.005,
                y: (Math.random() - 0.5) * 0.005,
                z: (Math.random() - 0.5) * 0.005
            },
            orbitSpeed: (Math.random() - 0.5) * 0.001,
            orbitRadius: radius,
            orbitTheta: theta,
            floatSpeed: {
                x: (Math.random() - 0.5) * 0.005,
                y: (Math.random() - 0.5) * 0.005,
                z: (Math.random() - 0.5) * 0.005
            }
        };

        scene.add(mesh);
    }
}

/**
 * Add binary planes with 0s and 1s to represent code
 * @param {THREE.Scene} scene - The Three.js scene
 */
function addBinaryPlanes(scene) {
    // Create planes with binary texture for code representation
    const planeCount = 4;

    for (let i = 0; i < planeCount; i++) {
        // Create canvas for binary code texture
        const canvas = document.createElement('canvas');
        const size = 256;
        canvas.width = size;
        canvas.height = size;

        const context = canvas.getContext('2d');
        context.fillStyle = 'rgba(10, 30, 50, 0.2)';
        context.fillRect(0, 0, size, size);
        context.font = '12px Courier New';

        // Randomly choose color based on programming themes
        const colors = ['rgba(95, 215, 255, 0.7)', 'rgba(100, 220, 200, 0.7)', 'rgba(65, 184, 131, 0.7)'];
        context.fillStyle = colors[Math.floor(Math.random() * colors.length)];

        // Fill with random binary (0s and 1s) and code symbols
        const symbols = ['0', '1', '{', '}', '()', '=>', '[]', '&&', '||', '==', '!=', '++'];

        // Generate a semi-structured pattern like code
        for (let y = 10; y < size; y += 20) {
            // Vary line indentation to simulate code
            const indent = Math.floor(Math.random() * 5) * 20;
            let line = '';

            // Generate random code-like content
            const lineLength = Math.floor((size - indent) / 10);
            for (let c = 0; c < lineLength; c++) {
                if (Math.random() > 0.7) {
                    line += symbols[Math.floor(Math.random() * symbols.length)];
                } else {
                    line += Math.random() > 0.5 ? '0' : '1';
                }
                line += ' ';
            }

            context.fillText(line, indent, y);
        }

        // Create texture from canvas
        const texture = new THREE.CanvasTexture(canvas);

        // Create plane geometry
        const planeGeometry = new THREE.PlaneGeometry(8, 8);
        const planeMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity: 0.5,
            side: THREE.DoubleSide
        });

        const plane = new THREE.Mesh(planeGeometry, planeMaterial);

        // Position planes randomly
        const distance = 8 + Math.random() * 7;
        const angle = i * (Math.PI * 2 / planeCount) + Math.random() * 0.5;

        plane.position.set(
            Math.cos(angle) * distance,
            (Math.random() - 0.5) * 8,
            Math.sin(angle) * distance
        );

        // Rotate planes to face random directions
        plane.rotation.x = Math.random() * Math.PI;
        plane.rotation.y = Math.random() * Math.PI;
        plane.rotation.z = Math.random() * Math.PI;

        // Store animation data
        plane.userData = {
            rotationSpeed: {
                x: (Math.random() - 0.5) * 0.001,
                y: (Math.random() - 0.5) * 0.001,
                z: (Math.random() - 0.5) * 0.001
            },
            floatSpeed: {
                x: (Math.random() - 0.5) * 0.003,
                y: (Math.random() - 0.5) * 0.003,
                z: (Math.random() - 0.5) * 0.003
            }
        };

        scene.add(plane);
    }
}

// Store mouse position for interactive effects
const mouse = {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    speed: 0.1  // Easing factor
};

// Add mouse move event listener
window.addEventListener('mousemove', (event) => {
    // Convert mouse position to normalized coordinates (-1 to 1)
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
        // Update camera aspect ratio
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        // Update renderer size
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

/**
 * Animation loop
 * @param {THREE.Scene} scene - The Three.js scene
 * @param {THREE.PerspectiveCamera} camera - The Three.js camera
 * @param {THREE.WebGLRenderer} renderer - The Three.js renderer
 */
function animate(scene, camera, renderer) {
    // Use requestAnimationFrame for the animation loop
    requestAnimationFrame(() => animate(scene, camera, renderer));

    // Apply mouse easing for smooth effects
    mouse.x += (mouse.targetX - mouse.x) * mouse.speed;
    mouse.y += (mouse.targetY - mouse.y) * mouse.speed;

    // Subtly move camera based on mouse position
    camera.position.x += (mouse.x * 1.5 - camera.position.x) * 0.01;
    camera.position.y += (mouse.y * 1.5 - camera.position.y) * 0.01;
    camera.lookAt(scene.position);

    // Get current time for time-based animation
    const time = Date.now() * 0.0005;

    // Animate all objects in the scene
    scene.traverse(object => {
        // Handle mesh objects (geometric elements and binary planes)
        if (object instanceof THREE.Mesh && object.userData) {
            // Rotate the object
            object.rotation.x += object.userData.rotationSpeed.x;
            object.rotation.y += object.userData.rotationSpeed.y;
            object.rotation.z += object.userData.rotationSpeed.z;

            // Add subtle motion based on mouse position
            object.rotation.x += mouse.y * 0.001;
            object.rotation.y += mouse.x * 0.001;

            // Make it float/drift
            object.position.x += object.userData.floatSpeed.x;
            object.position.y += object.userData.floatSpeed.y;
            object.position.z += object.userData.floatSpeed.z;

            // Boundary check - if object goes too far, reverse direction
            ['x', 'y', 'z'].forEach(axis => {
                if (Math.abs(object.position[axis]) > 15) {
                    object.userData.floatSpeed[axis] *= -1;
                }
            });

            // If object has orbit parameters, make it orbit
            if (object.userData.orbitSpeed !== undefined) {
                object.userData.orbitTheta += object.userData.orbitSpeed;
                const radius = object.userData.orbitRadius;

                object.position.x = radius * Math.cos(object.userData.orbitTheta);
                object.position.z = radius * Math.sin(object.userData.orbitTheta);
            }
        }

        // Handle particle system animation
        if (object instanceof THREE.Points && object.name === 'codeParticles') {
            const positions = object.geometry.attributes.position.array;
            const speeds = object.userData.particleSpeeds;

            // Update each particle position
            for (let i = 0; i < speeds.length; i++) {
                const i3 = i * 3;

                // Update positions with speed
                positions[i3] += speeds[i].x;
                positions[i3 + 1] += speeds[i].y;
                positions[i3 + 2] += speeds[i].z;

                // Add subtle wave motion based on time
                positions[i3] += Math.sin(time + i * 0.1) * 0.01;
                positions[i3 + 1] += Math.cos(time + i * 0.1) * 0.01;

                // Add subtle mouse interaction
                positions[i3] += mouse.x * 0.01;
                positions[i3 + 1] += mouse.y * 0.01;

                // Boundary check and wrap-around
                ['x', 'y', 'z'].forEach((axis, axisIndex) => {
                    const axisPos = i3 + axisIndex;
                    if (Math.abs(positions[axisPos]) > 18) {
                        speeds[i][axis] *= -1; // Reverse direction

                        // Slightly randomize speed after boundary hit for more natural motion
                        speeds[i][axis] *= 0.8 + Math.random() * 0.4;
                    }
                });
            }

            // Update the attribute to reflect the new positions
            object.geometry.attributes.position.needsUpdate = true;
        }
    });

    // Render the scene
    renderer.render(scene, camera);
}