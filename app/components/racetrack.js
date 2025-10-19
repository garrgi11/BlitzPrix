'use client'
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const F1RaceSimulation = () => {
  const containerRef = useRef(null);
  const [isRainy, setIsRainy] = React.useState(false);
  const sceneRef = useRef(null);
  const cloudsRef = useRef(null);
  const rainRef = useRef(null);
  const updateWeatherRef = useRef(null);
  const [terminalLines, setTerminalLines] = React.useState([]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    // Camera setup - perspective camera with nice viewing angle
    const camera = new THREE.PerspectiveCamera(
      75, // Field of view
      window.innerWidth / window.innerHeight, // Aspect ratio
      0.1, // Near clipping plane
      2000 // Far clipping plane for larger track
    );
    camera.position.set(20, 20, 20); // Initial position
    camera.lookAt(0, 0, 0);

    // Renderer setup - Enhanced for better quality
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // High quality but not too heavy
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Softer shadows
    renderer.outputEncoding = THREE.sRGBEncoding; // Better color accuracy
    renderer.toneMapping = THREE.ACESFilmicToneMapping; // Better lighting
    renderer.toneMappingExposure = 1.2;
    containerRef.current.appendChild(renderer.domElement);

    // Sky background - beautiful gradient blue sky
    scene.background = new THREE.Color(0x87CEEB); // Sky blue
    scene.fog = new THREE.Fog(0x87CEEB, 100, 400); // Atmospheric fog for larger track

    // Add some fluffy clouds
    const createCloud = (x, y, z) => {
      const cloud = new THREE.Group();
      
      // Create multiple spheres for a fluffy cloud effect
      const cloudGeometry = new THREE.SphereGeometry(1, 16, 16);
      const cloudMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xFFFFFF,
        transparent: true,
        opacity: 0.8
      });

      // Main cloud puffs
      for (let i = 0; i < 5; i++) {
        const puff = new THREE.Mesh(cloudGeometry, cloudMaterial);
        puff.position.x = Math.random() * 4 - 2;
        puff.position.y = Math.random() * 1;
        puff.position.z = Math.random() * 2 - 1;
        puff.scale.set(
          1 + Math.random() * 2,
          0.8 + Math.random() * 0.5,
          1 + Math.random() * 1.5
        );
        cloud.add(puff);
      }

      cloud.position.set(x, y, z);
      return cloud;
    };

    // Add multiple clouds scattered across the sky
    const clouds = [];
    for (let i = 0; i < 20; i++) {
      const cloud = createCloud(
        Math.random() * 300 - 150,
        20 + Math.random() * 15,
        Math.random() * 300 - 150
      );
      clouds.push(cloud);
      scene.add(cloud);
    }
    cloudsRef.current = clouds;

    // Create rain particle system
    const createRain = () => {
      const rainCount = 15000;
      const rainGeometry = new THREE.BufferGeometry();
      const rainPositions = new Float32Array(rainCount * 3);
      const rainVelocities = new Float32Array(rainCount);
      
      for (let i = 0; i < rainCount; i++) {
        rainPositions[i * 3] = Math.random() * 400 - 200;
        rainPositions[i * 3 + 1] = Math.random() * 100;
        rainPositions[i * 3 + 2] = Math.random() * 400 - 200;
        rainVelocities[i] = 0.5 + Math.random() * 0.5;
      }
      
      rainGeometry.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
      rainGeometry.userData.velocities = rainVelocities;
      
      const rainMaterial = new THREE.PointsMaterial({
        color: 0xaaaaaa,
        size: 0.2,
        transparent: true,
        opacity: 0.6
      });
      
      return new THREE.Points(rainGeometry, rainMaterial);
    };

    // Add ground (grass-like surface) - much larger for COTA track
    const groundGeometry = new THREE.PlaneGeometry(500, 500);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x2d5016, // Dark green grass
      roughness: 0.8
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 50, 25);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    scene.add(directionalLight);

    // Create COTA-style F1 racetrack
    const createRacetrack = () => {
      const trackGroup = new THREE.Group();
      
      // EXACT COTA (Circuit of the Americas) track layout based on official map
      const trackPoints = [
        // START/FINISH STRAIGHT (bottom left going up)
        new THREE.Vector3(-80, 0, -90),
        new THREE.Vector3(-75, 0, -70),
        new THREE.Vector3(-70, 0, -50),
        new THREE.Vector3(-65, 0, -30),
        new THREE.Vector3(-60, 0, -10),
        
        // TURN 1 - Wide sweeping left-hander (MUCH WIDER RADIUS like other smooth curves)
        new THREE.Vector3(-58, 0, 0),
        new THREE.Vector3(-55, 0, 8),
        new THREE.Vector3(-52, 0, 15),
        new THREE.Vector3(-48, 0, 21),
        new THREE.Vector3(-44, 0, 26),
        new THREE.Vector3(-39, 0, 30),
        new THREE.Vector3(-34, 0, 33),
        new THREE.Vector3(-28, 0, 35),
        new THREE.Vector3(-22, 0, 37),
        new THREE.Vector3(-16, 0, 38),
        new THREE.Vector3(-10, 0, 39),
        new THREE.Vector3(-5, 0, 40),
        
        // TURN 2 - Apex of the big left (SECTOR 1 - RED)
        new THREE.Vector3(0, 0, 41),
        new THREE.Vector3(5, 0, 42),
        
        // TURNS 3-6 - The Esses going up the left side
        new THREE.Vector3(10, 0, 45),         // Turn 3 - right
        new THREE.Vector3(15, 0, 55),         // Turn 4 - left
        new THREE.Vector3(12, 0, 70),         // Turn 5 - right
        new THREE.Vector3(8, 0, 85),          // Turn 6 - left
        
        // TURNS 7-9 - Flowing right side (SECTOR 2 - BLUE)
        new THREE.Vector3(10, 0, 100),        // Turn 7
        new THREE.Vector3(20, 0, 112),        // Turn 8
        new THREE.Vector3(35, 0, 120),        // Turn 9
        
        // TURN 10 - Right hander
        new THREE.Vector3(50, 0, 125),
        
        // TURN 11 - Fast right at far right
        new THREE.Vector3(70, 0, 128),
        new THREE.Vector3(85, 0, 130),
        
        // BACK STRAIGHT and TURN 12 area (top of circuit)
        new THREE.Vector3(100, 0, 128),
        new THREE.Vector3(110, 0, 122),
        new THREE.Vector3(115, 0, 110),       // Turn 12 - hairpin
        new THREE.Vector3(112, 0, 95),
        
        // TURNS 13-14 - Coming down
        new THREE.Vector3(105, 0, 80),        // Turn 13
        new THREE.Vector3(95, 0, 70),         // Turn 14
        
        // TURN 15 - Sweeping left (SECTOR 3 - YELLOW)
        new THREE.Vector3(82, 0, 60),
        new THREE.Vector3(68, 0, 52),
        
        // TURNS 16-18 - STADIUM SECTION (middle-left)
        new THREE.Vector3(55, 0, 48),         // Turn 16 - left
        new THREE.Vector3(45, 0, 42),         // Turn 17 - left hairpin
        new THREE.Vector3(38, 0, 30),         // Turn 18 - right
        new THREE.Vector3(36, 0, 22),
        new THREE.Vector3(34, 0, 14),
        new THREE.Vector3(32, 0, 7),
        
        // TURN 19 - Left hander (bottom middle) - SMOOTHED
        new THREE.Vector3(30, 0, 0),
        new THREE.Vector3(26, 0, -6),
        new THREE.Vector3(22, 0, -12),
        new THREE.Vector3(18, 0, -18),
        new THREE.Vector3(14, 0, -23),
        
        // TURN 20 - Final right hander before start/finish (EXTRA SMOOTHED)
        new THREE.Vector3(10, 0, -28),
        new THREE.Vector3(5, 0, -33),
        new THREE.Vector3(0, 0, -38),
        new THREE.Vector3(-6, 0, -44),
        new THREE.Vector3(-13, 0, -50),
        new THREE.Vector3(-21, 0, -56),
        new THREE.Vector3(-30, 0, -62),
        new THREE.Vector3(-40, 0, -68),
        new THREE.Vector3(-50, 0, -74),
        new THREE.Vector3(-60, 0, -80),
        new THREE.Vector3(-68, 0, -86),       // Back to start
      ];

      // Create smooth curve from points with arc-length parametrization
      const trackCurve = new THREE.CatmullRomCurve3(trackPoints, true); // true = closed loop
      trackCurve.arcLengthDivisions = 500; // Higher divisions for accurate arc-length
      
      // Create flat track surface (ribbon-style)
      const trackWidth = 12;
      const segments = 200;
      const trackGeometry = new THREE.BufferGeometry();
      
      const vertices = [];
      const indices = [];
      const uvs = [];
      
      // Generate vertices along the curve using arc-length parametrization
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const point = trackCurve.getPointAt(t); // Arc-length based for uniform spacing
        const tangent = trackCurve.getTangentAt(t); // Arc-length based tangent
        
        // Calculate perpendicular vector for track width
        const perpendicular = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
        
        // Create left and right edge of track
        // Raise track by 0.2 to prevent z-fighting with ground
        const leftEdge = point.clone().add(perpendicular.clone().multiplyScalar(trackWidth / 2));
        leftEdge.y = 0.2;
        const rightEdge = point.clone().add(perpendicular.clone().multiplyScalar(-trackWidth / 2));
        rightEdge.y = 0.2;
        
        vertices.push(leftEdge.x, leftEdge.y, leftEdge.z);
        vertices.push(rightEdge.x, rightEdge.y, rightEdge.z);
        
        uvs.push(0, i / segments);
        uvs.push(1, i / segments);
      }
      
      // Create triangles
      for (let i = 0; i < segments; i++) {
        const a = i * 2;
        const b = i * 2 + 1;
        const c = (i + 1) * 2;
        const d = (i + 1) * 2 + 1;
        
        indices.push(a, b, c);
        indices.push(b, d, c);
      }
      
      trackGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      trackGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
      trackGeometry.setIndex(indices);
      trackGeometry.computeVertexNormals();
      
      const trackMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x3d3d3d, // Brighter gray
        roughness: 0.9,
        side: THREE.DoubleSide
      });
      const track = new THREE.Mesh(trackGeometry, trackMaterial);
      track.castShadow = true;
      track.receiveShadow = true;
      trackGroup.add(track);
      
      // Add red and white striped curbs along track edges
      const curbWidth = 0.8;
      const stripeLength = 1.5; // Length of each red or white stripe
      const curbSegments = 400; // More segments for smooth striped pattern
      
      // Create curb geometries for left and right sides
      const createCurbStripe = (isLeftSide) => {
        const curbVertices = [];
        const curbIndices = [];
        const curbColors = [];
        
        for (let i = 0; i <= curbSegments; i++) {
          const t = i / curbSegments;
          const point = trackCurve.getPointAt(t); // Arc-length based
          const tangent = trackCurve.getTangentAt(t); // Arc-length based
          const perpendicular = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
          
          // Determine stripe color (alternating red/white based on distance along track)
          const distanceAlongTrack = t * curbSegments;
          const stripeIndex = Math.floor(distanceAlongTrack / (stripeLength * 2));
          const isRed = stripeIndex % 2 === 0;
          const color = isRed ? new THREE.Color(0xff0000) : new THREE.Color(0xffffff);
          
          // Position curb at track edge
          const sideMultiplier = isLeftSide ? 1 : -1;
          const innerEdge = point.clone().add(perpendicular.clone().multiplyScalar(sideMultiplier * trackWidth / 2));
          const outerEdge = point.clone().add(perpendicular.clone().multiplyScalar(sideMultiplier * (trackWidth / 2 + curbWidth)));
          
          innerEdge.y = 0.21; // Just above track
          outerEdge.y = 0.21;
          
          curbVertices.push(innerEdge.x, innerEdge.y, innerEdge.z);
          curbVertices.push(outerEdge.x, outerEdge.y, outerEdge.z);
          
          // Add colors for both vertices
          curbColors.push(color.r, color.g, color.b);
          curbColors.push(color.r, color.g, color.b);
        }
        
        // Create triangles
        for (let i = 0; i < curbSegments; i++) {
          const a = i * 2;
          const b = i * 2 + 1;
          const c = (i + 1) * 2;
          const d = (i + 1) * 2 + 1;
          
          curbIndices.push(a, b, c);
          curbIndices.push(b, d, c);
        }
        
        const curbGeometry = new THREE.BufferGeometry();
        curbGeometry.setAttribute('position', new THREE.Float32BufferAttribute(curbVertices, 3));
        curbGeometry.setAttribute('color', new THREE.Float32BufferAttribute(curbColors, 3));
        curbGeometry.setIndex(curbIndices);
        curbGeometry.computeVertexNormals();
        
        const curbMaterial = new THREE.MeshStandardMaterial({ 
          vertexColors: true,
          roughness: 0.7,
          side: THREE.DoubleSide
        });
        
        return new THREE.Mesh(curbGeometry, curbMaterial);
      };
      
      // Add both left and right curbs
      const leftCurb = createCurbStripe(true);
      const rightCurb = createCurbStripe(false);
      trackGroup.add(leftCurb);
      trackGroup.add(rightCurb);
      
      // === ADD GRANDSTANDS / SEATING ARENAS ===
      const createGrandstand = (position, rotation, tiers = 8, width = 30) => {
        const grandstandGroup = new THREE.Group();
        
        // Grandstand structure materials
        const seatMaterial = new THREE.MeshStandardMaterial({ 
          color: 0xdd2222, // Red seats
          roughness: 0.8
        });
        const structureMaterial = new THREE.MeshStandardMaterial({ 
          color: 0x505050, // Gray structure
          roughness: 0.7
        });
        const concreteMaterial = new THREE.MeshStandardMaterial({ 
          color: 0x666666, // Concrete
          roughness: 0.9
        });
        const roofMaterial = new THREE.MeshStandardMaterial({ 
          color: 0x1a1a1a, // Dark roof
          roughness: 0.6
        });
        
        // Simple tiered seating - like stadium stairs going up and back
        const tierHeight = 1.0;  // Each step up
        const tierDepth = 2.0;   // Each step back
        const seatHeight = 0.4;
        
        // Foundation
        const foundationHeight = 1.5;
        const foundationGeometry = new THREE.BoxGeometry(width, foundationHeight, tiers * tierDepth + 2);
        const foundation = new THREE.Mesh(foundationGeometry, concreteMaterial);
        foundation.position.y = foundationHeight / 2;
        foundation.position.z = (tiers * tierDepth) / 2;
        foundation.receiveShadow = true;
        grandstandGroup.add(foundation);
        
        // Create each tier as a step
        for (let tier = 0; tier < tiers; tier++) {
          // Riser (vertical part of the step) - gray concrete
          const riserHeight = tierHeight;
          const riserGeometry = new THREE.BoxGeometry(width, riserHeight, 0.3);
          const riser = new THREE.Mesh(riserGeometry, concreteMaterial);
          riser.position.y = foundationHeight + tier * tierHeight + riserHeight / 2;
          riser.position.z = tier * tierDepth;
          riser.castShadow = true;
          grandstandGroup.add(riser);
          
          // Tread (horizontal part of the step) - gray concrete floor
          const treadGeometry = new THREE.BoxGeometry(width, 0.2, tierDepth);
          const tread = new THREE.Mesh(treadGeometry, concreteMaterial);
          tread.position.y = foundationHeight + (tier + 1) * tierHeight;
          tread.position.z = tier * tierDepth + tierDepth / 2;
          tread.receiveShadow = true;
          grandstandGroup.add(tread);
          
          // Seats on the tread - red seats
          const seatGeometry = new THREE.BoxGeometry(width - 1, seatHeight, tierDepth * 0.4);
          const seats = new THREE.Mesh(seatGeometry, seatMaterial);
          seats.position.y = foundationHeight + (tier + 1) * tierHeight + seatHeight / 2;
          seats.position.z = tier * tierDepth + tierDepth * 0.7; // Toward back of tread
          seats.castShadow = true;
          grandstandGroup.add(seats);
        }
        
        // Simple support pillars at front
        const pillarHeight = foundationHeight + tiers * tierHeight;
        const pillarGeometry = new THREE.CylinderGeometry(0.6, 0.8, pillarHeight, 8);
        for (let i = -1; i <= 1; i++) {
          const pillar = new THREE.Mesh(pillarGeometry, structureMaterial);
          pillar.position.x = i * width / 3;
          pillar.position.y = pillarHeight / 2;
          pillar.position.z = -1.5;
          pillar.castShadow = true;
          grandstandGroup.add(pillar);
        }
        
        // Roof
        const roofGeometry = new THREE.BoxGeometry(width + 4, 0.3, tiers * tierDepth + 3);
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = foundationHeight + tiers * tierHeight + 1.5;
        roof.position.z = (tiers * tierDepth) / 2;
        roof.castShadow = true;
        grandstandGroup.add(roof);
        
        // Position and rotate the entire grandstand
        grandstandGroup.position.copy(position);
        grandstandGroup.rotation.y = rotation;
        
        return grandstandGroup;
      };
      
      // Place ONE test grandstand - properly oriented
      
      // Single grandstand at Start/Finish for testing
      // const testGrandstand = createGrandstand(
      //   new THREE.Vector3(-120, 0, -40),
      //   0, // No rotation - facing +Z direction
      //   8,
      //   35
      // );
      // trackGroup.add(testGrandstand);
      
      // Store track curve for car path
      trackGroup.userData.trackCurve = trackCurve;
      trackGroup.userData.trackWidth = trackWidth;
      
      return trackGroup;
    };

    const racetrack = createRacetrack();
    const trackCurve = racetrack.userData.trackCurve;
    scene.add(racetrack);

    // Add checkered start/finish line on a straight section
    const startFinishPosition = 0.84; // Position on the straight before final corner
    
    const createCheckeredLine = () => {
      // Create checkered pattern texture
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      
      const squareSize = 64; // Size of each checker square
      const numSquaresX = 8;
      const numSquaresY = 4;
      
      for (let i = 0; i < numSquaresX; i++) {
        for (let j = 0; j < numSquaresY; j++) {
          // Alternate between black and white
          ctx.fillStyle = (i + j) % 2 === 0 ? '#ffffff' : '#000000';
          ctx.fillRect(i * squareSize, j * squareSize, squareSize, squareSize);
        }
      }
      
      const checkeredTexture = new THREE.CanvasTexture(canvas);
      checkeredTexture.anisotropy = 16;
      checkeredTexture.wrapS = THREE.ClampToEdgeWrapping;
      checkeredTexture.wrapT = THREE.ClampToEdgeWrapping;
      
      // Get position on the main straight using arc-length
      const startPoint = trackCurve.getPointAt(startFinishPosition);
      const nextPoint = trackCurve.getPointAt((startFinishPosition + 0.002) % 1);
      
      // Calculate direction angle perpendicular to track
      const dx = nextPoint.x - startPoint.x;
      const dz = nextPoint.z - startPoint.z;
      const angle = Math.atan2(dz, dx); // Perpendicular angle for crossing the track
      
      // Use actual track width from racetrack
      const trackWidth = racetrack.userData.trackWidth || 12;
      
      // Create checkered finish line - matches road width exactly
      const lineGeometry = new THREE.PlaneGeometry(trackWidth, 2.5);
      const lineMaterial = new THREE.MeshStandardMaterial({ 
        map: checkeredTexture,
        roughness: 0.8,
        metalness: 0.1
      });
      
      const checkeredLine = new THREE.Mesh(lineGeometry, lineMaterial);
      checkeredLine.rotation.x = -Math.PI / 2; // Lay flat
      checkeredLine.rotation.z = angle; // Perpendicular to track direction
      checkeredLine.position.set(startPoint.x, 0.22, startPoint.z); // On the straight, slightly above track
      checkeredLine.receiveShadow = true;
      
      return checkeredLine;
    };
    
    const checkeredStartLine = createCheckeredLine();
    scene.add(checkeredStartLine);

    // Add "COTA" and "CIRCUIT OF THE AMERICAS" text as flat decals on ground
    
    // Create canvas for text with high resolution
    const createTextTexture = (text, fontSize, color) => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      // Set HIGH resolution canvas size for crisp text - larger for long text
      canvas.width = text.length > 10 ? 8192 : 4096;
      canvas.height = 1024;
      
      // Enable better text rendering
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';
      
      // Clear canvas
      context.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw text with extra bold font and stroke for clarity
      const scaledFontSize = fontSize * 2; // Doubled size for higher res
      context.font = `900 ${scaledFontSize}px Arial Black, Arial`; // 900 = extra bold weight
      context.fillStyle = color;
      context.strokeStyle = color;
      context.lineWidth = 4;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      
      // Measure text to ensure it fits
      const metrics = context.measureText(text);
      const textWidth = metrics.width;
      
      // If text is too wide, scale it down
      if (textWidth > canvas.width * 0.9) {
        const scale = (canvas.width * 0.9) / textWidth;
        context.font = `900 ${scaledFontSize * scale}px Arial Black, Arial`;
      }
      
      // Draw stroke first for bold effect
      context.strokeText(text, canvas.width / 2, canvas.height / 2);
      // Then fill
      context.fillText(text, canvas.width / 2, canvas.height / 2);
      
      const texture = new THREE.CanvasTexture(canvas);
      texture.anisotropy = 16; // Maximum anisotropic filtering for sharp text at angles
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      
      return texture;
    };
    
    // Create COTA Banner/Poster structure in the infield
    const createBanner = (x, z, rotationY = 0) => {
      const bannerGroup = new THREE.Group();
      
      // Support poles (left and right) - metallic silver
      const poleGeometry = new THREE.CylinderGeometry(0.4, 0.4, 20, 8);
      const poleMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xcccccc,
        metalness: 0.8,
        roughness: 0.2
      });
      
      const leftPole = new THREE.Mesh(poleGeometry, poleMaterial);
      leftPole.position.set(-20, 10, 0);
      leftPole.castShadow = true;
      bannerGroup.add(leftPole);
      
      const rightPole = new THREE.Mesh(poleGeometry, poleMaterial);
      rightPole.position.set(20, 10, 0);
      rightPole.castShadow = true;
      bannerGroup.add(rightPole);
      
      // Decorative pole caps
      const capGeometry = new THREE.SphereGeometry(0.6, 16, 16);
      const capMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffaa00,
        metalness: 0.9,
        roughness: 0.1,
        emissive: 0xffaa00,
        emissiveIntensity: 0.3
      });
      
      const leftCap = new THREE.Mesh(capGeometry, capMaterial);
      leftCap.position.set(-20, 20.5, 0);
      bannerGroup.add(leftCap);
      
      const rightCap = new THREE.Mesh(capGeometry, capMaterial);
      rightCap.position.set(20, 20.5, 0);
      bannerGroup.add(rightCap);
      
      // Banner frame - glossy black
      const frameGeometry = new THREE.BoxGeometry(42, 16, 0.8);
      const frameMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x111111,
    metalness: 0.7,
        roughness: 0.3
      });
      const frame = new THREE.Mesh(frameGeometry, frameMaterial);
      frame.position.set(0, 10, 0);
      frame.castShadow = true;
      bannerGroup.add(frame);
      
      // Red/burgundy banner background (like real COTA) - FRONT SIDE
      const bannerBgGeometry = new THREE.PlaneGeometry(40, 14);
      const bannerBgMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8b1538, // Deep red/burgundy
        roughness: 0.5,
        metalness: 0.1
      });
      const bannerBgFront = new THREE.Mesh(bannerBgGeometry, bannerBgMaterial);
      bannerBgFront.position.set(0, 10, 0.45);
      bannerGroup.add(bannerBgFront);
      
      // Red/burgundy banner background - BACK SIDE
      const bannerBgBack = new THREE.Mesh(bannerBgGeometry, bannerBgMaterial.clone());
      bannerBgBack.position.set(0, 10, -0.45);
      bannerBgBack.rotation.y = Math.PI;
      bannerGroup.add(bannerBgBack);
      
      // Decorative horizontal stripes (top)
      const stripeGeometry = new THREE.PlaneGeometry(40, 0.5);
      const stripeMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x0066cc,
    roughness: 0.3,
        metalness: 0.4
      });
      
      for (let i = 0; i < 3; i++) {
        const stripeFront = new THREE.Mesh(stripeGeometry, stripeMaterial);
        stripeFront.position.set(0, 16.5 - i * 0.7, 0.46);
        bannerGroup.add(stripeFront);
        
        const stripeBack = new THREE.Mesh(stripeGeometry, stripeMaterial.clone());
        stripeBack.position.set(0, 16.5 - i * 0.7, -0.46);
        stripeBack.rotation.y = Math.PI;
        bannerGroup.add(stripeBack);
      }
      
      // COTA text on banner - FRONT SIDE (light blue/white like real COTA)
      const cotaTexture = createTextTexture('CIRCUIT OF THE', 300, '#c0d9ff');
      const cotaGeometry = new THREE.PlaneGeometry(35, 4);
      const cotaMaterial = new THREE.MeshStandardMaterial({ 
        map: cotaTexture,
        transparent: true,
        roughness: 0.2,
        emissive: 0xffffff,
        emissiveIntensity: 0.1
      });
      const cotaPlaneFront = new THREE.Mesh(cotaGeometry, cotaMaterial);
      cotaPlaneFront.position.set(0, 13, 0.5);
      bannerGroup.add(cotaPlaneFront);
      
      // COTA text on banner - BACK SIDE
      const cotaPlaneBack = new THREE.Mesh(cotaGeometry, cotaMaterial.clone());
      cotaPlaneBack.position.set(0, 13, -0.5);
      cotaPlaneBack.rotation.y = Math.PI;
      bannerGroup.add(cotaPlaneBack);
      
      // "AMERICAS" text on banner - FRONT SIDE
      const subtitleTexture = createTextTexture('AMERICAS', 400, '#c0d9ff');
      const subtitleGeometry = new THREE.PlaneGeometry(35, 7);
      const subtitleMaterial = new THREE.MeshStandardMaterial({ 
        map: subtitleTexture,
        transparent: true,
        roughness: 0.2,
        emissive: 0xffffff,
        emissiveIntensity: 0.1
      });
      const subtitlePlaneFront = new THREE.Mesh(subtitleGeometry, subtitleMaterial);
      subtitlePlaneFront.position.set(0, 9, 0.5);
      bannerGroup.add(subtitlePlaneFront);
      
      // "AMERICAS" text on banner - BACK SIDE
      const subtitlePlaneBack = new THREE.Mesh(subtitleGeometry, subtitleMaterial.clone());
      subtitlePlaneBack.position.set(0, 9, -0.5);
      subtitlePlaneBack.rotation.y = Math.PI;
      bannerGroup.add(subtitlePlaneBack);
      
      // Load and add the official F1 logo image
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load('/f1_movie_logo.png', (f1LogoTexture) => {
        f1LogoTexture.anisotropy = 16;
        
        const f1LogoGeometry = new THREE.PlaneGeometry(12, 4);
        const f1LogoMaterial = new THREE.MeshStandardMaterial({ 
          map: f1LogoTexture,
          transparent: true,
          roughness: 0.3,
          emissive: 0xffffff,
          emissiveIntensity: 0.15
        });
        
        // F1 Logo - FRONT SIDE
        const f1LogoFront = new THREE.Mesh(f1LogoGeometry, f1LogoMaterial);
        f1LogoFront.position.set(0, 5, 0.52);
        bannerGroup.add(f1LogoFront);
        
        // F1 Logo - BACK SIDE
        const f1LogoBack = new THREE.Mesh(f1LogoGeometry, f1LogoMaterial.clone());
        f1LogoBack.position.set(0, 5, -0.52);
        f1LogoBack.rotation.y = Math.PI;
        bannerGroup.add(f1LogoBack);
        
        console.log('F1 logo loaded on banner!');
      }, undefined, (error) => {
        console.error('Error loading F1 logo:', error);
      });
      
      // Add decorative lights around the frame
      const lightGeometry = new THREE.SphereGeometry(0.3, 8, 8);
      const lightMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffff00,
        emissive: 0xffff00,
        emissiveIntensity: 0.8
      });
      
      for (let i = -19; i <= 19; i += 4) {
        // Top lights
        const topLight = new THREE.Mesh(lightGeometry, lightMaterial);
        topLight.position.set(i, 18.2, 0);
        bannerGroup.add(topLight);
        
        // Bottom lights
        const bottomLight = new THREE.Mesh(lightGeometry, lightMaterial);
        bottomLight.position.set(i, 1.8, 0);
        bannerGroup.add(bottomLight);
      }
      
      // Position the banner group
      bannerGroup.position.set(x, 0, z);
      bannerGroup.rotation.y = rotationY;
      
      return bannerGroup;
    };
    
    // Add banner in the center of the infield
    const banner1 = createBanner(-30, -15, Math.PI / 4); // Angled for better visibility
    scene.add(banner1);
    
    console.log('Track banner added!');

    // Load the realistic Ferrari F1 models - 3 cars with different colors
    let cars = []; // Array to store all 3 cars
    const carColors = [
      { name: 'Black', color: 0x1a1a1a, startPosition: startFinishPosition },      // Original car at start line
      { name: 'Red', color: 0xff0000, startPosition: startFinishPosition + 0.06 },        // Red car ahead with more space
      { name: 'Blue', color: 0x00aaff, startPosition: startFinishPosition + 0.12 }        // Blue car just ahead of red
    ];
    
    const loader = new GLTFLoader();
    
    // Load the model once and clone it for each car
    loader.load(
      '/scene.gltf',
      (gltf) => {
        // Create 3 cars with different colors
        carColors.forEach((carConfig, index) => {
          const carClone = gltf.scene.clone();
          
          // Scale and position
          carClone.scale.set(2.5, 2.5, 2.5);
          carClone.position.y = 0.8;
          carClone.rotation.y = 0;
          
          // Store wheels for this car
          const carWheels = [];
          
          // Traverse and modify materials
          carClone.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              
              // Identify wheels
              const name = child.name.toLowerCase();
              if (name.includes('wheel') || name.includes('tire') || name.includes('rim')) {
                carWheels.push(child);
              }
              
              // Clone material and change color for car body
              if (child.material) {
                child.material = child.material.clone();
                
                // Change car body color (not wheels/tires/brakes)
                if (!name.includes('wheel') && !name.includes('tire') && 
                    !name.includes('rim') && !name.includes('brake') &&
                    !name.includes('caliper') && !name.includes('disc')) {
                  
                  // Change base color while preserving textures
                  if (child.material.color) {
                    const originalColor = child.material.color.getHex();
                    // Only change if it's not already black (tires) or yellow (calipers)
                    if (originalColor !== 0x000000 && originalColor !== 0xffdd00) {
                      // Use color as a tint - this multiplies with textures
                      // For non-black cars, tint the texture with the desired color
                      if (carConfig.color !== 0x1a1a1a) {
                        // Add emissive color to make the color more visible while keeping textures
                        child.material.emissive = new THREE.Color(carConfig.color);
                        child.material.emissiveIntensity = 0.4; // Subtle glow effect
                        // Keep original color but brighten it
                        child.material.color.setHex(carConfig.color);
                      } else {
                        child.material.color.setHex(carConfig.color);
                      }
                    }
                  }
                }
                
                // Enhance materials
                child.material.envMapIntensity = 2.0;
                child.material.roughness = Math.min(child.material.roughness, 0.3);
                child.material.metalness = Math.max(child.material.metalness, 0.8);
                child.material.needsUpdate = true;
                
                // Enable anisotropic filtering (keep textures sharp)
                if (child.material.map) {
                  child.material.map.anisotropy = renderer.capabilities.getMaxAnisotropy();
                  child.material.map.needsUpdate = true;
                }
              }
            }
          });
          
          // Store car data
          cars.push({
            model: carClone,
            wheels: carWheels,
            trackProgress: carConfig.startPosition,
            color: carConfig.name
          });
          
          scene.add(carClone);
          console.log(`${carConfig.name} F1 car loaded! Found ${carWheels.length} wheels`);
        });
        
        console.log('All 3 F1 cars loaded successfully!');
      },
      (progress) => {
        const percentComplete = progress.total > 0 ? (progress.loaded / progress.total * 100).toFixed(2) : 0;
        console.log('Loading F1 model...', percentComplete + '%');
      },
      (error) => {
        console.error('Error loading F1 car model:', error);
      }
    );

    // Fallback function to create a simple car if model loading fails
    const createFallbackCar = () => {
      const fallbackCar = new THREE.Group();
      const bodyGeometry = new THREE.BoxGeometry(1.5, 0.5, 3.5);
      const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xdc0000 });
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      body.castShadow = true;
      fallbackCar.add(body);
      return fallbackCar;
    };

    // Original procedural car creation (kept for reference, not used)
    const createF1Car = () => {
  const car = new THREE.Group()

  // === MATERIALS ===
  // Ferrari Red - glossy, realistic paint
  const ferrariRedMaterial = new THREE.MeshStandardMaterial({
    color: 0xdc0000,
    metalness: 0.9,
    roughness: 0.05,
    envMapIntensity: 2.0,
  })

  // White glossy material
  const whiteMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.85,
    roughness: 0.1,
    envMapIntensity: 1.8,
  })

  // Carbon fiber black
  const carbonMaterial = new THREE.MeshStandardMaterial({
    color: 0x0a0a0a,
    metalness: 0.7,
    roughness: 0.3,
    envMapIntensity: 1.2,
  })

  // Shell yellow
  const shellYellowMaterial = new THREE.MeshStandardMaterial({
    color: 0xffd700,
    metalness: 0.75,
    roughness: 0.25,
    envMapIntensity: 1.4,
  })

  // Santander red
  const santanderRedMaterial = new THREE.MeshStandardMaterial({
    color: 0xee0000,
    metalness: 0.65,
    roughness: 0.35,
  })

  // === MAIN BODY ===
  const bodyShape = new THREE.Shape()
  bodyShape.moveTo(-0.85, -0.18)
  bodyShape.lineTo(0.85, -0.18)
  bodyShape.quadraticCurveTo(0.95, -0.18, 0.95, -0.08)
  bodyShape.lineTo(0.95, 0.18)
  bodyShape.quadraticCurveTo(0.95, 0.28, 0.85, 0.28)
  bodyShape.lineTo(-0.85, 0.28)
  bodyShape.quadraticCurveTo(-0.95, 0.28, -0.95, 0.18)
  bodyShape.lineTo(-0.95, -0.08)
  bodyShape.quadraticCurveTo(-0.95, -0.18, -0.85, -0.18)

  const extrudeSettings = {
    steps: 25,
    depth: 3.8,
    bevelEnabled: true,
    bevelThickness: 0.06,
    bevelSize: 0.06,
    bevelSegments: 8,
  }

  const bodyGeometry = new THREE.ExtrudeGeometry(bodyShape, extrudeSettings)
  const body = new THREE.Mesh(bodyGeometry, ferrariRedMaterial)
  body.position.set(0, 0.35, -1.9)
  body.castShadow = true
  body.receiveShadow = true
  car.add(body)

  // === WHITE ENGINE COVER STRIPE ===
  const stripeGeometry = new THREE.BoxGeometry(0.35, 0.025, 2.0, 1, 1, 20)
  const centerStripe = new THREE.Mesh(stripeGeometry, whiteMaterial)
  centerStripe.position.set(0, 0.72, -0.7)
  car.add(centerStripe)

  // === SHELL SPONSORS (Yellow) ===
  const shellLogoGeometry = new THREE.BoxGeometry(0.02, 0.2, 0.8, 1, 5, 8)
  const shellLogo1 = new THREE.Mesh(shellLogoGeometry, shellYellowMaterial)
  shellLogo1.position.set(-0.98, 0.45, 0.7)
  car.add(shellLogo1)

  const shellLogo2 = new THREE.Mesh(shellLogoGeometry, shellYellowMaterial)
  shellLogo2.position.set(0.98, 0.45, 0.7)
  car.add(shellLogo2)

  // Shell logo on top of sidepods
  const shellTopGeometry = new THREE.BoxGeometry(0.5, 0.02, 0.6, 8, 1, 8)
  const shellTop1 = new THREE.Mesh(shellTopGeometry, shellYellowMaterial)
  shellTop1.position.set(-1.1, 0.63, 0.5)
  car.add(shellTop1)

  const shellTop2 = new THREE.Mesh(shellTopGeometry, shellYellowMaterial)
  shellTop2.position.set(1.1, 0.63, 0.5)
  car.add(shellTop2)

  // === SANTANDER SPONSORS (Red/White) ===
  const santanderGeometry = new THREE.BoxGeometry(0.02, 0.25, 0.5, 1, 5, 5)
  const santander1 = new THREE.Mesh(santanderGeometry, santanderRedMaterial)
  santander1.position.set(-0.98, 0.52, -0.6)
  car.add(santander1)

  const santander2 = new THREE.Mesh(santanderGeometry, santanderRedMaterial)
  santander2.position.set(0.98, 0.52, -0.6)
  car.add(santander2)

  // White Santander text area
  const santanderWhiteGeometry = new THREE.BoxGeometry(0.02, 0.12, 0.45, 1, 3, 5)
  const santanderWhite1 = new THREE.Mesh(santanderWhiteGeometry, whiteMaterial)
  santanderWhite1.position.set(-0.985, 0.46, -0.6)
  car.add(santanderWhite1)

  const santanderWhite2 = new THREE.Mesh(santanderWhiteGeometry, whiteMaterial)
  santanderWhite2.position.set(0.985, 0.46, -0.6)
  car.add(santanderWhite2)

  const haloGeometry = new THREE.TorusGeometry(0.5, 0.045, 16, 48, Math.PI)
  const haloMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    metalness: 0.98,
    roughness: 0.02,
    envMapIntensity: 2.0,
  })
  const halo = new THREE.Mesh(haloGeometry, haloMaterial)
  halo.rotation.x = Math.PI / 2
  halo.rotation.z = Math.PI
  halo.position.set(0, 0.95, -0.3)
  halo.castShadow = true
  car.add(halo)

  // Halo center support with detail
  const haloSupportGeometry = new THREE.CylinderGeometry(0.045, 0.05, 0.35, 16)
  const haloSupport = new THREE.Mesh(haloSupportGeometry, haloMaterial)
  haloSupport.position.set(0, 0.78, -0.3)
  haloSupport.castShadow = true
  car.add(haloSupport)

  const cockpitGeometry = new THREE.BoxGeometry(1.2, 0.4, 1.7, 10, 5, 15)
  const cockpitMaterial = new THREE.MeshStandardMaterial({
    color: 0x050505,
    metalness: 0.4,
    roughness: 0.5,
    envMapIntensity: 1.5,
  })
  const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial)
  cockpit.position.y = 0.73
  cockpit.position.z = -0.3
  cockpit.castShadow = true
  cockpit.receiveShadow = true
  car.add(cockpit)

  // Cockpit rim detail
  const cockpitRimGeometry = new THREE.TorusGeometry(0.65, 0.02, 8, 32, Math.PI * 2)
  const cockpitRim = new THREE.Mesh(cockpitRimGeometry, haloMaterial)
  cockpitRim.rotation.x = Math.PI / 2
  cockpitRim.position.set(0, 0.93, -0.3)
  car.add(cockpitRim)

  // === NOSE (Red with white tip) ===
  const noseGeometry = new THREE.ConeGeometry(0.3, 2.0, 32, 12)
  const nose = new THREE.Mesh(noseGeometry, ferrariRedMaterial)
  nose.rotation.x = Math.PI / 2
  nose.position.y = 0.32
  nose.position.z = 2.7
  nose.castShadow = true
  car.add(nose)

  // White nose tip
  const noseTipGeometry = new THREE.ConeGeometry(0.15, 0.5, 24, 8)
  const noseTip = new THREE.Mesh(noseTipGeometry, whiteMaterial)
  noseTip.rotation.x = Math.PI / 2
  noseTip.position.y = 0.32
  noseTip.position.z = 3.45
  noseTip.castShadow = true
  car.add(noseTip)

  // Nose camera mount
  const cameraMountGeometry = new THREE.CylinderGeometry(0.04, 0.06, 0.15, 16)
  const cameraMountMaterial = new THREE.MeshStandardMaterial({
    color: 0x000000,
    metalness: 0.85,
    roughness: 0.15,
  })
  const cameraMount = new THREE.Mesh(cameraMountGeometry, cameraMountMaterial)
  cameraMount.position.set(0, 0.25, 3.5)
  car.add(cameraMount)

  // Camera lens
  const cameraGeometry = new THREE.SphereGeometry(0.06, 16, 16)
  const cameraMaterial = new THREE.MeshStandardMaterial({
    color: 0x000000,
    metalness: 0.9,
    roughness: 0.1,
  })
  const camera = new THREE.Mesh(cameraGeometry, cameraMaterial)
  camera.position.set(0, 0.32, 3.52)
  car.add(camera)

  // === FRONT WING (White with black carbon elements) ===
  const frontWingWhiteMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.88,
    roughness: 0.12,
    envMapIntensity: 1.6,
  })

  // Main front wing elements - white
  const frontWingCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.3, 0, 0),
    new THREE.Vector3(-0.65, 0.06, 0),
    new THREE.Vector3(0, 0.09, 0),
    new THREE.Vector3(0.65, 0.06, 0),
    new THREE.Vector3(1.3, 0, 0),
  ])

  const frontWingGeometry = new THREE.TubeGeometry(frontWingCurve, 24, 0.16, 8, false)
  const frontWing1 = new THREE.Mesh(frontWingGeometry, frontWingWhiteMaterial)
  frontWing1.position.set(0, 0.14, 2.85)
  frontWing1.rotation.x = -0.12
  frontWing1.castShadow = true
  car.add(frontWing1)

  // Second wing element - white
  const frontWing2 = new THREE.Mesh(frontWingGeometry, frontWingWhiteMaterial)
  frontWing2.position.set(0, 0.24, 2.65)
  frontWing2.rotation.x = -0.16
  frontWing2.scale.set(0.96, 0.85, 1)
  frontWing2.castShadow = true
  car.add(frontWing2)

  // Third wing element - black carbon
  const frontWingBlackMaterial = new THREE.MeshStandardMaterial({
    color: 0x0a0a0a,
    metalness: 0.88,
    roughness: 0.12,
    envMapIntensity: 1.4,
  })
  const frontWing3 = new THREE.Mesh(frontWingGeometry, frontWingBlackMaterial)
  frontWing3.position.set(0, 0.32, 2.5)
  frontWing3.rotation.x = -0.19
  frontWing3.scale.set(0.92, 0.75, 1)
  frontWing3.castShadow = true
  car.add(frontWing3)

  const endplateShape = new THREE.Shape()
  endplateShape.moveTo(0, 0)
  endplateShape.lineTo(0, 0.35)
  endplateShape.quadraticCurveTo(0.05, 0.4, 0.1, 0.4)
  endplateShape.lineTo(0.5, 0.35)
  endplateShape.lineTo(0.5, 0)
  endplateShape.lineTo(0, 0)

  const endplateGeometry = new THREE.ExtrudeGeometry(endplateShape, {
    steps: 1,
    depth: 0.08,
    bevelEnabled: true,
    bevelThickness: 0.01,
    bevelSize: 0.01,
    bevelSegments: 3,
  })

  const endplate1 = new THREE.Mesh(endplateGeometry, carbonMaterial)
  endplate1.position.set(-1.24, 0.12, 2.5)
  endplate1.castShadow = true
  car.add(endplate1)

  const endplate2 = new THREE.Mesh(endplateGeometry, carbonMaterial)
  endplate2.position.set(1.16, 0.12, 2.5)
  endplate2.castShadow = true
  car.add(endplate2)

  // === SIDEPODS (Ferrari Red with sculpted details) ===
  const sidePodGeometry = new THREE.BoxGeometry(0.7, 0.48, 2.2, 10, 6, 22)
  const sidePod1 = new THREE.Mesh(sidePodGeometry, ferrariRedMaterial)
  sidePod1.position.set(-1.15, 0.38, 0.1)
  sidePod1.castShadow = true
  sidePod1.receiveShadow = true
  car.add(sidePod1)

  const sidePod2 = new THREE.Mesh(sidePodGeometry, ferrariRedMaterial)
  sidePod2.position.set(1.15, 0.38, 0.1)
  sidePod2.castShadow = true
  sidePod2.receiveShadow = true
  car.add(sidePod2)

  // Side pod undercut detail
  const undercutGeometry = new THREE.BoxGeometry(0.55, 0.15, 1.8, 5, 2, 15)
  const undercut1 = new THREE.Mesh(undercutGeometry, carbonMaterial)
  undercut1.position.set(-1.1, 0.25, 0)
  car.add(undercut1)

  const undercut2 = new THREE.Mesh(undercutGeometry, carbonMaterial)
  undercut2.position.set(1.1, 0.25, 0)
  car.add(undercut2)

  const intakeGeometry = new THREE.BoxGeometry(0.52, 0.32, 0.12, 5, 5, 1)
  const intakeMaterial = new THREE.MeshStandardMaterial({
    color: 0x000000,
    metalness: 0.2,
    roughness: 0.8,
  })

  const intake1 = new THREE.Mesh(intakeGeometry, intakeMaterial)
  intake1.position.set(-1.1, 0.45, 0.55)
  car.add(intake1)

  const intake2 = new THREE.Mesh(intakeGeometry, intakeMaterial)
  intake2.position.set(1.1, 0.45, 0.55)
  car.add(intake2)

  // Intake grille detail
  const grilleGeometry = new THREE.PlaneGeometry(0.45, 0.25, 8, 5)
  const grilleMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    metalness: 0.6,
    roughness: 0.4,
    wireframe: true,
  })

  const grille1 = new THREE.Mesh(grilleGeometry, grilleMaterial)
  grille1.position.set(-1.1, 0.45, 0.62)
  car.add(grille1)

  const grille2 = new THREE.Mesh(grilleGeometry, grilleMaterial)
  grille2.position.set(1.1, 0.45, 0.62)
  car.add(grille2)

  // === ENGINE COVER (Ferrari Red) ===
  const engineCoverGeometry = new THREE.BoxGeometry(1.08, 0.4, 1.7, 12, 6, 18)
  const engineCover = new THREE.Mesh(engineCoverGeometry, ferrariRedMaterial)
  engineCover.position.set(0, 0.64, -0.85)
  engineCover.castShadow = true
  engineCover.receiveShadow = true
  car.add(engineCover)

  // Engine cover spine detail
  const spineGeometry = new THREE.BoxGeometry(0.15, 0.05, 1.5, 2, 1, 15)
  const spine = new THREE.Mesh(spineGeometry, carbonMaterial)
  spine.position.set(0, 0.82, -0.8)
  car.add(spine)

  const topIntakeGeometry = new THREE.BoxGeometry(0.65, 0.45, 0.55, 8, 5, 5)
  const topIntake = new THREE.Mesh(topIntakeGeometry, intakeMaterial)
  topIntake.position.set(0, 0.88, -0.45)
  topIntake.castShadow = true
  car.add(topIntake)

  // Intake roll hoop structure
  const rollHoopGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.5, 16)
  const rollHoop1 = new THREE.Mesh(rollHoopGeometry, haloMaterial)
  rollHoop1.position.set(-0.25, 1.05, -0.45)
  rollHoop1.castShadow = true
  car.add(rollHoop1)

  const rollHoop2 = new THREE.Mesh(rollHoopGeometry, haloMaterial)
  rollHoop2.position.set(0.25, 1.05, -0.45)
  rollHoop2.castShadow = true
  car.add(rollHoop2)

  const rearWingMaterial = new THREE.MeshStandardMaterial({
    color: 0x0a0a0a,
    metalness: 0.9,
    roughness: 0.1,
    envMapIntensity: 1.5,
  })

  const rearWingGeometry = new THREE.BoxGeometry(2.3, 0.1, 0.65, 20, 1, 8)
  const rearWing = new THREE.Mesh(rearWingGeometry, rearWingMaterial)
  rearWing.position.y = 1.32
  rearWing.position.z = -2.2
  rearWing.rotation.x = -0.05
  rearWing.castShadow = true
  car.add(rearWing)

  // DRS flap with detail
  const drsGeometry = new THREE.BoxGeometry(2.3, 0.08, 0.45, 20, 1, 6)
  const drs = new THREE.Mesh(drsGeometry, rearWingMaterial)
  drs.position.y = 1.52
  drs.position.z = -2.2
  drs.rotation.x = -0.03
  drs.castShadow = true
  car.add(drs)

  // Wing endplates
  const wingEndplateGeometry = new THREE.BoxGeometry(0.08, 0.35, 0.7, 1, 5, 8)
  const wingEndplate1 = new THREE.Mesh(wingEndplateGeometry, carbonMaterial)
  wingEndplate1.position.set(-1.15, 1.35, -2.2)
  wingEndplate1.castShadow = true
  car.add(wingEndplate1)

  const wingEndplate2 = new THREE.Mesh(wingEndplateGeometry, carbonMaterial)
  wingEndplate2.position.set(1.15, 1.35, -2.2)
  wingEndplate2.castShadow = true
  car.add(wingEndplate2)

  const supportGeometry = new THREE.CylinderGeometry(0.045, 0.05, 0.85, 16)
  const supportMaterial = new THREE.MeshStandardMaterial({
    color: 0x0a0a0a,
    metalness: 0.95,
    roughness: 0.05,
    envMapIntensity: 1.8,
  })

  const support1 = new THREE.Mesh(supportGeometry, supportMaterial)
  support1.position.set(-0.9, 0.9, -2.2)
  support1.castShadow = true
  car.add(support1)

  const support2 = new THREE.Mesh(supportGeometry, supportMaterial)
  support2.position.set(0.9, 0.9, -2.2)
  support2.castShadow = true
  car.add(support2)

  const diffuserGeometry = new THREE.BoxGeometry(1.65, 0.18, 0.85, 15, 2, 8)
  const diffuserMaterial = new THREE.MeshStandardMaterial({
    color: 0x050505,
    metalness: 0.4,
    roughness: 0.6,
  })
  const diffuser = new THREE.Mesh(diffuserGeometry, diffuserMaterial)
  diffuser.position.set(0, 0.16, -1.8)
  diffuser.rotation.x = 0.25
  diffuser.castShadow = true
  car.add(diffuser)

  // Diffuser channels
  for (let i = -2; i <= 2; i++) {
    const channelGeometry = new THREE.BoxGeometry(0.08, 0.15, 0.8, 1, 2, 8)
    const channel = new THREE.Mesh(channelGeometry, carbonMaterial)
    channel.position.set(i * 0.3, 0.18, -1.8)
    channel.rotation.x = 0.25
    car.add(channel)
  }

  // === TIRES & WHEELS WITH PIRELLI BRANDING ===
  const tireGeometry = new THREE.CylinderGeometry(0.44, 0.44, 0.34, 64, 6)
  const tireMaterial = new THREE.MeshStandardMaterial({
    color: 0x0a0a0a,
    metalness: 0.08,
    roughness: 0.98,
  })

  // Pirelli yellow sidewall branding
  const pirelliYellowGeometry = new THREE.TorusGeometry(0.44, 0.04, 12, 64)
  const pirelliYellowMaterial = new THREE.MeshStandardMaterial({
    color: 0xffdd00,
    metalness: 0.3,
    roughness: 0.7,
    emissive: 0x442200,
    emissiveIntensity: 0.2,
  })

  // Tire sidewall detail (black grooves)
  const sidewallGeometry = new THREE.TorusGeometry(0.44, 0.03, 16, 64)
  const sidewallMaterial = new THREE.MeshStandardMaterial({
    color: 0x050505,
    metalness: 0.1,
    roughness: 0.95,
  })

  // Ultra realistic silver rims
  const rimBaseGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.36, 64)
  const rimMaterial = new THREE.MeshStandardMaterial({
    color: 0xe0e0e0,
    metalness: 0.98,
    roughness: 0.02,
    envMapIntensity: 2.2,
  })

  // Ferrari brake calipers (yellow/gold)
  const brakeGeometry = new THREE.CylinderGeometry(0.24, 0.24, 0.07, 48)
  const brakeMaterial = new THREE.MeshStandardMaterial({
    color: 0xee3300,
    metalness: 0.88,
    roughness: 0.22,
    emissive: 0x551100,
    emissiveIntensity: 0.25,
  })

  const wheelPositions = [
    { x: -1.1, z: 1.5 },
    { x: 1.1, z: 1.5 },
    { x: -1.1, z: -1.5 },
    { x: 1.1, z: -1.5 },
  ]

  wheelPositions.forEach((pos) => {
    const wheelGroup = new THREE.Group()

    // Tire main body
    const tire = new THREE.Mesh(tireGeometry, tireMaterial)
    tire.rotation.z = Math.PI / 2
    tire.castShadow = true
    tire.receiveShadow = true
    wheelGroup.add(tire)

    // === PIRELLI YELLOW BRANDING (outer sidewall) ===
    const pirelliOuter = new THREE.Mesh(pirelliYellowGeometry, pirelliYellowMaterial)
    pirelliOuter.rotation.y = Math.PI / 2
    pirelliOuter.position.x = pos.x > 0 ? -0.15 : 0.15
    wheelGroup.add(pirelliOuter)

    // === PIRELLI YELLOW BRANDING (inner sidewall) ===
    const pirelliInner = new THREE.Mesh(pirelliYellowGeometry, pirelliYellowMaterial)
    pirelliInner.rotation.y = Math.PI / 2
    pirelliInner.position.x = pos.x > 0 ? 0.15 : -0.15
    wheelGroup.add(pirelliInner)

    // Black tire sidewall grooves (outer)
    const sidewall1 = new THREE.Mesh(sidewallGeometry, sidewallMaterial)
    sidewall1.rotation.y = Math.PI / 2
    sidewall1.position.x = pos.x > 0 ? -0.12 : 0.12
    wheelGroup.add(sidewall1)

    // Black tire sidewall grooves (inner)
    const sidewall2 = new THREE.Mesh(sidewallGeometry, sidewallMaterial)
    sidewall2.rotation.y = Math.PI / 2
    sidewall2.position.x = pos.x > 0 ? 0.12 : -0.12
    wheelGroup.add(sidewall2)

    // Rim base
    const rimBase = new THREE.Mesh(rimBaseGeometry, rimMaterial)
    rimBase.rotation.z = Math.PI / 2
    rimBase.castShadow = true
    wheelGroup.add(rimBase)

    // === RIM SPOKES (Ferrari style - 10 spoke design) ===
    const spokeGeometry = new THREE.BoxGeometry(0.09, 0.38, 0.3, 2, 6, 4)
    const spokeMaterial = new THREE.MeshStandardMaterial({
      color: 0xc0c0c0,
      metalness: 0.97,
      roughness: 0.03,
      envMapIntensity: 2.0,
    })

    // Create 10 spokes in a star pattern (realistic Ferrari rim)
    for (let i = 0; i < 10; i++) {
      const spoke = new THREE.Mesh(spokeGeometry, spokeMaterial)
      spoke.rotation.z = Math.PI / 2
      spoke.rotation.x = (i * Math.PI * 2) / 10
      spoke.castShadow = true
      wheelGroup.add(spoke)
    }

    // Center hub with Ferrari styling (silver/chrome)
    const hubGeometry = new THREE.CylinderGeometry(0.11, 0.11, 0.38, 32)
    const hubMaterial = new THREE.MeshStandardMaterial({
      color: 0xd0d0d0,
      metalness: 0.95,
      roughness: 0.08,
      envMapIntensity: 1.9,
    })
    const hub = new THREE.Mesh(hubGeometry, hubMaterial)
    hub.rotation.z = Math.PI / 2
    hub.castShadow = true
    wheelGroup.add(hub)

    // Hub nut detail (hexagonal)
    const hubNutGeometry = new THREE.CylinderGeometry(0.065, 0.065, 0.4, 6)
    const hubNut = new THREE.Mesh(hubNutGeometry, spokeMaterial)
    hubNut.rotation.z = Math.PI / 2
    wheelGroup.add(hubNut)

    // Ferrari prancing horse center cap
    const centerCapGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.42, 24)
    const centerCapMaterial = new THREE.MeshStandardMaterial({
      color: 0xffdd00,
      metalness: 0.85,
      roughness: 0.15,
      emissive: 0x332200,
      emissiveIntensity: 0.15,
    })
    const centerCap = new THREE.Mesh(centerCapGeometry, centerCapMaterial)
    centerCap.rotation.z = Math.PI / 2
    wheelGroup.add(centerCap)

    // Rim lip with detail
    const rimLipGeometry = new THREE.TorusGeometry(0.28, 0.025, 12, 48)
    const rimLip = new THREE.Mesh(rimLipGeometry, rimMaterial)
    rimLip.rotation.y = Math.PI / 2
    rimLip.position.x = pos.x > 0 ? -0.17 : 0.17
    wheelGroup.add(rimLip)

    // Brake disc with detail
    const brake = new THREE.Mesh(brakeGeometry, brakeMaterial)
    brake.rotation.z = Math.PI / 2
    brake.position.x = pos.x > 0 ? -0.19 : 0.19
    brake.castShadow = true
    wheelGroup.add(brake)

    // Brake disc holes for cooling
    const holeGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.07, 8)
    const holeMaterial = new THREE.MeshStandardMaterial({
      color: 0x000000,
      metalness: 0.5,
      roughness: 0.5,
    })

    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI * 2) / 12
      const hole = new THREE.Mesh(holeGeometry, holeMaterial)
      hole.rotation.z = Math.PI / 2
      hole.position.set(pos.x > 0 ? -0.19 : 0.19, Math.cos(angle) * 0.15, Math.sin(angle) * 0.15)
      wheelGroup.add(hole)
    }

    // === FERRARI BRAKE CALIPERS (Yellow/Gold with Brembo branding) ===
    const caliperGeometry = new THREE.BoxGeometry(0.11, 0.2, 0.15, 3, 4, 3)
    const caliperMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.8,
      roughness: 0.2,
      envMapIntensity: 1.5,
    })
    const caliper = new THREE.Mesh(caliperGeometry, caliperMaterial)
    caliper.position.set(pos.x > 0 ? -0.26 : 0.26, 0.18, 0)
    caliper.castShadow = true
    wheelGroup.add(caliper)

    // Caliper piston details
    const pistonGeometry = new THREE.CylinderGeometry(0.028, 0.028, 0.045, 16)
    const pistonMaterial = new THREE.MeshStandardMaterial({
      color: 0x303030,
      metalness: 0.9,
      roughness: 0.15,
    })
    for (let i = 0; i < 4; i++) {
      const piston = new THREE.Mesh(pistonGeometry, pistonMaterial)
      piston.rotation.x = Math.PI / 2
      piston.position.set(pos.x > 0 ? -0.24 : 0.24, 0.11 + i * 0.045, 0)
      wheelGroup.add(piston)
    }

    wheelGroup.position.set(pos.x, 0.4, pos.z)
    car.add(wheelGroup)
  })

  const exhaustGeometry = new THREE.CylinderGeometry(0.065, 0.07, 0.35, 24)
  const exhaustMaterial = new THREE.MeshStandardMaterial({
    color: 0x2a2a2a,
    metalness: 0.95,
    roughness: 0.15,
    emissive: 0x220000,
    emissiveIntensity: 0.2,
  })

  const exhaust1 = new THREE.Mesh(exhaustGeometry, exhaustMaterial)
  exhaust1.rotation.x = Math.PI / 2
  exhaust1.position.set(-0.3, 0.52, -2.52)
  exhaust1.castShadow = true
  car.add(exhaust1)

  const exhaust2 = new THREE.Mesh(exhaustGeometry, exhaustMaterial)
  exhaust2.rotation.x = Math.PI / 2
  exhaust2.position.set(0.3, 0.52, -2.52)
  exhaust2.castShadow = true
  car.add(exhaust2)

  // Exhaust heat shield
  const heatShieldGeometry = new THREE.TorusGeometry(0.075, 0.01, 8, 24)
  const heatShield1 = new THREE.Mesh(heatShieldGeometry, carbonMaterial)
  heatShield1.rotation.x = Math.PI / 2
  heatShield1.position.set(-0.3, 0.52, -2.4)
  car.add(heatShield1)

  const heatShield2 = new THREE.Mesh(heatShieldGeometry, carbonMaterial)
  heatShield2.rotation.x = Math.PI / 2
  heatShield2.position.set(0.3, 0.52, -2.4)
  car.add(heatShield2)

  const lightGeometry = new THREE.BoxGeometry(0.18, 0.1, 0.06, 3, 2, 1)
  const lightMaterial = new THREE.MeshStandardMaterial({
    color: 0xff0000,
    metalness: 0.6,
    roughness: 0.2,
    emissive: 0xff0000,
    emissiveIntensity: 0.8,
    transparent: true,
    opacity: 0.9,
  })

  const light1 = new THREE.Mesh(lightGeometry, lightMaterial)
  light1.position.set(-0.75, 0.68, -2.42)
  car.add(light1)

  const light2 = new THREE.Mesh(lightGeometry, lightMaterial)
  light2.position.set(0.75, 0.68, -2.42)
  car.add(light2)

  // Light glow effect
  const glowGeometry = new THREE.SphereGeometry(0.08, 16, 16)
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    transparent: true,
    opacity: 0.4,
  })

  const glow1 = new THREE.Mesh(glowGeometry, glowMaterial)
  glow1.position.set(-0.75, 0.68, -2.45)
  car.add(glow1)

  const glow2 = new THREE.Mesh(glowGeometry, glowMaterial)
  glow2.position.set(0.75, 0.68, -2.45)
  car.add(glow2)

  // Barge boards
  const bargeboardGeometry = new THREE.BoxGeometry(0.15, 0.3, 0.6, 2, 5, 8)
  const bargeboard1 = new THREE.Mesh(bargeboardGeometry, carbonMaterial)
  bargeboard1.position.set(-0.85, 0.3, 1.2)
  bargeboard1.rotation.y = -0.3
  bargeboard1.castShadow = true
  car.add(bargeboard1)

  const bargeboard2 = new THREE.Mesh(bargeboardGeometry, carbonMaterial)
  bargeboard2.position.set(0.85, 0.3, 1.2)
  bargeboard2.rotation.y = 0.3
  bargeboard2.castShadow = true
  car.add(bargeboard2)

  // Floor edge detail
  const floorGeometry = new THREE.BoxGeometry(1.8, 0.02, 3.2, 15, 1, 30)
  const floor = new THREE.Mesh(floorGeometry, carbonMaterial)
  floor.position.set(0, 0.1, 0)
  car.add(floor)

  // Rear crash structure
  const crashStructureGeometry = new THREE.BoxGeometry(0.8, 0.25, 0.3, 8, 3, 3)
  const crashStructure = new THREE.Mesh(crashStructureGeometry, carbonMaterial)
  crashStructure.position.set(0, 0.45, -2.5)
  crashStructure.castShadow = true
  car.add(crashStructure)

  // === SIDE MIRRORS ===
  // Mirror stalks
  const mirrorStalkGeometry = new THREE.CylinderGeometry(0.025, 0.025, 0.25, 12)
  const mirrorStalkMaterial = new THREE.MeshStandardMaterial({
    color: 0x0a0a0a,
    metalness: 0.9,
    roughness: 0.1,
  })

  const mirrorStalk1 = new THREE.Mesh(mirrorStalkGeometry, mirrorStalkMaterial)
  mirrorStalk1.rotation.z = -Math.PI / 6
  mirrorStalk1.position.set(-0.7, 0.85, -0.2)
  car.add(mirrorStalk1)

  const mirrorStalk2 = new THREE.Mesh(mirrorStalkGeometry, mirrorStalkMaterial)
  mirrorStalk2.rotation.z = Math.PI / 6
  mirrorStalk2.position.set(0.7, 0.85, -0.2)
  car.add(mirrorStalk2)

  // Mirror housings
  const mirrorHousingGeometry = new THREE.BoxGeometry(0.12, 0.08, 0.18, 3, 2, 4)
  const mirrorHousing1 = new THREE.Mesh(mirrorHousingGeometry, carbonMaterial)
  mirrorHousing1.position.set(-0.85, 0.95, -0.15)
  mirrorHousing1.castShadow = true
  car.add(mirrorHousing1)

  const mirrorHousing2 = new THREE.Mesh(mirrorHousingGeometry, carbonMaterial)
  mirrorHousing2.position.set(0.85, 0.95, -0.15)
  mirrorHousing2.castShadow = true
  car.add(mirrorHousing2)

  // Mirror glass
  const mirrorGlassGeometry = new THREE.BoxGeometry(0.02, 0.07, 0.15, 1, 2, 3)
  const mirrorGlassMaterial = new THREE.MeshStandardMaterial({
    color: 0x88ccff,
    metalness: 0.95,
    roughness: 0.05,
    envMapIntensity: 2.5,
  })
  const mirrorGlass1 = new THREE.Mesh(mirrorGlassGeometry, mirrorGlassMaterial)
  mirrorGlass1.position.set(-0.91, 0.95, -0.15)
  car.add(mirrorGlass1)

  const mirrorGlass2 = new THREE.Mesh(mirrorGlassGeometry, mirrorGlassMaterial)
  mirrorGlass2.position.set(0.91, 0.95, -0.15)
  car.add(mirrorGlass2)

  // === PITOT TUBE / ANTENNA (aerodynamic sensor) ===
  const pitotGeometry = new THREE.CylinderGeometry(0.015, 0.015, 0.45, 12)
  const pitot = new THREE.Mesh(pitotGeometry, carbonMaterial)
  pitot.rotation.x = Math.PI / 2
  pitot.position.set(0, 0.32, 2.0)
  car.add(pitot)

  // Pitot tip
  const pitotTipGeometry = new THREE.ConeGeometry(0.02, 0.08, 12)
  const pitotTip = new THREE.Mesh(pitotTipGeometry, carbonMaterial)
  pitotTip.rotation.x = Math.PI / 2
  pitotTip.position.set(0, 0.32, 2.22)
  car.add(pitotTip)

  // === T-CAM (top camera mount) ===
  const tcamBaseGeometry = new THREE.BoxGeometry(0.15, 0.08, 0.12, 3, 2, 3)
  const tcamBase = new THREE.Mesh(tcamBaseGeometry, shellYellowMaterial)
  tcamBase.position.set(0, 1.12, -0.6)
  tcamBase.castShadow = true
  car.add(tcamBase)

  // T-cam camera
  const tcamCameraGeometry = new THREE.BoxGeometry(0.12, 0.06, 0.08, 3, 2, 2)
  const tcamCamera = new THREE.Mesh(tcamCameraGeometry, carbonMaterial)
  tcamCamera.position.set(0, 1.17, -0.6)
  car.add(tcamCamera)

  // === ADDITIONAL FERRARI BRANDING ===
  // Ferrari logo on nose (red square with yellow)
  const ferrariLogoGeometry = new THREE.BoxGeometry(0.15, 0.15, 0.02, 3, 3, 1)
  const ferrariLogo1 = new THREE.Mesh(ferrariLogoGeometry, shellYellowMaterial)
  ferrariLogo1.position.set(0, 0.42, 2.3)
  car.add(ferrariLogo1)

  // Ferrari shield on engine cover
  const shieldGeometry = new THREE.BoxGeometry(0.25, 0.02, 0.3, 5, 1, 5)
  const shield = new THREE.Mesh(shieldGeometry, shellYellowMaterial)
  shield.position.set(0, 0.85, -1.3)
  car.add(shield)

  // Mission Winnow branding (white)
  const missionWinnowGeometry = new THREE.BoxGeometry(0.02, 0.15, 0.5, 1, 3, 5)
  const missionWinnow1 = new THREE.Mesh(missionWinnowGeometry, whiteMaterial)
  missionWinnow1.position.set(-0.98, 0.55, 1.2)
  car.add(missionWinnow1)

  const missionWinnow2 = new THREE.Mesh(missionWinnowGeometry, whiteMaterial)
  missionWinnow2.position.set(0.98, 0.55, 1.2)
  car.add(missionWinnow2)

  return car
}

    // Track path parameters
    const speed = 3.5; // Speed around track (increased for faster racing)
    let wheelRotation = 0;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Animate all cars
      if (cars.length > 0 && trackCurve) {
        cars.forEach((car) => {
          // Calculate track curvature for realistic speed adjustment
          const tangent1 = trackCurve.getTangentAt(car.trackProgress);
          const tangent2 = trackCurve.getTangentAt((car.trackProgress + 0.003) % 1);
          const curvature = tangent1.angleTo(tangent2);
          
          // Realistic F1 curve slowdown - subtle but noticeable
          let speedMultiplier = 1.0;
          if (curvature > 0.015) {
            // Slow down 10-25% on curves depending on sharpness
            speedMultiplier = Math.max(0.75, 1.0 - curvature * 4);
          }
          
          // Move car along COTA track curve with curve-adjusted speed
          car.trackProgress += speed * 0.0005 * speedMultiplier;
          
          // Simple modulo to loop - CatmullRomCurve handles this smoothly
          car.trackProgress = car.trackProgress % 1;
          
          // Get position on curve using arc-length parametrization for UNIFORM speed
          const carPosition = trackCurve.getPointAt(car.trackProgress); // getPointAt = arc-length based
          car.model.position.copy(carPosition);
          car.model.position.y = 0.8; // Raise car above track
          
          // Calculate direction by looking ahead on the curve
          const nextProgress = (car.trackProgress + 0.005) % 1; // Smaller lookahead for smoother rotation
          const nextPosition = trackCurve.getPointAt(nextProgress); // getPointAt = arc-length based
          
          // Calculate the angle between current and next position
          const dx = nextPosition.x - carPosition.x;
          const dz = nextPosition.z - carPosition.z;
          
          // Calculate rotation angle - car faces direction of movement
          const directionAngle = Math.atan2(dx, dz) + Math.PI / 2;
          
          // Set car rotation to face the direction of movement
          car.model.rotation.y = directionAngle;
          
          // Rotate wheels based on speed
          car.wheels.forEach((wheel) => {
            wheel.rotation.x = wheelRotation;
          });
        });
        
        // Rotate wheels (shared rotation value) - adjusted for speed
        wheelRotation += speed * 0.04;
        
        // Camera follows the first car (black car) with smooth interpolation
        if (cars[0]) {
          const leadCar = cars[0];
          const carPosition = trackCurve.getPointAt(leadCar.trackProgress); // Arc-length based
          const nextProgress = (leadCar.trackProgress + 0.005) % 1;
          const nextPosition = trackCurve.getPointAt(nextProgress); // Arc-length based
          const dx = nextPosition.x - carPosition.x;
          const dz = nextPosition.z - carPosition.z;
          const directionAngle = Math.atan2(dx, dz) + Math.PI / 2;
          
          // Move camera to follow the lead car dynamically
          const cameraOffset = 20; // Distance behind car (slightly further to see all 3)
          const cameraHeight = 12;  // Height above car (higher to see all cars)
          
          // Calculate camera position behind the car
          const cameraAngle = directionAngle - Math.PI / 2;
          const targetCamX = carPosition.x - Math.sin(cameraAngle) * cameraOffset;
          const targetCamZ = carPosition.z - Math.cos(cameraAngle) * cameraOffset;
          
          // Smooth camera movement with lerp (prevents jerky motion)
          const lerpFactor = 0.15; // Smooth following (increased for faster cars)
          camera.position.x += (targetCamX - camera.position.x) * lerpFactor;
      camera.position.y = cameraHeight;
          camera.position.z += (targetCamZ - camera.position.z) * lerpFactor;
          
          // Smooth lookAt target
          const targetLookX = carPosition.x;
          const targetLookZ = carPosition.z;
          camera.lookAt(targetLookX, 0.8, targetLookZ);
        }
      }
      
      // Animate rain if present
      if (rainRef.current) {
        const positions = rainRef.current.geometry.attributes.position.array;
        const velocities = rainRef.current.geometry.userData.velocities;
        
        for (let i = 0; i < positions.length; i += 3) {
          positions[i + 1] -= velocities[i / 3]; // Move down
          
          // Reset rain drop when it hits the ground
          if (positions[i + 1] < 0) {
            positions[i + 1] = 100;
          }
        }
        
        rainRef.current.geometry.attributes.position.needsUpdate = true;
      }
      
      renderer.render(scene, camera);
    };

    animate();
    
    // Weather update function
    const updateWeather = (rainy) => {
      if (rainy) {
        // Rainy weather
        scene.background = new THREE.Color(0x5a6b7d); // Dark gray-blue sky
        scene.fog = new THREE.Fog(0x5a6b7d, 50, 250); // Denser fog
        
        // Make clouds darker and more visible
        cloudsRef.current?.forEach(cloud => {
          cloud.children.forEach(puff => {
            puff.material.color.setHex(0xcccccc);
            puff.material.opacity = 0.9;
          });
        });
        
        // Add rain
        if (!rainRef.current) {
          rainRef.current = createRain();
          scene.add(rainRef.current);
        }
        
        // Darken lighting
        scene.children.forEach(child => {
          if (child.type === 'DirectionalLight') {
            child.intensity = 0.5;
          } else if (child.type === 'AmbientLight') {
            child.intensity = 0.4;
          }
        });
      } else {
        // Clear weather
        scene.background = new THREE.Color(0x87CEEB); // Sky blue
        scene.fog = new THREE.Fog(0x87CEEB, 100, 400); // Light fog
        
        // Make clouds lighter
        cloudsRef.current?.forEach(cloud => {
          cloud.children.forEach(puff => {
            puff.material.color.setHex(0xFFFFFF);
            puff.material.opacity = 0.8;
          });
        });
        
        // Remove rain
        if (rainRef.current) {
          scene.remove(rainRef.current);
          rainRef.current.geometry.dispose();
          rainRef.current.material.dispose();
          rainRef.current = null;
        }
        
        // Restore lighting
        scene.children.forEach(child => {
          if (child.type === 'DirectionalLight') {
            child.intensity = 1.0;
          } else if (child.type === 'AmbientLight') {
            child.intensity = 0.6;
          }
        });
      }
    };
    
    updateWeatherRef.current = updateWeather;
    
    // Initial weather setup
    updateWeather(isRainy);

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  // Update weather when isRainy changes
  useEffect(() => {
    if (updateWeatherRef.current) {
      updateWeatherRef.current(isRainy);
    }
  }, [isRainy]);
  
  // Terminal command simulator
  useEffect(() => {
    const commands = [
      { text: '> sys.render.init()', color: '#00ff00', delay: 80 },
      { text: '√ Scene graph initialized [0.023s]', color: '#00ff00', delay: 50 },
      { text: '> loading asset: ferrari_f1_sf16h.gltf', color: '#00aaff', delay: 120 },
      { text: '  ├─ textures: 4/4 loaded', color: '#888888', delay: 90 },
      { text: '  ├─ materials: 8/8 compiled', color: '#888888', delay: 70 },
      { text: '  └─ meshes: 142 vertices processed', color: '#888888', delay: 60 },
      { text: '√ CAR_01 [BLACK] rendered @ position(0.00, 0.80, track)', color: '#00ff00', delay: 100 },
      { text: '√ CAR_02 [RED] rendered @ position(0.04, 0.80, track)', color: '#00ff00', delay: 100 },
      { text: '√ CAR_03 [BLUE] rendered @ position(0.08, 0.80, track)', color: '#00ff00', delay: 100 },
      { text: '> track.generate() :: COTA_CIRCUIT', color: '#ffaa00', delay: 150 },
      { text: '  ├─ points: 89 control vertices', color: '#888888', delay: 60 },
      { text: '  ├─ curve: CatmullRom interpolation', color: '#888888', delay: 60 },
      { text: '  ├─ surface: 5.513km asphalt', color: '#888888', delay: 70 },
      { text: '  └─ curbs: red/white striped [800 segments]', color: '#888888', delay: 80 },
      { text: '√ Track geometry built successfully', color: '#00ff00', delay: 90 },
      { text: '> banner.create() :: COTA_BRANDING', color: '#ffaa00', delay: 100 },
      { text: '  ├─ loading: f1_movie_logo.png [512x512]', color: '#888888', delay: 80 },
      { text: '  ├─ structure: poles + frame + lights', color: '#888888', delay: 70 },
      { text: '  └─ text: double-sided rendering', color: '#888888', delay: 70 },
      { text: '√ Banner mounted @ (-30, 0, -15)', color: '#00ff00', delay: 90 },
      { text: '> weather.system.initialize()', color: '#00aaff', delay: 110 },
      { text: '  ├─ clouds: 20 instances generated', color: '#888888', delay: 60 },
      { text: '  ├─ fog: atmospheric enabled', color: '#888888', delay: 60 },
      { text: '  └─ rain: 15000 particles ready', color: '#888888', delay: 70 },
      { text: '> camera.attach() :: CHASE_MODE', color: '#ffaa00', delay: 100 },
      { text: '  └─ target: CAR_01 [offset: 20m, height: 12m]', color: '#888888', delay: 80 },
      { text: '> lighting.setup() :: DIRECTIONAL + AMBIENT', color: '#00aaff', delay: 90 },
      { text: '√ Scene ready [total: 2.847s]', color: '#00ff00', delay: 120 },
      { text: '> animation.loop.start()', color: '#00ff00', delay: 100 },
      { text: '  ├─ FPS: 60 | Frame: 1024', color: '#888888', delay: 60 },
      { text: '  ├─ CAR_SPEED: 2.5x', color: '#888888', delay: 50 },
      { text: '  └─ WHEEL_ROTATION: active', color: '#888888', delay: 50 },
      { text: '> shader.compile() :: PBR_MATERIALS', color: '#ffaa00', delay: 90 },
      { text: '√ All systems operational', color: '#00ff00', delay: 150 },
      { text: '> monitoring.performance...', color: '#888888', delay: 100 },
      { text: '  ├─ draw_calls: 127', color: '#666666', delay: 40 },
      { text: '  ├─ triangles: 18,542', color: '#666666', delay: 40 },
      { text: '  └─ memory: 124MB', color: '#666666', delay: 60 },
      { text: '> sys.status: [RUNNING]', color: '#00ff00', delay: 200 },
      { text: '', color: '#00ff00', delay: 300 }
    ];
    
    let currentIndex = 0;
    let currentLines = [];
    const maxLines = 12; // Show only last 12 lines
    
    const addLine = () => {
      const command = commands[currentIndex];
      currentLines.push(command);
      
      if (currentLines.length > maxLines) {
        currentLines.shift(); // Remove oldest line
      }
      
      setTerminalLines([...currentLines]);
      
      currentIndex = (currentIndex + 1) % commands.length;
      
      setTimeout(addLine, command.delay);
    };
    
    const timer = setTimeout(addLine, 500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      
      {/* Weather Toggle Button */}
      <button
        onClick={() => setIsRainy(!isRainy)}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          padding: '12px 24px',
          fontSize: '16px',
          fontWeight: 'bold',
          backgroundColor: isRainy ? '#5a6b7d' : '#87CEEB',
          color: 'white',
          border: '2px solid white',
          borderRadius: '8px',
          cursor: 'pointer',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.3s ease',
          zIndex: 1000
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1)';
        }}
      >
        {isRainy ? '🌧️ Rainy' : '☀️ Clear'}
      </button>
      
      {/* Hackery Terminal Display */}
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          width: '450px',
          maxHeight: '300px',
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          border: '2px solid #00ff00',
          borderRadius: '4px',
          padding: '12px',
          fontFamily: 'Monaco, Consolas, "Courier New", monospace',
          fontSize: '12px',
          lineHeight: '1.4',
          color: '#00ff00',
          boxShadow: '0 0 20px rgba(0, 255, 0, 0.3), inset 0 0 10px rgba(0, 255, 0, 0.1)',
          overflow: 'hidden',
          zIndex: 999,
          backdropFilter: 'blur(5px)'
        }}
      >
        {/* Terminal Header */}
        <div style={{ 
          borderBottom: '1px solid #00ff00', 
          marginBottom: '8px', 
          paddingBottom: '6px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ color: '#00ff00', fontWeight: 'bold' }}>F1_RENDER_ENGINE v2.3.7</span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ff0000' }}></div>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ffaa00' }}></div>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#00ff00' }}></div>
          </div>
        </div>
        
        {/* Terminal Lines */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: '2px'
        }}>
          {terminalLines.map((line, index) => (
            <div 
              key={index} 
              style={{ 
                color: line.color,
                whiteSpace: 'pre',
                textShadow: line.color === '#00ff00' ? '0 0 5px rgba(0, 255, 0, 0.5)' : 'none',
                animation: index === terminalLines.length - 1 ? 'fadeIn 0.2s ease-in' : 'none'
              }}
            >
              {line.text}
            </div>
          ))}
          {/* Blinking cursor */}
          <div style={{ 
            display: 'inline-block',
            width: '8px',
            height: '14px',
            backgroundColor: '#00ff00',
            animation: 'blink 1s infinite',
            marginLeft: '2px'
          }}></div>
        </div>
      </div>
      
      {/* Add CSS animations */}
      <style>{`
        @keyframes blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default F1RaceSimulation;