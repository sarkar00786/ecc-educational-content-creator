// service-worker.js - DISABLED FOR DEVELOPMENT

// This service worker is completely disabled during development
// to prevent fetch interception and network errors

console.log('Service Worker: Disabled for development');

// Immediately unregister if already registered
self.addEventListener('install', (event) => {
    console.log('Service Worker: Skipping installation in development');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker: Self-destructing in development');
    event.waitUntil(
        self.registration.unregister().then(() => {
            console.log('Service Worker: Successfully unregistered');
        })
    );
});
