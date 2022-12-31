import { useEffect, useState } from 'react';
import debounce from 'lodash/debounce';
import { DeepPartial } from './utils/DeepPartial';
import usePrevious from './hooks/usePrevious';
import { getWordAtMousePoint } from './utils/getWordAtMousePoint';
import { Box } from './components/Box';
import useChromeStorageState from './hooks/useChromeStorageState';
import { SpeakerLoudIcon } from '@radix-ui/react-icons';
import { Flex } from './components/Flex';
import { Text } from './components/Text';
import { Button } from './components/Button';
import { center } from './styles/center';

type TooltipStyles = DeepPartial<{
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
}>;

const INITIAL_WORD_DETAILS = {
  word: '',
  definition: '',
  fontSize: 0,
  pronunciations: {
    american: {
      symbol: '',
      href: '',
    },
    british: {
      symbol: '',
      href: '',
    },
  },
};

export type WordDetails = typeof INITIAL_WORD_DETAILS;

export const INITIAL_SETTINGS = {
  key: 'settings',
  defaultValue: {
    enabled: true,
    showPronunciationInfo: true,
  },
};

function Content() {
  const [wordDetails, setWordDetails] = useState(INITIAL_WORD_DETAILS);
  const [isHotKeyPressed, setIsHotKeyPressed] = useState(false);
  const [tooltipStyles, setTooltipStyles] = useState<TooltipStyles>({});
  const previousWord = usePrevious(wordDetails.word);
  const [settings] = useChromeStorageState(INITIAL_SETTINGS);

  const { pronunciations } = wordDetails;

  useEffect(() => {
    if (!settings.enabled) return;

    const handleFocus = () => {
      setIsHotKeyPressed(false);
      setWordDetails(INITIAL_WORD_DETAILS);
      setTooltipStyles({});
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [settings.enabled]);

  useEffect(() => {
    if (!settings.enabled) return;

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
      setWordDetails(INITIAL_WORD_DETAILS);
      setTooltipStyles({});
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [settings.enabled]);

  useEffect(() => {
    if (!settings.enabled) return;
    if (!isHotKeyPressed) return;

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
      // it's, you'll, we've 등의 단어가 포함된 경우, ' 앞 단어를 가져옴
      const sanitizedWord = /^\w+\'\w+$/.test(wordAtMousePoint)
        ? wordAtMousePoint.split("'")[0]
        : wordAtMousePoint;
      if (wordDetails.word === sanitizedWord || previousWord === sanitizedWord)
        return;

      setWordDetails({ ...INITIAL_WORD_DETAILS, word: sanitizedWord });

      const isSupportedWord = (word: string) => /^[A-Za-z\s\_]*$/.test(word);
      if (!isSupportedWord(sanitizedWord)) return;

      chrome.runtime.sendMessage(
        { type: 'word', data: sanitizedWord },
        (response: Pick<WordDetails, 'definition' | 'pronunciations'>) => {
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
            definition: response.definition,
            fontSize: elementFontSize,
            pronunciations: response.pronunciations,
          }));
        },
      );
    }, 100);

    document.addEventListener('mousemove', handleDebouncedMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleDebouncedMouseMove);
    };
  }, [settings.enabled, isHotKeyPressed, wordDetails, previousWord]);

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

  const playAudio = debounce((src: string) => {
    const audio = new Audio(src);
    audio.play();
  }, 200);

  return (
    <Box
      css={{
        color: '$neutral100',
        fontSize: '16px',
        fontFamily: '$untitled',
      }}
    >
      {wordDetails.definition && (
        <Box
          id='assistant-tooltip'
          ref={adjustTooltipStyles}
          style={{
            maxWidth: '350px',
            maxHeight: '500px',
            position: 'absolute',
            zIndex: 2147483647,
            overflow: 'auto',
            ...tooltipStyles.position,
            ...tooltipStyles.size,
          }}
          css={{
            bc: '$primary',
            br: '$8',
            p: '$8',
            lh: '1.5',
          }}
        >
          {(pronunciations.american.symbol !== '' ||
            pronunciations.british.symbol !== '') &&
            settings.showPronunciationInfo && (
              <Flex
                gap={8}
                wrap='wrap'
                css={{ color: '$neutral200', mb: '$4' }}
              >
                {pronunciations.american.symbol !== '' && (
                  <Flex align='center' gap={4}>
                    <Text color='neutral200' css={{ fontSize: '14px' }}>
                      미국 {pronunciations.american.symbol}
                    </Text>
                    {pronunciations.american.href !== '' && (
                      <Button
                        onClick={() => playAudio(pronunciations.american.href)}
                        aria-label='미국식 발음으로 듣기'
                        css={center}
                        type='button'
                      >
                        <SpeakerLoudIcon />
                      </Button>
                    )}
                  </Flex>
                )}

                {pronunciations.british.symbol !== '' && (
                  <Flex align='center' gap={4}>
                    <Text color='neutral200' css={{ fontSize: '14px' }}>
                      영국 {pronunciations.british.symbol}
                    </Text>
                    {pronunciations.british.href !== '' && (
                      <Button
                        onClick={() => playAudio(pronunciations.british.href)}
                        aria-label='영국식 발음으로 듣기'
                        css={center}
                        type='button'
                      >
                        <SpeakerLoudIcon fontSize={40} />
                      </Button>
                    )}
                  </Flex>
                )}
              </Flex>
            )}

          <Box
            // rome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
            dangerouslySetInnerHTML={{
              __html: `${wordDetails.definition
                .replace(/([2-9]\.)/g, '<br/>$1')
                .replace(/(\d\.)/g, '$1 ')}`,
            }}
          />
        </Box>
      )}
    </Box>
  );
}

export default Content;
