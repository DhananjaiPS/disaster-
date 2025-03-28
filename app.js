// Global state
let currentPage = 'dashboard';
let disasterAlerts = [];
let map = null;
let userLocation = null;

// User state
let currentUser = null;

// Add this at the top of your file with other global variables
const schemes = [
    {
        id: 1,
        title: "PM Disaster Relief Fund",
        type: "central",
        category: "disaster",
        description: "Financial assistance for disaster affected regions",
        eligibility: "Disaster affected citizens",
        benefits: [
            "Immediate financial relief",
            "Medical assistance",
            "Rehabilitation support"
        ],
        applicationProcess: "Apply through local district administration",
        documents: ["Aadhar Card", "Disaster Impact Assessment Report"],
        deadline: "Open throughout the year",
        status: "Active",
        compensationDetails: {
            propertyDamage: {
                full: "Up to ₹10 lakhs for complete destruction",
                partial: "Up to ₹5 lakhs for partial damage",
                assessment: "Based on government surveyor report"
            },
            personalInjury: {
                death: "₹4 lakhs to next of kin",
                disability: "Up to ₹2 lakhs based on disability percentage",
                medical: "Up to ₹1 lakh for treatment"
            }
        }
    },
    {
        id: 2,
        title: "State Disaster Response Fund",
        type: "state",
        category: "disaster",
        description: "Quick response and relief for state-level disasters",
        benefits: [
            "Emergency rescue operations",
            "Temporary accommodation",
            "Food and medical supplies"
        ],
        documents: ["Aadhar Card", "Address Proof", "Bank Account Details"],
        deadline: "Within 30 days of disaster",
        status: "Active",
        compensationDetails: {
            relief: {
                immediate: "Up to ₹50,000 immediate relief",
                temporary: "₹10,000 per month for temporary accommodation",
                supplies: "Essential supplies worth ₹5,000"
            }
        }
    },
    {
        id: 3,
        title: "Disaster Insurance Coverage",
        type: "central",
        category: "insurance",
        description: "Comprehensive insurance coverage for disaster-affected individuals and properties",
        eligibility: "All citizens",
        benefits: [
            "Property damage coverage up to ₹10 lakhs",
            "Personal accident coverage",
            "Emergency medical expenses",
            "Temporary relocation assistance"
        ],
        documents: [
            "Aadhar Card",
            "Property Documents",
            "Damage Assessment Report",
            "Bank Account Details",
            "Medical Records (if applicable)"
        ],
        deadline: "Within 30 days of disaster event",
        compensationDetails: {
            propertyDamage: {
                full: "Up to ₹10 lakhs for complete destruction",
                partial: "Up to ₹5 lakhs for partial damage",
                assessment: "Based on government surveyor report"
            },
            personalInjury: {
                death: "₹4 lakhs to next of kin",
                disability: "Up to ₹2 lakhs based on disability percentage",
                medical: "Up to ₹1 lakh for treatment"
            }
        }
    }
];

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Set up default user if no users exist
    const savedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    if (savedUsers.length === 0) {
        const defaultUser = {
            name: 'DJ',
            email: 'dj@gmail.com',
            phone: '6009950848',
            password: '123',
            address: 'C 63 KashiramNagar Moradabad,Uttar Predesh',
            emergencyContact: '8944944254',
            bloodGroup: 'O+',
            safetyStatus: 'Loading...'
        };
        savedUsers.push(defaultUser);
        localStorage.setItem('users', JSON.stringify(savedUsers));
    }

    setupNavigation();
    checkLoginStatus();
});

// Navigation setup
function setupNavigation() {
    document.querySelector('.nav-brand').addEventListener('click', () => loadPage('dashboard'));
    document.querySelector('.sos-btn').addEventListener('click', () => loadPage('emergency-sos'));
    document.querySelector('.profile-btn').addEventListener('click', () => loadPage('profile'));
    document.querySelector('.location-btn').addEventListener('click', () => showLocationModal());
}

// Page routing
function loadPage(pageName) {
    currentPage = pageName;
    const mainContent = document.getElementById('main-content');

    // Check if location is required for this page
    // if (['dashboard', 'risk-assessment', 'govt-services'].includes(pageName)) {
    //     const savedLocation = localStorage.getItem('userLocation');
    //     if (!savedLocation) {
    //         // showLocationModal();
    //         return;
    //     }
    //     userLocation = JSON.parse(savedLocation);
    // }

    switch (pageName) {
        case 'dashboard':
            mainContent.innerHTML = createDashboardHTML();
            initializeMap();
            loadDisasterAlerts();
            break;
        case 'emergency-sos':
            mainContent.innerHTML = createEmergencySOSHTML();
            setupEmergencyForm();
            break;
        case 'login':
            mainContent.innerHTML = createLoginHTML();
            setupLoginForm();
            break;
        case 'register':
            mainContent.innerHTML = createRegistrationHTML();
            setupRegistrationForm();
            break;
        case 'profile':
            mainContent.innerHTML = createProfileHTML();
            break;
        case 'risk-assessment':
            mainContent.innerHTML = createRiskAssessmentHTML();
            break;
        case 'govt-services':
            mainContent.innerHTML = createGovtServicesHTML();
            break;
        // Add other pages as needed
    }
}

// Map initialization
function initializeMap() {
    if (!map) {
        map = L.map('disaster-map').setView([20.5937, 78.9629], 5);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
    }
    updateMapMarkers();
}

// Update map markers
function updateMapMarkers() {
    if (!map) return;

    // Clear existing markers
    map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });

    // Add disaster markers
    disasterAlerts.forEach(alert => {
        const marker = L.marker([alert.location.lat, alert.location.lng])
            .bindPopup(`
                <b>${alert.type}</b><br>
                ${alert.description}<br>
                Severity: ${alert.severity}<br>
                <button onclick="notifyNearbyUsers(${alert.location.lat}, ${alert.location.lng})">
                    Notify Nearby Users
                </button>
            `)
            .addTo(map);
    });
}

