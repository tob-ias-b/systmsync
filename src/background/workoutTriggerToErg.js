function calcWattTargetFromTrigger(riderProfile, triggerVal, triggerType) {
  const profileMetric = {
    FTP: "ftp",
    MAP: "map",
    AC: "ac",
    NM: "nm",
  }[triggerType];

  return profileMetric
    ? Math.floor(riderProfile[profileMetric] * triggerVal)
    : 0;
}

function calcFtpPercentFromTrigger(riderProfile, triggerVal, triggerType) {
  return calcFtpPercentFromWatts(
    riderProfile.ftp,
    calcWattTargetFromTrigger(riderProfile, triggerVal, triggerType)
  );
}

function formatOutdoorPowerRange(triggerValue, triggerType, riderProfile) {
  if (triggerType === "FTP") {
    const knownZones = new Map([
      [0.4, "30-50"],
      [0.63, "51-75"],
      [0.83, "76-91"],
      [0.96, "92-101"],
      [1.05, "102-108"],
    ]);
    return knownZones.get(triggerValue) || ftpValueToOutdoor(triggerValue);
  }

  const metric = { MAP: "map", AC: "ac", NM: "nm" }[triggerType];
  if (!metric || !riderProfile.ftp) return 0;

  const tolerance = { MAP: 5, AC: 8, NM: 10 }[triggerType];
  const percentage = Math.floor(
    ((triggerValue * riderProfile[metric]) / riderProfile.ftp) * 100
  );
  return `${percentage - tolerance}-${percentage + tolerance}`;
}

function formatWorkoutTriggerToErg(workoutGraph, riderProfile, settings) {
  const workoutLines = [];
  const graph = workoutGraph && workoutGraph.workoutGraphTriggers;
  if (!graph || (!graph.outdoor && !graph.indoor)) return workoutLines;

  const useOutdoor = Boolean(graph.outdoor);
  const triggers = graph.outdoor || graph.indoor;
  if (!Array.isArray(triggers.time) || !Array.isArray(triggers.value)) {
    return workoutLines;
  }

  for (let index = 1; index < triggers.time.length; index += 1) {
    const seconds = triggers.time[index] - triggers.time[index - 1];
    const triggerValue = triggers.value[index - 1];
    const triggerType = triggers.type[index - 1];
    const usePowerRange =
      useOutdoor && settings && settings.applyOutdoorPowerRange !== false;
    const percentage = usePowerRange
      ? formatOutdoorPowerRange(triggerValue, triggerType, riderProfile)
      : calcFtpPercentFromTrigger(riderProfile, triggerValue, triggerType);

    workoutLines.push(`- ${seconds}s ${percentage}%`);
  }

  return workoutLines;
}
