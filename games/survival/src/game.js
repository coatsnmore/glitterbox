import * as THREE from 'three';

export class Game {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer();
        
        this.trees = [];
        this.grassCount = 100000; // Increased from 10000 to better cover larger area
        this.moveSpeed = 0.1;
        this.keys = {};
        
        // Add new properties for mouse control and jumping
        this.mouseSensitivity = 0.002;
        this.verticalVelocity = 0;
        this.isJumping = false;
        this.jumpForce = 0.15;
        this.gravity = 0.006;
        
        // Add direction vector for movement
        this.moveDirection = new THREE.Vector3();
        // Add euler for rotation tracking
        this.rotation = new THREE.Euler(0, 0, 0, 'YXZ');
        
        // Add sky properties
        this.time = 0;
        this.timeSpeed = 0.0001;
        
        // Add movement speed properties
        this.walkSpeed = 0.1;
        this.sprintSpeed = 0.2;
        this.moveSpeed = this.walkSpeed;
        this.isRunning = false;
        
        this.foxes = [];
        this.foxCount = 10;
        this.companionOrb = null;
        
        // Add bears array initialization
        this.bears = [];
        this.bearCount = 5;
        
        this.maxHealth = 100;
        this.currentHealth = this.maxHealth;
        this.isHurt = false;
        this.hurtCooldown = 0;
        this.damageShakeIntensity = 0;
        this.isDead = false;
        
        // Add bullet properties
        this.bullets = [];
        this.bulletSpeed = 2.0;
        this.lastShotTime = 0;
        this.shootCooldown = 0.5; // Time between shots in seconds
        
        // Add health pack properties
        this.healthPacks = [];
        this.healthPackCount = 10;
        this.healthPackValue = 30; // Amount of health restored
        this.healthPackRespawnTime = 30; // Seconds until a new health pack spawns
        this.lastHealthPackSpawn = 0;
        
        // Add gun properties
        this.gun = null;
        this.gunOffset = new THREE.Vector3(0.3, -0.3, -0.5); // Position relative to camera
        this.gunRecoil = 0;
        
        // Add ADS (aim down sights) properties
        this.isAiming = false;
        this.defaultFOV = 75;
        this.aimFOV = 45;
        this.currentFOV = this.defaultFOV;
        this.aimTransitionSpeed = 0.1;
        
        // Adjust gun offset properties
        this.defaultGunOffset = new THREE.Vector3(0.3, -0.3, -0.5);
        this.aimGunOffset = new THREE.Vector3(0, -0.2, -0.3);
        this.gunOffset = this.defaultGunOffset.clone();
        
        // Add health regeneration properties
        this.healthRegenRate = 5; // Health points per second
        this.healthRegenDelay = 5; // Seconds to wait after damage before regen starts
        this.lastDamageTime = 0;
        
        // Add bear respawn properties
        this.bearRespawnTime = 5; // Seconds until a bear respawns
        this.deadBears = []; // Track dead bears for respawning
        
        // Add ammo properties
        this.maxAmmo = 10;
        this.currentAmmo = this.maxAmmo;
        this.isReloading = false;
        this.reloadTime = 2.0; // Seconds to reload
        
        // Add reload animation properties
        this.reloadAnimation = {
            active: false,
            startTime: 0,
            rotationX: 0
        };
        
        // Add stamina properties
        this.maxStamina = 100;
        this.currentStamina = this.maxStamina;
        this.staminaRegenRate = 25; // Points per second
        this.staminaDrainRate = 30; // Points per second while sprinting
        this.staminaRegenDelay = 1; // Seconds before stamina starts regenerating
        this.lastStaminaUse = 0;
        
        // Add hunger properties
        this.maxHunger = 100;
        this.currentHunger = this.maxHunger;
        this.hungerDrainRate = 2; // Points per second
        this.hungerDamageRate = 5; // Damage when starving
        this.lastHungerDamage = 0;
        this.hungerDamageInterval = 2; // Seconds between damage when starving
        
        this.createHealthBar();
        this.createAmmoBar();
        this.createStaminaBar();
        this.createHungerBar();
        this.createDamageOverlay();
        this.createRespawnScreen();
        
