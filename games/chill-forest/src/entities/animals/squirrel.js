import * as THREE from 'three';

export function createSquirrel() {
    const group = new THREE.Group();
    
    // Body
    const bodyGeometry = new THREE.CapsuleGeometry(0.1, 0.2, 4, 8);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.rotation.z = Math.PI / 2;
    
    // Tail (curved)
    const tailCurve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-0.2, 0, 0),
        new THREE.Vector3(-0.3, 0.2, 0),
        new THREE.Vector3(-0.2, 0.4, 0)
    );
    
    const tailGeometry = new THREE.TubeGeometry(tailCurve, 8, 0.03, 8, false);
    const tail = new THREE.Mesh(tailGeometry, bodyMaterial);
    
    group.add(body, tail);
    group.scale.set(0.3, 0.3, 0.3);
    
    // Animation properties
    let time = Math.random() * Math.PI * 2;
    let currentTree = null;
    let targetTree = null;
    let progress = 0;
    
    function animate(trees) {
        time += 0.02;
        
        if (!currentTree || progress >= 1) {
            // Pick a new random tree
            currentTree = targetTree || trees[Math.floor(Math.random() * trees.length)];
            targetTree = trees[Math.floor(Math.random() * trees.length)];
            progress = 0;
            
            // Add random pause between jumps
            if (Math.random() < 0.3) { // 30% chance to pause
                progress = -Math.random() * 50; // Negative progress acts as pause timer
            }
        }
        
        if (progress < 0) {
            progress += 0.02;
            return;
        }
        
        progress += 0.008;
        
        // Move between trees
        const startPos = currentTree.position;
        const endPos = targetTree.position;
        
        group.position.x = THREE.MathUtils.lerp(startPos.x, endPos.x, progress);
        group.position.z = THREE.MathUtils.lerp(startPos.z, endPos.z, progress);
        group.position.y = Math.sin(progress * Math.PI) * 1.5 + 0.3; // Added base height of 0.3
        
        // Rotate to face direction of movement
        group.rotation.y = Math.atan2(
            endPos.z - startPos.z,
            endPos.x - startPos.x
        );
        
        // Animate tail
        tail.rotation.z = Math.sin(time * 8) * 0.2;
    }
    
    return { group, animate };
} 