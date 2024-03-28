# [Wordy - English to Korean Tooltip Translator](https://chromewebstore.google.com/detail/wordy-%EC%98%81%EC%96%B4-%EB%8B%A8%EC%96%B4-%EB%A7%88%EC%9A%B0%EC%8A%A4-%ED%88%B4%ED%8C%81-%EB%B2%88%EC%97%AD-%EB%AF%B8%EA%B5%AD%EC%98%81/mklfpioabebeengggdpanllkjjcpjoja?hl=ko&authuser=0)

![showcase](/public/showcase.gif)

## Introduction

Wordy is a Chrome extension designed to provide instant translations from English to Korean. Whether you're browsing documentation, blogs, or any English content online, Wordy makes it easy to understand unfamiliar words without interrupting your reading flow.

## Features

- Translate English words to Korean instantly.
- Obtain pronunciation and definitions for specific words.
- Supports both USA and British English pronunciation.

## How to Use

1. **Download the extension** from the [Chrome Web Store link](https://chromewebstore.google.com/detail/wordy-%EC%98%81%EC%96%B4-%EB%8B%A8%EC%96%B4-%EB%A7%88%EC%9A%B0%EC%8A%A4-%ED%88%B4%ED%8C%81-%EB%B2%88%EC%97%AD-%EB%AF%B8%EA%B5%AD%EC%98%81/mklfpioabebeengggdpanllkjjcpjoja?hl=ko&authuser=0).
2. **Browse English content**: Visit any website with English text.
3. **Activate translation**:
   - Mac Users: Hover over a word while pressing the **Command** key.
   - Windows Users: Hover over a word while pressing the **Ctrl** key.
4. **Explore**: Enjoy seamless translation and learning as you browse the web.

## How Does This Extension Work

![overview](/public/overview.png)

Wordy utilizes [content scripts](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts) to detect hovered words while the user holds down a specified command key. Upon detection, the [background script](https://developer.chrome.com/docs/extensions/mv2/background-pages) communicates with [Daum dictionary](https://dic.daum.net/index.do) to fetch the translation, pronunciation, and definition of the word. The translated information is then displayed in a tooltip for the user's convenience.
