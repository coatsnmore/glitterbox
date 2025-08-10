import * as THREE from 'three';

export function createBird() {
    const group = new THREE.Group();
    
    // Bird body - reduced size
    const bodyGeometry = new THREE.ConeGeometry(0.1, 0.4, 8);  // Halved from 0.2, 0.8
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x4a4a4a });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.rotation.x = -Math.PI / 3;
    
    // Wings - reduced size
    const wingGeometry = new THREE.PlaneGeometry(0.5, 0.2);  // Halved from 1, 0.4
    const wingMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x4a4a4a,
        side: THREE.DoubleSide 
    });
    const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
    const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
    
    // Adjusted wing positions for smaller size
    leftWing.position.set(0.2, 0, 0);   // Halved from 0.4
    rightWing.position.set(-0.2, 0, 0);  // Halved from -0.4
    leftWing.rotation.y = Math.PI / 6;
    rightWing.rotation.y = -Math.PI / 6;
    
    group.add(body, leftWing, rightWing);
    
    // Animation properties
    let time = Math.random() * Math.PI * 2;
    const radius = 20 + Math.random() * 10;
    const height = 15 + Math.random() * 10;
    const speed = 0.02 + Math.random() * 0.01;
    let isDiving = false;
    let diveTarget = new THREE.Vector3();
    let diveStartPos = new THREE.Vector3();
    let diveProgress = 0;
    let wanderAngle = Math.random() * Math.PI * 2;
    let wanderTime = 0;
    
    function animate() {
        time += speed;
        wanderTime += speed;
        
        if (!isDiving) {
            // Normal flight pattern with wandering
            wanderAngle += (Math.sin(wanderTime) * 0.02);
            
            const x = Math.cos(wanderAngle) * radius;
            const z = Math.sin(wanderAngle) * radius;
            const y = height + Math.sin(time) * 2;
            
            group.position.set(x, y, z);
            group.lookAt(
                Math.cos(wanderAngle + 0.1) * radius,
                y,
                Math.sin(wanderAngle + 0.1) * radius
            );
            
            // Wing flapping animation
            const wingFlap = Math.sin(time * 15) * 0.3;
            leftWing.rotation.z = wingFlap;
            rightWing.rotation.z = -wingFlap;
            
            // Random diving
            if (Math.random() < 0.002) {
                isDiving = true;
                diveStartPos.copy(group.position);
                
                // Pick a random point on the ground to dive towards
                const diveAngle = Math.random() * Math.PI * 2;
                const diveRadius = Math.random() * 30;
                diveTarget.set(
                    Math.cos(diveAngle) * diveRadius,
                    2,
                    Math.sin(diveAngle) * diveRadius
                );
                diveProgress = 0;
            }
            
        } else {
            // Diving animation
            diveProgress += 0.02;
            
            if (diveProgress >= 1) {
                isDiving = false;
            } else {
                // Bezier curve for smooth dive
                const midPoint = new THREE.Vector3()
                    .copy(diveStartPos)
                    .lerp(diveTarget, 0.5);
                midPoint.y = Math.min(diveStartPos.y, diveTarget.y) - 5;
                
                const p0 = diveStartPos;
                const p1 = midPoint;
                const p2 = diveTarget;
                
                const t = diveProgress;
                group.position.set(
                    Math.pow(1-t, 2) * p0.x + 2 * (1-t) * t * p1.x + t * t * p2.x,
                    Math.pow(1-t, 2) * p0.y + 2 * (1-t) * t * p1.y + t * t * p2.y,
                    Math.pow(1-t, 2) * p0.z + 2 * (1-t) * t * p1.z + t * t * p2.z
                );
                
                // More intense wing flapping during dive
                const wingFlap = Math.sin(time * 25) * 0.5;
                leftWing.rotation.z = wingFlap;
                rightWing.rotation.z = -wingFlap;
                
                // Point towards next position
                const nextT = Math.min(1, t + 0.1);
                const nextPos = new THREE.Vector3(
                    Math.pow(1-nextT, 2) * p0.x + 2 * (1-nextT) * nextT * p1.x + nextT * nextT * p2.x,
                    Math.pow(1-nextT, 2) * p0.y + 2 * (1-nextT) * nextT * p1.y + nextT * nextT * p2.y,
                    Math.pow(1-nextT, 2) * p0.z + 2 * (1-nextT) * nextT * p1.z + nextT * nextT * p2.z
                );
                group.lookAt(nextPos);
            }
        }
    }
    
    return { group, animate };
} 