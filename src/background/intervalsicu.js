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
  },
};

function formatDateForApi(value) {
  const date = new Date(value);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}T00:00:00`;
}

async function callIcuApi(api, athleteId, token, payload, queryString = "") {
  const url = api.uri.replace("{athleteId}", encodeURIComponent(athleteId)) + queryString;
  const options = {
    method: api.verb,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Basic " + token,
    },
  };

  if (payload !== null && payload !== undefined) {
    options.body = JSON.stringify(payload);
  }

  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(
      "Invalid response status from intervals.icu API: " + response.status
    );
  }

  if (response.status === 204) return {};
  const responseText = await response.text();
  return responseText ? JSON.parse(responseText) : {};
}

function getEventsIcu(settings, fromDate, toDate) {
  const queryString =
    "&oldest=" +
    encodeURIComponent(formatDateForApi(fromDate)) +
    "&newest=" +
    encodeURIComponent(formatDateForApi(toDate));
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
  if (!workouts || workouts.length === 0) return Promise.resolve({});
  updateStatus("Calling intervals.icu to delete workouts");
  return callIcuApi(
    icuApiUris.bulkDelete,
    settings.athleteId,
    settings.bearerToken,
    workouts
  );
}

function updateIcu(workouts, settings) {
  if (!workouts || workouts.length === 0) return Promise.resolve({});
  updateStatus("Calling intervals.icu to sync workouts");
  return callIcuApi(
    icuApiUris.bulkUpsert,
    settings.athleteId,
    settings.bearerToken,
    workouts
  );
}

function mapIcuWorkoutType(workoutType) {
  return systmToIcuWorkoutTypesMap.get(workoutType) || null;
}

function mapIcuWorkoutDescription(workout) {
  const ergLines = Array.isArray(workout.ergWorkout) ? workout.ergWorkout : [];
  return ergLines.length === 0
    ? workout.description
    : [workout.description, ergLines.join("\n")].filter(Boolean).join("\n\n");
}

function createIcuWorkouts(workouts) {
  updateStatus("Creating workouts for intervals.icu");
  return workouts.map(createIcuWorkout);
}

function createIcuWorkout(workout) {
  const icuType = mapIcuWorkoutType(workout.type);
  return {
    name: "Wahoo SYSTM: " + workout.name,
    category: icuType === null ? "NOTE" : "WORKOUT",
    type: icuType ?? workout.type,
    start_date_local: formatDateForApi(workout.plannedDate),
    external_id: workout.agendaId,
    description: mapIcuWorkoutDescription(workout),
  };
}

function createIcuWorkoutDeletes(workouts) {
  updateStatus("Creating workout deletions for intervals.icu");
  return workouts.map(createIcuWorkoutDelete);
}

function createIcuWorkoutDeletesFromMissing(workouts, icuEvents) {
  updateStatus("Creating workout deletions for intervals.icu");
  const agendaIds = new Set(workouts.map((workout) => workout.agendaId));
  return (icuEvents || [])
    .filter((event) => event.external_id != null && !agendaIds.has(event.external_id))
    .map(createIcuEventDelete);
}

function createIcuEventDelete(event) {
  return { external_id: event.external_id };
}

function createIcuWorkoutDelete(workout) {
  return { external_id: workout.agendaId };
}
