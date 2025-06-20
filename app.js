// Application State
const AppState = {
    map: null,
    currentTourStep: 1,
    sidebarCollapsed: false,
    activeDataSources: ['cities', 'sensors', 'satellite'],
    processingQueue: [],
    collaborativeUsers: 3,
    lastUpdate: new Date()
};

// Sample data from the provided JSON
const sampleData = {
    cities: [
        {name: "New York", lat: 40.7128, lng: -74.0060, population: 8419000, air_quality: 65, traffic_level: 78},
        {name: "Los Angeles", lat: 34.0522, lng: -118.2437, population: 3980000, air_quality: 45, traffic_level: 85},
        {name: "Chicago", lat: 41.8781, lng: -87.6298, population: 2716000, air_quality: 72, traffic_level: 63}
    ],
    iot_sensors: [
        {id: "sensor_001", type: "air_quality", lat: 40.7589, lng: -73.9851, value: 68, status: "active"},
        {id: "sensor_002", type: "traffic", lat: 40.7505, lng: -73.9934, value: 82, status: "active"},
        {id: "sensor_003", type: "weather", lat: 40.7505, lng: -73.9934, value: 24, status: "active"}
    ],
    ai_models: [
        {name: "Urban Pattern Recognition", accuracy: 95.2, type: "CNN", status: "ready"},
        {name: "Traffic Flow Prediction", accuracy: 87.5, type: "Random Forest", status: "ready"},
        {name: "Environmental Risk Assessment", accuracy: 92.1, type: "Transformer", status: "ready"}
    ]
};

// Utility Functions
function showElement(element) {
    if (element) {
        element.classList.add('show');
        element.setAttribute('aria-hidden', 'false');
    }
}

function hideElement(element) {
    if (element) {
        element.classList.remove('show');
        element.setAttribute('aria-hidden', 'true');
    }
}

function showProcessingIndicator(message = 'Processing geospatial data...') {
    const indicator = document.getElementById('processingIndicator');
    if (indicator) {
        const messageEl = indicator.querySelector('.processing-content span');
        if (messageEl) {
            messageEl.textContent = message;
        }
        indicator.classList.add('show');
    }
}

function hideProcessingIndicator() {
    const indicator = document.getElementById('processingIndicator');
    if (indicator) {
        indicator.classList.remove('show');
    }
}

function updateLastUpdateTime() {
    const statusItems = document.querySelectorAll('.status-item');
    if (statusItems.length > 1) {
        const timeElement = statusItems[1].querySelector('strong');
        if (timeElement) {
            const now = new Date();
            const diffInMinutes = Math.floor((now - AppState.lastUpdate) / (1000 * 60));
            
            if (diffInMinutes < 1) {
                timeElement.textContent = 'Just now';
            } else if (diffInMinutes === 1) {
                timeElement.textContent = '1 minute ago';
            } else {
                timeElement.textContent = `${diffInMinutes} minutes ago`;
            }
        }
    }
}

