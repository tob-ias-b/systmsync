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
}

function handleIcuClick(e) {
  const bearerTokenItem = window.localStorage.getItem("SYSTM/user/token");
  const bearerToken = Array.isArray(bearerTokenItem)
    ? bearerTokenItem.join(".")
    : bearerTokenItem;
  chrome.runtime.sendMessage({ action: "openPopup", systmToken: bearerToken });
  return;
}

function createInitTimer() {
  return setTimeout(() => {
    initCalendarPage();
  }, 1000);
}

function resetInitTimer() {
  initTimer = createInitTimer();
}

let initTimer = createInitTimer();
