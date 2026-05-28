// Vision Assist AI - Accessibility Tool for Visually Impaired Users
class VisionAssistAI {
    constructor() {
        this.isActive = false;
        this.speechSynthesis = window.speechSynthesis;
        this.currentUtterance = null;
        this.isReading = false;
        this.highContrastMode = false;
        this.fontSizeMultiplier = 1;
        this.voiceCommands = [];
        this.voices = [];

        // Cache voices immediately and on change (Chrome fires voiceschanged async)
        this.voices = this.speechSynthesis.getVoices();
        this.speechSynthesis.addEventListener('voiceschanged', () => {
            this.voices = this.speechSynthesis.getVoices();
        });

        this.setupVoiceCommands();
        this.init();
    }

    init() {
        this.createUI();
        this.setupEventListeners();
        this.loadSettings();
    }

    createUI() {
        // Create floating button
        const button = document.createElement('button');
        button.id = 'vision-assist-btn';
        button.innerHTML = 'Vision Assist';
        button.className = 'vision-assist-button';
        button.setAttribute('aria-label', 'Toggle Vision Assist AI');
        document.body.appendChild(button);

        // Create control panel
        const panel = document.createElement('div');
        panel.id = 'vision-assist-panel';
        panel.className = 'vision-assist-panel';
        panel.innerHTML = `
            <div class="vision-assist-header">
                <h2>Vision Assist</h2>
                <button class="close-btn" aria-label="Close panel">×</button>
            </div>
            <div class="vision-assist-content">
                <div class="control-group">
                    <h3>Text Reading</h3>
                    <button id="read-page-btn" class="control-btn">Read Page</button>
                    <button id="read-selected-btn" class="control-btn">Read Selected</button>
                    <button id="stop-reading-btn" class="control-btn">Stop Reading</button>
                </div>

                <div class="control-group">
                    <h3>Visual Adjustments</h3>
                    <button id="high-contrast-btn" class="control-btn">High Contrast</button>
                    <div class="slider-group">
                        <label for="font-size-slider">Font Size: <span id="font-size-value">100%</span></label>
                        <input type="range" id="font-size-slider" min="100" max="200" value="100">
                    </div>
                </div>

                <div class="control-group">
                    <h3>Navigation</h3>
                    <button id="describe-images-btn" class="control-btn">Describe Images</button>
                    <button id="highlight-links-btn" class="control-btn">Highlight Links</button>
                    <button id="keyboard-nav-btn" class="control-btn">Keyboard Navigation</button>
                </div>

                <div class="control-group">
                    <h3>Voice Commands</h3>
                    <button id="voice-commands-btn" class="control-btn">Voice Commands</button>
                    <div id="voice-status" class="voice-status">Off</div>
                </div>
                
                <div class="control-group">
                    <h3>Settings</h3>
                    <label class="checkbox-label">
                        <input type="checkbox" id="auto-read-checkbox">
                        Auto-read on page load
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox" id="announce-changes-checkbox" checked>
                        Announce page changes
                    </label>
                </div>
            </div>
        `;
        document.body.appendChild(panel);

        // Add styles
        this.injectStyles();
    }

    injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .vision-assist-button {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: linear-gradient(135deg, #1e3c72 0%, #0f2744 100%);
                color: white;
                border: none;
                padding: 15px 25px;
                border-radius: 50px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                z-index: 10000;
                transition: all 0.3s;
            }
            
            .vision-assist-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(0,0,0,0.4);
            }
            
