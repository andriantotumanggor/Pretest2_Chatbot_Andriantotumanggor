// Chatbot AI Multimodel - JavaScript
// Konfigurasi Aplikasi
const CONFIG = {
    aiModels: {
        chatgpt: {
            name: "ChatGPT (OpenAI)",
            icon: "fab fa-openai",
            color: "#10a37f",
            description: "Model bahasa dari OpenAI"
        },
        deepseek: {
            name: "DeepSeek",
            icon: "fas fa-search",
            color: "#3b82f6",
            description: "Model AI open source yang kuat"
        },
        gemini: {
            name: "Gemini (Google)",
            icon: "fas fa-gem",
            color: "#ea4335",
            description: "Model multimodal dari Google"
        },
        ollama: {
            name: "Ollama",
            icon: "fas fa-server",
            color: "#8b5cf6",
            description: "Model yang berjalan lokal via Ollama"
        }
    },
    defaultSettings: {
        temperature: 0.7,
        maxTokens: 500,
        model: "chatgpt"
    }
};

// State Aplikasi
let appState = {
    selectedAI: CONFIG.defaultSettings.model,
    conversationHistory: [],
    isProcessing: false,
    settings: {
        temperature: CONFIG.defaultSettings.temperature,
        maxTokens: CONFIG.defaultSettings.maxTokens,
        apiKey: ""
    },
    currentSessionId: generateSessionId()
};

// Elemen DOM
const domElements = {
    chatMessages: document.getElementById('chatMessages'),
    userInput: document.getElementById('userInput'),
    sendButton: document.getElementById('sendButton'),
    clearChatButton: document.getElementById('clearChat'),
    typingIndicator: document.getElementById('typingIndicator'),
    emptyState: document.getElementById('emptyState'),
    aiOptions: document.querySelectorAll('.ai-option'),
    apiKeyInput: document.getElementById('apiKey'),
    showApiKeyCheckbox: document.getElementById('showApiKey'),
    temperatureSlider: document.getElementById('temperature'),
    maxTokensSlider: document.getElementById('maxTokens'),
    tempValueDisplay: document.getElementById('tempValue'),
    tokensValueDisplay: document.getElementById('tokensValue')
};

// Inisialisasi Aplikasi
function initApp() {
    // Load state dari localStorage jika ada
    loadStateFromStorage();
    
    // Setup event listeners
    setupEventListeners();
    
    // Update UI dengan state terkini
    updateUIFromState();
    
    // Tampilkan pesan selamat datang
    showWelcomeMessage();
    
    console.log("Chatbot AI Multimodel diinisialisasi dengan session ID:", appState.currentSessionId);
}

// Setup Event Listeners
function setupEventListeners() {
    // Pengiriman pesan
    domElements.sendButton.addEventListener('click', handleSendMessage);
    domElements.userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });
    
    // Tombol hapus chat
    domElements.clearChatButton.addEventListener('click', clearConversation);
    
    // Pilihan AI model
    domElements.aiOptions.forEach(option => {
        option.addEventListener('click', () => handleAISelection(option));
    });
    
    // Pengaturan API key
    domElements.apiKeyInput.addEventListener('input', handleApiKeyChange);
    domElements.showApiKeyCheckbox.addEventListener('change', toggleApiKeyVisibility);
    
    // Pengaturan model (sliders)
    domElements.temperatureSlider.addEventListener('input', handleTemperatureChange);
    domElements.maxTokensSlider.addEventListener('input', handleMaxTokensChange);
    
    // Input focus untuk pengalaman pengguna yang lebih baik
    domElements.userInput.addEventListener('focus', () => {
        domElements.userInput.parentElement.style.boxShadow = '0 0 0 3px rgba(106, 17, 203, 0.1)';
    });
    
    domElements.userInput.addEventListener('blur', () => {
        domElements.userInput.parentElement.style.boxShadow = 'none';
    });
    
    // Auto-scroll ketika chat diupdate
    const observer = new MutationObserver(() => {
        scrollToBottom();
    });
    
    observer.observe(domElements.chatMessages, { childList: true });
}

