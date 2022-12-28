import { useEffect, useState } from 'react';
import debounce from 'lodash/debounce';
import { DeepPartial } from './utils/DeepPartial';
import usePrevious from './hooks/usePrevious';
import { getWordAtMousePoint } from './utils/getWordAtMousePoint';

function Content() {
  const [wordDetails, setWordDetails] = useState({
    term: '',
    definition: '',
    fontSize: 0,
  });
  const [isHotKeyPressed, setIsHotKeyPressed] = useState(false);
  const [tooltipStyles, setTooltipStyles] = useState<
    DeepPartial<{
      position: {
        left: number;
        top: number;
        right: number;
        bottom: number;
      };
      size: {
        width: number;
        height: number;
      };
    }>
  >({});
  const previousWordAtMousePoint = usePrevious(wordDetails.term);

  useEffect(() => {
    const handleFocus = () => {
      setIsHotKeyPressed(false);
      setWordDetails({
        term: '',
        definition: '',
        fontSize: 0,
      });
      setTooltipStyles({});
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

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
      setWordDetails({
        term: '',
        definition: '',
        fontSize: 0,
      });
      setTooltipStyles({});
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
      if (wordAtMousePoint === null || wordAtMousePoint === '') return;
      if (wordDetails.term === wordAtMousePoint) return;
      if (previousWordAtMousePoint === wordAtMousePoint) return;

      setWordDetails({
        term: wordAtMousePoint,
        definition: '',
        fontSize: 0,
      });

      const isSupportedWord = (word: string) => /^[A-Za-z\s\_]*$/.test(word);
      if (!isSupportedWord(wordAtMousePoint)) return;

      chrome.runtime.sendMessage(
        { type: 'word', data: wordAtMousePoint },
        (response) => {
          const elementFontSize = parseInt(
            getComputedStyle(elementAtPoint).fontSize,
          );
          setTooltipStyles({
            position: {
              left: event.clientX,
              top: event.clientY + window.scrollY + elementFontSize,
            },
          });
          setWordDetails((prevTranslation) => ({
            ...prevTranslation,
            definition: response.data,
            fontSize: elementFontSize,
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
  }, [isHotKeyPressed, wordDetails, previousWordAtMousePoint]);

  const adjustTooltipStyles = (node: HTMLDivElement | null) => {
    if (node === null) return;

    const PADDING = 16;
    const rect = node.getBoundingClientRect();

    const isOverflowingHorizontal =
      rect.width > window.innerWidth - 2 * PADDING;
    const isOverflowingRight = rect.right > window.innerWidth - PADDING;
    if (isOverflowingHorizontal) {
      setTooltipStyles((prevTooltipPosition) => ({
        position: {
          ...prevTooltipPosition.position,
          left: PADDING,
        },
        size: {
          ...prevTooltipPosition.size,
          width: window.innerWidth - 2 * PADDING,
        },
      }));
      return;
    } else if (isOverflowingRight) {
      setTooltipStyles((prevTooltipPosition) => ({
        ...prevTooltipPosition,
        position: {
          ...prevTooltipPosition.position,
          left: undefined,
          right: PADDING,
        },
      }));
      return;
    }

    const isOverflowingVertical =
      rect.height > window.innerHeight - 2 * PADDING;
    const isOverflowingBottom = rect.bottom > window.innerHeight - PADDING;
    if (isOverflowingVertical) {
      setTooltipStyles((prevTooltipPosition) => ({
        position: {
          ...prevTooltipPosition.position,
          top: window.scrollY + PADDING,
        },
        size: {
          ...prevTooltipPosition.size,
          height: window.innerHeight - 2 * PADDING,
        },
      }));
    } else if (isOverflowingBottom) {
      setTooltipStyles((prevTooltipPosition) => ({
        ...prevTooltipPosition,
        position: {
          ...prevTooltipPosition.position,
          top:
            rect.top +
            window.scrollY -
            rect.height -
            wordDetails.fontSize * 1.5,
        },
      }));
    }
  };

  return (
    <div>
      {wordDetails.definition && (
        <div
          id='assistant-tooltip'
          ref={adjustTooltipStyles}
          style={{
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
            ...tooltipStyles.position,
            ...tooltipStyles.size,
          }}
        >
          <span style={{ fontSize: '20px' }}>{wordDetails.term}</span>
          <div
            // rome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
            dangerouslySetInnerHTML={{
              __html: `${wordDetails.definition.replace(
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
