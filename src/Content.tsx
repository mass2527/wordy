import { Box } from './components/Box';
import { Button } from './components/Button';
import { Flex } from './components/Flex';
import { Text } from './components/Text';
import {
  StorageChangedEvent,
  useDocumentEventListener,
  useWindowEventListener,
} from './hooks';
import { wordyService } from './machines/wordyMachine';
import { center } from './styles/center';
import { getWordAtMousePoint } from './utils/getWordAtMousePoint';
import { SpeakerLoudIcon } from '@radix-ui/react-icons';

import debounce from 'lodash/debounce';
import { useActor } from '@xstate/react';
import { useEffect } from 'react';

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

function Content() {
  const [state, send] = useActor(wordyService);
  const { wordDetails, tooltipStyles, settings, errorMessage } = state.context;
  const { pronunciations } = wordDetails;

  useEffect(() => {
    const handleStorageChanged: Parameters<
      StorageChangedEvent['addListener']
    >[0] = (changes, currentAreaName) => {
      for (const [currentKey, { newValue, oldValue }] of Object.entries(
        changes,
      )) {
        if (currentKey === 'settings' && currentAreaName === 'local') {
          if (newValue.enabled !== oldValue.enabled) {
            send('ENABLE_TOGGLED');
          }
          if (
            newValue.showPronunciationInfo !== oldValue.showPronunciationInfo
          ) {
            send('SHOW_PRONUNCIATION_INFO_TOGGLED');
          }
        }
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChanged);
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChanged);
    };
  }, [send]);

  useWindowEventListener({
    enabled: state.matches('enabled'),
    type: 'focus',
    listener: () => {
      send('RESET');
    },
  });

  useDocumentEventListener({
    enabled: state.matches('enabled'),
    type: 'keydown',
    listener: (event) => {
      if (event.repeat) return;
      if (!isHotKey(event)) return;

      send('HOTKEY_PRESSED');
    },
  });

  useDocumentEventListener({
    enabled: state.matches('enabled'),
    type: 'keyup',
    listener: (event) => {
      if (!isHotKey(event)) return;

      send('RESET');
    },
  });

  useDocumentEventListener({
    enabled: state.matches('enabled.hotkey pressed'),
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

      const isSupportedWord = (word: string) => /^[A-Za-z\s\_]*$/.test(word);
      if (!isSupportedWord(sanitizedWord)) return;

      const elementFontSize = parseInt(
        getComputedStyle(elementAtPoint).fontSize,
      );
      send({
        type: 'WORD_DETECTED',
        word: sanitizedWord,
        fontSize: elementFontSize,
        position: {
          left: event.clientX + window.scrollX,
          top: event.clientY + window.scrollY + elementFontSize,
        },
      });
    }, 100),
  });

  const adjustTooltipStyles = (node: HTMLDivElement | null) => {
    if (node === null) return;

    const PADDING = 16;
    const rect = node.getBoundingClientRect();

    const collisions = {
      right: rect.right > window.innerWidth - PADDING,
      horizontal: rect.width > window.innerWidth - 2 * PADDING,
      bottom: rect.bottom > window.innerHeight - PADDING,
      vertical: rect.height > window.innerHeight - 2 * PADDING,
    };

    switch (true) {
      case collisions.right:
        send({
          type: 'TOOLTIP_STYLES_CHANGED',
          position: {
            left: undefined,
            right: PADDING - window.scrollX,
          },
        });
        break;
      case collisions.horizontal:
        send({
          type: 'TOOLTIP_STYLES_CHANGED',
          position: {
            left: window.scrollX + PADDING,
            right: PADDING - window.scrollX,
          },
        });
        break;
      case collisions.bottom:
        send({
          type: 'TOOLTIP_STYLES_CHANGED',
          position: {
            top: undefined,
            bottom: PADDING - window.scrollY,
          },
        });
        break;
      case collisions.vertical:
        send({
          type: 'TOOLTIP_STYLES_CHANGED',
          position: {
            top: window.scrollY + PADDING,
            bottom: PADDING - window.scrollY,
          },
        });
        break;
      default:
        break;
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
        whiteSpace: 'nowrap',
      }}
    >
      {state.matches('enabled.hotkey pressed.word translated') && (
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
      {state.matches('enabled.hotkey pressed.word translation failed') && (
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
          }}
          css={{
            bc: '$primary',
            br: '$8',
            p: '$8',
            lh: '1.5',
          }}
        >
          <Flex direction='column'>
            <Text color='neutral200' css={{ fontSize: '$14' }}>
              {errorMessage}
            </Text>
            <Text
              target='_blank'
              rel='noopener noreferrer'
              href={`https://www.google.com/search?q=${wordDetails.word}`}
              as='a'
              color='neutral100'
            >
              {wordDetails.word} 구글 검색
            </Text>
          </Flex>
        </Box>
      )}
    </Box>
  );
}

export default Content;
