import cheerio from 'cheerio';
import { WordDetails } from './Content';

// Listen for messages from the content script
chrome.runtime.onMessage.addListener(
  (
    message,
    sender,
    sendResponse: (
      response: Pick<WordDetails, 'definition' | 'pronunciations'>,
    ) => void,
  ) => {
    fetch(`https://dic.daum.net/search.do?q=${message.data}`)
      .then((response) => response.text())
      .then((htmlString) => {
        const $ = cheerio.load(htmlString);
        const searchBox = $('.search_box').first();
        const searchListItems = searchBox
          .find('.list_search')
          .first()
          .find('li');
        const searchResult = searchListItems.text();
        const listenElement = $('.wrap_listen').first();
        const pronounceElement = listenElement.find('.txt_pronounce');
        const americanSymbol = pronounceElement.first().text();
        const britishSymbol = pronounceElement.last().text();

        const anchorElement = listenElement.find('a[data-audio]');
        const americanHref = anchorElement.first().attr('href') || '';
        const britishHref = anchorElement.last().attr('href') || '';

        const pronunciations = {
          american: {
            symbol: americanSymbol,
            href: americanHref.replace('http://', 'https://'),
          },
          british: {
            symbol: britishSymbol,
            href: britishHref.replace('http://', 'https://'),
          },
        };

        sendResponse({ definition: searchResult, pronunciations });
      });

    return true;
  },
);

export default {};