// Handle Pengiriman Pesan
async function handleSendMessage() {
    const message = domElements.userInput.value.trim();
    
    if (!message || appState.isProcessing) return;
    
    // Tambahkan pesan pengguna
    addUserMessage(message);
    domElements.userInput.value = '';
    domElements.sendButton.disabled = true;
    appState.isProcessing = true;
    
    // Tampilkan indikator mengetik
    showTypingIndicator();
    
    try {
        // Simulasi penundaan network
        await simulateNetworkDelay();
        
        // Dapatkan respons AI
        const aiResponse = await generateAIResponse(message);
        
        // Tambahkan respons AI
        addBotMessage(aiResponse);
        
        // Simpan state ke localStorage
        saveStateToStorage();
        
    } catch (error) {
        console.error("Error generating response:", error);
        addErrorMessage("Maaf, terjadi kesalahan saat memproses permintaan Anda.");
    } finally {
        // Reset state
        hideTypingIndicator();
        domElements.sendButton.disabled = false;
        appState.isProcessing = false;
        domElements.userInput.focus();
    }
}

// Generate Respons AI (Simulasi)
async function generateAIResponse(userMessage) {
    const aiModel = CONFIG.aiModels[appState.selectedAI];
    const lowerMessage = userMessage.toLowerCase();
    
    // Respons berdasarkan AI model yang dipilih
    const responses = {
        chatgpt: [
            `Halo! Saya ChatGPT dari OpenAI. Dengan temperature ${appState.settings.temperature}, saya akan memberikan respons yang ${appState.settings.temperature > 0.7 ? 'kreatif' : 'fokus'}. Bagaimana saya bisa membantu Anda?`,
            "Sebagai model bahasa OpenAI, saya dilatih dengan data hingga 2025. Saya dapat membantu dengan berbagai topik termasuk pemrograman, penulisan, analisis, dan banyak lagi.",
            "Untuk pertanyaan teknis, saya dapat memberikan penjelasan langkah demi langkah. Apakah ada topik spesifik yang ingin Anda pelajari?",
            "Saya memahami pertanyaan Anda. Dengan pengaturan saat ini, saya akan memberikan respons yang sesuai dengan konteks yang Anda berikan."
        ],
        deepseek: [
            `Halo! Saya DeepSeek AI. Dengan ${appState.settings.maxTokens} tokens maksimum, saya akan memberikan respons yang ${appState.settings.maxTokens > 1000 ? 'sangat detail' : 'ringkas'}.`,
            "Sebagai model open source, saya dirancang untuk memberikan respons yang mendalam dan analitis. Saya dapat membantu dengan tugas-tugas kompleks dan penalaran.",
            "DeepSeek dikenal karena kemampuannya dalam pemahaman konteks yang mendalam. Ada yang spesifik yang ingin Anda eksplorasi?",
            "Saya dapat membantu dengan analisis kode, penjelasan konsep, atau diskusi mendalam tentang berbagai topik."
        ],
        gemini: [
            `Hai! Saya Gemini dari Google. Dengan pengaturan temperature ${appState.settings.temperature}, respons saya akan ${appState.settings.temperature < 0.3 ? 'sangat presisi' : 'lebih eksploratif'}.`,
            "Sebagai model multimodal, saya dapat memahami konteks yang kaya. Saya dapat membantu dengan tugas kreatif, analitis, atau teknis.",
            "Gemini dirancang untuk memahami nuansa dalam percakapan. Apakah ada yang khusus yang ingin Anda diskusikan?",
            "Saya memiliki akses ke informasi terkini dan dapat membantu dengan penelitian, analisis, atau brainstorming ide."
        ],
        ollama: [
            `Halo! Saya model AI yang berjalan lokal via Ollama. Dengan pengaturan saat ini, saya memberikan respons yang dihasilkan secara lokal.`,
            "Kelebihan utama saya adalah privasi - semua data tetap di perangkat Anda. Saya dapat membantu dengan berbagai tugas tanpa mengirim data ke cloud.",
            "Sebagai model yang berjalan lokal, saya dapat disesuaikan dengan kebutuhan spesifik Anda. Apa yang ingin Anda coba?",
            "Saya ideal untuk tugas-tugas yang memerlukan keamanan data tinggi atau konektivitas internet terbatas."
        ]
    };
    
    // Cek pertanyaan spesifik
    if (lowerMessage.includes('nama') || lowerMessage.includes('siapa')) {
        return `Saya adalah ${aiModel.name}, ${aiModel.description}.`;
    } else if (lowerMessage.includes('temperature') || lowerMessage.includes('pengaturan')) {
        return `Pengaturan saat ini: Temperature = ${appState.settings.temperature}, Max Tokens = ${appState.settings.maxTokens}. Temperature mengontrol keacakan respons, sementara Max Tokens membatasi panjang respons.`;
    } else if (lowerMessage.includes('terima kasih') || lowerMessage.includes('thanks')) {
        return `Sama-sama! Senang bisa membantu. Jika ada pertanyaan lain tentang ${aiModel.name} atau topik lainnya, jangan ragu untuk bertanya.`;
    } else if (lowerMessage.includes('halo') || lowerMessage.includes('hai') || lowerMessage.includes('hi')) {
        return `Halo! Saya ${aiModel.name}. ${aiModel.description}. Bagaimana saya bisa membantu Anda hari ini?`;
    } else if (lowerMessage.includes('buat') && (lowerMessage.includes('kode') || lowerMessage.includes('program'))) {
        return `Tentu! Saya dapat membantu membuat kode. Berikut contoh fungsi JavaScript sederhana:\n\n\`\`\`javascript\nfunction sapa(nama) {\n  return \`Halo, \${nama}! Selamat datang di chatbot AI.\`;\n}\n\nconsole.log(sapa("Pengguna"));\n\`\`\``;
    } else if (lowerMessage.includes('jelaskan') && lowerMessage.includes('ai')) {
        return `AI (Kecerdasan Buatan) adalah simulasi kecerdasan manusia dalam mesin. ${aiModel.name} adalah contoh AI yang menggunakan pembelajaran mesin untuk memahami dan menghasilkan bahasa manusia.`;
    }
    
    // Jika tidak ada pertanyaan spesifik, kembalikan respons acak dari model yang dipilih
    const aiResponses = responses[appState.selectedAI] || responses.chatgpt;
    const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
    
    // Tambahkan informasi pengaturan ke respons
    return randomResponse;
}