// Create Dashboard HTML
function createDashboardHTML() {
    return `
        <div class="dashboard-container">
            <div class="dashboard-header">
                <h1 class="headingDashBoard">Live Disaster Dashboard</h1>
                <div class="dashboard-controls">
                <div class="sub-board">
                <button onclick="refreshDashboard()" class="refresh-btn">
                    <i class="fas fa-sync"></i> Refresh
                </button>
                <button onclick="toggleNotifications()" class="notifications-toggle">
                    <i class="fas fa-bell"></i> Enable Notifications
                </button>
                </div>
                <button onclick="refreshDashboard()" class="media-btn refresh-btn">
                       📸 Media Analysis
                    </button>
                </div>
            </div>

            <div class="dashboard-grid">
                <!-- Live Map Section -->
                <div class="dashboard-section map-section">
                    <h2>Live Disaster Map</h2>
                    <div id="disaster-map" class="map-container"></div>
                    <div class="map-controls">
                        <button onclick="toggleLayer('disaster-zones')">Disaster Zones</button>
                        <button onclick="toggleLayer('safe-zones')">Safe Zones</button>
                        <button onclick="toggleLayer('evacuation-centers')">Evacuation Centers</button>
                        <button onclick="toggleLayer('hospitals')">Hospitals</button>
                        <button onclick="toggleLayer('road-blocks')">Road Blocks</button>
                    </div>
                </div>

                <!-- Real-time Alerts Section -->
                <div class="dashboard-section alerts-section">
                    <h2>Real-time Alerts</h2>
                    <div class="alerts-filter">

                        <button class="filter-btn active" onclick="filterAlerts('all')">All</button>
                        <button class="filter-btn" onclick="filterAlerts('high')">High Priority</button>
                        <button class="filter-btn" onclick="filterAlerts('medium')">Medium</button>
                        <button class="filter-btn" onclick="filterAlerts('low')">Low</button>
                        <button class=" filter-btn modeSwitch-btn" onclick="filterAlerts('local')">Local</button>
                    </div>
                    <div id="alerts-container" class="alerts-container"></div>
                </div>

                <!-- Emergency Contacts Section -->
                <div class="dashboard-section contacts-section">
                    <h2>Emergency Contacts</h2>
                    <div class="quick-contacts">
                        <button class="sos-btn" onclick="triggerSOS()">
                            <i class="fas fa-phone"></i> Emergency SOS
                        </button>
                        <div class="contact-list">
                            <div class="contact-group">
                                <h3>Emergency Services</h3>
                                <button onclick="callEmergency('police')">Police (100)</button>
                                <button onclick="callEmergency('fire')">Fire (101)</button>
                                <button onclick="callEmergency('ambulance')">Ambulance (108)</button>
                            </div>
                            <div class="contact-group">
                                <h3>Disaster Relief</h3>
                                <button onclick="callEmergency('ndrf')">NDRF Helpline</button>
                                <button onclick="callEmergency('redcross')">Red Cross</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Community Support Section -->
                <div class="dashboard-section community-section">
                    <h2>Community Support</h2>
                    <div class="community-actions">
                        <button onclick="showReportModal()" class="report-btn">
                           📸 Report Incident
                        </button>
                        <button onclick="showMissingPersonModal()" class="missing-btn">
                            <i class="fas fa-user-missing"></i> Report Missing Person
                        </button>
                        <button onclick="showVolunteerModal()" class="volunteer-btn">
                            <i class="fas fa-hands-helping"></i> Volunteer
                        </button>
                    </div>
                    <div id="community-feed" class="community-feed"></div>
                </div>

                <!-- Risk Assessment Section -->
                <div class="dashboard-section risk-section">
                    <h2>Risk Assessment</h2>
                    <div class="risk-indicators">
                        <div class="risk-card">
                            <h3>Current Risk Level</h3>
                            <div class="risk-meter">
                                <div class="risk-level" style="width: ${getCurrentRiskLevel().percentage}%">
                                    <span>${40}%</span>
                               <!--  <span>${getCurrentRiskLevel().percentage}%</span>-->
                                </div>
                            </div>
                            <p class="risk-status">${getCurrentRiskLevel().status}</p>
                        </div>
                        <div class="weather-forecast">
                            <h3>Weather Forecast</h3>
                            <div id="weather-container"></div>
                        </div>
                    </div>
                </div>

                <!-- Disaster Preparedness Section -->
                <div class="dashboard-section preparedness-section">
                    <h2>Disaster Preparedness</h2>
                    <div class="preparedness-content">
                        <div class="preparedness-tabs">
                            <button class="tab-btn active" onclick="showPreparednessTab('tips')">Survival Tips</button>
                            <button class="tab-btn" onclick="showPreparednessTab('checklist')">Emergency Kit</button>
                            <button class="tab-btn" onclick="showPreparednessTab('videos')">How-to Videos</button>
                        </div>
                        <div id="preparedness-content" class="preparedness-tab-content"></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modals -->
        <div id="reportModal" class="modal">
            <div class="modal-content">
                <span class="close-btn" onclick="closeModal('reportModal')">&times;</span>
                <h2>Report Incident</h2>
                <form id="reportForm" onsubmit="submitReport(event)">
                    <div class="form-group">
                        <label>Incident Type</label>
                        <select required>
                            <option value="">Select Type</option>
                            <option value="flood">Flood</option>
                            <option value="earthquake">Earthquake</option>
                            <option value="fire">Fire</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <textarea required></textarea>
                    </div>
                    <div class="form-group">
                        <label>Upload Media</label>
                        <input type="file" accept="image/*,video/*" multiple>
                    </div>
                    <button type="submit" class="submit-btn">Submit Report</button>
                </form>
            </div>
        </div>

        <div id="missingPersonModal" class="modal">
            <div class="modal-content">
                <span class="close-btn" onclick="closeModal('missingPersonModal')">&times;</span>
                <h2>Report Missing Person</h2>
                <form id="missingPersonForm" onsubmit="submitMissingPerson(event)">
                    <div class="form-group">
                        <label>Person's Name</label>
                        <input type="text" required>
                    </div>
                    <div class="form-group">
                        <label>Last Seen Location</label>
                        <input type="text" required>
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <textarea required></textarea>
                    </div>
                    <div class="form-group">
                        <label>Photo</label>
                        <input type="file" accept="image/*" required>
                    </div>
                    <button type="submit" class="submit-btn">Submit Report</button>
                </form>
            </div>
        </div>

        <div id="volunteerModal" class="modal">
            <div class="modal-content">
                <span class="close-btn" onclick="closeModal('volunteerModal')">&times;</span>
                <h2>Volunteer Registration</h2>
                <form id="volunteerForm" onsubmit="submitVolunteer(event)">
                    <div class="form-group">
                        <label>Skills</label>
                        <select multiple required>
                            <option value="first-aid">First Aid</option>
                            <option value="rescue">Rescue Operations</option>
                            <option value="counseling">Counseling</option>
                            <option value="logistics">Logistics</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Availability</label>
                        <input type="text" placeholder="e.g., 24/7, Weekends only" required>
                    </div>
                    <div class="form-group">
                        <label>Contact Information</label>
                        <input type="tel" required>
                    </div>
                    <button type="submit" class="submit-btn">Register as Volunteer</button>
                </form>
            </div>
        </div>
    `;
}

