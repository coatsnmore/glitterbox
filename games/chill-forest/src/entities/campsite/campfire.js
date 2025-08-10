import * as THREE from 'three';

export function createCampfire() {
    const group = new THREE.Group();
    
    // Stone circle
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const stone = new THREE.Mesh(
            new THREE.SphereGeometry(0.2, 4, 4),
            new THREE.MeshStandardMaterial({ color: 0x808080 })
        );
        stone.position.set(
            Math.cos(angle) * 0.5,
            0.1,
            Math.sin(angle) * 0.5
        );
        group.add(stone);
    }
    
    // Logs
    const logGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1);
    const logMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    
    for (let i = 0; i < 3; i++) {
        const log = new THREE.Mesh(logGeometry, logMaterial);
        log.rotation.z = Math.PI / 2;
        log.rotation.y = (i / 3) * Math.PI;
        log.position.y = 0.1;
        group.add(log);
    }
    
    // Add point light for fire glow
    const fireLight = new THREE.PointLight(0xff6600, 1, 10);
    fireLight.position.set(0, 0.5, 0);
    group.add(fireLight);
    
    return group;
} 