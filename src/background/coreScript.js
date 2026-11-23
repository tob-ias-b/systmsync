function isPlanItemValidForUpload(item) {
  let validPlanItem = true;
  if (item === null) validPlanItem = false;
  if (item.prospects === null) validPlanItem = false;
  if (item.plannedDate === null) validPlanItem = false;
  if (item.agendaId === null) validPlanItem = false;
  return validPlanItem;
}

function GetWorkout(settings, planItem, token, userProfile, query, formatter, cacheKeyFactory) {
  let promise = null;

  if (!isPlanItemValidForUpload(planItem)) {
    console.log("Invalid UserPlanQueryItem:");
    console.log(planItem);
    return Promise.resolve(null);
  }

  updateStatus("Getting workout " + planItem.prospects[0].name);

  const wkid = planItem.prospects[0].workoutId;
  const cacheKey = cacheKeyFactory(wkid);

  if (wkid != null && wkid.length > 0) {
    if (workoutsCache.has(cacheKey)) {
      console.log("Workout Cache Hit:" + cacheKey);
      promise = Promise.resolve(workoutsCache.get(cacheKey));
    } else {
      promise = RunSYSTMQuery(query(wkid), token);
    }
  } else {
    promise = Promise.resolve(null);
  }

  return promise.then((data) => {
    const ergWorkout = formatter(data, userProfile.profiles.riderProfile, settings);
    let workout = {
      name: planItem.prospects[0].name,
      type: planItem.prospects[0].type,
      description: planItem.prospects[0].description,
      plannedDate: planItem.plannedDate,
      agendaId: planItem.agendaId,
      ergWorkout: ergWorkout,
    };
    if (wkid != null && wkid.length > 0) {
      workoutsCache.set(cacheKey, data);
    }
    return Promise.resolve(workout);
  });
}

function GetWorkoutGraphTriggers(settings, planItem, userProfile, token) {
  return GetWorkout(
    settings,
    planItem,
    token,
    userProfile,
    workoutGraphTriggersQuery,
    formatWorkoutTriggerToErg,
    (id) => 'O:' + id
  );
}

function GetWorkouts(settings, planItem, userProfile, token) {
  return GetWorkout(
    settings,
    planItem,
    token,
    userProfile,
    getWorkoutsQuery,
    formatWorkoutToErg,
    (id) => 'I:' + id
  );
}

function GetMappedWorkouts(settings, userProfile, fromDate, toDate, useOutdoor, token) {
  const promises = [];

  let dates = getAgendaStartEndDateFromValues(fromDate, toDate);

  updateStatus(
    "Getting items between " + fromDate + " and " + toDate
  );

  return RunSYSTMQuery(
    getUserPlansRangeQuery(dates.startDate, dates.endDate),
    token
  )
    .then((data) => {
      data.userPlan.forEach((item) => {
        if (useOutdoor === true) {
          promises.push(GetWorkoutGraphTriggers(settings, item, userProfile, token));
        } else {
          promises.push(GetWorkouts(settings, item, userProfile, token));
        }
      });
      return Promise.all(promises);
    })
    .then((values) => {
      const workouts = [];
      values.forEach((workout) => {
        if (workout != null) {
          workouts.push(workout);
        }
      });
      return Promise.resolve(workouts);
    });
}

function MoveAgendaItems(fromDate, toDate, shiftDays, token) {
  const promises = [];

  let dates = getAgendaStartEndDateFromValues(fromDate, toDate);

  updateStatus(
    "Moving items between " + dates.startDate + " and " + dates.endDate
  );

  return RunSYSTMQuery(
    getUserPlansRangeQuery(dates.startDate, dates.endDate),
    token
  ).then((data) => {
    data.userPlan.forEach((item) => {
      // As long as theres a plannedDate we can move it
      if (item.plannedDate !== null) {
        let newDate = new Date(Date.parse(item.plannedDate));
        newDate.setDate(newDate.getDate() + shiftDays);
        updateStatus("Updating item agendaID:" + item.agendaId);
        promises.push(
          RunSYSTMQuery(
            getMoveAgendaMutation(
              item.agendaId,
              newDate.toISOString(),
              item.appliedTimeZone
            ),
            token
          )
        );
      }
    });
    return Promise.all(promises);
  });
}

function syncToIcu(message) {
  let settings = null;
  let workouts = null;
  let deleteSync = (message.action === "delete");

  return new Promise((resolve, reject) => {
    getSettings()
      .then((newSettings) => {
        if (newSettings.settingsValid != true) {
          chrome.runtime.openOptionsPage();
          return Promise.resolve();
        }
        settings = newSettings;
        return Promise.resolve();
      })
      .then(() => {
        if (settings != null) {
          getUserProfile()
            .then((data) => {
              return GetMappedWorkouts(
                settings,
                data.userProfile,
                message.fromDate,
                message.toDate,
                message.useOutdoor,
                message.token
              );
            })
            .then((workoutsRetrieved) => {
              workouts = workoutsRetrieved;
              if (deleteSync) {
                let icuWorkoutDeletes = createIcuWorkoutDeletes(workouts);
                return clearIcu(icuWorkoutDeletes, settings);
              } else {
                let icuWorkouts = createIcuWorkouts(workouts);
                return updateIcu(icuWorkouts, settings);
              }
            })
            .then(() => {
              return getEventsIcu(settings, message.fromDate, message.toDate);
            })
            .then((icuEvents) => {
              let icuWorkoutDeletes = createIcuWorkoutDeletesFromMissing(workouts, icuEvents);
              return clearIcu(icuWorkoutDeletes, settings);
            })
            .then(() => {
              resolve();
            })
            .catch((err) => {
              console.log(err);
              reject(err);
            });
        } else {
          resolve();
        }
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
}

function shiftAgenda(message) {
  let settings = null;

  return new Promise((resolve, reject) => {
    getSettings()
      .then((newSettings) => {
        if (newSettings.settingsValid != true) {
          chrome.runtime.openOptionsPage();
          return Promise.resolve();
        }
        settings = newSettings;
        return Promise.resolve();
      })
      .then(() => {
        if (settings != null) {
          getUserProfile()
            .then((data) => {
              return MoveAgendaItems(
                message.fromDate,
                message.toDate,
                message.shiftDays,
                message.token
              );
            })
            .then(() => {
              resolve();
            })
            .catch((err) => {
              console.log(err);
              reject(err);
            });
        } else {
          resolve();
        }
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
}

function updateStatus(statusText) {
  statusUpdatePort.postMessage({ status_text: statusText });
}

var workoutsCache = new Map();
