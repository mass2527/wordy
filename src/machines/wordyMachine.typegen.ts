// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  '@@xstate/typegen': true;
  internalEvents: {
    'done.invoke.wordy.enabled.hotkey pressed.WORD_TRANSLATION_REQUESTED:invocation[0]': {
      type: 'done.invoke.wordy.enabled.hotkey pressed.WORD_TRANSLATION_REQUESTED:invocation[0]';
      data: unknown;
      __tip: 'See the XState TS docs to learn how to strongly type this.';
    };
    'done.invoke.wordy.loading:invocation[0]': {
      type: 'done.invoke.wordy.loading:invocation[0]';
      data: unknown;
      __tip: 'See the XState TS docs to learn how to strongly type this.';
    };
    'error.platform.wordy.enabled.hotkey pressed.WORD_TRANSLATION_REQUESTED:invocation[0]': {
      type: 'error.platform.wordy.enabled.hotkey pressed.WORD_TRANSLATION_REQUESTED:invocation[0]';
      data: unknown;
    };
    'error.platform.wordy.loading:invocation[0]': {
      type: 'error.platform.wordy.loading:invocation[0]';
      data: unknown;
    };
    'xstate.init': { type: 'xstate.init' };
    'xstate.stop': { type: 'xstate.stop' };
  };
  invokeSrcNameMap: {
    loadSettings: 'done.invoke.wordy.loading:invocation[0]';
    translateWord: 'done.invoke.wordy.enabled.hotkey pressed.WORD_TRANSLATION_REQUESTED:invocation[0]';
  };
  missingImplementations: {
    actions: never;
    delays: never;
    guards: never;
    services: never;
  };
  eventsCausingActions: {
    assignDetectedWord: 'WORD_DETECTED';
    assignErrorMessage: 'error.platform.wordy.enabled.hotkey pressed.WORD_TRANSLATION_REQUESTED:invocation[0]';
    assignSettings: 'done.invoke.wordy.loading:invocation[0]';
    assignTooltipStyles: 'TOOLTIP_STYLES_CHANGED';
    assignWordDetails: 'done.invoke.wordy.enabled.hotkey pressed.WORD_TRANSLATION_REQUESTED:invocation[0]';
    resetContext:
      | 'ENABLE_TOGGLED'
      | 'RESET'
      | 'SHOW_PRONUNCIATION_INFO_TOGGLED'
      | 'xstate.stop';
    toggleEnable: 'ENABLE_TOGGLED';
    toggleShowPronunciationInfo: 'SHOW_PRONUNCIATION_INFO_TOGGLED';
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {
    isEnabled: 'done.invoke.wordy.loading:invocation[0]';
  };
  eventsCausingServices: {
    loadSettings: 'error.platform.wordy.loading:invocation[0]' | 'xstate.init';
    translateWord: 'WORD_DETECTED';
  };
  matchesStates:
    | 'disabled'
    | 'enabled'
    | 'enabled.hotkey pressed'
    | 'enabled.hotkey pressed.WORD_TRANSLATION_REQUESTED'
    | 'enabled.hotkey pressed.idle'
    | 'enabled.hotkey pressed.word translated'
    | 'enabled.hotkey pressed.word translation failed'
    | 'enabled.hotkey unpressed'
    | 'loading'
    | {
        enabled?:
          | 'hotkey pressed'
          | 'hotkey unpressed'
          | {
              'hotkey pressed'?:
                | 'WORD_TRANSLATION_REQUESTED'
                | 'idle'
                | 'word translated'
                | 'word translation failed';
            };
      };
  tags: never;
}
