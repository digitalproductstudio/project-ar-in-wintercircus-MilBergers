// Language translations
const translations = {
    en: {
        title: "TEMBO DRAWING 3D EXPERIENCE",
        description: "Color the elephant template, then scan it to see your drawing come to life as a 3D elephant!",
        startBtn: "Start Experience",
        templateBtn: "Download Template",
        captureBtn: "Capture",
        switchCameraBtn: "Switch Camera",
        backBtn: "Back",
        processingText: "Processing your elephant...",
        restartBtn: "Scan Another",
        saveBtn: "Save Image",
        loadingScene: "Loading scene...",
        loadingModel: "Loading 3D model...",
        errorLoadingScene: "Scene model could not be loaded. Using default background.",
        errorLoadingModel: "Failed to load 3D model: ",
        modelLoadError: "Model Loading Error",
        modelLoadErrorMsg: "Please check your model path and file format.",
        expectedPath: "Expected path: assets/models/elephant.gltf",
        closeBtn: "Close"
    },
    nl: {
        title: "TEMBO TEKENING 3D ERVARING",
        description: "Kleur de olifant sjabloon, scan het dan om je tekening tot leven te zien komen als een 3D olifant!",
        startBtn: "Start Ervaring",
        templateBtn: "Sjabloon Downloaden",
        captureBtn: "Vastleggen",
        switchCameraBtn: "Camera Wisselen",
        backBtn: "Terug",
        processingText: "Je olifant verwerken...",
        restartBtn: "Nog Een Scannen",
        saveBtn: "Afbeelding Opslaan",
        loadingScene: "Scène laden...",
        loadingModel: "3D model laden...",
        errorLoadingScene: "Scènemodel kon niet worden geladen. Standaardachtergrond gebruiken.",
        errorLoadingModel: "Kan 3D-model niet laden: ",
        modelLoadError: "Fout bij laden model",
        modelLoadErrorMsg: "Controleer je modelpad en bestandsformaat.",
        expectedPath: "Verwacht pad: assets/models/elephant.gltf",
        closeBtn: "Sluiten"
    }
};

// Current language
let currentLanguage = 'en';

