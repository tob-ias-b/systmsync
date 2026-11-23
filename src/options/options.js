// Saves options to chrome.storage
const saveOptions = () => {
  const applyOutdoorPowerRange = document.getElementById("applyOutdoorPowerRange").value;

  const intervals_athleteid = document.getElementById(
    "intervals_athleteid"
  ).value;
  const intervals_apikey = document.getElementById("intervals_apikey").value;
  let formValid = true;

  if (applyOutdoorPowerRange != "false" && applyOutdoorPowerRange != "true") {
    document.getElementById("applyoutdoorpowerrange_error").innerText =
      "Invalid outdoor power range choice";
    formValid = false;
  } else {
    document.getElementById("applyoutdoorpowerrange_error").innerText = "";
  }

  if (intervals_athleteid.length < 1) {
    document.getElementById("athleteid_error").innerText = "Invalid athlete id";
    formValid = false;
  } else {
    document.getElementById("athleteid_error").innerText = "";
  }

  if (intervals_apikey.length < 1) {
    document.getElementById("apikey_error").innerText = "Invalid api key";
    formValid = false;
  } else {
    document.getElementById("apikey_error").innerText = "";
  }

  if (formValid) {
    chrome.storage.local.set(
      {
        settingsValid: true,
        applyOutdoorPowerRange: applyOutdoorPowerRange,
        intervals_athleteid: intervals_athleteid,
        intervals_apikey: intervals_apikey,
      },
      () => {
        // Update status to let user know options were saved.
        const status = document.getElementById("status");
        status.textContent = "Options saved.";
        setTimeout(() => {
          status.textContent = "";
        }, 1000);
      }
    );
  }
};

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
const restoreOptions = () => {
  chrome.storage.local.get(
    { applyOutdoorPowerRange: true, intervals_athleteid: "", intervals_apikey: "" },
    (items) => {
      document.getElementById("applyOutdoorPowerRange").value = items.applyOutdoorPowerRange;
      document.getElementById("intervals_athleteid").value =
        items.intervals_athleteid;
      document.getElementById("intervals_apikey").value =
        items.intervals_apikey;
    }
  );
};

document.addEventListener("DOMContentLoaded", restoreOptions);
document.getElementById("save").addEventListener("click", saveOptions);
