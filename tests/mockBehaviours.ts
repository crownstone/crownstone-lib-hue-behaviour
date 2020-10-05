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
    "id": "5f649e889280050004952618",
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
    "id": "5f649e889280050004952618",
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
    "id": "5f649e889280050004952618",
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
    "id": "5f6d9597372a7600046f8799",
    "stoneId": "5f4e47660bc0da0004b4fe16",
    "sphereId": "5f4d08bbbfeb1e000422a462",
    "createdAt": "2020-09-25T07:00:39.895Z",
    "updatedAt": "2020-09-25T07:00:44.288Z"
}

export const switchOnBetweenRange = {
    "type": "BEHAVIOUR",
    "data": {
        "action": {"type": "BE_ON", "data": 100},
        "time": {
            "type": "RANGE",
            "from": {"type": "CLOCK", "data": {"hours": 3, "minutes": 10}},
            "to": {"type": "CLOCK", "data":{ "hours": 21, "minutes": 10}}
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
    "id": "5f649e889280050004952618",
    "stoneId": "5f4e47660bc0da0004b4fe16",
    "sphereId": "5f4d08bbbfeb1e000422a462",
    "createdAt": "2020-09-18T11:48:24.813Z",
    "updatedAt": "2020-09-18T11:48:24.489Z"
}


export const switchAfterSunsetToSunrise45 =
    {
        "type": "BEHAVIOUR",
        "data": "{\"action\":{\"type\":\"BE_ON\",\"data\":100},\"time\":{\"type\":\"RANGE\",\"from\":{\"type\":\"SUNSET\",\"offsetMinutes\":0},\"to\":{\"type\":\"SUNSET\",\"offsetMinutes\":45}},\"presence\":{\"type\":\"SOMEBODY\",\"data\":{\"type\":\"SPHERE\"},\"delay\":300}}",
        "idOnCrownstone": 3,
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
        "id": "5f6d9633372a7600046f87c7",
        "stoneId": "5f4e47660bc0da0004b4fe16",
        "sphereId": "5f4d08bbbfeb1e000422a462",
        "createdAt": "2020-09-25T07:03:15.897Z",
        "updatedAt": "2020-09-25T07:03:20.083Z"
    }
