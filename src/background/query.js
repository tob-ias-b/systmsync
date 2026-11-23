const workoutGraphTriggersQuery = (workoutId) => {
  return {
    operationName: "workoutGraphTriggers",
    variables: {
      workoutId: workoutId,
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
        `,
  };
};

const getWorkoutsQuery = (workoutId) => {
  return {
    operationName: "GetWorkouts",
    variables: {
      id: workoutId,
    },
    query: `query GetWorkouts($id: ID) {
      workouts(id: $id) {
        id
        sortOrder
        sport
        stampImage
        bannerImage
        bestFor
        equipment {
          name
          description
          thumbnail
          __typename
        }
        details
        shortDescription
        level
        durationSeconds
        name
        triggers
        featuredRaces {
          name
          thumbnail
          darkBackgroundThumbnail
          __typename
        }
        metrics {
          intensityFactor
          tss
          ratings {
            nm
            ac
            map
            ftp
            __typename
          }
          __typename
        }
        brand
        nonAppWorkout
        notes
        tags
        imperatives {
          userSettings {
            birthday
            gender
            weight
            __typename
          }
          __typename
        }
        __typename
      }
    }`,
  };
};

const getUserPlansRangeQuery = (startDate, endDate) => {
  return {
    operationName: "GetUserPlansRange",
    variables: {
      startDate: startDate,
      endDate: endDate,
      queryParams: {
        limit: 500,
      },
      timezone: "Europe/London",
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
      }`,
  };
};

const getUserProfileQuery = () => {
  return {
    operationName: "GetUserProfile",
    query: `query GetUserProfile {
    userProfile {
      ...userProfileFragment
    }
  }
  fragment userProfileFragment on UserProfile {
    nm
    ac
    map
    ftp
    lthr
    cadenceThreshold
    riderTypeInfo {
      name
      icon
      iconSmall
      systmIcon
      description
    }
    riderWeaknessInfo {
      name
    }
    recommended {
      nm {
        value
        activity
      }
      ac {
        value
        activity
      }
      map {
        value
        activity
      }
      ftp {
        value
        activity
      }
    }
  }`,
  };
};

const getMoveAgendaMutation = (agendaId, newDate, timeZone) => {
  return {
    operationName: "MoveAgenda",
    variables: {
      agendaId: agendaId,
      date: newDate,
      rank: 200,
      timeZone: timeZone
    },
    query: `mutation MoveAgenda($agendaId: ID!, $date: Date!, $rank: Int, $timeZone: TimeZone) {
      moveAgenda(agendaId: $agendaId, date: $date, rank: $rank, timeZone: $timeZone) {
        status
      }
    }`
  }
};