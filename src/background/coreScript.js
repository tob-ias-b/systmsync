function isPlanItemValidForUpload(item) {
  return Boolean(
    item &&
      Array.isArray(item.prospects) &&
      item.prospects.length > 0 &&
      item.prospects[0] &&
      item.plannedDate &&
      item.agendaId
  );
}

function getWorkout(settings, planItem, token, userProfile, query, formatter, cacheKeyFactory) {
  if (!isPlanItemValidForUpload(planItem)) {
    console.warn("Skipping invalid SYSTM plan item:", planItem);
    return Promise.resolve(null);
  }

  const prospect = planItem.prospects[0];
  updateStatus("Getting workout " + prospect.name);

  const workoutId = prospect.workoutId;
  const cacheKey = workoutId ? cacheKeyFactory(workoutId) : null;
  const workoutPromise = !workoutId
    ? Promise.resolve(null)
    : workoutsCache.has(cacheKey)
      ? Promise.resolve(workoutsCache.get(cacheKey))
      : RunSYSTMQuery(query(workoutId), token).then((data) => {
          workoutsCache.set(cacheKey, data);
          return data;
        });

  return workoutPromise.then((data) => ({
    name: prospect.name,
    type: prospect.type,
    description: prospect.description,
    plannedDate: planItem.plannedDate,
    agendaId: planItem.agendaId,
    ergWorkout: formatter(
      data,
      userProfile.profiles.riderProfile,
      settings
    ),
  }));
}

function getWorkoutGraphTriggers(settings, planItem, userProfile, token) {
  return getWorkout(
    settings,
    planItem,
    token,
    userProfile,
    workoutGraphTriggersQuery,
    formatWorkoutTriggerToErg,
    (id) => "O:" + id
  );
}

function getWorkouts(settings, planItem, userProfile, token) {
  return getWorkout(
    settings,
    planItem,
    token,
    userProfile,
    getWorkoutsQuery,
    formatWorkoutToErg,
    (id) => "I:" + id
  );
}

async function getMappedWorkouts(settings, userProfile, fromDate, toDate, useOutdoor, token) {
  const dates = getAgendaStartEndDateFromValues(fromDate, toDate);
  updateStatus("Getting items between " + fromDate + " and " + toDate);

  const data = await RunSYSTMQuery(
    getUserPlansRangeQuery(dates.startDate, dates.endDate),
    token
  );
  const mapPlanItem = useOutdoor ? getWorkoutGraphTriggers : getWorkouts;
  const workouts = await Promise.all(
    (data.userPlan || []).map((item) =>
      mapPlanItem(settings, item, userProfile, token)
    )
  );

  return workouts.filter(Boolean);
}

async function moveAgendaItems(fromDate, toDate, shiftDays, token) {
  const dates = getAgendaStartEndDateFromValues(fromDate, toDate);
  updateStatus("Moving items between " + dates.startDate + " and " + dates.endDate);

  const data = await RunSYSTMQuery(
    getUserPlansRangeQuery(dates.startDate, dates.endDate),
    token
  );
  const itemsToMove = (data.userPlan || []).filter(
    (item) => item.plannedDate && item.agendaId
  );

  return Promise.all(
    itemsToMove.map((item) => {
      const newDate = new Date(item.plannedDate);
      newDate.setDate(newDate.getDate() + Number(shiftDays));
      updateStatus("Updating item agendaID:" + item.agendaId);
      return RunSYSTMQuery(
        getMoveAgendaMutation(
          item.agendaId,
          newDate.toISOString(),
          item.appliedTimeZone
        ),
        token
      );
    })
  );
}

async function syncToIcu(message) {
  const settings = await getSettings();
  if (!settings.settingsValid) {
    chrome.runtime.openOptionsPage();
    return;
  }

  const profileData = await getUserProfile();
  const workouts = await getMappedWorkouts(
    settings,
    profileData.userProfile,
    message.fromDate,
    message.toDate,
    message.useOutdoor,
    message.token
  );

  if (message.action === "delete") {
    await clearIcu(createIcuWorkoutDeletes(workouts), settings);
  } else {
    await updateIcu(createIcuWorkouts(workouts), settings);
  }

  const icuEvents = await getEventsIcu(settings, message.fromDate, message.toDate);
  const staleWorkouts = createIcuWorkoutDeletesFromMissing(workouts, icuEvents);
  await clearIcu(staleWorkouts, settings);
}

async function shiftAgenda(message) {
  const settings = await getSettings();
  if (!settings.settingsValid) {
    chrome.runtime.openOptionsPage();
    return;
  }

  await moveAgendaItems(
    message.fromDate,
    message.toDate,
    message.shiftDays,
    message.token
  );
}

function updateStatus(statusText) {
  if (statusUpdatePort) {
    statusUpdatePort.postMessage({ status_text: statusText });
  }
}

const workoutsCache = new Map();
