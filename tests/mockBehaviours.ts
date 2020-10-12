export const switchOnWhenAny1Home = {
    "type": "BEHAVIOUR",
    "data": {
        "action": {"type": "BE_ON", "data": 100},
        "time": {
            "type": "ALL_DAY"

        },
        "presence": {"type": "SOMEBODY", "data": {"type": "SPHERE"}, "delay": 300}
    },
    "idOnCrownstone": 0,
    "profileIndex": 0,
    "syncedToCrownstone": true,
    "deleted": false,
    "activeDays": {
        "Mon": true,
        "Tue": true,
        "Wed": true,
        "Thu": true,
        "Fri": true,
        "Sat": true,
        "Sun": true
    },
    "cloudId": "5f6491e889280050004952618",
    "stoneId": "5f4e47660bc0da0004b4fe16",
    "sphereId": "5f4d08bbbfeb1e000422a462",
    "createdAt": "2020-09-18T11:48:24.813Z",
    "updatedAt": "2020-09-18T11:48:24.489Z"
}

export const switchOn80WhenAny1Home = {
    "type": "BEHAVIOUR",
    "data": {
        "action": {"type": "BE_ON", "data": 80},
        "time": {
            "type": "ALL_DAY"

        },
        "presence": {"type": "SOMEBODY", "data": {"type": "SPHERE"}, "delay": 300}
    },
    "idOnCrownstone": 0,
    "profileIndex": 0,
    "syncedToCrownstone": true,
    "deleted": false,
    "activeDays": {
        "Mon": true,
        "Tue": true,
        "Wed": true,
        "Thu": true,
        "Fri": true,
        "Sat": true,
        "Sun": true
    },
    "cloudId": "5f649e6889280050004952618",
    "stoneId": "5f4e47660bc0da0004b4fe16",
    "sphereId": "5f4d08bbbfeb1e000422a462",
    "createdAt": "2020-09-18T11:48:24.813Z",
    "updatedAt": "2020-09-18T11:48:24.489Z"
}

export const switchOnOnlyAtWeekend = {
    "type": "BEHAVIOUR",
    "data": {
        "action": {"type": "BE_ON", "data": 100},
        "time": {
            "type": "ALL_DAY"

        },
        "presence": {"type": "SOMEBODY", "data": {"type": "SPHERE"}, "delay": 300}
    },
    "idOnCrownstone": 0,
    "profileIndex": 0,
    "syncedToCrownstone": true,
    "deleted": false,
    "activeDays": {
        "Mon": false,
        "Tue": false,
        "Wed": false,
        "Thu": false,
        "Fri": false,
        "Sat": true,
        "Sun": true
    },
    "cloudId": "5f6494e889280050004952618",
    "stoneId": "5f4e47660bc0da0004b4fe16",
    "sphereId": "5f4d08bbbfeb1e000422a462",
    "createdAt": "2020-09-18T11:48:24.813Z",
    "updatedAt": "2020-09-18T11:48:24.489Z"
}

export const BehaviourDayOverlap ={
    "type": "BEHAVIOUR",
    "data": "{\"action\":{\"type\":\"BE_ON\",\"data\":100},\"time\":{\"type\":\"RANGE\",\"from\":{\"type\":\"CLOCK\",\"data\":{\"hours\":19,\"minutes\":15}},\"to\":{\"type\":\"CLOCK\",\"data\":{\"hours\":4,\"minutes\":0}}},\"presence\":{\"type\":\"IGNORE\"}}",
    "idOnCrownstone": 1,
    "profileIndex": 0,
    "syncedToCrownstone": true,
    "deleted": false,
    "activeDays": {
        "Mon": false,
        "Tue": false,
        "Wed": false,
        "Thu": false,
        "Fri": false,
        "Sat": false,
        "Sun": false
    },
    "cloudId": "5f6d9597372a27600046f8799",
    "stoneId": "5f4e47660bc0da0004b4fe16",
    "sphereId": "5f4d08bbbfeb1e000422a462",
    "createdAt": "2020-09-25T07:00:39.895Z",
    "updatedAt": "2020-09-25T07:00:44.288Z"
}

