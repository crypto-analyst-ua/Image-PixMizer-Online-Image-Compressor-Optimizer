// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCFt14JeU4qGlPScGGXnFdKRwZ8iV8oZQY",
  authDomain: "image-pixmizer.firebaseapp.com",
  projectId: "image-pixmizer",
  storageBucket: "image-pixmizer.firebasestorage.app",
  messagingSenderId: "310177828908",
  appId: "1:310177828908:web:264aa42b38b5cbb50fc189"
};

// Free version limits
const FREE_LIMITS = {
    DAILY: 15,
    PER_BATCH: 5,
    MAX_SIZE: 7 * 1024 * 1024,
    FORMATS: ['jpeg', 'png', 'webp']
};

// Premium version limits
const PREMIUM_LIMITS = {
    DAILY: 1000,
    PER_BATCH: 50,
    MAX_SIZE: 50 * 1024 * 1024,
    FORMATS: ['jpeg', 'png', 'webp', 'avif', 'heic', 'tiff']
};

// State management
const state = {
    originalFiles: [],
    optimizedFiles: [],
    currentFileIndex: 0,
    rotation: 0,
    flipHorizontal: false,
    crop: null,
    history: JSON.parse(localStorage.getItem('imageopt-history')) || [],
    editingMode: false,
    cropRatio: 'free',
    cropBox: null,
    avifSupported: true,
    heicSupported: false,
    tiffSupported: true,
    isPremium: localStorage.getItem('premiumUser') === 'true',
    isTrial: localStorage.getItem('trialUser') === 'true',
    trialDaysLeft: parseInt(localStorage.getItem('trialDaysLeft')) || 0,
    trialEndDate: localStorage.getItem('trialEndDate'),
    user: null,
    cropMode: false,
    cropping: false,
    cropStartX: 0,
    cropStartY: 0,
    cropCurrentX: 0,
    cropCurrentY: 0,
    firebaseInitialized: false,
    db: null,
    resizing: false,
    resizeHandle: null,
    dailyCount: 0,
    lastProcessDate: null,
    batchEditMode: 'all',
    watermark: {
        enabled: false,
        type: 'text', // 'text' или 'image'
        text: 'Image Pixmizer',
        size: 24,
        opacity: 70,
        color: '#ffffff',
        position: 'bottom-right',
        image: null, // для хранения файла изображения
        imageUrl: null, // для хранения Data URL
        scale: 20 // масштаб изображения в %
    },
    progressiveJpeg: false,
    removeMetadata: true,
    pngCompression: 'auto',
    savedProfiles: JSON.parse(localStorage.getItem('savedProfiles')) || [],
    adjustments: {
        brightness: 0,
        contrast: 0,
        saturation: 0,
        sharpness: 0,
        temperature: 0
    },
    cropper: null // Для хранения экземпляра Cropper
};

// DOM Elements
const elements = {
    uploadArea: document.getElementById('uploadArea'),
    fileInput: document.getElementById('fileInput'),
    filePreviews: document.getElementById('filePreviews'),
    qualityRange: document.getElementById('quality'),
    qualityValue: document.getElementById('qualityValue'),
    formatSelect: document.getElementById('format'),
    maxWidthSelect: document.getElementById('maxWidth'),
    processing: document.getElementById('processing'),
    previewSection: document.getElementById('previewSection'),
    previewContainer: document.getElementById('previewContainer'),
    stats: document.getElementById('stats'),
    downloadBtn: document.getElementById('downloadBtn'),
    resetBtn: document.getElementById('resetBtn'),
    processBtn: document.getElementById('processBtn'),
    historyToggle: document.getElementById('historyToggle'),
    historyPanel: document.getElementById('historyPanel'),
    closeHistory: document.getElementById('closeHistory'),
    historyList: document.getElementById('historyList'),
    cropBtn: document.getElementById('cropBtn'),
    rotateLeftBtn: document.getElementById('rotateLeftBtn'),
    rotateRightBtn: document.getElementById('rotateRightBtn'),
    flipHBtn: document.getElementById('flipHBtn'),
    adjustBtn: document.getElementById('adjustBtn'),
    resetEditBtn: document.getElementById('resetEditBtn'),
    previewImage: document.getElementById('previewImage'),
    editorContainer: document.getElementById('editorContainer'),
    cropControls: document.getElementById('cropControls'),
    applyCropBtn: document.getElementById('applyCropBtn'),
    cancelCropBtn: document.getElementById('cancelCropBtn'),
    cropRatios: document.querySelectorAll('.crop-ratio'),
    editNotification: document.getElementById('editNotification'),
    cropOverlay: document.getElementById('cropOverlay'),
    progressText: document.getElementById('progressText'),
    progressBar: document.getElementById('progressBar'),
    autoOptimizeCheckbox: document.getElementById('autoOptimizeCheckbox'),
    toast: document.getElementById('toast'),
    userEmail: document.getElementById('userEmail'),
    premiumStatus: document.getElementById('premiumStatus'),
    upgradeBtn: document.getElementById('upgradeBtn'),
    logoutBtn: document.getElementById('logoutBtn'),
    dailyCounter: document.getElementById('dailyCounter'),
    dailyCount: document.getElementById('dailyCount'),
    dailyLimit: document.getElementById('dailyLimit'),
    editSingleBtn: document.getElementById('editSingleBtn'),
    editAllBtn: document.getElementById('editAllBtn'),
    batchEditNotice: document.getElementById('batchEditNotice'),
    watermarkControls: document.getElementById('watermarkControls'),
    watermarkText: document.getElementById('watermarkText'),
    watermarkSize: document.getElementById('watermarkSize'),
    watermarkSizeValue: document.getElementById('watermarkSizeValue'),
    watermarkOpacity: document.getElementById('watermarkOpacity'),
    watermarkOpacityValue: document.getElementById('watermarkOpacityValue'),
    watermarkColor: document.getElementById('watermarkColor'),
    watermarkPosition: document.getElementById('watermarkPosition'),
    watermarkPreview: document.getElementById('watermarkPreview'),
    toggleAdvancedSettings: document.getElementById('toggleAdvancedSettings'),
    advancedSettings: document.getElementById('advancedSettings'),
    enableWatermark: document.getElementById('enableWatermark'),
    progressiveJpeg: document.getElementById('progressiveJpeg'),
    removeMetadata: document.getElementById('removeMetadata'),
    pngCompression: document.getElementById('pngCompression'),
    saveSettingsBtn: document.getElementById('saveSettingsBtn'),
    touchRotateLeft: document.getElementById('touchRotateLeft'),
    touchRotateRight: document.getElementById('touchRotateRight'),
    touchFlipH: document.getElementById('touchFlipH'),
    touchCrop: document.getElementById('touchCrop'),
    touchAdjust: document.getElementById('touchAdjust'),
    brightnessRange: document.getElementById('brightnessRange'),
    contrastRange: document.getElementById('contrastRange'),
    saturationRange: document.getElementById('saturationRange'),
    sharpnessRange: document.getElementById('sharpnessRange'),
    temperatureRange: document.getElementById('temperatureRange'),
    brightnessValue: document.getElementById('brightnessValue'),
    contrastValue: document.getElementById('contrastValue'),
    saturationValue: document.getElementById('saturationValue'),
    sharpnessValue: document.getElementById('sharpnessValue'),
    temperatureValue: document.getElementById('temperatureValue'),
    applyAdjustBtn: document.getElementById('applyAdjustBtn'),
    resetAdjustBtn: document.getElementById('resetAdjustBtn'),
    adjustControls: document.getElementById('adjustControls'),
    autoAdjustBtn: document.getElementById('autoAdjustBtn'),
    touchAutoAdjust: document.getElementById('touchAutoAdjust'),
    watermarkTextSection: document.querySelector('.watermark-text-section'),
    watermarkImageSection: document.querySelector('.watermark-image-section'),
    watermarkImagePreview: document.getElementById('watermarkImagePreview'),
    watermarkImageInput: document.getElementById('watermarkImageInput')
};

