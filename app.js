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
        loadingModel: "Loading 3D model...",
        errorLoadingModel: "Failed to load 3D model: ",
        modelLoadError: "Model Loading Error",
        modelLoadErrorMsg: "Please check your model path and file format.",
        expectedPath: "Expected path: assets/models/elephant.gltf",
        closeBtn: "Close",
        permissionTitle: "Camera Access Required",
        permissionText1: "To scan your drawing, we need access to your camera.",
        permissionText2: "When prompted, please tap \"Allow\" to continue.",
        grantPermissionBtn: "Grant Camera Access",
        permissionDenied: "Camera access was denied. Please grant camera permission to use this feature."
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
        loadingModel: "3D model laden...",
        errorLoadingModel: "Kan 3D-model niet laden: ",
        modelLoadError: "Fout bij laden model",
        modelLoadErrorMsg: "Controleer je modelpad en bestandsformaat.",
        expectedPath: "Verwacht pad: assets/models/elephant.gltf",
        closeBtn: "Sluiten",
        permissionTitle: "Camera Toegang Vereist",
        permissionText1: "Om je tekening te scannen, hebben we toegang tot je camera nodig.",
        permissionText2: "Wanneer gevraagd, tik op \"Toestaan\" om door te gaan.",
        grantPermissionBtn: "Geef Camera Toegang",
        permissionDenied: "Camera toegang is geweigerd. Geef alstublieft toestemming voor de camera om deze functie te gebruiken."
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

// DOM Elements
const introScreen = document.getElementById('intro-screen');
const permissionScreen = document.getElementById('permission-screen');
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
const grantPermissionBtn = document.getElementById('grant-permission-btn');
const backFromPermissionBtn = document.getElementById('back-from-permission-btn');

const cameraFeed = document.getElementById('camera-feed');
const cameraCanvas = document.getElementById('camera-canvas');
const sceneContainer = document.getElementById('scene-container');

// Remove unused control buttons from the DOM
const rotateLeftBtn = document.getElementById('rotate-left-btn');
const rotateRightBtn = document.getElementById('rotate-right-btn');
const zoomInBtn = document.getElementById('zoom-in-btn');
const zoomOutBtn = document.getElementById('zoom-out-btn');
if (rotateLeftBtn) rotateLeftBtn.remove();
if (rotateRightBtn) rotateRightBtn.remove();
if (zoomInBtn) zoomInBtn.remove();
if (zoomOutBtn) zoomOutBtn.remove();

// App State
let cameraStream = null;
let capturedImage = null;
let threeJsScene = null;
let threeJsRenderer = null;
let threeJsCamera = null;
let threeJsControls = null;
let elephantModel = null;
let elephantTexture = null;
let modelLoaded = false;
let availableCameras = [];
let currentCameraIndex = 0;
let isUsingBackCamera = true;

// Elephant model configuration
const modelConfig = {
    scale: 0.15,
    positionX: 0,
    positionY: -5,
    positionZ: 0,
    rotationY: 0,
    autoRotate: true,
    rotationSpeed: 0.0025
};

// Helper function to detect if we're on a mobile device
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Function to enumerate available cameras
async function getAvailableCameras() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        availableCameras = devices.filter(device => device.kind === 'videoinput');
        console.log('Available cameras:', availableCameras);
        
        if (availableCameras.length === 0) {
            alert('No cameras detected on your device.');
            return false;
        }
        
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
        const hasMultipleCameras = availableCameras.length > 1;
        console.log('Multiple cameras available:', hasMultipleCameras);
        switchCameraBtn.style.display = hasMultipleCameras ? 'block' : 'none';
    }
}

// Function to refresh the camera list after permissions are granted
async function refreshCameraList() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const newCameras = devices.filter(device => device.kind === 'videoinput');
        
        console.log('Refreshed camera list:', newCameras);
        
        if (newCameras.length > 0) {
            availableCameras = newCameras;
            
            if (availableCameras.length > 1) {
                console.log('Multiple cameras detected:', availableCameras.length);
            }
            
            updateSwitchCameraButtonVisibility();
        }
    } catch (error) {
        console.error('Error refreshing camera list:', error);
    }
}

// Event Listeners
startBtn.addEventListener('click', goToPermissionScreen);
templateBtn.addEventListener('click', downloadTemplate);
captureBtn.addEventListener('click', captureImage);
backToIntroBtn.addEventListener('click', goToIntroScreen);
restartBtn.addEventListener('click', restart);
saveBtn.addEventListener('click', saveImage);
if (switchCameraBtn) {
    switchCameraBtn.addEventListener('click', switchCamera);
}
if (grantPermissionBtn) {
    grantPermissionBtn.addEventListener('click', requestCameraPermission);
}
if (backFromPermissionBtn) {
    backFromPermissionBtn.addEventListener('click', goToIntroScreen);
}