// Dashboard functionality
function refreshDashboard() {
    loadDisasterAlerts();
    updateWeatherForecast();
    updateCommunityFeed();
    updateRiskAssessment();
}

function toggleNotifications() {
    if (Notification.permission === 'granted') {
        alert('Notifications are already enabled');
    } else {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                alert('Notifications enabled successfully');
            }
        });
    }
}

function toggleLayer(layerType) {
    // Implementation for toggling map layers
    console.log(`Toggling layer: ${layerType}`);
}

function filterAlerts(priority) {
    const buttons = document.querySelectorAll('.alerts-filter .filter-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    const alerts = document.querySelectorAll('.alert-card');
    alerts.forEach(alert => {
        if (priority === 'all' || alert.dataset.priority === priority) {
            alert.style.display = 'block';
        } else {
            alert.style.display = 'none';
        }
    });
}

function triggerSOS() {
    if (confirm('Are you sure you want to trigger an emergency SOS?')) {
        // Implement SOS functionality
        alert('Emergency services have been notified. Help is on the way.');
    }
}

function callEmergency(service) {
    const numbers = {
        police: '100',
        fire: '101',
        ambulance: '108',
        ndrf: '1800-180-1234',
        redcross: '1800-180-1234'
    };

    if (numbers[service]) {
        window.location.href = `tel:${numbers[service]}`;
    }
}

function showReportModal() {
    document.getElementById('reportModal').style.display = 'block';
}

function showMissingPersonModal() {
    document.getElementById('missingPersonModal').style.display = 'block';
}

function showVolunteerModal() {
    document.getElementById('volunteerModal').style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

async function submitReport(event) {
    event.preventDefault();
    // Implement report submission
    alert('Report submitted successfully');
    closeModal('reportModal');
}

async function submitMissingPerson(event) {
    event.preventDefault();
    // Implement missing person report submission
    alert('Missing person report submitted successfully');
    closeModal('missingPersonModal');
}

async function submitVolunteer(event) {
    event.preventDefault();
    // Implement volunteer registration
    alert('Volunteer registration successful');
    closeModal('volunteerModal');
}

async function updateWeatherForecast() {
   
        // In a real app, this would fetch from a weather API
        const weatherContainer = document.getElementById('weather-container');
        
        if (weatherContainer) {
            const weatherContainer = document.getElementById('weather-container');
            async function getWeather(event) {
            event.preventDefault();

            const apiKey = "b65707795cc0c0c89539279426e5f01d";
        
            const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${Bareilly}&appid=${apiKey}&units=metric`;



            const response = await fetch(weatherUrl);
            const data = await response.json();

            if (data.cod === "404") {
                alert("City not found! Please enter a valid city.");
                return;
            }

            weatherContainer.innerHTML = `
                <div class="weather-card">
                        <div class="weather-info">
                            <span class="temperature">${data.main.temp}°C</span>
                            <span class="condition">${data.weather[0].description}</span>
                        </div>
                        <div class="weather-details">
                            <p>Humidity:${data.main.humidity}%</p>
                            <p>Wind: ${data.wind.speed} km/h</p>
                            <p>Rain Probability: 30%</p>
                        </div>
                    </div>
            `;
        }
    } 
   
}


function updateCommunityFeed() {
    const feed = document.getElementById('community-feed');
    if (feed) {
        // In a real app, this would fetch from a backend
        feed.innerHTML = `
            <div class="community-post">
                <div class="post-header">
                    <img src="https://via.placeholder.com/40" alt="User" class="user-avatar">
                    <div class="post-info">
                        <span class="user-name">John Doe</span>
                        <span class="post-time">2 hours ago</span>
                    </div>
                </div>
                <p class="post-content">Need immediate help with evacuation in downtown area.</p>
                <div class="post-actions">
                    <button onclick="respondToPost(1)">Respond</button>
                    <button onclick="sharePost(1)">Share</button>
                </div>
            </div>
        `;
    }
}

function showPreparednessTab(tab) {
    const tabs = document.querySelectorAll('.preparedness-tabs .tab-btn');
    tabs.forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');

    const content = document.getElementById('preparedness-content');
    switch (tab) {
        case 'tips':
            content.innerHTML = generateSurvivalTips();
            break;
        case 'checklist':
            content.innerHTML = generateEmergencyChecklist();
            break;
        case 'videos':
            content.innerHTML = generateHowToVideos();
            break;
    }
}

function generateSurvivalTips() {
    return `
        <div class="survival-tips">
            <div class="tip-card">
                <h3>Earthquake Safety</h3>
                <ul>
                    <li>Drop, cover, and hold on</li>
                    <li>Stay away from windows</li>
                    <li>Move to open areas if outdoors</li>
                </ul>
            </div>
            <div class="tip-card">
                <h3>Flood Safety</h3>
                <ul>
                    <li>Move to higher ground</li>
                    <li>Avoid walking in water</li>
                    <li>Stay tuned to weather updates</li>
                </ul>
            </div>
        </div>
    `;
}

function generateEmergencyChecklist() {
    return `
        <div class="emergency-checklist">
            <div class="checklist-item">
                <input type="checkbox" id="water">
                <label for="water">Water (1 gallon per person per day)</label>
            </div>
            <div class="checklist-item">
                <input type="checkbox" id="food">
                <label for="food">Non-perishable food</label>
            </div>
            <div class="checklist-item">
                <input type="checkbox" id="first-aid">
                <label for="first-aid">First aid kit</label>
            </div>
            <div class="checklist-item">
                <input type="checkbox" id="flashlight">
                <label for="flashlight">Flashlight and batteries</label>
            </div>
        </div>
    `;
}

function generateHowToVideos() {
    return `
        <div class="how-to-videos">
            <div class="video-card">
                <h3>First Aid Basics</h3>
                <div class="video-placeholder">
                    <i class="fas fa-play-circle"></i>
                </div>
            </div>
            <div class="video-card">
                <h3>CPR Guide</h3>
                <div class="video-placeholder">
                    <i class="fas fa-play-circle"></i>
                </div>
            </div>
        </div>
    `;
}

// Load disaster alerts
function loadDisasterAlerts() {
    // Simulated API call
    disasterAlerts = [
        {
            id: '1',
            type: 'EARTHQUAKE',
            severity: 'HIGH',
            location: {
                lat: 28.7041,
                lng: 77.1025,
                name: 'Delhi, India'
            },
            description: 'Magnitude 6.2 earthquake detected',
            timestamp: new Date()
        }
        // Add more mock alerts as needed
    ];

    renderAlerts();
    updateMapMarkers();
}

// Render alert cards
function renderAlerts() {
    const alertsContainer = document.getElementById('alerts-container');
    if (!alertsContainer) return;

    alertsContainer.innerHTML = disasterAlerts.map(alert => `
        <div class="alert-card">
            <div class="alert-header">
                <h3>${alert.type}</h3>
                <span class="severity-chip severity-${alert.severity.toLowerCase()}">
                    ${alert.severity}
                </span>
            </div>
            <p class="location">${alert.location.name}</p>
            <p class="description">${alert.description}</p>
            <small class="timestamp">${new Date(alert.timestamp).toLocaleString()}</small>
        </div>
    `).join('');
}

function createEmergencySOSHTML() {
    return `
        <div class="emergency-container">
            <h1 class="emergency-title">Emergency SOS</h1>
            <div class="emergency-form">
                <div class="form-step active" id="step1">
                    <h2>Type of Emergency</h2>
                    <select id="emergency-type" required>
                        <option value="MEDICAL">Medical Emergency</option>
                        <option value="RESCUE">Need Rescue</option>
                        <option value="FIRE">Fire Emergency</option>
                        <option value="POLICE">Police Emergency</option>
                        <option value="OTHER">Other</option>
                    </select>
                    <textarea id="emergency-description" placeholder="Describe the emergency..." required></textarea>
                    <button onclick="nextStep(2)">Next</button>
                </div>

                <div class="form-step" id="step2">
                    <h2>Location Details</h2>
                    <input type="text" id="address" placeholder="Address" required>
                    <input type="text" id="landmark" placeholder="Nearby Landmark">
                    <button onclick="getCurrentLocation()" class="location-btn">Use My Location</button>
                    <div class="button-group">
                        <button onclick="prevStep(1)">Back</button>
                        <button onclick="nextStep(3)">Next</button>
                    </div>
                </div>

                <div class="form-step" id="step3">
                    <h2>Contact Information</h2>
                    <input type="text" id="name" placeholder="Your Name" required>
                    <input type="tel" id="phone" placeholder="Your Phone Number" required>
                    <input type="tel" id="emergency-contact-1" placeholder="Emergency Contact 1" required>
                    <input type="tel" id="emergency-contact-2" placeholder="Emergency Contact 2 (Optional)">
                    <input type="number" id="people-affected" placeholder="Number of People Affected" min="1" value="1">
                    <div class="emergency-disclaimer">
                        <p>By submitting this form, emergency alerts will be sent to:</p>
                        <ul>
                            <li>Local Emergency Services</li>
                            <li>Your Emergency Contacts</li>
                            <li>Nearby Disaster Response Teams</li>
                        </ul>
                    </div>
                    <div class="button-group">
                        <button onclick="prevStep(2)">Back</button>
                        <button onclick="submitEmergency()" class="submit-btn">Submit SOS</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function setupEmergencyForm() {
    // Add form validation and step navigation
    window.nextStep = (step) => {
        document.querySelectorAll('.form-step').forEach(el => el.classList.remove('active'));
        document.getElementById(`step${step}`).classList.add('active');
    };

    window.prevStep = (step) => {
        document.querySelectorAll('.form-step').forEach(el => el.classList.remove('active'));
        document.getElementById(`step${step}`).classList.add('active');
    };

    window.getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    // You could reverse geocode here to get address
                    document.getElementById('address').value = `Lat: ${position.coords.latitude}, Lng: ${position.coords.longitude}`;
                },
                (error) => {
                    alert('Error getting location: ' + error.message);
                }
            );
        }
    };

    window.submitEmergency = async () => {
        const formData = {
            type: document.getElementById('emergency-type').value,
            description: document.getElementById('emergency-description').value,
            location: {
                address: document.getElementById('address').value,
                landmark: document.getElementById('landmark').value
            },
            contactInfo: {
                name: document.getElementById('name').value,
                phone: document.getElementById('phone').value
            },
            peopleAffected: document.getElementById('people-affected').value,
            emergencyContacts: [
                document.getElementById('emergency-contact-1').value,
                document.getElementById('emergency-contact-2').value
            ].filter(contact => contact) // Remove empty values
        };

        try {
            // Show loading state
            const submitBtn = document.querySelector('.submit-btn');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending SOS...';

            // Send SOS
            await sendSOS(formData);

            alert('Emergency SOS sent successfully! Help is on the way.');
            loadPage('dashboard');
        } catch (error) {
            alert('Error sending SOS. Please try again or call emergency services directly.');
        } finally {
            const submitBtn = document.querySelector('.submit-btn');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit SOS';
        }
    };
}

function checkLoginStatus() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateNavbarForUser();
        loadPage('dashboard');
    } else {
        loadPage('login');
    }
}