// Fungsi Helper untuk Pesan
function addUserMessage(text) {
    const messageData = {
        id: generateMessageId(),
        sender: "Anda",
        text: text,
        isUser: true,
        timestamp: new Date(),
        aiModel: null
    };
    
    appState.conversationHistory.push(messageData);
    renderMessage(messageData);
}

function addBotMessage(text) {
    const aiModel = CONFIG.aiModels[appState.selectedAI];
    
    const messageData = {
        id: generateMessageId(),
        sender: aiModel.name,
        text: text,
        isUser: false,
        timestamp: new Date(),
        aiModel: appState.selectedAI
    };
    
    appState.conversationHistory.push(messageData);
    renderMessage(messageData);
}

function addErrorMessage(text) {
    const messageData = {
        id: generateMessageId(),
        sender: "Sistem",
        text: text,
        isUser: false,
        timestamp: new Date(),
        aiModel: "system",
        isError: true
    };
    
    appState.conversationHistory.push(messageData);
    renderMessage(messageData);
}

function renderMessage(messageData) {
    // Sembunyikan empty state jika ada pesan
    if (domElements.emptyState.style.display !== 'none') {
        domElements.emptyState.style.display = 'none';
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${messageData.isUser ? 'user-message' : 'bot-message'}`;
    messageDiv.dataset.messageId = messageData.id;
    
    // Tentukan ikon dan kelas berdasarkan pengirim
    let senderIcon = "fas fa-user";
    let senderName = messageData.sender;
    
    if (!messageData.isUser) {
        if (messageData.aiModel === "system") {
            senderIcon = "fas fa-exclamation-triangle";
        } else if (messageData.isError) {
            senderIcon = "fas fa-exclamation-circle";
        } else {
            const aiModel = CONFIG.aiModels[messageData.aiModel];
            senderIcon = aiModel ? aiModel.icon : "fas fa-robot";
        }
    }
    
    // Format waktu
    const timeString = messageData.timestamp.toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    // Format teks untuk kode
    let formattedText = messageData.text;
    if (formattedText.includes('```')) {
        formattedText = formattedText.replace(/```(\w+)?\n([\s\S]*?)```/g, '<div class="code-block"><pre><code>$2</code></pre></div>');
    }
    
    messageDiv.innerHTML = `
        <div class="message-sender">
            <i class="${senderIcon}"></i>
            ${senderName}
        </div>
        <div class="message-content ${messageData.isError ? 'error-message' : ''}">
            ${formattedText}
        </div>
        <div class="message-time">${timeString}</div>
    `;
    
    domElements.chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

// Handle Selection AI Model
function handleAISelection(optionElement) {
    // Hapus kelas active dari semua opsi
    domElements.aiOptions.forEach(opt => opt.classList.remove('active'));
    
    // Tambahkan kelas active ke opsi yang dipilih
    optionElement.classList.add('active');
    
    // Update state
    const selectedAI = optionElement.getAttribute('data-ai');
    appState.selectedAI = selectedAI;
    
    // Tampilkan notifikasi
    const aiModel = CONFIG.aiModels[selectedAI];
    addSystemMessage(`Model AI diubah ke <strong>${aiModel.name}</strong>. ${aiModel.description}`);
    
    // Simpan state
    saveStateToStorage();
}

// Handle API Key Change
function handleApiKeyChange() {
    appState.settings.apiKey = domElements.apiKeyInput.value;
    saveStateToStorage();
    
    // Jika API key diisi, tampilkan pesan
    if (appState.settings.apiKey.length > 0) {
        console.log("API key telah diperbarui (simulasi)");
    }
}

// Toggle API Key Visibility
function toggleApiKeyVisibility() {
    const isChecked = domElements.showApiKeyCheckbox.checked;
    domElements.apiKeyInput.type = isChecked ? 'text' : 'password';
}

// Handle Temperature Change
function handleTemperatureChange() {
    const value = parseFloat(domElements.temperatureSlider.value);
    appState.settings.temperature = value;
    domElements.tempValueDisplay.textContent = value;
    saveStateToStorage();
}

// Handle Max Tokens Change
function handleMaxTokensChange() {
    const value = parseInt(domElements.maxTokensSlider.value);
    appState.settings.maxTokens = value;
    domElements.tokensValueDisplay.textContent = value;
    saveStateToStorage();
}

// Clear Conversation
function clearConversation() {
    // Konfirmasi
    if (!confirm("Apakah Anda yakin ingin menghapus seluruh percakapan?")) return;
    
    // Hapus pesan dari tampilan
    const messages = document.querySelectorAll('.message');
    messages.forEach(message => message.remove());
    
    // Tampilkan empty state
    domElements.emptyState.style.display = 'block';
    
    // Reset conversation history
    appState.conversationHistory = [];
    appState.currentSessionId = generateSessionId();
    
    // Tampilkan pesan sistem
    addSystemMessage("Percakapan telah dihapus. Mulai percakapan baru dengan AI pilihan Anda.");
    
    // Simpan state
    saveStateToStorage();
    
    console.log("Percakapan dihapus. Session ID baru:", appState.currentSessionId);
}

// Show Welcome Message
function showWelcomeMessage() {
    if (appState.conversationHistory.length === 0) {
        const welcomeMessage = `
            <p>Selamat datang di <strong>Chatbot AI Multimodel</strong>! 🎉</p>
            <p>Anda dapat:</p>
            <ul>
                <li>Memilih model AI dari panel pengaturan</li>
                <li>Mengatur temperature dan panjang respons</li>
                <li>Berkonsultasi dengan berbagai AI untuk kebutuhan berbeda</li>
                <li>Menggunakan format kode dalam pesan</li>
            </ul>
            <p>Mulai percakapan dengan mengetik pesan di bawah!</p>
        `;
        
        addSystemMessage(welcomeMessage);
    }
}

// Helper Functions
function showTypingIndicator() {
    domElements.typingIndicator.classList.add('active');
}

function hideTypingIndicator() {
    domElements.typingIndicator.classList.remove('active');
}

function scrollToBottom() {
    domElements.chatMessages.scrollTop = domElements.chatMessages.scrollHeight;
}

function addSystemMessage(text) {
    const messageData = {
        id: generateMessageId(),
        sender: "Sistem",
        text: text,
        isUser: false,
        timestamp: new Date(),
        aiModel: "system"
    };
    
    appState.conversationHistory.push(messageData);
    renderMessage(messageData);
}

function simulateNetworkDelay() {
    const delay = 800 + Math.random() * 1200; // 800-2000ms
    return new Promise(resolve => setTimeout(resolve, delay));
}

function generateMessageId() {
    return 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Storage Functions
function saveStateToStorage() {
    try {
        const stateToSave = {
            conversationHistory: appState.conversationHistory,
            selectedAI: appState.selectedAI,
            settings: appState.settings,
            currentSessionId: appState.currentSessionId
        };
        
        localStorage.setItem('aiChatbotState', JSON.stringify(stateToSave));
    } catch (error) {
        console.error("Error saving state to localStorage:", error);
    }
}

function loadStateFromStorage() {
    try {
        const savedState = localStorage.getItem('aiChatbotState');
        
        if (savedState) {
            const parsedState = JSON.parse(savedState);
            
            // Update app state dengan data yang disimpan
            appState.conversationHistory = parsedState.conversationHistory || [];
            appState.selectedAI = parsedState.selectedAI || CONFIG.defaultSettings.model;
            appState.settings = parsedState.settings || CONFIG.defaultSettings;
            appState.currentSessionId = parsedState.currentSessionId || generateSessionId();
            
            // Parse string dates back to Date objects
            appState.conversationHistory.forEach(msg => {
                if (typeof msg.timestamp === 'string') {
                    msg.timestamp = new Date(msg.timestamp);
                }
            });
            
            console.log("State loaded from localStorage");
        }
    } catch (error) {
        console.error("Error loading state from localStorage:", error);
    }
}

function updateUIFromState() {
    // Update AI selection
    domElements.aiOptions.forEach(option => {
        if (option.getAttribute('data-ai') === appState.selectedAI) {
            option.classList.add('active');
        } else {
            option.classList.remove('active');
        }
    });
    
    // Update sliders
    domElements.temperatureSlider.value = appState.settings.temperature;
    domElements.maxTokensSlider.value = appState.settings.maxTokens;
    domElements.tempValueDisplay.textContent = appState.settings.temperature;
    domElements.tokensValueDisplay.textContent = appState.settings.maxTokens;
    
    // Update API key field
    domElements.apiKeyInput.value = appState.settings.apiKey;
    
    // Render conversation history
    if (appState.conversationHistory.length > 0) {
        domElements.emptyState.style.display = 'none';
        appState.conversationHistory.forEach(message => renderMessage(message));
    }
}

// Inisialisasi aplikasi ketika halaman dimuat
document.addEventListener('DOMContentLoaded', initApp);

// Ekspos fungsi tertentu ke global scope untuk debugging (opsional)
window.chatbotApp = {
    getState: () => ({ ...appState }),
    clearStorage: () => {
        localStorage.removeItem('aiChatbotState');
        console.log("Storage cleared");
    },
    resetApp: () => {
        appState = {
            selectedAI: CONFIG.defaultSettings.model,
            conversationHistory: [],
            isProcessing: false,
            settings: {
                temperature: CONFIG.defaultSettings.temperature,
                maxTokens: CONFIG.defaultSettings.maxTokens,
                apiKey: ""
            },
            currentSessionId: generateSessionId()
        };
        
        updateUIFromState();
        showWelcomeMessage();
        saveStateToStorage();
    }
};