import { useEffect, useState } from 'react';
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
  const [tooltipPosition, setTooltipPosition] = useState({ left: 0, top: 0 });

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

      const wordAtMousePoint = getWordAtMousePoint(elementAtPoint, {
        x: event.clientX,
        y: event.clientY,
      });
      if (wordAtMousePoint === null) return;
      if (wordAtMousePoint === translation.word) return;

      const isSupportedWord = (word: string) => /^[A-Za-z\s\_]*$/.test(word);
      if (!isSupportedWord(wordAtMousePoint)) return;

      chrome.runtime.sendMessage(
        { type: 'word', data: wordAtMousePoint },
        (response) => {
          const elementFontSize = getComputedStyle(elementAtPoint).fontSize;
          setTooltipPosition({
            left: event.clientX,
            top: event.clientY + window.scrollY + parseInt(elementFontSize),
          });
          setTranslation({
            word: wordAtMousePoint,
            definition: response.data,
          });
        },
      );
    }, 100);

    if (isHotKeyPressed) {
      document.addEventListener('mousemove', handleDebouncedMouseMove);
      return () => {
        document.removeEventListener('mousemove', handleDebouncedMouseMove);
      };
    }
  }, [isHotKeyPressed, translation.word]);

  return (
    <div>
      {translation.definition && isHotKeyPressed && (
        <div
          style={{
            width: 'max-content',
            maxWidth: '500px',
            position: 'absolute',
            top: tooltipPosition.top,
            left: tooltipPosition.left,
            zIndex: 2147483647,
            backgroundColor: '#424557',
            backdropFilter: 'saturate(180%) blur(20px)',
            color: '#fff',
            padding: '8px',
            fontSize: '16px',
            lineHeight: 1.5,
            borderRadius: '10px',
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
