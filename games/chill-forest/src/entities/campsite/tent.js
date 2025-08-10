import * as THREE from 'three';

export function createTent() {
    const group = new THREE.Group();
    
    // Tent canvas (triangular prism)
    const tentGeometry = new THREE.CylinderGeometry(0, 1.5, 2, 3);
    const tentMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const tent = new THREE.Mesh(tentGeometry, tentMaterial);
    tent.rotation.y = 0;
    tent.scale.z = 0.7;
    
    // Tent entrance (darker triangle)
    const entranceGeometry = new THREE.CircleGeometry(0.5, 3);
    const entranceMaterial = new THREE.MeshStandardMaterial({ color: 0x3d1f09 });
    const entrance = new THREE.Mesh(entranceGeometry, entranceMaterial);
    entrance.position.set(0, -0.5, 0.7);
    entrance.rotation.y = 0;
    
    group.add(tent, entrance);
    return group;
} 