// Получение текущих лимитов на основе статуса пользователя
function getCurrentLimits() {
    return (state.isPremium || state.isTrial) ? PREMIUM_LIMITS : FREE_LIMITS;
}

// Проверка доступа к функциям
function checkFeatureAccess(feature) {
    // Все функции доступны во время пробного периода и для премиум-пользователей
    if (state.isTrial || state.isPremium) return true;
    
    // Бесплатные функции всегда доступны
    const freeFeatures = ['imageOptimization', 'basicEditing'];
    if (freeFeatures.includes(feature)) return true;
    
    // Премиум функции требуют подписки
    return false;
}

// Show premium required modal with options
function showPremiumRequiredModal(feature) {
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.className = 'premium-modal';
        modal.innerHTML = `
            <div class="premium-modal-content">
                <h3><i class="fas fa-crown"></i> Premium Feature</h3>
                <p>This feature requires a Premium subscription or active trial period.</p>
                <div class="premium-modal-actions">
                    <button class="btn btn-secondary" id="premiumModalTrial">
                        <i class="fas fa-clock"></i> Start Free Trial
                    </button>
                    <button class="btn" id="premiumModalUpgrade">
                        <i class="fas fa-crown"></i> Upgrade to Premium
                    </button>
                    <button class="btn btn-secondary" id="premiumModalCancel">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners
        document.getElementById('premiumModalTrial').addEventListener('click', function() {
            document.body.removeChild(modal);
            resolve('trial');
        });
        
        document.getElementById('premiumModalUpgrade').addEventListener('click', function() {
            document.body.removeChild(modal);
            resolve('upgrade');
        });
        
        document.getElementById('premiumModalCancel').addEventListener('click', function() {
            document.body.removeChild(modal);
            resolve('cancel');
        });
    });
}

// Activate trial period
async function activateTrial() {
    try {
        if (!state.firebaseInitialized || !state.user || state.user.uid === "guest") {
            throw new Error("User must be registered to activate trial");
        }

        // Set trial period in Firebase
        await state.db.collection('users').doc(state.user.uid).set({
            trialStart: new Date(),
            trialEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days
        }, { merge: true });

        // Update local state
        state.isTrial = true;
        state.trialDaysLeft = 14;
        state.isPremium = true;
        
        // Update UI
        updatePremiumUI();
        showToast("Free trial activated for 14 days!");
        
    } catch (error) {
        console.error("Error activating trial:", error);
        showToast("Error activating trial. Please try again.");
    }
}

// Настройка обработчиков для кнопок навигации
function setupNavigationHandlers() {
    const premiumFeatures = {
        'createPdfBtn': 'pdfCreation',
        'extractPdfImagesBtn': 'pdfExtraction',
        'pdfCompressorBtn': 'pdfCompression',
        'pdfMergerBtn': 'pdfMerging',
        'pdfToWordExcelBtn': 'pdfConversion',
        'batchRenameBtn': 'batchRename',
        'exifEditorBtn': 'exifEditing',
        'collageMakerBtn': 'collageMaking',
        'improveQualityBtn': 'qualityEnhancement',
        'previewMockupBtn': 'mockupGeneration',
        'colorPaletteBtn': 'colorExtraction',
        'svgConverterBtn': 'svgConversion',
        'multiFormatConverterBtn': 'multiFormatConversion'
    };

    const pageUrls = {
        'createPdfBtn': 'PDF.html',
        'extractPdfImagesBtn': 'PDF2.html',
        'pdfCompressorBtn': 'PDF Compressor.html',
        'pdfMergerBtn': 'PDF Merger.html',
        'pdfToWordExcelBtn': 'PDF to Word or Excel.html',
        'batchRenameBtn': 'Batch rename files.html',
        'exifEditorBtn': 'EXIF editor.html',
        'collageMakerBtn': 'Photo Collage Maker.html',
        'improveQualityBtn': 'Improved image quality.html',
        'previewMockupBtn': 'Preview Mockup Generator.html',
        'colorPaletteBtn': 'Color Palette Extractor.html',
        'svgConverterBtn': 'Professional SVG Converter.html',
        'multiFormatConverterBtn': 'Multi-format Image Converter.html'
    };

    Object.keys(premiumFeatures).forEach(buttonId => {
        const button = document.getElementById(buttonId);
        if (button) {
            button.addEventListener('click', async function(e) {
                e.preventDefault();
                const feature = premiumFeatures[buttonId];
                
                if (!checkFeatureAccess(feature)) {
                    const result = await showPremiumRequiredModal(feature);
                    
                    if (result === 'trial') {
                        if (state.user && state.user.uid !== "guest") {
                            // Activate trial for logged-in user
                            await activateTrial();
                            window.location.href = pageUrls[buttonId];
                        } else {
                            // Redirect to auth page for guests
                            showToast("Please register to start free trial");
                            setTimeout(() => window.location.href = 'auth.html', 2000);
                        }
                    } else if (result === 'upgrade') {
                        window.location.href = 'pay.html';
                    }
                    // If cancel, do nothing
                } else {
                    window.location.href = pageUrls[buttonId];
                }
            });
        }
    });
}

// Инициализация Cropper
function initCropper() {
    state.cropper = null;
}

// Toggle crop mode
function toggleCropMode() {
    if (!checkFeatureAccess('basicEditing')) {
        showPremiumRequiredModal('basicEditing');
        return;
    }
    
    if (state.cropMode && state.cropper) {
        destroyCropper();
        elements.cropControls.style.display = 'none';
        state.cropMode = false;
        return;
    }
    
    // Активировать режим обрезки
    state.cropMode = true;
    elements.cropControls.style.display = 'grid';
    initCrop();
}

// Инициализация обрезки
function initCrop() {
    const image = elements.previewImage;
    if (!image.src) return;
    
    // Создаем клон изображения для Cropper
    const clone = image.cloneNode(true);
    clone.id = "cropper-image";
    clone.style.maxWidth = "100%";
    clone.style.maxHeight = "80vh";
    
    elements.cropOverlay.innerHTML = '';
    elements.cropOverlay.appendChild(clone);
    elements.cropOverlay.style.display = 'block'; // Отображаем overlay
    
    // Инициализация Cropper.js
    state.cropper = new Cropper(clone, {
        aspectRatio: getAspectRatio(),
        viewMode: 1,
        autoCropArea: 1,
        movable: true,
        zoomable: true,
        rotatable: false,
        scalable: false,
        toggleDragModeOnDblclick: false,
        cropBoxMovable: true,
        cropBoxResizable: true,
        guides: true,
        center: true,
        highlight: true,
        background: true,
        responsive: true,
        restore: true,
        checkCrossOrigin: false,
        checkOrientation: false,
        modal: true,
    });
}

// Получение соотношения сторон
function getAspectRatio() {
    if (state.cropRatio === 'free') return NaN;
    const [width, height] = state.cropRatio.split(':').map(Number);
    return width / height;
}

// Уничтожение Cropper
function destroyCropper() {
    if (state.cropper) {
        state.cropper.destroy();
        state.cropper = null;
    }
    elements.cropControls.style.display = 'none';
    elements.cropOverlay.innerHTML = '';
    elements.cropOverlay.style.display = 'none'; // Скрываем overlay
    state.cropMode = false;
}

// Apply crop
function applyCrop() {
    if (!state.cropper) return;
    
    // Получаем данные обрезки
    const canvas = state.cropper.getCroppedCanvas();
    if (!canvas) return;
    
    canvas.toBlob(blob => {
        const originalFile = state.originalFiles[state.currentFileIndex];
        const newFile = new File([blob], originalFile.name, {
            type: originalFile.type || 'image/jpeg'
        });
        
        // Заменяем оригинальный файл
        state.originalFiles[state.currentFileIndex] = newFile;
        
        // Обновляем превью в редакторе
        elements.previewImage.src = URL.createObjectURL(newFile);
        
        // Обновляем превью в списке файлов
        updateSingleFilePreview(state.currentFileIndex);
        
        // Закрываем режим обрезки
        destroyCropper();
        
        showEditNotification('Crop applied!');
    }, 'image/jpeg', 0.95);
}

// Обновить превью одного файла в списке
function updateSingleFilePreview(index) {
    const previews = elements.filePreviews.querySelectorAll('.file-preview');
    if (index >= previews.length) return;

    const preview = previews[index];
    const file = state.originalFiles[index];
    const reader = new FileReader();

    reader.onload = function(e) {
        const img = preview.querySelector('img');
        const fileNameDiv = preview.querySelector('.file-name');
        if (img) img.src = e.target.result;
        if (fileNameDiv) fileNameDiv.textContent = file.name;
    };

    reader.readAsDataURL(file);
}

// Cancel crop
function cancelCrop() {
    destroyCropper();
    showEditNotification('Crop canceled!');
}

// Check premium status
async function checkPremiumStatus(force = false) {
    // Если не принудительно и уже проверяли, то пропускаем
    if (!force && localStorage.getItem('premiumChecked') === 'true') {
        updatePremiumUI(); // Обновляем UI на основе текущего state.isPremium
        return;
    }

    if (!state.firebaseInitialized || !state.user || state.user.uid === "guest") {
        state.isPremium = false;
        state.isTrial = false;
        updatePremiumUI();
        localStorage.setItem('premiumChecked', 'true'); // Помечаем, что проверка выполнена
        return;
    }

    try {
        const doc = await state.db.collection('users').doc(state.user.uid).get();
        if (doc.exists) {
            const userData = doc.data();
            const premium = userData.premium || false;
            const trialStart = userData.trialStart;
            
            // Проверка пробного периода
            let isTrial = false;
            let trialDaysLeft = 0;
            let trialEndDate = null;
            
            if (trialStart && !premium) {
                const trialStartDate = trialStart.toDate();
                trialEndDate = new Date(trialStartDate);
                trialEndDate.setDate(trialStartDate.getDate() + 14);
                isTrial = new Date() < trialEndDate;
                
                if (isTrial) {
                    const diffTime = trialEndDate - new Date();
                    trialDaysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                }
            }
            
            state.isPremium = premium || isTrial;
            state.isTrial = isTrial;
            state.trialDaysLeft = trialDaysLeft;
            state.trialEndDate = trialEndDate;
            
            localStorage.setItem('premiumUser', state.isPremium);
            localStorage.setItem('trialUser', state.isTrial);
            localStorage.setItem('trialDaysLeft', state.trialDaysLeft);
            if (trialEndDate) {
                localStorage.setItem('trialEndDate', trialEndDate.toISOString());
            }
        }
        updatePremiumUI();
    } catch (error) {
        console.error("Error getting premium status:", error);
        state.isPremium = false;
        state.isTrial = false;
        updatePremiumUI();
    }
    localStorage.setItem('premiumChecked', 'true'); // Помечаем, что проверка выполнена
}

// Initialize application
async function init() {
    // Initialize counter
    state.dailyCount = parseInt(localStorage.getItem('dailyCount')) || 0;
    state.lastProcessDate = localStorage.getItem('lastProcessDate');
    updateDailyCounter();
    
    // Проверяем поддержку HEIC
    state.heicSupported = typeof heic2any !== 'undefined';
    if (!state.heicSupported) {
        console.warn("HEIC conversion requires heic2any library");
    }
    
    // Проверяем пробный период в localStorage
    const savedTrial = localStorage.getItem('trialUser');
    const savedTrialDays = localStorage.getItem('trialDaysLeft');
    if (savedTrial === 'true' && savedTrialDays) {
        state.isTrial = true;
        state.trialDaysLeft = parseInt(savedTrialDays);
    }
    
    try {
        // Initialize Firebase
        if (typeof firebase !== 'undefined' && firebase.apps.length === 0) {
            firebase.initializeApp(firebaseConfig);
            state.firebaseInitialized = true;
            state.db = firebase.firestore();
            
            // Check authentication
            firebase.auth().onAuthStateChanged(async user => {
                if (user) {
                    state.user = user;
                    elements.userEmail.textContent = user.email;
                    // Принудительная проверка премиум-статуса
                    await checkPremiumStatus(true);
                } else {
                    // Guest mode
                    state.user = { email: "guest@example.com", uid: "guest" };
                    elements.userEmail.textContent = "Guest";
                    state.isPremium = false;
                    state.isTrial = false;
                    updatePremiumUI();
                }
                renderHistory();
            });
        } else {
            console.warn("Firebase not loaded");
            // Offline mode
            state.user = { email: "guest@example.com", uid: "guest" };
            elements.userEmail.textContent = "Guest";
            state.isPremium = false;
            state.isTrial = false;
            updatePremiumUI();
            renderHistory();
        }
    } catch (e) {
        console.error("Firebase error:", e);
        // Offline mode on error
        state.user = { email: "guest@example.com", uid: "guest" };
        elements.userEmail.textContent = "Guest (offline)";
        state.isPremium = false;
        state.isTrial = false;
        updatePremiumUI();
        renderHistory();
    }
    
    // Check AVIF support
    await checkAvifSupport();
    
    // Инициализация Cropper
    initCropper();
    
    setupEventListeners();
    initEnhancements();
    setupNavigationHandlers();
}

// Initialize new features
function initEnhancements() {
    // Initialize watermarks
    elements.watermarkText.value = state.watermark.text;
    elements.watermarkSize.value = state.watermark.size;
    elements.watermarkSizeValue.textContent = `${state.watermark.size}px`;
    elements.watermarkOpacity.value = state.watermark.opacity;
    elements.watermarkOpacityValue.textContent = `${state.watermark.opacity}%`;
    elements.watermarkColor.value = state.watermark.color;
    elements.watermarkPosition.value = state.watermark.position;
    
    // Инициализация элементов управления водяным знаком
    elements.watermarkTextSection = document.querySelector('.watermark-text-section');
    elements.watermarkImageSection = document.querySelector('.watermark-image-section');
    elements.watermarkImagePreview = document.getElementById('watermarkImagePreview');
    elements.watermarkImageInput = document.getElementById('watermarkImageInput');
    elements.watermarkImageScale = document.getElementById('watermarkImageScale');
    
    // Устанавливаем начальное состояние
    state.watermark.type = 'text'; // по умолчанию текст
    elements.watermarkImageSection.style.display = 'none'; // скрываем секцию изображения
    elements.watermarkImagePreview.style.display = 'none'; // скрываем предпросмотр изображения

    // Устанавливаем обработчик для кнопок переключения типа
    document.querySelectorAll('.watermark-type-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.type === state.watermark.type);
    });

    // Устанавливаем значение масштаба
    elements.watermarkImageScale.value = state.watermark.scale;
    document.getElementById('watermarkImageScaleValue').textContent = `${state.watermark.scale}%`;
    
    updateWatermarkPreview();
    
    // Initialize advanced settings
    elements.progressiveJpeg.checked = state.progressiveJpeg;
    elements.removeMetadata.checked = state.removeMetadata;
    elements.pngCompression.value = state.pngCompression;
    elements.enableWatermark.checked = state.watermark.enabled;
    
    // Initialize adjustments
    applyAdjustmentsToControls();
    
    // Event handlers for new elements
    setupEnhancementEventListeners();
}

// Setup event handlers for enhancements
function setupEnhancementEventListeners() {
    // Batch editing
    elements.editSingleBtn.addEventListener('click', () => setBatchEditMode('single'));
    elements.editAllBtn.addEventListener('click', () => setBatchEditMode('all'));
    
    // Watermarks
    elements.enableWatermark.addEventListener('change', toggleWatermarkControls);
    
    // Переключение между текстом и изображением
    document.querySelectorAll('.watermark-type-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.watermark-type-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            state.watermark.type = this.dataset.type;
            
            if (state.watermark.type === 'text') {
                elements.watermarkTextSection.style.display = 'block';
                elements.watermarkImageSection.style.display = 'none';
                elements.watermarkPreview.style.display = 'block';
                elements.watermarkImagePreview.style.display = 'none';
            } else {
                elements.watermarkTextSection.style.display = 'none';
                elements.watermarkImageSection.style.display = 'block';
                elements.watermarkPreview.style.display = 'none';
                elements.watermarkImagePreview.style.display = 'block';
            }
            
            updateWatermarkPreview();
        });
    });
    
    elements.watermarkText.addEventListener('input', updateWatermarkPreview);
    elements.watermarkSize.addEventListener('input', updateWatermarkSize);
    elements.watermarkOpacity.addEventListener('input', updateWatermarkOpacity);
    elements.watermarkColor.addEventListener('input', updateWatermarkPreview);
    elements.watermarkPosition.addEventListener('change', updateWatermarkPreview);
    
    // Загрузка изображения для водяного знака
    elements.watermarkImageInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                state.watermark.image = file;
                state.watermark.imageUrl = event.target.result;
                elements.watermarkImagePreview.src = event.target.result;
                updateWatermarkPreview();
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Масштаб изображения
    elements.watermarkImageScale.addEventListener('input', function() {
        state.watermark.scale = parseInt(this.value);
        document.getElementById('watermarkImageScaleValue').textContent = `${state.watermark.scale}%`;
        updateWatermarkPreview();
    });
    
    // Advanced settings
    elements.toggleAdvancedSettings.addEventListener('click', toggleAdvancedSettings);
    elements.progressiveJpeg.addEventListener('change', function() {
        state.progressiveJpeg = this.checked;
    });
    elements.removeMetadata.addEventListener('change', function() {
        state.removeMetadata = this.checked;
    });
    elements.pngCompression.addEventListener('change', function() {
        state.pngCompression = this.value;
    });
    
    // Save profile
    elements.saveSettingsBtn.addEventListener('click', saveProfile);
    
    // Touch controls
    elements.touchRotateLeft.addEventListener('click', () => rotateImage(-90));
    elements.touchRotateRight.addEventListener('click', () => rotateImage(90));
    elements.touchFlipH.addEventListener('click', flipImageHorizontal);
    elements.touchCrop.addEventListener('click', toggleCropMode);
    elements.touchAdjust.addEventListener('click', toggleAdjustPanel);
    
    // Image adjustments
    elements.adjustBtn.addEventListener('click', toggleAdjustPanel);
    elements.brightnessRange.addEventListener('input', updateBrightnessValue);
    elements.contrastRange.addEventListener('input', updateContrastValue);
    elements.saturationRange.addEventListener('input', updateSaturationValue);
    elements.sharpnessRange.addEventListener('input', updateSharpnessValue);
    elements.temperatureRange.addEventListener('input', updateTemperatureValue);
    elements.applyAdjustBtn.addEventListener('click', applyAdjustments);
    elements.resetAdjustBtn.addEventListener('click', resetAdjustments);
    
    // Auto adjust buttons
    elements.autoAdjustBtn.addEventListener('click', autoAdjustImage);
    elements.touchAutoAdjust.addEventListener('click', autoAdjustImage);
}

// Auto adjust image
function autoAdjustImage() {
    if (!checkFeatureAccess('basicEditing')) {
        showPremiumRequiredModal('basicEditing');
        return;
    }
    
    // Оптимальные значения для автонастройки
    const autoSettings = {
        brightness: 0,    // Яркость - без изменений
        contrast: 10,     // Умеренное увеличение контраста
        saturation: 15,   // Легкое увеличение насыщенности
        sharpness: 50,    // Значение для УВЕЛИЧЕНИЯ резкости
        temperature: 0    // Без коррекции температуры
    };

    // Применяем автонастройки
    state.adjustments = {...autoSettings};
    
    // Обновляем UI
    elements.brightnessRange.value = autoSettings.brightness;
    elements.contrastRange.value = autoSettings.contrast;
    elements.saturationRange.value = autoSettings.saturation;
    elements.sharpnessRange.value = autoSettings.sharpness;
    elements.temperatureRange.value = autoSettings.temperature;
    
    elements.brightnessValue.textContent = `${autoSettings.brightness}%`;
    elements.contrastValue.textContent = `${autoSettings.contrast}%`;
    elements.saturationValue.textContent = `${autoSettings.saturation}%`;
    elements.sharpnessValue.textContent = `${autoSettings.sharpness}%`;
    elements.temperatureValue.textContent = `${autoSettings.temperature}%`;
    
    applyPreviewAdjustments();
    showEditNotification('Auto adjustments applied!');
}

// Apply adjustments to controls
function applyAdjustmentsToControls() {
    elements.brightnessRange.value = state.adjustments.brightness;
    elements.contrastRange.value = state.adjustments.contrast;
    elements.saturationRange.value = state.adjustments.saturation;
    elements.sharpnessRange.value = state.adjustments.sharpness;
    elements.temperatureRange.value = state.adjustments.temperature;
    
    updateBrightnessValue();
    updateContrastValue();
    updateSaturationValue();
    updateSharpnessValue();
    updateTemperatureValue();
}

// Update daily usage counter
function updateDailyCounter() {
    const today = new Date().toDateString();
    // Reset counter if new day
    if (state.lastProcessDate !== today) {
        state.dailyCount = 0;
        localStorage.setItem('dailyCount', 0);
        localStorage.setItem('lastProcessDate', today);
        state.lastProcessDate = today;
    }

    // Update UI
    elements.dailyCount.textContent = state.dailyCount;
    
    const limits = getCurrentLimits();
    elements.dailyLimit.textContent = (state.isPremium || state.isTrial) ? '∞' : limits.DAILY;
    
    // Hide counter for premium users and trial users
    elements.dailyCounter.style.display = (state.isPremium || state.isTrial) ? 'none' : 'flex';
}

// Update premium UI
function updatePremiumUI() {
    if (state.isTrial) {
        elements.premiumStatus.textContent = `Trial (${state.trialDaysLeft} days)`;
        elements.premiumStatus.style.background = 'linear-gradient(135deg, #4a6bff, #8a2be2)';
        elements.premiumStatus.style.color = '#fff';
        elements.upgradeBtn.style.display = 'block';
    } else if (state.isPremium) {
        elements.premiumStatus.textContent = 'Premium';
        elements.premiumStatus.style.background = 'linear-gradient(135deg, #ffd700, #ff9800)';
        elements.premiumStatus.style.color = '#333';
        elements.upgradeBtn.style.display = 'none';
    } else {
        elements.premiumStatus.textContent = 'Basic';
        elements.premiumStatus.style.background = '#a5b1c2';
        elements.premiumStatus.style.color = '#fff';
        elements.upgradeBtn.style.display = 'block';
    }
    
    const limits = getCurrentLimits();
    elements.dailyLimit.textContent = (state.isPremium || state.isTrial) ? '∞' : limits.DAILY;
    elements.dailyCounter.style.display = (state.isPremium || state.isTrial) ? 'none' : 'flex';
    
    // Форматы для премиум и trial пользователей
    if (state.isPremium || state.isTrial) {
        // Enable AVIF for premium users
        const avifOption = document.querySelector('#format option[value="avif"]');
        if (avifOption) avifOption.disabled = false;
        
        // Enable HEIC for premium users if supported
        const heicOption = document.querySelector('#format option[value="heic"]');
        if (heicOption) {
            heicOption.disabled = !state.heicSupported;
        }
        
        // Enable TIFF for premium users
        const tiffOption = document.querySelector('#format option[value="tiff"]');
        if (tiffOption) tiffOption.disabled = false;
    } else {
        // Бесплатные пользователи: только jpeg, png, webp
        const allowedFormats = ['jpeg', 'png', 'webp'];
        document.querySelectorAll('#format option').forEach(option => {
            if (!allowedFormats.includes(option.value)) {
                option.disabled = true;
            } else {
                option.disabled = false;
            }
        });
    }
}

// Check AVIF support
async function checkAvifSupport() {
    const avifImage = new Image();
    avifImage.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sob3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+EERQ==';
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    state.avifSupported = avifImage.height === 1;
    
    if (!state.avifSupported) {
        const avifOption = document.querySelector('#format option[value="avif"]');
        if (avifOption) avifOption.disabled = true;
    }
}

// Set up all event listeners
function setupEventListeners() {
    // Upload area events
    elements.uploadArea.addEventListener('click', () => elements.fileInput.click());
    elements.uploadArea.addEventListener('dragover', handleDragOver);
    elements.uploadArea.addEventListener('dragleave', handleDragLeave);
    elements.uploadArea.addEventListener('drop', handleDrop);
    
    // File input event
    elements.fileInput.addEventListener('change', handleFileSelect);
    
    // Quality slider event
    elements.qualityRange.addEventListener('input', updateQualityValue);
    
    // Process button
    elements.processBtn.addEventListener('click', processImages);
    
    // Download and reset buttons
    elements.downloadBtn.addEventListener('click', downloadOptimized);
    elements.resetBtn.addEventListener('click', reset);
    
    // History panel
    elements.historyToggle.addEventListener('click', () => elements.historyPanel.classList.add('active'));
    elements.closeHistory.addEventListener('click', () => elements.historyPanel.classList.remove('active'));
    
    // Edit controls
    elements.cropBtn.addEventListener('click', toggleCropMode);
    elements.rotateLeftBtn.addEventListener('click', () => rotateImage(-90));
    elements.rotateRightBtn.addEventListener('click', () => rotateImage(90));
    elements.flipHBtn.addEventListener('click', flipImageHorizontal);
    elements.resetEditBtn.addEventListener('click', resetEditState);
    elements.applyCropBtn.addEventListener('click', applyCrop);
    elements.cancelCropBtn.addEventListener('click', cancelCrop);
    
    // Crop ratio selection
    elements.cropRatios.forEach(ratio => {
        ratio.addEventListener('click', () => {
            elements.cropRatios.forEach(r => r.classList.remove('active'));
            ratio.classList.add('active');
            state.cropRatio = ratio.dataset.ratio;
            
            // Обновляем соотношение в Cropper
            if (state.cropper) {
                state.cropper.setAspectRatio(getAspectRatio());
            }
        });
    });
    
    // Hotkeys
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'z') {
            resetEditState();
            showToast('Changes canceled!');
        }
    });
    
    // Premium and logout
    elements.upgradeBtn.addEventListener('click', () => {
        if (!state.user || state.user.uid === "guest") {
            showToast("Please login to upgrade to Premium");
            setTimeout(() => window.location.href = 'auth.html', 2000);
        } else {
            window.location.href = 'pay.html';
        }
    });
    
    elements.logoutBtn.addEventListener('click', () => {
        if (state.firebaseInitialized && state.user && state.user.uid !== "guest") {
            firebase.auth().signOut().then(() => {
                localStorage.removeItem('premiumUser');
                localStorage.removeItem('trialUser');
                localStorage.removeItem('trialDaysLeft');
                localStorage.removeItem('trialEndDate');
                localStorage.removeItem('userId');
                window.location.href = 'index.html';
            });
        } else {
            // For guest users
            localStorage.removeItem('premiumUser');
            localStorage.removeItem('trialUser');
            localStorage.removeItem('trialDaysLeft');
            localStorage.removeItem('trialEndDate');
            window.location.href = 'index.html';
        }
    });
}

// Set batch edit mode
function setBatchEditMode(mode) {
    state.batchEditMode = mode;
    elements.editSingleBtn.classList.toggle('active', mode === 'single');
    elements.editAllBtn.classList.toggle('active', mode === 'all');
    elements.batchEditNotice.style.display = mode === 'all' ? 'block' : 'none';
    showToast(`Edit mode: ${mode === 'all' ? 'apply to all images' : 'apply to single image'}`);
}

// Toggle watermark controls
function toggleWatermarkControls() {
    if (!checkFeatureAccess('basicEditing')) {
        showPremiumRequiredModal('basicEditing');
        elements.enableWatermark.checked = false;
        return;
    }
    
    state.watermark.enabled = elements.enableWatermark.checked;
    elements.watermarkControls.style.display = state.watermark.enabled ? 'block' : 'none';
}

// Update watermark preview
function updateWatermarkPreview() {
    state.watermark.text = elements.watermarkText.value;
    state.watermark.color = elements.watermarkColor.value;
    state.watermark.position = elements.watermarkPosition.value;
    
    if (state.watermark.type === 'text') {
        elements.watermarkPreview.textContent = state.watermark.text;
        elements.watermarkPreview.style.fontSize = `${state.watermark.size}px`;
        elements.watermarkPreview.style.color = state.watermark.color;
        elements.watermarkPreview.style.opacity = state.watermark.opacity / 100;
    } else if (state.watermark.imageUrl) {
        elements.watermarkImagePreview.src = state.watermark.imageUrl;
        elements.watermarkImagePreview.style.opacity = state.watermark.opacity / 100;
    }
    
    // Positioning
    elements.watermarkPreview.style.position = 'absolute';
    elements.watermarkPreview.style.margin = '10px';
    elements.watermarkImagePreview.style.position = 'absolute';
    elements.watermarkImagePreview.style.margin = '10px';
    
    switch(state.watermark.position) {
        case 'bottom-right':
            elements.watermarkPreview.style.bottom = '0';
            elements.watermarkPreview.style.right = '0';
            elements.watermarkImagePreview.style.bottom = '0';
            elements.watermarkImagePreview.style.right = '0';
            break;
        case 'bottom-left':
            elements.watermarkPreview.style.bottom = '0';
            elements.watermarkPreview.style.left = '0';
            elements.watermarkImagePreview.style.bottom = '0';
            elements.watermarkImagePreview.style.left = '0';
            break;
        case 'top-right':
            elements.watermarkPreview.style.top = '0';
            elements.watermarkPreview.style.right = '0';
            elements.watermarkImagePreview.style.top = '0';
            elements.watermarkImagePreview.style.right = '0';
            break;
        case 'top-left':
            elements.watermarkPreview.style.top = '0';
            elements.watermarkPreview.style.left = '0';
            elements.watermarkImagePreview.style.top = '0';
            elements.watermarkImagePreview.style.left = '0';
            break;
        case 'center':
            elements.watermarkPreview.style.top = '50%';
            elements.watermarkPreview.style.left = '50%';
            elements.watermarkPreview.style.transform = 'translate(-50%, -50%)';
            elements.watermarkImagePreview.style.top = '50%';
            elements.watermarkImagePreview.style.left = '50%';
            elements.watermarkImagePreview.style.transform = 'translate(-50%, -50%)';
            break;
    }
}

// Update watermark size
function updateWatermarkSize(e) {
    state.watermark.size = parseInt(e.target.value);
    elements.watermarkSizeValue.textContent = `${state.watermark.size}px`;
    updateWatermarkPreview();
}

// Update watermark opacity
function updateWatermarkOpacity(e) {
    state.watermark.opacity = parseInt(e.target.value);
    elements.watermarkOpacityValue.textContent = `${state.watermark.opacity}%`;
    updateWatermarkPreview();
}

// Toggle advanced settings
function toggleAdvancedSettings() {
    elements.advancedSettings.style.display = 
        elements.advancedSettings.style.display === 'block' ? 'none' : 'block';
    
    const icon = elements.toggleAdvancedSettings.querySelector('i');
    if (elements.advancedSettings.style.display === 'block') {
        elements.toggleAdvancedSettings.innerHTML = '<i class="fas fa-cog"></i> Hide Advanced Settings';
    } else {
        elements.toggleAdvancedSettings.innerHTML = '<i class="fas fa-cog"></i> Advanced Settings';
    }
}

// Save settings profile
function saveProfile() {
    const profileName = prompt("Enter profile name:");
    if (!profileName) return;
    
    const profile = {
        name: profileName,
        date: new Date().toLocaleString(),
        settings: {
            quality: elements.qualityRange.value,
            format: elements.formatSelect.value,
            maxWidth: elements.maxWidthSelect.value,
            watermark: state.watermark,
            progressiveJpeg: state.progressiveJpeg,
            removeMetadata: state.removeMetadata,
            pngCompression: state.pngCompression,
            adjustments: state.adjustments
        }
    };
    
    state.savedProfiles.push(profile);
    localStorage.setItem('savedProfiles', JSON.stringify(state.savedProfiles));
    showToast(`Profile "${profileName}" saved!`);
}

// Show toast notification
function showToast(message, duration = 3000) {
    elements.toast.textContent = message;
    elements.toast.classList.add('show');
    
    // Clear previous timeout if exists
    if (window.toastTimeout) clearTimeout(window.toastTimeout);
    window.toastTimeout = setTimeout(() => {
        elements.toast.classList.remove('show');
    }, duration);
}

// Drag and drop handlers
function handleDragOver(e) {
    e.preventDefault();
    elements.uploadArea.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    elements.uploadArea.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    elements.uploadArea.classList.remove('dragover');
    const files = Array.from(e.dataTransfer.files).filter(file => 
        file.type.startsWith('image/') || 
        file.type === 'image/heic' || 
        file.name.toLowerCase().endsWith('.heic') ||
        file.type === 'image/tiff' ||
        file.name.toLowerCase().match(/\.tiff?$/i) ||
        file.type === 'image/avif' ||
        file.name.toLowerCase().endsWith('.avif')
    );
    if (files.length > 0) {
        addFiles(files);
        if (elements.autoOptimizeCheckbox.checked) {
            processImages();
        }
    }
}

// File selection handler
async function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
        await addFiles(files);
        if (elements.autoOptimizeCheckbox.checked) {
            processImages();
        }
    }
}

// Add files to the state and preview
async function addFiles(files) {
    const limits = getCurrentLimits();
    
    // Free user limitations
    if (!state.isPremium && !state.isTrial) {
        // Max files per batch
        if (files.length > limits.PER_BATCH) {
            showToast(`Free version: max ${limits.PER_BATCH} files at once`);
            files = files.slice(0, limits.PER_BATCH);
        }
        
        // Max file size
        files = files.filter(file => file.size <= limits.MAX_SIZE);
    }
    
    // Filter and convert HEIC/TIFF files
    const imageFiles = [];
    for (let file of files) {
        // Convert HEIC to JPEG
        if (file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic')) {
            try {
                if (!state.heicSupported) {
                    showToast("HEIC conversion requires heic2any library", 3000);
                    continue;
                }
                
                const conversionResult = await heic2any({
                    blob: file,
                    toType: 'image/jpeg',
                    quality: 0.8
                });
                
                const newFile = new File(
                    [conversionResult],
                    file.name.replace(/\.heic$/i, '.jpg'),
                    { type: 'image/jpeg' }
                );
                imageFiles.push(newFile);
            } catch (error) {
                console.error("HEIC conversion error:", error);
                showToast(`Error converting ${file.name}: ${error.message}`);
            }
        } 
        // Convert TIFF to PNG
        else if (file.type === 'image/tiff' || file.name.toLowerCase().match(/\.tiff?$/i)) {
            try {
                // Create image from TIFF
                const img = await createImageBitmap(file);
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                
                // Convert to PNG
                const blob = await new Promise(resolve => 
                    canvas.toBlob(resolve, 'image/png')
                );
                
                const newFile = new File(
                    [blob],
                    file.name.replace(/\.tiff?$/i, '.png'),
                    { type: 'image/png' }
                );
                imageFiles.push(newFile);
            } catch (error) {
                console.error("TIFF conversion error:", error);
                showToast(`Error converting ${file.name}: ${error.message}`);
                // Добавляем оригинальный файл как есть
                imageFiles.push(file);
            }
        }
        // Handle AVIF files
        else if (file.type === 'image/avif' || file.name.toLowerCase().endsWith('.avif')) {
            imageFiles.push(file);
        }
        else if (file.type.startsWith('image/')) {
            imageFiles.push(file);
        }
    }
    
    // Add to state
    state.originalFiles = [...state.originalFiles, ...imageFiles];
    
    // Render previews
    renderFilePreviews();
    
    // Reset edit state
    resetEditState();
    
    // Show editor if files added
    if (state.originalFiles.length > 0) {
        showEditor();
    }
}

// Show editor with preview
function showEditor() {
    elements.editorContainer.style.display = 'flex';
    updatePreviewImage();
}

// Render file previews
function renderFilePreviews() {
    elements.filePreviews.innerHTML = '';
    
    state.originalFiles.forEach((file, index) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const preview = document.createElement('div');
            preview.className = 'file-preview';
            preview.dataset.index = index;
            
            preview.innerHTML = `
                <img src="${e.target.result}" alt="${file.name}">
                <div class="file-name">${file.name}</div>
                <button class="remove-file" data-index="${index}">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            preview.addEventListener('click', () => {
                state.currentFileIndex = index;
                updatePreviewImage();
                highlightSelectedPreview();
            });
            
            preview.querySelector('.remove-file').addEventListener('click', (e) => {
                e.stopPropagation();
                removeFile(index);
            });
            
            elements.filePreviews.appendChild(preview);
        };
        
        reader.readAsDataURL(file);
    });
    
    highlightSelectedPreview();
}