// Function to set the language
function setLanguage(lang) {
    currentLanguage = lang;
    
    // Update UI elements
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });
    
    // Update language buttons
    document.querySelectorAll('.lang-btn').forEach(button => {
        if (button.getAttribute('data-lang') === lang) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
    
    // Store the selected language in localStorage
    localStorage.setItem('preferredLanguage', lang);
}

// Add this function to load the 3D scene model
function loadSceneModel() {
    return new Promise((resolve, reject) => {
        // Check if GLTFLoader is available
        if (!THREE.GLTFLoader) {
            console.error('THREE.GLTFLoader is not available');
            reject('THREE.GLTFLoader is not available');
            return;
        }
        
        // Show loading message
        const loadingMessage = document.createElement('div');
        loadingMessage.style.position = 'absolute';
        loadingMessage.style.top = '50%';
        loadingMessage.style.left = '50%';
        loadingMessage.style.transform = 'translate(-50%, -50%)';
        loadingMessage.style.color = 'white';
        loadingMessage.style.fontSize = '18px';
        loadingMessage.style.textAlign = 'center';
        loadingMessage.innerHTML = translations[currentLanguage].loadingScene || 'Loading scene...';
        loadingMessage.id = 'scene-loading-message';
        sceneContainer.appendChild(loadingMessage);
        
        // Path to your scene model
        const scenePath = 'assets/models/scene/scene.gltf';
        console.log('Attempting to load 3D scene from:', scenePath);
        
        // Load the scene using GLTFLoader
        const loader = new THREE.GLTFLoader();
        loader.load(
            scenePath,
            function(gltf) {
                // Remove loading message
                const loadingMsg = document.getElementById('scene-loading-message');
                if (loadingMsg && loadingMsg.parentNode) {
                    loadingMsg.parentNode.removeChild(loadingMsg);
                }
                
                console.log('Scene model loaded successfully');
                sceneModel = gltf.scene;
                
                // Enable shadows for the scene
                sceneModel.traverse(function(child) {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
                
                // Position and scale the scene as needed
                sceneModel.scale.set(1, 1, 1); // Adjust as needed
                sceneModel.position.set(0, 0, 0); // Center the scene
                
                // Add scene to the main scene
                threeJsScene.add(sceneModel);
                
                // Adjust camera position to see the whole scene
                // This will be overridden by OrbitControls if you interact with it
                const sceneBoundingBox = new THREE.Box3().setFromObject(sceneModel);
                const sceneSize = new THREE.Vector3();
                sceneBoundingBox.getSize(sceneSize);
                
                const maxDim = Math.max(sceneSize.x, sceneSize.y, sceneSize.z);
                threeJsCamera.position.set(maxDim, maxDim * 0.7, maxDim);
                threeJsCamera.lookAt(0, 0, 0);
                
                // Update controls
                if (threeJsControls) {
                    threeJsControls.target.set(0, sceneSize.y * 0.3, 0); // Look at middle of scene
                    threeJsControls.update();
                }
                
                resolve();
            },
            function(xhr) {
                if (xhr.lengthComputable) {
                    const percentComplete = xhr.loaded / xhr.total * 100;
                    console.log('Scene loading: ' + percentComplete.toFixed(2) + '% loaded');
                    
                    const loadingMsg = document.getElementById('scene-loading-message');
                    if (loadingMsg) {
                        loadingMsg.innerHTML = translations[currentLanguage].loadingScene + ' ' + percentComplete.toFixed(0) + '%';
                    }
                }
            },
            function(error) {
                // Remove loading message
                const loadingMsg = document.getElementById('scene-loading-message');
                if (loadingMsg && loadingMsg.parentNode) {
                    loadingMsg.parentNode.removeChild(loadingMsg);
                }
                
                console.error('Error loading scene:', error);
                
                // Show error message but continue with loading the elephant
                const errorDiv = document.createElement('div');
                errorDiv.style.position = 'absolute';
                errorDiv.style.bottom = '10px';
                errorDiv.style.right = '10px';
                errorDiv.style.backgroundColor = 'rgba(255, 0, 0, 0.7)';
                errorDiv.style.color = 'white';
                errorDiv.style.padding = '10px';
                errorDiv.style.borderRadius = '5px';
                errorDiv.style.fontSize = '14px';
                errorDiv.style.zIndex = '1000';
                errorDiv.innerHTML = translations[currentLanguage].errorLoadingScene;
                sceneContainer.appendChild(errorDiv);
                
                // Auto-hide the message after 5 seconds
                setTimeout(() => {
                    if (errorDiv.parentNode) {
                        errorDiv.parentNode.removeChild(errorDiv);
                    }
                }, 5000);
                
                // Create simple ground as fallback
                const groundGeometry = new THREE.PlaneGeometry(50, 50);
                const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 }); // Brown
                const ground = new THREE.Mesh(groundGeometry, groundMaterial);
                ground.rotation.x = -Math.PI / 2; // Rotate to be horizontal
                ground.position.y = -1.5;
                ground.receiveShadow = true;
                threeJsScene.add(ground);
                
                resolve(); // Resolve anyway so the elephant can be loaded
            }
        );
    });
}

// DOM Elements
const introScreen = document.getElementById('intro-screen');
const cameraScreen = document.getElementById('camera-screen');
const processingScreen = document.getElementById('processing-screen');
const resultScreen = document.getElementById('result-screen');

const startBtn = document.getElementById('start-btn');
const templateBtn = document.getElementById('template-btn');
const captureBtn = document.getElementById('capture-btn');
const backToIntroBtn = document.getElementById('back-to-intro-btn');
const restartBtn = document.getElementById('restart-btn');
const saveBtn = document.getElementById('save-btn');
const switchCameraBtn = document.getElementById('switch-camera-btn');

const cameraFeed = document.getElementById('camera-feed');
const cameraCanvas = document.getElementById('camera-canvas');
const sceneContainer = document.getElementById('scene-container');

// Add the GLTFLoader for loading the 3D model
// Make sure to include the Three.js GLTFLoader in your imports at the top of the HTML file
const GLTFLoader = THREE.GLTFLoader || null;
if (!GLTFLoader) {
    console.error('THREE.GLTFLoader not found. Make sure to include it in your HTML.');
}

// Remove rotation buttons from the DOM
const rotateLeftBtn = document.getElementById('rotate-left-btn');
const rotateRightBtn = document.getElementById('rotate-right-btn');
if (rotateLeftBtn) rotateLeftBtn.remove();
if (rotateRightBtn) rotateRightBtn.remove();

// Only keep zoom buttons
const zoomInBtn = document.getElementById('zoom-in-btn');
const zoomOutBtn = document.getElementById('zoom-out-btn');

// App State
let cameraStream = null;
let capturedImage = null;
let threeJsScene = null;
let threeJsRenderer = null;
let threeJsCamera = null;
let threeJsControls = null; // Orbit controls for easier interaction
let elephantModel = null;
let elephantTexture = null;
let modelLoaded = false; // Flag to track model loading
let availableCameras = [];
let currentCameraIndex = 0;

// Elephant model configuration - you can adjust these as needed
const modelConfig = {
    scale: 1.5,        // Overall scale of the model (1.0 = 100%)
    positionX: 0,      // Left/right position
    positionY: -2,     // Up/down position  
    positionZ: 0,      // Forward/backward position
    rotationY: 0,      // Rotation around Y axis (in radians)
    autoRotate: true,  // Auto-rotate enabled by default
    rotationSpeed: 0.005 // Speed of auto-rotation
};

// Add UI for adjusting model parameters
function addModelControls() {
    if (!elephantModel) return;
    
    const controlsDiv = document.createElement('div');
    controlsDiv.style.position = 'absolute';
    controlsDiv.style.bottom = '10px';
    controlsDiv.style.left = '10px';
    controlsDiv.style.backgroundColor = 'rgba(0,0,0,0.5)';
    controlsDiv.style.padding = '10px';
    controlsDiv.style.borderRadius = '5px';
    controlsDiv.style.color = 'white';
    
    let html = '<div style="font-weight:bold;margin-bottom:5px;">Model Controls:</div>';
    
    // Scale slider
    html += '<div style="margin-bottom:5px;"><label>Scale: </label>' +
           '<input type="range" id="model-scale" min="0.5" max="3" step="0.1" value="' + modelConfig.scale + '" style="width:100px;"></div>';
    
    // Position Y slider
    html += '<div style="margin-bottom:5px;"><label>Height: </label>' +
           '<input type="range" id="model-position-y" min="-5" max="2" step="0.1" value="' + modelConfig.positionY + '" style="width:100px;"></div>';
           
    // Auto-rotate checkbox
    html += '<div style="margin-bottom:5px;"><label>Auto-rotate: </label>' +
           '<input type="checkbox" id="model-auto-rotate"' + (modelConfig.autoRotate ? ' checked' : '') + '></div>';
    
    // Rotation speed slider (only visible when auto-rotate is enabled)
    html += '<div style="margin-bottom:5px;' + (modelConfig.autoRotate ? '' : 'display:none;') + '" id="rotation-speed-container">' +
           '<label>Rotation Speed: </label>' +
           '<input type="range" id="model-rotation-speed" min="0.001" max="0.02" step="0.001" value="' + modelConfig.rotationSpeed + '" style="width:100px;"></div>';
    
    controlsDiv.innerHTML = html;
    sceneContainer.appendChild(controlsDiv);
    
    // Make sure rotation buttons are removed even if they're added after the initial DOM check
    const rotateButtons = document.querySelectorAll('[id$="-rotate-btn"]');
    rotateButtons.forEach(button => {
        if (button.id !== 'model-auto-rotate') {
            button.remove();
        }
    });
    
    // Add event listeners
    document.getElementById('model-scale').addEventListener('input', function(e) {
        const newScale = parseFloat(e.target.value);
        modelConfig.scale = newScale;
        updateModelFromConfig();
    });
    
    document.getElementById('model-position-y').addEventListener('input', function(e) {
        const newPosY = parseFloat(e.target.value);
        modelConfig.positionY = newPosY;
        updateModelFromConfig();
    });
    
    document.getElementById('model-auto-rotate').addEventListener('change', function(e) {
        modelConfig.autoRotate = e.target.checked;
        
        // Show/hide rotation speed control
        const rotationSpeedContainer = document.getElementById('rotation-speed-container');
        if (rotationSpeedContainer) {
            rotationSpeedContainer.style.display = modelConfig.autoRotate ? 'block' : 'none';
        }
    });
    
    document.getElementById('model-rotation-speed').addEventListener('input', function(e) {
        const newSpeed = parseFloat(e.target.value);
        modelConfig.rotationSpeed = newSpeed;
    });
}

// Function to update model from config
function updateModelFromConfig() {
    if (!elephantModel) return;
    
    elephantModel.scale.set(
        modelConfig.scale, 
        modelConfig.scale, 
        modelConfig.scale
    );
    
    elephantModel.position.set(
        modelConfig.positionX, 
        modelConfig.positionY, 
        modelConfig.positionZ
    );
    
    elephantModel.rotation.y = modelConfig.rotationY;
    
    // Force a render
    if (threeJsRenderer && threeJsScene && threeJsCamera) {
        threeJsRenderer.render(threeJsScene, threeJsCamera);
    }
}

// Function to enumerate available cameras
async function getAvailableCameras() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        availableCameras = devices.filter(device => device.kind === 'videoinput');
        console.log('Available cameras:', availableCameras);
        
        // If no cameras found, show an error
        if (availableCameras.length === 0) {
            alert('No cameras detected on your device.');
            return false;
        }
        
        // Update switch camera button visibility based on available cameras
        updateSwitchCameraButtonVisibility();
        
        return true;
    } catch (error) {
        console.error('Error enumerating devices:', error);
        alert('Could not access camera devices. Please ensure you have granted camera permissions.');
        return false;
    }
}