// Language button event listeners
document.getElementById('lang-en').addEventListener('click', function() {
    setLanguage('en');
});

document.getElementById('lang-nl').addEventListener('click', function() {
    setLanguage('nl');
});

// Navigation Functions
function showScreen(screen) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    screen.classList.add('active');
}

function goToIntroScreen() {
    stopCamera();
    showScreen(introScreen);
}

function goToPermissionScreen() {
    showScreen(permissionScreen);
}

function restart() {
    stopThreeJs();
    showScreen(introScreen);
}

// Function to request camera permission
async function requestCameraPermission() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === 'videoinput');
        
        const hasPermission = cameras.some(camera => camera.label && camera.label.length > 0);
        
        if (hasPermission) {
            console.log('Camera permission already granted');
            initializeCamera();
            return;
        }
        
        console.log('Requesting camera permission with environment facing mode...');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' }, 
                audio: false 
            });
            
            stream.getTracks().forEach(track => track.stop());
            console.log('Camera permission granted with environment facing mode');
        } catch (error) {
            console.log('Environment mode failed, trying basic permissions:', error);
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            stream.getTracks().forEach(track => track.stop());
            console.log('Camera permission granted with basic constraints');
        }
        
        initializeCamera();
    } catch (error) {
        console.error('Error requesting camera permission:', error);
        
        const errorMsg = document.createElement('div');
        errorMsg.style.color = '#E73C3E';
        errorMsg.style.marginBottom = '20px';
        errorMsg.style.fontWeight = 'bold';
        errorMsg.style.maxWidth = '80%';
        errorMsg.style.textAlign = 'center';
        errorMsg.innerHTML = translations[currentLanguage].permissionDenied;
        
        let errorContainer = permissionScreen.querySelector('.error-container');
        if (!errorContainer) {
            errorContainer = document.createElement('div');
            errorContainer.className = 'error-container';
            
            const buttonContainer = permissionScreen.querySelector('.button-container');
            permissionScreen.insertBefore(errorContainer, buttonContainer);
        } else {
            errorContainer.innerHTML = '';
        }
        
        errorContainer.appendChild(errorMsg);
        
        setTimeout(() => {
            if (errorMsg.parentNode) {
                errorMsg.parentNode.removeChild(errorMsg);
            }
        }, 5000);
    }
}

// Camera Functions
async function initializeCamera() {
    const hasCameras = await getAvailableCameras();
    if (hasCameras) {
        isUsingBackCamera = true;
        currentCameraIndex = 1;
        
        if (isMobileDevice()) {
            startCameraWithFacingMode('environment');
        } else {
            const preferredIndex = availableCameras.length > 1 ? 1 : 0;
            fallbackToDeviceId(preferredIndex);
        }
    }
}

// Function to start camera with specific facingMode
async function startCameraWithFacingMode(mode) {
    stopCamera();
    
    try {
        console.log(`Starting camera with facingMode: '${mode}'`);
        
        const constraints = {
            video: {
                facingMode: mode,
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: false
        };
        
        cameraStream = await navigator.mediaDevices.getUserMedia(constraints);
        cameraFeed.srcObject = cameraStream;
        
        cameraFeed.onloadedmetadata = () => {
            const containerAspect = 4/3;
            const videoAspect = cameraFeed.videoWidth / cameraFeed.videoHeight;
            
            if (videoAspect > containerAspect) {
                cameraCanvas.width = cameraFeed.videoHeight * containerAspect;
                cameraCanvas.height = cameraFeed.videoHeight;
            } else {
                cameraCanvas.width = cameraFeed.videoWidth;
                cameraCanvas.height = cameraFeed.videoWidth / containerAspect;
            }
            
            console.log(`Camera feed dimensions: ${cameraFeed.videoWidth}x${cameraFeed.videoHeight}`);
            console.log(`Canvas dimensions: ${cameraCanvas.width}x${cameraCanvas.height}`);
            
            refreshCameraList();
            showScreen(cameraScreen);
        };
    } catch (error) {
        console.error(`Error accessing camera with facingMode '${mode}':`, error);
        fallbackToDeviceId(mode === 'environment' ? 1 : 0);
    }
}

// Fallback function to use deviceId when facingMode fails
async function fallbackToDeviceId(cameraIndex) {
    try {
        if (availableCameras.length <= cameraIndex) {
            cameraIndex = 0;
        }
        
        console.log(`Falling back to deviceId selection, camera index: ${cameraIndex}`);
        const selectedCamera = availableCameras[cameraIndex];
        
        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: {
                deviceId: { exact: selectedCamera.deviceId },
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: false
        });
        
        currentCameraIndex = cameraIndex;
        cameraFeed.srcObject = cameraStream;
        
        cameraFeed.onloadedmetadata = () => {
            const containerAspect = 4/3;
            const videoAspect = cameraFeed.videoWidth / cameraFeed.videoHeight;
            
            if (videoAspect > containerAspect) {
                cameraCanvas.width = cameraFeed.videoHeight * containerAspect;
                cameraCanvas.height = cameraFeed.videoHeight;
            } else {
                cameraCanvas.width = cameraFeed.videoWidth;
                cameraCanvas.height = cameraFeed.videoWidth / containerAspect;
            }
            
            refreshCameraList();
            showScreen(cameraScreen);
        };
    } catch (error) {
        console.error('Fallback camera access failed:', error);
        alert('Unable to access any camera. Please check your camera permissions and try again.');
    }
}

