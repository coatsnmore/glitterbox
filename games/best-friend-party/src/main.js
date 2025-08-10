import * as THREE from 'three';
import { cats } from './cats.js';
import { outfits } from './outfits.js';

let currentCatIndex = 0;
let scene, camera, renderer;
let currentCat;
let gameState = 'CHOOSE_OUTFIT'; // or 'CHOOSE_FRIEND'
let dressedCatsCount = 0;
let partyMode = false;
let ufo;
let partyCats = [];
let discoBalls = [];
let fireworks = [];

function init() {
    // Setup scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Sky blue background

    // Setup camera
    camera = new THREE.OrthographicCamera(
        window.innerWidth / -2,
        window.innerWidth / 2,
        window.innerHeight / 2,
        window.innerHeight / -2,
        1,
        1000
    );
    camera.position.z = 500;
    camera.lookAt(0, 0, 0);

    // Position cats at bottom of viewport
    const isMobile = window.innerWidth < 768;
    const catY = isMobile ? -window.innerHeight / 3 : 0;
    scene.position.y = catY;

    // Setup renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Add resize listener after everything is initialized
    window.addEventListener('resize', onWindowResize);

    // Start with first cat
    showCurrentCat();

    // Animation loop
    animate();
}

function showCurrentCat() {
    // Clear previous cat
    while(scene.children.length > 0) {
        scene.remove(scene.children[0]);
    }

    const cat = cats[currentCatIndex];
    currentCat = createCat(cat);
    scene.add(currentCat);

    // Update UI based on game state
    updateCatInfo(cat);
    if (gameState === 'CHOOSE_OUTFIT') {
        createOutfitButtons(cat);
    } else {
        createFriendButtons(cat);
    }
}

function createCat(catData) {
    const group = new THREE.Group();
    
    // Create cat body
    const bodyGeometry = new THREE.CircleGeometry(100, 32);
    const bodyMaterial = new THREE.MeshBasicMaterial({ color: catData.color });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    group.add(body);

    // Add ears using triangles
    const earShape = new THREE.Shape();
    earShape.moveTo(0, 0);      // Base of ear
    earShape.lineTo(-20, -40);  // Left side of ear (pointing up)
    earShape.lineTo(20, -40);   // Right side of ear (pointing up)
    earShape.lineTo(0, 0);      // Back to base

    const earGeometry = new THREE.ShapeGeometry(earShape);
    const earMaterial = new THREE.MeshBasicMaterial({ color: catData.color });
    
    const leftEar = new THREE.Mesh(earGeometry, earMaterial);
    const rightEar = new THREE.Mesh(earGeometry, earMaterial);
    
    // Position ears at the top of the cat
    leftEar.position.set(-50, 80, 0);
    rightEar.position.set(50, 80, 0);
    
    group.add(leftEar);
    group.add(rightEar);

    // Add eyes
    const eyeGeometry = new THREE.CircleGeometry(10, 32);
    const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    
    leftEye.position.set(-30, 20, 1);  // Z=1 to appear above body
    rightEye.position.set(30, 20, 1);
    
    // Add eye highlights
    const highlightGeometry = new THREE.CircleGeometry(4, 32);
    const highlightMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
    
    const leftHighlight = new THREE.Mesh(highlightGeometry, highlightMaterial);
    const rightHighlight = new THREE.Mesh(highlightGeometry, highlightMaterial);
    
    leftHighlight.position.set(-27, 23, 2);  // Z=2 to appear above eyes
    rightHighlight.position.set(33, 23, 2);
    
    // Add nose
    const noseShape = new THREE.Shape();
    noseShape.moveTo(0, 0);
    noseShape.lineTo(-8, -8);
    noseShape.lineTo(8, -8);
    noseShape.lineTo(0, 0);
    
    const noseGeometry = new THREE.ShapeGeometry(noseShape);
    const noseMaterial = new THREE.MeshBasicMaterial({ color: 0xFF9999 });
    const nose = new THREE.Mesh(noseGeometry, noseMaterial);
    nose.position.set(0, 0, 1);
    
    // Add whiskers (lines)
    const whiskerGeometry = new THREE.BufferGeometry();
    const whiskerMaterial = new THREE.LineBasicMaterial({ 
        color: 0xFFFFFF,
        linewidth: 2
    });
    
    // Left whiskers
    const leftWhiskers = new THREE.Group();
    for(let i = 0; i < 3; i++) {
        const whiskerPoints = new Float32Array([
            0, 0, 0,
            -40, (i-1) * 10, 0
        ]);
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(whiskerPoints, 3));
        const whisker = new THREE.Line(geometry, whiskerMaterial);
        leftWhiskers.add(whisker);
    }
    leftWhiskers.position.set(-20, 0, 1);
    
    // Right whiskers
    const rightWhiskers = new THREE.Group();
    for(let i = 0; i < 3; i++) {
        const whiskerPoints = new Float32Array([
            0, 0, 0,
            40, (i-1) * 10, 0
        ]);
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(whiskerPoints, 3));
        const whisker = new THREE.Line(geometry, whiskerMaterial);
        rightWhiskers.add(whisker);
    }
    rightWhiskers.position.set(20, 0, 1);

    // Add all facial features
    group.add(leftEye);
    group.add(rightEye);
    group.add(leftHighlight);
    group.add(rightHighlight);
    group.add(nose);
    group.add(leftWhiskers);
    group.add(rightWhiskers);

    // Add tail
    const tailShape = new THREE.Shape();
    const tailCurve = new THREE.CubicBezierCurve(
        new THREE.Vector2(0, -20),      // Start at bottom of body
        new THREE.Vector2(-50, -80),    // First control point
        new THREE.Vector2(-100, -60),   // Second control point
        new THREE.Vector2(-120, -100)   // End point
    );
    
    const tailPoints = tailCurve.getPoints(50);
    tailShape.setFromPoints(tailPoints);
    
    const tailGeometry = new THREE.ShapeGeometry(tailShape);
    const tailMaterial = new THREE.MeshBasicMaterial({ color: catData.color });
    const tail = new THREE.Mesh(tailGeometry, tailMaterial);
    tail.position.set(0, 0, -1); // Behind the body
    
    group.add(tail);

    // Add inner ears (pink triangles)
    const innerEarShape = new THREE.Shape();
    innerEarShape.moveTo(0, 0);      // Base of ear
    innerEarShape.lineTo(-15, -30);  // Left side of inner ear
    innerEarShape.lineTo(15, -30);   // Right side of inner ear
    innerEarShape.lineTo(0, 0);      // Back to base

    const innerEarGeometry = new THREE.ShapeGeometry(innerEarShape);
    const innerEarMaterial = new THREE.MeshBasicMaterial({ color: 0xFF9999 });
    
    const leftInnerEar = new THREE.Mesh(innerEarGeometry, innerEarMaterial);
    const rightInnerEar = new THREE.Mesh(innerEarGeometry, innerEarMaterial);
    
    leftInnerEar.position.set(-50, 80, 0.5);  // Slightly in front of outer ears
    rightInnerEar.position.set(50, 80, 0.5);
    
    group.add(leftInnerEar);
    group.add(rightInnerEar);

    // Add signature accessory
    if (catData.accessory) {
        const accessory = createAccessory(catData.accessory);
        group.add(accessory);
    }

    return group;
}

