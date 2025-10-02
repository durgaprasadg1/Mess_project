// self.addEventListener("push", (event) => {
//   console.log("[Service Worker] Push Received."); 
//   let data = { title: "Notification", message: "You have a new message", url: "/" };

//   try {
//     if (event.data) {
//       data = event.data.json();
//       console.log("[Service Worker] Push data:", data); 
//     }
//   } catch (err) {
//     console.error("[Service Worker] Push event data error:", err);
//   }

//   const options = {
//     body: data.message,
//     icon: "/icon.png",
//     data: { url: data.url || "/" }, 
//     badge: "/icon.png"
//   };

//   event.waitUntil(
//     self.registration.showNotification(data.title, options)
//   );
// });

// self.addEventListener("notificationclick", (event) => {
//   console.log("[Service Worker] Notification click received."); 
//   event.notification.close();

//   const urlToOpen = event.notification.data?.url || "/";
//   console.log("[Service Worker] Opening URL:", urlToOpen); 

//   event.waitUntil(
//     clients.matchAll({ type: "window", includeUncontrolled: true }).then(windowClients => {
//       for (let client of windowClients) {
//         if (client.url === urlToOpen && "focus" in client) {
//           console.log("[Service Worker] Focusing existing tab"); 
//           return client.focus();
//         }
//       }
//       if (clients.openWindow) {
//         console.log("[Service Worker] Opening new tab"); 
//         return clients.openWindow(urlToOpen);
//       }
//     })
//   );
// });




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