            .vision-assist-panel {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                border-radius: 15px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.3);
                width: 90%;
                max-width: 500px;
                max-height: 80vh;
                overflow-y: auto;
                z-index: 10001;
                display: none;
            }
            
            .vision-assist-panel.active {
                display: block;
            }
            
            .vision-assist-header {
                background: linear-gradient(135deg, #1e3c72 0%, #0f2744 100%);
                color: white;
                padding: 20px;
                border-radius: 15px 15px 0 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .vision-assist-header h2 {
                margin: 0;
                font-size: 1.5rem;
            }
            
            .close-btn {
                background: rgba(255,255,255,0.2);
                border: none;
                color: white;
                font-size: 24px;
                width: 35px;
                height: 35px;
                border-radius: 50%;
                cursor: pointer;
                transition: all 0.3s;
            }
            
            .close-btn:hover {
                background: rgba(255,255,255,0.3);
            }
            
            .vision-assist-content {
                padding: 20px;
            }
            
            .control-group {
                margin-bottom: 25px;
                padding-bottom: 20px;
                border-bottom: 1px solid #e2e8f0;
            }
            
            .control-group:last-child {
                border-bottom: none;
            }
            
            .control-group h3 {
                color: #1e3c72;
                margin-bottom: 15px;
                font-size: 1.1rem;
            }
            
            .control-btn {
                width: 100%;
                padding: 12px;
                margin-bottom: 10px;
                background: #e2e8f0;
                border: 2px solid #1e3c72;
                border-radius: 8px;
                color: #1e3c72;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s;
            }
            
            .control-btn:hover {
                background: #1e3c72;
                color: white;
            }
            
            .control-btn.active {
                background: #1e3c72;
                color: white;
            }
            
            .slider-group {
                margin-top: 10px;
            }
            
            .slider-group label {
                display: block;
                margin-bottom: 8px;
                color: #1e293b;
                font-weight: 600;
            }
            
            .slider-group input[type="range"] {
                width: 100%;
                height: 8px;
                border-radius: 5px;
                background: #94a3b8;
                outline: none;
            }
            
            .slider-group input[type="range"]::-webkit-slider-thumb {
                appearance: none;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: #1e3c72;
                cursor: pointer;
            }
            
            .checkbox-label {
                display: flex;
                align-items: center;
                margin-bottom: 10px;
                cursor: pointer;
            }
            
            .checkbox-label input[type="checkbox"] {
                margin-right: 10px;
                width: 18px;
                height: 18px;
                cursor: pointer;
            }
            
            .voice-status {
                text-align: center;
                padding: 10px;
                margin-top: 10px;
                border-radius: 5px;
                font-weight: 600;
            }
            
            .voice-status.listening {
                background: #1e3c72;
                color: white;
                animation: pulse 1.5s infinite;
            }
            
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.7; }
            }
            
            .high-contrast {
                filter: contrast(150%) brightness(110%);
            }
            
            .high-contrast * {
                border-color: #0f2744 !important;
            }
            
            .link-highlighted {
                outline: 3px solid #0f2744 !important;
                outline-offset: 2px;
            }
            
            .overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                z-index: 10000;
                display: none;
            }
            
            .overlay.active {
                display: block;
            }
        `;
        document.head.appendChild(style);
    }

    setupEventListeners() {
        // Toggle panel
        document.getElementById('vision-assist-btn').addEventListener('click', () => {
            this.togglePanel();
        });

        // Close button
        document.querySelector('.close-btn').addEventListener('click', () => {
            this.closePanel();
        });

        // Control buttons
        document.getElementById('read-page-btn').addEventListener('click', () => {
            this.readPage();
        });

        document.getElementById('read-selected-btn').addEventListener('click', () => {
            this.readSelected();
        });

        document.getElementById('stop-reading-btn').addEventListener('click', () => {
            this.stopReading();
        });

        document.getElementById('high-contrast-btn').addEventListener('click', () => {
            this.toggleHighContrast();
        });

        document.getElementById('font-size-slider').addEventListener('input', (e) => {
            this.adjustFontSize(e.target.value);
        });

        document.getElementById('describe-images-btn').addEventListener('click', () => {
            this.describeImages();
        });

        document.getElementById('highlight-links-btn').addEventListener('click', () => {
            this.highlightLinks();
        });

        document.getElementById('keyboard-nav-btn').addEventListener('click', () => {
            this.enableKeyboardNavigation();
        });

        document.getElementById('voice-commands-btn').addEventListener('click', () => {
            this.toggleVoiceCommands();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.altKey && e.key === 'v') {
                e.preventDefault();
                this.togglePanel();
            }
            if (e.altKey && e.key === 'r') {
                e.preventDefault();
                this.readPage();
            }
        });

        // Auto-read on page load
        if (localStorage.getItem('visionAssistAutoRead') === 'true') {
            setTimeout(() => this.readPage(), 1000);
        }
    }

    togglePanel() {
        const panel = document.getElementById('vision-assist-panel');
        const overlay = this.getOrCreateOverlay();
        panel.classList.toggle('active');
        overlay.classList.toggle('active');
        this.isActive = panel.classList.contains('active');
        
        if (this.isActive) {
            this.speak('Vision Assist panel opened. Use the controls to navigate and read content.');
        }
    }

    getOrCreateOverlay() {
        let overlay = document.getElementById('vision-assist-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'vision-assist-overlay';
            overlay.className = 'overlay';
            overlay.addEventListener('click', () => this.closePanel());
            document.body.appendChild(overlay);
        }
        return overlay;
    }

    closePanel() {
        const panel = document.getElementById('vision-assist-panel');
        const overlay = document.getElementById('vision-assist-overlay');
        panel.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        this.isActive = false;
    }

    speak(text, priority = false) {
        if (this.currentUtterance && !priority) {
            this.speechSynthesis.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.volume = 1;
        
        // Use cached voices (populated via voiceschanged event in constructor)
        const voices = this.voices.length ? this.voices : this.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.lang.startsWith('en') && /female|samantha|karen|moira|victoria|zira/i.test(v.name)) ||
                               voices.find(v => v.lang.startsWith('en'));
        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        utterance.onend = () => {
            this.isReading = false;
        };

        this.currentUtterance = utterance;
        this.isReading = true;
        this.speechSynthesis.speak(utterance);
    }

    readPage() {
        this.stopReading();
        
        // Get main content
        const main = document.querySelector('main');
        const header = document.querySelector('header');
        const footer = document.querySelector('footer');
        
        let text = '';
        
        if (header) {
            text += this.extractText(header) + '. ';
        }
        
        if (main) {
            text += this.extractText(main);
        }
        
        if (footer) {
            text += ' ' + this.extractText(footer);
        }
        
        if (text.trim()) {
            this.speak(text);
        } else {
            this.speak('No content found on this page.');
        }
    }

    readSelected() {
        const selection = window.getSelection().toString();
        if (selection) {
            this.speak(selection);
        } else {
            this.speak('Please select some text to read.');
        }
    }

    stopReading() {
        this.speechSynthesis.cancel();
        this.isReading = false;
    }

    extractText(element) {
        // Remove script and style elements
        const clone = element.cloneNode(true);
        const scripts = clone.querySelectorAll('script, style, nav');
        scripts.forEach(el => el.remove());
        
        // Get text content
        let text = clone.textContent || clone.innerText || '';
        
        // Clean up text
        text = text.replace(/\s+/g, ' ').trim();
        
        return text;
    }

    toggleHighContrast() {
        this.highContrastMode = !this.highContrastMode;
        const btn = document.getElementById('high-contrast-btn');
        
        if (this.highContrastMode) {
            document.body.classList.add('high-contrast');
            btn.classList.add('active');
            this.speak('High contrast mode enabled.');
        } else {
            document.body.classList.remove('high-contrast');
            btn.classList.remove('active');
            this.speak('High contrast mode disabled.');
        }
        
        this.saveSettings();
    }

    adjustFontSize(value) {
        this.fontSizeMultiplier = value / 100;
        document.documentElement.style.fontSize = `${this.fontSizeMultiplier * 100}%`;
        document.getElementById('font-size-value').textContent = `${value}%`;
        this.saveSettings();
    }

    describeImages() {
        const images = document.querySelectorAll('img');
        if (images.length === 0) {
            this.speak('No images found on this page.');
            return;
        }

        let descriptions = [];
        images.forEach((img, index) => {
            const alt = img.getAttribute('alt') || img.getAttribute('aria-label') || 'Image';
            const description = alt !== '' ? alt : `Image ${index + 1} without description`;
            descriptions.push(`Image ${index + 1}: ${description}`);
        });

        this.speak(`Found ${images.length} image${images.length > 1 ? 's' : ''}. ${descriptions.join('. ')}`);
    }

    highlightLinks() {
        const links = document.querySelectorAll('a');
        const btn = document.getElementById('highlight-links-btn');
        
        if (links.length === 0) {
            this.speak('No links found on this page.');
            return;
        }

        const isHighlighted = btn.classList.contains('active');
        
        links.forEach(link => {
            if (isHighlighted) {
                link.classList.remove('link-highlighted');
            } else {
                link.classList.add('link-highlighted');
            }
        });

        btn.classList.toggle('active');
        this.speak(`${links.length} link${links.length > 1 ? 's' : ''} ${isHighlighted ? 'unhighlighted' : 'highlighted'}.`);
    }

    enableKeyboardNavigation() {
        this.speak('Keyboard navigation enabled. Use Tab to navigate, Enter to activate, and Escape to close dialogs.');
        
        // Focus on first interactive element
        const firstFocusable = document.querySelector('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (firstFocusable) {
            firstFocusable.focus();
        }
    }

    setupVoiceCommands() {
        this.voiceCommands = [
            { command: 'read page', action: () => this.readPage() },
            { command: 'stop reading', action: () => this.stopReading() },
            { command: 'high contrast', action: () => this.toggleHighContrast() },
            { command: 'describe images', action: () => this.describeImages() },
            { command: 'close panel', action: () => this.closePanel() },
            { command: 'open panel', action: () => this.togglePanel() }
        ];
    }

    toggleVoiceCommands() {
        const btn = document.getElementById('voice-commands-btn');
        const status = document.getElementById('voice-status');
        
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            this.speak('Voice recognition is not supported in your browser.');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        const isActive = btn.classList.contains('active');

        if (isActive) {
            recognition.stop();
            btn.classList.remove('active');
            status.textContent = 'Off';
            status.classList.remove('listening');
            this.speak('Voice commands disabled.');
        } else {
            recognition.start();
            btn.classList.add('active');
            status.textContent = 'Listening...';
            status.classList.add('listening');
            this.speak('Voice commands enabled. Say "read page", "stop reading", or "high contrast".');

            recognition.onresult = (event) => {
                const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
                
                for (const cmd of this.voiceCommands) {
                    if (transcript.includes(cmd.command)) {
                        cmd.action();
                        break;
                    }
                }
            };

            recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                if (event.error === 'no-speech') {
                    // Restart recognition
                    setTimeout(() => recognition.start(), 1000);
                }
            };

            recognition.onend = () => {
                if (btn.classList.contains('active')) {
                    // Restart if still active
                    setTimeout(() => recognition.start(), 1000);
                }
            };
        }
    }

    loadSettings() {
        const fontSize = localStorage.getItem('visionAssistFontSize');
        if (fontSize) {
            this.adjustFontSize(parseInt(fontSize));
            document.getElementById('font-size-slider').value = fontSize;
        }

        const highContrast = localStorage.getItem('visionAssistHighContrast') === 'true';
        if (highContrast) {
            this.toggleHighContrast();
        }

        const autoRead = localStorage.getItem('visionAssistAutoRead') === 'true';
        document.getElementById('auto-read-checkbox').checked = autoRead;

        const announceChanges = localStorage.getItem('visionAssistAnnounceChanges') !== 'false';
        document.getElementById('announce-changes-checkbox').checked = announceChanges;
    }

    saveSettings() {
        localStorage.setItem('visionAssistFontSize', (this.fontSizeMultiplier * 100).toString());
        localStorage.setItem('visionAssistHighContrast', this.highContrastMode.toString());
        localStorage.setItem('visionAssistAutoRead', document.getElementById('auto-read-checkbox').checked);
        localStorage.setItem('visionAssistAnnounceChanges', document.getElementById('announce-changes-checkbox').checked);
    }
}

// Initialize Vision Assist AI when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.visionAssist = new VisionAssistAI();
    });
} else {
    window.visionAssist = new VisionAssistAI();
}

