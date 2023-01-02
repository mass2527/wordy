import { useEventListener } from './useEventListener';

export function useDocumentEventListener<K extends keyof DocumentEventMap>({
  enabled,
  type,
  listener,
  options,
}: {
  enabled: boolean;
  type: K;
  listener: (event: DocumentEventMap[K]) => void;
  options?: boolean | AddEventListenerOptions;
}) {
  useEventListener({
    enabled,
    eventTarget: document,
    type,
    listener,
    options,
  });
}
