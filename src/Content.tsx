import { useEffect, useState } from 'react';
import debounce from 'lodash/debounce';
import { DeepPartial } from './utils/DeepPartial';
import usePrevious from './hooks/usePrevious';
import { getWordAtMousePoint } from './utils/getWordAtMousePoint';
import { Box } from './components/Box';

function Content() {
  const [wordDetails, setWordDetails] = useState({
    word: '',
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
  const previousWordAtMousePoint = usePrevious(wordDetails.word);

  useEffect(() => {
    const handleFocus = () => {
      setIsHotKeyPressed(false);
      setWordDetails({
        word: '',
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
        word: '',
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
      if (wordDetails.word === wordAtMousePoint) return;
      if (previousWordAtMousePoint === wordAtMousePoint) return;
      // it's, you'll, we've 등의 단어가 포함된 경우, ' 앞 단어를 가져옴
      const sanitizedWord = /^\w+\'\w+$/.test(wordAtMousePoint)
        ? wordAtMousePoint.split("'")[0]
        : wordAtMousePoint;

      setWordDetails({
        word: sanitizedWord,
        definition: '',
        fontSize: 0,
      });

      const isSupportedWord = (word: string) => /^[A-Za-z\s\_]*$/.test(word);
      if (!isSupportedWord(sanitizedWord)) return;

      chrome.runtime.sendMessage(
        { type: 'word', data: sanitizedWord },
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
        <Box
          id='assistant-tooltip'
          ref={adjustTooltipStyles}
          style={{
            maxWidth: '500px',
            maxHeight: '500px',
            position: 'absolute',
            zIndex: 2147483647,
            overflow: 'auto',
            ...tooltipStyles.position,
            ...tooltipStyles.size,
          }}
          css={{
            color: '$neutral100',
            bc: '$primary',
            br: '$8',
            p: '$8',
          }}
        >
          <Box
            // rome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
            dangerouslySetInnerHTML={{
              __html: `${wordDetails.definition.replace(
                /([2-9]\.)/g,
                '<br/>$1',
              )}`,
            }}
          />
        </Box>
      )}
    </div>
  );
}

export default Content;