// Function to update switch camera button visibility
function updateSwitchCameraButtonVisibility() {
    if (switchCameraBtn) {
        // Only show switch camera button if multiple cameras are available
        switchCameraBtn.style.display = availableCameras.length > 1 ? 'block' : 'none';
    }
}

// Add this new function to refresh the camera list after permissions are granted
async function refreshCameraList() {
    try {
        // Re-enumerate devices now that we have permissions
        const devices = await navigator.mediaDevices.enumerateDevices();
        const newCameras = devices.filter(device => device.kind === 'videoinput');
        
        // Log if there's any change in the camera list
        if (newCameras.length !== availableCameras.length) {
            console.log('Camera list updated after permission:', newCameras);
            availableCameras = newCameras;
        }
        
        // Update switch camera button visibility with the refreshed list
        updateSwitchCameraButtonVisibility();
    } catch (error) {
        console.error('Error refreshing camera list:', error);
    }
}

// Event Listeners
startBtn.addEventListener('click', initializeCamera);
templateBtn.addEventListener('click', downloadTemplate);
captureBtn.addEventListener('click', captureImage);
backToIntroBtn.addEventListener('click', goToIntroScreen);
restartBtn.addEventListener('click', restart);
saveBtn.addEventListener('click', saveImage);
if (switchCameraBtn) {
    switchCameraBtn.addEventListener('click', switchCamera);
}

