chrome.webNavigation.onHistoryStateUpdated.addListener(
    (details) => {
        if(details.url.startsWith("https://systm.wahoofitness.com/calendar")){
            console.log('history:' + details.url);
        }
    }
)