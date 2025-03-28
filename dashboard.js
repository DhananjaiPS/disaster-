// Dashboard state
let mapLayers = {
    'disaster-zones': true,
    'safe-zones': true,
    'evacuation-centers': true,
    'hospitals': true,
    'road-blocks': true
};

// Initialize dashboard
function initializeDashboard() {
    setupMap();
    setupRealTimeUpdates();
    setupNotifications();
    loadInitialData();
}

// Map setup and management
function setupMap() {
    if (!map) {
        map = L.map('disaster-map').setView([20.5937, 78.9629], 5);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
    }

    // Add layer controls
    L.control.layers(null, {
        'Disaster Zones': disasterZonesLayer,
        'Safe Zones': safeZonesLayer,
        'Evacuation Centers': evacuationCentersLayer,
        'Hospitals': hospitalsLayer,
        'Road Blocks': roadBlocksLayer
    }).addTo(map);

    // Initialize layers
    initializeMapLayers();
}

function initializeMapLayers() {
    // Disaster zones layer
    disasterZonesLayer = L.layerGroup().addTo(map);
    
    // Safe zones layer
    safeZonesLayer = L.layerGroup().addTo(map);
    
    // Evacuation centers layer
    evacuationCentersLayer = L.layerGroup().addTo(map);
    
    // Hospitals layer
    hospitalsLayer = L.layerGroup().addTo(map);
    
    // Road blocks layer
    roadBlocksLayer = L.layerGroup().addTo(map);
}

// Real-time updates
function setupRealTimeUpdates() {
    // Set up WebSocket connection for real-time updates
    const ws = new WebSocket('wss://your-websocket-server.com');
    
    ws.onmessage = function(event) {
        const data = JSON.parse(event.data);
        handleRealTimeUpdate(data);
    };

    // Fallback to polling if WebSocket fails
    ws.onerror = function() {
        console.log('WebSocket connection failed, falling back to polling');
        startPolling();
    };
}

function startPolling() {
    // Poll for updates every 30 seconds
    setInterval(fetchUpdates, 30000);
}

async function fetchUpdates() {
    try {
        const response = await fetch('https://your-api.com/updates');
        const data = await response.json();
        handleRealTimeUpdate(data);
    } catch (error) {
        console.error('Error fetching updates:', error);
    }
}

function handleRealTimeUpdate(data) {
    switch(data.type) {
        case 'disaster':
            updateDisasterZones(data);
            break;
        case 'safe_zone':
            updateSafeZones(data);
            break;
        case 'evacuation':
            updateEvacuationCenters(data);
            break;
        case 'hospital':
            updateHospitals(data);
            break;
        case 'road_block':
            updateRoadBlocks(data);
            break;
        case 'alert':
            handleNewAlert(data);
            break;
    }
}

// Notifications setup
function setupNotifications() {
    if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                console.log('Notifications enabled');
            }
        });
    }
}

function sendNotification(title, options) {
    if (Notification.permission === 'granted') {
        new Notification(title, options);
    }
}

// Data loading
async function loadInitialData() {
    try {
        // Load disaster alerts (Using USGS Earthquake Alerts API as an example)
        const alertsResponse = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_week.geojson');
        const alerts = await alertsResponse.json();
        updateAlerts(alerts);

        // Load weather data (Using Open-Meteo API as an example)
        const weatherResponse = await fetch('https://api.open-meteo.com/v1/forecast?latitude=40.7128&longitude=-74.0060&hourly=temperature_2m');
        const weather = await weatherResponse.json();
        updateWeather(weather);

        // Load community posts (Using JSONPlaceholder API as a mock community posts data)
        const postsResponse = await fetch('https://jsonplaceholder.typicode.com/posts');
        const posts = await postsResponse.json();
        updateCommunityFeed(posts);

        // Load risk assessment (Using an open disease database as an example for health-related risks)
        const riskResponse = await fetch('https://disease.sh/v3/covid-19/countries/USA');
        const risk = await riskResponse.json();
        updateRiskAssessment(risk);
    } catch (error) {
        console.error('Error loading initial data:', error);
    }
}

// Map layer updates
function updateDisasterZones(data) {
    disasterZonesLayer.clearLayers();
    data.zones.forEach(zone => {
        L.polygon(zone.coordinates, {
            color: 'red',
            fillColor: '#f03',
            fillOpacity: 0.5
        })
        .bindPopup(`
            <h3>${zone.type}</h3>
            <p>Severity: ${zone.severity}</p>
            <p>${zone.description}</p>
        `)
        .addTo(disasterZonesLayer);
    });
}

function updateSafeZones(data) {
    safeZonesLayer.clearLayers();
    data.zones.forEach(zone => {
        L.polygon(zone.coordinates, {
            color: 'green',
            fillColor: '#0f0',
            fillOpacity: 0.5
        })
        .bindPopup(`
            <h3>Safe Zone</h3>
            <p>Capacity: ${zone.capacity}</p>
            <p>Current Occupancy: ${zone.occupancy}</p>
        `)
        .addTo(safeZonesLayer);
    });
}