function updateNavbarForUser() {
    const profileBtn = document.querySelector('.profile-btn');
    if (currentUser) {
        profileBtn.textContent = currentUser.name;
        // Add logout button
        const logoutBtn = document.createElement('button');
        logoutBtn.textContent = 'Logout';
        logoutBtn.className = 'nav-items-btn';
        logoutBtn.onclick = logout;
        document.querySelector('.nav-items').appendChild(logoutBtn);
    }
}

function createLoginHTML() {
    return `
        <div class="auth-container">
            <div class="auth-box">
                <h2>Login to Disaster Management</h2>
                <form id="loginForm" class="auth-form">
                    <input type="email" id="loginEmail" placeholder="Email" required>
                    <input type="password" id="loginPassword" placeholder="Password" required>
                    <button type="submit" class="submit-btn">Login</button>
                </form>
                <p class="auth-switch">
                    Don't have an account? 
                    <a href="#" onclick="loadPage('register')">Register here</a>
                </p>
            </div>
        </div>
    `;
}

function createRegistrationHTML() {
    return `
        <div class="auth-container">
            <div class="auth-box">
                <h2>Register for Emergency Alerts</h2>
                <form id="registerForm" class="auth-form">
                    <input type="text" id="regName" placeholder="Full Name" required>
                    <input type="email" id="regEmail" placeholder="Email" required>
                    <input type="tel" id="regPhone" placeholder="Phone Number" required>
                    <input type="password" id="regPassword" placeholder="Password" required>
                    <input type="text" id="regAddress" placeholder="Home Address" required>
                    <input type="text" id="regEmergencyContact" placeholder="Emergency Contact Number">
                    <select id="regBloodGroup">
                        <option value="">Blood Group (Optional)</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                    </select>
                    <button type="submit" class="submit-btn">Register</button>
                </form>
                <p class="auth-switch">
                    Already have an account? 
                    <a href="#" onclick="loadPage('login')">Login here</a>
                </p>
            </div>
        </div>
    `;
}

