
if ("serviceWorker" in navigator && "PushManager" in window) {
  navigator.serviceWorker
    .register("/service-worker.js")
    .then(async (swReg) => {
      try {
        const meta = document.querySelector('meta[name="vapid-public-key"]');
        const vapidKey = "BCXKGmRb0RMjfORK5I4PFCkvDnU1MClMZNnbxpyU_9Aw6APUMIJ04EEg-MPekVCrKaMiemUvJ56o75ec6-wYpKo"
        if (!vapidKey || vapidKey === "BCXKGmRb0RMjfORK5I4PFCkvDnU1MClMZNnbxpyU_9Aw6APUMIJ04EEg-MPekVCrKaMiemUvJ56o75ec6-wYpKo") {
          
          console.warn(
            "VAPID public key missing or placeholder; push subscription skipped."
          );
          return;
        }

        const applicationServerKey = urlBase64ToUint8Array(vapidKey);

        const subscription = await swReg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey,
        });

        await fetch("/api/save-subscription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subscription }),
        });
      } catch (err) {
        console.error("Failed to subscribe the user: ", err);
      }
    })
    .catch((err) => console.error("Service Worker registration failed: ", err));
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
(() => {
  "use strict";

  const forms = document.querySelectorAll(".needs-validation");

  Array.from(forms).forEach((form) => {
    form.addEventListener(
      "submit",
      (event) => {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }
        form.classList.add("was-validated");
      },
      false
    );
  });
})();
