import timezoneJS from 'timezone-js';

// init tz data
import tzdata from 'tzdata';
const _tz = timezoneJS.timezone;
_tz.loadingScheme = _tz.loadingSchemes.MANUAL_LOAD;
_tz.loadZoneDataFromObject(tzdata);

export function dateAtTimezone(tz) {
   return tz ? new timezoneJS.Date(new Date(), tz) : new Date();
}