// Language button event listeners
document.getElementById('lang-en').addEventListener('click', function() {
    setLanguage('en');
});

document.getElementById('lang-nl').addEventListener('click', function() {
    setLanguage('nl');
});

// Only attach zoom button event listeners
zoomInBtn.addEventListener('click', zoomIn);
zoomOutBtn.addEventListener('click', zoomOut);

// Navigation Functions
function showScreen(screen) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    screen.classList.add('active');
}

function goToIntroScreen() {
    stopCamera();
    showScreen(introScreen);
}

function restart() {
    stopThreeJs();
    showScreen(introScreen);
}

// Camera Functions
async function initializeCamera() {
    const hasCameras = await getAvailableCameras();
    if (hasCameras) {
        // Use second camera (index 1) if available, otherwise use first camera (index 0)
        const preferredIndex = availableCameras.length > 1 ? 1 : 0;
        startCamera(preferredIndex);
    }
}

async function startCamera(cameraIndex = 0) {
    // Stop any existing camera stream first
    stopCamera();
    
    // Make sure we have a list of available cameras
    if (availableCameras.length === 0) {
        const hasCameras = await getAvailableCameras();
        if (!hasCameras) return;
    }
    
    // Set the current camera index
    currentCameraIndex = cameraIndex % availableCameras.length;
    
    try {
        // Get the selected camera device ID
        const selectedCamera = availableCameras[currentCameraIndex];
        console.log('Starting camera:', selectedCamera.label || `Camera ${currentCameraIndex + 1}`);
        
        // Get the stream with the specific device ID
        cameraStream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                deviceId: { exact: selectedCamera.deviceId },
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }, 
            audio: false 
        });
        
        cameraFeed.srcObject = cameraStream;
        
        // Wait for the video to be ready
        cameraFeed.onloadedmetadata = () => {
            // Set canvas dimensions to match video
            // Consider container aspect ratio
            const containerAspect = 4/3; // 500px / 375px
            const videoAspect = cameraFeed.videoWidth / cameraFeed.videoHeight;
            
            if (videoAspect > containerAspect) {
                // Video is wider than container
                cameraCanvas.width = cameraFeed.videoHeight * containerAspect;
                cameraCanvas.height = cameraFeed.videoHeight;
            } else {
                // Video is taller than container
                cameraCanvas.width = cameraFeed.videoWidth;
                cameraCanvas.height = cameraFeed.videoWidth / containerAspect;
            }
            
            // Log for debugging
            console.log(`Camera feed dimensions: ${cameraFeed.videoWidth}x${cameraFeed.videoHeight}`);
            console.log(`Canvas dimensions: ${cameraCanvas.width}x${cameraCanvas.height}`);
            
            // Re-enumerate cameras after successful camera initialization
            // This ensures we have complete camera information after permissions are granted
            refreshCameraList();
            
            showScreen(cameraScreen);
        };
    } catch (error) {
        console.error('Error accessing camera:', error);
        alert(`Unable to access camera ${currentCameraIndex + 1}. Please ensure you have given camera permissions and try again.`);
    }
}