function updateEvacuationCenters(data) {
    evacuationCentersLayer.clearLayers();
    data.centers.forEach(center => {
        L.marker([center.lat, center.lng])
        .bindPopup(`
            <h3>${center.name}</h3>
            <p>Status: ${center.status}</p>
            <p>Capacity: ${center.capacity}</p>
            <p>Current Occupancy: ${center.occupancy}</p>
        `)
        .addTo(evacuationCentersLayer);
    });
}

function updateHospitals(data) {
    hospitalsLayer.clearLayers();
    data.hospitals.forEach(hospital => {
        L.marker([hospital.lat, hospital.lng])
        .bindPopup(`
            <h3>${hospital.name}</h3>
            <p>Status: ${hospital.status}</p>
            <p>Emergency Beds: ${hospital.emergencyBeds}</p>
            <p>Contact: ${hospital.contact}</p>
        `)
        .addTo(hospitalsLayer);
    });
}

function updateRoadBlocks(data) {
    roadBlocksLayer.clearLayers();
    data.blocks.forEach(block => {
        L.polyline(block.coordinates, {
            color: 'red',
            weight: 3
        })
        .bindPopup(`
            <h3>Road Block</h3>
            <p>Type: ${block.type}</p>
            <p>${block.description}</p>
        `)
        .addTo(roadBlocksLayer);
    });
}

// Alert handling
function handleNewAlert(alert) {
    // Update alerts container
    const alertsContainer = document.getElementById('alerts-container');
    if (alertsContainer) {
        const alertElement = createAlertElement(alert);
        alertsContainer.insertBefore(alertElement, alertsContainer.firstChild);
    }

    // Send notification
    sendNotification('New Disaster Alert', {
        body: alert.description,
        icon: '/path/to/alert-icon.png'
    });
}

function createAlertElement(alert) {
    const div = document.createElement('div');
    div.className = `alert-card severity-${alert.severity.toLowerCase()}`;
    div.dataset.priority = alert.severity.toLowerCase();
    div.innerHTML = `
        <div class="alert-header">
            <h3>${alert.type}</h3>
            <span class="severity-chip severity-${alert.severity.toLowerCase()}">
                ${alert.severity}
            </span>
        </div>
        <p class="location">${alert.location}</p>
        <p class="description">${alert.description}</p>
        <small class="timestamp">${new Date(alert.timestamp).toLocaleString()}</small>
    `;
    return div;
}

// Weather updates
function updateWeather(weather) {
    const container = document.getElementById('weather-container');
    if (container) {
        container.innerHTML = `
            <div class="weather-card">
                <div class="weather-info">
                    <span class="temperature">${weather.temperature}°C</span>
                    <span class="condition">${weather.condition}</span>
                </div>
                <div class="weather-details">
                    <p>Humidity: ${weather.humidity}%</p>
                    <p>Wind: ${weather.windSpeed} km/h</p>
                    <p>Rain Probability: ${weather.rainProbability}%</p>
                </div>
            </div>
        `;
    }
}

// Community feed updates
function updateCommunityFeed(posts) {
    const feed = document.getElementById('community-feed');
    if (feed) {
        feed.innerHTML = posts.map(post => `
            <div class="community-post">
                <div class="post-header">
                    <img src="${post.userAvatar}" alt="${post.userName}" class="user-avatar">
                    <div class="post-info">
                        <span class="user-name">${post.userName}</span>
                        <span class="post-time">${formatTimeAgo(post.timestamp)}</span>
                    </div>
                </div>
                <p class="post-content">${post.content}</p>
                ${post.media ? `<img src="${post.media}" alt="Post media" class="post-media">` : ''}
                <div class="post-actions">
                    <button onclick="respondToPost(${post.id})">Respond</button>
                    <button onclick="sharePost(${post.id})">Share</button>
                </div>
            </div>
        `).join('');
    }
}

// Risk assessment updates
function updateRiskAssessment(risk) {
    const riskCard = document.querySelector('.risk-card');
    if (riskCard) {
        riskCard.querySelector('.risk-level').style.width = `${risk.level}%`;
        riskCard.querySelector('.risk-status').textContent = risk.status;
    }
}

// Utility functions
function formatTimeAgo(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
    return `${Math.floor(diff / 86400000)} days ago`;
}

// Initialize dashboard when the page loads
document.addEventListener('DOMContentLoaded', initializeDashboard); 




try {
    // In a real app, this would fetch from a weather API
    const weatherContainer = document.getElementById('weather-container');
    async function getWeather(event) {
        event.preventDefault();

        const apiKey = "b65707795cc0c0c89539279426e5f01d";
        // const city = document.getElementById("cityName").value;
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${Bareilly}&appid=${apiKey}&units=metric`;

        try {
            const response = await fetch(weatherUrl);
            const data = await response.json();

            if (data.cod === "404") {
                alert("City not found! Please enter a valid city.");
                return;
            }
            if (weatherContainer) {
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
         catch (error) {
            console.error("Error fetching data:", error);
            alert("Unable to fetch weather data. Please try again later.");
        }
    }
}
}