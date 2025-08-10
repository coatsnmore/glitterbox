import * as THREE from 'three';

export function createDruidicCircle() {
    const group = new THREE.Group();
    
    // Stone material with slight variations
    function createStoneMaterial() {
        return new THREE.MeshStandardMaterial({
            color: new THREE.Color(0x808080).multiplyScalar(0.8 + Math.random() * 0.4),
            roughness: 0.9,
            metalness: 0.1,
            bumpScale: 0.5
        });
    }

    // Create the main circle of standing stones
    const stoneCount = 8;
    const circleRadius = 6;
    
    for (let i = 0; i < stoneCount; i++) {
        const angle = (i / stoneCount) * Math.PI * 2;
        const x = Math.cos(angle) * circleRadius;
        const z = Math.sin(angle) * circleRadius;
        
        // Create a weathered standing stone
        const height = 3 + Math.random() * 1;
        const width = 1.2 + Math.random() * 0.4;
        const depth = 0.8 + Math.random() * 0.3;
        
        const stoneGeometry = new THREE.BoxGeometry(width, height, depth);
        // Distort the geometry for a more natural look
        const positions = stoneGeometry.attributes.position;
        for (let j = 0; j < positions.count; j++) {
            positions.setXYZ(
                j,
                positions.getX(j) + (Math.random() - 0.5) * 0.1,
                positions.getY(j) + (Math.random() - 0.5) * 0.1,
                positions.getZ(j) + (Math.random() - 0.5) * 0.1
            );
        }
        
        const stone = new THREE.Mesh(stoneGeometry, createStoneMaterial());
        stone.position.set(x, height/2, z);
        stone.rotation.y = angle + Math.PI/2 + (Math.random() - 0.5) * 0.2;
        stone.rotation.x = (Math.random() - 0.5) * 0.1;
        stone.rotation.z = (Math.random() - 0.5) * 0.1;
        
        // Add runes to each stone
        addRunesToStone(stone);
        
        group.add(stone);
    }
    
    // Create central altar stone
    const altarGeometry = new THREE.CylinderGeometry(2, 2.2, 1.2, 8);
    const altar = new THREE.Mesh(altarGeometry, createStoneMaterial());
    altar.position.y = 0.6;
    
    // Add spiral rune pattern to altar top
    const altarRunes = createSpiralRunes();
    altarRunes.rotation.x = -Math.PI/2;
    altarRunes.position.y = 0.61;
    group.add(altar, altarRunes);
    
    // Add fallen and broken stones
    for (let i = 0; i < 4; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = circleRadius * (0.7 + Math.random() * 0.6);
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        const fallenStone = createFallenStone();
        fallenStone.position.set(x, 0.4, z);
        fallenStone.rotation.y = Math.random() * Math.PI;
        group.add(fallenStone);
    }
    
    // Add ground detail and moss
    const groundDetail = createGroundDetail(circleRadius);
    group.add(groundDetail);
    
    return group;
}

function addRunesToStone(stone) {
    const runeTexture = createRuneTexture();
    const runeGeometry = new THREE.PlaneGeometry(0.8, 2);
    const runeMaterial = new THREE.MeshStandardMaterial({
        map: runeTexture,
        emissive: 0x3333ff,
        emissiveIntensity: 0.1,
        transparent: true,
        opacity: 0.7
    });
    
    const runes = new THREE.Mesh(runeGeometry, runeMaterial);
    runes.position.z = stone.geometry.parameters.depth/2 + 0.01;
    stone.add(runes);
}

function createRuneTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    
    // Draw random rune-like symbols
    for (let i = 0; i < 5; i++) {
        const y = i * 50 + 20;
        ctx.beginPath();
        ctx.moveTo(20, y);
        
        // Create random rune-like shapes
        for (let j = 0; j < 3; j++) {
            ctx.lineTo(20 + Math.random() * 24, y + Math.random() * 40 - 20);
        }
        ctx.stroke();
    }
    
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    return texture;
}

function createSpiralRunes() {
    const geometry = new THREE.PlaneGeometry(3.8, 3.8);
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    
    // Draw spiral pattern
    const centerX = canvas.width/2;
    const centerY = canvas.height/2;
    let angle = 0;
    let radius = 10;
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    
    while (radius < canvas.width/2 - 20) {
        angle += 0.2;
        radius += 0.5;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        ctx.lineTo(x, y);
    }
    ctx.stroke();
    
    // Add rune marks along the spiral
    for (let i = 0; i < 12; i++) {
        const runeAngle = i * Math.PI/6;
        const runeRadius = 60;
        const x = centerX + Math.cos(runeAngle) * runeRadius;
        const y = centerY + Math.sin(runeAngle) * runeRadius;
        
        ctx.beginPath();
        ctx.moveTo(x - 10, y - 10);
        ctx.lineTo(x + 10, y + 10);
        ctx.moveTo(x - 10, y + 10);
        ctx.lineTo(x + 10, y - 10);
        ctx.stroke();
    }
    
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    
    const material = new THREE.MeshStandardMaterial({
        map: texture,
        transparent: true,
        opacity: 0.8,
        emissive: 0x3333ff,
        emissiveIntensity: 0.1
    });
    
    return new THREE.Mesh(geometry, material);
}

function createFallenStone() {
    const geometry = new THREE.BoxGeometry(1 + Math.random() * 0.5, 2 + Math.random(), 0.8);
    const stone = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({
        color: 0x808080,
        roughness: 0.9
    }));
    
    stone.rotation.z = Math.PI/2 + (Math.random() - 0.5) * 0.3;
    return stone;
}

function createGroundDetail(radius) {
    const group = new THREE.Group();
    
    // Create mossy ground
    const groundGeometry = new THREE.CircleGeometry(radius + 2, 32);
    const groundMaterial = new THREE.MeshStandardMaterial({
        color: 0x2d4a1d,
        roughness: 1
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI/2;
    ground.position.y = 0.01;
    
    // Add scattered rocks
    for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * (radius + 1);
        const x = Math.cos(angle) * dist;
        const z = Math.sin(angle) * dist;
        
        const rockGeometry = new THREE.DodecahedronGeometry(0.2 + Math.random() * 0.2);
        const rock = new THREE.Mesh(rockGeometry, new THREE.MeshStandardMaterial({
            color: 0x666666,
            roughness: 0.9
        }));
        
        rock.position.set(x, 0.1, z);
        rock.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        group.add(rock);
    }
    
    group.add(ground);
    return group;
} 