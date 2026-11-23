document.addEventListener("DOMContentLoaded", function () {
  var syncButton = document.getElementById("sync");
  syncButton.addEventListener("click", function (e) {
    syncClick(e);
  });
  var deleteButton = document.getElementById("delete");
  deleteButton.addEventListener("click", function (e) {
    deleteClick(e);
  });
  let dateFrom = document.getElementById("dateFrom");
  dateFrom.value = formatDate(Date.now());
  let dateTo = document.getElementById("dateTo");
  dateTo.value = formatDateOffset(Date.now(), 6);
  chrome.runtime.onConnect.addListener(function (port) {
    console.assert(port.name === "sync_status_updates");
    if (port.name === "sync_status_updates") {
      port.onMessage.addListener(function (msg) {
        updateStatus(msg);
      });
    }
  });
});

const messageTypes = {
  sync: "sync",
  syncDelete: "delete",
};

function updateStatus(msg) {
  let statusElement = document.getElementById("status");
  statusElement.innerText = msg.status_text;
}

function formatDate(dateNowVal) {
  let dateNow = new Date(dateNowVal);
  let formattedDate =
    dateNow.getFullYear() +
    "-" +
    prefix("0", 2, dateNow.getMonth() + 1) +
    "-" +
    prefix("0", 2, dateNow.getDate());
  return formattedDate;
}

function formatDateOffset(dateNowVal, offset) {
  let dateNow = new Date(dateNowVal);
  dateNow.setDate(dateNow.getDate() + offset);
  let formattedDate = formatDate(dateNow);
  return formattedDate;
}

function prefix(char, len, val) {
  return (char.repeat(len) + val).slice(-len);
}

function getToken() {
  return new Promise((resolve, reject) => {
    chrome.storage.session.get({ systmToken: null }).then((values) => {
      resolve(values.systmToken);
    });
  });
}

function createMessage(mode, token) {
  let from = document.getElementById("dateFrom").value;
  let to = document.getElementById("dateTo").value;
  let message = {
    action: mode,
    token: token,
    from: from,
    to: to,
  };
  return message;
}

function callSync(messageType) {
  getToken().then((token) => {
    if (token == null) {
      alert(
        "No SYSTM login token.  Go to the calendar page in SYSTM and login."
      );
    } else {
      let message = createMessage(messageType, token);
      chrome.runtime.sendMessage(message);
    }
  });
}

function syncClick(e) {
  callSync(messageTypes.sync);
}

function deleteClick(e) {
  if (
    confirm(
      "Are you sure you want to delete SYSTM workouts from Intervals.icu?"
    )
  ) {
    callSync(messageTypes.syncDelete);
  }
}
