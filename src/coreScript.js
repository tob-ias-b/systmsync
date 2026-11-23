function RunQuery(query) {

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

function GetWorkoutGraphTrigger(settings, item) {

    let promise = null;

    const wkid = item.prospects[0].workoutId;
    if (wkid != null && wkid.length > 0) {
        promise = RunQuery(workoutGraphTriggersQuery(wkid));
    } else {
        promise = Promise.resolve(null);
    }
    
    return promise.then((data) => {
        const ergWorkout = formatWorkoutToErg(data, settings.preferOutdoor);
        return Promise.resolve({
            name: item.prospects[0].name,
            type: item.prospects[0].type,
            description: item.prospects[0].description,
            plannedDate: item.plannedDate,
            agendaId: item.agendaId,
            ergWorkout: ergWorkout
        });
    });
}


function GetWorkouts(settings) {
    const promises = [];
    const dates = getAgendaStartEndDate();
    
    return RunQuery(userPlanQuery(dates.startDate, dates.endDate))
    .then((data) => {
        data.userPlan.forEach((item) => {
            promises.push(GetWorkoutGraphTrigger(settings, item));
        });
        return Promise.all(promises);
    })
    .then((values) => {
        const workouts = []
        values.forEach((workout) => {
            if (workout != null) {
                workouts.push(workout);
            }
        })
        return Promise.resolve(workouts)
    });
}

function initCalendarPage(containerNode) {
    let icuButton = document.querySelector('[data-test="SyncICU"]');
    if (icuButton != null) {
        return;
    }

    const sourceButton = document.querySelector('[data-test="calendarAddTrainingPlan"]');
    if (sourceButton == null) {
        return;
    }

    icuButton = sourceButton.cloneNode(true);
    icuButton.setAttribute('data-test', 'SyncICU');
    icuButton.style.marginLeft = '8px';
    icuButton.addEventListener('click', handleIcuClick);
    sourceButton.insertAdjacentElement('afterend', icuButton);
    showButtonReady(icuButton);
}

function handleIcuClick(e) {
    let settings;
    try {
        let currentTarget = e.currentTarget;
        showButtonBusy(currentTarget);
        getSettings()
        .then((newSettings) =>{
            settings = newSettings;
            return Promise.resolve();
        })
        .then(() => {
            return GetWorkouts(settings);
        })
        .then((workouts) =>{
            if (settings.deleteMode) {
                let icuWorkoutDeletes = createIcuWorkoutDeletes(workouts);
                return clearIcu(icuWorkoutDeletes, settings);
            } else {
                let icuWorkouts = createIcuWorkouts(workouts);
                return updateIcu(icuWorkouts, settings);
            }
        }).then(() => {
            showButtonReady(currentTarget);
        })
        .catch((err) => showButtonError(currentTarget));
    }
    catch(error){
        showButtonError(currentTarget);
    }
}

function showButtonBusy(b) {
    const icuButton = b;
    icuButton.enabled = false;
    icuButton.querySelector('span').innerText = '<syncing>';
}

function showButtonError(b) {
    const icuButton = b;
    icuButton.querySelector('span').innerText = 'Error!';
    icuButton.enabled = true;
}

function showButtonReady(b) {
    const icuButton = b;
    icuButton.querySelector('span').innerText = '.icu';
    icuButton.enabled = true;
}

function findDataTestNode(nodes, elementName, val) {
    let foundValue = null;

    for (const nd of nodes) {
        if (nd.nodeName == elementName && nd.attributes.getNamedItem('data-test') != null) {
            if (nd.attributes.getNamedItem('data-test').nodeValue == val) {
                return nd;
            }
        }
        if (nd.childNodes.length > 0) {
            foundValue = findDataTestNode(nd.childNodes, elementName, val);
        }
    }

    return foundValue;
}

const observer = new MutationObserver((mutationList, observer) => {
    for (const mutation of mutationList) {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
            let buttonNode = findDataTestNode(mutation.addedNodes, 'BUTTON', 'calendarAddTrainingPlan');
            if (buttonNode != null) {
                observer.disconnect();
                initCalendarPage(buttonNode);
            }
        }
    }
});

if (window.location.pathname.startsWith('/calendar')) {
    observer.observe(document, {
        childList: true,
        subtree: true
    });
}
