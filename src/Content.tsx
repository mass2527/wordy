import { useReducer } from 'react';
import debounce from 'lodash/debounce';
import { DeepPartial } from './utils/DeepPartial';
import { getWordAtMousePoint } from './utils/getWordAtMousePoint';
import { Box } from './components/Box';
import { SpeakerLoudIcon } from '@radix-ui/react-icons';
import { Flex } from './components/Flex';
import { Text } from './components/Text';
import { Button } from './components/Button';
import { center } from './styles/center';
import {
  useChromeStorageState,
  useDocumentEventListener,
  useFreshRef,
  useWindowEventListener,
} from './hooks';

export const INITIAL_SETTINGS = {
  key: 'settings',
  defaultValue: {
    enabled: true,
    showPronunciationInfo: true,
  },
};

const IS_MAC_OS = /Mac OS X/.test(navigator.userAgent);
const isHotKey = (event: KeyboardEvent) =>
  IS_MAC_OS ? event.key === 'Meta' : event.key === 'Control';

type State = {
  wordDetails: {
    word: string;
    definition: string;
    fontSize: number;
    pronunciations: {
      american: {
        symbol: string;
        href: string;
      };
      british: {
        symbol: string;
        href: string;
      };
    };
  };
  isHotKeyPressed: boolean;
  tooltipStyles: DeepPartial<{
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
};
export type WordDetails = State['wordDetails'];

const INITIAL_STATE: State = {
  wordDetails: {
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
  },
  isHotKeyPressed: false,
  tooltipStyles: {},
};

type Action =
  | {
      type: 'RESET' | 'PRESSED_HOT_KEY';
    }
  | { type: 'CHANGED_WORD'; word: State['wordDetails']['word'] }
  | {
      type: 'TRANSLATED_WORD';
      position: State['tooltipStyles']['position'];
      definition: State['wordDetails']['definition'];
      fontSize: State['wordDetails']['fontSize'];
      pronunciations: State['wordDetails']['pronunciations'];
    }
  | {
      type: 'CHANGED_TOOLTIP_STYLES';
      position?: State['tooltipStyles']['position'];
      size?: State['tooltipStyles']['size'];
    };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'RESET':
      return {
        ...INITIAL_STATE,
      };
    case 'PRESSED_HOT_KEY':
      return { ...state, isHotKeyPressed: true };
    case 'CHANGED_WORD':
      return {
        ...state,
        wordDetails: {
          ...INITIAL_STATE.wordDetails,
          word: action.word,
        },
      };
    case 'TRANSLATED_WORD':
      return {
        ...state,
        tooltipStyles: {
          position: action.position,
        },
        wordDetails: {
          ...state.wordDetails,
          definition: action.definition,
          fontSize: action.fontSize,
          pronunciations: action.pronunciations,
        },
      };
    case 'CHANGED_TOOLTIP_STYLES': {
      return {
        ...state,
        tooltipStyles: {
          position: {
            ...state.tooltipStyles.position,
            ...action.position,
          },
          size: {
            ...state.tooltipStyles.size,
            ...action.size,
          },
        },
      };
    }
  }
};

function Content() {
  const [{ wordDetails, isHotKeyPressed, tooltipStyles }, dispatch] =
    useReducer(reducer, INITIAL_STATE);
  const { pronunciations } = wordDetails;
  const [settings] = useChromeStorageState(INITIAL_SETTINGS);
  const freshIsHotKeyPressedRef = useFreshRef(isHotKeyPressed);

  useWindowEventListener({
    enabled: settings.enabled,
    type: 'focus',
    listener: () => {
      dispatch({ type: 'RESET' });
    },
  });

  useDocumentEventListener({
    enabled: settings.enabled,
    type: 'keydown',
    listener: (event) => {
      if (event.repeat) return;
      if (!isHotKey(event)) return;

      dispatch({ type: 'PRESSED_HOT_KEY' });
    },
  });

  useDocumentEventListener({
    enabled: settings.enabled,
    type: 'keyup',
    listener: (event) => {
      if (!isHotKey(event)) return;

      dispatch({ type: 'RESET' });
    },
  });

  useDocumentEventListener({
    enabled: settings.enabled && isHotKeyPressed,
    type: 'mousemove',
    listener: debounce((event: MouseEvent) => {
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
      if (wordDetails.word === sanitizedWord) return;

      dispatch({ type: 'CHANGED_WORD', word: sanitizedWord });

      const isSupportedWord = (word: string) => /^[A-Za-z\s\_]*$/.test(word);
      if (!isSupportedWord(sanitizedWord)) return;

      chrome.runtime.sendMessage(
        { type: 'word', data: sanitizedWord },
        (response: Pick<WordDetails, 'definition' | 'pronunciations'>) => {
          if (!freshIsHotKeyPressedRef.current) {
            dispatch({ type: 'RESET' });
            return;
          }
          const elementFontSize = parseInt(
            getComputedStyle(elementAtPoint).fontSize,
          );

          dispatch({
            type: 'TRANSLATED_WORD',
            position: {
              left: event.clientX,
              top: event.clientY + window.scrollY + elementFontSize,
            },
            definition: response.definition,
            fontSize: elementFontSize,
            pronunciations: response.pronunciations,
          });
        },
      );
    }, 100),
  });

  const adjustTooltipStyles = (node: HTMLDivElement | null) => {
    if (node === null) return;

    const PADDING = 16;
    const rect = node.getBoundingClientRect();

    const isOverflowingHorizontal =
      rect.width > window.innerWidth - 2 * PADDING;
    if (isOverflowingHorizontal) {
      dispatch({
        type: 'CHANGED_TOOLTIP_STYLES',
        position: { left: PADDING },
        size: { width: window.innerWidth - 2 * PADDING },
      });
      return;
    }

    const isOverflowingRight = rect.right > window.innerWidth - PADDING;
    if (isOverflowingRight) {
      dispatch({
        type: 'CHANGED_TOOLTIP_STYLES',
        position: {
          left: undefined,
          right: PADDING,
        },
      });
      return;
    }

    const isOverflowingVertical =
      rect.height > window.innerHeight - 2 * PADDING;
    if (isOverflowingVertical) {
      dispatch({
        type: 'CHANGED_TOOLTIP_STYLES',
        position: {
          top: window.scrollY + PADDING,
        },
        size: {
          height: window.innerHeight - 2 * PADDING,
        },
      });
    }

    const isOverflowingBottom = rect.bottom > window.innerHeight - PADDING;
    if (isOverflowingBottom) {
      dispatch({
        type: 'CHANGED_TOOLTIP_STYLES',
        position: {
          top:
            rect.top +
            window.scrollY -
            rect.height -
            wordDetails.fontSize * 1.5,
        },
      });
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