function updateCatInfo(cat) {
    const infoDiv = document.getElementById('cat-info');
    infoDiv.innerHTML = `
        <h2>${cat.name}</h2>
        <p>From: ${cat.hometown}</p>
        <p>Likes: ${cat.likes}</p>
        <p>Dislikes: ${cat.dislikes}</p>
        <p>Best Friend: ${cat.bestFriend}</p>
        <p>Enemy: ${cat.enemy}</p>
        ${gameState === 'CHOOSE_FRIEND' ? '<h3>Choose a new best friend for this cat!</h3>' : ''}
    `;
}

function createOutfitButtons(cat) {
    const buttonContainer = document.getElementById('outfit-buttons');
    buttonContainer.innerHTML = '';
    
    // Randomly select 5 outfits instead of 3
    const shuffledOutfits = [...outfits].sort(() => Math.random() - 0.5);
    const selectedOutfits = shuffledOutfits.slice(0, 5);
    
    selectedOutfits.forEach((outfit, index) => {
        const button = document.createElement('button');
        button.className = 'outfit-button';
        button.textContent = outfit.name;
        button.onclick = () => dressUpCat(outfit);
        buttonContainer.appendChild(button);
    });
}

function createFriendButtons(currentCat) {
    const buttonContainer = document.getElementById('outfit-buttons');
    buttonContainer.innerHTML = '';
    
    // Filter out the current cat from the options and select 3 random friends
    const possibleFriends = cats
        .filter((cat, index) => index !== currentCatIndex)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);  // Only take 3 random cats
    
    possibleFriends.forEach((cat, index) => {
        const button = document.createElement('button');
        button.className = 'outfit-button';
        button.textContent = `${cat.name} from ${cat.hometown}`;
        button.onclick = () => selectFriend(cat);
        buttonContainer.appendChild(button);
    });
}

function selectFriend(selectedCat) {
    // Animate transition
    const duration = 1000;
    const startTime = Date.now();
    
    function fadeOut() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        currentCat.position.x = -progress * window.innerWidth;
        
        if (progress < 1) {
            requestAnimationFrame(fadeOut);
        } else {
            // Switch to the selected cat
            currentCatIndex = cats.findIndex(cat => cat.name === selectedCat.name);
            gameState = 'CHOOSE_OUTFIT';
            showCurrentCat();
            
            // Animate new cat entering
            currentCat.position.x = window.innerWidth;
            fadeIn();
        }
    }
    
    function fadeIn() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        currentCat.position.x = window.innerWidth * (1 - progress);
        
        if (progress < 1) {
            requestAnimationFrame(fadeIn);
        }
    }
    
    fadeOut();
}

function dressUpCat(outfit) {
    // Remove any existing outfit
    currentCat.children.forEach(child => {
        if (child.userData.isOutfit) {
            currentCat.remove(child);
        }
    });

    // Add new outfit
    const outfitMesh = createOutfitMesh(outfit);
    outfitMesh.userData.isOutfit = true;
    currentCat.add(outfitMesh);

    // Animate the outfit appearing
    animateOutfitAppearance(outfitMesh);

    // After outfit animation, either continue to friend selection or start party
    setTimeout(() => {
        dressedCatsCount++;
        
        // Create a deep clone of the cat with its outfit
        const clonedCat = currentCat.clone();
        // Preserve materials and opacity for the outfit
        clonedCat.traverse((child) => {
            if (child.userData.isOutfit) {
                const originalChild = currentCat.getObjectById(child.id);
                if (originalChild) {
                    child.material = originalChild.material.clone();
                    child.material.opacity = 1;
                }
            }
        });
        partyCats.push(clonedCat);
        
        if (dressedCatsCount >= 3) {
            startParty();
        } else {
            gameState = 'CHOOSE_FRIEND';
            showCurrentCat();
        }
    }, 1500);
}

