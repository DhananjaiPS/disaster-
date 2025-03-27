// Chatbot state
let chatHistory = [];
let isOpen = false;
let currentLanguage = 'en'; // 'en' for English, 'hi' for Hinglish/Hindi

// Initialize Gemini AI
const GEMINI_API_KEY = 'AIzaSyD_iStyX2cYsIqDzzvPyLm3ZsgwnFiZTOc';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Initial responses in different languages
const greetings = {
    en: "Hello! I'm your Disaster Management Assistant. I can help you with:\n- Emergency procedures\n- Disaster preparedness\n- Relief information\n- Safety guidelines\n- Weather alerts\n\nHow can I assist you today?",
    hi: "Namaste! Main aapka Disaster Management Assistant hoon. Main aapki inn cheezon mein madad kar sakta hoon:\n- Emergency procedures\n- Disaster ki taiyari\n- Rahat jaankari\n- Suraksha guidelines\n- Mausam ki chetavani\n\nMain aapki kaise madad kar sakta hoon?"
};

const errorMessages = {
    en: "I apologize, but I'm having trouble processing your request. Please try again or contact emergency services directly if this is an urgent matter.",
    hi: "Maaf kijiye, lekin aapke request ko process karne mein dikkat aa rahi hai. Kripya dubara koshish karein ya emergency services se seedha sampark karein agar ye urgent mamla hai."
};

// Language detection function
function detectLanguage(text) {
    // Simple language detection based on common Hindi/Hinglish words and patterns
    const hindiPatterns = /[क-ह]|hai|kya|karo|raha|rahi|karein|kaise|kahan|yahan|wahan|matlab|bhai|aap|main|hoon|nahi/i;
    return hindiPatterns.test(text) ? 'hi' : 'en';
}

// Emergency keywords for quick response
const emergencyKeywords = {
    en: ['flood', 'earthquake', 'fire', 'tsunami', 'cyclone', 'emergency', 'help', 'sos'],
    hi: ['baadh', 'baarh', 'bhookamp', 'aag', 'sunami', 'toofan', 'emergency', 'madad', 'bachao']
};

// Quick response templates
const quickResponses = {
    flood: {
        en: "FLOOD EMERGENCY RESPONSE:\n1. Move to higher ground immediately\n2. Avoid walking/driving through flood water\n3. Keep emergency numbers ready\n4. Listen to local authorities\n5. Prepare an emergency kit\n\nDo you need specific information about:\n- Evacuation routes?\n- Emergency contacts?\n- Safe locations nearby?",
        hi: "BAADH EMERGENCY RESPONSE:\n1. Turant oonchi jagah par jaayein\n2. Paani mein na chalein/gaadi na chalaayein\n3. Emergency numbers taiyar rakhein\n4. Local authorities ki sunein\n5. Emergency kit taiyar karein\n\nAapko kisi specific jaankari ki zarurat hai?\n- Evacuation routes?\n- Emergency contacts?\n- Aas-paas ki surakshit jagahein?"
    }
};