// Function to switch between cameras
function switchCamera() {
    if (availableCameras.length <= 1) {
        alert('Only one camera is available on this device.');
        return;
    }
    
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
    
    if (currentCameraIndex === 1 || isUsingBackCamera) {
        isUsingBackCamera = false;
        currentCameraIndex = 0;
        
        setTimeout(() => {
            startCameraWithFacingMode('user');
            if (switchingMessage.parentNode) {
                switchingMessage.parentNode.removeChild(switchingMessage);
            }
        }, 500);
    } else {
        isUsingBackCamera = true;
        currentCameraIndex = 1;
        
        setTimeout(() => {
            startCameraWithFacingMode('environment');
            if (switchingMessage.parentNode) {
                switchingMessage.parentNode.removeChild(switchingMessage);
            }
        }, 500);
    }
}

function stopCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
}

function captureImage() {
    const context = cameraCanvas.getContext('2d');
    
    context.clearRect(0, 0, cameraCanvas.width, cameraCanvas.height);
    
    const videoAspect = cameraFeed.videoWidth / cameraFeed.videoHeight;
    const canvasAspect = cameraCanvas.width / cameraCanvas.height;
    
    let drawWidth, drawHeight, offsetX = 0, offsetY = 0;
    
    if (videoAspect > canvasAspect) {
        drawHeight = cameraCanvas.height;
        drawWidth = cameraCanvas.height * videoAspect;
        offsetX = (cameraCanvas.width - drawWidth) / 2;
    } else {
        drawWidth = cameraCanvas.width;
        drawHeight = cameraCanvas.width / videoAspect;
        offsetY = (cameraCanvas.height - drawHeight) / 2;
    }
    
    context.drawImage(cameraFeed, offsetX, offsetY, drawWidth, drawHeight);
    capturedImage = cameraCanvas.toDataURL('image/png');
    
    console.log('Image captured. Canvas dimensions:', cameraCanvas.width, cameraCanvas.height);
    
    showScreen(processingScreen);
    
    setTimeout(() => {
        processImage();
    }, 1500);
}

// Image Processing
function processImage() {
    const textureLoader = new THREE.TextureLoader();
    elephantTexture = textureLoader.load(
        capturedImage, 
        function() {
            setupThreeJs();
            showScreen(resultScreen);
        },
        undefined,
        function(error) {
            console.error('Error loading texture:', error);
            alert('Failed to process your image. Please try again.');
            showScreen(cameraScreen);
        }
    );
}

// Template Functions
function downloadTemplate() {
    const link = document.createElement('a');
    link.href = 'your-elephant-template.pdf';
    link.download = 'elephant-template.pdf';
    link.click();
}

// Three.js Setup
function setupThreeJs() {
    console.log("Setting up Three.js scene");
    
    threeJsScene = new THREE.Scene();
    threeJsScene.background = new THREE.Color(0x87CEEB);
    
    threeJsCamera = new THREE.PerspectiveCamera(
        75, 
        sceneContainer.clientWidth / sceneContainer.clientHeight, 
        0.1, 
        1000
    );
    threeJsCamera.position.z = 15;
    threeJsCamera.position.y = 5;
    
    threeJsRenderer = new THREE.WebGLRenderer({ 
        antialias: true,
        preserveDrawingBuffer: true
    });
    threeJsRenderer.setSize(sceneContainer.clientWidth, sceneContainer.clientHeight);
    threeJsRenderer.shadowMap.enabled = true;
    sceneContainer.appendChild(threeJsRenderer.domElement);
    
    threeJsControls = new THREE.OrbitControls(threeJsCamera, threeJsRenderer.domElement);
    threeJsControls.enableDamping = true;
    threeJsControls.dampingFactor = 0.05;
    threeJsControls.minDistance = 3;
    threeJsControls.maxDistance = 50;
    threeJsControls.zoomSpeed = 1.5;
    threeJsControls.rotateSpeed = 1.0;
    threeJsControls.panSpeed = 1.0;
    threeJsControls.enablePan = true;
    threeJsControls.enableRotate = true;
    threeJsControls.enableZoom = true;
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    threeJsScene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    threeJsScene.add(directionalLight);
    
    createElephantModel();
    animate();
    
    setTimeout(() => {
        if (threeJsRenderer && threeJsScene && threeJsCamera) {
            console.log("Forcing initial render");
            threeJsControls.update();
            threeJsRenderer.render(threeJsScene, threeJsCamera);
        }
    }, 100);
    
    setTimeout(() => {
        if (threeJsRenderer && threeJsScene && threeJsCamera) {
            console.log("Forcing secondary render");
            onWindowResize();
            threeJsControls.update();
            threeJsRenderer.render(threeJsScene, threeJsCamera);
        }
    }, 1000);
    
    window.addEventListener('resize', onWindowResize);
}

