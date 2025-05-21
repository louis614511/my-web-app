console.log("Web App Loaded");

// Optional: Add more functionality here

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js')
    .then(() => console.log('Service Worker registered'));
}
