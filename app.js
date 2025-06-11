// Language translations
const translations = {
    en: {
        title: "TEMBO DRAWING AR EXPERIENCE",
        description: "Color the elephant template, then scan it to see your drawing come to life as an AR elephant!",
        startBtn: "Start Experience",
        templateBtn: "Download Template",
        captureBtn: "Capture",
        switchCameraBtn: "Switch Camera",
        backBtn: "Back",
        processingText: "Processing your elephant...",
        restartBtn: "Scan Another",
        saveBtn: "Save Image",
        loadingModel: "Loading AR model...",
        errorLoadingModel: "Failed to load AR model: ",
        modelLoadError: "AR Model Loading Error",
        modelLoadErrorMsg: "Please check your model path and file format.",
        expectedPath: "Expected path: assets/models/elephant/scene.gltf",
        closeBtn: "Close",
        permissionTitle: "Camera Access Required",
        permissionText1: "To scan your drawing, we need access to your camera.",
        permissionText2: "When prompted, please tap \"Allow\" to continue.",
        grantPermissionBtn: "Grant Camera Access",
        permissionDenied: "Camera access was denied. Please grant camera permission to use this feature.",
        arInstructions: "Hold your phone vertically and point camera at the AR marker",
        arDetected: "Template detected! Your elephant is alive!",
        arLost: "Template lost. Point camera at the colored template again.",
        captureArBtn: "Capture AR",
        cameraInstructions: "Hold your phone vertically and capture your colored elephant drawing"
    },
    nl: {
        title: "TEMBO TEKENING AR ERVARING",
        description: "Kleur de olifant sjabloon, scan het dan om je tekening tot leven te zien komen als een AR olifant!",
        startBtn: "Start Ervaring",
        templateBtn: "Sjabloon Downloaden",
        captureBtn: "Vastleggen",
        switchCameraBtn: "Camera Wisselen",
        backBtn: "Terug",
        processingText: "Je olifant verwerken...",
        restartBtn: "Nog Een Scannen",
        saveBtn: "Afbeelding Opslaan",
        loadingModel: "AR model laden...",
        errorLoadingModel: "Kan AR-model niet laden: ",
        modelLoadError: "Fout bij laden AR model",
        modelLoadErrorMsg: "Controleer je modelpad en bestandsformaat.",
        expectedPath: "Verwacht pad: assets/models/elephant/scene.gltf",
        closeBtn: "Sluiten",
        permissionTitle: "Camera Toegang Vereist",
        permissionText1: "Om je tekening te scannen, hebben we toegang tot je camera nodig.",
        permissionText2: "Wanneer gevraagd, tik op \"Toestaan\" om door te gaan.",
        grantPermissionBtn: "Geef Camera Toegang",
        permissionDenied: "Camera toegang is geweigerd. Geef alstublieft toestemming voor de camera om deze functie te gebruiken.",
        arInstructions: "Richt je camera op de AR marker en houd je telefoon verticaal",
        arDetected: "Sjabloon gedetecteerd! Je olifant is tot leven gekomen!",
        arLost: "Sjabloon verloren. Richt camera opnieuw op de gekleurde sjabloon.",
        captureArBtn: "AR Vastleggen",
        cameraInstructions: "Houd je telefoon verticaal en leg je gekleurde olifanttekening vast"
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
    
    // Store the selected language
    try {
        localStorage.setItem('preferredLanguage', lang);
    } catch (e) {
        console.log('Could not save language preference');
    }
}

// DOM Elements
const introScreen = document.getElementById('intro-screen');
const permissionScreen = document.getElementById('permission-screen');
const cameraScreen = document.getElementById('camera-screen');
const processingScreen = document.getElementById('processing-screen');
const arScreen = document.getElementById('ar-screen');

const startBtn = document.getElementById('start-btn');
const templateBtn = document.getElementById('template-btn');
const captureBtn = document.getElementById('capture-btn');
const backToIntroBtn = document.getElementById('back-to-intro-btn');
const restartBtn = document.getElementById('restart-btn');
const switchCameraBtn = document.getElementById('switch-camera-btn');
const grantPermissionBtn = document.getElementById('grant-permission-btn');
const backFromPermissionBtn = document.getElementById('back-from-permission-btn');
const captureArBtn = document.getElementById('capture-ar-btn');
const backToCameraBtn = document.getElementById('back-to-camera-btn');

const cameraFeed = document.getElementById('camera-feed');
const cameraCanvas = document.getElementById('camera-canvas');
const arInstructionText = document.getElementById('ar-instruction-text');

// App State
let cameraStream = null;
let capturedImage = null;
let arScene = null;
let elephantModel = null;
let availableCameras = [];
let currentCameraIndex = 0;
let isUsingBackCamera = true;
let arInitialized = false;
let targetDetected = false;

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
if (switchCameraBtn) {
    switchCameraBtn.addEventListener('click', switchCamera);
}
if (grantPermissionBtn) {
    grantPermissionBtn.addEventListener('click', requestCameraPermission);
}
if (backFromPermissionBtn) {
    backFromPermissionBtn.addEventListener('click', goToIntroScreen);
}
if (captureArBtn) {
    captureArBtn.addEventListener('click', captureARScreenshot);
}
if (backToCameraBtn) {
    backToCameraBtn.addEventListener('click', goToCameraScreen);
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
    stopAR();
    showScreen(introScreen);
}

function goToPermissionScreen() {
    showScreen(permissionScreen);
}

function goToCameraScreen() {
    stopAR();
    showScreen(cameraScreen);
    // Restart camera if needed
    if (!cameraStream) {
        initializeCamera();
    }
}


function goToARScreen() {
    stopCamera();
    showScreen(arScreen);
    
    // Hide collaboration logos during AR experience
    const collaborationLogos = document.querySelector('.collaboration-logos');
    if (collaborationLogos) {
        collaborationLogos.style.display = 'none';
    }
    
    // Force A-Frame to recalculate canvas size after screen transition
    setTimeout(() => {
        initializeAR();
        
        // Trigger resize event to force A-Frame canvas to update
        window.dispatchEvent(new Event('resize'));
        
        // Additional fallback: directly call A-Frame's resize if available
        if (arScene && arScene.resize) {
            arScene.resize();
        }
        
        // Alternative approach: force canvas size update
        const canvas = arScene?.canvas;
        if (canvas) {
            const rect = arScene.getBoundingClientRect();
            canvas.style.width = rect.width + 'px';
            canvas.style.height = rect.height + 'px';
            canvas.width = rect.width;
            canvas.height = rect.height;
        }
    }, 100); // Small delay to ensure DOM is updated
}

function restart() {
    stopCamera();
    stopAR();
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

// Image Processing for AR
function processImage() {
    console.log('Processing captured image for AR texture');
    
    // Set the captured texture source
    const textureImg = document.getElementById('capturedTexture');
    textureImg.src = capturedImage;
    
    textureImg.onload = () => {
        console.log('Captured texture loaded successfully');
        goToARScreen();
    };
    
    textureImg.onerror = (error) => {
        console.error('Error loading captured texture:', error);
        alert('Failed to process your image. Please try again.');
        showScreen(cameraScreen);
    };
}

// Template Functions
function downloadTemplate() {
    const link = document.createElement('a');
    link.href = 'your-elephant-template.pdf';
    link.download = 'elephant-template.pdf';
    link.click();
}

// AR Functions
function initializeAR() {
    if (arInitialized) {
        console.log('AR already initialized');
        // Even if initialized, force a resize to ensure proper display
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 50);
        return;
    }
    
    console.log('Initializing AR scene');
    arScene = document.getElementById('ar-scene');
    
    if (!arScene) {
        console.error('AR scene not found');
        return;
    }
    
    // Ensure the scene is visible and has dimensions
    const forceSceneUpdate = () => {
        // Force the scene to be visible
        arScene.style.display = 'block';
        arScene.style.width = '100%';
        arScene.style.height = '100%';
        
        // Trigger resize events
        window.dispatchEvent(new Event('resize'));
        
        // Force A-Frame to recalculate if method exists
        if (arScene.resize) {
            arScene.resize();
        }
        
        // Update canvas dimensions
        const canvas = arScene.canvas;
        if (canvas) {
            const container = arScene.parentElement;
            if (container) {
                const rect = container.getBoundingClientRect();
                canvas.style.width = rect.width + 'px';
                canvas.style.height = rect.height + 'px';
                
                // Set actual canvas size for proper rendering
                const dpr = window.devicePixelRatio || 1;
                canvas.width = rect.width * dpr;
                canvas.height = rect.height * dpr;
            }
        }
    };
    
    // Wait for A-Frame to be ready
    arScene.addEventListener('loaded', function() {
        console.log('A-Frame scene loaded');
        setupAREventListeners();
        applyTextureToModel();
        
        // Force update after loading
        setTimeout(forceSceneUpdate, 100);
    });
    
    // If already loaded
    if (arScene.hasLoaded) {
        console.log('A-Frame scene already loaded');
        setupAREventListeners();
        applyTextureToModel();
        
        // Force update immediately
        setTimeout(forceSceneUpdate, 50);
    } else {
        // Force update even if not loaded yet
        setTimeout(forceSceneUpdate, 100);
    }
    
    arInitialized = true;
}

function setupAREventListeners() {
    const arSystem = arScene.systems['mindar-image-system'];
    
    if (arSystem) {
        // Target found
        arSystem.el.addEventListener('targetFound', () => {
            console.log('AR target found');
            targetDetected = true;
            updateARInstructions(translations[currentLanguage].arDetected);
        });
        
        // Target lost
        arSystem.el.addEventListener('targetLost', () => {
            console.log('AR target lost');
            targetDetected = false;
            updateARInstructions(translations[currentLanguage].arLost);
        });
    }
    
    // Model loaded event
    const elephantModelEl = document.getElementById('elephant-model');
    if (elephantModelEl) {
        elephantModelEl.addEventListener('model-loaded', () => {
            console.log('Elephant model loaded in AR scene');
            applyTextureToModel();
        });
    }
}

function applyTextureToModel() {
    const elephantModelEl = document.getElementById('elephant-model');
    const textureImg = document.getElementById('capturedTexture');
    
    if (!elephantModelEl || !textureImg || !textureImg.src) {
        console.log('Model or texture not ready yet');
        return;
    }
    
    console.log('Applying captured texture to AR model');
    
    // Wait for model to be fully loaded
    elephantModelEl.addEventListener('model-loaded', () => {
        const model = elephantModelEl.getObject3D('mesh');
        if (model) {
            model.traverse((child) => {
                if (child.isMesh && child.material) {
                    // Create new material with captured texture
                    const texture = new THREE.TextureLoader().load(textureImg.src);
                    const material = new THREE.MeshStandardMaterial({
                        map: texture,
                        roughness: 0.7,
                        metalness: 0.2
                    });
                    child.material = material;
                    console.log('Applied texture to mesh:', child.name);
                }
            });
        }
    });
    
    // If model is already loaded
    const model = elephantModelEl.getObject3D('mesh');
    if (model) {
        model.traverse((child) => {
            if (child.isMesh && child.material) {
                const texture = new THREE.TextureLoader().load(textureImg.src);
                const material = new THREE.MeshStandardMaterial({
                    map: texture,
                    roughness: 0.7,
                    metalness: 0.2
                });
                child.material = material;
                console.log('Applied texture to mesh:', child.name);
            }
        });
    }
}

function updateARInstructions(text) {
    if (arInstructionText) {
        arInstructionText.textContent = text;
    }
}

function stopAR() {
    if (arScene && arInitialized) {
        console.log('Stopping AR scene');
        // Reset AR state
        targetDetected = false;
        arInitialized = false;
        
        // Reset instruction text
        updateARInstructions(translations[currentLanguage].arInstructions);
    }
}

function captureARScreenshot() {
    if (!arScene) {
        console.error('AR scene not available for screenshot');
        return;
    }
    
    try {
        const canvas = arScene.canvas;
        if (canvas) {
            const imageData = canvas.toDataURL('image/png');
            
            const link = document.createElement('a');
            link.href = imageData;
            link.download = 'my-ar-elephant.png';
            link.click();
            
            console.log('AR screenshot captured');
        } else {
            console.error('Canvas not found in AR scene');
        }
    } catch (error) {
        console.error('Error capturing AR screenshot:', error);
        alert('Failed to capture screenshot. Please try again.');
    }
}

// Initialize language
document.addEventListener('DOMContentLoaded', function() {
    let savedLanguage = null;
    try {
        savedLanguage = localStorage.getItem('preferredLanguage');
    } catch (e) {
        console.log('Could not access localStorage');
    }
    
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
