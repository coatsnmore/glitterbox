import * as THREE from 'three';

// Add these helper functions before the main createNaturalResources function
function createStump() {
    const geometry = new THREE.CylinderGeometry(
        0.4 + Math.random() * 0.3,
        0.5 + Math.random() * 0.3,
        0.8 + Math.random() * 0.4,
        8
    );
    return new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({
        color: 0x4B5320,
        roughness: 1.0
    }));
}

function createFallenLog() {
    const length = 2 + Math.random() * 4;
    const geometry = new THREE.CylinderGeometry(
        0.2 + Math.random() * 0.3,
        0.2 + Math.random() * 0.3,
        length,
        8
    );
    return new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({
        color: 0x4B5320,
        roughness: 1.0
    }));
}

function createSmallRock() {
    const geometry = new THREE.DodecahedronGeometry(0.2 + Math.random() * 0.2);
    return new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({
        color: 0x666666,
        roughness: 0.9
    }));
}

export function createNaturalResources(isInCampsiteArea) {
    const group = new THREE.Group();
    
    // Materials
    const stoneMaterial = new THREE.MeshStandardMaterial({
        color: 0x808080,
        roughness: 0.9,
        metalness: 0.1
    });
    
    const mossyMaterial = new THREE.MeshStandardMaterial({
        color: 0x4B5320,
        roughness: 1.0
    });

    // Create rock formations around perimeter
    for (let i = 0; i < 40; i++) {
        const rockGroup = new THREE.Group();
        
        // Create a cluster of rocks
        const rockCount = 2 + Math.floor(Math.random() * 4);
        for (let j = 0; j < rockCount; j++) {
            const size = 0.5 + Math.random() * 1.5;
            const geometry = new THREE.DodecahedronGeometry(size, 1);
            
            // Distort the geometry for more natural look
            const positions = geometry.attributes.position;
            for (let k = 0; k < positions.count; k++) {
                const x = positions.getX(k);
                const y = positions.getY(k);
                const z = positions.getZ(k);
                
                positions.setXYZ(
                    k,
                    x + (Math.random() - 0.5) * 0.2,
                    y + (Math.random() - 0.5) * 0.2,
                    z + (Math.random() - 0.5) * 0.2
                );
            }
            
            // Randomly choose between regular stone and mossy stone
            const material = Math.random() > 0.7 ? mossyMaterial : stoneMaterial;
            const rock = new THREE.Mesh(geometry, material);
            
            // Position within cluster
            rock.position.set(
                (Math.random() - 0.5) * 2,
                size * 0.5,
                (Math.random() - 0.5) * 2
            );
            rock.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            
            rockGroup.add(rock);
        }
        
        // Position the rock cluster along perimeter, avoiding campsite
        const angle = (i / 40) * Math.PI * 2 + (Math.random() - 0.5) * 0.2;
        const radius = 43 + Math.random() * 7;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        // Only add if not in campsite area
        if (!isInCampsiteArea(x, z)) {
            rockGroup.position.set(x, 0, z);
            group.add(rockGroup);
        }
    }

    // Add fallen logs and stumps
    for (let i = 0; i < 40; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 45;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        // Only add if not in campsite area
        if (!isInCampsiteArea(x, z)) {
            if (Math.random() > 0.7) {
                const stump = createStump();
                stump.position.set(x, 0.4, z);
                stump.rotation.y = Math.random() * Math.PI;
                group.add(stump);
            } else {
                const log = createFallenLog();
                log.position.set(x, 0.3, z);
                log.rotation.set(
                    Math.random() * 0.3,
                    Math.random() * Math.PI,
                    Math.random() * 0.3
                );
                group.add(log);
            }
        }
    }

    // Add scattered rocks
    for (let i = 0; i < 60; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 45;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        // Only add if not in campsite area
        if (!isInCampsiteArea(x, z)) {
            const rock = createSmallRock();
            rock.position.set(x, 0.1, z);
            group.add(rock);
        }
    }

    return group;
} 