// Chatbot UI HTML
function createChatbotHTML() {
    return `
        <div id="disaster-chatbot" class="chatbot-container">
            <div class="chatbot-header">
                <h3>Disaster Management Assistant</h3>
                <div class="header-controls">
                    <button class="language-btn" onclick="toggleLanguage()">
                        <i class="fas fa-language"></i>
                    </button>
                    <button class="close-btn" onclick="toggleChatbot()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div class="chatbot-messages" id="chatbot-messages">
                <!-- Messages will be dynamically added here -->
            </div>
            <div class="chatbot-input-container">
                <div class="input-options">
                    <button class="input-option-btn" onclick="setInputType('text')">
                        <i class="fas fa-keyboard"></i>
                    </button>
                    <button class="input-option-btn" onclick="setInputType('voice')">
                        <i class="fas fa-microphone"></i>
                    </button>
                    <button class="input-option-btn" onclick="setInputType('image')">
                        <i class="fas fa-camera"></i>
                    </button>
                </div>
                <div class="input-area">
                    <textarea id="chatbot-input" placeholder="Type your message..."></textarea>
                    <button class="send-btn" onclick="sendMessage()">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Initialize chatbot
function initializeChatbot() {
    const chatbotContainer = document.createElement('div');
    chatbotContainer.innerHTML = createChatbotHTML();
    document.body.appendChild(chatbotContainer);
    
    // Add initial greeting
    addMessage('bot', greetings[currentLanguage]);
    
    // Initialize speech recognition
    initializeSpeechRecognition();
    
    // Update placeholder text based on language
    updatePlaceholder();
}

// Toggle language
function toggleLanguage() {
    currentLanguage = currentLanguage === 'en' ? 'hi' : 'en';
    updatePlaceholder();
    addMessage('bot', `Language changed to ${currentLanguage === 'en' ? 'English' : 'Hinglish/Hindi'}`);
}

// Update input placeholder based on language
function updatePlaceholder() {
    const input = document.getElementById('chatbot-input');
    input.placeholder = currentLanguage === 'en' ? 
        "Type your message..." : 
        "Apna message type karein...";
}

// Check for emergency keywords
function checkEmergency(message) {
    const lowercaseMsg = message.toLowerCase();
    return emergencyKeywords.en.some(keyword => lowercaseMsg.includes(keyword)) ||
           emergencyKeywords.hi.some(keyword => lowercaseMsg.includes(keyword));
}

// Get quick response based on message content
function getQuickResponse(message) {
    const lowercaseMsg = message.toLowerCase();
    
    // Check for flood-related keywords
    if (lowercaseMsg.includes('flood') || lowercaseMsg.includes('baadh') || lowercaseMsg.includes('baarh')) {
        return quickResponses.flood[currentLanguage];
    }
    
    return null;
}

// Send message to Gemini AI
async function sendMessage() {
    const input = document.getElementById('chatbot-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message to chat
    addMessage('user', message);
    input.value = '';
    
    // Detect language if not set
    const detectedLang = detectLanguage(message);
    if (currentLanguage !== detectedLang) {
        currentLanguage = detectedLang;
        updatePlaceholder();
    }
    
    // Check for emergency keywords and provide quick response
    const quickResponse = getQuickResponse(message);
    if (quickResponse) {
        addMessage('bot', quickResponse);
        return;
    }
    
    try {
        // Prepare context with language preference
        const context = `You are a Disaster Management Expert and NDRF official. ${
            currentLanguage === 'hi' ? 
            'Please respond in simple Hinglish (Hindi written in English) that is easy to understand.' :
            'Please respond in simple English.'
        }`;
        
        // Call Gemini API
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `${context}\n\nUser query: ${message}`
                    }]
                }]
            })
        });
        
        if (!response.ok) {
            throw new Error('API request failed');
        }
        
        const data = await response.json();
        if (!data.candidates || !data.candidates[0]) {
            throw new Error('Invalid API response');
        }
        
        const botResponse = data.candidates[0].text || data.candidates[0].content.parts[0].text;
        addMessage('bot', botResponse);
        
        // Update chat history
        chatHistory.push(
            { role: 'user', content: message },
            { role: 'assistant', content: botResponse }
        );
        
    } catch (error) {
        console.error('Error sending message:', error);
        addMessage('bot', errorMessages[currentLanguage]);
    }
}

// Toggle chatbot visibility
function toggleChatbot() {
    const chatbot = document.getElementById('disaster-chatbot');
    isOpen = !isOpen;
    chatbot.style.display = isOpen ? 'flex' : 'none';
}

// Add message to chat
function addMessage(sender, content, type = 'text') {
    const messagesContainer = document.getElementById('chatbot-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    let messageContent = '';
    switch(type) {
        case 'text':
            messageContent = `<div class="message-text">${content}</div>`;
            break;
        case 'image':
            messageContent = `<img src="${content}" class="message-image" alt="Shared image">`;
            break;
        case 'video':
            messageContent = `<video controls class="message-video"><source src="${content}" type="video/mp4"></video>`;
            break;
    }
    
    messageDiv.innerHTML = messageContent;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Speech recognition setup
let recognition = null;
function initializeSpeechRecognition() {
    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        recognition.onresult = function(event) {
            const text = event.results[0][0].transcript;
            document.getElementById('chatbot-input').value = text;
        };
    }
}

// Handle voice input
function startVoiceInput() {
    if (recognition) {
        recognition.start();
    } else {
        alert('Speech recognition is not supported in your browser.');
    }
}

// Handle image input
function handleImageInput(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            addMessage('user', e.target.result, 'image');
            // Process image with Gemini Vision API if needed
        };
        reader.readAsDataURL(file);
    }
}

// Set input type
function setInputType(type) {
    const inputContainer = document.querySelector('.input-area');
    switch(type) {
        case 'text':
            inputContainer.innerHTML = `
                <textarea id="chatbot-input" placeholder="Type your message..."></textarea>
                <button class="send-btn" onclick="sendMessage()">
                    <i class="fas fa-paper-plane"></i>
                </button>
            `;
            break;
        case 'voice':
            inputContainer.innerHTML = `
                <button class="voice-btn" onclick="startVoiceInput()">
                    <i class="fas fa-microphone"></i> Start Speaking
                </button>
            `;
            break;
        case 'image':
            inputContainer.innerHTML = `
                <input type="file" accept="image/*" onchange="handleImageInput(event)">
                <button class="send-btn" onclick="sendMessage()">
                    <i class="fas fa-paper-plane"></i>
                </button>
            `;
            break;
    }
}

// Initialize chatbot when page loads
document.addEventListener('DOMContentLoaded', initializeChatbot); 