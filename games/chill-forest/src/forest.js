import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { createTree } from './entities/tree.js';
import { createTent } from './entities/campsite/tent.js';
import { createCampfire } from './entities/campsite/campfire.js';
import { createControlsOverlay } from './ui/controls-overlay.js';
import { createDog } from './entities/animals/dog.js';
import { createBird } from './entities/animals/bird.js';
import { createSquirrel } from './entities/animals/squirrel.js';
import { createFireflies } from './entities/firefly.js';
import { createForestDetails } from './entities/forest-details.js';
import { createDeer } from './entities/animals/deer.js';
import { createNaturalResources } from './entities/natural-resources.js';
import { createStars } from './entities/stars.js';
import { createDruidicCircle } from './entities/ruins/druidic-circle.js';
import { createGrass } from './entities/grass.js';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
camera.position.set(20, 15, 20);
camera.lookAt(0, 0, 0);

// Configure controls for easier navigation
controls.enableDamping = true; // Add smooth damping
controls.dampingFactor = 0.05;
controls.screenSpacePanning = true; // Enable screen space panning
controls.mouseButtons = {
    LEFT: THREE.MOUSE.PAN, // Change left click to pan
    MIDDLE: THREE.MOUSE.DOLLY,
    RIGHT: THREE.MOUSE.ROTATE
};
controls.update();

// Add ambient light
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

// Add directional light (sunlight)
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Create ground
const groundRadius = 50; // Matches the forest radius
const groundSegments = 64; // More segments for smoother circle
const groundGeometry = new THREE.CircleGeometry(groundRadius, groundSegments);
const groundMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x3a5f0b,
    side: THREE.DoubleSide,
    roughness: 0.8,
    metalness: 0.2
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2; // Rotate to be horizontal
scene.add(ground);

// Add a darker outer ring for forest edge
const outerGroundGeometry = new THREE.RingGeometry(
    groundRadius - 2, // Inner radius
    groundRadius + 3, // Outer radius
    groundSegments,
    1
);
const outerGroundMaterial = new THREE.MeshStandardMaterial({
    color: 0x2a4a0b, // Darker green
    side: THREE.DoubleSide
});
const outerGround = new THREE.Mesh(outerGroundGeometry, outerGroundMaterial);
outerGround.rotation.x = -Math.PI / 2;
outerGround.position.y = -0.01; // Slightly below main ground to prevent z-fighting
scene.add(outerGround);

// Add grass
const grass = createGrass();
scene.add(grass.group);

// Create campsite
const tent = createTent();
tent.position.set(3, 1, 0);
tent.rotation.y = Math.PI;
scene.add(tent);

const campfire = createCampfire();
campfire.position.set(0, 0, 0);
scene.add(campfire);

// Create trees array to track tree positions for squirrels
const trees = [];

// Create trees with varied sizes
const treeCount = 160;
const perimeterTreeCount = 530;
const clusterCount = 61;
const scatteredTreeCount = 130;

// Increase the placement area for all trees
const forestRadius = 55; // Increased from 50 to spill over edges
const clusterArea = 80;  // Increased from 70 for wider cluster spread

// Update the campsite area check to be more precise and include the tent area
function isInCampsiteArea(x, z) {
    // Check circular area around campfire
    const campsiteRadius = 8;
    const distanceFromCampfire = Math.sqrt(x * x + z * z);
    
    // Check rectangular area around tent (tent is at (3, 0))
    const tentX = 3;
    const tentZ = 0;
    const tentWidth = 4;  // Width of clear area around tent
    const tentLength = 6; // Length of clear area around tent
    const dx = x - tentX;
    const dz = z - tentZ;
    const inTentArea = Math.abs(dx) < tentWidth && Math.abs(dz) < tentLength;
    
    return distanceFromCampfire < campsiteRadius || inTentArea;
}

