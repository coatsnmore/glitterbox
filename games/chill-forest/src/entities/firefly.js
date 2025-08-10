import * as THREE from 'three';

function createGlowTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    
    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(255, 255, 160, 1)');   // Yellow-white center
    gradient.addColorStop(0.2, 'rgba(255, 255, 120, 0.8)'); // Bright yellow
    gradient.addColorStop(0.5, 'rgba(255, 255, 80, 0.3)');  // Fading yellow
    gradient.addColorStop(1, 'rgba(255, 255, 0, 0)');      // Transparent edge
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 32);
    
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    return texture;
}

export function createFireflies(count) {
    const group = new THREE.Group();
    
    // Create firefly material with glow effect
    const fireflyMaterial = new THREE.PointsMaterial({
        size: 0.2,
        map: createGlowTexture(),
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const positions = [];
    const velocities = [];
    const initialPositions = [];
    
    for (let i = 0; i < count; i++) {
        // Create more varied distribution patterns
        let x, y, z;
        
        const pattern = Math.random();
        if (pattern < 0.4) {
            // Cluster around trees and ground
            const radius = 40 * Math.sqrt(Math.random());
            const angle = Math.random() * Math.PI * 2;
            x = Math.cos(angle) * radius;
            y = 0.5 + Math.random() * 3; // Lower height for ground-level clusters
            z = Math.sin(angle) * radius;
        } else if (pattern < 0.7) {
            // Mid-height forest clusters
            const radius = 35 * Math.sqrt(Math.random());
            const angle = Math.random() * Math.PI * 2;
            x = Math.cos(angle) * radius;
            y = 3 + Math.random() * 5; // Medium height
            z = Math.sin(angle) * radius;
        } else {
            // High canopy clusters
            const radius = 30 * Math.sqrt(Math.random());
            const angle = Math.random() * Math.PI * 2;
            x = Math.cos(angle) * radius;
            y = 8 + Math.random() * 4; // Higher up in trees
            z = Math.sin(angle) * radius;
        }
        
        positions.push(x, y, z);
        initialPositions.push(x, y, z);
        
        // Randomize movement
        velocities.push(
            (Math.random() - 0.5) * 0.02,
            (Math.random() - 0.5) * 0.02,
            (Math.random() - 0.5) * 0.02
        );
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    
    const fireflies = new THREE.Points(geometry, fireflyMaterial);
    group.add(fireflies);
    
    // Animation properties
    let time = 0;
    
    function animate() {
        time += 0.016;
        
        const positions = fireflies.geometry.attributes.position.array;
        
        for (let i = 0; i < positions.length; i += 3) {
            // Update positions with gentle swaying motion
            positions[i] = initialPositions[i] + Math.sin(time + i) * 0.3;
            positions[i + 1] = initialPositions[i + 1] + Math.cos(time + i) * 0.2;
            positions[i + 2] = initialPositions[i + 2] + Math.sin(time + i + 2) * 0.3;
            
            // Add slight random movement
            positions[i] += velocities[i];
            positions[i + 1] += velocities[i + 1];
            positions[i + 2] += velocities[i + 2];
            
            // Update velocities with random changes
            velocities[i] += (Math.random() - 0.5) * 0.001;
            velocities[i + 1] += (Math.random() - 0.5) * 0.001;
            velocities[i + 2] += (Math.random() - 0.5) * 0.001;
            
            // Dampen velocities
            velocities[i] *= 0.99;
            velocities[i + 1] *= 0.99;
            velocities[i + 2] *= 0.99;
        }
        
        fireflies.geometry.attributes.position.needsUpdate = true;
        
        // Pulse the opacity for twinkling effect
        fireflyMaterial.opacity = 0.6 + Math.sin(time * 2) * 0.2;
    }
    
    return { group, animate };
}