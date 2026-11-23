const systmToIcuWorkoutTypesMap = new Map();
systmToIcuWorkoutTypesMap.set(
  "MountainBiking",
  icuWorkoutTypes.MountainBikeRide
);
systmToIcuWorkoutTypesMap.set("Running", icuWorkoutTypes.Run);
systmToIcuWorkoutTypesMap.set("Cycling", icuWorkoutTypes.Ride);
systmToIcuWorkoutTypesMap.set("Cyclocross", icuWorkoutTypes.Ride);
systmToIcuWorkoutTypesMap.set("Strength", icuWorkoutTypes.WeightTraining);
systmToIcuWorkoutTypesMap.set("Yoga", icuWorkoutTypes.Yoga);
systmToIcuWorkoutTypesMap.set("Swimming", icuWorkoutTypes.Swim);

function RunSYSTMQuery(query, token) {
  return new Promise(function (resolve, reject) {
    let payload = JSON.stringify(query);
    let req = new Request("https://api.thesufferfest.com/graphql", {
      method: "POST",
      body: payload,
    });
    req.headers.set("Content-Type", "application/json");
    req.headers.set("Authorization", "Bearer " + token);

    fetch(req).then((response) => {
      if (response.ok) {
        response.json().then((body) => {
          resolve(body.data);
        });
      } else {
        reject(
          "Invalid response status from sufferfest api:" + response.status
        );
      }
    });
  });
}
