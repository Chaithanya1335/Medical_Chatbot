// Main application entry point

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    console.log('🩺 Medi Bot Web Interface - Initializing...');

    // chat_interface.js is already self-initializing, no need to call it here

    console.log('✅ Medi Bot Web Interface - Ready');
});

// Expose main app functions to global scope
window.medibot = {
    sendMedicalQuery: window.api?.sendMedicalQuery,
    uploadImageForAnalysis: window.api?.uploadImageForAnalysis,
    checkBackendHealth: window.api?.checkBackendHealth
};

console.log('🚀 Medi Bot API ready:', window.medibot);