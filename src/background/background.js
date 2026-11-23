importScripts("query.js");
importScripts("settings.js");
importScripts("utils.js");
importScripts("intervalsicu.js");
importScripts("systm.js");
importScripts("coreScript.js");

chrome.runtime.onMessage.addListener(function (message) {
  switch (message.action) {
    case "openOptionsPage":
      openOptionsPage();
      break;
    case "openPopup":
      openPopup(message);
      break;
    case "sync":
      sync(message);
      break;
    case "delete":
      deleteSync(message);
      break;
    default:
      break;
  }
});

function openOptionsPage() {
  chrome.runtime.openOptionsPage();
}

function openPopup(message) {
  chrome.storage.session.set({ systmToken: message.systmToken });
  chrome.action.openPopup();
}

function sync(message) {
  let dates = getAgendaStartEndDateFromValues(message.from, message.to);
  statusUpdatePort = chrome.runtime.connect({ name: "sync_status_updates" });
  handleIcuClick(dates, message.token, false)
    .then(() => {
      updateStatus("Sync Complete");
      statusUpdatePort.disconnect();
    })
    .catch((err) => {
      updateStatus("Error:" + err);
      statusUpdatePort.disconnect();
    });
}

function deleteSync(message) {
  let dates = getAgendaStartEndDateFromValues(message.from, message.to);
  statusUpdatePort = chrome.runtime.connect({ name: "sync_status_updates" });
  handleIcuClick(dates, message.token, true)
    .then(() => {
      updateStatus("Sync Complete");
      statusUpdatePort.disconnect();
    })
    .catch((err) => {
      updateStatus("Error:" + err);
      statusUpdatePort.disconnect();
    });
}

var statusUpdatePort = null;