        this.init();
    }

    init() {
        // Update renderer settings
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x88ccff);
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 0.5;
        document.body.appendChild(this.renderer.domElement);
        
        // Add this right after creating the scene
        this.createSky();
        
        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(0, 10, 0);
        this.scene.add(directionalLight);

        // Create ground with larger size
        const groundGeometry = new THREE.PlaneGeometry(1000, 1000, 50, 50);
        const groundMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x355828,
            side: THREE.DoubleSide,
            roughness: 0.8,
            metalness: 0.1
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = Math.PI / 2;
        this.scene.add(ground);

        // Adjust camera far plane to see further
        this.camera.far = 2000;
        this.camera.updateProjectionMatrix();

        // Adjust fog for larger scene
        this.scene.fog = new THREE.FogExp2(0x88ccff, 0.0015);

        // Add grass after creating the ground
        this.addGrass();

        // Generate trees
        this.generateTrees(50);

        // Add foxes after creating ground and trees
        this.createFoxes();

        // Add bears after creating ground
        this.createBears();

        // Set initial camera position and rotation
        this.camera.position.set(0, 2, 5);
        this.camera.rotation.order = 'YXZ'; // Important for proper rotation order

        // Setup event listeners
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            if (e.key === ' ' && !this.isJumping) {
                this.verticalVelocity = this.jumpForce;
                this.isJumping = true;
            }
        });
        window.addEventListener('keyup', (e) => this.keys[e.key] = false);
        window.addEventListener('resize', () => this.handleResize());

        // Add mouse controls
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.addEventListener('click', () => {
            document.body.requestPointerLock();
        });

        // Add a method to reset keys when focus is lost
        window.addEventListener('blur', () => this.resetKeys());
        // Add pointer lock change handler
        document.addEventListener('pointerlockchange', () => {
            if (!document.pointerLockElement) {
                this.resetKeys();
            }
        });

        // Update fog settings
        this.scene.fog = new THREE.FogExp2(0x88ccff, 0.008);
        this.scene.background = new THREE.Color(0x88ccff);

        // Add mouse click listener for shooting
        document.addEventListener('mousedown', (e) => {
            if (e.button === 0 && document.pointerLockElement) { // Left click only
                this.shoot();
            }
        });

        // Add right-click listener for aiming
        document.addEventListener('mousedown', (e) => {
            if (e.button === 2 && document.pointerLockElement) { // Right click
                this.isAiming = true;
            }
        });

        document.addEventListener('mouseup', (e) => {
            if (e.button === 2) { // Right click release
                this.isAiming = false;
            }
        });

        // Prevent context menu from appearing on right click
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        // Spawn initial health packs
        this.spawnHealthPacks();

        // Create gun after camera setup
        this.createGun();

        // Update reload key listener to work anytime
        document.addEventListener('keydown', (e) => {
            if (e.key === 'r' || e.key === 'R') {
                if (!this.isReloading && this.currentAmmo < this.maxAmmo) {
                    this.reload();
                }
            }
        });

        // Start animation loop
        this.animate();
    }

    generateTrees(count) {
        const treeGeometry = new THREE.CylinderGeometry(0, 1, 4, 6);
        const treeMaterial = new THREE.MeshStandardMaterial({ color: 0x2d5a27 });
        const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.2, 2, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x4a2f1b });

        for (let i = 0; i < count; i++) {
            const tree = new THREE.Group();

            // Create trunk
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            trunk.position.y = 1;
            tree.add(trunk);

            // Create leaves
            const leaves = new THREE.Mesh(treeGeometry, treeMaterial);
            leaves.position.y = 3;
            tree.add(leaves);

            // Spread trees over larger area
            tree.position.x = (Math.random() - 0.5) * 800;
            tree.position.z = (Math.random() - 0.5) * 800;

            this.trees.push(tree);
            this.scene.add(tree);
        }
    }

    addGrass() {
        // Create a single grass blade geometry
        const grassGeometry = new THREE.PlaneGeometry(0.1, 0.3);
        const grassMaterial = new THREE.MeshStandardMaterial({
            color: 0x3b8a3b,
            side: THREE.DoubleSide,
            alphaTest: 0.5
        });

        // Create instanced mesh for grass
        const instancedGrass = new THREE.InstancedMesh(
            grassGeometry,
            grassMaterial,
            this.grassCount
        );

        // Create temporary objects for matrix calculations
        const matrix = new THREE.Matrix4();
        const position = new THREE.Vector3();
        const rotation = new THREE.Euler();
        const quaternion = new THREE.Quaternion();
        const scale = new THREE.Vector3(1, 1, 1);

        // Place grass blades randomly
        for (let i = 0; i < this.grassCount; i++) {
            // Random position within full ground bounds
            position.x = (Math.random() - 0.5) * 950; // Slightly smaller than ground size
            position.z = (Math.random() - 0.5) * 950;
            position.y = 0.15; // Half height of grass blade

            // Random rotation around Y axis
            rotation.y = Math.random() * Math.PI;
            // Slight random tilt
            rotation.x = (Math.random() - 0.5) * 0.2;
            rotation.z = (Math.random() - 0.5) * 0.2;
            quaternion.setFromEuler(rotation);

            // Random slight scale variation
            const scaleVar = 0.8 + Math.random() * 0.4;
            scale.set(scaleVar, scaleVar, scaleVar);

            // Combine position, rotation, and scale into matrix
            matrix.compose(position, quaternion, scale);
            instancedGrass.setMatrixAt(i, matrix);
        }

        // Add grass to scene
        this.scene.add(instancedGrass);

        // Optional: Add a second layer of grass with different properties
        const tallGrassCount = 20000; // Increased from 2000
        const tallGrassGeometry = new THREE.PlaneGeometry(0.15, 0.5);
        const tallGrassMaterial = new THREE.MeshStandardMaterial({
            color: 0x2d7a2d,
            side: THREE.DoubleSide,
            alphaTest: 0.5
        });

        const tallGrass = new THREE.InstancedMesh(
            tallGrassGeometry,
            tallGrassMaterial,
            tallGrassCount
        );

        for (let i = 0; i < tallGrassCount; i++) {
            position.x = (Math.random() - 0.5) * 950;
            position.z = (Math.random() - 0.5) * 950;
            position.y = 0.25;

            rotation.y = Math.random() * Math.PI;
            rotation.x = (Math.random() - 0.5) * 0.3;
            rotation.z = (Math.random() - 0.5) * 0.3;
            quaternion.setFromEuler(rotation);

            const scaleVar = 0.9 + Math.random() * 0.3;
            scale.set(scaleVar, scaleVar, scaleVar);

            matrix.compose(position, quaternion, scale);
            tallGrass.setMatrixAt(i, matrix);
        }

        this.scene.add(tallGrass);
    }

    handleResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    handleMouseMove(event) {
        if (document.pointerLockElement === document.body) {
            // Update rotation euler instead of directly modifying camera
            this.rotation.y -= event.movementX * this.mouseSensitivity;
            this.rotation.x -= event.movementY * this.mouseSensitivity;
            
            // Limit vertical look angle
            this.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.rotation.x));
            
            // Apply rotation to camera
            this.camera.rotation.copy(this.rotation);
        }
    }

    resetKeys() {
        // Reset all movement keys and sprint state
        this.keys = {};
        this.moveDirection.set(0, 0, 0);
        this.isRunning = false;
        this.moveSpeed = this.walkSpeed;
    }

    handleMovement() {
        // Reset movement direction
        this.moveDirection.set(0, 0, 0);
        
        // Only process movement if pointer is locked
        if (!document.pointerLockElement) {
            return;
        }

        // Handle sprint with stamina check
        this.isRunning = this.keys['Shift'] && this.currentStamina > 0;
        this.moveSpeed = this.isRunning ? this.sprintSpeed : this.walkSpeed;
        
        // Calculate forward and right vectors
        const forward = new THREE.Vector3(0, 0, -1);
        const right = new THREE.Vector3(1, 0, 0);
        
        // Rotate vectors based on camera rotation
        forward.applyEuler(this.rotation);
        right.applyEuler(this.rotation);
        
        // Add movement based on key presses
        if (this.keys['w']) {
            this.moveDirection.add(forward);
        }
        if (this.keys['s']) {
            this.moveDirection.sub(forward);
        }
        if (this.keys['a']) {
            this.moveDirection.sub(right);
        }
        if (this.keys['d']) {
            this.moveDirection.add(right);
        }

        // Normalize movement vector for consistent speed in all directions
        if (this.moveDirection.length() > 0) {
            this.moveDirection.normalize();
        }

        // Apply movement
        this.camera.position.x += this.moveDirection.x * this.moveSpeed;
        this.camera.position.z += this.moveDirection.z * this.moveSpeed;

        // Handle jumping and gravity
        this.camera.position.y += this.verticalVelocity;
        this.verticalVelocity -= this.gravity;

        // Ground collision
        if (this.camera.position.y <= 2) {
            this.camera.position.y = 2;
            this.verticalVelocity = 0;
            this.isJumping = false;
        }

        // Handle stamina drain/regen
        const time = performance.now() * 0.001;
        if (this.isRunning && this.moveDirection.length() > 0) {
            // Drain stamina while sprinting
            this.currentStamina = Math.max(0, this.currentStamina - this.staminaDrainRate * this.deltaTime);
            this.lastStaminaUse = time;
        } else if (time - this.lastStaminaUse > this.staminaRegenDelay) {
            // Regenerate stamina when not sprinting
            this.currentStamina = Math.min(this.maxStamina, this.currentStamina + this.staminaRegenRate * this.deltaTime);
        }
        
        // Update stamina bar
        this.staminaBar.style.width = `${(this.currentStamina / this.maxStamina) * 100}%`;
    }

    createSky() {
        const skyVertexShader = `
            varying vec2 vUV;
            varying vec3 vWorldPosition;
            
            void main() {
                vUV = uv;
                vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                vWorldPosition = worldPosition.xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;

        const skyFragmentShader = `
            varying vec2 vUV;
            varying vec3 vWorldPosition;
            uniform float time;

            // Improved noise function for better cloud shapes
            float rand(vec2 n) { 
                return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
            }

            float noise(vec2 p) {
                vec2 ip = floor(p);
                vec2 u = fract(p);
                u = u*u*(3.0-2.0*u);

                float res = mix(
                    mix(rand(ip), rand(ip+vec2(1.0,0.0)), u.x),
                    mix(rand(ip+vec2(0.0,1.0)), rand(ip+vec2(1.0,1.0)), u.x), u.y);
                return res;
            }

            float fbm(vec2 p) {
                float sum = 0.0;
                float amp = 1.0;
                float freq = 1.0;
                // More octaves for more detailed clouds
                for(int i = 0; i < 6; i++) {
                    sum += noise(p * freq) * amp;
                    amp *= 0.5;
                    freq *= 2.0;
                    p += vec2(3.123, 1.121);
                }
                return sum;
            }

            void main() {
                vec3 normalizedPosition = normalize(vWorldPosition);
                
                // Adjusted height factor for lower horizon
                float heightFactor = normalizedPosition.y * 0.5 + 0.5;
                
                // Enhanced sky gradient
                vec3 skyColor = mix(
                    vec3(0.5, 0.7, 1.0),  // Horizon color (brighter)
                    vec3(0.2, 0.4, 0.8),   // Zenith color
                    pow(heightFactor, 0.7)  // Smoother gradient
                );

                // Improved cloud mapping
                vec2 cloudUV = vec2(
                    atan(normalizedPosition.x, normalizedPosition.z) / (2.0 * 3.14159) + 0.5,
                    heightFactor
                );
                
                // Multiple cloud layers with different speeds
                float cloudScale = 3.0;
                vec2 cloudPos1 = cloudUV * cloudScale + time * vec2(0.01, 0.002);
                vec2 cloudPos2 = cloudUV * cloudScale * 1.5 + time * vec2(0.015, -0.003);
                
                // Generate more detailed clouds using FBM
                float clouds1 = fbm(cloudPos1);
                float clouds2 = fbm(cloudPos2);
                
                // Combine cloud layers
                float clouds = mix(clouds1, clouds2, 0.5);
                
                // Enhanced cloud shaping
                clouds = smoothstep(0.4, 0.9, clouds);
                
                // Height-based cloud masking
                float cloudMask = smoothstep(0.0, 0.3, heightFactor) * 
                                smoothstep(1.0, 0.4, heightFactor);
                clouds *= cloudMask;
                
                // Improved cloud coloring and shading
                vec3 cloudColor = mix(
                    vec3(0.8, 0.8, 0.8),  // Cloud shadow
                    vec3(1.0, 1.0, 1.0),   // Cloud highlight
                    clouds
                );
                
                // Blend clouds with sky
                vec3 finalColor = mix(skyColor, cloudColor, clouds * 0.7);

                // Enhanced atmospheric scattering
                finalColor = mix(
                    finalColor,
                    vec3(0.7, 0.8, 1.0),
                    pow(1.0 - heightFactor, 5.0) * 0.6
                );

                gl_FragColor = vec4(finalColor, 1.0);
            }
        `;

        // Create larger sky dome that extends below horizon
        const skyGeometry = new THREE.SphereGeometry(1000, 60, 40);
        const skyMaterial = new THREE.ShaderMaterial({
            vertexShader: skyVertexShader,
            fragmentShader: skyFragmentShader,
            uniforms: {
                time: { value: 0 }
            },
            side: THREE.BackSide
        });

        const sky = new THREE.Mesh(skyGeometry, skyMaterial);
        this.sky = sky;
        this.scene.add(sky);
    }

    createFoxes() {
        // Create regular foxes first
        const foxBody = new THREE.Group();
        
        // Body (main body)
        const bodyGeometry = new THREE.CapsuleGeometry(0.2, 0.4, 4, 8);
        const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xd67d3e });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        // Change initial body rotation to face forward Z axis
        body.rotation.z = Math.PI / 2;
        body.rotation.y = Math.PI / 2;
        foxBody.add(body);

        // Head
        const headGeometry = new THREE.SphereGeometry(0.15, 8, 8);
        const headMaterial = new THREE.MeshStandardMaterial({ color: 0xd67d3e });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        // Adjust head position to match new orientation
        head.position.z = 0.3;
        head.position.y = 0.1;
        foxBody.add(head);

        // Ears
        const earGeometry = new THREE.ConeGeometry(0.05, 0.1, 4);
        const earMaterial = new THREE.MeshStandardMaterial({ color: 0xd67d3e });
        
        const earLeft = new THREE.Mesh(earGeometry, earMaterial);
        // Adjust ear positions to match new orientation
        earLeft.position.z = 0.35;
        earLeft.position.y = 0.25;
        earLeft.position.x = 0.05;
        foxBody.add(earLeft);

        const earRight = earLeft.clone();
        earRight.position.x = -0.05;
        foxBody.add(earRight);

        // Tail
        const tailGeometry = new THREE.CylinderGeometry(0.05, 0.02, 0.4, 8);
        const tailMaterial = new THREE.MeshStandardMaterial({ color: 0xd67d3e });
        const tail = new THREE.Mesh(tailGeometry, tailMaterial);
        // Adjust tail position to match new orientation
        tail.position.z = -0.3;
        tail.position.y = 0.1;
        tail.rotation.x = Math.PI / 4;
        foxBody.add(tail);

        // Create companion orb with updated properties
        const orbGeometry = new THREE.SphereGeometry(0.15, 32, 32); // Made slightly smaller
        
        // Update shader for more ethereal look
        const orbVertexShader = `
            varying vec3 vNormal;
            varying vec3 vWorldPosition;
            
            void main() {
                vNormal = normalize(normalMatrix * normal);
                vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                vWorldPosition = worldPosition.xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;

        const orbFragmentShader = `
            varying vec3 vNormal;
            varying vec3 vWorldPosition;
            uniform float time;
            
            void main() {
                // Ethereal color with more pronounced animation
                vec3 baseColor = vec3(0.4, 0.7, 1.0);
                float pulseIntensity = 0.15 * sin(time * 1.5) + 0.85;
                
                // Enhanced fresnel effect
                vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
                float fresnel = pow(1.0 - dot(viewDirection, vNormal), 3.0);
                
                // Combine effects with more glow
                vec3 finalColor = baseColor * pulseIntensity;
                finalColor += vec3(0.4, 0.7, 1.0) * fresnel * 1.5;
                
                gl_FragColor = vec4(finalColor, 0.7 + fresnel * 0.3);
            }
        `;

        const orbMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                cameraPosition: { value: this.camera.position }
            },
            vertexShader: orbVertexShader,
            fragmentShader: orbFragmentShader,
            transparent: true,
            side: THREE.DoubleSide
        });

        this.companionOrb = new THREE.Mesh(orbGeometry, orbMaterial);
        this.companionOrb.position.set(2, 1.5, 2); // Float higher than the fox

        // Brighter point light
        const orbLight = new THREE.PointLight(0x4080ff, 1, 8);
        orbLight.intensity = 0.8;
        this.companionOrb.add(orbLight);

        this.companionOrb.userData = {
            hovering: 0,
            baseHeight: 2.0,
            wanderAngleX: Math.random() * Math.PI * 2,
            wanderAngleY: Math.random() * Math.PI * 2,
            wanderAngleZ: Math.random() * Math.PI * 2,
            wanderRadius: 1.2,
            wanderSpeed: {
                x: 0.0003 + Math.random() * 0.0002,
                y: 0.0004 + Math.random() * 0.0002,
                z: 0.0005 + Math.random() * 0.0002
            },
            noiseOffset: {
                x: Math.random() * 1000,
                y: Math.random() * 1000,
                z: Math.random() * 1000
            },
            maxDistance: 3.0 // Maximum distance from player
        };

        this.scene.add(this.companionOrb);

        // Create regular foxes
        for (let i = 0; i < this.foxCount; i++) {
            const fox = foxBody.clone();
            
            // Random starting position
            fox.position.set(
                (Math.random() - 0.5) * 800,
                0.3, // Height above ground
                (Math.random() - 0.5) * 800
            );
            
            // Add movement properties
            fox.userData = {
                velocity: new THREE.Vector3(),
                targetPosition: new THREE.Vector3(),
                speed: 0.05 + Math.random() * 0.05,
                updateTime: 0
            };
            
            this.foxes.push(fox);
            this.scene.add(fox);
        }
    }

    updateFoxes() {
        const time = performance.now() * 0.001;
        
        // Update companion orb
        if (this.companionOrb) {
            const data = this.companionOrb.userData;
            
            // Update wander angles with different frequencies
            data.wanderAngleX += Math.sin(time * 0.3 + data.noiseOffset.x) * data.wanderSpeed.x;
            data.wanderAngleY += Math.sin(time * 0.4 + data.noiseOffset.y) * data.wanderSpeed.y;
            data.wanderAngleZ += Math.sin(time * 0.5 + data.noiseOffset.z) * data.wanderSpeed.z;
            
            // Calculate 3D wandering position
            const wanderX = Math.cos(data.wanderAngleX) * data.wanderRadius;
            const wanderY = Math.sin(data.wanderAngleY) * data.wanderRadius * 0.5; // Less vertical movement
            const wanderZ = Math.sin(data.wanderAngleZ) * data.wanderRadius;
            
            // Calculate target position relative to player
            const targetPosition = new THREE.Vector3(
                this.camera.position.x + wanderX,
                this.camera.position.y + data.baseHeight + wanderY,
                this.camera.position.z + wanderZ
            );
            
            // Smooth current position towards target
            this.companionOrb.position.lerp(targetPosition, 0.02);
            
            // Keep orb within maximum distance
            const distanceToPlayer = this.companionOrb.position.distanceTo(this.camera.position);
            if (distanceToPlayer > data.maxDistance) {
                const direction = this.companionOrb.position.clone()
                    .sub(this.camera.position)
                    .normalize()
                    .multiplyScalar(data.maxDistance);
                this.companionOrb.position.copy(this.camera.position).add(direction);
            }

            // Update shader uniforms
            this.companionOrb.material.uniforms.time.value = time;
            this.companionOrb.material.uniforms.cameraPosition.value = this.camera.position;

            // Update light intensity based on distance from center position
            const light = this.companionOrb.children[0];
            const distanceFromCenter = Math.sqrt(wanderX * wanderX + wanderY * wanderY + wanderZ * wanderZ);
            const intensityVariation = 0.3 * (distanceFromCenter / data.wanderRadius);
            light.intensity = 0.7 + Math.sin(time * 1.5) * 0.2 + intensityVariation;
        }

        // Update regular foxes
        this.foxes.forEach(fox => {
            const data = fox.userData;
            
            // Update target position every few seconds
            if (time - data.updateTime > 5) {
                data.targetPosition.set(
                    (Math.random() - 0.5) * 800,
                    0.3,
                    (Math.random() - 0.5) * 800
                );
                data.updateTime = time;
            }
            
            // Calculate direction to target
            const direction = new THREE.Vector3()
                .subVectors(data.targetPosition, fox.position)
                .normalize();
            
            // Update velocity with some smoothing
            data.velocity.lerp(direction.multiplyScalar(data.speed), 0.02);
            
            // Update position
            fox.position.add(data.velocity);
            
            // Update rotation to face movement direction
            if (data.velocity.length() > 0.001) {
                // Fix rotation calculation
                const angle = Math.atan2(-data.velocity.x, -data.velocity.z);
                fox.rotation.y = angle;
            }
            
            // Animate tail and head slightly
            const tailWag = Math.sin(time * 10) * 0.2;
            fox.children[3].rotation.x = Math.PI / 4 + tailWag; // Updated tail animation axis
            fox.children[1].rotation.x = Math.sin(time * 5) * 0.1; // Updated head animation axis
        });
    }

    animate() {
        const currentTime = performance.now() * 0.001;
        this.deltaTime = currentTime - (this.lastTime || currentTime);
        this.lastTime = currentTime;

        requestAnimationFrame(() => this.animate());
        
        if (this.isDead) {
            this.renderer.render(this.scene, this.camera);
            return;
        }

        // Camera shake when hurt
        if (this.damageShakeIntensity > 0) {
            this.camera.position.x += (Math.random() - 0.5) * this.damageShakeIntensity * 0.2;
            this.camera.position.y += (Math.random() - 0.5) * this.damageShakeIntensity * 0.2;
            this.camera.position.z += (Math.random() - 0.5) * this.damageShakeIntensity * 0.2;
            this.damageShakeIntensity *= 0.9;
        }

        // Update sky time
        this.time += this.timeSpeed;
        if (this.sky && this.sky.material.uniforms) {
            this.sky.material.uniforms.time.value = this.time;
        }
        
        // Update foxes
        this.updateFoxes();
        
        // Add bear updates
        this.updateBears();
        
        // Update bullets
        this.updateBullets();
        
        // Update health packs
        this.updateHealthPacks();
        
        // Update gun position and rotation
        this.updateGun();
        
        this.handleMovement();

        // Update health regeneration
        this.updateHealth();
        
        // Add hunger update
        this.updateHunger();

        this.renderer.render(this.scene, this.camera);
    }

    createHealthBar() {
        // Create health bar container
        const healthContainer = document.createElement('div');
        healthContainer.style.position = 'fixed';
        healthContainer.style.bottom = '20px';
        healthContainer.style.left = '20px';
        healthContainer.style.width = '200px';
        healthContainer.style.height = '20px';
        healthContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        healthContainer.style.border = '2px solid #333';
        healthContainer.style.borderRadius = '10px';

        // Create health bar
        this.healthBar = document.createElement('div');
        this.healthBar.style.width = '100%';
        this.healthBar.style.height = '100%';
        this.healthBar.style.backgroundColor = '#ff3333';
        this.healthBar.style.borderRadius = '8px';
        this.healthBar.style.transition = 'width 0.2s';

        healthContainer.appendChild(this.healthBar);
        document.body.appendChild(healthContainer);
    }

    createAmmoBar() {
        // Create ammo bar container
        const ammoContainer = document.createElement('div');
        ammoContainer.style.position = 'fixed';
        ammoContainer.style.bottom = '50px';
        ammoContainer.style.left = '20px';
        ammoContainer.style.width = '200px';
        ammoContainer.style.height = '20px';
        ammoContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        ammoContainer.style.border = '2px solid #333';
        ammoContainer.style.borderRadius = '10px';

        // Create ammo bar
        this.ammoBar = document.createElement('div');
        this.ammoBar.style.width = '100%';
        this.ammoBar.style.height = '100%';
        this.ammoBar.style.backgroundColor = '#c0c0c0';
        this.ammoBar.style.borderRadius = '8px';
        this.ammoBar.style.transition = 'width 0.2s';

        ammoContainer.appendChild(this.ammoBar);
        document.body.appendChild(ammoContainer);
    }

    createStaminaBar() {
        // Create stamina bar container
        const staminaContainer = document.createElement('div');
        staminaContainer.style.position = 'fixed';
        staminaContainer.style.bottom = '80px'; // Position above ammo bar
        staminaContainer.style.left = '20px';
        staminaContainer.style.width = '200px';
        staminaContainer.style.height = '20px';
        staminaContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        staminaContainer.style.border = '2px solid #333';
        staminaContainer.style.borderRadius = '10px';

        // Create stamina bar
        this.staminaBar = document.createElement('div');
        this.staminaBar.style.width = '100%';
        this.staminaBar.style.height = '100%';
        this.staminaBar.style.backgroundColor = '#3498db'; // Blue color
        this.staminaBar.style.borderRadius = '8px';
        this.staminaBar.style.transition = 'width 0.2s';

        staminaContainer.appendChild(this.staminaBar);
        document.body.appendChild(staminaContainer);
    }

    createHungerBar() {
        // Create hunger bar container
        const hungerContainer = document.createElement('div');
        hungerContainer.style.position = 'fixed';
        hungerContainer.style.bottom = '110px'; // Position above stamina bar
        hungerContainer.style.left = '20px';
        hungerContainer.style.width = '200px';
        hungerContainer.style.height = '20px';
        hungerContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        hungerContainer.style.border = '2px solid #333';
        hungerContainer.style.borderRadius = '10px';

        // Create hunger bar
        this.hungerBar = document.createElement('div');
        this.hungerBar.style.width = '100%';
        this.hungerBar.style.height = '100%';
        this.hungerBar.style.backgroundColor = '#8B4513'; // Brown color
        this.hungerBar.style.borderRadius = '8px';
        this.hungerBar.style.transition = 'width 0.2s';

        hungerContainer.appendChild(this.hungerBar);
        document.body.appendChild(hungerContainer);
    }

    updateAmmoText() {
        this.ammoText.textContent = `${this.currentAmmo} / ${this.maxAmmo}`;
    }

    reload() {
        if (this.isReloading) return;
        
        // Allow reload even with full ammo
        this.isReloading = true;
        
        // Start reload animation
        this.reloadAnimation.active = true;
        this.reloadAnimation.startTime = performance.now() * 0.001;
        
        // Visual feedback - make ammo bar pulse
        this.ammoBar.style.transition = 'background-color 0.5s';
        this.ammoBar.style.backgroundColor = '#808080';
        
        setTimeout(() => {
            // Reset ammo
            this.currentAmmo = this.maxAmmo;
            
            // Update ammo bar
            this.ammoBar.style.width = '100%';
            this.ammoBar.style.backgroundColor = '#c0c0c0';
            
            // Reset reload states
            this.isReloading = false;
            
            // Make sure animation is complete
            this.reloadAnimation.active = false;
            this.gun.rotation.x = 0;
            this.gun.rotation.z = 0;
        }, this.reloadTime * 1000);
    }

    createBears() {
        const bearBody = new THREE.Group();
        
        // Bear body - make it more visible
        const bodyGeometry = new THREE.CapsuleGeometry(0.4, 0.8, 4, 8);
        const bearMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x4a3219,
            roughness: 0.7,
            metalness: 0.1
        });
        const body = new THREE.Mesh(bodyGeometry, bearMaterial);
        body.rotation.z = Math.PI / 2;
        bearBody.add(body);

        // Head
        const headGeometry = new THREE.SphereGeometry(0.3, 8, 8);
        const head = new THREE.Mesh(headGeometry, bearMaterial);
        head.position.z = 0.6;
        head.position.y = 0.2;
        bearBody.add(head);

        // Ears
        const earGeometry = new THREE.SphereGeometry(0.1, 4, 4);
        const earLeft = new THREE.Mesh(earGeometry, bearMaterial);
        earLeft.position.z = 0.7;
        earLeft.position.y = 0.5;
        earLeft.position.x = 0.2;
        bearBody.add(earLeft);

        const earRight = earLeft.clone();
        earRight.position.x = -0.2;
        bearBody.add(earRight);

        // Clear existing bears
        this.bears.forEach(bear => this.scene.remove(bear));
        this.bears = [];
        this.deadBears = [];

        // Create bears with better spacing
        for (let i = 0; i < this.bearCount; i++) {
            this.spawnBear(this.getSpreadOutPosition());
        }
    }

    getSpreadOutPosition() {
        const minDistance = 100; // Minimum distance between bears
        let position;
        let attempts = 0;
        const maxAttempts = 50;

        do {
            position = new THREE.Vector3(
                (Math.random() - 0.5) * 800,
                1.2,
                (Math.random() - 0.5) * 800
            );

            // Check distance from other bears
            const isTooClose = this.bears.some(bear => 
                bear.position.distanceTo(position) < minDistance
            );

            if (!isTooClose || attempts >= maxAttempts) {
                return position;
            }
            attempts++;
        } while (true);
    }

    spawnBear(position) {
        const bearBody = new THREE.Group();
        
        // Bear body - make it more visible
        const bodyGeometry = new THREE.CapsuleGeometry(0.4, 0.8, 4, 8);
        const bearMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x4a3219,
            roughness: 0.7,
            metalness: 0.1
        });
        const body = new THREE.Mesh(bodyGeometry, bearMaterial);
        body.rotation.z = Math.PI / 2;
        bearBody.add(body);

        // Head
        const headGeometry = new THREE.SphereGeometry(0.3, 8, 8);
        const head = new THREE.Mesh(headGeometry, bearMaterial);
        head.position.z = 0.6;
        head.position.y = 0.2;
        bearBody.add(head);

        // Ears
        const earGeometry = new THREE.SphereGeometry(0.1, 4, 4);
        const earLeft = new THREE.Mesh(earGeometry, bearMaterial);
        earLeft.position.z = 0.7;
        earLeft.position.y = 0.5;
        earLeft.position.x = 0.2;
        bearBody.add(earLeft);

        const earRight = earLeft.clone();
        earRight.position.x = -0.2;
        bearBody.add(earRight);

        const bear = bearBody.clone();
        bear.scale.set(2, 2, 2);
        bear.position.copy(position);

        bear.userData = {
            velocity: new THREE.Vector3(),
            targetPosition: new THREE.Vector3(),
            speed: 0.15 + Math.random() * 0.05,
            updateTime: 0,
            state: 'wandering',
            attackCooldown: 0,
            attackRange: 4,
            detectionRange: 30,
            damage: 20,
            lastAttackTime: 0,
            health: 3,
            maxHealth: 3,
            isHurt: false,
            attackStage: 'approach',
            attackDistance: 3,
            retreatTime: 1.5,
            retreatDistance: 8,
            lastStateChange: 0
        };

        this.bears.push(bear);
        this.scene.add(bear);
        return bear;
    }

    killBear(bear) {
        // Store death position and original scale
        const deathPosition = bear.position.clone();
        const originalScale = bear.scale.clone();
        
        // Add to dead bears list with death time and position
        this.deadBears.push({
            deathTime: performance.now() * 0.001,
            position: deathPosition,
            scale: originalScale
        });

        // Death animation - fall over
        const deathAnimation = () => {
            if (bear.rotation.z < Math.PI / 2) {
                bear.rotation.z += 0.1;
                requestAnimationFrame(deathAnimation);
            } else {
                // Remove bear after animation
                setTimeout(() => {
                    this.scene.remove(bear);
                    this.bears = this.bears.filter(b => b !== bear);
                }, 1000);
            }
        };
        deathAnimation();
    }

    updateBears() {
        const time = performance.now() * 0.001;
        
        // Check for bear respawns
        for (let i = this.deadBears.length - 1; i >= 0; i--) {
            const deadBear = this.deadBears[i];
            if (time - deadBear.deathTime >= this.bearRespawnTime) {
                console.log('Respawning bear...'); // Debug log
                
                // Create new bear at death location
                const bear = this.createBearModel();
                bear.position.copy(deadBear.position);
                bear.scale.copy(deadBear.scale);
                
                // Initialize bear properties
                bear.userData = {
                    velocity: new THREE.Vector3(),
                    targetPosition: new THREE.Vector3(),
                    speed: 0.15 + Math.random() * 0.05,
                    updateTime: 0,
                    state: 'wandering',
                    attackCooldown: 0,
                    attackRange: 4,
                    detectionRange: 30,
                    damage: 20,
                    lastAttackTime: 0,
                    health: 3,
                    maxHealth: 3,
                    isHurt: false,
                    attackStage: 'approach',
                    attackDistance: 3,
                    retreatTime: 1.5,
                    retreatDistance: 8,
                    lastStateChange: 0
                };
                
                // Add bear to scene and bears array
                this.scene.add(bear);
                this.bears.push(bear);
                
                // Remove from dead bears list
                this.deadBears.splice(i, 1);
            }
        }

        this.bears.forEach(bear => {
            const data = bear.userData;
            const distanceToPlayer = bear.position.distanceTo(this.camera.position);
            
            // Update bear state based on distance to player
            if (distanceToPlayer <= data.detectionRange) {
                if (data.state !== 'attacking') {
                    data.state = 'attacking';
                    data.attackStage = 'approach';
                    data.lastStateChange = time;
                }
            } else {
                data.state = 'wandering';
                data.attackStage = 'approach';
            }

            // Handle attack state with stages
            if (data.state === 'attacking') {
                switch (data.attackStage) {
                    case 'approach':
                        // Move towards player until reaching attack distance
                        if (distanceToPlayer <= data.attackDistance) {
                            data.attackStage = 'attack';
                            data.lastStateChange = time;
                        } else {
                            data.targetPosition.copy(this.camera.position);
                        }
                        break;

                    case 'attack':
                        // Stay in place and attack
                        if (distanceToPlayer <= data.attackRange) {
                            if (time - data.lastAttackTime >= 1.0) {
                                this.takeDamage(data.damage);
                                data.lastAttackTime = time;
                                // Switch to retreat after attack
                                data.attackStage = 'retreat';
                                data.lastStateChange = time;
                                
                                // Calculate retreat position
                                const retreatDir = new THREE.Vector3()
                                    .subVectors(bear.position, this.camera.position)
                                    .normalize()
                                    .multiplyScalar(data.retreatDistance);
                                data.targetPosition.copy(bear.position).add(retreatDir);
                            }
                        }
                        break;

                    case 'retreat':
                        // Retreat for a set time
                        if (time - data.lastStateChange >= data.retreatTime) {
                            data.attackStage = 'approach';
                            data.lastStateChange = time;
                        }
                        break;
                }
            } else if (data.state === 'wandering') {
                // Update random target position
                if (time - data.updateTime > 5) {
                    data.targetPosition.set(
                        bear.position.x + (Math.random() - 0.5) * 20,
                        1.2,
                        bear.position.z + (Math.random() - 0.5) * 20
                    );
                    data.updateTime = time;
                }
            }

            // Calculate direction and update position
            const direction = new THREE.Vector3()
                .subVectors(data.targetPosition, bear.position)
                .normalize();
            
            // Adjust speed based on state and stage
            let currentSpeed = data.speed;
            if (data.state === 'attacking') {
                switch (data.attackStage) {
                    case 'approach':
                        currentSpeed *= 1.5; // Faster approach
                        break;
                    case 'attack':
                        currentSpeed *= 0.1; // Very slow during attack
                        break;
                    case 'retreat':
                        currentSpeed *= 2.0; // Fastest during retreat
                        break;
                }
            }
            
            data.velocity.lerp(direction.multiplyScalar(currentSpeed), 0.05);
            bear.position.add(data.velocity);
            
            // Update rotation
            if (data.velocity.length() > 0.001) {
                const angle = Math.atan2(-data.velocity.x, -data.velocity.z);
                bear.rotation.y = angle;
            }

            // Animate based on state and stage
            const walkCycle = Math.sin(time * 5) * 0.1;
            bear.children[1].rotation.x = walkCycle;
            
            if (data.state === 'attacking') {
                switch (data.attackStage) {
                    case 'attack':
                        // Aggressive attack animation
                        bear.children[1].rotation.x -= Math.sin(time * 20) * 0.3;
                        break;
                    case 'retreat':
                        // Faster running animation
                        bear.children[1].rotation.x = Math.sin(time * 8) * 0.15;
                        break;
                }
            }
        });
    }

    createBearModel() {
        const bearBody = new THREE.Group();
        
        // Bear body - make it more visible
        const bodyGeometry = new THREE.CapsuleGeometry(0.4, 0.8, 4, 8);
        const bearMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x4a3219,
            roughness: 0.7,
            metalness: 0.1
        });
        const body = new THREE.Mesh(bodyGeometry, bearMaterial);
        body.rotation.z = Math.PI / 2;
        bearBody.add(body);

        // Head
        const headGeometry = new THREE.SphereGeometry(0.3, 8, 8);
        const head = new THREE.Mesh(headGeometry, bearMaterial);
        head.position.z = 0.6;
        head.position.y = 0.2;
        bearBody.add(head);

        // Ears
        const earGeometry = new THREE.SphereGeometry(0.1, 4, 4);
        const earLeft = new THREE.Mesh(earGeometry, bearMaterial);
        earLeft.position.z = 0.7;
        earLeft.position.y = 0.5;
        earLeft.position.x = 0.2;
        bearBody.add(earLeft);

        const earRight = earLeft.clone();
        earRight.position.x = -0.2;
        bearBody.add(earRight);

        // Set initial scale
        bearBody.scale.set(2, 2, 2);

        return bearBody;
    }

    createDamageOverlay() {
        // Create persistent damage overlay
        this.damageOverlay = document.createElement('div');
        this.damageOverlay.style.position = 'fixed';
        this.damageOverlay.style.top = '0';
        this.damageOverlay.style.left = '0';
        this.damageOverlay.style.width = '100%';
        this.damageOverlay.style.height = '100%';
        this.damageOverlay.style.backgroundColor = 'rgba(255, 0, 0, 0)';
        this.damageOverlay.style.pointerEvents = 'none';
        this.damageOverlay.style.transition = 'background-color 0.2s';
        this.damageOverlay.style.zIndex = '1000';
        document.body.appendChild(this.damageOverlay);
    }

    createRespawnScreen() {
        this.respawnScreen = document.createElement('div');
        this.respawnScreen.style.position = 'fixed';
        this.respawnScreen.style.top = '0';
        this.respawnScreen.style.left = '0';
        this.respawnScreen.style.width = '100%';
        this.respawnScreen.style.height = '100%';
        this.respawnScreen.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        this.respawnScreen.style.display = 'none';
        this.respawnScreen.style.flexDirection = 'column';
        this.respawnScreen.style.alignItems = 'center';
        this.respawnScreen.style.justifyContent = 'center';
        this.respawnScreen.style.color = 'white';
        this.respawnScreen.style.fontFamily = 'Arial, sans-serif';
        this.respawnScreen.style.zIndex = '2000';
        
        const deathMessage = document.createElement('h1');
        deathMessage.textContent = 'You Died';
        deathMessage.style.color = '#ff0000';
        deathMessage.style.fontSize = '48px';
        deathMessage.style.marginBottom = '20px';
        
        const respawnButton = document.createElement('button');
        respawnButton.textContent = 'Respawn';
        respawnButton.style.padding = '15px 30px';
        respawnButton.style.fontSize = '24px';
        respawnButton.style.backgroundColor = '#ff3333';
        respawnButton.style.border = 'none';
        respawnButton.style.borderRadius = '5px';
        respawnButton.style.color = 'white';
        respawnButton.style.cursor = 'pointer';
        respawnButton.style.transition = 'background-color 0.3s';
        
        respawnButton.addEventListener('mouseover', () => {
            respawnButton.style.backgroundColor = '#ff6666';
        });
        
        respawnButton.addEventListener('mouseout', () => {
            respawnButton.style.backgroundColor = '#ff3333';
        });
        
        respawnButton.addEventListener('click', () => this.respawn());
        
        this.respawnScreen.appendChild(deathMessage);
        this.respawnScreen.appendChild(respawnButton);
        document.body.appendChild(this.respawnScreen);
    }

    takeDamage(amount) {
        if (this.isHurt || this.isDead) return;
        
        this.currentHealth = Math.max(0, this.currentHealth - amount);
        this.healthBar.style.width = `${(this.currentHealth / this.maxHealth) * 100}%`;
        
        // Update last damage time for regen system
        this.lastDamageTime = performance.now() * 0.001;
        
        // Visual feedback
        this.isHurt = true;
        this.damageShakeIntensity = 1;
        
        // Update damage overlay
        this.damageOverlay.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
        setTimeout(() => {
            this.damageOverlay.style.backgroundColor = 'rgba(255, 0, 0, 0)';
        }, 100);

        // Check for death
        if (this.currentHealth <= 0) {
            this.die();
            return;
        }

        // Invulnerability period
        setTimeout(() => {
            this.isHurt = false;
        }, 1000);
    }

    die() {
        this.isDead = true;
        
        // Fade to red
        this.damageOverlay.style.transition = 'background-color 1s';
        this.damageOverlay.style.backgroundColor = 'rgba(255, 0, 0, 0.7)';
        
        // Show respawn screen after fade
        setTimeout(() => {
            document.exitPointerLock();
            this.respawnScreen.style.display = 'flex';
        }, 1000);
    }

    respawn() {
        // Reset health
        this.currentHealth = this.maxHealth;
        this.healthBar.style.width = '100%';
        
        // Reset position
        this.camera.position.set(0, 2, 5);
        this.rotation.set(0, 0, 0);
        this.camera.rotation.copy(this.rotation);
        
        // Reset movement
        this.moveDirection.set(0, 0, 0);
        this.verticalVelocity = 0;
        this.isJumping = false;
        
        // Clear visual effects
        this.damageOverlay.style.transition = 'background-color 0.2s';
        this.damageOverlay.style.backgroundColor = 'rgba(255, 0, 0, 0)';
        this.damageShakeIntensity = 0;
        
        // Hide respawn screen
        this.respawnScreen.style.display = 'none';
        
        // Reset state
        this.isDead = false;
        this.isHurt = false;
        
        // Reset hunger
        this.currentHunger = this.maxHunger;
        this.hungerBar.style.width = '100%';
    }

    shoot() {
        const time = performance.now() * 0.001;
        if (time - this.lastShotTime < this.shootCooldown) return;
        if (this.isReloading) return;
        if (this.currentAmmo <= 0) {
            // Show reload hint when out of ammo
            this.reloadHint.style.opacity = '1';
            return;
        }
        
        // Create bullet
        const bulletGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
        
        // Position bullet at gun muzzle
        const muzzlePosition = new THREE.Vector3(0, 0, -0.4);
        muzzlePosition.applyQuaternion(this.gun.quaternion);
        bullet.position.copy(this.gun.position).add(muzzlePosition);
        
        // Get direction camera is facing
        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyQuaternion(this.camera.quaternion);
        
        // Store direction in bullet's userData
        bullet.userData = {
            velocity: direction.multiplyScalar(this.bulletSpeed),
            timeCreated: time
        };
        
        // Adjust recoil based on aiming
        this.gunRecoil = this.isAiming ? 0.05 : 0.1; // Less recoil when aiming
        
        this.bullets.push(bullet);
        this.scene.add(bullet);
        this.lastShotTime = time;

        // Update ammo
        this.currentAmmo--;
        this.ammoBar.style.width = `${(this.currentAmmo / this.maxAmmo) * 100}%`;
        this.updateAmmoText();
        
        // Show reload hint when low on ammo
        if (this.currentAmmo <= 5) {
            this.reloadHint.style.opacity = '1';
        }
    }

    updateBullets() {
        const time = performance.now() * 0.001;
        
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            
            // Update bullet position
            bullet.position.add(bullet.userData.velocity);
            
            // Check for collisions with bears
            this.bears.forEach(bear => {
                if (bear.userData.health <= 0) return; // Skip dead bears
                
                const distance = bullet.position.distanceTo(bear.position);
                if (distance < 2) { // Hit detection radius
                    // Damage bear
                    this.damageBear(bear);
                    
                    // Remove bullet
                    this.scene.remove(bullet);
                    this.bullets.splice(i, 1);
                }
            });
            
            // Remove bullets after 2 seconds
            if (time - bullet.userData.timeCreated > 2) {
                this.scene.remove(bullet);
                this.bullets.splice(i, 1);
            }
        }
    }

    damageBear(bear) {
        if (bear.userData.isHurt) return;
        
        bear.userData.health--;
        bear.userData.isHurt = true;
        
        // Visual feedback - flash bear red
        const originalMaterial = bear.children[0].material;
        bear.traverse(child => {
            if (child.material) {
                child.material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
            }
        });
        
        // Reset material after flash
        setTimeout(() => {
            bear.traverse(child => {
                if (child.material) {
                    child.material = originalMaterial;
                }
            });
            bear.userData.isHurt = false;
        }, 100);
        
        // Check for death
        if (bear.userData.health <= 0) {
            // Restore hunger when killing a bear
            this.currentHunger = Math.min(this.maxHunger, this.currentHunger + 50);
            this.hungerBar.style.width = `${(this.currentHunger / this.maxHunger) * 100}%`;
            
            // Visual feedback for hunger restoration
            this.hungerBar.style.boxShadow = '0 0 10px rgba(139, 69, 19, 0.8)';
            setTimeout(() => {
                this.hungerBar.style.boxShadow = 'none';
            }, 300);
            
            this.killBear(bear);
        }
    }

    createHealthPack() {
        const healthPack = new THREE.Group();
        
        // Create cross shape
        const crossGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.1);
        const crossMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xff0000,
            emissive: 0xff0000,
            emissiveIntensity: 0.5
        });
        
        const horizontalPart = new THREE.Mesh(crossGeometry, crossMaterial);
        const verticalPart = new THREE.Mesh(crossGeometry, crossMaterial);
        verticalPart.rotation.z = Math.PI / 2;
        
        healthPack.add(horizontalPart);
        healthPack.add(verticalPart);
        
        // Add white border
        const borderGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.05);
        const borderMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const border = new THREE.Mesh(borderGeometry, borderMaterial);
        border.position.z = -0.03;
        healthPack.add(border);
        
        // Add floating animation data
        healthPack.userData = {
            spawnTime: performance.now() * 0.001,
            baseHeight: 1.0,
            rotationSpeed: 0.001
        };
        
        return healthPack;
    }

    spawnHealthPacks() {
        // Clear existing health packs
        this.healthPacks.forEach(pack => this.scene.remove(pack));
        this.healthPacks = [];
        
        // Spawn new health packs
        for (let i = 0; i < this.healthPackCount; i++) {
            const healthPack = this.createHealthPack();
            
            // Random position
            healthPack.position.set(
                (Math.random() - 0.5) * 800,
                healthPack.userData.baseHeight,
                (Math.random() - 0.5) * 800
            );
            
            this.healthPacks.push(healthPack);
            this.scene.add(healthPack);
        }
    }

    updateHealthPacks() {
        const time = performance.now() * 0.001;
        
        // Check if we need to spawn more health packs
        if (this.healthPacks.length < this.healthPackCount && 
            time - this.lastHealthPackSpawn > this.healthPackRespawnTime) {
            const healthPack = this.createHealthPack();
            healthPack.position.set(
                (Math.random() - 0.5) * 800,
                healthPack.userData.baseHeight,
                (Math.random() - 0.5) * 800
            );
            this.healthPacks.push(healthPack);
            this.scene.add(healthPack);
            this.lastHealthPackSpawn = time;
        }
        
        // Update existing health packs
        this.healthPacks.forEach(pack => {
            // Floating animation
            pack.position.y = pack.userData.baseHeight + Math.sin(time * 2) * 0.2;
            pack.rotation.y += pack.userData.rotationSpeed;
            
            // Check for collection
            const distance = pack.position.distanceTo(this.camera.position);
            if (distance < 2) {
                this.collectHealthPack(pack);
            }
        });
    }

    collectHealthPack(pack) {
        // Heal player
        this.currentHealth = Math.min(this.maxHealth, this.currentHealth + this.healthPackValue);
        this.healthBar.style.width = `${(this.currentHealth / this.maxHealth) * 100}%`;
        
        // Remove health pack
        this.scene.remove(pack);
        this.healthPacks = this.healthPacks.filter(p => p !== pack);
        this.lastHealthPackSpawn = performance.now() * 0.001;
        
        // Visual feedback
        this.healthBar.style.boxShadow = '0 0 20px #00ff00';
        setTimeout(() => {
            this.healthBar.style.boxShadow = 'none';
        }, 200);
        
        // Restore some hunger when collecting health pack
        this.currentHunger = Math.min(this.maxHunger, this.currentHunger + this.healthPackValue);
        this.hungerBar.style.width = `${(this.currentHunger / this.maxHunger) * 100}%`;
    }

    createGun() {
        const gun = new THREE.Group();
        
        // Create gun parts
        const barrelGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.4);
        const barrelMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x222222,
            metalness: 0.8,
            roughness: 0.2
        });
        const barrel = new THREE.Mesh(barrelGeometry, barrelMaterial);
        barrel.position.z = -0.2;
        gun.add(barrel);
        
        // Handle
        const handleGeometry = new THREE.BoxGeometry(0.08, 0.2, 0.1);
        const handleMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x444444,
            metalness: 0.5,
            roughness: 0.5
        });
        const handle = new THREE.Mesh(handleGeometry, handleMaterial);
        handle.position.y = -0.15;
        handle.rotation.x = Math.PI / 6;
        gun.add(handle);
        
        // Add muzzle
        const muzzleGeometry = new THREE.CylinderGeometry(0.05, 0.06, 0.05, 8);
        const muzzle = new THREE.Mesh(muzzleGeometry, barrelMaterial);
        muzzle.rotation.x = Math.PI / 2;
        muzzle.position.z = -0.4;
        gun.add(muzzle);

        this.gun = gun;
        this.scene.add(gun);
    }

    updateGun() {
        if (!this.gun) return;
        
        // Update FOV for aim transition
        const targetFOV = this.isAiming ? this.aimFOV : this.defaultFOV;
        this.currentFOV += (targetFOV - this.currentFOV) * this.aimTransitionSpeed;
        this.camera.fov = this.currentFOV;
        this.camera.updateProjectionMatrix();
        
        // Update gun position for aim transition
        const targetOffset = this.isAiming ? this.aimGunOffset : this.defaultGunOffset;
        this.gunOffset.lerp(targetOffset, this.aimTransitionSpeed);
        
        // Position gun relative to camera
        const cameraDirection = new THREE.Vector3(0, 0, -1);
        cameraDirection.applyQuaternion(this.camera.quaternion);
        
        // Apply gun position with recoil
        this.gun.position.copy(this.camera.position)
            .add(this.gunOffset.clone()
                .applyQuaternion(this.camera.quaternion))
            .add(cameraDirection.multiplyScalar(this.gunRecoil));
        
        // Reset gun rotation
        this.gun.rotation.set(0, 0, 0);
        
        // Apply reload animation
        if (this.reloadAnimation.active) {
            const time = performance.now() * 0.001;
            const animationProgress = (time - this.reloadAnimation.startTime) / this.reloadTime;
            
            // Only animate if we haven't reached the end of the reload time
            if (animationProgress <= 1.0) {
                // Create a more dramatic reload animation
                const rotationX = Math.sin(animationProgress * Math.PI) * (Math.PI / 2);
                const rotationZ = Math.sin(animationProgress * Math.PI * 2) * 0.3;
                
                this.gun.rotation.x = rotationX;
                this.gun.rotation.z = rotationZ;
                
                // Add a slight downward position offset during reload
                const verticalOffset = Math.sin(animationProgress * Math.PI) * 0.2;
                this.gun.position.y -= verticalOffset;
            } else {
                // Reset rotations when animation is complete
                this.gun.rotation.x = 0;
                this.gun.rotation.z = 0;
                this.reloadAnimation.active = false;
            }
        }
        
        // Apply camera rotation after reload animation
        const cameraRotation = new THREE.Quaternion().setFromEuler(this.camera.rotation);
        this.gun.quaternion.setFromEuler(this.gun.rotation);
        this.gun.quaternion.multiply(cameraRotation);
        
        // Apply recoil animation with reduced effect while aiming
        if (this.gunRecoil > 0) {
            const recoilDamping = this.isAiming ? 0.9 : 0.8;
            this.gunRecoil *= recoilDamping;
        }
    }

    updateHealth() {
        if (this.isDead || this.currentHealth >= this.maxHealth) return;
        
        const currentTime = performance.now() * 0.001;
        const timeSinceLastDamage = currentTime - this.lastDamageTime;
        
        // Start regenerating health after delay
        if (timeSinceLastDamage > this.healthRegenDelay) {
            const regenAmount = (this.healthRegenRate * this.deltaTime);
            this.currentHealth = Math.min(this.maxHealth, this.currentHealth + regenAmount);
            this.healthBar.style.width = `${(this.currentHealth / this.maxHealth) * 100}%`;
            
            // Add subtle visual feedback during regen
            if (this.currentHealth < this.maxHealth) {
                this.healthBar.style.boxShadow = '0 0 10px rgba(0, 255, 0, 0.3)';
            } else {
                this.healthBar.style.boxShadow = 'none';
            }
        }
    }

    updateHunger() {
        const time = performance.now() * 0.001;
        
        // Drain hunger over time
        this.currentHunger = Math.max(0, this.currentHunger - this.hungerDrainRate * this.deltaTime);
        
        // Update hunger bar
        this.hungerBar.style.width = `${(this.currentHunger / this.maxHunger) * 100}%`;
        
        // Deal damage when starving
        if (this.currentHunger <= 0 && time - this.lastHungerDamage > this.hungerDamageInterval) {
            this.takeDamage(this.hungerDamageRate);
            this.lastHungerDamage = time;
            
            // Visual feedback for starvation
            this.hungerBar.style.boxShadow = '0 0 10px rgba(139, 69, 19, 0.5)';
            setTimeout(() => {
                this.hungerBar.style.boxShadow = 'none';
            }, 200);
        }
    }
} 