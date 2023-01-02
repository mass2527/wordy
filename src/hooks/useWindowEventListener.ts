import { useEventListener } from './useEventListener';

export function useWindowEventListener<K extends keyof WindowEventMap>({
  enabled,
  type,
  listener,
  options,
}: {
  enabled: boolean;
  type: K;
  listener: (event: WindowEventMap[K]) => void;
  options?: boolean | AddEventListenerOptions;
}) {
  useEventListener({
    enabled,
    eventTarget: window,
    type,
    listener,
    options,
  });
}
