function getServiceWorker() {
  return new Promise((resolve, error) => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        resolve(reg);
      });
    } else {
      resolve();
    }
  });
}

class WebPushConnection {
  constructor(nsp, id) {
    this.namespace = nsp;
    this.id = id;
  }

  startStream() {
    return fetch("/start", {
      method: "post",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ stream: this.id })
    });
  }

  sendEvent(payload) {
    return fetch("/update", {
      method: "post",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        stream: this.id,
        payload: payload,
        namespace: this.namespace
      })
    });
  }

  isHost() {
    return fetch("/is_host", {
      method: "post",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        stream: this.id,
        namespace: this.namespace
      })
    }).then(r=>r.json()).then(data=>{
      return data.isHost;
    });
  }

  subscribeUser() {
    return getServiceWorker().then(reg => {
      return fetch("/vapid").then(r => r.text()).then(vapid => {
        return reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: vapid
        }).then((sub) => {
          return fetch("/subscribe", {
            method: "post",
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ stream: this.id, credentials: sub })
          }).then(r => r.json());
        }).catch((e) => {
          if (Notification.permission === 'denied') {
            console.warn('Permission for notifications was denied');
          } else {
            console.error('Unable to subscribe to push', e);
          }
        });
      });
    });
  }
}

export { WebPushConnection };