function createOutfitMesh(outfit) {
    const group = new THREE.Group();

    switch(outfit.name) {
        case "Royal Ball Gown":
            // Create a fancy dress shape
            const dressShape = new THREE.Shape();
            // Start at the neck
            dressShape.moveTo(0, 50);
            // Draw the poofy dress
            dressShape.bezierCurveTo(-120, 50, -150, -100, 0, -100);
            dressShape.bezierCurveTo(150, -100, 120, 50, 0, 50);
            
            const dressGeometry = new THREE.ShapeGeometry(dressShape);
            const dressMaterial = new THREE.MeshBasicMaterial({ 
                color: outfit.color,
                transparent: true,
                opacity: 0
            });
            const dress = new THREE.Mesh(dressGeometry, dressMaterial);
            group.add(dress);

            // Enhanced crown
            const crownShape = new THREE.Shape();
            // Base of crown
            crownShape.moveTo(-30, 120);
            crownShape.lineTo(30, 120);
            // Points of crown
            crownShape.lineTo(25, 140);
            crownShape.lineTo(15, 130);
            crownShape.lineTo(0, 150);
            crownShape.lineTo(-15, 130);
            crownShape.lineTo(-25, 140);
            crownShape.lineTo(-30, 120);

            const crownGeometry = new THREE.ShapeGeometry(crownShape);
            const crownMaterial = new THREE.MeshBasicMaterial({ 
                color: 0xFFD700,
                transparent: true,
                opacity: 0
            });
            const crown = new THREE.Mesh(crownGeometry, crownMaterial);

            // Add jewels to crown
            const jewelGeometry = new THREE.CircleGeometry(5, 32);
            const jewelMaterials = [
                new THREE.MeshBasicMaterial({ color: 0xFF0000, transparent: true, opacity: 0 }), // Ruby
                new THREE.MeshBasicMaterial({ color: 0x0000FF, transparent: true, opacity: 0 }), // Sapphire
                new THREE.MeshBasicMaterial({ color: 0x00FF00, transparent: true, opacity: 0 })  // Emerald
            ];

            const jewelPositions = [
                [-20, 125], [0, 135], [20, 125]
            ];

            jewelPositions.forEach((pos, idx) => {
                const jewel = new THREE.Mesh(jewelGeometry, jewelMaterials[idx]);
                jewel.position.set(pos[0], pos[1], 1);
                crown.add(jewel);
            });

            group.add(crown);
            break;

        case "Superhero Cape":
            // Create flowing cape shape
            const capeShape = new THREE.Shape();
            capeShape.moveTo(-90, 80);  // Top left of cape
            capeShape.bezierCurveTo(
                -120, 0,     // Control point 1
                -100, -120,  // Control point 2
                0, -120      // Bottom point
            );
            capeShape.bezierCurveTo(
                100, -120,   // Control point 1
                120, 0,      // Control point 2
                90, 80       // Top right of cape
            );
            
            const capeGeometry = new THREE.ShapeGeometry(capeShape);
            const capeMaterial = new THREE.MeshBasicMaterial({ 
                color: outfit.color,
                transparent: true,
                opacity: 0
            });
            const cape = new THREE.Mesh(capeGeometry, capeMaterial);
            
            // Add mask
            const maskGeometry = new THREE.CircleGeometry(30, 32);
            const maskMaterial = new THREE.MeshBasicMaterial({ 
                color: 0x000000,
                transparent: true,
                opacity: 0
            });
            const mask = new THREE.Mesh(maskGeometry, maskMaterial);
            mask.position.set(0, 20, 1);
            
            group.add(cape);
            group.add(mask);
            break;

        case "Business Suit":
            // Create suit jacket shape
            const suitShape = new THREE.Shape();
            suitShape.moveTo(-60, -80);   // Left shoulder
            suitShape.lineTo(-40, 80);    // Left bottom
            suitShape.lineTo(0, 60);      // Center bottom
            suitShape.lineTo(40, 80);     // Right bottom
            suitShape.lineTo(60, -80);    // Right shoulder
            suitShape.bezierCurveTo(30, -90, -30, -90, -60, -80); // Collar

            const suitGeometry = new THREE.ShapeGeometry(suitShape);
            const suitMaterial = new THREE.MeshBasicMaterial({ 
                color: outfit.color,
                transparent: true,
                opacity: 0
            });
            const suit = new THREE.Mesh(suitGeometry, suitMaterial);
            
            // Add tie
            const tieShape = new THREE.Shape();
            tieShape.moveTo(0, -60);     // Top
            tieShape.lineTo(-10, -40);   // Top wide part
            tieShape.lineTo(-5, 0);      // Middle narrow part
            tieShape.lineTo(-15, 40);    // Bottom wide part
            tieShape.lineTo(0, 50);      // Bottom point
            tieShape.lineTo(15, 40);     // Other side
            tieShape.lineTo(5, 0);
            tieShape.lineTo(10, -40);
            tieShape.lineTo(0, -60);

            const tieGeometry = new THREE.ShapeGeometry(tieShape);
            const tieMaterial = new THREE.MeshBasicMaterial({ 
                color: 0xFF0000,
                transparent: true,
                opacity: 0
            });
            const tie = new THREE.Mesh(tieGeometry, tieMaterial);
            
            group.add(suit);
            group.add(tie);
            break;

        case "Space Explorer":
            // Create space suit
            const spaceShape = new THREE.Shape();
            spaceShape.moveTo(-60, 80);
            spaceShape.bezierCurveTo(-70, 40, -80, -60, -60, -80);
            spaceShape.lineTo(60, -80);
            spaceShape.bezierCurveTo(80, -60, 70, 40, 60, 80);
            spaceShape.closePath();

            const spaceGeometry = new THREE.ShapeGeometry(spaceShape);
            const spaceMaterial = new THREE.MeshBasicMaterial({ 
                color: outfit.color,
                transparent: true,
                opacity: 0
            });
            const spaceSuit = new THREE.Mesh(spaceGeometry, spaceMaterial);

            // Add helmet visor
            const visorGeometry = new THREE.CircleGeometry(40, 32);
            const visorMaterial = new THREE.MeshBasicMaterial({
                color: 0x7FF7FF,
                transparent: true,
                opacity: 0
            });
            const visor = new THREE.Mesh(visorGeometry, visorMaterial);
            visor.position.set(0, 20, 1);

            group.add(spaceSuit);
            group.add(visor);
            break;

        case "Disco Fever":
            // Create disco suit
            const discoShape = new THREE.Shape();
            discoShape.moveTo(-50, 80);
            discoShape.lineTo(-70, -80);
            discoShape.lineTo(70, -80);
            discoShape.lineTo(50, 80);
            discoShape.closePath();

            const discoGeometry = new THREE.ShapeGeometry(discoShape);
            const discoMaterial = new THREE.MeshBasicMaterial({ 
                color: outfit.color,
                transparent: true,
                opacity: 0
            });
            const discoSuit = new THREE.Mesh(discoGeometry, discoMaterial);

            // Add disco ball
            const ballGeometry = new THREE.CircleGeometry(20, 32);
            const ballMaterial = new THREE.MeshBasicMaterial({
                color: 0xFFFFFF,
                transparent: true,
                opacity: 0
            });
            const discoBall = new THREE.Mesh(ballGeometry, ballMaterial);
            discoBall.position.set(0, 100, 1);

            group.add(discoSuit);
            group.add(discoBall);
            break;

        case "Pirate Captain":
            // Create pirate coat
            const coatShape = new THREE.Shape();
            coatShape.moveTo(-60, 80);
            coatShape.bezierCurveTo(-80, 40, -90, -60, -70, -80);
            coatShape.lineTo(70, -80);
            coatShape.bezierCurveTo(90, -60, 80, 40, 60, 80);
            coatShape.closePath();

            const coatGeometry = new THREE.ShapeGeometry(coatShape);
            const coatMaterial = new THREE.MeshBasicMaterial({ 
                color: outfit.color,
                transparent: true,
                opacity: 0
            });
            const coat = new THREE.Mesh(coatGeometry, coatMaterial);

            // Add pirate hat
            const hatShape = new THREE.Shape();
            hatShape.moveTo(-40, 120);
            hatShape.lineTo(40, 120);
            hatShape.lineTo(30, 140);
            hatShape.lineTo(-30, 140);
            hatShape.closePath();

            const hatGeometry = new THREE.ShapeGeometry(hatShape);
            const hatMaterial = new THREE.MeshBasicMaterial({
                color: outfit.color,
                transparent: true,
                opacity: 0
            });
            const hat = new THREE.Mesh(hatGeometry, hatMaterial);

            // Add skull and crossbones
            const skullGeometry = new THREE.CircleGeometry(10, 32);
            const skullMaterial = new THREE.MeshBasicMaterial({
                color: 0xFFFFFF,
                transparent: true,
                opacity: 0
            });
            const skull = new THREE.Mesh(skullGeometry, skullMaterial);
            skull.position.set(0, 130, 1);

            group.add(coat);
            group.add(hat);
            group.add(skull);
            break;

        case "Chef's Outfit":
            // Create chef coat
            const chefCoatShape = new THREE.Shape();
            chefCoatShape.moveTo(-60, 80);
            chefCoatShape.lineTo(-70, -80);
            chefCoatShape.lineTo(70, -80);
            chefCoatShape.lineTo(60, 80);
            chefCoatShape.closePath();

            const chefGeometry = new THREE.ShapeGeometry(chefCoatShape);
            const chefMaterial = new THREE.MeshBasicMaterial({ 
                color: outfit.color,
                transparent: true,
                opacity: 0
            });
            const chefCoat = new THREE.Mesh(chefGeometry, chefMaterial);

            // Add chef hat
            const chefHatShape = new THREE.Shape();
            chefHatShape.moveTo(-30, 120);
            chefHatShape.quadraticCurveTo(0, 150, 30, 120);
            const chefHatGeometry = new THREE.ShapeGeometry(chefHatShape);
            const chefHat = new THREE.Mesh(chefHatGeometry, chefMaterial);

            group.add(chefCoat);
            group.add(chefHat);
            break;

        case "Wizard Robe":
            // Create wizard robe
            const robeShape = new THREE.Shape();
            robeShape.moveTo(-40, 80);
            robeShape.bezierCurveTo(-60, 40, -100, -60, -80, -100);
            robeShape.lineTo(80, -100);
            robeShape.bezierCurveTo(100, -60, 60, 40, 40, 80);
            robeShape.closePath();

            const robeGeometry = new THREE.ShapeGeometry(robeShape);
            const robeMaterial = new THREE.MeshBasicMaterial({ 
                color: outfit.color,
                transparent: true,
                opacity: 0
            });
            const robe = new THREE.Mesh(robeGeometry, robeMaterial);

            // Add wizard hat
            const wizardHatShape = new THREE.Shape();
            wizardHatShape.moveTo(-30, 120);
            wizardHatShape.lineTo(0, 200);
            wizardHatShape.lineTo(30, 120);
            wizardHatShape.closePath();
            const wizardHatGeometry = new THREE.ShapeGeometry(wizardHatShape);
            const wizardHat = new THREE.Mesh(wizardHatGeometry, robeMaterial);

            // Add star
            const starGeometry = new THREE.CircleGeometry(5, 5);
            const starMaterial = new THREE.MeshBasicMaterial({
                color: 0xFFFF00,
                transparent: true,
                opacity: 0
            });
            const star = new THREE.Mesh(starGeometry, starMaterial);
            star.position.set(0, 160, 1);

            group.add(robe);
            group.add(wizardHat);
            group.add(star);
            break;

        case "Sports Jersey":
            // Create jersey
            const jerseyShape = new THREE.Shape();
            jerseyShape.moveTo(-50, 80);
            jerseyShape.lineTo(-70, -60);
            jerseyShape.lineTo(-40, -80);
            jerseyShape.lineTo(40, -80);
            jerseyShape.lineTo(70, -60);
            jerseyShape.lineTo(50, 80);
            jerseyShape.closePath();

            const jerseyGeometry = new THREE.ShapeGeometry(jerseyShape);
            const jerseyMaterial = new THREE.MeshBasicMaterial({ 
                color: outfit.color,
                transparent: true,
                opacity: 0
            });
            const jersey = new THREE.Mesh(jerseyGeometry, jerseyMaterial);

            // Add number
            const numberGeometry = new THREE.TextGeometry('1', {
                size: 30,
                height: 1
            });
            const numberMaterial = new THREE.MeshBasicMaterial({
                color: 0xFFFFFF,
                transparent: true,
                opacity: 0
            });
            const number = new THREE.Mesh(numberGeometry, numberMaterial);
            number.position.set(-15, 0, 1);

            group.add(jersey);
            group.add(number);
            break;

        case "Ballerina Tutu":
            // Create tutu
            const tutuShape = new THREE.Shape();
            tutuShape.moveTo(-80, -20);
            tutuShape.quadraticCurveTo(0, -40, 80, -20);
            tutuShape.lineTo(60, 20);
            tutuShape.quadraticCurveTo(0, 40, -60, 20);
            tutuShape.closePath();

            const tutuGeometry = new THREE.ShapeGeometry(tutuShape);
            const tutuMaterial = new THREE.MeshBasicMaterial({ 
                color: outfit.color,
                transparent: true,
                opacity: 0
            });
            const tutu = new THREE.Mesh(tutuGeometry, tutuMaterial);

            // Add bow
            const bowShape = new THREE.Shape();
            bowShape.moveTo(-10, 80);
            bowShape.quadraticCurveTo(-20, 90, -10, 100);
            bowShape.quadraticCurveTo(0, 90, 10, 100);
            bowShape.quadraticCurveTo(20, 90, 10, 80);
            bowShape.quadraticCurveTo(0, 90, -10, 80);
            const bowGeometry = new THREE.ShapeGeometry(bowShape);
            const bow = new THREE.Mesh(bowGeometry, tutuMaterial);

            group.add(tutu);
            group.add(bow);
            break;

        case "Rock Star":
            // Create leather jacket
            const jacketShape = new THREE.Shape();
            jacketShape.moveTo(-60, 80);
            jacketShape.lineTo(-80, -80);
            jacketShape.lineTo(80, -80);
            jacketShape.lineTo(60, 80);
            jacketShape.lineTo(20, 60);
            jacketShape.lineTo(0, 80);
            jacketShape.lineTo(-20, 60);
            jacketShape.closePath();

            const jacketGeometry = new THREE.ShapeGeometry(jacketShape);
            const jacketMaterial = new THREE.MeshBasicMaterial({ 
                color: outfit.color,
                transparent: true,
                opacity: 0
            });
            const jacket = new THREE.Mesh(jacketGeometry, jacketMaterial);

            // Add guitar
            const guitarShape = new THREE.Shape();
            guitarShape.moveTo(0, 0);
            guitarShape.ellipse(0, -40, 20, 30, 0, Math.PI * 2);
            guitarShape.moveTo(0, -10);
            guitarShape.lineTo(0, 80);
            const guitarGeometry = new THREE.ShapeGeometry(guitarShape);
            const guitarMaterial = new THREE.MeshBasicMaterial({
                color: 0xA0522D,
                transparent: true,
                opacity: 0
            });
            const guitar = new THREE.Mesh(guitarGeometry, guitarMaterial);
            guitar.position.set(60, -20, 1);
            guitar.rotation.z = -0.3;

            group.add(jacket);
            group.add(guitar);
            break;

        case "Detective Coat":
            // Create trench coat
            const trenchShape = new THREE.Shape();
            trenchShape.moveTo(-70, 80);
            trenchShape.lineTo(-90, -100);
            trenchShape.lineTo(90, -100);
            trenchShape.lineTo(70, 80);
            trenchShape.bezierCurveTo(40, 90, -40, 90, -70, 80);

            const trenchGeometry = new THREE.ShapeGeometry(trenchShape);
            const trenchMaterial = new THREE.MeshBasicMaterial({ 
                color: outfit.color,
                transparent: true,
                opacity: 0
            });
            const trenchCoat = new THREE.Mesh(trenchGeometry, trenchMaterial);

            // Add magnifying glass
            const handleGeometry = new THREE.PlaneGeometry(5, 40);
            const glassGeometry = new THREE.CircleGeometry(15, 32);
            const glassMaterial = new THREE.MeshBasicMaterial({
                color: 0x808080,
                transparent: true,
                opacity: 0
            });
            const handle = new THREE.Mesh(handleGeometry, glassMaterial);
            const glass = new THREE.Mesh(glassGeometry, glassMaterial);
            
            handle.position.set(60, -20, 1);
            handle.rotation.z = -0.4;
            glass.position.set(70, 0, 1);

            group.add(trenchCoat);
            group.add(handle);
            group.add(glass);
            break;
    }

    // Store all materials for animation
    group.userData.materials = [];
    group.traverse((child) => {
        if (child.material) {
            if (Array.isArray(child.material)) {
                group.userData.materials.push(...child.material);
            } else {
                group.userData.materials.push(child.material);
            }
        }
    });
    group.userData.isOutfit = true;

    return group;
}

