const workoutGraphTriggersQuery = (workoutId) => {
    return {
        operationName: 'workoutGraphTriggers',
        variables: {
            workoutId: workoutId
        },
        query: `query workoutGraphTriggers($workoutId: ID!) {
        workoutGraphTriggers(workoutId: $workoutId) {
          indoor {
          time
          value
          type
          }
          outdoor {
          time
          value
          type
          }
        }
        }
        `
    }
}

const userPlanQuery = (startDate, endDate) => {
    return {
        operationName: 'GetUserPlansRange',
        variables: {
            startDate: startDate,
            endDate: endDate,
            queryParams: {
                limit: 500
            },
          timezone: 'Europe/London'
        },
        query: `query GetUserPlansRange(
        $startDate: Date
        $endDate: Date
        $queryParams: QueryParams
        $timezone: TimeZone
      ) {
        userPlan(
        startDate: $startDate
        endDate: $endDate
        queryParams: $queryParams
        timezone: $timezone
        ) {
        ...UserPlanItem_fragment
        }
      }
      fragment UserPlanItem_fragment on UserPlanItem {
        agendaId
        plannedDate
        type
        prospects {
          description
          type
          name
          intensity {
            master
            nm
            ac
            map
            ftp
          }
          plannedDuration
          durationType
          metrics {
            ratings {
              nm
              ac
              map
              ftp
            }
          }
          contentId
          workoutId
        }
      }`
    }
}