// Function to switch to the next available camera
function switchCamera() {
    if (availableCameras.length <= 1) {
        alert('Only one camera is available on this device.');
        return;
    }
    
    // Calculate next camera index
    const nextCameraIndex = (currentCameraIndex + 1) % availableCameras.length;
    
    // Show a brief switching message
    const switchingMessage = document.createElement('div');
    switchingMessage.style.position = 'absolute';
    switchingMessage.style.top = '50%';
    switchingMessage.style.left = '50%';
    switchingMessage.style.transform = 'translate(-50%, -50%)';
    switchingMessage.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    switchingMessage.style.color = 'white';
    switchingMessage.style.padding = '15px';
    switchingMessage.style.borderRadius = '5px';
    switchingMessage.style.zIndex = '1000';
    switchingMessage.innerHTML = 'Switching camera...';
    document.querySelector('.camera-container').appendChild(switchingMessage);
    
    // Start the new camera after a brief delay to show the message
    setTimeout(() => {
        startCamera(nextCameraIndex);
        // Remove the message
        if (switchingMessage.parentNode) {
            switchingMessage.parentNode.removeChild(switchingMessage);
        }
    }, 500);
}

function stopCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
}

function captureImage() {
    const context = cameraCanvas.getContext('2d');
    
    // Clear canvas before drawing
    context.clearRect(0, 0, cameraCanvas.width, cameraCanvas.height);
    
    // Draw video feed to canvas - ensure proper centering and scaling
    const videoAspect = cameraFeed.videoWidth / cameraFeed.videoHeight;
    const canvasAspect = cameraCanvas.width / cameraCanvas.height;
    
    let drawWidth, drawHeight, offsetX = 0, offsetY = 0;
    
    if (videoAspect > canvasAspect) {
        // Video is wider than canvas
        drawHeight = cameraCanvas.height;
        drawWidth = cameraCanvas.height * videoAspect;
        offsetX = (cameraCanvas.width - drawWidth) / 2;
    } else {
        // Video is taller than canvas
        drawWidth = cameraCanvas.width;
        drawHeight = cameraCanvas.width / videoAspect;
        offsetY = (cameraCanvas.height - drawHeight) / 2;
    }
    
    context.drawImage(cameraFeed, offsetX, offsetY, drawWidth, drawHeight);
    capturedImage = cameraCanvas.toDataURL('image/png');
    
    // Log for debugging
    console.log('Image captured. Canvas dimensions:', cameraCanvas.width, cameraCanvas.height);
    
    showScreen(processingScreen);
    
    // Simulate processing time (in a real app, we'd be detecting markers here)
    setTimeout(() => {
        processImage();
    }, 1500);
}