function animateOutfitAppearance(outfitMesh) {
    const duration = 1000; // 1 second
    const startTime = Date.now();

    function update() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Animate all parts of the outfit
        outfitMesh.userData.materials.forEach(material => {
            material.opacity = progress;
        });

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    update();
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

// Handle window resizing
function onWindowResize() {
    if (!camera || !renderer || !scene) return;  // Guard clause

    // Update camera
    camera.left = window.innerWidth / -2;
    camera.right = window.innerWidth / 2;
    camera.top = window.innerHeight / 2;
    camera.bottom = window.innerHeight / -2;
    camera.updateProjectionMatrix();
    
    // Update renderer
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Adjust cat position based on screen size
    const isMobile = window.innerWidth < 768;
    const catY = isMobile ? -window.innerHeight / 3 : 0;
    scene.position.y = catY;
    
    // Adjust cat positions in party mode
    if (gameState === "PARTY") {
        partyCats.forEach((cat, index) => {
            const offset = (index - 1) * (window.innerWidth / 4);
            cat.position.x = offset;
            cat.position.y = catY;
        });
    }
}

// Start the game
function startGame() {
    const splashScreen = document.getElementById('splash-screen');
    
    // Show UI container
    document.getElementById('ui-container').style.display = 'block';
    
    // Fade out splash screen
    function fadeOut() {
        if (parseFloat(splashScreen.style.opacity) > 0) {
            splashScreen.style.opacity = parseFloat(splashScreen.style.opacity) - 0.02;
            requestAnimationFrame(fadeOut);
        } else {
            splashScreen.style.display = 'none';
            if (!scene) {
                init(); // Only initialize if it's the first time
            } else {
                showCurrentCat(); // Otherwise just show the first cat
            }
        }
    }
    
    fadeOut();
}

// Add event listener for start button
document.getElementById('start-button').addEventListener('click', startGame);

// Add function to create a disco ball
function createDiscoBall(position) {
    const group = new THREE.Group();
    
    // Disco ball body
    const ballGeometry = new THREE.SphereGeometry(30, 32, 32);
    const ballMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xFFFFFF,
        transparent: true,
        opacity: 0.9
    });
    const ball = new THREE.Mesh(ballGeometry, ballMaterial);
    
    // Add sparkles
    for(let i = 0; i < 20; i++) {
        const sparkleGeometry = new THREE.CircleGeometry(2, 32);
        const sparkleMaterial = new THREE.MeshBasicMaterial({
            color: 0xFFFF00,
            transparent: true,
            opacity: 0.8
        });
        const sparkle = new THREE.Mesh(sparkleGeometry, sparkleMaterial);
        
        // Random position on the ball surface
        const phi = Math.random() * Math.PI * 2;
        const theta = Math.random() * Math.PI;
        sparkle.position.x = 30 * Math.sin(theta) * Math.cos(phi);
        sparkle.position.y = 30 * Math.sin(theta) * Math.sin(phi);
        sparkle.position.z = 30 * Math.cos(theta);
        
        group.add(sparkle);
    }
    
    group.add(ball);
    group.position.copy(position);
    return group;
}

