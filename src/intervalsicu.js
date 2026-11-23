const icuWorkoutTypes = {
    "Ride": "Ride",
    "MountainBikeRide": "MountainBikeRide",
    "GravelRide": "GravelRide",
    "Run": "Run",
    "TrailRun": "TrailRun",
    "Swim": "Swim",
    "VirtualRide": "VirtualRide",
    "VirtualRun": "VirtualRun",
    "WeightTraining": "WeightTraining",
    "Hike": "Hike",
    "Walk": "Walk",
    "AlpineSki": "AlpineSki",
    "Badminton": "Badminton",
    "BackcountrySki": "BackcountrySki",
    "Canoeing": "Canoeing",
    "Crossfit": "Crossfit",
    "EBikeRide": "EBikeRide",
    "EMountainBikeRide": "EMountainBikeRide",
    "Elliptical": "Elliptical",
    "Golf": "Golf",
    "Handcycle": "Handcycle",
    "HighIntensityIntervalTraining": "HighIntensityIntervalTraining",
    "Hockey": "Hockey",
    "IceSkate": "IceSkate",
    "InlineSkate": "InlineSkate",
    "Kayaking": "Kayaking",
    "Kitesurf": "Kitesurf",
    "NordicSki": "NordicSki",
    "OpenWaterSwim": "OpenWaterSwim",
    "Pilates": "Pilates",
    "Padel": "Padel",
    "Pickleball": "Pickleball",
    "Racquetball": "Racquetball",
    "RockClimbing": "RockClimbing",
    "RollerSki": "RollerSki",
    "Rowing": "Rowing",
    "VirtualRow": "VirtualRow",
    "Rugby": "Rugby",
    "Sail": "Sail",
    "Skateboard": "Skateboard",
    "Snowboard": "Snowboard",
    "Snowshoe": "Snowshoe",
    "Soccer": "Soccer",
    "Squash": "Squash",
    "StairStepper": "StairStepper",
    "StandUpPaddling": "StandUpPaddling",
    "Surfing": "Surfing",
    "TableTennis": "TableTennis",
    "Tennis": "Tennis",
    "Transition": "Transition",
    "Velomobile": "Velomobile",
    "WaterSport": "WaterSport",
    "Wheelchair": "Wheelchair",
    "Windsurf": "Windsurf",
    "Workout": "Workout",
    "Yoga": "Yoga",
    "Other": "Other",
};

const icuApiUris = {
    bulkDelete: { verb: 'PUT', uri: 'https://intervals.icu/api/v1/athlete/{athleteId}/events/bulk-delete'},
    bulkUpsert: { verb: 'POST', uri: 'https://intervals.icu/api/v1/athlete/{athleteId}/events/bulk?upsert=true'},
}

function callIcuApi(icuApiUri, athleteId, bearerToken, payload) {
    return new Promise((resolve, reject) => {
        const req = new XMLHttpRequest();
        const formattedUri =  icuApiUri.uri.replace('{athleteId}', athleteId);

        req.addEventListener('load', (e) => {
            var responsePayload = JSON.parse(e.currentTarget.response);
            resolve(responsePayload);
        });

        req.addEventListener('error', (e) => {
            reject(e);
        });

        req.open(icuApiUri.verb, formattedUri);
        req.setRequestHeader('Content-Type', 'application/json');
        req.setRequestHeader('Authorization', 'Basic ' + bearerToken);

        req.send(JSON.stringify(payload));    
    });
}

function clearIcu(workouts, settings) {
    if(workouts === null || workouts.length === 0){
        // Nothing to do
        return Promise.resolve({});
    }
    return callIcuApi(icuApiUris.bulkDelete, settings.athleteId, settings.bearerToken, workouts);
}

function updateIcu(workouts, settings) {
    if(workouts === null || workouts.length === 0){
        // Nothing to do
        return Promise.resolve({});
    }
    return callIcuApi(icuApiUris.bulkUpsert, settings.athleteId, settings.bearerToken, workouts);
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
        return workout.description + '\n\n' + workout.ergWorkout.join('\n');
    }
}

function createIcuWorkouts(workouts) {
    const icuWorkouts = []
    workouts.forEach((item) => {
        icuWorkouts.push(createIcuWorkout(item));
    });
    return icuWorkouts;
}

function createIcuWorkout(workout) {
    const icuType = mapIcuWorkoutType(workout.type);
    return {
        name: 'Wahoo SYSTM: ' + workout.name,
        category: icuType == null ? "NOTE" : "WORKOUT",
        type: icuType ?? workout.type,
        start_date_local: new Date(workout.plannedDate).toISOString().substring(0, 20),
        external_id: workout.agendaId,
        description: mapIcuWorkoutDescription(workout)
    }
}

function createIcuWorkoutDeletes(workouts) {
    const icuWorkouts = []
    workouts.forEach((item) => {
        icuWorkouts.push(createIcuWorkoutDelete(item));
    });
    return icuWorkouts;
}

function createIcuWorkoutDelete(workout) {
    return {
        external_id: workout.agendaId,
    }
}
