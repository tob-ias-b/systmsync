document.addEventListener("DOMContentLoaded", function () {
  let syncButton = document.getElementById("sync");
  syncButton.addEventListener("click", function (e) {
    syncClick(e);
  });

  var confirmDeleteDialog = document.getElementById("confirmDeleteDialog");
  let deleteButton = document.getElementById("delete");
  deleteButton.addEventListener("click", function (e) {
    confirmDeleteDialog.showModal();
  });

  let confirmDeleteButton = document.getElementById("deleteConfirm");
  confirmDeleteButton.addEventListener("click", function (e) {
    e.preventDefault();
    confirmDeleteDialog.close("OK");
  });

  confirmDeleteDialog.addEventListener("close", (e) => deleteClick(e));

  var confirmShiftDialog = document.getElementById("confirmShiftDialog");
  let shiftButton = document.getElementById("shift");
  shiftButton.addEventListener("click", function (e) {
    confirmShiftDialog.showModal();
  });

  let confirmShiftButton = document.getElementById("shiftConfirm");
  confirmShiftButton.addEventListener("click", function (e) {
    e.preventDefault();
    confirmShiftDialog.close("OK");
  });

  confirmShiftDialog.addEventListener("close", (e) => shiftClick(e));

  let dateFrom = document.getElementById("dateFrom");
  dateFrom.value = formatDate(Date.now());

  let dateTo = document.getElementById("dateTo");
  dateTo.value = formatDateOffset(Date.now(), 6);

  chrome.runtime.onConnect.addListener(function (port) {
    console.assert(port.name === "sync_status_updates");
    if (port.name === "sync_status_updates") {
      port.onMessage.addListener(function (msg) {
        updateStatus(msg);
        updateStatus(msg);
      });
    }
  });
});

const messageTypes = {
  sync: "sync",
  syncDelete: "delete",
  shift: "shift",
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

function createSyncMessage(mode, token) {
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

function createShiftMessage(mode, token) {
  let from = document.getElementById("dateFrom").value;
  let to = document.getElementById("dateTo").value;
  let shiftDays = parseInt(document.getElementById("shiftDays").value);
  let message = {
    action: mode,
    token: token,
    from: from,
    to: to,
    shiftDays: shiftDays,
  };
  return message;
}

function callSync(messageType) {
  getToken().then((token) => {
    if (token == null) {
      showNoToken();
    } else {
      let message = createSyncMessage(messageType, token);
      chrome.runtime.sendMessage(message);
    }
  });
}

function callShift(messageType) {
  getToken().then((token) => {
    if (token == null) {
      showNoToken();
    } else {
      let message = createShiftMessage(messageType, token);
      chrome.runtime.sendMessage(message);
    }
  });
}

function showNoToken() {
  let dialog = document.getElementById("noTokenDialog");
  dialog.showModal();
}

function syncClick(e) {
  callSync(messageTypes.sync);
}

function syncClick(e) {
  callSync(messageTypes.sync);
}

function deleteClick(e) {
  if (confirmDeleteDialog.returnValue === "OK") {
    callSync(messageTypes.syncDelete);
  }
}

function shiftClick(e) {
  if (confirmShiftDialog.returnValue === "OK") {
    callShift(messageTypes.shift);
  }
}
