chrome.runtime.onMessage.addListener(function (message) {
  switch (message.action) {
    case "setToken":
      setToken(message);
      break;
    case "setUserProfile":
      setUserProfile(message);
      break;
    case "openOptionsPage":
      openOptionsPage();
      break;
    case "openPopup":
      openPopup();
      break;
    case "sync":
    case "delete":
      sync(message);
      break;
    case "shift":
      shift(message);
      break;
    default:
      break;
  }
});

function openOptionsPage() {
  chrome.runtime.openOptionsPage();
}

function setToken(message) {
function setToken(message) {
  chrome.storage.session.set({ systmToken: message.systmToken });
}

function setUserProfile(message) {
  chrome.storage.session.set({ userProfile: message.userProfile });
}

function openPopup() {
  chrome.action.openPopup();
}

function sync(message) {
  statusUpdatePort = chrome.runtime.connect({ name: "sync_status_updates" });
  syncToIcu(message)
    .then(() => {
      updateStatus("Sync Complete");
      statusUpdatePort.disconnect();
    })
    .catch((err) => {
      updateStatus("Error:" + err);
      statusUpdatePort.disconnect();
    });
}

function shift(message) {
  statusUpdatePort = chrome.runtime.connect({ name: "sync_status_updates" });
  shiftAgenda(message)
    .then(() => {
      updateStatus("Shift Complete");
      statusUpdatePort.disconnect();
    })
    .catch((err) => {
      updateStatus("Error:" + err);
      statusUpdatePort.disconnect();
    });
}

var statusUpdatePort = null;