function createElephantModel() {
    if (!THREE.GLTFLoader) {
        console.error('THREE.GLTFLoader is not available');
        showModelLoadError('THREE.GLTFLoader is not available. Please check your Three.js imports.');
        return;
    }
    
    const loader = new THREE.GLTFLoader();
    
    const material = new THREE.MeshStandardMaterial({ 
        map: elephantTexture,
        roughness: 0.7,
        metalness: 0.2
    });
    
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
    
    const modelPath = 'assets/models/elephant/scene.gltf';
    console.log('Attempting to load 3D model from:', modelPath);
    
    loader.load(
        modelPath, 
        function(gltf) {
            if (loadingMessage.parentNode) {
                loadingMessage.parentNode.removeChild(loadingMessage);
            }
            
            console.log('Model loaded successfully');
            elephantModel = gltf.scene;
            
            elephantModel.traverse(function(child) {
                if (child.isMesh) {
                    child.material = material;
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            
            elephantModel.scale.set(modelConfig.scale, modelConfig.scale, modelConfig.scale);
            elephantModel.position.set(modelConfig.positionX, modelConfig.positionY, modelConfig.positionZ);
            elephantModel.rotation.y = modelConfig.rotationY;
            
            threeJsScene.add(elephantModel);
            modelLoaded = true;
        },
        function(xhr) {
            if (xhr.lengthComputable) {
                const percentComplete = xhr.loaded / xhr.total * 100;
                console.log(percentComplete.toFixed(2) + '% loaded');
                loadingMessage.innerHTML = translations[currentLanguage].loadingModel + ' ' + percentComplete.toFixed(0) + '%';
            }
        },
        function(error) {
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
    
    errorElement.innerHTML = `
        <h3 style="margin-top:0">${translations[currentLanguage].modelLoadError}</h3>
        <p>${errorMessage}</p>
        <p>${translations[currentLanguage].modelLoadErrorMsg}</p>
        <p>${translations[currentLanguage].expectedPath}</p>
        <button id="error-close-btn" style="padding:8px 16px;background:#fff;color:#333;border:none;border-radius:4px;cursor:pointer;margin-top:10px;">${translations[currentLanguage].closeBtn}</button>
    `;
    
    sceneContainer.appendChild(errorElement);
    
    document.getElementById('error-close-btn').addEventListener('click', function() {
        if (errorElement.parentNode) {
            errorElement.parentNode.removeChild(errorElement);
        }
        restart();
    });
}

function animate() {
    if (!threeJsRenderer) return;
    
    requestAnimationFrame(animate);
    
    if (modelConfig.autoRotate && elephantModel) {
        elephantModel.rotation.y += modelConfig.rotationSpeed;
    }
    
    if (threeJsControls) {
        threeJsControls.update();
    }
    
    threeJsRenderer.render(threeJsScene, threeJsCamera);
}

function onWindowResize() {
    if (!threeJsCamera || !threeJsRenderer) return;
    
    console.log("Window resize triggered");
    
    threeJsCamera.aspect = sceneContainer.clientWidth / sceneContainer.clientHeight;
    threeJsCamera.updateProjectionMatrix();
    
    threeJsRenderer.setSize(sceneContainer.clientWidth, sceneContainer.clientHeight);
    
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
    modelLoaded = false;
    
    window.removeEventListener('resize', onWindowResize);
}

function saveImage() {
    if (!threeJsRenderer) return;
    
    const imageData = threeJsRenderer.domElement.toDataURL('image/png');
    
    const link = document.createElement('a');
    link.href = imageData;
    link.download = 'my-elephant.png';
    link.click();
}

// Initialize language
document.addEventListener('DOMContentLoaded', function() {
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'nl')) {
        setLanguage(savedLanguage);
    } else {
        const browserLang = navigator.language || navigator.userLanguage;
        if (browserLang && browserLang.startsWith('nl')) {
            setLanguage('nl');
        } else {
            setLanguage('en');
        }
    }
});