// Highlight selected preview
function highlightSelectedPreview() {
    document.querySelectorAll('.file-preview').forEach((preview, index) => {
        preview.classList.toggle('selected', index === state.currentFileIndex);
    });
}

// Remove file
function removeFile(index) {
    state.originalFiles.splice(index, 1);
    renderFilePreviews();
    
    if (state.originalFiles.length === 0) {
        reset();
    } else {
        state.currentFileIndex = Math.min(state.currentFileIndex, state.originalFiles.length - 1);
        updatePreviewImage();
    }
}

// Update preview image
function updatePreviewImage() {
    if (state.originalFiles.length === 0) return;
    
    const file = state.originalFiles[state.currentFileIndex];
    const reader = new FileReader();
    
    reader.onload = function(e) {
        elements.previewImage.src = e.target.result;
        elements.previewImage.onload = () => {
            resetEditState();
        };
    };
    
    reader.readAsDataURL(file);
}

// Reset edit state
function resetEditState() {
    state.rotation = 0;
    state.flipHorizontal = false;
    state.crop = null;
    state.adjustments = {
        brightness: 0,
        contrast: 0,
        saturation: 0,
        sharpness: 0,
        temperature: 0
    };
    
    elements.previewImage.style.transform = '';
    elements.previewImage.style.filter = '';
    
    // Reset adjustment controls
    applyAdjustmentsToControls();
    
    showEditNotification('Changes reset!');
}

