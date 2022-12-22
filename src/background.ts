import cheerio from 'cheerio';

// Listen for messages from the content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  fetch(`https://dic.daum.net/search.do?q=${message.data}`)
    .then((response) => response.text())
    .then((htmlString) => {
      const $ = cheerio.load(htmlString);
      const searchBox = $('.search_box').first();
      const searchListItems = searchBox.find('.list_search').find('li');
      const searchResult = searchListItems.text();
      sendResponse({ data: searchResult });
    });

  return true;
});

export default {};