// Update the startParty function
function startParty() {
    partyMode = true;
    gameState = 'PARTY';
    
    // Clear any existing fireworks
    fireworks = [];

    // Hide UI container and show party elements
    document.getElementById('ui-container').style.display = 'none';
    document.getElementById('party-marquee').style.display = 'block';
    document.getElementById('party-names').style.display = 'block';
    
    // Clear scene
    while(scene.children.length > 0) {
        scene.remove(scene.children[0]);
    }
    
    // Create dance floor
    const floorGeometry = new THREE.PlaneGeometry(window.innerWidth, 200);
    const floorMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x000000,
        transparent: true,
        opacity: 0.5 
    });
    const danceFloor = new THREE.Mesh(floorGeometry, floorMaterial);
    danceFloor.position.y = -20;
    scene.add(danceFloor);

    // Add floor lights
    const colors = [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0xFF00FF];
    for(let i = 0; i < 5; i++) {
        const lightGeometry = new THREE.CircleGeometry(15, 32);
        const lightMaterial = new THREE.MeshBasicMaterial({
            color: colors[i],
            transparent: true,
            opacity: 0.6
        });
        const light = new THREE.Mesh(lightGeometry, lightMaterial);
        light.position.set(
            (i - 2) * 100,
            -10,
            1
        );
        scene.add(light);
    }
    
    // Create UFO
    ufo = createUFO();
    ufo.position.y = window.innerHeight;
    scene.add(ufo);
    
    // Position the three dressed cats
    partyCats = partyCats.slice(-3);
    
    // Scale cats for mobile
    const isMobile = window.innerWidth < 768;
    const scale = isMobile ? 0.7 : 1;
    partyCats.forEach(cat => {
        cat.scale.set(scale, scale, scale);
    });
    
    // Display cat names and outfits
    const catInfo = partyCats.map(cat => {
        const catData = cats.find(c => c.color === cat.children[0].material.color.getHex());
        const outfitPiece = cat.children.find(child => child.userData.isOutfit);
        const outfit = outfits.find(o => o.color === outfitPiece?.children[0]?.material?.color?.getHex());
        return `${catData.name} in ${outfit?.name || 'mystery outfit'}`;
    });
    
    document.getElementById('party-names').innerHTML = `
        <div class="cat-names">${catInfo.join(' ⭐ ')}</div>
    `;
    
    // Position cats
    partyCats.forEach((cat, index) => {
        const spacing = isMobile ? window.innerWidth / 4 : 250;
        const xPos = (index - 1) * spacing;
        cat.position.set(xPos, -20, 0);
        scene.add(cat);
    });
    
    // Add disco balls
    const ballHeight = isMobile ? window.innerHeight / 3 : 200;
    const discoBallPositions = [
        new THREE.Vector3(-window.innerWidth/4, ballHeight, 0),
        new THREE.Vector3(0, ballHeight + 50, 0),
        new THREE.Vector3(window.innerWidth/4, ballHeight, 0)
    ];
    
    discoBalls = discoBallPositions.map(position => {
        const discoBall = createDiscoBall(position);
        discoBall.scale.set(scale, scale, scale);
        scene.add(discoBall);
        return discoBall;
    });
    
    // Start party animation
    const startTime = Date.now();
    const partyDuration = 10000;
    
    function partyAnimation() {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / partyDuration;
        
        // Launch new fireworks randomly
        if (Math.random() < 0.03) { // 3% chance each frame
            const x = (Math.random() - 0.5) * window.innerWidth * 0.8;
            const y = window.innerHeight * 0.2;
            fireworks.push(createFirework(x, y));
        }
        
        // Update existing fireworks
        fireworks = fireworks.filter(firework => firework.update());

        // Animate floor lights
        scene.children.forEach((child, index) => {
            if (child.geometry && child.geometry.type === 'CircleGeometry' && child.position.y === -10) {
                child.material.opacity = 0.3 + Math.sin(elapsed * 0.005 + index) * 0.3;
                child.scale.setScalar(1 + Math.sin(elapsed * 0.003 + index) * 0.2);
            }
        });

        // Animate dance floor
        if (danceFloor) {
            danceFloor.material.opacity = 0.3 + Math.sin(elapsed * 0.002) * 0.2;
        }
        
        // UFO descent and hover
        if (progress < 0.2) {
            const targetY = isMobile ? window.innerHeight / 3 : 200;
            ufo.position.y = window.innerHeight - (progress / 0.2) * (window.innerHeight - targetY);
        } else {
            const baseY = isMobile ? window.innerHeight / 3 : 200;
            ufo.position.y = baseY + Math.sin(elapsed * 0.002) * 20;
        }
        
        // Cats dancing
        partyCats.forEach((cat, index) => {
            cat.position.y = -20 + Math.sin(elapsed * 0.003 + index) * 20;
            cat.rotation.z = Math.sin(elapsed * 0.002 + index) * 0.1;
        });
        
        // Rotate UFO lights
        ufo.children.forEach((light, index) => {
            if (light.geometry.type === 'CircleGeometry') {
                light.material.opacity = 0.4 + Math.sin(elapsed * 0.01 + index) * 0.4;
            }
        });
        
        // Animate disco balls
        discoBalls.forEach((ball, index) => {
            // Rotate the disco balls
            ball.rotation.y = elapsed * 0.001;
            ball.rotation.x = elapsed * 0.0005;
            
            // Make them bounce slightly
            ball.position.y += Math.sin(elapsed * 0.002 + index) * 0.5;
            
            // Make the sparkles twinkle
            ball.children.forEach((sparkle, sparkleIndex) => {
                if (sparkle.geometry.type === 'CircleGeometry') {
                    sparkle.material.opacity = 0.4 + Math.sin(elapsed * 0.01 + sparkleIndex) * 0.4;
                }
            });
        });
        
        if (progress < 1) {
            requestAnimationFrame(partyAnimation);
        } else {
            fadeOutAndReset();
        }
    }
    
    partyAnimation();
}

