import * as THREE from 'three';

export function createForestDetails() {
    const group = new THREE.Group();
    
    // Materials
    const barkMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x4A2F1B,
        roughness: 1.0 
    });
    
    const leafMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x1a4a1a, // Darker green for ancient trees
        roughness: 0.8 
    });
    
    const grassMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x2d5a27,
        roughness: 0.8 
    });
    
    const deadWoodMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x4A3B2B,
        roughness: 1.0 
    });

    // Create huge ancient trees
    for (let i = 0; i < 3; i++) {
        const radius = 0.8 + Math.random() * 0.4;
        const height = 8 + Math.random() * 4;
        
        const trunkGeometry = new THREE.CylinderGeometry(radius, radius * 1.2, height, 12);
        const trunk = new THREE.Mesh(trunkGeometry, barkMaterial);
        
        // Add root flares
        for (let j = 0; j < 5; j++) {
            const rootGeometry = new THREE.CylinderGeometry(0.3, 0.1, radius * 2, 4);
            const root = new THREE.Mesh(rootGeometry, barkMaterial);
            root.rotation.z = Math.PI / 2;
            root.rotation.y = (j / 5) * Math.PI * 2;
            root.position.y = -height/2 + 0.3;
            root.position.x = Math.cos(root.rotation.y) * radius;
            root.position.z = Math.sin(root.rotation.y) * radius;
            trunk.add(root);
        }

        // Add massive canopy
        const canopyGroup = new THREE.Group();
        const canopyLayers = 4;
        const baseCanopySize = 4 + Math.random() * 2;
        
        // Position canopyGroup at top of trunk
        canopyGroup.position.y = height/2;
        
        // Create multiple layers of foliage
        for (let layer = 0; layer < canopyLayers; layer++) {
            const layerSize = baseCanopySize * (1 - layer * 0.15);
            const layerHeight = layer * 1.5;
            const segments = 6 + layer;
            
            // Create main layer sphere
            const canopyGeometry = new THREE.SphereGeometry(layerSize, segments, segments);
            const canopy = new THREE.Mesh(canopyGeometry, leafMaterial);
            canopy.position.y = layerHeight;  // Position relative to canopyGroup
            canopy.scale.y = 0.6;
            
            // Add random smaller leaf clusters around main layer
            const clusterCount = 4 + layer * 2;
            for (let c = 0; c < clusterCount; c++) {
                const clusterSize = layerSize * (0.3 + Math.random() * 0.3);
                const cluster = new THREE.Mesh(
                    new THREE.SphereGeometry(clusterSize, 4, 4),
                    leafMaterial
                );
                
                const angle = (c / clusterCount) * Math.PI * 2 + Math.random();
                const distance = layerSize * 0.8;
                cluster.position.set(
                    Math.cos(angle) * distance,
                    layerHeight + (Math.random() - 0.5) * 1.5,
                    Math.sin(angle) * distance
                );
                cluster.scale.y = 0.7;
                canopyGroup.add(cluster);
            }
            
            canopyGroup.add(canopy);
        }
        
        // Add hanging vines
        const vineCount = 8 + Math.floor(Math.random() * 6);
        for (let v = 0; v < vineCount; v++) {
            const vineLength = 2 + Math.random() * 3;
            const vineCurve = new THREE.CatmullRomCurve3([
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(
                    (Math.random() - 0.5) * 0.5,
                    -vineLength * 0.5,
                    (Math.random() - 0.5) * 0.5
                ),
                new THREE.Vector3(
                    (Math.random() - 0.5) * 1,
                    -vineLength,
                    (Math.random() - 0.5) * 1
                )
            ]);
            
            const vineGeometry = new THREE.TubeGeometry(vineCurve, 8, 0.05, 8, false);
            const vine = new THREE.Mesh(vineGeometry, leafMaterial);
            
            const angle = Math.random() * Math.PI * 2;
            const distance = baseCanopySize * 0.7;
            vine.position.set(
                Math.cos(angle) * distance,
                0,  // Start from base of canopy
                Math.sin(angle) * distance
            );
            
            canopyGroup.add(vine);
        }

        trunk.add(canopyGroup);

        // Position entire tree (moved these declarations up)
        const angle = (i / 3) * Math.PI * 2 + Math.random();
        const distance = 15 + Math.random() * 5;
        trunk.position.set(
            Math.cos(angle) * distance,
            height/2,
            Math.sin(angle) * distance
        );
        
        group.add(trunk);
    }

    // Add fallen trees
    for (let i = 0; i < 5; i++) {
        const length = 4 + Math.random() * 3;
        const radius = 0.3 + Math.random() * 0.2;
        
        const logGeometry = new THREE.CylinderGeometry(radius, radius, length, 8);
        const log = new THREE.Mesh(logGeometry, deadWoodMaterial);
        
        // Position and rotate randomly
        const angle = Math.random() * Math.PI * 2;
        const distance = 8 + Math.random() * 15;
        log.position.set(
            Math.cos(angle) * distance,
            0.3,
            Math.sin(angle) * distance
        );
        log.rotation.z = Math.PI/2;
        log.rotation.y = Math.random() * Math.PI;
        
        // Add some moss patches
        const mossGeometry = new THREE.PlaneGeometry(0.5, 0.5);
        for (let j = 0; j < 3; j++) {
            const moss = new THREE.Mesh(mossGeometry, grassMaterial);
            moss.position.y = 0.31;
            moss.position.x = (Math.random() - 0.5) * length;
            moss.rotation.x = -Math.PI/2;
            log.add(moss);
        }
        
        group.add(log);
    }

    // Add shrubs and grass patches
    for (let i = 0; i < 100; i++) {
        const size = 0.3 + Math.random() * 0.4;
        const height = 0.2 + Math.random() * 0.4;
        
        // Create random bush/grass shape
        const bushGeometry = new THREE.SphereGeometry(size, 4, 4);
        const bush = new THREE.Mesh(bushGeometry, grassMaterial);
        bush.scale.y = height / size;
        
        // Position randomly but avoid campsite
        let x, z;
        do {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 20;
            x = Math.cos(angle) * distance;
            z = Math.sin(angle) * distance;
        } while (Math.sqrt(x * x + z * z) < 4);
        
        bush.position.set(x, height/2, z);
        bush.rotation.y = Math.random() * Math.PI;
        
        group.add(bush);
    }

    // Add ground detritus (leaves, sticks, etc)
    const detritusGeometry = new THREE.PlaneGeometry(0.2, 0.2);
    for (let i = 0; i < 200; i++) {
        const detritus = new THREE.Mesh(
            detritusGeometry,
            new THREE.MeshStandardMaterial({
                color: Math.random() > 0.5 ? 0x3d2817 : 0x2d2d1b,
                roughness: 1.0
            })
        );
        
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 25;
        detritus.position.set(
            Math.cos(angle) * distance,
            0.01,
            Math.sin(angle) * distance
        );
        detritus.rotation.x = -Math.PI/2;
        detritus.rotation.z = Math.random() * Math.PI;
        
        group.add(detritus);
    }

    return group;
} 