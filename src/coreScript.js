
function GetWorkoutGraphTrigger(settings, item) {

    let promise = null;

    // Have had at least one instance of an "activity" which came back with no details.
    // Couldn't recreate but was one that was manually set as complete.
    // Validate ALL required properties before trying to use them.
    let validProperties = true;
    if(item === null) validProperties = false;
    if(item.prospects === null) validProperties = false;
    if(item.plannedDate === null) validProperties = false;
    if(item.agendaId === null) validProperties = false;
    if(validProperties === false) {
        console.log('Invalid UserPlanQueryItem:');
        console.log(item);
        return Promise.resolve(null);
    }

    const wkid = item.prospects[0].workoutId;
    const cacheKey = settings.preferOutdoor + ':' + wkid;

    if (wkid != null && wkid.length > 0) {
        if (workoutsCache.has(cacheKey)) {
            console.log('Workout Cache Hit:' + cacheKey);
            promise = Promise.resolve(workoutsCache.get(cacheKey));
        } else {
            promise = RunSYSTMQuery(workoutGraphTriggersQuery(wkid));
        }
    } else {
        promise = Promise.resolve(null);
    }

    return promise.then((data) => {
        const ergWorkout = formatWorkoutTriggerToErg(data, settings.preferOutdoor);
        let workout = {
            name: item.prospects[0].name,
            type: item.prospects[0].type,
            description: item.prospects[0].description,
            plannedDate: item.plannedDate,
            agendaId: item.agendaId,
            ergWorkout: ergWorkout
        };
        if (wkid != null && wkid.length > 0) {
            workoutsCache.set(cacheKey, data);
        }
        return Promise.resolve(workout);
    });
}

function GetWorkouts(settings, item) {

    let promise = null;

    // Have had at least one instance of an "activity" which came back with no details.
    // Couldn't recreate but was one that was manually set as complete.
    // Validate ALL required properties before trying to use them.
    let validProperties = true;
    if(item === null) validProperties = false;
    if(item.prospects === null) validProperties = false;
    if(item.plannedDate === null) validProperties = false;
    if(item.agendaId === null) validProperties = false;
    if(validProperties === false) {
        console.log('Invalid UserPlanQueryItem:');
        console.log(item);
        return Promise.resolve(null);
    }

    const wkid = item.prospects[0].workoutId;
    const cacheKey = settings.preferOutdoor + ':' + wkid;

    if (wkid != null && wkid.length > 0) {
        if (workoutsCache.has(cacheKey)) {
            console.log('Workout Cache Hit:' + cacheKey);
            promise = Promise.resolve(workoutsCache.get(cacheKey));
        } else {
            promise = RunSYSTMQuery(getWorkoutsQuery(wkid));
        }
    } else {
        promise = Promise.resolve(null);
    }

    return promise.then((data) => {
        const ergWorkout = formatWorkoutToErg(data, settings.preferOutdoor);
        let workout = {
            name: item.prospects[0].name,
            type: item.prospects[0].type,
            description: item.prospects[0].description,
            plannedDate: item.plannedDate,
            agendaId: item.agendaId,
            ergWorkout: ergWorkout
        };
        if (wkid != null && wkid.length > 0) {
            workoutsCache.set(cacheKey, data);
        }
        return Promise.resolve(workout);
    });
}


function GetMappedWorkouts(settings) {
    const promises = [];
    const dates = getAgendaStartEndDate();

    return RunSYSTMQuery(userPlanQuery(dates.startDate, dates.endDate))
        .then((data) => {
            data.userPlan.forEach((item) => {
                if(settings.preferOutdoor === true) {
                    promises.push(GetWorkoutGraphTrigger(settings, item));
                } else {
                    promises.push(GetWorkouts(settings, item));
                }
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

function initCalendarPage() {
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
    let settings = null;
    try {
        let currentTarget = e.currentTarget;
        showButtonBusy(currentTarget);
        getSettings()
            .then((newSettings) => {
                if (newSettings.settingsValid != true) {
                    chrome.runtime.sendMessage({ "action": "openOptionsPage" });
                    return Promise.resolve();
                }
                settings = newSettings;
                return Promise.resolve();
            })
            .then(() => {
                if (settings != null) {
                    GetMappedWorkouts(settings)
                        .then((workouts) => {
                            if (settings.deleteMode) {
                                let icuWorkoutDeletes = createIcuWorkoutDeletes(workouts);
                                return clearIcu(icuWorkoutDeletes, settings);
                            } else {
                                let icuWorkouts = createIcuWorkouts(workouts);
                                return updateIcu(icuWorkouts, settings);
                            }
                        }).then(() => {
                            showButtonReady(currentTarget);
                            return Promise.resolve();
                        })
                        .catch((err) => {
                            console.log(err);
                            showButtonError(currentTarget)
                            return Promise.resolve();
                        });            
                }
                else {
                    showButtonReady(currentTarget);
                    return Promise.resolve();
                }
            })
            .catch((err) => {
                console.log(err);
                showButtonError(currentTarget)
                return Promise.resolve();
            });
    }
    catch (error) {
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

const workoutsCache = new Map();

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

observer.observe(document, {
    childList: true,
    subtree: true
});

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.pageHit === 'calendar') {
            observer.observe(document, {
                childList: true,
                subtree: true
            });
            let planButton = document.querySelector('[data-test="calendarAddTrainingPlan"]');
            if (planButton != null) {
                observer.disconnect();
                initCalendarPage();
            }
        }
    }
);