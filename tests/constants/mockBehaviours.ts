export const switchOnWhenAny1Home: HueBehaviourWrapper = {
  "type": "BEHAVIOUR",
  "data": {
    "action": {"type": "BE_ON", "data": 100},
    "time": {
      "type": "ALL_DAY"

    },
    "presence": {"type": "SOMEBODY", "data": {"type": "SPHERE"}, "delay": 300}
  },
  "activeDays": {
    "Mon": true,
    "Tue": true,
    "Wed": true,
    "Thu": true,
    "Fri": true,
    "Sat": true,
    "Sun": true
  },
  "cloudId": "CLOUDID-1124",
  "lightId": "5f4e47660bc0da0004b4fe16"
}

export const switchOn80WhenAny1Home: HueBehaviourWrapper = {
  "type": "BEHAVIOUR",
  "data": {
    "action": {"type": "BE_ON", "data": 80},
    "time": {
      "type": "ALL_DAY"

    },
    "presence": {"type": "SOMEBODY", "data": {"type": "SPHERE"}, "delay": 300}
  },
  "activeDays": {
    "Mon": true,
    "Tue": true,
    "Wed": true,
    "Thu": true,
    "Fri": true,
    "Sat": true,
    "Sun": true
  },
  "cloudId": "CLOUDID-1125",
  "lightId": "5f4e47660bc0da0004b4fe16"
}

export const switchOnOnlyAtWeekend: HueBehaviourWrapper = {
  "type": "BEHAVIOUR",
  "data": {
    "action": {"type": "BE_ON", "data": 100},
    "time": {
      "type": "ALL_DAY"

    },
    "presence": {"type": "SOMEBODY", "data": {"type": "SPHERE"}, "delay": 300}
  },
  "activeDays": {
    "Mon": false,
    "Tue": false,
    "Wed": false,
    "Thu": false,
    "Fri": false,
    "Sat": true,
    "Sun": true
  },
  "cloudId": "CLOUDID-1126",
  "lightId": "5f4e47660bc0da0004b4fe16"
}

export const switchOnBetweenRangeWithSpherePresence: HueBehaviourWrapper = {
  "type": "BEHAVIOUR",
  "data": {
    "action": {"type": "BE_ON", "data": 100},
    "time": {
      "type": "RANGE",
      "from": {"type": "CLOCK", "data": {"hours": 12, "minutes": 10}},
      "to": {"type": "CLOCK", "data": {"hours": 21, "minutes": 10}}
    },
    "presence": {
      "type": "SOMEBODY",
      "data": {
        "type": "SPHERE"
      },
      "delay": 300
    }

  },
  "activeDays": {
    "Mon": true,
    "Tue": true,
    "Wed": true,
    "Thu": true,
    "Fri": true,
    "Sat": true,
    "Sun": true
  },
  "cloudId": "CLOUDID-1127",
  "lightId": "5f4e47660bc0da0004b4fe16"
}


export const switchOnAllDayIgnorePresence: HueBehaviourWrapper = {
  "type": "BEHAVIOUR",
  "data": {
    "action": {"type": "BE_ON", "data": 100},
    "time": {
      "type": "ALL_DAY"
    },
    "presence": {"type": "IGNORE"}
  },
  "activeDays": {
    "Mon": true,
    "Tue": true,
    "Wed": true,
    "Thu": true,
    "Fri": true,
    "Sat": true,
    "Sun": true
  },
  "cloudId": "CLOUDID-1128",
  "lightId": "5f4e47660bc0da0004b4fe16"
}


export const twilightDim50AllDay: HueBehaviourWrapper = {
  "type": "TWILIGHT",
  "data": {
    "action": {"type": "DIM_WHEN_TURNED_ON", "data": 50},
    "time": {
      "type": "ALL_DAY"
    }
  },
  "activeDays": {
    "Mon": true,
    "Tue": true,
    "Wed": true,
    "Thu": true,
    "Fri": true,
    "Sat": true,
    "Sun": true
  },
  "cloudId": "CLOUD-ID-123123",
  "lightId": "5f4e47660bc0da0004b4fe16",
}

