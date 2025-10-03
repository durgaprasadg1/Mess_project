

self.addEventListener('push', event => {
    const data = event.data.json();
    const options = {
        body: data.message,
        icon: '/icon.png',
        data: data.url  // optional: for redirection
    };
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    if(event.notification.data){
        clients.openWindow(event.notification.data);
    }
});
