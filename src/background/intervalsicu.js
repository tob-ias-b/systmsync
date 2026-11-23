const icuWorkoutTypes = {
  Ride: "Ride",
  MountainBikeRide: "MountainBikeRide",
  GravelRide: "GravelRide",
  Run: "Run",
  TrailRun: "TrailRun",
  Swim: "Swim",
  VirtualRide: "VirtualRide",
  VirtualRun: "VirtualRun",
  WeightTraining: "WeightTraining",
  Hike: "Hike",
  Walk: "Walk",
  AlpineSki: "AlpineSki",
  Badminton: "Badminton",
  BackcountrySki: "BackcountrySki",
  Canoeing: "Canoeing",
  Crossfit: "Crossfit",
  EBikeRide: "EBikeRide",
  EMountainBikeRide: "EMountainBikeRide",
  Elliptical: "Elliptical",
  Golf: "Golf",
  Handcycle: "Handcycle",
  HighIntensityIntervalTraining: "HighIntensityIntervalTraining",
  Hockey: "Hockey",
  IceSkate: "IceSkate",
  InlineSkate: "InlineSkate",
  Kayaking: "Kayaking",
  Kitesurf: "Kitesurf",
  NordicSki: "NordicSki",
  OpenWaterSwim: "OpenWaterSwim",
  Pilates: "Pilates",
  Padel: "Padel",
  Pickleball: "Pickleball",
  Racquetball: "Racquetball",
  RockClimbing: "RockClimbing",
  RollerSki: "RollerSki",
  Rowing: "Rowing",
  VirtualRow: "VirtualRow",
  Rugby: "Rugby",
  Sail: "Sail",
  Skateboard: "Skateboard",
  Snowboard: "Snowboard",
  Snowshoe: "Snowshoe",
  Soccer: "Soccer",
  Squash: "Squash",
  StairStepper: "StairStepper",
  StandUpPaddling: "StandUpPaddling",
  Surfing: "Surfing",
  TableTennis: "TableTennis",
  Tennis: "Tennis",
  Transition: "Transition",
  Velomobile: "Velomobile",
  WaterSport: "WaterSport",
  Wheelchair: "Wheelchair",
  Windsurf: "Windsurf",
  Workout: "Workout",
  Yoga: "Yoga",
  Other: "Other",
};

const icuApiUris = {
  bulkDelete: {
    verb: "PUT",
    uri: "https://intervals.icu/api/v1/athlete/{athleteId}/events/bulk-delete",
  },
  bulkUpsert: {
    verb: "POST",
    uri: "https://intervals.icu/api/v1/athlete/{athleteId}/events/bulk?upsert=true",
  },
  listEvents: {
    verb: "GET",
    uri: "https://intervals.icu/api/v1/athlete/{athleteId}/eventsjson?resolve=false",
  }
};

function formatDateForApi(value) {
  let theDate = new Date(value);
  return theDate.getFullYear() + '-' + (theDate.getMonth() + 1) + '-' + theDate.getDate() + 'T00:00:00';
}

function callIcuApi(icuApiUri, athleteId, token, message, queryString) {
  const formattedUri = icuApiUri.uri.replace("{athleteId}", athleteId) + queryString;
  let req = null;

  return new Promise(function (resolve, reject) {
    if(icuApiUri.verb === "PUT" || icuApiUri.verb === "POST"){
      let payload = JSON.stringify(message);
      req = new Request(formattedUri, {
        method: icuApiUri.verb,
        body: payload,
      });
    } else {
      req = new Request(formattedUri, {
        method: icuApiUri.verb
      });
    }
    req.headers.set("Content-Type", "application/json");
    req.headers.set("Authorization", "Basic " + token);

    fetch(req).then((response) => {
      if (response.ok) {
        response.json().then((body) => {
          resolve(body);
        });
      } else {
        reject(
          "Invalid response status from intervals.icu api:" + response.status
        );
      }
    });
  });
}

function getEventsIcu(settings, fromDate, toDate) {
  let queryString = '&oldest=' + formatDateForApi(fromDate) + '&newest=' + formatDateForApi(toDate);
  updateStatus("Calling intervals.icu to get events");
  return callIcuApi(
    icuApiUris.listEvents,
    settings.athleteId,
    settings.bearerToken,
    null,
    queryString
  );
}

function clearIcu(workouts, settings) {
  if (workouts === null || workouts.length === 0) {
    // Nothing to do
    return Promise.resolve({});
  }
  updateStatus("Calling intervals.icu to delete workouts");
  return callIcuApi(
    icuApiUris.bulkDelete,
    settings.athleteId,
    settings.bearerToken,
    workouts,
    ''
  );
}

function updateIcu(workouts, settings) {
  if (workouts === null || workouts.length === 0) {
    // Nothing to do
    return Promise.resolve({});
  }
  updateStatus("Calling intervals.icu to sync workouts");
  return callIcuApi(
    icuApiUris.bulkUpsert,
    settings.athleteId,
    settings.bearerToken,
    workouts,
    ''
  );
}

function mapIcuWorkoutType(workoutType) {
  if (systmToIcuWorkoutTypesMap.has(workoutType)) {
    return systmToIcuWorkoutTypesMap.get(workoutType);
  } else {
    return null;
  }
}

function mapIcuWorkoutDescription(workout) {
  if (workout.ergWorkout.length == 0) {
    return workout.description;
  } else {
    return workout.description + "\n\n" + workout.ergWorkout.join("\n");
  }
}

function createIcuWorkouts(workouts) {
  updateStatus("Creating workouts for intervals.icu");
  const icuWorkouts = [];
  workouts.forEach((item) => {
    icuWorkouts.push(createIcuWorkout(item));
  });
  return icuWorkouts;
}

function createIcuWorkout(workout) {
  const icuType = mapIcuWorkoutType(workout.type);
  return {
    name: "Wahoo SYSTM: " + workout.name,
    category: icuType == null ? "NOTE" : "WORKOUT",
    type: icuType ?? workout.type,
    start_date_local: formatDateForApi(new Date(workout.plannedDate)),
    external_id: workout.agendaId,
    description: mapIcuWorkoutDescription(workout),
  };
}

function createIcuWorkoutDeletes(workouts) {
  updateStatus("Creating workout deletions for intervals.icu");
  const icuWorkouts = [];
  workouts.forEach((item) => {
    icuWorkouts.push(createIcuWorkoutDelete(item));
  });
  return icuWorkouts;
}

function createIcuWorkoutDeletesFromMissing(workouts, icuEvents) {
  updateStatus("Creating workout deletions for intervals.icu");
  const icuWorkouts = [];
  icuEvents.forEach((item) => {
    if(item.external_id !== null){
      console.log('Looking for ' + item.external_id)
      let isExist = workouts.find((workout) => workout.agendaId === item.external_id)
      if(typeof isExist === 'undefined'){
        console.log('Did not find ' + item.external_id + ' so deleting.');
        icuWorkouts.push(createIcuEventDelete(item));
      } else {
        console.log('Found item ' + isExist.agendaId + ' ' + isExist.name);
      }  
    }
  });
  return icuWorkouts;
}

function createIcuEventDelete(event) {
  return {
    external_id: event.external_id,
  };
}

function createIcuWorkoutDelete(workout) {
  return {
    external_id: workout.agendaId,
  };
}
