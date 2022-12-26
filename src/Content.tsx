import { useCallback, useEffect, useState } from 'react';
import debounce from 'lodash/debounce';

type MousePoint = {
  x: number;
  y: number;
};

const isMouseInsideOfDOMRect = (domRect: DOMRect, { x, y }: MousePoint) => {
  return (
    domRect.left <= x &&
    domRect.right >= x &&
    domRect.top <= y &&
    domRect.bottom >= y
  );
};

function getWordAtMousePoint(
  node: Node,
  mousePoint: MousePoint,
): string | null {
  if (node.nodeType === node.TEXT_NODE) {
    const textRange = document.caretRangeFromPoint(mousePoint.x, mousePoint.y);
    if (textRange === null) return null;

    // @ts-ignore
    textRange.expand('word');
    const wordAtMousePoint = textRange.toString().trim();
    return wordAtMousePoint;
  } else {
    for (let i = 0; i < node.childNodes.length; i++) {
      const childNode = node.childNodes[i];
      const document = childNode.ownerDocument;
      if (document === null) continue;

      const range = document.createRange();
      range.selectNodeContents(node.childNodes[i]);
      const domRect = range.getBoundingClientRect();
      if (isMouseInsideOfDOMRect(domRect, mousePoint)) {
        return getWordAtMousePoint(childNode, mousePoint);
      }
    }
  }
  return null;
}

function Content() {
  const [translation, setTranslation] = useState({
    word: '',
    definition: '',
  });
  const [isHotKeyPressed, setIsHotKeyPressed] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<
    Partial<{
      left: number;
      right: number;
      top: number;
      bottom: number;
    }>
  >({
    left: 0,
    top: 0,
  });
  const [elementFontSize, setElementFontSize] = useState(0);

  useEffect(() => {
    const IS_MAC_OS = /Mac OS X/.test(navigator.userAgent);
    const isHotKey = (event: KeyboardEvent) =>
      IS_MAC_OS ? event.key === 'Meta' : event.key === 'Control';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;
      if (!isHotKey(event)) return;

      setIsHotKeyPressed(true);
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      if (!isHotKey(event)) return;

      setIsHotKeyPressed(false);
      setTranslation({
        word: '',
        definition: '',
      });
      setTooltipPosition({ left: 0, top: 0 });
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const handleDebouncedMouseMove = debounce((event: MouseEvent) => {
      const elementAtPoint = document.elementFromPoint(
        event.clientX,
        event.clientY,
      );
      if (elementAtPoint === null) return;
      const tooltipElement = elementAtPoint.closest('#assistant-tooltip');
      if (tooltipElement !== null) return;

      const wordAtMousePoint = getWordAtMousePoint(elementAtPoint, {
        x: event.clientX,
        y: event.clientY,
      });
      if (wordAtMousePoint === null) return;
      if (translation.word === wordAtMousePoint) return;
      setTranslation({
        word: wordAtMousePoint,
        definition: '',
      });

      const isSupportedWord = (word: string) => /^[A-Za-z\s\_]*$/.test(word);
      if (!isSupportedWord(wordAtMousePoint)) return;

      chrome.runtime.sendMessage(
        { type: 'word', data: wordAtMousePoint },
        (response) => {
          const elementFontSize = parseInt(
            getComputedStyle(elementAtPoint).fontSize,
          );
          setElementFontSize(elementFontSize);
          setTooltipPosition({
            left: event.clientX,
            top: event.clientY + window.scrollY + elementFontSize,
          });
          setTranslation((prevTranslation) => ({
            ...prevTranslation,
            definition: response.data,
          }));
        },
      );
    }, 100);

    if (isHotKeyPressed) {
      document.addEventListener('mousemove', handleDebouncedMouseMove);
      return () => {
        document.removeEventListener('mousemove', handleDebouncedMouseMove);
      };
    }
  }, [isHotKeyPressed, translation]);

  const measuredRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (node === null) return;
      if (translation.definition === '') return;

      const PADDING = 16;
      const rect = node.getBoundingClientRect();

      const isOverflowingHorizontal =
        rect.width > window.innerWidth - 2 * PADDING;
      const isOverflowingRight = rect.right > window.innerWidth - PADDING;
      if (isOverflowingHorizontal) {
        setTooltipPosition((prevTooltipPosition) => ({
          ...prevTooltipPosition,
          left: PADDING,
          width: window.innerWidth - 2 * PADDING,
        }));
      } else if (isOverflowingRight) {
        setTooltipPosition((prevTooltipPosition) => ({
          ...prevTooltipPosition,
          left: undefined,
          right: PADDING,
        }));
      }

      const isOverflowingVertical =
        rect.height > window.innerHeight - 2 * PADDING;
      const isOverflowingBottom = rect.bottom > window.innerHeight - PADDING;
      if (isOverflowingVertical) {
        setTooltipPosition((prevTooltipPosition) => ({
          ...prevTooltipPosition,
          top: window.scrollY + PADDING,
          height: window.innerHeight - 2 * PADDING,
        }));
      } else if (isOverflowingBottom) {
        setTooltipPosition((prevTooltipPosition) => ({
          ...prevTooltipPosition,
          top: rect.top + window.scrollY - rect.height - elementFontSize,
        }));
      }
    },
    [elementFontSize, translation.definition],
  );

  return (
    <div>
      {translation.definition && (
        <div
          id='assistant-tooltip'
          ref={measuredRef}
          style={{
            width: 'max-content',
            maxWidth: '500px',
            maxHeight: '500px',
            position: 'absolute',
            zIndex: 2147483647,
            backgroundColor: '#424557',
            backdropFilter: 'saturate(180%) blur(20px)',
            color: '#fff',
            padding: '8px',
            fontSize: '16px',
            lineHeight: 1.5,
            borderRadius: '8px',
            overflow: 'auto',
            ...tooltipPosition,
          }}
        >
          <span style={{ fontSize: '20px' }}>{translation.word}</span>
          <div
            // rome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
            dangerouslySetInnerHTML={{
              __html: `${translation.definition.replace(
                /([2-9]\.)/g,
                '<br/>$1',
              )}`,
            }}
          />
        </div>
      )}
    </div>
  );
}

export default Content;
