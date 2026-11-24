const systmToIcuWorkoutTypesMap = new Map([
  ["MountainBiking", icuWorkoutTypes.MountainBikeRide],
  ["Running", icuWorkoutTypes.Run],
  ["Cycling", icuWorkoutTypes.Ride],
  ["Cyclocross", icuWorkoutTypes.Ride],
  ["Strength", icuWorkoutTypes.WeightTraining],
  ["Yoga", icuWorkoutTypes.Yoga],
  ["Swimming", icuWorkoutTypes.Swim],
]);

async function runSystmQuery(query, token) {
  const response = await fetch("https://api.thesufferfest.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify(query),
  });

  if (!response.ok) {
    throw new Error(
      "Invalid response status from SYSTM API: " + response.status
    );
  }

  const body = await response.json();
  if (body.errors && body.errors.length > 0) {
    throw new Error(body.errors.map((error) => error.message).join("; "));
  }
  return body.data;
}

function RunSYSTMQuery(query, token) {
  return runSystmQuery(query, token);
}

function getToken() {
  return chrome.storage.session.get({ systmToken: null }).then((values) => values.systmToken);
}

function getUserProfile() {
  return chrome.storage.session.get({ userProfile: null });
}