// Update fadeOutAndReset to show the splash screen again after the party
function fadeOutAndReset() {
    const startTime = Date.now();
    const fadeDuration = 2000;
    
    function fadeOut() {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / fadeDuration;
        
        scene.children.forEach(child => {
            child.traverse(object => {
                if (object.material) {
                    object.material.opacity = 1 - progress;
                }
            });
        });
        
        // Also fade out fireworks
        fireworks.forEach(firework => {
            firework.particles.forEach(particle => {
                if (particle.material) {
                    particle.material.opacity = Math.max(0, particle.material.opacity - progress);
                }
            });
        });
        
        if (progress < 1) {
            requestAnimationFrame(fadeOut);
        } else {
            // Clear scene
            while(scene.children.length > 0) {
                scene.remove(scene.children[0]);
            }
            
            // Reset game state
            partyMode = false;
            dressedCatsCount = 0;
            partyCats = [];
            gameState = 'CHOOSE_OUTFIT';
            currentCatIndex = 0;
            discoBalls = [];
            fireworks = [];
            
            // Hide party elements
            document.getElementById('party-marquee').style.display = 'none';
            document.getElementById('party-names').style.display = 'none';
            
            // Show splash screen again
            const splashScreen = document.getElementById('splash-screen');
            splashScreen.style.display = 'flex';
            splashScreen.style.opacity = '0';
            
            // Fade in splash screen
            function fadeInSplash() {
                if (splashScreen.style.opacity < 1) {
                    splashScreen.style.opacity = parseFloat(splashScreen.style.opacity) + 0.02;
                    requestAnimationFrame(fadeInSplash);
                }
            }
            
            fadeInSplash();
        }
    }
    
    fadeOut();
}

