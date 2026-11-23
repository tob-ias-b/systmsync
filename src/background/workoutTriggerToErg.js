function calcWattTargetFromTrigger(riderProfile, triggerVal, triggerType) {
  if (triggerType === "FTP") {
    return Math.floor(riderProfile.ftp * triggerVal);
  } else if (triggerType === "MAP") {
    return Math.floor(riderProfile.map * triggerVal);
  } else if (triggerType === "AC") {
    return Math.floor(riderProfile.ac * triggerVal);
  } else if (triggerType === "NM") {
    return Math.floor(riderProfile.nm * triggerVal);
  } else {
    return 0;
  }
}

function calcFtpPercentFromTrigger(riderProfile, triggerVal, triggerType) {
  let watts = calcWattTargetFromTrigger(riderProfile, triggerVal, triggerType);
  let ftp_percent = calcFtpPercentFromWatts(riderProfile.ftp, watts);
  return ftp_percent;
}

function formatWorkoutTriggerToErg(workoutGraph, riderProfile, settings) {
  const workoutLines = [];

  if (
    workoutGraph == null ||
    workoutGraph.workoutGraphTriggers == null ||
    (workoutGraph.workoutGraphTriggers.outdoor == null &&
      workoutGraph.workoutGraphTriggers.indoor == null)
  ) {
    return workoutLines;
  }

  if (workoutGraph.workoutGraphTriggers.outdoor == null) {
    triggers = workoutGraph.workoutGraphTriggers.indoor;
  } else {
    triggers = workoutGraph.workoutGraphTriggers.outdoor;
  }

  for (let i = 1; i < triggers.time.length; i++) {
    let seconds = triggers.time[i] - triggers.time[i - 1];
    let ftp_percent = 0;
    let triggerValue = triggers.value[i - 1];
    let triggerType = triggers.type[i - 1];

    if (
      workoutGraph.workoutGraphTriggers.outdoor == null ||
      settings.applyOutdoorPowerRange === false
    ) {
      //Using an indoor workout, or no outdoor ranges desired
      ftp_percent = calcFtpPercentFromTrigger(riderProfile, triggerValue, triggerType);
    } else {
      switch (triggerType) {
        case "FTP":
          // Outdoor FTP has it's own ranges depending on target
          // The plain workout graph will represent these in an FTP target with these values.
          // See https://support.wahoofitness.com/hc/en-us/articles/7671514838674-Wahoo-SYSTM-Outdoor-Structured-Workouts
          // Z1 = 0.4 = 30-50%
          // Z2 = 0.63 = 51-75%
          // Z3 = 0.83 = 76-91%
          // Z4 = 0.96 = 92-101%
          // Z5 = 1.05 = 102-108%
          switch (triggerValue) {
            case 0.4:
              ftp_percent = "30-50";
              break;
            case 0.63:
              ftp_percent = "51-75";
              break;
            case 0.83:
              ftp_percent = "76-91";
              break;
            case 0.96:
              ftp_percent = "92-101";
              break;
            case 1.05:
              ftp_percent = "102-108";
              break;
            default:
              ftp_percent = ftpValueToOutdoor(triggerValue);
              break;
          }
          break;
        case "MAP":
          ftp_percent = Math.floor(
            ((triggerValue * riderProfile.map) / riderProfile.ftp) * 100
          );
          ftp_percent = ftp_percent - 5 + "-" + (ftp_percent + 5);
          break;
        case "AC":
          ftp_percent = Math.floor(
            ((triggerValue * riderProfile.ac) / riderProfile.ftp) * 100
          );
          ftp_percent = ftp_percent - 8 + "-" + (ftp_percent + 8);
          break;
        case "NM":
          ftp_percent = Math.floor(
            ((triggerValue * riderProfile.nm) / riderProfile.ftp) * 100
          );
          ftp_percent = ftp_percent - 10 + "-" + (ftp_percent + 10);
          break;
      }
    }
    workoutLines.push("- " + seconds + "s " + ftp_percent + "%");
  }
  return workoutLines;
}
