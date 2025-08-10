import * as THREE from 'three';

export function createStars() {
    const group = new THREE.Group();
    const starCount = 1000;
    const radius = 800; // Distance from center
    
    // Star material with glow effect
    const starMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xffffff,
        emissiveIntensity: 1,
    });

    // Glow material
    const glowMaterial = new THREE.SpriteMaterial({
        map: createGlowTexture(),
        color: 0xffffee,
        transparent: true,
        blending: THREE.AdditiveBlending
    });

    for (let i = 0; i < starCount; i++) {
        // Create star core
        const size = 0.5 + Math.random() * 1;
        const starGeometry = new THREE.SphereGeometry(size, 4, 4);
        const star = new THREE.Mesh(starGeometry, starMaterial);

        // Random position on sphere
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        
        star.position.x = radius * Math.sin(phi) * Math.cos(theta);
        star.position.y = radius * Math.sin(phi) * Math.sin(theta);
        star.position.z = radius * Math.cos(phi);

        // Add glow sprite
        const glowSize = size * 15;
        const sprite = new THREE.Sprite(glowMaterial);
        sprite.scale.set(glowSize, glowSize, 1);
        sprite.userData.baseScale = glowSize;
        star.add(sprite);

        // Random color variations
        const colorChoice = Math.random();
        if (colorChoice > 0.95) {
            star.material = starMaterial.clone();
            star.material.emissive.setHex(0xccccff); // Bluish
            sprite.material = glowMaterial.clone();
            sprite.material.color.setHex(0xccccff);
        } else if (colorChoice > 0.90) {
            star.material = starMaterial.clone();
            star.material.emissive.setHex(0xffffcc); // Yellowish
            sprite.material = glowMaterial.clone();
            sprite.material.color.setHex(0xffffcc);
        }

        group.add(star);
    }

    // Create animation function
    function animate() {
        const time = Date.now() * 0.005;
        group.children.forEach((star, index) => {
            const sprite = star.children[0];
            // Use index to offset the pulse for each star
            const scale = 1 + Math.sin(time + index * 0.1) * 0.2;
            sprite.scale.setScalar(scale * sprite.userData.baseScale);
        });
    }

    return { group, animate };
}

function createGlowTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    
    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.1, 'rgba(255, 255, 255, 0.6)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 32);
    
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    return texture;
} 