// Map Initialization
function initializeMap() {
    try {
        // Initialize the map centered on the US
        AppState.map = L.map('map').setView([39.8283, -98.5795], 4);

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(AppState.map);

        // Add city markers
        sampleData.cities.forEach(city => {
            const marker = L.marker([city.lat, city.lng]).addTo(AppState.map);
            
            // Create popup content with city data
            const popupContent = `
                <div class="map-popup">
                    <h4>${city.name}</h4>
                    <div class="popup-metrics">
                        <div class="popup-metric">
                            <span class="popup-label">Population:</span>
                            <span class="popup-value">${city.population.toLocaleString()}</span>
                        </div>
                        <div class="popup-metric">
                            <span class="popup-label">Air Quality:</span>
                            <span class="popup-value ${city.air_quality > 60 ? 'good' : 'poor'}">${city.air_quality}</span>
                        </div>
                        <div class="popup-metric">
                            <span class="popup-label">Traffic Level:</span>
                            <span class="popup-value ${city.traffic_level > 70 ? 'high' : 'moderate'}">${city.traffic_level}</span>
                        </div>
                    </div>
                </div>
            `;
            
            marker.bindPopup(popupContent);
        });

        // Add IoT sensor markers with different icons
        sampleData.iot_sensors.forEach(sensor => {
            let iconClass = 'fas fa-sensor';
            let iconColor = '#21800d';
            
            switch(sensor.type) {
                case 'air_quality':
                    iconClass = 'fas fa-wind';
                    iconColor = '#2180bd';
                    break;
                case 'traffic':
                    iconClass = 'fas fa-car';
                    iconColor = '#d18021';
                    break;
                case 'weather':
                    iconClass = 'fas fa-cloud';
                    iconColor = '#2180bd';
                    break;
            }

            const customIcon = L.divIcon({
                html: `<i class="${iconClass}" style="color: ${iconColor}; font-size: 16px;"></i>`,
                iconSize: [20, 20],
                className: 'custom-marker'
            });

            const sensorMarker = L.marker([sensor.lat, sensor.lng], { icon: customIcon }).addTo(AppState.map);
            
            sensorMarker.bindPopup(`
                <div class="map-popup">
                    <h4>IoT Sensor ${sensor.id}</h4>
                    <div class="popup-metrics">
                        <div class="popup-metric">
                            <span class="popup-label">Type:</span>
                            <span class="popup-value">${sensor.type.replace('_', ' ')}</span>
                        </div>
                        <div class="popup-metric">
                            <span class="popup-label">Value:</span>
                            <span class="popup-value">${sensor.value}</span>
                        </div>
                        <div class="popup-metric">
                            <span class="popup-label">Status:</span>
                            <span class="popup-value status-${sensor.status}">${sensor.status}</span>
                        </div>
                    </div>
                </div>
            `);
        });

        console.log('Map initialized successfully');
    } catch (error) {
        console.error('Error initializing map:', error);
    }
}

// Tour Functionality - Fixed version
function initializeTour() {
    const tourModal = document.getElementById('tourModal');
    const startTourBtn = document.getElementById('startTourBtn');
    const closeTour = document.getElementById('closeTour');
    const nextStep = document.getElementById('nextStep');
    const prevStep = document.getElementById('prevStep');
    const finishTour = document.getElementById('finishTour');
    
    if (!tourModal || !startTourBtn) {
        console.error('Tour elements not found');
        return;
    }

    // Set initial state
    tourModal.setAttribute('aria-hidden', 'true');
    AppState.currentTourStep = 1;

    startTourBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openTourModal();
    });

    if (closeTour) {
        closeTour.addEventListener('click', (e) => {
            e.preventDefault();
            closeTourModal();
        });
    }
    
    // Close modal when clicking outside
    tourModal.addEventListener('click', (e) => {
        if (e.target === tourModal) {
            closeTourModal();
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && tourModal.classList.contains('show')) {
            closeTourModal();
        }
    });

    if (nextStep) {
        nextStep.addEventListener('click', (e) => {
            e.preventDefault();
            showTourStep(2);
        });
    }

    if (prevStep) {
        prevStep.addEventListener('click', (e) => {
            e.preventDefault();
            showTourStep(1);
        });
    }

    if (finishTour) {
        finishTour.addEventListener('click', (e) => {
            e.preventDefault();
            closeTourModal();
            // Hide welcome banner
            const welcomeBanner = document.getElementById('welcomeBanner');
            if (welcomeBanner) {
                welcomeBanner.style.transform = 'translateY(-100%)';
                setTimeout(() => {
                    welcomeBanner.style.display = 'none';
                }, 300);
            }
            showNotification('Welcome! You can now explore the platform features.', 'success');
        });
    }

    function openTourModal() {
        console.log('Opening tour modal');
        showTourStep(1); // Ensure we start on step 1
        showElement(tourModal);
        document.body.style.overflow = 'hidden';
        
        // Focus management for accessibility
        setTimeout(() => {
            if (closeTour) {
                closeTour.focus();
            }
        }, 100);
    }

    function closeTourModal() {
        console.log('Closing tour modal');
        hideElement(tourModal);
        document.body.style.overflow = '';
        
        // Return focus to the start button
        if (startTourBtn) {
            startTourBtn.focus();
        }
    }

    function showTourStep(step) {
        console.log('Showing tour step:', step);
        const step1 = document.getElementById('tourStep1');
        const step2 = document.getElementById('tourStep2');
        
        if (step1 && step2) {
            if (step === 1) {
                step1.classList.remove('hidden');
                step2.classList.add('hidden');
            } else {
                step1.classList.add('hidden');
                step2.classList.remove('hidden');
            }
            AppState.currentTourStep = step;
        }
    }
}