export const switchOnBetweenRangeWithSpherePresence = {
    "type": "BEHAVIOUR",
    "data": {
        "action": {"type": "BE_ON", "data": 100},
        "time": {
            "type": "RANGE",
            "from": {"type": "CLOCK", "data": {"hours": 12, "minutes": 10}},
            "to": {"type": "CLOCK", "data":{ "hours": 21, "minutes": 10}}
        },
        "presence": {"type": "SOMEBODY",
                    "data":{
                        "type":"SPHERE"}
                    }

    },
    "idOnCrownstone": 0,
    "profileIndex": 0,
    "syncedToCrownstone": true,
    "deleted": false,
    "activeDays": {
        "Mon": true,
        "Tue": true,
        "Wed": true,
        "Thu": true,
        "Fri": true,
        "Sat": true,
        "Sun": true
    },
    "cloudId": "5f649e8892800500054952618",
    "stoneId": "5f4e47660bc0da0004b4fe16",
    "sphereId": "5f4d08bbbfeb1e000422a462",
    "createdAt": "2020-09-18T11:48:24.813Z",
    "updatedAt": "2020-09-18T11:48:24.489Z"
}



export const switchOnAllDayIgnorePresence = {
    "type": "BEHAVIOUR",
    "data": {
        "action": {"type": "BE_ON", "data": 100},
        "time": {
            "type": "ALL_DAY"
        },
        "presence": {"type": "IGNORE"}
    },
    "idOnCrownstone": 0,
    "profileIndex": 0,
    "syncedToCrownstone": true,
    "deleted": false,
    "activeDays": {
        "Mon": true,
        "Tue": true,
        "Wed": true,
        "Thu": true,
        "Fri": true,
        "Sat": true,
        "Sun": true
    },
    "cloudId": "5f649e8892800500049526185",
    "stoneId": "5f4e47660bc0da0004b4fe16",
    "sphereId": "5f4d08bbbfeb1e000422a462",
    "createdAt": "2020-09-18T11:48:24.813Z",
    "updatedAt": "2020-09-18T11:48:24.489Z"
}




export const twilightDim50AllDay = {
    "type": "TWILIGHT",
    "data": {
        "action": {"type": "DIM_WHEN_TURNED_ON", "data": 50},
        "time": {
            "type": "ALL_DAY"
        }
    },
    "idOnCrownstone": 0,
    "profileIndex": 0,
    "syncedToCrownstone": true,
    "deleted": false,
    "activeDays": {
        "Mon": true,
        "Tue": true,
        "Wed": true,
        "Thu": true,
        "Fri": true,
        "Sat": true,
        "Sun": true
    },
    "cloudId": "5f649e8892170500049526185",
    "stoneId": "5f4e47660bc0da0004b4fe16",
    "sphereId": "5f4d08bbbfeb1e000422a462",
    "createdAt": "2020-09-18T11:48:24.813Z",
    "updatedAt": "2020-09-18T11:48:24.489Z"
}


export const twilight40BetweenSunriseSunset = {
    "type": "TWILIGHT",
    "data": {
        "action": {"type": "DIM_WHEN_TURNED_ON", "data": 40},
        "time": {
            "type": "RANGE",
            "from" :{"type": "SUNRISE", "offsetMinutes": 0},
            "to":{"type": "SUNSET", "offsetMinutes": 0}
        }
    },
    "idOnCrownstone": 0,
    "profileIndex": 0,
    "syncedToCrownstone": true,
    "deleted": false,
    "activeDays": {
        "Mon": true,
        "Tue": true,
        "Wed": true,
        "Thu": true,
        "Fri": true,
        "Sat": true,
        "Sun": true
    },
    "cloudId": "5f649e8892a70500049526185",
    "stoneId": "5f4e47660bc0da0004b4fe16",
    "sphereId": "5f4d08bbbfeb1e000422a462",
    "createdAt": "2020-09-18T11:48:24.813Z",
    "updatedAt": "2020-09-18T11:48:24.489Z"
}



