import * as THREE from 'three';

export function createTree(x, z, sizeScale = 1) {
    const group = new THREE.Group();
    
    // Much more size variation
    const heightScale = (0.5 + Math.random() * 1.5) * sizeScale;
    const widthScale = (0.7 + Math.random() * 0.6) * sizeScale;
    
    // Tree trunk
    const trunkGeometry = new THREE.CylinderGeometry(
        0.2 * widthScale,
        0.3 * widthScale,
        2 * heightScale,
        8
    );
    const trunkMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8B4513,
        roughness: 0.9
    });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = heightScale; // Move trunk up by half its height
    
    // Tree top (multiple layers for fuller trees)
    const layers = Math.floor(2 + Math.random() * 2); // 2-3 layers
    for (let i = 0; i < layers; i++) {
        const topGeometry = new THREE.ConeGeometry(
            (1 - i * 0.2) * widthScale,
            2 * heightScale / layers,
            8
        );
        const topMaterial = new THREE.MeshStandardMaterial({
            color: 0x2d5a27,
            roughness: 0.8
        });
        const top = new THREE.Mesh(topGeometry, topMaterial);
        top.position.y = (2 * heightScale) + (i * heightScale / layers) - (heightScale / layers);
        group.add(top);
    }
    
    group.add(trunk);
    group.position.set(x, 0, z); // Keep base at ground level
    
    // Random rotation for variety
    group.rotation.y = Math.random() * Math.PI * 2;
    
    return group;
} 