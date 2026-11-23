function getSettings() {
  return new Promise((resolve, reject) =>
    chrome.storage.local
      .get({
        settingsValid: false,
        preferOutdoor: "false",
        intervals_athleteid: "",
        intervals_apikey: "",
      })
      .then((items) =>
        resolve({
          settingsValid: items.settingsValid,
          bearerToken: btoa("API_KEY:" + items.intervals_apikey),
          athleteId: items.intervals_athleteid,
          preferOutdoor: items.preferOutdoor.toLowerCase() === "true",
        })
      )
  );
}