// Image Processing
function processImage() {
    // For the demo, we'll skip actual marker detection and just use the captured image
    // In a real implementation, we would:
    // 1. Detect the AR markers
    // 2. Extract the colored area
    // 3. Apply perspective correction
    
    // Load the image into a texture
    const textureLoader = new THREE.TextureLoader();
    elephantTexture = textureLoader.load(
        capturedImage, 
        // onLoad callback
        function() {
            // Once texture is loaded, set up the 3D scene
            setupThreeJs();
            showScreen(resultScreen);
        },
        // onProgress callback (usually not needed for simple textures)
        undefined,
        // onError callback
        function(error) {
            console.error('Error loading texture:', error);
            alert('Failed to process your image. Please try again.');
            showScreen(cameraScreen);
        }
    );
}

// Template Functions
function downloadTemplate() {
    // Create a link to download the template
    const link = document.createElement('a');
    link.href = 'your-elephant-template.pdf'; // Reference to your existing template
    link.download = 'elephant-template.pdf';
    link.click(); // Directly download the PDF
}

// Three.js Setup
function setupThreeJs() {
    console.log("Setting up Three.js scene");
    
    // Create Scene
    threeJsScene = new THREE.Scene();
    threeJsScene.background = new THREE.Color(0x87CEEB); // Sky blue
    
    // Create Camera
    threeJsCamera = new THREE.PerspectiveCamera(
        75, 
        sceneContainer.clientWidth / sceneContainer.clientHeight, 
        0.1, 
        1000
    );
    threeJsCamera.position.z = 15; // Set default zoom to 20
    threeJsCamera.position.y = 5;  // Slightly higher to see the scene better
    
    // Create Renderer with preserveDrawingBuffer for screenshot capability
    threeJsRenderer = new THREE.WebGLRenderer({ 
        antialias: true,
        preserveDrawingBuffer: true
    });
    threeJsRenderer.setSize(sceneContainer.clientWidth, sceneContainer.clientHeight);
    threeJsRenderer.shadowMap.enabled = true; // Enable shadows for better visuals
    sceneContainer.appendChild(threeJsRenderer.domElement);
    
    // Add OrbitControls for better interaction
    threeJsControls = new THREE.OrbitControls(threeJsCamera, threeJsRenderer.domElement);
    threeJsControls.enableDamping = true; // Add smooth damping effect
    threeJsControls.dampingFactor = 0.05;
    threeJsControls.minDistance = 3; // Prevent zooming in too close
    threeJsControls.maxDistance = 50; // Allow zooming out much further
    threeJsControls.zoomSpeed = 1.5; // Increase zoom speed
    threeJsControls.rotateSpeed = 1.0; // Standard rotation speed
    threeJsControls.panSpeed = 1.0; // Standard panning speed
    threeJsControls.enablePan = true; // Enable panning
    threeJsControls.enableRotate = true; // Enable rotation
    threeJsControls.enableZoom = true; // Enable zoom
    
    // Add Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    threeJsScene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    directionalLight.castShadow = true; // Enable shadows
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    threeJsScene.add(directionalLight);
    
    // Load 3D scene model first
    loadSceneModel().then(() => {
        // Create Elephant model after scene is loaded
        createElephantModel();
    });
    
    // Start animation loop immediately
    animate();
    
    // Force an initial render after a short delay to ensure everything is loaded
    setTimeout(() => {
        if (threeJsRenderer && threeJsScene && threeJsCamera) {
            console.log("Forcing initial render");
            threeJsControls.update();
            threeJsRenderer.render(threeJsScene, threeJsCamera);
        }
    }, 100);
    
    // Force another render after a longer delay to catch slower model loading
    setTimeout(() => {
        if (threeJsRenderer && threeJsScene && threeJsCamera) {
            console.log("Forcing secondary render");
            onWindowResize(); // Force a resize to update everything
            threeJsControls.update();
            threeJsRenderer.render(threeJsScene, threeJsCamera);
        }
    }, 1000);
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize);
}

