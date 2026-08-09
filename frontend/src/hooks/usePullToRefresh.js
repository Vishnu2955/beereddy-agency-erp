import { useEffect, useState, useRef } from "react";
import { hapticTap } from "../utils/haptic";

export function usePullToRefresh(onRefresh) {
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startYRef = useRef(0);
  const isPullingRef = useRef(false);
  const pullDistRef = useRef(0);

  useEffect(() => {
    const handleTouchStart = (e) => {
      if (window.scrollY === 0) {
        startYRef.current = e.touches[0].clientY;
        isPullingRef.current = true;
      }
    };

    const handleTouchMove = (e) => {
      if (!isPullingRef.current) return;
      const currentY = e.touches[0].clientY;
      const diff = currentY - startYRef.current;

      if (diff > 0 && window.scrollY === 0) {
        // Resistance factor
        const distance = Math.min(diff * 0.4, 80);
        pullDistRef.current = distance;
        setPullDistance(distance);
      }
    };

    const handleTouchEnd = async () => {
      if (!isPullingRef.current) return;
      isPullingRef.current = false;

      if (pullDistRef.current > 60) {
        hapticTap();
        setRefreshing(true);
        setPullDistance(60);
        try {
          if (onRefresh) await onRefresh();
        } catch (_) {
        } finally {
          setTimeout(() => {
            setRefreshing(false);
            setPullDistance(0);
            pullDistRef.current = 0;
          }, 400);
        }
      } else {
        setPullDistance(0);
        pullDistRef.current = 0;
      }
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [onRefresh]);

  return { refreshing, pullDistance };
}
