import { assign, createMachine, interpret } from 'xstate';
import { DeepPartial } from '../utils/DeepPartial';

export type Context = {
  settings: {
    enabled: boolean;
    showPronunciationInfo: boolean;
  };
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
  tooltipStyles: DeepPartial<{
    position: {
      left: number;
      top: number;
      right: number;
      bottom: number;
    };
  }>;
  errorMessage: string;
};

export const INITIAL_CONTEXT = {
  settings: {
    enabled: true,
    showPronunciationInfo: true,
  },
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
  tooltipStyles: {},
  errorMessage: '',
};

const wordyMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QHcD2AnCBPAdAG1QEMIBLAOygGIJUywdyA3VAa3rU1wOPKgSdQBjQgBcStANoAGALrSZiUAAdUsEmNqKQAD0QBmAOxScADgCcegIwGzANhOWzJhwBoQWRLaM4pZgCxmAKzmegBMfuYAvpFuHNj4RKQU1LT0Amw4cVyJvPxkzMIaZPISlgpIICpqRVq6CKEWPjYG5gZ+DU5+tm4eCAC0tpY4QZaBoVItlqEG01K20bEY8dxJVGDo6Bg4SniiAGYYALaZS9k8FHkFouLFsvJaVeo3tYhTfnrDoYFSerbTo2YDIEeog+n5hv5LLYLHopIEoQEzAsQFkcGAyIQAEZ4SCUABKAFEAMoEgAq9wqjxqFTqgJBCEslgcOHadiBzjGBj0yNR6KxOIglAJADkAIIAIQAMgSAPqkgDyAHFFdKACIU5SqJ6aGmvEwGT52cwmPRmH5+Gb0saBFmBKy+E02MwNHmnNEY7G4okACXlAHUZQAFPHy4UAVWFAGEAJKi0nR0My6PCgBi8rlSpVBPVsgeWupoDqBjaLMG31Cfz8flGlnp4UZOFCekCxcBJkCwSkoVdnHd-MgOAAFqgRGwsAACACuZCU6DgsFxvtJAGkCQBNIOEokknPlTXVZ66hkTemjXyG+xTRkmyw9+J8z0QIcjsfj2fzgckCA4yh++V41UZVVMkCUjUlsw1Sp80PQtEACcFLD8H4m3GeFgj0U8AlCHwfjsM1wjNWw-DvXAHwFZ9RzACd31gBcnz-AC5TxUVhSJSU4wTYUZUJABFMNiXA1VKHWTZ0G2XYRAOdBjl5D1yOHSjqLnWiBwYwDSWY1j2PjRNeP4olBMuIRrkkO5c0paCdVghA-BbHBAlsTkWxNU0vFPExQmw6YTFsaEwlGTz5hiFE3TIgcFNfGi6JOTBxxEdBCDIWAJNxNSgJAsCIPM-dtTIF4EH8A09HbMtwi7Gw-Ew50cNc-CAjmYjgtk-snwiqi32U6K4jihKkpSwUFXlSV40DGUDLXaUiRlSNvRYxUsr3KCDysnRXi+IZzChExfFCEqLVPAxLA+JCjpQ0YHG5JrQrk8KX3aqKB26+LEuSkyyHHPZCBIAVf3-QDgPAzLdzzZa8qPQIghZTz-iZJxxjMU9-FsHx7BbLt22sKQTBIvtHwoyLOsepYepeiSbg+r6fsG4bo1G8bJum2bhXm4GLNB-LO3srHRlhCJnWCOtxmRloK3hU0gUQnHSFgFqhTFKVZQVZU1UgqkYNWhl9QvY1TXNS13EQFsbSCe1vkcCGIhxsLWrupSP3ov6mJYtiON0gk+IE7MUjoBh8lYdhrpa-H7sJh3GI053tM47j3f0wyBEKG4Smypbcvy9twW2xDYQ7cwLVrA2GUcm0PIsfwAgMLwXWRMhUAgOAtCyEG06PAvej6RCzFtM9bEMIwWzaHGVl4ZuCw1-VjFCKYvF+Mxze6Qu+g7ezAQaBw2nsWerZuiBR-VuoAlPXwPmdOwUKkWzLsWXtreDidpwe3e2Zb6zdpMHBiveKQpm+OwjoX3o14hisi8MEds0wr4hRvjvO+HV7Z7xWnUQwx0vhY0MBWEwEQDCngrMYKYZhnRdikD8Ms28g5tTtipJ8X4cQILBtZQ6NoL52l8lWU021sGFyOv4HAfwCE7QmF2AhZC8YULgVQnAaUI5aVdlxPSntVR0Pyu0YBqDHQYKwaeXuxhS6z31NCIEgQRHyVtuIrqxNnp9VEJAJRrczy8OsB2cIFYzTwi0YEcEYQYRjG2l47GV1oHkNMY-GKEASZWKKBTb6Njn5jwPnaHwb9GREQ8i2fwdYJhdzNAEQYPlWTdgCfEaWLVbHWTcoXBy79Z5Ai+M6Pu-johAA */
  createMachine(
    {
      id: 'wordy',
      tsTypes: {} as import('./wordyMachine.typegen').Typegen0,
      predictableActionArguments: true,

      schema: {
        context: {} as Context,
        services: {} as {
          loadSettings: {
            data: {
              enabled: boolean;
              showPronunciationInfo: boolean;
            };
          };
          translateWord: {
            data: Pick<Context['wordDetails'], 'definition' | 'pronunciations'>;
          };
        },
        events: {} as
          | {
              type: 'RESET';
            }
          | {
              type: 'HOTKEY_PRESSED';
            }
          | {
              type: 'WORD_DETECTED';
              word: Context['wordDetails']['word'];
              fontSize: Context['wordDetails']['fontSize'];
              position: Context['tooltipStyles']['position'];
            }
          | {
              type: 'TOOLTIP_STYLES_CHANGED';
              position: Context['tooltipStyles']['position'];
            }
          | {
              type: 'ENABLE_TOGGLED';
            }
          | {
              type: 'SHOW_PRONUNCIATION_INFO_TOGGLED';
            },
      },

      context: INITIAL_CONTEXT,

      states: {
        loading: {
          invoke: {
            src: 'loadSettings',

            onDone: [
              {
                target: 'enabled',
                cond: 'isEnabled',
                actions: 'assignSettings',
              },
              {
                target: 'disabled',
                actions: 'assignSettings',
              },
            ],

            onError: {
              target: 'loading',
              internal: true,
            },
          },
        },

        enabled: {
          states: {
            'hotkey unpressed': {
              on: {
                HOTKEY_PRESSED: 'hotkey pressed',
              },
            },

            'hotkey pressed': {
              states: {
                idle: {
                  on: {
                    WORD_DETECTED: {
                      target: 'WORD_TRANSLATION_REQUESTED',
                      actions: 'assignDetectedWord',
                    },
                  },
                },

                WORD_TRANSLATION_REQUESTED: {
                  invoke: {
                    src: 'translateWord',

                    onError: {
                      target: 'word translation failed',
                      actions: 'assignErrorMessage',
                    },

                    onDone: {
                      target: 'word translated',
                      actions: 'assignWordDetails',
                    },
                  },
                },

                'word translated': {
                  on: {
                    WORD_DETECTED: {
                      target: 'WORD_TRANSLATION_REQUESTED',
                      actions: 'assignDetectedWord',
                    },

                    TOOLTIP_STYLES_CHANGED: {
                      target: 'word translated',
                      internal: true,
                      actions: 'assignTooltipStyles',
                    },
                  },
                },

                'word translation failed': {
                  on: {
                    WORD_DETECTED: {
                      target: 'WORD_TRANSLATION_REQUESTED',
                      actions: 'assignDetectedWord',
                    },

                    TOOLTIP_STYLES_CHANGED: {
                      target: 'word translation failed',
                      internal: true,
                      actions: 'assignTooltipStyles',
                    },
                  },
                },
              },

              initial: 'idle',
              exit: 'resetContext',
            },
          },

          initial: 'hotkey unpressed',

          on: {
            RESET: '.hotkey unpressed',

            ENABLE_TOGGLED: {
              target: 'disabled',
              actions: 'toggleEnable',
            },

            SHOW_PRONUNCIATION_INFO_TOGGLED: {
              target: 'enabled',
              internal: true,
              actions: 'toggleShowPronunciationInfo',
            },
          },
        },

        disabled: {
          on: {
            ENABLE_TOGGLED: {
              target: 'enabled',
              actions: 'toggleEnable',
            },
          },
        },
      },

      initial: 'loading',
    },
    {
      services: {
        loadSettings: async () => {
          try {
            const items = await chrome.storage.local.get('settings');
            if (items?.settings) {
              return items.settings;
            }

            return {
              enabled: true,
              showPronunciationInfo: true,
            };
          } catch (error) {}
        },
        // @ts-ignore
        translateWord: async (context, event) => {
          const response: Pick<
            Context['wordDetails'],
            'definition' | 'pronunciations'
          > = await chrome.runtime.sendMessage({
            type: 'word',
            data: event.word,
          });

          if (response.definition === '') {
            return Promise.reject(Error('번역 정보를 찾을 수 없습니다.'));
          }

          return response;
        },
      },
      guards: {
        isEnabled: (_, event) => {
          return event.data.enabled;
        },
      },
      actions: {
        assignSettings: assign({
          settings: (_, event) => {
            return event.data;
          },
        }),
        assignWordDetails: assign({
          wordDetails: (context, event) => ({
            ...context.wordDetails,
            definition: event.data.definition,
            pronunciations: event.data.pronunciations,
          }),
        }),
        assignDetectedWord: assign({
          wordDetails: (context, event) => ({
            ...context.wordDetails,
            word: event.word,
            fontSize: event.fontSize,
          }),
          tooltipStyles: (context, event) => ({
            position: event.position,
          }),
        }),
        resetContext: assign((context, event) => {
          return {
            errorMessage: INITIAL_CONTEXT.errorMessage,
            tooltipStyles: INITIAL_CONTEXT.tooltipStyles,
            wordDetails: INITIAL_CONTEXT.wordDetails,
          };
        }),
        assignTooltipStyles: assign({
          tooltipStyles: (context, event) => ({
            ...context.tooltipStyles,
            position: {
              ...context.tooltipStyles.position,
              ...event.position,
            },
          }),
        }),
        assignErrorMessage: assign({
          errorMessage: (_, event) => {
            return (event.data as Error).message;
          },
        }),
        toggleEnable: assign({
          settings: (context) => {
            return {
              ...context.settings,
              enabled: !context.settings.enabled,
            };
          },
        }),
        toggleShowPronunciationInfo: assign({
          settings: (context) => {
            return {
              ...context.settings,
              showPronunciationInfo: !context.settings.showPronunciationInfo,
            };
          },
        }),
      },
    },
  );

export const wordyService = interpret(wordyMachine);
wordyService.start();
