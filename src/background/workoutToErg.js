function calcWattTargetFromTarget(riderProfile, item) {
  const parameters = item && item.parameters ? item.parameters : {};
  const targets = [
    ["twentyMin", "ftp"],
    ["map", "map"],
    ["ac", "ac"],
    ["nm", "nm"],
  ];
  const target = targets.find(([parameter]) =>
    Object.prototype.hasOwnProperty.call(parameters, parameter)
  );

  return target
    ? Math.floor(riderProfile[target[1]] * parameters[target[0]].value)
    : 0;
}

function calcFtpPercentFromTarget(riderProfile, item) {
  return calcFtpPercentFromWatts(
    riderProfile.ftp,
    calcWattTargetFromTarget(riderProfile, item)
  );
}

function formatWorkoutToErg(workout, riderProfile) {
  const workoutLines = [];
  const workoutData = workout && workout.workouts && workout.workouts[0];
  if (!workoutData || !workoutData.triggers) return workoutLines;

  const workoutTriggers = JSON.parse(workoutData.triggers);
  workoutTriggers.forEach((set) => {
    (set.tracks || []).forEach((interval) => {
      (interval.objects || []).forEach((item) => {
        if (item.type !== "targets") return;

        const seconds = Math.floor(item.size / 1000);
        const power = calcFtpPercentFromTarget(riderProfile, item);
        const parameters = item.parameters || {};
        const hrZone = parameters.hrZone
          ? " Z" + parameters.hrZone.value + " HR"
          : "";
        const rpm = parameters.rpm ? " " + parameters.rpm.value + "rpm" : "";
        workoutLines.push(`- ${seconds}s ${power}%${hrZone}${rpm}`);
      });
    });
  });

  return workoutLines;
}
