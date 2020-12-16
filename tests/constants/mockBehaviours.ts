export const switchOnWhenAny1Home: BehaviourWrapper = {
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
  "cloudId": "CLOUDID-1124"
}

export const switchOn80WhenAny1Home: BehaviourWrapper = {
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
}

export const switchOnOnlyAtWeekend: BehaviourWrapper = {
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
  "cloudId": "CLOUDID-1126"
}

export const switchOnBetweenRangeWithSpherePresence: BehaviourWrapper = {
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
  "cloudId": "CLOUDID-1127"
}


export const switchOnAllDayIgnorePresence: BehaviourWrapper = {
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
  "cloudId": "CLOUDID-1128"
}


export const twilightDim50AllDay: BehaviourWrapper = {
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
  "cloudId": "CLOUD-ID-123123"
}

export const twilightDim50AllDayUpdated100: BehaviourWrapper = {
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
  "cloudId": "CLOUD-ID-123123"
}

export const twilight40BetweenSunriseSunset: BehaviourWrapper = {
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
  "cloudId": "CLOUDID-1129"
}


export const twilight80BetweenSunriseSunset: BehaviourWrapper = {
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
  "cloudId": "CLOUDID-2120"
}


export const twilight60BetweenRange: BehaviourWrapper = {
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
  "cloudId": "REALCLOUDID-1"
}
export const switchOn100Range: BehaviourWrapper = {
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
  "cloudId": "CLOUDID-2121"
}


export const switchOn70Range1310sunset: BehaviourWrapper = {
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
  "cloudId": "CLOUDID-2122"
}


export const switchOn30Range: BehaviourWrapper = {
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
  "cloudId": "CLOUDID-2123"
}


export const switchOn50Range23500500: BehaviourWrapper = {
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
  "cloudId": "ACTUALCLOUDID-3"
}


export const switchOnAllDayRoom1: BehaviourWrapper = {
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
  "cloudId": "ACTUALCLOUDID-6"
}

export const switchOn80AllDayRoom1n2: BehaviourWrapper = {
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
  "cloudId": "ACTUALCLOUDID-12"
}

export const switchOn60AllDayRoom3: BehaviourWrapper = {
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
  "cloudId": "ACTUALCLOUDID-9"
}

export const switchOn40WhenInRoom5n6: BehaviourWrapper = {
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
  "cloudId": "ACTUALCLOUDID-999"
}

export const switchOn50Sphere: BehaviourWrapper = {
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
  "cloudId": "ACTUALCLOUDID-169"
}


export const switchOn20Between19002200: BehaviourWrapper = {
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
  "cloudId": "ACTUALCLOUDID-129"
}


export const switchOn10AllDay: BehaviourWrapper = {
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
  "cloudId": "ACTUALCLOUDID-149"
}

export const colorOn10AllDay: BehaviourWrapper = {
  "type": "BEHAVIOUR",
  "data": {
    "action": {"type": "BE_COLOR", "data": {type:"COLOR", brightness: 10, hue: 254, saturation: 100}},
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
  "cloudId": "ACTUALCLOUDID-1349"
}

export const switchOn80Range13001500: BehaviourWrapper = {
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
  "cloudId": "CLOUDID-2125"
}

export const colorOn80Range13001500: BehaviourWrapper = {
  "type": "BEHAVIOUR",
  "data": {
    "action": {"type": "BE_COLOR", "data": {type:"COLOR", saturation: 100, hue:144, brightness: 80}},
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
  "cloudId": "CLOUDID-24125"
}



export const temp2400On60Range14001500: BehaviourWrapper = {
  "type": "BEHAVIOUR",
  "data": {
    "action": {"type": "BE_COLOR", "data": {type:"COLOR_TEMPERATURE", temperature:2400, brightness: 60}},
    "time": {
      "type": "RANGE",
      "from": {"type": "CLOCK", "data": {"hours": 14, "minutes": 0}},
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
  "cloudId": "CLOUDID-5125"
}
export const twilight70Range12001500: BehaviourWrapper = {
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
  "cloudId": "CLOUDID-2126"
}