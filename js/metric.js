const CONSTANTS = {
    meter_unit: 'm',
    kilometers_unit: "km",
    millimetres_unit: "mm",
    kilometer_per_hour: "km/h",
    meters_per_second: "m/s",
    millimeters_per_milliseconds: "mm/ms",
    seconds_per_hour: 3600
}

class Speed {

    /**
     *
     * @param speed Speed in <unit>/<time>
     * @param speed_unit unit of speed
     */
    constructor(speed, speed_unit) {
        this.speed = speed
        this.speed_unit = speed_unit
    }

    /**
     * Get km/h
     * @returns {number|*}
     */
    as_kilometer_per_hour() {
        switch (this.speed_unit) {
            case CONSTANTS.kilometer_per_hour:
                return this.speed
            case CONSTANTS.meters_per_second:
                return this.speed * 3.6
            case CONSTANTS.millimeters_per_milliseconds:
                return this.speed * 3.6

        }
    }

    /**
     * Get m/s
     * @returns {number|*}
     */
    as_meters_per_second() {
        switch (this.speed_unit) {
            case CONSTANTS.kilometer_per_hour:
                return this.speed / 3.6
            case CONSTANTS.meters_per_second:
                return this.speed
            case CONSTANTS.millimeters_per_milliseconds:
                return this.speed
        }
    }

    /**
     * Get mm/ms
     * @returns {number|*}
     */
    as_millimeters_per_milliseconds() {
        // Same ratio
        return this.as_meters_per_second()
    }

    add_speed(speed) {
        return new Speed(speed.as_kilometer_per_hour() + this.as_kilometer_per_hour(), CONSTANTS.kilometer_per_hour)
    }

    get_speed_from_percentage_vma(vma_percentage) {
        return new Speed((this.as_kilometer_per_hour() * vma_percentage) / 100, CONSTANTS.kilometer_per_hour)
    }

    get_string() {
        return `${this.speed}${this.speed_unit}`
    }
}

class Distance {
    constructor(distance, unit) {
        this.distance = distance
        this.unit = unit
    }

    as_kilometers() {
        switch (this.unit) {
            case CONSTANTS.kilometers_unit:
                return this.distance
            case CONSTANTS.meter_unit:
                return this.distance / 1000
            case CONSTANTS.millimetres_unit:
                return this.distance / 1000000
        }
    }

    as_meters() {
        switch (this.unit) {
            case CONSTANTS.kilometers_unit:
                return this.distance * 1000
            case CONSTANTS.meter_unit:
                return this.distance
            case CONSTANTS.millimetres_unit:
                return this.distance / 1000
        }
    }

    as_millimeter() {
        switch (this.unit) {
            case CONSTANTS.kilometers_unit:
                return this.distance * 1000000
            case CONSTANTS.meter_unit:
                return this.distance * 1000
            case CONSTANTS.millimetres_unit:
                return this.distance
        }
    }

    add_distance(distance) {
        let new_d = distance.as_millimeter() + this.as_millimeter()
        new_d = new Distance(new_d, CONSTANTS.millimetres_unit)
        // Maximise the unit for display
        if (new_d.as_kilometers() > 1)
            return new Distance(new_d.as_kilometers(), CONSTANTS.kilometers_unit)
        if (new_d.as_meters() > 1)
            return new Distance(new_d.as_meters(), CONSTANTS.meter_unit)
        else
            return new_d
    }

    get_string() {
        return `${this.distance}${this.unit}`
    }
}

class Time {
    constructor(distance, speed) {
        this.distance = distance
        this.speed = speed
    }

    get_time() {
        let milliseconds_time = this.distance.as_millimeter() / this.speed.as_millimeters_per_milliseconds()
        let date = new Date(milliseconds_time);
        return date.getHours() - 1 + 'h' + date.getMinutes() + '\'' + date.getSeconds() + '"' + date.getMilliseconds();
    }
}

// in M
const MARATHON_DIST = new Distance(42.195, CONSTANTS.kilometers_unit)
const HALF_MARATHON_DIST = new Distance(21.0975, CONSTANTS.kilometers_unit)

/**
 *
 * @param vma_speed (Speed)
 * @param percentage_vma_min (int)
 * @param percentage_vma_max (int)
 * @param percentage_vma_step (int)
 * @param distance_min (Distance)
 * @param distance_max (Distance)
 * @param distance_step (Distance)
 */
function creat_vma_array(vma_speed, percentage_vma_min, percentage_vma_max, percentage_vma_step,
                         distance_min, distance_max, distance_step) {

    // Creat distances list with all distances
    let distances = [distance_min, distance_min.add_distance(distance_step)]
    // Add untile we rich the max distance
    while (distances[distances.length - 1].as_millimeter() <= distance_max.as_millimeter())
        distances.push(distances[distances.length - 1].add_distance(distance_step))

    /**
     * Key: (string) VMA in percentage
     * Value: (dict) in format
     *  {
     *      speed_from_percentage_vma: (Speed) converted speed of the githe vma percentage,
     *      time: (dict) {
     *          "distance label": (Time) Time to do this distance basted on speed_from_percentage_vma,
     *          ...
     *      }
     *  }
     * @type {{}}
     */
    let res = {}
    let speed_from_percentage_vma
    for (let p = percentage_vma_min; p <= percentage_vma_max; p += percentage_vma_step) {
        speed_from_percentage_vma = vma_speed.get_speed_from_percentage_vma(p)
        let time_from_speed_dist = {}
        distances.forEach(function (distance) {
            time_from_speed_dist[distance.get_string()] = new Time(distance, speed_from_percentage_vma)
        })
        time_from_speed_dist[HALF_MARATHON_DIST.get_string()] = new Time(HALF_MARATHON_DIST, speed_from_percentage_vma)
        time_from_speed_dist[MARATHON_DIST.get_string()] = new Time(MARATHON_DIST, speed_from_percentage_vma)
        res[`${p}%`] = {"speed_from_percentage_vma": speed_from_percentage_vma, "time":time_from_speed_dist}
    }
    return res
}
