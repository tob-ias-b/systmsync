function initCalendarPage() {
  let icuButton = document.querySelector('[data-test="SyncICU"]');
  if (icuButton != null) {
    return;
  }

  const sourceButton = document.querySelector(
    '[data-test="calendarAddTrainingPlan"]'
  );


  if (sourceButton == null) {
    resetInitTimer();
    return;
  }

  icuButton = sourceButton.cloneNode(true);
  icuButton.setAttribute("data-test", "SyncICU");
  icuButton.style.marginLeft = "8px";
  icuButton.addEventListener("click", handleIcuClick);
  sourceButton.insertAdjacentElement("afterend", icuButton);
  icuButton.querySelector("span").innerText = ".icu";

  let token = getToken();
  chrome.runtime.sendMessage({ action: 'setToken', systmToken: token });

  let userProfile = getUserProfile();
  chrome.runtime.sendMessage({ action: 'setUserProfile', userProfile: userProfile });
}

function getToken() {
function getToken() {
  const bearerTokenItem = window.localStorage.getItem("SYSTM/user/token");
  const bearerToken = Array.isArray(bearerTokenItem)
    ? bearerTokenItem.join(".")
    : bearerTokenItem;

  return bearerToken;
}

function getUserProfile() {
  const value = window.localStorage.getItem("SYSTM/user");
  return JSON.parse(value);
}

function handleIcuClick(e) {
  chrome.runtime.sendMessage({ action: 'openPopup' });
}

function createInitTimer() {
  return setTimeout(() => {
    initCalendarPage();
  }, 1000);
}

function resetInitTimer() {
  initTimer = createInitTimer();
}

function pageInit() {
  initTimer = createInitTimer();
}
var initTimer = null;

window.addEventListener("pageshow", pageInit, true);
function pageInit() {
  initTimer = createInitTimer();
}
var initTimer = null;

window.addEventListener("pageshow", pageInit, true);