function createUFO() {
    const group = new THREE.Group();
    
    // UFO body
    const bodyGeometry = new THREE.SphereGeometry(50, 32, 32, 0, Math.PI);
    const bodyMaterial = new THREE.MeshBasicMaterial({ color: 0xC0C0C0 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.rotation.x = Math.PI;
    
    // UFO dome
    const domeGeometry = new THREE.SphereGeometry(30, 32, 16, 0, Math.PI);
    const domeMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x7FF7FF,
        transparent: true,
        opacity: 0.6
    });
    const dome = new THREE.Mesh(domeGeometry, domeMaterial);
    dome.position.y = 10;
    
    // UFO lights
    for(let i = 0; i < 8; i++) {
        const lightGeometry = new THREE.CircleGeometry(5, 32);
        const lightMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xFFFF00,
            transparent: true,
            opacity: 0.8
        });
        const light = new THREE.Mesh(lightGeometry, lightMaterial);
        const angle = (i / 8) * Math.PI * 2;
        light.position.set(
            Math.cos(angle) * 40,
            -5,
            Math.sin(angle) * 40
        );
        group.add(light);
    }
    
    group.add(body);
    group.add(dome);
    
    return group;
}

// Add this function to create accessories
function createAccessory(accessoryData) {
    const group = new THREE.Group();

    switch(accessoryData.type) {
        case "tiara":
            const tiaraShape = new THREE.Shape();
            tiaraShape.moveTo(-20, 0);
            tiaraShape.lineTo(-15, 15);
            tiaraShape.lineTo(0, 20);
            tiaraShape.lineTo(15, 15);
            tiaraShape.lineTo(20, 0);
            const tiaraGeometry = new THREE.ShapeGeometry(tiaraShape);
            const tiaraMaterial = new THREE.MeshBasicMaterial({ color: accessoryData.color });
            const tiara = new THREE.Mesh(tiaraGeometry, tiaraMaterial);
            tiara.position.set(0, 100, 1);
            group.add(tiara);
            break;

        case "monocle":
            const monocleGeometry = new THREE.CircleGeometry(15, 32);
            const monocleMaterial = new THREE.MeshBasicMaterial({ 
                color: accessoryData.color,
                opacity: 0.5,
                transparent: true
            });
            const monocle = new THREE.Mesh(monocleGeometry, monocleMaterial);
            monocle.position.set(-25, 20, 2);
            group.add(monocle);
            break;

        case "headband":
            const headbandGeometry = new THREE.PlaneGeometry(100, 10);
            const headbandMaterial = new THREE.MeshBasicMaterial({ color: accessoryData.color });
            const headband = new THREE.Mesh(headbandGeometry, headbandMaterial);
            headband.position.set(0, 60, 1);
            group.add(headband);
            break;

        case "sombrero":
            const sombreroShape = new THREE.Shape();
            sombreroShape.moveTo(-60, 0);
            sombreroShape.quadraticCurveTo(0, 20, 60, 0);
            sombreroShape.quadraticCurveTo(0, -10, -60, 0);
            const sombreroGeometry = new THREE.ShapeGeometry(sombreroShape);
            const sombreroMaterial = new THREE.MeshBasicMaterial({ color: accessoryData.color });
            const sombrero = new THREE.Mesh(sombreroGeometry, sombreroMaterial);
            sombrero.position.set(0, 120, 1);
            group.add(sombrero);
            break;

        case "beret":
            const beretShape = new THREE.Shape();
            beretShape.moveTo(-30, 0);
            beretShape.bezierCurveTo(-30, 20, 30, 20, 30, 0);
            beretShape.bezierCurveTo(30, -5, -30, -5, -30, 0);
            const beretGeometry = new THREE.ShapeGeometry(beretShape);
            const beretMaterial = new THREE.MeshBasicMaterial({ color: accessoryData.color });
            const beret = new THREE.Mesh(beretGeometry, beretMaterial);
            beret.position.set(-20, 100, 1);
            beret.rotation.z = -0.2;
            group.add(beret);
            break;

        case "headphones":
            const bandGeometry = new THREE.PlaneGeometry(80, 5);
            const bandMaterial = new THREE.MeshBasicMaterial({ color: accessoryData.color });
            const band = new THREE.Mesh(bandGeometry, bandMaterial);
            band.position.set(0, 90, 1);

            const earGeometry = new THREE.CircleGeometry(15, 32);
            const earMaterial = new THREE.MeshBasicMaterial({ color: accessoryData.color });
            const leftEar = new THREE.Mesh(earGeometry, earMaterial);
            const rightEar = new THREE.Mesh(earGeometry, earMaterial);
            leftEar.position.set(-40, 80, 1);
            rightEar.position.set(40, 80, 1);

            group.add(band);
            group.add(leftEar);
            group.add(rightEar);
            break;
    }

    return group;
}

