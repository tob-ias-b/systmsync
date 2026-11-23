function isPlanItemValidForUpload(item) {
  let validPlanItem = true;
  if (item === null) validPlanItem = false;
  if (item.prospects === null) validPlanItem = false;
  if (item.plannedDate === null) validPlanItem = false;
  if (item.agendaId === null) validPlanItem = false;
  return validPlanItem;
}

function GetWorkout(settings, planItem, token, userProfile, query, formatter) {
  let promise = null;

  if (!isPlanItemValidForUpload(planItem)) {
    console.log("Invalid UserPlanQueryItem:");
    console.log(planItem);
    return Promise.resolve(null);
  }

  updateStatus("Getting workout " + planItem.prospects[0].name);

  const wkid = planItem.prospects[0].workoutId;
  const cacheKey = settings.preferOutdoor + ":" + wkid;

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
    const ergWorkout = formatter(data, settings.preferOutdoor, userProfile);
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

function GetWorkoutGraphTriggers(settings, planItem, token) {
  return GetWorkout(
    settings,
    planItem,
    token,
    null,
    workoutGraphTriggersQuery,
    formatWorkoutTriggerToErg
  );
}

function GetWorkouts(settings, planItem, userProfile, token) {
  return GetWorkout(
    settings,
    planItem,
    token,
    userProfile,
    getWorkoutsQuery,
    formatWorkoutToErg
  );
}

function GetMappedWorkouts(settings, userProfile, dates, token) {
  const promises = [];

  updateStatus(
    "Getting items between " + dates.startDate + " and " + dates.endDate
  );

  return RunSYSTMQuery(
    getUserPlansRangeQuery(dates.startDate, dates.endDate),
    token
  )
    .then((data) => {
      data.userPlan.forEach((item) => {
        if (settings.preferOutdoor === true) {
          promises.push(GetWorkoutGraphTriggers(settings, item, token));
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

function GetUserProfile(token) {
  return RunSYSTMQuery(getUserProfileQuery(), token);
}

function handleIcuClick(dates, token, deleteSync) {
  let settings = null;

  return new Promise((resolve, reject) => {
    getSettings()
      .then((newSettings) => {
        if (newSettings.settingsValid != true) {
          chrome.runtime.sendMessage({ action: "openOptionsPage" });
          return Promise.resolve();
        }
        settings = newSettings;
        return Promise.resolve();
      })
      .then(() => {
        if (settings != null) {
          GetUserProfile(token)
            .then((data) => {
              return GetMappedWorkouts(
                settings,
                data.userProfile,
                dates,
                token
              );
            })
            .then((workouts) => {
              if (deleteSync) {
                let icuWorkoutDeletes = createIcuWorkoutDeletes(workouts);
                return clearIcu(icuWorkoutDeletes, settings);
              } else {
                let icuWorkouts = createIcuWorkouts(workouts);
                return updateIcu(icuWorkouts, settings);
              }
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
