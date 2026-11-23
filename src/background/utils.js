function getAgendaStartEndDateFromValues(startDate, endDate) {
  let dateValue = new Date(startDate);
  const startDateParam = dateValue.toISOString();
  dateValue = new Date(endDate);
  dateValue.setDate(dateValue.getDate() + 1);
  dateValue.setMilliseconds(dateValue.getMilliseconds() - 1);
  const endDateParam = dateValue.toISOString();
  var p = {};
  p.startDate = startDateParam;
  p.endDate = endDateParam;
  return p;
}

function formatWorkoutTriggerToErg(workoutGraph, userProfile) {
  const workoutLines = [];

  if (
    workoutGraph == null ||
    workoutGraph.workoutGraphTriggers == null ||
    workoutGraph.workoutGraphTriggers.outdoor == null
  ) {
    return workoutLines;
  }

  triggers = workoutGraph.workoutGraphTriggers.outdoor;

  let riderProfile = userProfile.profiles.riderProfile;

  for (let i = 1; i < triggers.time.length; i++) {
    let seconds = triggers.time[i] - triggers.time[i - 1];
    let ftp_percent = 0;
    switch (triggers.type[i - 1]) {
      case "FTP":
        // Outdoor FTP has it's own ranges depending on target
        // The plain workout graph will represent these in an FTP target with these values.
        // See https://support.wahoofitness.com/hc/en-us/articles/7671514838674-Wahoo-SYSTM-Outdoor-Structured-Workouts
        // Z1 = 0.4 = 30-50%
        // Z2 = 0.63 = 51-75%
        // Z3 = 0.83 = 76-91%
        // Z4 = 0.96 = 92-101%
        // Z5 = 1.05 = 102-108%
        switch (triggers.value[i - 1]) {
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
            ftp_percent = ftp_percent = Math.floor(triggers.value[i - 1] * 100);
            break;
        }
        break;
      case "MAP":
        ftp_percent = Math.floor(
          ((triggers.value[i - 1] * riderProfile.map) / riderProfile.ftp) * 100
        );
        ftp_percent = (ftp_percent - 5) + "-" + (ftp_percent + 5)
        break;
      case "AC":
        ftp_percent = Math.floor(
          ((triggers.value[i - 1] * riderProfile.ac) / riderProfile.ftp) * 100
        );
        ftp_percent = (ftp_percent - 8) + "-" + (ftp_percent + 8)
        break;
      case "NM":
        ftp_percent = Math.floor(
          ((triggers.value[i - 1] * riderProfile.nm) / riderProfile.ftp) * 100
        );
        ftp_percent = (ftp_percent - 10) + "-" + (ftp_percent + 10)
        break;
    }
    workoutLines.push("- " + seconds + "s " + ftp_percent + "%");
  }
  return workoutLines;
}

function calcWattTargetFromTarget(userProfile, item) {
  if (item.parameters.hasOwnProperty("twentyMin")) {
    return Math.floor(userProfile.ftp * item.parameters.twentyMin.value);
  } else if (item.parameters.hasOwnProperty("map")) {
    return Math.floor(userProfile.map * item.parameters.map.value);
  } else if (item.parameters.hasOwnProperty("ac")) {
    return Math.floor(userProfile.ac * item.parameters.ac.value);
  } else if (item.parameters.hasOwnProperty("nm")) {
    return Math.floor(userProfile.nm * item.parameters.nm.value);
  } else {
    return 0;
  }
}

function calcFtpPercentFromTarget(userProfile, item) {
  let watts = calcWattTargetFromTarget(userProfile, item);
  if (watts === 0) return 0;
  let ftp_percent = Math.round((watts / userProfile.ftp) * 100);
  return ftp_percent;
}

function getToken() {
  return new Promise((resolve, reject) => {
    chrome.storage.session.get({ systmToken: null }).then((values) => {
      resolve(values.systmToken);
    });
  });
}

function getUserProfile() {
  return new Promise((resolve, reject) => {
    chrome.storage.session.get({ userProfile: null }).then((userProfile) => {
      resolve(userProfile);
    });
  });
}

function formatWorkoutToErg(workout, userProfile) {
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
          //let power = calcWattTargetFromTarget(userProfile.profiles.riderProfile, item) + 'W';
          let power =
            calcFtpPercentFromTarget(userProfile.profiles.riderProfile, item) +
            "%";
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