export const twilightDim50AllDayUpdated100: HueBehaviourWrapper = {
  "type": "TWILIGHT",
  "data": {
    "action": {"type": "DIM_WHEN_TURNED_ON", "data": 100},
    "time": {
      "type": "ALL_DAY"
    }
  },
  "activeDays": {
    "Mon": true,
    "Tue": true,
    "Wed": true,
    "Thu": true,
    "Fri": true,
    "Sat": true,
    "Sun": true
  },
  "cloudId": "CLOUD-ID-123123",
  "lightId": "5f4e47660bc0da0004b4fe16",
}

export const twilight40BetweenSunriseSunset: HueBehaviourWrapper = {
  "type": "TWILIGHT",
  "data": {
    "action": {"type": "DIM_WHEN_TURNED_ON", "data": 40},
    "time": {
      "type": "RANGE",
      "from": {"type": "SUNRISE", "offsetMinutes": 0},
      "to": {"type": "SUNSET", "offsetMinutes": 0}
    }
  },
  "activeDays": {
    "Mon": true,
    "Tue": true,
    "Wed": true,
    "Thu": true,
    "Fri": true,
    "Sat": true,
    "Sun": true
  },
  "cloudId": "CLOUDID-1129",
  "lightId": "5f4e47660bc0da0004b4fe16"
}


export const twilight80BetweenSunriseSunset: HueBehaviourWrapper = {
  "type": "TWILIGHT",
  "data": {
    "action": {"type": "DIM_WHEN_TURNED_ON", "data": 80},
    "time": {
      "type": "RANGE",
      "from": {"type": "SUNRISE", "offsetMinutes": 0},
      "to": {"type": "SUNSET", "offsetMinutes": 0}
    }
  },
  "activeDays": {
    "Mon": true,
    "Tue": true,
    "Wed": true,
    "Thu": true,
    "Fri": true,
    "Sat": true,
    "Sun": true
  },
  "cloudId": "CLOUDID-2120",
  "lightId": "5f4e47660bc0da0004b4fe16"
}


export const twilight60BetweenRange: HueBehaviourWrapper = {
  "type": "TWILIGHT",
  "data": {
    "action": {"type": "DIM_WHEN_TURNED_ON", "data": 60},
    "time": {
      "type": "RANGE",
      "from": {"type": "CLOCK", "data": {"hours": 13, "minutes": 10}},
      "to": {"type": "SUNSET", "offsetMinutes": 0}
    }
  },
  "activeDays": {
    "Mon": true,
    "Tue": true,
    "Wed": true,
    "Thu": true,
    "Fri": true,
    "Sat": true,
    "Sun": true
  },
  "cloudId": "REALCLOUDID-1",
  "lightId": "5f4e47660bc0da0004b4fe16"
}
export const switchOn100Range: HueBehaviourWrapper = {
  "type": "BEHAVIOUR",
  "data": {
    "action": {"type": "BE_ON", "data": 100},
    "time": {
      "type": "RANGE",
      "from": {"type": "CLOCK", "data": {"hours": 13, "minutes": 15}},
      "to": {"type": "SUNSET", "offsetMinutes": 0}

    },
    "presence": {"type": "IGNORE"}
  },
  "activeDays": {
    "Mon": true,
    "Tue": true,
    "Wed": true,
    "Thu": true,
    "Fri": true,
    "Sat": true,
    "Sun": true
  },
  "cloudId": "CLOUDID-2121",
  "lightId": "5f4e47660bc0da0004b4fe16"
}


export const switchOn70Range1310sunset: HueBehaviourWrapper = {
  "type": "BEHAVIOUR",
  "data": {
    "action": {"type": "BE_ON", "data": 70},
    "time": {
      "type": "RANGE",
      "from": {"type": "CLOCK", "data": {"hours": 13, "minutes": 10}},
      "to": {"type": "SUNSET", "offsetMinutes": 0}

    },
    "presence": {"type": "IGNORE"}
  },
  "activeDays": {
    "Mon": true,
    "Tue": true,
    "Wed": true,
    "Thu": true,
    "Fri": true,
    "Sat": true,
    "Sun": true
  },
  "cloudId": "CLOUDID-2122",
  "lightId": "5f4e47660bc0da0004b4fe16"
}