// Show edit notification
function showEditNotification(message) {
    elements.editNotification.textContent = message;
    elements.editNotification.classList.add('show');
    setTimeout(() => elements.editNotification.classList.remove('show'), 2000);
}

// Rotate image
function rotateImage(degrees) {
    if (!checkFeatureAccess('basicEditing')) {
        showPremiumRequiredModal('basicEditing');
        return;
    }
    
    state.rotation = (state.rotation + degrees) % 360;
    applyTransformations();
    showEditNotification(`Rotated ${degrees > 0 ? 'right' : 'left'}!`);
}

// Flip image horizontally
function flipImageHorizontal() {
    if (!checkFeatureAccess('basicEditing')) {
        showPremiumRequiredModal('basicEditing');
        return;
    }
    
    state.flipHorizontal = !state.flipHorizontal;
    applyTransformations();
    showEditNotification('Flipped horizontally!');
}

// Apply transformations
function applyTransformations() {
    let transform = `rotate(${state.rotation}deg)`;
    if (state.flipHorizontal) {
        transform += ' scaleX(-1)';
    }
    elements.previewImage.style.transform = transform;
}

// Update quality value display
function updateQualityValue() {
    elements.qualityValue.textContent = `${elements.qualityRange.value}%`;
}

// Process images
async function processImages() {
    if (state.originalFiles.length === 0) return;
    
    // Check daily limit
    const limits = getCurrentLimits();
    if (!state.isPremium && !state.isTrial && state.dailyCount >= limits.DAILY) {
        showToast(`Daily limit reached (${limits.DAILY}). Upgrade to Premium for unlimited processing.`);
        return;
    }
    
    // Show processing
    elements.processing.style.display = 'flex';
    elements.progressBar.style.width = '0%';
    elements.progressText.textContent = '0%';
    
    // Process images
    state.optimizedFiles = [];
    const quality = parseInt(elements.qualityRange.value) / 100;
    const format = elements.formatSelect.value;
    const maxWidth = parseInt(elements.maxWidthSelect.value);
    
    for (let i = 0; i < state.originalFiles.length; i++) {
        const file = state.originalFiles[i];
        
        try {
            const optimizedBlob = await optimizeImage(file, quality, format, maxWidth);
            state.optimizedFiles.push({
                original: file,
                optimized: new File([optimizedBlob], 
                    `${file.name.split('.')[0]}_optimized.${format}`, 
                    { type: `image/${format}` }
                ),
                stats: {
                    originalSize: file.size,
                    optimizedSize: optimizedBlob.size,
                    savings: file.size - optimizedBlob.size
                }
            });
        } catch (error) {
            console.error(`Error optimizing ${file.name}:`, error);
            showToast(`Error optimizing ${file.name}`);
        }
        
        // Update progress
        const progress = Math.round((i + 1) / state.originalFiles.length * 100);
        elements.progressBar.style.width = `${progress}%`;
        elements.progressText.textContent = `${progress}%`;
    }
    
    // Hide processing
    elements.processing.style.display = 'none';
    
    // Update stats
    updateStats();
    
    // Show download button
    elements.downloadBtn.style.display = 'block';
    
    // Update daily counter
    state.dailyCount += state.originalFiles.length;
    localStorage.setItem('dailyCount', state.dailyCount);
    updateDailyCounter();
    
    // Add to history
    addToHistory();
}