function createElephantModel() {
    // Check if GLTFLoader is available
    if (!THREE.GLTFLoader) {
        console.error('THREE.GLTFLoader is not available');
        showModelLoadError('THREE.GLTFLoader is not available. Please check your Three.js imports.');
        return;
    }
    
    // Load your existing elephant model
    const loader = new THREE.GLTFLoader();
    
    // Create material using the captured image as texture
    const material = new THREE.MeshStandardMaterial({ 
        map: elephantTexture,
        roughness: 0.7,
        metalness: 0.2
    });
    
    // Show loading message in the scene container
    const loadingMessage = document.createElement('div');
    loadingMessage.style.position = 'absolute';
    loadingMessage.style.top = '50%';
    loadingMessage.style.left = '50%';
    loadingMessage.style.transform = 'translate(-50%, -50%)';
    loadingMessage.style.color = 'white';
    loadingMessage.style.fontSize = '18px';
    loadingMessage.style.textAlign = 'center';
    loadingMessage.innerHTML = translations[currentLanguage].loadingModel || 'Loading 3D model...';
    sceneContainer.appendChild(loadingMessage);
    
    // Log model path for debugging
    const modelPath = 'assets/models/elephant/scene.gltf';
    console.log('Attempting to load 3D model from:', modelPath);
    
    loader.load(
        // Model path - adjust path if your model is elsewhere
        modelPath, 
        
        // onLoad callback
        function(gltf) {
            // Remove loading message
            if (loadingMessage.parentNode) {
                loadingMessage.parentNode.removeChild(loadingMessage);
            }
            
            console.log('Model loaded successfully');
            elephantModel = gltf.scene;
            
            // Apply the captured texture to the model
            elephantModel.traverse(function(child) {
                if (child.isMesh) {
                    // Apply our material with the captured texture
                    child.material = material;
                    
                    // Enable shadows
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            
            // Position and scale model as needed
            // If we have a scene model, position the elephant relative to it
            if (sceneModel) {
                // Position the elephant on top of the scene
                // These values might need adjustment based on your specific scene model
                elephantModel.scale.set(0.08, 0.08, 0.08); // Smaller scale to fit scene
                elephantModel.position.set(0, 0, 0); // Center position, height will depend on scene
                
                // Find the optimal Y position by checking the scene's bounding box
                const sceneBoundingBox = new THREE.Box3().setFromObject(sceneModel);
                const sceneHeight = sceneBoundingBox.max.y;
                elephantModel.position.y = sceneHeight + 0.1; // Position slightly above scene
            } else {
                // Default positioning if no scene model
                elephantModel.scale.set(0.1, 0.1, 0.1);
                elephantModel.position.set(0, -1.5, 0);
            }
            
            // Add model to scene
            threeJsScene.add(elephantModel);
            modelLoaded = true;
        },
        
        // onProgress callback
        function(xhr) {
            if (xhr.lengthComputable) {
                const percentComplete = xhr.loaded / xhr.total * 100;
                console.log(percentComplete.toFixed(2) + '% loaded');
                loadingMessage.innerHTML = translations[currentLanguage].loadingModel + ' ' + percentComplete.toFixed(0) + '%';
            }
        },
        
        // onError callback
        function(error) {
            // Remove loading message
            if (loadingMessage.parentNode) {
                loadingMessage.parentNode.removeChild(loadingMessage);
            }
            
            console.error('Error loading the model:', error);
            showModelLoadError(translations[currentLanguage].errorLoadingModel + error.message);
        }
    );
}

// Function to display model loading error
function showModelLoadError(errorMessage) {
    // Create error message element
    const errorElement = document.createElement('div');
    errorElement.style.position = 'absolute';
    errorElement.style.top = '50%';
    errorElement.style.left = '50%';
    errorElement.style.transform = 'translate(-50%, -50%)';
    errorElement.style.color = 'white';
    errorElement.style.background = 'rgba(255, 0, 0, 0.7)';
    errorElement.style.padding = '20px';
    errorElement.style.borderRadius = '10px';
    errorElement.style.maxWidth = '80%';
    errorElement.style.textAlign = 'center';
    
    // Add error content
    errorElement.innerHTML = `
        <h3 style="margin-top:0">${translations[currentLanguage].modelLoadError}</h3>
        <p>${errorMessage}</p>
        <p>${translations[currentLanguage].modelLoadErrorMsg}</p>
        <p>${translations[currentLanguage].expectedPath}</p>
        <button id="error-close-btn" style="padding:8px 16px;background:#fff;color:#333;border:none;border-radius:4px;cursor:pointer;margin-top:10px;">${translations[currentLanguage].closeBtn}</button>
    `;
    
    // Add to scene container
    sceneContainer.appendChild(errorElement);
    
    // Add event listener to close button
    document.getElementById('error-close-btn').addEventListener('click', function() {
        if (errorElement.parentNode) {
            errorElement.parentNode.removeChild(errorElement);
        }
        restart(); // Go back to the intro screen
    });
}

function animate() {
    if (!threeJsRenderer) return;
    
    requestAnimationFrame(animate);
    
    // Auto-rotate if enabled in model config
    if (modelConfig.autoRotate && elephantModel) {
        elephantModel.rotation.y += modelConfig.rotationSpeed;
    }
    
    // Update orbit controls
    if (threeJsControls) {
        threeJsControls.update();
    }
    
    // Render scene
    threeJsRenderer.render(threeJsScene, threeJsCamera);
}

function onWindowResize() {
    if (!threeJsCamera || !threeJsRenderer) return;
    
    console.log("Window resize triggered");
    
    // Update camera aspect ratio
    threeJsCamera.aspect = sceneContainer.clientWidth / sceneContainer.clientHeight;
    threeJsCamera.updateProjectionMatrix();
    
    // Update renderer size
    threeJsRenderer.setSize(sceneContainer.clientWidth, sceneContainer.clientHeight);
    
    // Force a render
    if (threeJsRenderer && threeJsScene && threeJsCamera) {
        threeJsRenderer.render(threeJsScene, threeJsCamera);
    }
}

function stopThreeJs() {
    if (threeJsRenderer) {
        sceneContainer.removeChild(threeJsRenderer.domElement);
        threeJsRenderer = null;
    }
    
    if (threeJsControls) {
        threeJsControls.dispose();
        threeJsControls = null;
    }
    
    threeJsScene = null;
    threeJsCamera = null;
    elephantModel = null;
    elephantTexture = null;
    sceneModel = null;
    modelLoaded = false;
    
    window.removeEventListener('resize', onWindowResize);
}

// Control Functions
function zoomIn() {
    if (threeJsCamera && threeJsCamera.position.z > 5) {
        threeJsCamera.position.z -= 5.0; // Much larger zoom step
        if (threeJsControls) {
            threeJsControls.update();
        }
    }
}

function zoomOut() {
    if (threeJsCamera && threeJsCamera.position.z < 100) {
        threeJsCamera.position.z += 5.0; // Much larger zoom step
        if (threeJsControls) {
            threeJsControls.update();
        }
    }
}

function saveImage() {
    if (!threeJsRenderer) return;
    
    // Capture the current canvas as an image
    const imageData = threeJsRenderer.domElement.toDataURL('image/png');
    
    // Create a link to download the image
    const link = document.createElement('a');
    link.href = imageData;
    link.download = 'my-elephant.png';
    link.click();
}

// Initialize language
document.addEventListener('DOMContentLoaded', function() {
    // Check if there's a saved language preference
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'nl')) {
        setLanguage(savedLanguage);
    } else {
        // Default to browser language if available, otherwise English
        const browserLang = navigator.language || navigator.userLanguage;
        if (browserLang && browserLang.startsWith('nl')) {
            setLanguage('nl');
        } else {
            setLanguage('en');
        }
    }
});