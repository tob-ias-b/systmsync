chrome.webNavigation.onHistoryStateUpdated.addListener(
    (details) => {
        if(details.url.startsWith("https://systm.wahoofitness.com/calendar")){
            chrome.tabs.sendMessage(details.tabId, {pageHit: "calendar"});
        }
    }, { pathPrefix: '/calendar', hostEquals: 'systm.wahoofitness.com'}
);

chrome.runtime.onMessage.addListener(function(message) {
    switch (message.action) {
        case "openOptionsPage":
            openOptionsPage();
            break;
        default:
            break;
    }
});

function openOptionsPage(){
    chrome.runtime.openOptionsPage();
}