// Sidebar Functionality
function initializeSidebar() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');

    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            AppState.sidebarCollapsed = !AppState.sidebarCollapsed;
            
            // Update icon
            const icon = sidebarToggle.querySelector('i');
            if (icon) {
                icon.className = AppState.sidebarCollapsed ? 'fas fa-chevron-right' : 'fas fa-chevron-left';
            }
            
            // Trigger map resize after transition
            setTimeout(() => {
                if (AppState.map) {
                    AppState.map.invalidateSize();
                }
            }, 250);
        });
    }
}

// AI Model Functionality
function initializeAIModels() {
    const modelButtons = document.querySelectorAll('.ai-model .btn');
    
    modelButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const modelContainer = e.target.closest('.ai-model');
            if (modelContainer) {
                const modelType = modelContainer.dataset.model;
                const modelNameEl = modelContainer.querySelector('strong');
                const modelName = modelNameEl ? modelNameEl.textContent : 'AI Model';
                
                runAIModel(modelType, modelName, button);
            }
        });
    });
}

function runAIModel(modelType, modelName, button) {
    // Disable button and show loading state
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Running';
    
    showProcessingIndicator(`Running ${modelName}...`);
    
    // Simulate AI processing time
    setTimeout(() => {
        hideProcessingIndicator();
        button.disabled = false;
        button.innerHTML = 'Run';
        
        // Show success message
        showNotification(`${modelName} completed successfully!`, 'success');
        
        // Update results
        updateAnalysisResults(modelType);
        
        // Update last update time
        AppState.lastUpdate = new Date();
        updateLastUpdateTime();
    }, 2000 + Math.random() * 2000); // 2-4 seconds
}