function setupLoginForm() {
    const form = document.getElementById('loginForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        const savedUsers = JSON.parse(localStorage.getItem('users') || '[]');
        const user = savedUsers.find(u => u.email === email && u.password === password);

        if (user) {
            currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            updateNavbarForUser();
            loadPage('dashboard');
        } else {
            alert('Invalid credentials');
        }
    });
}

function setupRegistrationForm() {
    const form = document.getElementById('registerForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const newUser = {
            name: document.getElementById('regName').value,
            email: document.getElementById('regEmail').value,
            phone: document.getElementById('regPhone').value,
            password: document.getElementById('regPassword').value,
            address: document.getElementById('regAddress').value,
            emergencyContact: document.getElementById('regEmergencyContact').value,
            bloodGroup: document.getElementById('regBloodGroup').value,
            safetyStatus: 'unknown'
        };

        // In a real app, send to server
        const savedUsers = JSON.parse(localStorage.getItem('users') || '[]');
        savedUsers.push(newUser);
        localStorage.setItem('users', JSON.stringify(savedUsers));

        alert('Registration successful! Please login.');
        loadPage('login');
    });
}

// Function to notify users in affected area
function notifyNearbyUsers(lat, lng) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    users.forEach(user => {
        // In a real app, you would:
        // 1. Calculate distance between user's address and disaster location
        // 2. Send notifications via SMS/email
        // 3. Update user's dashboard
        console.log(`Would notify ${user.name} about nearby disaster`);
    });
    alert('Notifications sent to users in affected area');
}

function createProfileHTML() {
    if (!currentUser) {
        loadPage('login');
        return '';
    }

    return `
        <div class="profile-container">
            <div class="profile-header">
                <h1>My Profile</h1>
                <button onclick="toggleEditMode()" class="edit-btn" id="editButton">Edit Profile</button>
            </div>
            <div class="profile-content">
                <form id="profileForm" class="profile-form" onsubmit="updateProfile(event)">
                    <div class="form-group">
                        <label>Full Name</label>
                        <input type="text" id="profileName" value="${currentUser.name || ''}" disabled>
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" id="profileEmail" value="${currentUser.email || ''}" disabled>
                    </div>
                    <div class="form-group">
                        <label>Phone Number</label>
                        <input type="tel" id="profilePhone" value="${currentUser.phone || ''}" disabled>
                    </div>
                    <div class="form-group">
                        <label>Home Address</label>
                        <input type="text" id="profileAddress" value="${currentUser.address || ''}" disabled>
                    </div>
                    <div class="form-group">
                        <label>Emergency Contact</label>
                        <input type="text" id="profileEmergencyContact" value="${currentUser.emergencyContact || ''}" disabled>
                    </div>
                    <div class="form-group">
                        <label>Blood Group</label>
                        <select id="profileBloodGroup" disabled>
                            <option value="">Select Blood Group</option>
                            <option value="A+" ${currentUser.bloodGroup === 'A+' ? 'selected' : ''}>A+</option>
                            <option value="A-" ${currentUser.bloodGroup === 'A-' ? 'selected' : ''}>A-</option>
                            <option value="B+" ${currentUser.bloodGroup === 'B+' ? 'selected' : ''}>B+</option>
                            <option value="B-" ${currentUser.bloodGroup === 'B-' ? 'selected' : ''}>B-</option>
                            <option value="O+" ${currentUser.bloodGroup === 'O+' ? 'selected' : ''}>O+</option>
                            <option value="O-" ${currentUser.bloodGroup === 'O-' ? 'selected' : ''}>O-</option>
                            <option value="AB+" ${currentUser.bloodGroup === 'AB+' ? 'selected' : ''}>AB+</option>
                            <option value="AB-" ${currentUser.bloodGroup === 'AB-' ? 'selected' : ''}>AB-</option>
                        </select>
                    </div>
                    <button type="submit" class="save-btn" style="display: none;">Save Changes</button>
                </form>
                <div class="safety-status">
                    <h2>Safety Status</h2>
                    <select id="safetyStatus" onchange="updateSafetyStatus(this.value)">
                        <option value="safe" ${currentUser.safetyStatus === 'safe' ? 'selected' : ''}>I am Safe</option>
                        <option value="unsafe" ${currentUser.safetyStatus === 'unsafe' ? 'selected' : ''}>Need Assistance</option>
                        <option value="unknown" ${currentUser.safetyStatus === 'unknown' ? 'selected' : ''}>Unknown</option>
                    </select>
                </div>
            </div>
        </div>
    `;
}

function toggleEditMode() {
    const form = document.getElementById('profileForm');
    const inputs = form.querySelectorAll('input, select');
    const saveBtn = form.querySelector('.save-btn');
    const editBtn = document.getElementById('editButton');

    const isDisabled = inputs[0].disabled;

    inputs.forEach(input => {
        input.disabled = !isDisabled;
    });

    saveBtn.style.display = isDisabled ? 'block' : 'none';
    editBtn.textContent = isDisabled ? 'Cancel' : 'Edit Profile';
}

function updateProfile(event) {
    event.preventDefault();

    const updatedUser = {
        ...currentUser,
        name: document.getElementById('profileName').value,
        email: document.getElementById('profileEmail').value,
        phone: document.getElementById('profilePhone').value,
        address: document.getElementById('profileAddress').value,
        emergencyContact: document.getElementById('profileEmergencyContact').value,
        bloodGroup: document.getElementById('profileBloodGroup').value
    };

    // Update in localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.email === currentUser.email);
    if (userIndex !== -1) {
        users[userIndex] = updatedUser;
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        currentUser = updatedUser;
    }

    toggleEditMode();
    alert('Profile updated successfully!');
}