// Optimize image
async function optimizeImage(file, quality, format, maxWidth) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = async () => {
            try {
                // Calculate new dimensions
                let width = img.width;
                let height = img.height;
                
                if (maxWidth > 0 && width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }
                
                // Create canvas
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                
                // Apply image adjustments if any
                if (state.adjustments.brightness !== 0 || 
                    state.adjustments.contrast !== 0 || 
                    state.adjustments.saturation !== 0 ||
                    state.adjustments.sharpness !== 0 ||
                    state.adjustments.temperature !== 0) {
                    applyAdjustmentsToCanvas(ctx, img, width, height);
                } else {
                    // Draw image without adjustments
                    ctx.drawImage(img, 0, 0, width, height);
                }
                
                // Apply watermark if enabled
                if (state.watermark.enabled) {
                    await applyWatermarkToCanvas(ctx, width, height);
                }
                
                // Convert to desired format
                let mimeType = `image/${format}`;
                let options = {};
                
                if (format === 'jpeg') {
                    options.quality = quality;
                    if (state.progressiveJpeg) {
                        // Для прогрессивного JPEG используем специальные настройки
                        options.progressive = true;
                    }
                } else if (format === 'png') {
                    // PNG compression level (0-9)
                    const compressionLevel = state.pngCompression === 'auto' ? 
                        Math.round((1 - quality) * 9) : parseInt(state.pngCompression);
                    options.compressionLevel = compressionLevel;
                } else if (format === 'webp') {
                    options.quality = quality;
                } else if (format === 'avif') {
                    options.quality = Math.round(quality * 100);
                }
                
                // Convert to blob
                canvas.toBlob(
                    blob => {
                        if (!blob) {
                            reject(new Error("Canvas toBlob failed"));
                            return;
                        }
                        
                        // Remove metadata if requested
                        if (state.removeMetadata && (format === 'jpeg' || format === 'webp')) {
                            removeMetadata(blob).then(resolve).catch(reject);
                        } else {
                            resolve(blob);
                        }
                    },
                    mimeType,
                    options.quality ? options.quality / 100 : undefined
                );
                
            } catch (error) {
                reject(error);
            }
        };
        
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = URL.createObjectURL(file);
    });
}