export const switchOn30Range: HueBehaviourWrapper = {
  "type": "BEHAVIOUR",
  "data": {
    "action": {"type": "BE_ON", "data": 30},
    "time": {
      "type": "RANGE",
      "from": {"type": "CLOCK", "data": {"hours": 13, "minutes": 20}},
      "to": {"type": "SUNSET", "offsetMinutes": 0}

    },
    "presence": {"type": "IGNORE"}
  },
  "activeDays": {
    "Mon": true,
    "Tue": true,
    "Wed": true,
    "Thu": true,
    "Fri": true,
    "Sat": true,
    "Sun": true
  },
  "cloudId": "CLOUDID-2123",
  "lightId": "5f4e47660bc0da0004b4fe16"
}


export const switchOn50Range23500500: HueBehaviourWrapper = {
  "type": "BEHAVIOUR",
  "data": {
    "action": {"type": "BE_ON", "data": 50},
    "time": {
      "type": "RANGE",
      "from": {"type": "CLOCK", "data": {"hours": 23, "minutes": 50}},
      "to": {"type": "CLOCK", "data": {"hours": 5, "minutes": 0}}

    },
    "presence": {"type": "IGNORE"}
  },
  "activeDays": {
    "Mon": true,
    "Tue": true,
    "Wed": true,
    "Thu": true,
    "Fri": true,
    "Sat": true,
    "Sun": true
  },
  "cloudId": "ACTUALCLOUDID-3",
  "lightId": "5f4e47660bc0da0004b4fe16"
}


export const switchOnAllDayRoom1: HueBehaviourWrapper = {
  "type": "BEHAVIOUR",
  "data": {
    "action": {"type": "BE_ON", "data": 100},
    "time": {
      "type": "ALL_DAY"

    },
    "presence": {"type": "SOMEBODY", "data": {"type": "LOCATION", "locationIds": [1]}, "delay": 300}
  },
  "activeDays": {
    "Mon": true,
    "Tue": true,
    "Wed": true,
    "Thu": true,
    "Fri": true,
    "Sat": true,
    "Sun": true
  },
  "cloudId": "ACTUALCLOUDID-6",
  "lightId": "5f4e47660bc0da0004b4fe16"
}

export const switchOn80AllDayRoom1n2: HueBehaviourWrapper = {
  "type": "BEHAVIOUR",
  "data": {
    "action": {"type": "BE_ON", "data": 80},
    "time": {
      "type": "ALL_DAY"

    },
    "presence": {"type": "SOMEBODY", "data": {"type": "LOCATION", "locationIds": [1, 2]}, "delay": 300}
  },
  "activeDays": {
    "Mon": true,
    "Tue": true,
    "Wed": true,
    "Thu": true,
    "Fri": true,
    "Sat": true,
    "Sun": true
  },
  "cloudId": "ACTUALCLOUDID-12",
  "lightId": "5f4e47660bc0da0004b4fe16"
}

export const switchOn60AllDayRoom3: HueBehaviourWrapper = {
  "type": "BEHAVIOUR",
  "data": {
    "action": {"type": "BE_ON", "data": 60},
    "time": {
      "type": "ALL_DAY"

    },
    "presence": {"type": "SOMEBODY", "data": {"type": "LOCATION", "locationIds": [3]}, "delay": 300}
  },
  "activeDays": {
    "Mon": true,
    "Tue": true,
    "Wed": true,
    "Thu": true,
    "Fri": true,
    "Sat": true,
    "Sun": true
  },
  "cloudId": "ACTUALCLOUDID-9",
  "lightId": "5f4e47660bc0da0004b4fe16"
}

