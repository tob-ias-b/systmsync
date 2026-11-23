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

function formatWorkoutToErg(workoutGraph, useOutdoor) {

    const workoutLines = [];

    if(workoutGraph == null){
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