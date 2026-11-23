function getQueryStringDate() {
    const urlParams = new URLSearchParams(window.location.search);
    const queryDate = new Date(urlParams.get('date'));
    return queryDate;
}

function getAgendaStartEndDate() {
    const queryDate = getQueryStringDate();
    const startDateParam = queryDate.toISOString();
    const endDate = getQueryStringDate();
    endDate.setDate(endDate.getDate() + 7);
    endDate.setMilliseconds(endDate.getMilliseconds() - 1);
    const endDateParam = endDate.toISOString();
    var p = {};
    p.startDate = startDateParam;
    p.endDate = endDateParam;
    return p;
}

function formatWorkoutTriggerToErg(workoutGraph, useOutdoor) {

    const workoutLines = [];

    if(workoutGraph == null || workoutGraph.workoutGraphTriggers == null || workoutGraph.workoutGraphTriggers.indoor == null){
        return workoutLines;
    }

    var triggers = workoutGraph.workoutGraphTriggers.indoor;
    if(useOutdoor && workoutGraph.workoutGraphTriggers.outdoor != null) {
        triggers = workoutGraph.workoutGraphTriggers.outdoor;
    }

    for (let i = 1; i < triggers.time.length; i++) {
        let seconds = triggers.time[i] - triggers.time[i - 1];
        let ftp_percent = Math.floor((triggers.value[i - 1] * 100));
        workoutLines.push("- " + seconds + "s " + ftp_percent + "%");
    }
    return workoutLines;
}

function formatWorkoutToErg(workout, useOutdoor) {

    const workoutLines = [];

    if(workout == null){
        return workoutLines;
    }

    if(workout.workouts.length === 0){
        return workoutLines;
    }

    if(workout.workouts[0].triggers == null){
        return workoutLines;
    }

    workoutTriggers = JSON.parse(workout.workouts[0].triggers);

    for (let s = 0; s < workoutTriggers.length; s++) {
        let set = workoutTriggers[s];
        for (let i = 0; i < set.tracks.length; i++) {
            let interval = set.tracks[i];
            for (let o = 0; o < interval.objects.length; o++) {
                let item = interval.objects[o]
                if(item.type === 'targets'){
                    let seconds = (item.size / 1000);
                    let ftp_percent = item.parameters.hasOwnProperty('ftp') ? ' ' + Math.floor((item.parameters.ftp.value * 100)) + '%' : '';
                    let hrZone = item.parameters.hasOwnProperty('hrZone') ? ' Z' + item.parameters.hrZone.value + ' HR' : '';
                    let rpm = item.parameters.hasOwnProperty('rpm') ? ' ' + item.parameters.rpm.value + 'rpm' : '';
                    workoutLines.push('- ' + seconds + 's ' + ftp_percent + hrZone + rpm);
                }
            }
        }
    }

    return workoutLines;
}