// service-worker.js

// eslint-disable-next-line no-unused-vars
self.addEventListener('install', (event) => {
    console.log('Service Worker installing.');
    // Cache static assets here
});

// eslint-disable-next-line no-unused-vars
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating.');
});

// Temporarily disable fetch event handling to fix React errors
// self.addEventListener('fetch', (event) => {
//     // Service worker fetch logic disabled during development
// });