export const switchOn40WhenInRoom5n6: HueBehaviourWrapper = {
  "type": "BEHAVIOUR",
  "data": {
    "action": {"type": "BE_ON", "data": 40},
    "time": {
      "type": "ALL_DAY"

    },
    "presence": {"type": "SOMEBODY", "data": {"type": "LOCATION", "locationIds": [5, 6]}, "delay": 300}
  },
  "activeDays": {
    "Mon": true,
    "Tue": true,
    "Wed": true,
    "Thu": true,
    "Fri": true,
    "Sat": true,
    "Sun": true
  },
  "cloudId": "ACTUALCLOUDID-999",
  "lightId": "5f4e47660bc0da0004b4fe16"
}

export const switchOn50Sphere: HueBehaviourWrapper = {
  "type": "BEHAVIOUR",
  "data": {
    "action": {"type": "BE_ON", "data": 50},
    "time": {
      "type": "ALL_DAY"

    },
    "presence": {
      "type": "SOMEBODY", "data": {"type": "SPHERE"}, "delay": 300
    },
  },
  "activeDays": {
    "Mon": true,
    "Tue": true,
    "Wed": true,
    "Thu": true,
    "Fri": true,
    "Sat": true,
    "Sun": true
  },
  "cloudId": "ACTUALCLOUDID-169",
  "lightId": "5f4e47660bc0da0004b4fe16"
}


export const switchOn20Between19002200: HueBehaviourWrapper = {
  "type": "BEHAVIOUR",
  "data": {
    "action": {"type": "BE_ON", "data": 20},
    "time": {
      "type": "RANGE",
      "from": {"type": "CLOCK", "data": {"hours": 19, "minutes": 0}},
      "to": {"type": "CLOCK", "data": {"hours": 22, "minutes": 0}}

    },
    "presence": {
      "type": "IGNORE"
    }
  },
  "activeDays": {
    "Mon": true,
    "Tue": true,
    "Wed": true,
    "Thu": true,
    "Fri": true,
    "Sat": true,
    "Sun": true
  },
  "cloudId": "ACTUALCLOUDID-129",
  "lightId": "5f4e47660bc0da0004b4fe16"
}


export const switchOn10AllDay: HueBehaviourWrapper = {
  "type": "BEHAVIOUR",
  "data": {
    "action": {"type": "BE_ON", "data": 10},
    "time": {
      "type": "ALL_DAY"

    },
    "presence": {
      "type": "IGNORE"
    },
  },
  "activeDays": {
    "Mon": true,
    "Tue": true,
    "Wed": true,
    "Thu": true,
    "Fri": true,
    "Sat": true,
    "Sun": true
  },
  "cloudId": "ACTUALCLOUDID-149",
  "lightId": "5f4e47660bc0da0004b4fe16"
}

export const switchOn80Range13001500: HueBehaviourWrapper = {
  "type": "BEHAVIOUR",
  "data": {
    "action": {"type": "BE_ON", "data": 80},
    "time": {
      "type": "RANGE",
      "from": {"type": "CLOCK", "data": {"hours": 13, "minutes": 0}},
      "to": {"type": "CLOCK", "data": {"hours": 15, "minutes": 0}}

    },
    "presence": {"type": "IGNORE"}
  },
  "activeDays": {
    "Mon": true,
    "Tue": true,
    "Wed": true,
    "Thu": true,
    "Fri": true,
    "Sat": true,
    "Sun": true
  },
  "cloudId": "CLOUDID-2125",
  "lightId": "5f4e47660bc0da0004b4fe16"
}

export const twilight70Range12001500: HueBehaviourWrapper = {
  "type": "TWILIGHT",
  "data": {
    "action": {"type": "DIM_WHEN_TURNED_ON", "data": 70},
    "time": {
      "type": "RANGE",
      "from": {"type": "CLOCK", "data": {"hours": 12, "minutes": 0}},
      "to": {"type": "CLOCK", "data": {"hours": 15, "minutes": 0}}

    }
  },
  "activeDays": {
    "Mon": true,
    "Tue": true,
    "Wed": true,
    "Thu": true,
    "Fri": true,
    "Sat": true,
    "Sun": true
  },
  "cloudId": "CLOUDID-2126",
  "lightId": "5f4e47660bc0da0004b4fe16"
}