import * as THREE from 'three';

export function createDeer(sizeScale = 1) {
    const group = new THREE.Group();
    
    // Materials
    const furMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8B5E3C,
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

    // Body (oval shaped)
    const bodyGeometry = new THREE.CapsuleGeometry(0.4 * sizeScale, 1.2 * sizeScale, 8, 8);
    const body = new THREE.Mesh(bodyGeometry, furMaterial);
    body.rotation.z = Math.PI / 2;
    body.scale.y = 0.8;

    // Neck
    const neckGeometry = new THREE.CapsuleGeometry(0.25 * sizeScale, 0.6 * sizeScale, 8, 8);
    const neck = new THREE.Mesh(neckGeometry, furMaterial);
    neck.position.set(0.8 * sizeScale, 0.3 * sizeScale, 0);
    neck.rotation.z = -Math.PI / 4;

    // Head
    const headGeometry = new THREE.CapsuleGeometry(0.2 * sizeScale, 0.5 * sizeScale, 8, 8);
    const head = new THREE.Mesh(headGeometry, furMaterial);
    head.position.set(1.4 * sizeScale, 0.6 * sizeScale, 0);
    head.rotation.z = -Math.PI / 6;

    // Snout
    const snoutGeometry = new THREE.CapsuleGeometry(0.15 * sizeScale, 0.3 * sizeScale, 8, 8);
    const snout = new THREE.Mesh(snoutGeometry, darkFurMaterial);
    snout.position.set(1.7 * sizeScale, 0.5 * sizeScale, 0);
    snout.rotation.z = -Math.PI / 6;

    // Nose
    const noseGeometry = new THREE.SphereGeometry(0.08 * sizeScale, 8, 8);
    const nose = new THREE.Mesh(noseGeometry, noseMaterial);
    nose.position.set(1.9 * sizeScale, 0.45 * sizeScale, 0);

    // Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.05 * sizeScale, 8, 8);
    const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(1.5 * sizeScale, 0.7 * sizeScale, 0.15 * sizeScale);
    rightEye.position.set(1.5 * sizeScale, 0.7 * sizeScale, -0.15 * sizeScale);

    // Ears
    const earGeometry = new THREE.CapsuleGeometry(0.08 * sizeScale, 0.3 * sizeScale, 8, 8);
    const leftEar = new THREE.Mesh(earGeometry, furMaterial);
    const rightEar = new THREE.Mesh(earGeometry, furMaterial);
    leftEar.position.set(1.3 * sizeScale, 0.9 * sizeScale, 0.2 * sizeScale);
    rightEar.position.set(1.3 * sizeScale, 0.9 * sizeScale, -0.2 * sizeScale);
    leftEar.rotation.x = Math.PI / 6;
    rightEar.rotation.x = -Math.PI / 6;

    // Legs
    const legs = [];
    const legPositions = [
        [-0.3, -0.2], [0.3, -0.2],  // Front legs
        [-0.3, 0.2], [0.3, 0.2]     // Back legs
    ];

    legPositions.forEach(pos => {
        const legGroup = new THREE.Group();
        
        // Upper leg
        const upperLegGeometry = new THREE.CapsuleGeometry(0.12 * sizeScale, 0.6 * sizeScale, 8, 8);
        const upperLeg = new THREE.Mesh(upperLegGeometry, furMaterial);
        upperLeg.position.y = -0.3 * sizeScale;
        
        // Lower leg
        const lowerLegGeometry = new THREE.CapsuleGeometry(0.08 * sizeScale, 0.5 * sizeScale, 8, 8);
        const lowerLeg = new THREE.Mesh(lowerLegGeometry, darkFurMaterial);
        lowerLeg.position.y = -0.8 * sizeScale;
        
        // Hoof
        const hoofGeometry = new THREE.CapsuleGeometry(0.1 * sizeScale, 0.15 * sizeScale, 8, 8);
        const hoof = new THREE.Mesh(hoofGeometry, noseMaterial);
        hoof.position.y = -1.1 * sizeScale;
        hoof.scale.x = 0.5;
        
        legGroup.add(upperLeg, lowerLeg, hoof);
        legGroup.position.set(pos[0] * sizeScale, 0, pos[1] * sizeScale);
        legs.push(legGroup);
        group.add(legGroup);
    });

    // Tail
    const tailGeometry = new THREE.CapsuleGeometry(0.08 * sizeScale, 0.2 * sizeScale, 8, 8);
    const tail = new THREE.Mesh(tailGeometry, furMaterial);
    tail.position.set(-0.7 * sizeScale, 0.2 * sizeScale, 0);
    tail.rotation.z = Math.PI / 4;

    group.add(body, neck, head, snout, nose, leftEye, rightEye, leftEar, rightEar, tail);

    // Animation properties
    let time = Math.random() * Math.PI * 2;
    let targetX = Math.random() * 80 - 40;
    let targetZ = Math.random() * 80 - 40;
    let currentX = targetX;
    let currentZ = targetZ;
    let isGrazing = false;
    let grazingTime = 0;

    function animate() {
        time += 0.02;

        if (isGrazing) {
            grazingTime--;
            head.rotation.z = -Math.PI / 6 + Math.sin(time * 2) * 0.1;
            neck.rotation.z = -Math.PI / 4 + Math.sin(time * 2) * 0.05;
            if (grazingTime <= 0) {
                isGrazing = false;
                targetX = Math.random() * 80 - 40;
                targetZ = Math.random() * 80 - 40;
            }
            return;
        }

        const dx = targetX - currentX;
        const dz = targetZ - currentZ;
        const distance = Math.sqrt(dx * dx + dz * dz);

        if (distance < 0.1) {
            isGrazing = true;
            grazingTime = 100 + Math.random() * 200;
        } else {
            currentX += dx * 0.005;
            currentZ += dz * 0.005;
            group.position.set(currentX, 1.2 * sizeScale, currentZ);
            
            // Fix rotation to face direction of movement
            const angle = Math.atan2(dx, dz);
            group.rotation.y = angle - Math.PI / 2; // Changed from + to - to fix backwards movement
            
            // Walking animation
            legs.forEach((leg, i) => {
                const isBack = i >= 2;
                const isLeft = i % 2 === 0;
                const phase = isBack ? (isLeft ? 0 : Math.PI) : (isLeft ? Math.PI : 0);
                
                // Leg swing
                leg.rotation.x = Math.sin(time * 2 + phase) * 0.2;
                
                // Lower leg and hoof adjustments
                const lowerLeg = leg.children[1];
                const hoof = leg.children[2];
                lowerLeg.rotation.x = Math.abs(Math.sin(time * 2 + phase)) * 0.3;
                hoof.rotation.x = -Math.abs(Math.sin(time * 2 + phase)) * 0.2;
            });

            // Body and head movement
            body.position.y = Math.abs(Math.sin(time * 4)) * 0.05;
            head.rotation.z = -Math.PI / 6 + Math.sin(time) * 0.05;
            neck.rotation.z = -Math.PI / 4 + Math.sin(time) * 0.03;
            tail.rotation.z = Math.PI / 4 + Math.cos(time * 2) * 0.1;
        }
    }

    return { group, animate };
} 