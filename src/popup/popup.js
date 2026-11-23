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
        let statusElement = document.getElementById("status");
        statusElement.innerText = msg.status_text;
      });
    }
  });
});

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

function syncClick(e) {
  let from = document.getElementById("dateFrom").value;
  let to = document.getElementById("dateTo").value;
  chrome.storage.session.get({ systmToken: null }, (values) => {
    if (values.systmToken != null) {
      chrome.runtime.sendMessage({
        action: "sync",
        token: values.systmToken,
        from: from,
        to: to,
      });
    }
  });
}

function deleteClick(e) {
  if (
    confirm(
      "Are you sure you want to delete SYSTM workouts from Intervals.icu?"
    )
  ) {
    let from = document.getElementById("dateFrom").value;
    let to = document.getElementById("dateTo").value;
    chrome.storage.session.get({ systmToken: null }, (values) => {
      if (values.systmToken != null) {
        chrome.runtime.sendMessage({
          action: "delete",
          token: values.systmToken,
          from: from,
          to: to,
        });
      }
    });
  }
}
