import { useCallback, useRef, useState } from 'react';

export const useLongPress = (
  onLongPress: (e: React.MouseEvent | React.TouchEvent) => void,
  onClick: () => void,
  { delay = 300 } = {}
) => {
  const [longPressTriggered, setLongPressTriggered] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout>>();
  const target = useRef<EventTarget>();

  const start = useCallback(
    (event: React.MouseEvent | React.TouchEvent) => {
      if (event.target) {
        target.current = event.target;
      }
      timeout.current = setTimeout(() => {
        onLongPress(event);
        setLongPressTriggered(true);
      }, delay);
    },
    [onLongPress, delay]
  );

  const clear = useCallback(
    (shouldTriggerClick = true) => {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
      if (shouldTriggerClick && !longPressTriggered) {
        onClick();
      }
      setLongPressTriggered(false);
    },
    [onClick, longPressTriggered]
  );

  return {
    onMouseDown: (e: React.MouseEvent) => start(e),
    onTouchStart: (e: React.TouchEvent) => start(e),
    onMouseUp: () => clear(),
    onMouseLeave: () => clear(false),
    onTouchEnd: () => clear(),
  };
};
