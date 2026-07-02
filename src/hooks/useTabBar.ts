import { useEffect } from 'react';
import { useUIStore } from '@/src/store/uiStore';

export function useTabBar(visible: boolean) {
  const hideTabBar = useUIStore((s) => s.hideTabBar);
  const showTabBar = useUIStore((s) => s.showTabBar);

  useEffect(() => {
    if (visible) {
      showTabBar();
    } else {
      hideTabBar();
    }

    // Always restore on unmount so navigating away doesn't leave it hidden
    return () => {
      showTabBar();
    };
  }, [visible, hideTabBar, showTabBar]);
}