// Results Updates
function updateAnalysisResults(modelType) {
    const resultsContainer = document.getElementById('resultsContainer');
    
    if (!resultsContainer) return;
    
    // Add new result card based on model type
    let resultHTML = '';
    
    switch(modelType) {
        case 'urban':
            resultHTML = `
                <div class="result-card card">
                    <div class="card__body">
                        <h4>Urban Pattern Analysis</h4>
                        <div class="analysis-result">
                            <p>Identified 3 major urban clusters with 95.2% confidence</p>
                            <div class="result-metric">
                                <span class="metric-label">Growth Pattern:</span>
                                <span class="metric-value">Expanding</span>
                            </div>
                            <button class="btn btn--outline btn--sm mt-8">
                                <i class="fas fa-chart-line"></i>
                                View Details
                            </button>
                        </div>
                    </div>
                </div>
            `;
            break;
        case 'traffic':
            resultHTML = `
                <div class="result-card card">
                    <div class="card__body">
                        <h4>Traffic Prediction</h4>
                        <div class="analysis-result">
                            <p>Peak congestion predicted in 2.5 hours</p>
                            <div class="result-metric">
                                <span class="metric-label">Confidence:</span>
                                <span class="metric-value">87.5%</span>
                            </div>
                            <button class="btn btn--outline btn--sm mt-8">
                                <i class="fas fa-route"></i>
                                View Routes
                            </button>
                        </div>
                    </div>
                </div>
            `;
            break;
        case 'environmental':
            resultHTML = `
                <div class="result-card card">
                    <div class="card__body">
                        <h4>Environmental Risk Assessment</h4>
                        <div class="analysis-result">
                            <p>Low risk detected across monitored areas</p>
                            <div class="result-metric">
                                <span class="metric-label">Risk Level:</span>
                                <span class="metric-value text-success">Low</span>
                            </div>
                            <button class="btn btn--outline btn--sm mt-8">
                                <i class="fas fa-leaf"></i>
                                View Report
                            </button>
                        </div>
                    </div>
                </div>
            `;
            break;
    }
    
    // Add the new result to the grid
    const resultsGrid = resultsContainer.querySelector('.results-grid');
    if (resultsGrid) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = resultHTML;
        const newCard = tempDiv.firstElementChild;
        
        if (newCard) {
            // Add animation class
            newCard.style.opacity = '0';
            newCard.style.transform = 'translateY(20px)';
            
            resultsGrid.appendChild(newCard);
            
            // Animate in
            setTimeout(() => {
                newCard.style.transition = 'all 0.3s ease';
                newCard.style.opacity = '1';
                newCard.style.transform = 'translateY(0)';
            }, 100);
        }
    }
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    
    let iconClass = 'fas fa-info-circle';
    let iconColor = 'var(--color-info)';
    
    switch(type) {
        case 'success':
            iconClass = 'fas fa-check-circle';
            iconColor = 'var(--color-success)';
            break;
        case 'error':
            iconClass = 'fas fa-exclamation-circle';
            iconColor = 'var(--color-error)';
            break;
        case 'warning':
            iconClass = 'fas fa-exclamation-triangle';
            iconColor = 'var(--color-warning)';
            break;
    }
    
    notification.innerHTML = `
        <div class="notification__content">
            <i class="${iconClass}" style="color: ${iconColor}"></i>
            <span>${message}</span>
        </div>
        <button class="notification__close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add styles for notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--color-surface);
        border: 1px solid ${iconColor};
        border-radius: var(--radius-base);
        padding: var(--space-16);
        box-shadow: var(--shadow-lg);
        z-index: 2000;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-12);
        max-width: 400px;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Close functionality
    const closeBtn = notification.querySelector('.notification__close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        });
    }
    
    // Auto close after 5 seconds
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }
    }, 5000);
}

// Map Controls
function initializeMapControls() {
    const layerToggle = document.getElementById('layerToggle');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    
    if (layerToggle) {
        layerToggle.addEventListener('click', () => {
            showNotification('Layer controls would open here', 'info');
        });
    }
    
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', () => {
            const mapContainer = document.querySelector('.map-container');
            if (mapContainer) {
                if (!document.fullscreenElement) {
                    mapContainer.requestFullscreen().then(() => {
                        setTimeout(() => {
                            if (AppState.map) {
                                AppState.map.invalidateSize();
                            }
                        }, 100);
                    }).catch(() => {
                        showNotification('Fullscreen not supported on this device', 'info');
                    });
                } else {
                    document.exitFullscreen();
                }
            }
        });
    }
}

// Export and Share Functionality
function initializeResultsActions() {
    const exportBtn = document.getElementById('exportBtn');
    const shareBtn = document.getElementById('shareBtn');
    
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            showProcessingIndicator('Preparing export...');
            setTimeout(() => {
                hideProcessingIndicator();
                showNotification('Analysis results exported successfully!', 'success');
            }, 1500);
        });
    }
    
    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            showNotification('Share link copied to clipboard!', 'success');
        });
    }
}

// Data Source Management
function initializeDataSources() {
    const dataSources = document.querySelectorAll('.data-source');
    
    dataSources.forEach(source => {
        source.addEventListener('click', () => {
            const sourceType = source.dataset.type;
            const indicator = source.querySelector('.data-source__indicator');
            const countEl = source.querySelector('.data-source__count');
            
            if (indicator && countEl) {
                const isActive = indicator.classList.contains('active');
                
                if (isActive) {
                    indicator.classList.remove('active');
                    countEl.textContent = 'Disconnected';
                    showNotification(`${sourceType} data source disconnected`, 'info');
                } else {
                    indicator.classList.add('active');
                    // Update count based on source type
                    const counts = {
                        cities: '3 cities loaded',
                        sensors: '3 sensors active',
                        satellite: 'Real-time feed'
                    };
                    countEl.textContent = counts[sourceType] || 'Connected';
                    showNotification(`${sourceType} data source connected`, 'success');
                }
            }
        });
    });
}

// Real-time Updates Simulation
function startRealTimeUpdates() {
    setInterval(() => {
        // Update metrics with small random variations
        const metrics = document.querySelectorAll('.metric-value');
        metrics.forEach(metric => {
            const currentValue = parseFloat(metric.textContent);
            if (!isNaN(currentValue)) {
                const variation = (Math.random() - 0.5) * 2; // -1 to +1
                const newValue = Math.max(0, Math.min(100, currentValue + variation));
                metric.textContent = newValue.toFixed(1);
            }
        });
        
        // Update confidence levels
        const confidenceFills = document.querySelectorAll('.confidence-fill');
        confidenceFills.forEach(fill => {
            const currentWidth = parseFloat(fill.style.width);
            if (!isNaN(currentWidth)) {
                const variation = (Math.random() - 0.5) * 2;
                const newWidth = Math.max(70, Math.min(95, currentWidth + variation));
                fill.style.width = `${newWidth}%`;
                const confidenceText = fill.parentElement.querySelector('.confidence-text');
                if (confidenceText) {
                    confidenceText.textContent = `${Math.round(newWidth)}% Confidence`;
                }
            }
        });
        
        updateLastUpdateTime();
    }, 30000); // Update every 30 seconds
}

// Welcome Banner Functionality
function initializeWelcomeBanner() {
    const dismissBanner = document.getElementById('dismissBanner');
    const welcomeBanner = document.getElementById('welcomeBanner');
    
    if (dismissBanner && welcomeBanner) {
        dismissBanner.addEventListener('click', () => {
            welcomeBanner.style.transform = 'translateY(-100%)';
            setTimeout(() => {
                welcomeBanner.style.display = 'none';
            }, 300);
        });
    }
}

// Search Functionality
function initializeSearch() {
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.btn-search');
    
    function performSearch() {
        if (searchInput) {
            const query = searchInput.value.trim();
            if (query) {
                showProcessingIndicator(`Searching for "${query}"...`);
                setTimeout(() => {
                    hideProcessingIndicator();
                    showNotification(`Search results for "${query}" would appear here`, 'info');
                }, 1000);
            }
        }
    }
    
    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
}

// Help and Settings
function initializeHeaderActions() {
    const helpBtn = document.getElementById('helpBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    
    if (helpBtn) {
        helpBtn.addEventListener('click', () => {
            showNotification('Help documentation would open here', 'info');
        });
    }
    
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            showNotification('User settings panel would open here', 'info');
        });
    }
}

// Accessibility Features
function initializeAccessibility() {
    // Keyboard navigation for cards
    const cards = document.querySelectorAll('.result-card, .ai-model, .data-source');
    cards.forEach(card => {
        card.setAttribute('tabindex', '0');
        card.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                card.click();
            }
        });
    });
}

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing GeoSpatial AI Platform...');
    
    try {
        // Initialize all components
        initializeMap();
        initializeTour();
        initializeSidebar();
        initializeAIModels();
        initializeMapControls();
        initializeResultsActions();
        initializeDataSources();
        initializeWelcomeBanner();
        initializeSearch();
        initializeHeaderActions();
        initializeAccessibility();
        
        // Start real-time updates
        startRealTimeUpdates();
        
        // Update initial timestamp
        updateLastUpdateTime();
        
        console.log('GeoSpatial AI Platform initialized successfully!');
        
        // Show welcome notification
        setTimeout(() => {
            showNotification('Welcome to your world-class geospatial AI platform!', 'success');
        }, 1000);
        
    } catch (error) {
        console.error('Error initializing application:', error);
        showNotification('Application initialization error. Please refresh the page.', 'error');
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    if (AppState.map) {
        AppState.map.invalidateSize();
    }
});

// Handle visibility changes for performance
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause heavy operations when tab is not visible
        console.log('Application paused - tab not visible');
    } else {
        // Resume operations when tab becomes visible
        console.log('Application resumed - tab visible');
        if (AppState.map) {
            AppState.map.invalidateSize();
        }
    }
});