function updateSafetyStatus(status) {
    currentUser.safetyStatus = status;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.email === currentUser.email);
    if (userIndex !== -1) {
        users[userIndex].safetyStatus = status;
        localStorage.setItem('users', JSON.stringify(users));
    }

    alert('Safety status updated successfully!');
}

// Add logout functionality
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    loadPage('login');
}

// Add these functions to handle SMS

async function sendSOS(emergencyData) {
    try {
        // Format the SOS message
        const message = `
            EMERGENCY SOS ALERT
            Type: ${emergencyData.type}
            Location: ${emergencyData.location.address}
            Landmark: ${emergencyData.location.landmark}
            Description: ${emergencyData.description}
            Contact: ${emergencyData.contactInfo.name} (${emergencyData.contactInfo.phone})
            People Affected: ${emergencyData.peopleAffected}
        `;

        // For demonstration, show what would be sent
        console.log('SOS Message:', message);

        // In a real application, you would send this to your backend
        const response = await sendSMSAlert(
            emergencyData.contactInfo.phone,
            message
        );

        return response;
    } catch (error) {
        console.error('Error sending SOS:', error);
        throw error;
    }
}

function createRiskAssessmentHTML() {
    return `
        <div class="risk-assessment-container">
            <h1>Location Risk Assessment</h1>
            <div class="location-status">
                <div class="status-card ${getCurrentRiskLevel().className}">
                    <h2>Current Risk Level</h2>
                    <div class="risk-meter">
                        <div class="risk-level" style="width: ${getCurrentRiskLevel().percentage}%">
                            <span>${getCurrentRiskLevel().percentage}%</span>
                        </div>
                    </div>
                    <p class="risk-status">${getCurrentRiskLevel().status}</p>
                </div>
            </div>

            <div class="potential-disasters">
                <h2>Potential Risks</h2>
                <div class="disaster-cards">
                    ${generateDisasterRiskCards()}
                </div>
            </div>

            ${createSafetyGuidelinesSection()}
        </div>
    `;
}

function getCurrentRiskLevel() {
    // In a real app, this would be calculated based on real-time data
    return {
        percentage: 65,
        status: 'Moderate Risk - Stay Alert',
        className: 'moderate-risk'
    };
}

function generateDisasterRiskCards() {
    const disasters = [
        {
            type: 'Flood',
            probability: 75,
            timeframe: '48 hours',
            severity: 'High',
            details: 'Heavy rainfall expected'
        },
        {
            type: 'Earthquake',
            probability: 30,
            timeframe: '7 days',
            severity: 'Moderate',
            details: 'Seismic activity detected'
        },
        // Add more disaster types as needed
    ];

    return disasters.map(disaster => `
        <div class="disaster-risk-card" onclick="showDisasterDetails('${disaster.type}')">
            <div class="risk-header">
                <h3>${disaster.type}</h3>
                <span class="probability">${disaster.probability}%</span>
            </div>
            <div class="risk-details">
                <p>Expected within: ${disaster.timeframe}</p>
                <p>Severity: ${disaster.severity}</p>
                <p>${disaster.details}</p>
                <div class="probability-bar">
                    <div class="probability-level" style="width: ${disaster.probability}%"></div>
                </div>
            </div>
        </div>
    `).join('');
}

function createSafetyGuidelinesSection() {
    return `
        <div class="safety-guidelines">
            <h2>Safety Guidelines</h2>
            <div class="guidelines-tabs">
                <button class="tab-btn active" onclick="showGuidelines('do')">Do's</button>
                <button class="tab-btn" onclick="showGuidelines('dont')">Don'ts</button>
            </div>
            <div class="guidelines-content">
                <div id="doGuidelines" class="guidelines-list active">
                    ${generateDosList()}
                </div>
                <div id="dontGuidelines" class="guidelines-list">
                    ${generateDontsList()}
                </div>
            </div>
        </div>
    `;
}

function generateDosList() {
    const dos = [
        'Stay informed through official channels',
        'Keep emergency contacts handy',
        'Prepare an emergency kit',
        'Follow evacuation orders promptly',
        'Help others if you are safe'
    ];

    return dos.map((item, index) => `
        <div class="guideline-item do-item" style="animation-delay: ${index * 0.2}s">
            <span class="checkmark">✓</span>
            <p>${item}</p>
        </div>
    `).join('');
}

function generateDontsList() {
    const donts = [
        'Don\'t panic or spread rumors',
        'Don\'t ignore warning signals',
        'Don\'t use elevators during emergencies',
        'Don\'t return until authorities declare safe',
        'Don\'t forget to turn off utilities'
    ];

    return donts.map((item, index) => `
        <div class="guideline-item dont-item" style="animation-delay: ${index * 0.2}s">
            <span class="cross">✕</span>
            <p>${item}</p>
        </div>
    `).join('');
}

// Add to window object for HTML onclick access
window.showGuidelines = function (type) {
    document.querySelectorAll('.guidelines-list').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));

    document.getElementById(`${type}Guidelines`).classList.add('active');
    event.target.classList.add('active');
};

window.showDisasterDetails = function (disasterType) {
    // Implement detailed view for each disaster type
    console.log(`Showing details for ${disasterType}`);
};

// Update the getSchemeById function
function getSchemeById(id) {
    return schemes.find(scheme => scheme.id === parseInt(id));
}

// Update the generateSchemeCards function
function generateSchemeCards() {
    return schemes.map(scheme => `
        <div class="scheme-card ${scheme.type}" data-category="${scheme.category}">
            <div class="scheme-header">
                <h3>${scheme.title}</h3>
                <span class="scheme-badge ${scheme.type}">${scheme.type.toUpperCase()}</span>
            </div>
            <p>${scheme.description}</p>
            ${scheme.compensationDetails ? createCompensationPreview(scheme.compensationDetails) : ''}
            <div class="scheme-footer">
                <button onclick="showSchemeDetails(${scheme.id})" class="details-btn">View Details</button>
                <button onclick="startApplication(${scheme.id})" class="apply-btn">Apply Now</button>
            </div>
        </div>
    `).join('');
}

