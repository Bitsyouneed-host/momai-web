import { useState, useEffect } from 'react';
import { X, Smartphone } from 'lucide-react';

const DISMISS_KEY = 'momai_app_banner_dismissed';
const APP_RELEASE_URL = 'https://github.com/Bitsyouneed-host/momai-android-releases/releases/latest';

function isAndroid() {
  return /android/i.test(navigator.userAgent);
}

function isMobile() {
  return /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent);
}

export default function MobileAppBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isMobile()) return;
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10);
      // Show again after 7 days
      if (Date.now() - dismissedAt < 7 * 24 * 60 * 60 * 1000) return;
    }
    setVisible(true);
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setVisible(false);
  };

  const android = isAndroid();

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm safe-top">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
          <Smartphone size={20} className="text-primary-deep" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-text-primary">MOM AI</div>
          <div className="text-xs text-text-secondary">
            {android ? 'Get the Android app for a better experience' : 'Available on Android'}
          </div>
        </div>
        <a
          href={APP_RELEASE_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={dismiss}
          className="px-4 py-1.5 bg-primary-deep text-white text-xs font-semibold rounded-full flex-shrink-0"
        >
          {android ? 'OPEN' : 'GET'}
        </a>
        <button
          onClick={dismiss}
          className="p-1 text-gray-400 hover:text-gray-600 flex-shrink-0"
          aria-label="Dismiss"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