// Create tree clusters in the forest
for (let c = 0; c < clusterCount; c++) {
    const clusterCenter = {
        x: (Math.random() - 0.5) * clusterArea,
        z: (Math.random() - 0.5) * clusterArea
    };
    
    // Skip entire cluster if center is too close to campsite
    if (!isInCampsiteArea(clusterCenter.x, clusterCenter.z)) {
        const clusterSize = c < 20 ? 
            (13 + Math.random() * 14) :
            (20 + Math.random() * 10);
        
        for (let i = 0; i < clusterSize; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 12;
            const x = clusterCenter.x + Math.cos(angle) * distance;
            const z = clusterCenter.z + Math.sin(angle) * distance;
            
            // Double check individual tree isn't in campsite area
            if (!isInCampsiteArea(x, z)) {
                const sizeScale = getTreeScale();
                const tree = createTree(x, z, sizeScale);
                trees.push(tree);
                scene.add(tree);
            }
        }
    }
}

// Add scattered trees between clusters
for (let i = 0; i < scatteredTreeCount; i++) {
    let x = (Math.random() - 0.5) * 100;
    let z = (Math.random() - 0.5) * 100;
    
    if (!isInCampsiteArea(x, z)) {
        const sizeScale = getTreeScale();
        const tree = createTree(x, z, sizeScale);
        trees.push(tree);
        scene.add(tree);
    }
}

// Create dense perimeter trees with more variation
for (let i = 0; i < perimeterTreeCount; i++) {
    const angle = (i / perimeterTreeCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.3; // More angle variation
    const radius = 40 + Math.random() * 12; // 40-52 units from center, wider spread
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    
    const sizeScale = 1.2 + Math.random() * 0.8;
    const tree = createTree(x, z, sizeScale);
    trees.push(tree);
    scene.add(tree);
}

// Add extra huge ancient trees with wider spread
const hugeTreeCount = 16; // Increased from 11
for (let i = 0; i < hugeTreeCount; i++) {
    const angle = (i / hugeTreeCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.8;
    const radius = 12 + Math.random() * 35; // 12-47 units from center
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    
    // More size variation for ancient trees
    const sizeScale = 2.5 + Math.random() * 1.5; // Increased max size from 3.5 to 4.0
    
    // Only place if not in campsite area
    if (!isInCampsiteArea(x, z)) {
        const tree = createTree(x, z, sizeScale);
        trees.push(tree);
        scene.add(tree);
    }
}

// Add a few extra-massive "elder" trees
const elderTreeCount = 3;
for (let i = 0; i < elderTreeCount; i++) {
    const angle = (i / elderTreeCount) * Math.PI * 2 + (Math.random() - 0.5) * 1.0;
    const radius = 15 + Math.random() * 25; // Keep these more central in the forest
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    
    // These are the largest trees in the forest
    const sizeScale = 4.0 + Math.random() * 1.0; // 4.0-5.0 size scale
    
    // Only place if not in campsite area
    if (!isInCampsiteArea(x, z)) {
        const tree = createTree(x, z, sizeScale);
        trees.push(tree);
        scene.add(tree);
    }
}

function getTreeScale() {
    const sizeRoll = Math.random();
    if (sizeRoll < 0.6) {  // 60% normal sized
        return 0.8 + Math.random() * 0.4; // 0.8 to 1.2
    } else if (sizeRoll < 0.9) {  // 30% larger
        return 1.2 + Math.random() * 0.6; // 1.2 to 1.8
    } else {  // 10% very large
        return 1.8 + Math.random() * 0.7; // 1.8 to 2.5
    }
}

// Add forest details
const forestDetails = createForestDetails();
scene.add(forestDetails);

// Add animals
const dog = createDog();
scene.add(dog.group);

const birds = Array(10).fill(null).map(() => {
    const bird = createBird();
    scene.add(bird.group);
    return bird;
});

const squirrels = Array(3).fill(null).map(() => {
    const squirrel = createSquirrel();
    scene.add(squirrel.group);
    return squirrel;
});

// Add fireflies
const fireflies = createFireflies(150);
scene.add(fireflies.group);

// Add deer with varying sizes
const deer = Array(5).fill(null).map(() => {
    const sizeScale = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
    const deer = createDeer(sizeScale);
    scene.add(deer.group);
    return deer;
});

// Add natural resources
const naturalResources = createNaturalResources(isInCampsiteArea);
scene.add(naturalResources);

// Add controls overlay
createControlsOverlay();

// Add keyboard controls state
const keys = {
    w: false,
    a: false,
    s: false,
    d: false
};

// Camera movement speed
const CAMERA_SPEED = 0.3;

// Add key listeners
window.addEventListener('keydown', (e) => {
    switch(e.key.toLowerCase()) {
        case 'w': keys.w = true; break;
        case 'a': keys.a = true; break;
        case 's': keys.s = true; break;
        case 'd': keys.d = true; break;
    }
});

window.addEventListener('keyup', (e) => {
    switch(e.key.toLowerCase()) {
        case 'w': keys.w = false; break;
        case 'a': keys.a = false; break;
        case 's': keys.s = false; break;
        case 'd': keys.d = false; break;
    }
});

// Update camera movement function
function updateCameraPosition() {
    // Get camera's forward and right vectors on the horizontal plane
    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();
    
    // Get forward direction from camera, zero out y component for horizontal movement
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();
    
    // Get right direction by crossing forward with up
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0));
    
    // Apply movement based on keys
    if (keys.w) {
        camera.position.add(forward.multiplyScalar(CAMERA_SPEED));
    }
    if (keys.s) {
        camera.position.sub(forward.multiplyScalar(CAMERA_SPEED));
    }
    if (keys.a) {
        camera.position.sub(right.multiplyScalar(CAMERA_SPEED));
    }
    if (keys.d) {
        camera.position.add(right.multiplyScalar(CAMERA_SPEED));
    }
}