function createFirework(x, y) {
    const particles = [];
    const colors = [0xFF0000, 0xFFFF00, 0x00FF00, 0x0000FF, 0xFF00FF, 0xFFFFFF];
    const particleCount = 20;
    
    for(let i = 0; i < particleCount; i++) {
        const particle = new THREE.Mesh(
            new THREE.CircleGeometry(2, 8),
            new THREE.MeshBasicMaterial({
                color: colors[Math.floor(Math.random() * colors.length)],
                transparent: true,
                opacity: 1
            })
        );
        
        // Random direction
        const angle = (Math.PI * 2 / particleCount) * i + Math.random() * 0.5;
        const speed = 1 + Math.random() * 2;
        particle.userData.velocity = {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed
        };
        
        particle.position.set(x, y, 0);
        particles.push(particle);
        scene.add(particle);
    }
    
    return {
        particles,
        startTime: Date.now(),
        update: function() {
            const elapsed = (Date.now() - this.startTime) / 1000;
            let alive = false;
            
            this.particles.forEach(particle => {
                if (particle.material.opacity > 0) {
                    alive = true;
                    particle.position.x += particle.userData.velocity.x;
                    particle.position.y += particle.userData.velocity.y;
                    particle.userData.velocity.y -= 0.1; // gravity
                    particle.material.opacity -= 0.01;
                }
            });
            
            return alive;
        }
    };
}
