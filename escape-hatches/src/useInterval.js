import { useEffect } from 'react';

export function useInterval(callback, delay) {
  const onTick = useEffectEvent(callback);

  useEffect(() => {
    const id = setInterval(onTick, delay);
    return () => clearInterval(id);
  }, [delay]);
}
