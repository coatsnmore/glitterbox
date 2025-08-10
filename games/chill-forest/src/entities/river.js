import * as THREE from 'three';

export function createRiver() {
    const group = new THREE.Group();
    
    // Create river path using curves
    const mainRiverCurve = new THREE.CubicBezierCurve3(
        new THREE.Vector3(-45, 0.05, -20),
        new THREE.Vector3(-15, 0.05, 0),
        new THREE.Vector3(10, 0.05, -10),
        new THREE.Vector3(45, 0.05, -5)
    );

    const fork1Curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(10, 0.05, -10),
        new THREE.Vector3(15, 0.05, -25),
        new THREE.Vector3(30, 0.05, -40)
    );

    const fork2Curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-15, 0.05, 0),
        new THREE.Vector3(-20, 0.05, 20),
        new THREE.Vector3(-35, 0.05, 30)
    );

    // Create river geometry
    const riverGeometry = new THREE.BufferGeometry();
    const points = [];
    const width = 2; // Reduced width

    // Generate points for main river and forks
    [mainRiverCurve, fork1Curve, fork2Curve].forEach(curve => {
        const curvePoints = curve.getPoints(50);
        for (let i = 0; i < curvePoints.length - 1; i++) {
            const current = curvePoints[i];
            const next = curvePoints[i + 1];
            const direction = next.clone().sub(current).normalize();
            const perpendicular = new THREE.Vector3(-direction.z, 0, direction.x);

            // Add slight randomness to width for more natural look
            const currentWidth = width * (0.8 + Math.random() * 0.4);

            points.push(
                current.clone().add(perpendicular.multiplyScalar(currentWidth)),
                current.clone().add(perpendicular.multiplyScalar(-currentWidth)),
                next.clone().add(perpendicular.multiplyScalar(-currentWidth)),
                
                current.clone().add(perpendicular.multiplyScalar(currentWidth)),
                next.clone().add(perpendicular.multiplyScalar(-currentWidth)),
                next.clone().add(perpendicular.multiplyScalar(currentWidth))
            );
        }
    });

    riverGeometry.setFromPoints(points);
    riverGeometry.computeVertexNormals();

    // Create river material with water effect
    const riverMaterial = new THREE.MeshStandardMaterial({
        color: 0x2080ff,
        metalness: 0.6,
        roughness: 0.2,
        transparent: true,
        opacity: 0.7
    });

    const river = new THREE.Mesh(riverGeometry, riverMaterial);
    
    // Add riverbed
    const riverbedGeometry = riverGeometry.clone();
    const riverbedMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a1810,
        roughness: 1.0
    });
    const riverbed = new THREE.Mesh(riverbedGeometry, riverbedMaterial);
    riverbed.position.y = 0.02;

    group.add(riverbed, river);

    return group;
} 