// Add close modal functionality
window.closeSchemeDetails = function () {
    const modal = document.getElementById('schemeModal');
    if (modal) {
        modal.style.display = 'none';
    }
};

// Update createGovtServicesHTML to include close button functionality
function createGovtServicesHTML() {
    return `
        <div class="govt-services-container">
            <h1>Government Services & Schemes</h1>
            
            <div class="services-filter">
                <button class="filter-btn active" onclick="filterSchemes('all')">All Schemes</button>
                <button class="filter-btn" onclick="filterSchemes('central')">Central Govt</button>
                <button class="filter-btn" onclick="filterSchemes('state')">State Govt</button>
                <button class="filter-btn" onclick="filterSchemes('disaster')">Disaster Relief</button>
                <button class="filter-btn" onclick="filterSchemes('insurance')">Insurance</button>
            </div>

            <div class="search-box">
                <input type="text" id="schemeSearch" placeholder="Search schemes..." onkeyup="searchSchemes()">
            </div>

            <div class="schemes-grid" id="schemesContainer">
                ${generateSchemeCards()}
            </div>

            <div id="schemeModal" class="scheme-modal">
                <div class="modal-content">
                    <span class="close-btn" onclick="closeSchemeDetails()">&times;</span>
                    <div id="schemeDetails"></div>
                </div>
            </div>
        </div>
    `;
}