// Apply adjustments to canvas
function applyAdjustmentsToCanvas(ctx, img, width, height) {
    // Draw original image first
    ctx.drawImage(img, 0, 0, width, height);
    
    // Get image data
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    // Apply adjustments
    for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];
        
        // Brightness
        if (state.adjustments.brightness !== 0) {
            const brightness = state.adjustments.brightness * 2.55; // Convert percentage to 0-255
            r = clamp(r + brightness);
            g = clamp(g + brightness);
            b = clamp(b + brightness);
        }
        
        // Contrast
        if (state.adjustments.contrast !== 0) {
            const contrast = (state.adjustments.contrast + 100) / 100; // Convert percentage to multiplier
            r = clamp(((r - 127.5) * contrast) + 127.5);
            g = clamp(((g - 127.5) * contrast) + 127.5);
            b = clamp(((b - 127.5) * contrast) + 127.5);
        }
        
        // Saturation
        if (state.adjustments.saturation !== 0) {
            const gray = 0.2989 * r + 0.5870 * g + 0.1140 * b;
            const saturation = state.adjustments.saturation / 100;
            
            r = clamp(gray + saturation * (r - gray));
            g = clamp(gray + saturation * (g - gray));
            b = clamp(gray + saturation * (b - gray));
        }
        
        // Temperature (warm/cool)
        if (state.adjustments.temperature !== 0) {
            const temperature = state.adjustments.temperature / 100;
            if (temperature > 0) {
                // Warm (add red, subtract blue)
                r = clamp(r + temperature * 50);
                b = clamp(b - temperature * 30);
            } else {
                // Cool (add blue, subtract red)
                r = clamp(r + temperature * 30);
                b = clamp(b - temperature * 50);
            }
        }
        
        // Sharpness (applied later as it requires convolution)
        
        data[i] = r;
        data[i + 1] = g;
        data[i + 2] = b;
    }
    
    // Put adjusted image data back
    ctx.putImageData(imageData, 0, 0);
    
    // Apply sharpness using convolution (simplified)
    if (state.adjustments.sharpness !== 0) {
        const sharpness = state.adjustments.sharpness / 100;
        if (sharpness > 0) {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = width;
            tempCanvas.height = height;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.drawImage(ctx.canvas, 0, 0);
            
            // Simple sharpen kernel
            ctx.globalAlpha = sharpness;
            ctx.drawImage(tempCanvas, -1, -1, width + 2, height + 2);
            ctx.globalAlpha = 1.0;
        }
    }
}

