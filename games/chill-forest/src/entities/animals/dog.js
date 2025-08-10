import * as THREE from 'three';

export function createDog() {
    const group = new THREE.Group();
    
    // Materials
    const furMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8B4513,
        roughness: 0.8
    });
    const darkFurMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x654321,
        roughness: 0.8
    });
    const noseMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x1a1a1a,
        roughness: 0.5
    });

    // Body (more oval shaped)
    const bodyGeometry = new THREE.CapsuleGeometry(0.25, 0.5, 8, 8);
    const body = new THREE.Mesh(bodyGeometry, furMaterial);
    body.rotation.z = Math.PI / 2;
    body.scale.y = 0.8;

    // Head (slightly oval)
    const headGroup = new THREE.Group();
    const headGeometry = new THREE.SphereGeometry(0.2, 12, 12);
    const head = new THREE.Mesh(headGeometry, furMaterial);
    head.scale.z = 0.8;
    
    // Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.03, 8, 8);
    const eyeMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x4B9CD3, // Blue eyes
        roughness: 0.2,
        metalness: 0.8
    });
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    
    // Position eyes on the face
    leftEye.position.set(0.15, 0.1, 0.12);
    rightEye.position.set(0.15, 0.1, -0.12);

    // Add pupils
    const pupilGeometry = new THREE.SphereGeometry(0.015, 8, 8);
    const pupilMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
    const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    
    leftPupil.position.set(0.17, 0.1, 0.12);
    rightPupil.position.set(0.17, 0.1, -0.12);
    
    // Snout
    const snoutGeometry = new THREE.CapsuleGeometry(0.12, 0.15, 8, 8);
    const snout = new THREE.Mesh(snoutGeometry, furMaterial);
    snout.rotation.z = Math.PI / 2;
    snout.position.x = 0.2;
    snout.scale.y = 0.7;
    
    // Nose
    const noseGeometry = new THREE.SphereGeometry(0.05, 8, 8);
    const nose = new THREE.Mesh(noseGeometry, noseMaterial);
    nose.position.x = 0.3;
    nose.scale.z = 0.7;

    // Ears
    const earGeometry = new THREE.CapsuleGeometry(0.05, 0.15, 8, 8);
    const leftEar = new THREE.Mesh(earGeometry, darkFurMaterial);
    const rightEar = new THREE.Mesh(earGeometry, darkFurMaterial);
    
    leftEar.position.set(-0.1, 0.2, 0.1);
    rightEar.position.set(-0.1, 0.2, -0.1);
    leftEar.rotation.x = -0.3;
    rightEar.rotation.x = 0.3;

    headGroup.add(head, snout, nose, leftEar, rightEar, leftEye, rightEye, leftPupil, rightPupil);
    headGroup.position.set(0.4, 0.1, 0);

    // Legs with joints
    const legs = [];
    const legPositions = [
        [-0.15, -0.15], [0.15, -0.15],  // Front legs
        [-0.15, 0.15], [0.15, 0.15]     // Back legs
    ];

    legPositions.forEach(([x, z], index) => {
        const legGroup = new THREE.Group();
        
        // Upper leg
        const upperLegGeometry = new THREE.CapsuleGeometry(0.05, 0.2, 8, 8);
        const upperLeg = new THREE.Mesh(upperLegGeometry, furMaterial);
        upperLeg.position.y = -0.1;
        
        // Lower leg
        const lowerLegGeometry = new THREE.CapsuleGeometry(0.04, 0.2, 8, 8);
        const lowerLeg = new THREE.Mesh(lowerLegGeometry, furMaterial);
        lowerLeg.position.y = -0.25;
        
        // Paw
        const pawGeometry = new THREE.SphereGeometry(0.05, 8, 8);
        const paw = new THREE.Mesh(pawGeometry, darkFurMaterial);
        paw.position.y = -0.35;
        paw.scale.y = 0.5;

        legGroup.add(upperLeg, lowerLeg, paw);
        legGroup.position.set(x, -0.1, z);
        legs.push(legGroup);
        group.add(legGroup);
    });

    // Tail (curved)
    const tailCurve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-0.3, 0.1, 0),
        new THREE.Vector3(-0.5, 0.3, 0),
        new THREE.Vector3(-0.4, 0.4, 0)
    );
    const tailGeometry = new THREE.TubeGeometry(tailCurve, 8, 0.04, 8, false);
    const tail = new THREE.Mesh(tailGeometry, darkFurMaterial);

    group.add(body, headGroup, tail);
    group.scale.set(0.7, 0.7, 0.7);
    group.position.y = 0.5;
    
    // Animation properties
    let time = 0;
    let targetX = 0;
    let targetZ = 0;
    let currentX = 0;
    let currentZ = 0;
    let speed = 0.05;
    let waitTime = 0;
    let isRunning = false;
    
    function pickNewTarget() {
        const angle = Math.random() * Math.PI * 2;
        const distance = 5 + Math.random() * 15; // Wander further (5-20 units)
        targetX = Math.cos(angle) * distance;
        targetZ = Math.sin(angle) * distance;
        speed = isRunning ? 0.015 : 0.008; // Slower movement
        waitTime = 50 + Math.random() * 150; // Rest longer (50-200 frames)
        isRunning = Math.random() > 0.7; // Run less often (30% chance)
    }

    function animate() {
        time += 0.016; // Consistent time step

        if (waitTime > 0) {
            waitTime--;
            // Idle animation
            tail.rotation.z = Math.sin(time * 2) * 0.1;
            legs.forEach(leg => {
                leg.rotation.x = 0;
            });
            // Occasionally look around while waiting
            if (waitTime % 50 < 25) {
                headGroup.rotation.y = Math.sin(time) * 0.5;
            }
            return;
        }

        const dx = targetX - currentX;
        const dz = targetZ - currentZ;
        const distance = Math.sqrt(dx * dx + dz * dz);

        if (distance < 0.1) {
            pickNewTarget();
        } else {
            // Move towards target
            currentX += dx * speed;
            currentZ += dz * speed;
            group.position.set(currentX, 0.5, currentZ);

            // Rotate to face direction of movement
            group.rotation.y = Math.atan2(dz, dx);

            const runCycle = time * (isRunning ? 12 : 6); // Slower animation cycles

            // Running/walking animation
            legs.forEach((leg, i) => {
                const isBackLeg = i >= 2;
                const legPhase = isBackLeg ? Math.PI : 0;
                
                // More pronounced up/down movement
                leg.rotation.x = Math.sin(runCycle + i * Math.PI/2) * (isRunning ? 0.4 : 0.2);
                
                // Move legs back and forth
                const baseZ = legPositions[i][1];
                leg.position.z = baseZ + Math.sin(runCycle + legPhase) * (isRunning ? 0.1 : 0.05);
            });

            // Body and head movement
            const bounce = Math.abs(Math.sin(runCycle * 0.5)) * (isRunning ? 0.05 : 0.02);
            body.position.y = bounce;
            headGroup.position.y = 0.1 + bounce;
            
            // Tail animation
            if (isRunning) {
                tail.rotation.z = Math.sin(runCycle) * 0.2 + 0.3;
            } else {
                tail.rotation.z = Math.sin(time * 8) * 0.3;
            }
        }
    }

    pickNewTarget();
    return { group, animate };
} 