// Add these helper functions
window.filterSchemes = function (category) {
    const cards = document.querySelectorAll('.scheme-card');
    const buttons = document.querySelectorAll('.filter-btn');

    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    cards.forEach(card => {
        if (category === 'all' || card.classList.contains(category)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
};

window.searchSchemes = function () {
    const searchText = document.getElementById('schemeSearch').value.toLowerCase();
    const cards = document.querySelectorAll('.scheme-card');

    cards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        const description = card.querySelector('p').textContent.toLowerCase();

        if (title.includes(searchText) || description.includes(searchText)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
};

// Add these functions for scheme application

function startApplication(schemeId) {
    const scheme = getSchemeById(schemeId);
    const modal = document.getElementById('schemeModal');
    const detailsContainer = document.getElementById('schemeDetails');

    detailsContainer.innerHTML = `
        <h2>Apply for ${scheme.title}</h2>
        <form id="schemeApplicationForm" class="application-form" onsubmit="submitApplication(event, ${schemeId})">
            <div class="form-section">
                <h3>Personal Information</h3>
                <div class="form-group">
                    <label for="fullName">Full Name *</label>
                    <input type="text" id="fullName" required value="${currentUser?.name || ''}">
                </div>
                <div class="form-group">
                    <label for="aadhar">Aadhar Number *</label>
                    <input type="text" id="aadhar" required pattern="[0-9]{12}" title="Please enter valid 12-digit Aadhar number">
                </div>
                <div class="form-group">
                    <label for="phone">Phone Number *</label>
                    <input type="tel" id="phone" required value="${currentUser?.phone || ''}">
                </div>
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" value="${currentUser?.email || ''}">
                </div>
            </div>

            <div class="form-section">
                <h3>Address Details</h3>
                <div class="form-group">
                    <label for="address">Full Address *</label>
                    <textarea id="address" required>${currentUser?.address || ''}</textarea>
                </div>
                <div class="form-group">
                    <label for="pincode">PIN Code *</label>
                    <input type="text" id="pincode" required pattern="[0-9]{6}" title="Please enter valid 6-digit PIN code">
                </div>
            </div>

            ${scheme.category === 'insurance' ? createInsuranceFields() : ''}
            ${scheme.category === 'compensation' ? createCompensationFields() : ''}

            <div class="form-section">
                <h3>Required Documents</h3>
                <div class="document-upload-list">
                    ${scheme.documents.map(doc => `
                        <div class="document-upload">
                            <label>${doc} *</label>
                            <input type="file" required accept=".pdf,.jpg,.jpeg,.png">
                            <small>Supported formats: PDF, JPG, PNG (Max 5MB)</small>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="form-section">
                <h3>Declaration</h3>
                <div class="declaration-checkbox">
                    <input type="checkbox" id="declaration" required>
                    <label for="declaration">
                        I hereby declare that all the information provided is true and correct to the best of my knowledge.
                        I understand that providing false information may result in rejection of application and legal action.
                    </label>
                </div>
            </div>

            <div class="form-actions">
                <button type="button" class="back-btn" onclick="showSchemeDetails(${schemeId})">Back</button>
                <button type="submit" class="submit-btn">Submit Application</button>
            </div>
        </form>
    `;

    modal.style.display = 'block';
}

function createInsuranceFields() {
    return `
        <div class="form-section">
            <h3>Insurance Details</h3>
            <div class="form-group">
                <label for="propertyType">Type of Property *</label>
                <select id="propertyType" required>
                    <option value="">Select Property Type</option>
                    <option value="residential">Residential Building</option>
                    <option value="commercial">Commercial Property</option>
                    <option value="agricultural">Agricultural Land</option>
                </select>
            </div>
            <div class="form-group">
                <label for="damageType">Type of Damage *</label>
                <select id="damageType" required>
                    <option value="">Select Damage Type</option>
                    <option value="full">Complete Destruction</option>
                    <option value="partial">Partial Damage</option>
                    <option value="minor">Minor Damage</option>
                </select>
            </div>
            <div class="form-group">
                <label for="damageDescription">Damage Description *</label>
                <textarea id="damageDescription" required></textarea>
            </div>
        </div>
    `;
}

function createCompensationFields() {
    return `
        <div class="form-section">
            <h3>Loss Assessment</h3>
            <div class="form-group">
                <label for="lossType">Type of Loss *</label>
                <select id="lossType" required>
                    <option value="">Select Loss Type</option>
                    <option value="crop">Crop Damage</option>
                    <option value="livestock">Livestock Loss</option>
                    <option value="equipment">Equipment Damage</option>
                </select>
            </div>
            <div class="form-group">
                <label for="lossAmount">Estimated Loss Amount (₹) *</label>
                <input type="number" id="lossAmount" required min="0">
            </div>
            <div class="form-group">
                <label for="affectedArea">Affected Area (in hectares) *</label>
                <input type="number" id="affectedArea" required min="0" step="0.01">
            </div>
        </div>
    `;
}

async function submitApplication(event, schemeId) {
    event.preventDefault();
    const form = document.getElementById('schemeApplicationForm');
    const submitBtn = form.querySelector('.submit-btn');

    try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Store application in localStorage for demo
        const applications = JSON.parse(localStorage.getItem('applications') || '[]');
        applications.push({
            id: Date.now(),
            schemeId,
            userId: currentUser?.id,
            status: 'PENDING',
            submittedAt: new Date().toISOString(),
            formData: new FormData(form)
        });
        localStorage.setItem('applications', JSON.stringify(applications));

        alert('Application submitted successfully! You can track the status in your profile.');
        loadPage('profile');
    } catch (error) {
        alert('Error submitting application. Please try again.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Application';
    }
}

function createCompensationPreview(details) {
    return `
        <div class="compensation-preview">
            <h4>Compensation Highlights</h4>
            <div class="compensation-grid">
                ${Object.entries(details).map(([category, info]) => `
                    <div class="compensation-item">
                        <span class="compensation-category">${formatCategory(category)}</span>
                        <span class="compensation-amount">
                            ${getHighestAmount(info)}
                        </span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function formatCategory(category) {
    return category.charAt(0).toUpperCase() +
        category.slice(1).replace(/([A-Z])/g, ' $1');
}

function getHighestAmount(info) {
    const amounts = Object.values(info)
        .map(value => value.match(/₹[\d,]+ ?(?:lakhs?|per)/))
        .filter(Boolean)
        .map(match => match[0]);
    return amounts[0] || 'Variable amount';
}

function showSchemeDetails(schemeId) {
    const scheme = getSchemeById(schemeId);
    const modal = document.getElementById('schemeModal');
    const detailsContainer = document.getElementById('schemeDetails');

    detailsContainer.innerHTML = `
        <h2>${scheme.title}</h2>
        <div class="scheme-info">
            ${scheme.compensationDetails ? createDetailedCompensationTable(scheme.compensationDetails) : ''}
            
            <div class="info-section">
                <h3>Eligibility</h3>
                <p>${scheme.eligibility}</p>
            </div>
            
            <div class="info-section">
                <h3>Benefits</h3>
                <ul>
                    ${scheme.benefits.map(benefit => `<li>${benefit}</li>`).join('')}
                </ul>
            </div>

            <div class="info-section">
                <h3>Required Documents</h3>
                <ul>
                    ${scheme.documents.map(doc => `<li>${doc}</li>`).join('')}
                </ul>
            </div>

            <div class="info-section">
                <h3>How to Apply</h3>
                <p>${scheme.applicationProcess}</p>
                <p><strong>Deadline:</strong> ${scheme.deadline}</p>
            </div>

            <div class="scheme-actions">
                <button onclick="startApplication(${scheme.id})" class="apply-btn">Apply Now</button>
                <button onclick="downloadGuidelines(${scheme.id})" class="download-btn">Download Guidelines</button>
            </div>
        </div>
    `;

    modal.style.display = 'block';
}

function createDetailedCompensationTable(details) {
    return `
        <div class="compensation-details">
            <h3>Compensation Details</h3>
            ${Object.entries(details).map(([category, info]) => `
                <div class="compensation-category-details">
                    <h4>${formatCategory(category)}</h4>
                    <table class="compensation-table">
                        <tbody>
                            ${Object.entries(info).map(([type, amount]) => `
                                <tr>
                                    <td>${formatCategory(type)}</td>
                                    <td class="amount">${amount}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `).join('')}
        </div>
    `;
}

// Location handling functions
function showLocationModal() {
    const modal = document.createElement('div');
    modal.className = 'location-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-btn" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h2>Set Your Location</h2>
            <div class="location-options">
                <button onclick="getCurrentLocation()" class="location-btn">
                    <i class="fas fa-location-arrow"></i> Use Current Location
                </button>
                <div class="manual-location">
                    <h3>Or Enter Manually</h3>
                    <input type="text" id="locationSearch" placeholder="Search location...">
                    <div id="locationSuggestions" class="location-suggestions"></div>
                    <div id="selectedLocation" class="selected-location"></div>
                </div>
            </div>
            <button onclick="saveLocation()" class="submit-btn">Save Location</button>
        </div>
    `;
    model.style.display = "none";
    document.body.appendChild(modal);
}

function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                userLocation = { lat: latitude, lng: longitude };
                reverseGeocode(latitude, longitude);
            },
            (error) => {
                alert('Error getting location: ' + error.message);
            }
        );
    } else {
        alert('Geolocation is not supported by your browser');
    }
}

async function reverseGeocode(lat, lng) {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await response.json();
        const locationName = data.display_name;
        document.getElementById('selectedLocation').innerHTML = `
            <p>Selected Location: ${locationName}</p>
            <p>Coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}</p>
        `;
    } catch (error) {
        console.error('Error reverse geocoding:', error);
    }
}

async function searchLocation(query) {
    if (query.length < 3) return;

    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
        const data = await response.json();
        const suggestions = document.getElementById('locationSuggestions');
        suggestions.innerHTML = data.slice(0, 5).map(loc => `
            <div class="location-suggestion" onclick="selectLocation(${loc.lat}, ${loc.lon}, '${loc.display_name}')">
                ${loc.display_name}
            </div>
        `).join('');
    } catch (error) {
        console.error('Error searching location:', error);
    }
}

function selectLocation(lat, lng, name) {
    userLocation = { lat, lng };
    document.getElementById('selectedLocation').innerHTML = `
        <p>Selected Location: ${name}</p>
        <p>Coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}</p>
    `;
    document.getElementById('locationSuggestions').innerHTML = '';
}

function saveLocation() {
    if (userLocation) {
        localStorage.setItem('userLocation', JSON.stringify(userLocation));
        updateContentBasedOnLocation();
        document.querySelector('.location-modal').remove();
    } else {
        alert('Please select a location first');
    }
}

function updateContentBasedOnLocation() {
    // Update map view
    if (map && userLocation) {
        map.setView([userLocation.lat, userLocation.lng], 13);
    }

    // Update risk assessment
    if (currentPage === 'risk-assessment') {
        loadPage('risk-assessment');
    }

    // Update disaster alerts
    if (currentPage === 'dashboard') {
        loadDisasterAlerts();
    }

    // Update government services
    if (currentPage === 'govt-services') {
        loadPage('govt-services');
    }
}

// Add event listener for location search
document.addEventListener('input', (e) => {
    if (e.target.id === 'locationSearch') {
        searchLocation(e.target.value);
    }
}); 