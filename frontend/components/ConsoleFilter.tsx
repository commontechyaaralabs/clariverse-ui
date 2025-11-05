'use client';

import { useEffect } from 'react';

export default function ConsoleFilter() {
  useEffect(() => {
    // Store original console methods
    const originalLog = console.log;
    const originalInfo = console.info;
    const originalWarn = console.warn;
    
    // Filter function to suppress Fast Refresh messages
    const shouldSuppress = (message: string): boolean => {
      const suppressedMessages = [
        '[Fast Refresh]',
        'Fast Refresh',
        'turbopack-hot-reloader',
        'report-hmr-latency',
        'Rebuilding...',
        'rebuilding',
      ];
      
      return suppressedMessages.some(suppressed => 
        message.includes(suppressed)
      );
    };

    // Override console.log
    console.log = (...args: any[]) => {
      const message = args.join(' ');
      if (!shouldSuppress(message)) {
        originalLog.apply(console, args);
      }
    };

    // Override console.info
    console.info = (...args: any[]) => {
      const message = args.join(' ');
      if (!shouldSuppress(message)) {
        originalInfo.apply(console, args);
      }
    };

    // Override console.warn (some Fast Refresh messages might use warn)
    console.warn = (...args: any[]) => {
      const message = args.join(' ');
      if (!shouldSuppress(message)) {
        originalWarn.apply(console, args);
      }
    };

    // Cleanup: restore original console methods on unmount
    return () => {
      console.log = originalLog;
      console.info = originalInfo;
      console.warn = originalWarn;
    };
  }, []);

  return null; // This component doesn't render anything
}
