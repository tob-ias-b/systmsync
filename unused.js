var schemaQuery = () => {
    return {
        operationName: 'Schema',
        query: `query GetSchema {
      __schema {
        types{
          name
        }
      }
    }`
    };
}

var userPlanQueryShort = (startDate, endDate) => {
    return {
        operationName: 'GetUserPlansRange',
        variables: {
            startDate: startDate,
            endDate: endDate,
            queryParams: {
                limit: 500
            }
        },
        query: `query GetUserPlansRange($startDate: Date, $endDate: Date, $queryParams: QueryParams) {
        userPlan(
        startDate: $startDate
        endDate: $endDate
        queryParams: $queryParams
        ) {
                    agendaId,
                    plan {
                      id,
                      name,
                      startDate,
                      endDate
                    }
        }
      }`
    }
}

function runPlanQueryShort() {
    var workouts = [];
    const dates = getAgendaStartEndDate();
    runQuery(userPlanQueryShort(dates.startDate, dates.endDate), (data) => {
        console.log("plan:%O", data);
    });
}

function exportPlan() {
    var workouts = [];
    const dates = getAgendaStartEndDate();
    runQuery(userPlanQueryShort(dates.startDate, dates.endDate), (data) => {
        var plans = new Map();
        for (var i = 1; i < data.userPlan.length; i++) {
            if (!map.has(data.userPlan[i].plan.id)) {
                map.set(data.userPlan[i].plan.id, data.userPlan[i].plan);
            }
        }
        // Get all 
        console.log("plan:%O", data);
    });
}

function runQuery(query, callback) {
    // At least in Firefox, the bearer token is (now) stored as an array, instead of
    // dot-separated string, so combine it back into string format
    const bearerTokenItem = window.localStorage.getItem("SYSTM/user/token");
    const bearerToken = Array.isArray(bearerTokenItem) ? bearerTokenItem.join(".") : bearerTokenItem;

    const req = new XMLHttpRequest();

    req.addEventListener('load', (e) => {
        var payload = JSON.parse(e.currentTarget.response);
        callback(payload.data);
    });

    req.open("POST", "https://api.thesufferfest.com/graphql");
    req.setRequestHeader('Content-Type', 'application/json');
    req.setRequestHeader('Authorization', 'Bearer ' + bearerToken);

    req.send(JSON.stringify(query));
}

function runSchemaQuery() {
    runQuery(userPlanQuery(), (data) => {
        console.log("plan:%O", data);
    })
}

function findDataTestNode(nodes, elementName, val) {
    var foundValue = null;

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

function enterCalendarPage(containerNode) {
    console.log('Cloning...');
    clonePlanButton();
    //var watchTarget = document.querySelector('[data-test="calendarContainer"]')[0];
    //var week = containerNode.attributes.getNamedItem('cal-week').nodeValue;
    //console.log('For week ' + week)
    //    const observer = new MutationObserver((mutationList, observer) => {
    //        for (const mutation of mutationList) {
    //            if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
    //                var containerNode = findDataTestNode(mutation.addedNodes, 'p', 'viewPlan');
    //                if (containerNode != null) {
    //                    //observer.disconnect();
    //                    console.log('Found: viewPlan ' + week)
    //                }
    //            }
    //        }
    //    });
    //    observer.observe(containerNode, {
    //        childList: true,
    //        subtree: true
    //    });

    //  return () => {
    //    observer.disconnect();
    //}
}


const observer = new MutationObserver((mutationList, observer) => {
    if (currentPath != window.location.pathname) {
        currentPath = window.location.pathname;

        if (onPathChange != null)
            onPathChange();

        if (currentPath.startsWith('/calendar'))
            onPathChange = enterCalendarPage();
        for (const mutation of mutationList) {
            if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
                var containerNode = findDataTestNode(mutation.addedNodes, 'BUTTON', 'calendarAddTrainingPlan');
                if (containerNode != null) {
                    observer.disconnect();
                    enterCalendarPage(containerNode);
                }
            }
        }
    }
});