// After creating natural resources and before the animation loop
// Create stars
const stars = createStars();
scene.add(stars.group);

// Add druidic ruins in a clear spot
function findClearSpot(radius) {
    const minDistanceFromTrees = 8; // Minimum distance from any tree
    const minDistanceFromCamp = 15; // Minimum distance from campsite
    const maxAttempts = 50; // Maximum attempts to find a spot
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        // Try a random position in the forest (avoiding the very edge)
        const angle = Math.random() * Math.PI * 2;
        const distance = 15 + Math.random() * 25; // Between 15 and 40 units from center
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;
        
        // Check distance from campsite
        if (Math.sqrt(x * x + z * z) < minDistanceFromCamp) {
            continue;
        }
        
        // Check distance from all trees
        let spotIsClear = true;
        for (const tree of trees) {
            const dx = tree.position.x - x;
            const dz = tree.position.z - z;
            const distanceToTree = Math.sqrt(dx * dx + dz * dz);
            
            if (distanceToTree < minDistanceFromTrees + radius) {
                spotIsClear = false;
                break;
            }
        }
        
        if (spotIsClear) {
            return { x, z };
        }
    }
    
    // If no ideal spot found, return a fallback position
    return { x: -25, z: -25 };
}

// Create and position druidic circle in a clear spot
const druidicCircle = createDruidicCircle();
const clearSpot = findClearSpot(8); // 8 units radius for the circle and some buffer
druidicCircle.position.set(clearSpot.x, 0, clearSpot.z);
scene.add(druidicCircle);

// Update animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    
    // Update camera position
    updateCameraPosition();
    
    // Animate grass
    grass.animate();
    
    // Animate stars
    stars.animate();
    
    // Animate animals
    dog.animate();
    birds.forEach(bird => bird.animate());
    squirrels.forEach(squirrel => squirrel.animate(trees));
    deer.forEach(deer => deer.animate());
    fireflies.animate();
    
    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Set dark background
renderer.setClearColor(0x000205); // Very dark blue/black

animate(); 