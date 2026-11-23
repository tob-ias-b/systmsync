const systmToIcuWorkoutTypesMap = new Map();
systmToIcuWorkoutTypesMap.set("MountainBiking", icuWorkoutTypes.MountainBikeRide);
systmToIcuWorkoutTypesMap.set("Running", icuWorkoutTypes.Run);
systmToIcuWorkoutTypesMap.set("Cycling", icuWorkoutTypes.Ride);
systmToIcuWorkoutTypesMap.set("Cyclocross", icuWorkoutTypes.Ride);
systmToIcuWorkoutTypesMap.set("Strength", icuWorkoutTypes.WeightTraining);
systmToIcuWorkoutTypesMap.set("Yoga", icuWorkoutTypes.Yoga);
systmToIcuWorkoutTypesMap.set("Swimming", icuWorkoutTypes.Swim);

function RunSYSTMQuery(query) {

    // Credit original version to developer of "SYSTM Fit Export" extension
    return new Promise(function (resolve, reject) {
        // At least in Firefox, the bearer token is (now) stored as an array, instead of
        // dot-separated string, so combine it back into string format
        const bearerTokenItem = window.localStorage.getItem("SYSTM/user/token");
        const bearerToken = Array.isArray(bearerTokenItem) ? bearerTokenItem.join(".") : bearerTokenItem;

        const req = new XMLHttpRequest();

        req.addEventListener('load', (e) => {
            var payload = JSON.parse(e.currentTarget.response);
            resolve(payload.data);
        });

        req.addEventListener('error', (e) => {
            reject(e);
        });

        req.open("POST", "https://api.thesufferfest.com/graphql");
        req.setRequestHeader('Content-Type', 'application/json');
        req.setRequestHeader('Authorization', 'Bearer ' + bearerToken);

        req.send(JSON.stringify(query));
    });
}
