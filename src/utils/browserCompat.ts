// Browser compatibility utilities

// Polyfill for fetch API
if (!window.fetch) {
  require('whatwg-fetch');
}

// Geolocation fallback for older browsers
export const getLocation = (): Promise<GeolocationPosition> => {
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
export const createObjectURL = (blob: Blob): string => {
  if (window.URL && window.URL.createObjectURL) {
    return window.URL.createObjectURL(blob);
  } else if ((window as any).webkitURL && (window as any).webkitURL.createObjectURL) {
    return (window as any).webkitURL.createObjectURL(blob);
  } else {
    throw new Error('Browser does not support object URLs');
  }
};

// URL.revokeObjectURL fallback
export const revokeObjectURL = (url: string): void => {
  if (window.URL && window.URL.revokeObjectURL) {
    window.URL.revokeObjectURL(url);
  } else if ((window as any).webkitURL && (window as any).webkitURL.revokeObjectURL) {
    (window as any).webkitURL.revokeObjectURL(url);
  }
};

// MediaDevices.getUserMedia fallback
export const getUserMedia = (constraints: MediaStreamConstraints): Promise<MediaStream> => {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    return navigator.mediaDevices.getUserMedia(constraints);
  }

  // Fallback for older browsers
  const getUserMediaLegacy = (navigator as any).getUserMedia || 
                            (navigator as any).webkitGetUserMedia || 
                            (navigator as any).mozGetUserMedia || 
                            (navigator as any).msGetUserMedia;

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
    camera: !!(navigator.mediaDevices || (navigator as any).getUserMedia),
    localStorage: !!window.localStorage,
    sessionStorage: !!window.sessionStorage,
    fetch: !!window.fetch,
    promise: !!window.Promise,
    objectURL: !!(window.URL || (window as any).webkitURL)
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