function calcWattTargetFromTarget(riderProfile, item) {
  if (item.parameters.hasOwnProperty("twentyMin")) {
    return Math.floor(riderProfile.ftp * item.parameters.twentyMin.value);
  } else if (item.parameters.hasOwnProperty("map")) {
    return Math.floor(riderProfile.map * item.parameters.map.value);
  } else if (item.parameters.hasOwnProperty("ac")) {
    return Math.floor(riderProfile.ac * item.parameters.ac.value);
  } else if (item.parameters.hasOwnProperty("nm")) {
    return Math.floor(riderProfile.nm * item.parameters.nm.value);
  } else {
    return 0;
  }
}

function calcFtpPercentFromTarget(riderProfile, item) {
  let watts = calcWattTargetFromTarget(riderProfile, item);
  let ftp_percent = calcFtpPercentFromWatts(riderProfile.ftp, watts);
  return ftp_percent;
}

function formatWorkoutToErg(workout, riderProfile, settings) {
  const workoutLines = [];

  if (
    workout == null ||
    workout.workouts == null ||
    workout.workouts.length === 0 ||
    workout.workouts[0].triggers == null
  ) {
    return workoutLines;
  }

  workoutTriggers = JSON.parse(workout.workouts[0].triggers);

  for (let s = 0; s < workoutTriggers.length; s++) {
    let set = workoutTriggers[s];
    for (let i = 0; i < set.tracks.length; i++) {
      let interval = set.tracks[i];
      for (let o = 0; o < interval.objects.length; o++) {
        let item = interval.objects[o];
        if (item.type === "targets") {
          let seconds = item.size / 1000;
          //let power = calcWattTargetFromTarget(riderProfile, item) + 'W';
          let power = calcFtpPercentFromTarget(riderProfile, item) + "%";
          let hrZone = item.parameters.hasOwnProperty("hrZone")
            ? " Z" + item.parameters.hrZone.value + " HR"
            : "";
          let rpm = item.parameters.hasOwnProperty("rpm")
            ? " " + item.parameters.rpm.value + "rpm"
            : "";
          workoutLines.push("- " + seconds + "s " + power + hrZone + rpm);
        }
      }
    }
  }

  return workoutLines;
}