// Clamp value between 0-255
function clamp(value) {
    return Math.max(0, Math.min(255, value));
}

// Apply watermark to canvas
async function applyWatermarkToCanvas(ctx, width, height) {
    if (state.watermark.type === 'text') {
        // Text watermark
        ctx.font = `bold ${state.watermark.size}px Arial`;
        ctx.fillStyle = state.watermark.color;
        ctx.globalAlpha = state.watermark.opacity / 100;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        
        const padding = 20;
        const x = width - padding;
        const y = height - padding;
        
        // Add text shadow for better visibility
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        
        ctx.fillText(state.watermark.text, x, y);
        
        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    } else if (state.watermark.type === 'image' && state.watermark.imageUrl) {
        // Image watermark
        const img = new Image();
        await new Promise((resolve) => {
            img.onload = resolve;
            img.src = state.watermark.imageUrl;
        });
        
        // Calculate scaled dimensions
        const scale = state.watermark.scale / 100;
        const imgWidth = img.width * scale;
        const imgHeight = img.height * scale;
        
        let x, y;
        const padding = 10;
        
        switch(state.watermark.position) {
            case 'bottom-right':
                x = width - imgWidth - padding;
                y = height - imgHeight - padding;
                break;
            case 'bottom-left':
                x = padding;
                y = height - imgHeight - padding;
                break;
            case 'top-right':
                x = width - imgWidth - padding;
                y = padding;
                break;
            case 'top-left':
                x = padding;
                y = padding;
                break;
            case 'center':
                x = (width - imgWidth) / 2;
                y = (height - imgHeight) / 2;
                break;
        }
        
        ctx.globalAlpha = state.watermark.opacity / 100;
        ctx.drawImage(img, x, y, imgWidth, imgHeight);
    }
    
    ctx.globalAlpha = 1.0;
}

