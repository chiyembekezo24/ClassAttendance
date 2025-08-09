// Browser compatibility utilities

// Geolocation fallback for older browsers
export const getLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    // Use getCurrentPosition with fallback options
    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      (error) => reject(error),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  });
};

// URL.createObjectURL fallback
export const createObjectURL = (blob) => {
  if (window.URL && window.URL.createObjectURL) {
    return window.URL.createObjectURL(blob);
  } else if (window.webkitURL && window.webkitURL.createObjectURL) {
    return window.webkitURL.createObjectURL(blob);
  } else {
    throw new Error('Browser does not support object URLs');
  }
};

// URL.revokeObjectURL fallback
export const revokeObjectURL = (url) => {
  if (window.URL && window.URL.revokeObjectURL) {
    window.URL.revokeObjectURL(url);
  } else if (window.webkitURL && window.webkitURL.revokeObjectURL) {
    window.webkitURL.revokeObjectURL(url);
  }
};

// MediaDevices.getUserMedia fallback
export const getUserMedia = (constraints) => {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    return navigator.mediaDevices.getUserMedia(constraints);
  }

  // Fallback for older browsers
  const getUserMediaLegacy = navigator.getUserMedia || 
                            navigator.webkitGetUserMedia || 
                            navigator.mozGetUserMedia || 
                            navigator.msGetUserMedia;

  if (!getUserMediaLegacy) {
    return Promise.reject(new Error('getUserMedia is not supported'));
  }

  return new Promise((resolve, reject) => {
    getUserMediaLegacy.call(navigator, constraints, resolve, reject);
  });
};

// Check if browser supports required features
export const checkBrowserSupport = () => {
  const features = {
    geolocation: !!navigator.geolocation,
    camera: !!(navigator.mediaDevices || navigator.getUserMedia),
    localStorage: !!window.localStorage,
    sessionStorage: !!window.sessionStorage,
    fetch: !!window.fetch,
    promise: !!window.Promise,
    objectURL: !!(window.URL || window.webkitURL)
  };

  const unsupported = Object.entries(features)
    .filter(([, supported]) => !supported)
    .map(([feature]) => feature);

  return {
    supported: unsupported.length === 0,
    unsupported,
    features
  };
};