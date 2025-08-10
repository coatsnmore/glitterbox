import * as THREE from 'three';

export function createGrass() {
    const group = new THREE.Group();
    
    // Create grass blade geometry
    const bladeGeometry = new THREE.PlaneGeometry(0.1, 0.5);
    const bladeMaterial = new THREE.MeshStandardMaterial({
        color: 0x3a5f0b,
        side: THREE.DoubleSide,
        alphaTest: 0.5
    });

    // Use instanced mesh for better performance
    const instanceCount = 20000; // Number of grass blades
    const grass = new THREE.InstancedMesh(bladeGeometry, bladeMaterial, instanceCount);
    
    // Matrix for position and rotation of each blade
    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const rotation = new THREE.Euler();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    
    // Place grass blades
    for (let i = 0; i < instanceCount; i++) {
        // Random position within a circle
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.sqrt(Math.random()) * 48; // Slightly less than ground radius
        position.set(
            Math.cos(angle) * radius,
            0.25, // Half height of grass
            Math.sin(angle) * radius
        );
        
        // Random rotation around Y axis
        rotation.set(
            0.2 + Math.random() * 0.2, // Slight random tilt
            Math.random() * Math.PI * 2, // Random direction
            0
        );
        quaternion.setFromEuler(rotation);
        
        // Random slight variation in size
        const bladeScale = 0.8 + Math.random() * 0.4;
        scale.set(bladeScale, bladeScale, bladeScale);
        
        // Combine position, rotation, and scale
        matrix.compose(position, quaternion, scale);
        grass.setMatrixAt(i, matrix);
    }
    
    // Add variation in grass color
    const colors = [];
    const color = new THREE.Color();
    for (let i = 0; i < instanceCount; i++) {
        // Random variation of green
        color.setHSL(0.25 + Math.random() * 0.1, 0.6 + Math.random() * 0.2, 0.3 + Math.random() * 0.1);
        grass.setColorAt(i, color);
    }
    
    group.add(grass);
    
    // Animation properties
    let time = 0;
    
    function animate() {
        time += 0.005;
        
        // Animate grass swaying
        for (let i = 0; i < instanceCount; i++) {
            grass.getMatrixAt(i, matrix);
            matrix.decompose(position, quaternion, scale);
            
            // Add subtle swaying motion
            rotation.setFromQuaternion(quaternion);
            rotation.x = 0.2 + Math.sin(time + position.x * 0.5) * 0.1;
            rotation.z = Math.cos(time + position.z * 0.5) * 0.1;
            
            quaternion.setFromEuler(rotation);
            matrix.compose(position, quaternion, scale);
            grass.setMatrixAt(i, matrix);
        }
        
        grass.instanceMatrix.needsUpdate = true;
    }
    
    return { group, animate };
} 