// Remove metadata from image
async function removeMetadata(blob) {
    try {
        // Use a simple approach - redraw image to strip metadata
        const img = new Image();
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = URL.createObjectURL(blob);
        });
        
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        return new Promise(resolve => {
            canvas.toBlob(resolve, blob.type);
        });
    } catch (error) {
        console.error("Error removing metadata:", error);
        return blob; // Return original if failed
    }
}

// Update stats
function updateStats() {
    if (state.optimizedFiles.length === 0) return;
    
    let totalOriginal = 0;
    let totalOptimized = 0;
    
    state.optimizedFiles.forEach(file => {
        totalOriginal += file.stats.originalSize;
        totalOptimized += file.stats.optimizedSize;
    });
    
    const totalSavings = totalOriginal - totalOptimized;
    const percentage = ((totalSavings / totalOriginal) * 100).toFixed(1);
    
    elements.stats.innerHTML = `
        <div class="stat">
            <span class="stat-label">Original:</span>
            <span class="stat-value">${formatFileSize(totalOriginal)}</span>
        </div>
        <div class="stat">
            <span class="stat-label">Optimized:</span>
            <span class="stat-value">${formatFileSize(totalOptimized)}</span>
        </div>
        <div class="stat savings">
            <span class="stat-label">Saved:</span>
            <span class="stat-value">${formatFileSize(totalSavings)} (${percentage}%)</span>
        </div>
    `;
    
    elements.stats.style.display = 'block';
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Download optimized images
function downloadOptimized() {
    if (state.optimizedFiles.length === 0) return;
    
    if (state.optimizedFiles.length === 1) {
        // Single file download
        const file = state.optimizedFiles[0].optimized;
        const url = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } else {
        // Multiple files - create zip
        showToast('Preparing download...');
        
        const zip = new JSZip();
        state.optimizedFiles.forEach(file => {
            zip.file(file.optimized.name, file.optimized);
        });
        
        zip.generateAsync({ type: 'blob' })
            .then(content => {
                const url = URL.createObjectURL(content);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'optimized_images.zip';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                showToast('Download started!');
            })
            .catch(error => {
                console.error('Error creating zip:', error);
                showToast('Error creating download');
            });
    }
}

// Add to history
function addToHistory() {
    const historyItem = {
        date: new Date().toISOString(),
        files: state.optimizedFiles.map(file => ({
            originalName: file.original.name,
            optimizedName: file.optimized.name,
            originalSize: file.stats.originalSize,
            optimizedSize: file.stats.optimizedSize,
            savings: file.stats.savings
        })),
        totalSavings: state.optimizedFiles.reduce((sum, file) => sum + file.stats.savings, 0)
    };
    
    state.history.unshift(historyItem);
    if (state.history.length > 50) {
        state.history.pop();
    }
    
    localStorage.setItem('imageopt-history', JSON.stringify(state.history));
    renderHistory();
}

// Render history
function renderHistory() {
    elements.historyList.innerHTML = '';
    
    state.history.forEach((item, index) => {
        const li = document.createElement('li');
        li.className = 'history-item';
        
        const date = new Date(item.date).toLocaleString();
        const totalSavings = formatFileSize(item.totalSavings);
        
        li.innerHTML = `
            <div class="history-header">
                <span class="history-date">${date}</span>
                <span class="history-savings">Saved: ${totalSavings}</span>
            </div>
            <div class="history-files">${item.files.length} files processed</div>
            <button class="history-delete" data-index="${index}">
                <i class="fas fa-trash"></i>
            </button>
        `;
        
        li.querySelector('.history-delete').addEventListener('click', (e) => {
            e.stopPropagation();
            state.history.splice(index, 1);
            localStorage.setItem('imageopt-history', JSON.stringify(state.history));
            renderHistory();
        });
        
        elements.historyList.appendChild(li);
    });
}

// Reset everything
function reset() {
    state.originalFiles = [];
    state.optimizedFiles = [];
    state.currentFileIndex = 0;
    
    resetEditState();
    
    elements.filePreviews.innerHTML = '';
    elements.previewImage.src = '';
    elements.stats.style.display = 'none';
    elements.downloadBtn.style.display = 'none';
    elements.editorContainer.style.display = 'none';
    
    elements.fileInput.value = '';
}

// Toggle adjust panel
function toggleAdjustPanel() {
    if (!checkFeatureAccess('basicEditing')) {
        showPremiumRequiredModal('basicEditing');
        return;
    }
    
    elements.adjustControls.style.display = 
        elements.adjustControls.style.display === 'block' ? 'none' : 'block';
}

// Update brightness value display
function updateBrightnessValue() {
    state.adjustments.brightness = parseInt(elements.brightnessRange.value);
    elements.brightnessValue.textContent = `${state.adjustments.brightness}%`;
    applyPreviewAdjustments();
}

// Update contrast value display
function updateContrastValue() {
    state.adjustments.contrast = parseInt(elements.contrastRange.value);
    elements.contrastValue.textContent = `${state.adjustments.contrast}%`;
    applyPreviewAdjustments();
}

// Update saturation value display
function updateSaturationValue() {
    state.adjustments.saturation = parseInt(elements.saturationRange.value);
    elements.saturationValue.textContent = `${state.adjustments.saturation}%`;
    applyPreviewAdjustments();
}

// Update sharpness value display
function updateSharpnessValue() {
    state.adjustments.sharpness = parseInt(elements.sharpnessRange.value);
    elements.sharpnessValue.textContent = `${state.adjustments.sharpness}%`;
    applyPreviewAdjustments();
}

// Update temperature value display
function updateTemperatureValue() {
    state.adjustments.temperature = parseInt(elements.temperatureRange.value);
    elements.temperatureValue.textContent = `${state.adjustments.temperature}%`;
    applyPreviewAdjustments();
}

// Apply adjustments to preview
function applyPreviewAdjustments() {
    const filters = [
        `brightness(${(state.adjustments.brightness + 100) / 100})`,
        `contrast(${(state.adjustments.contrast + 100) / 100})`,
        `saturate(${(state.adjustments.saturation + 100) / 100})`,
        state.adjustments.temperature !== 0 ? 
            `hue-rotate(${state.adjustments.temperature > 0 ? 
                state.adjustments.temperature * 0.36 : 
                state.adjustments.temperature * 0.72}deg)` : ''
    ].filter(Boolean).join(' ');
    
    elements.previewImage.style.filter = filters;
}

// Apply adjustments permanently
function applyAdjustments() {
    showEditNotification('Adjustments applied!');
    elements.adjustControls.style.display = 'none';
}

// Reset adjustments
function resetAdjustments() {
    state.adjustments = {
        brightness: 0,
        contrast: 0,
        saturation: 0,
        sharpness: 0,
        temperature: 0
    };
    
    applyAdjustmentsToControls();
    applyPreviewAdjustments();
    showEditNotification('Adjustments reset!');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Service Worker registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}