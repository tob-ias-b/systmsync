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
      sync(message);
      break;
    case "delete":
      deleteSync(message);
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
  let dates = getAgendaStartEndDateFromValues(message.from, message.to);
  statusUpdatePort = chrome.runtime.connect({ name: "sync_status_updates" });
  syncToIcu(dates, message.token, false)
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
  syncToIcu(dates, message.token, true)
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
  let dates = getAgendaStartEndDateFromValues(message.from, message.to);
  statusUpdatePort = chrome.runtime.connect({ name: "sync_status_updates" });
  shiftAgenda(dates, message.shiftDays, message.token, true)
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
