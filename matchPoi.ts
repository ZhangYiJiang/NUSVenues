import axios from 'axios'
import * as _ from 'lodash'
import * as fs from 'fs-extra'
import * as proj4 from "proj4";
import { PlaceOfInterest, Venue } from "./types";

// EPSG:3414 def to convert location coords to WGS84
// Obtained from https://epsg.io/3414
proj4.defs(
  "EPSG:3414",
  "+proj=tmerc +lat_0=1.366666666666667 +lon_0=103.8333333333333 +k=1 +x_0=28001.642 +y_0=38744.572 +ellps=WGS84 +units=m +no_defs"
);

async function matchPoI() {
  let [placesOfInterest, venues, mappedVenues]: [PlaceOfInterest[], string[], { [venue: string]: Object }] = await Promise.all([
    fs.readJSON('./poi.json'),
    axios.get('http://api.nusmods.com/2018-2019/2/venues.json').then(res => res.data),
    axios.get('http://github.nusmods.com/venues').then(res => res.data),
  ]);

  const matches = {};

  // First match venue to code strictly
  let rooms = _.keyBy(
    placesOfInterest.filter(poi => poi.attributes.CATEGORY === 'ROOM'),
    'attributes.CODE'
  );

  venues.forEach(venue => {
    if (rooms[venue]) {
      matches[venue] = rooms[venue];
      delete rooms[venue];
    }
  });

  venues = venues.filter(venue => !matches[venue]);
  console.log(`Matched ${_.size(matches)} venues after first round`);

  // Then match without hyphens and other special characters
  rooms = _.keyBy(
    _.values(rooms),
    (poi: PlaceOfInterest) => poi.attributes.CODE
      .replace(/[-_/ ]/g, '')
      .replace(/\([^)]*\)/g, '')
  );

  venues.forEach(venue => {
    const cleanVenue = venue.replace(/[-_/]/g, '');
    if (rooms[cleanVenue]) {
      matches[venue] = rooms[cleanVenue];
      delete rooms[cleanVenue];
    }
  });

  venues = venues.filter(venue => !matches[venue]);

  // Output
  console.log(`Matched ${_.size(matches)} venues after second round`);
  console.log(`${_.size(rooms)} rooms unmatched / ${venues.length} venues unmatched`);

  console.log('########## NEW VENUES ##########');
  const newVenueKeys = _.difference(Object.keys(matches), Object.keys(mappedVenues));
  console.log(newVenueKeys.toString());

  const newVenues = _.pick(matches, ...newVenueKeys);
  const newVenuesCleaned = _.mapValues(newVenues, (poi: PlaceOfInterest, venue: string) => cleanData(venue, poi));
  console.log(JSON.stringify(newVenuesCleaned, null, 2));

  await fs.outputJSON('results/matchedPOI.json', newVenuesCleaned, { spaces: 2 })
}

const proj = proj4("EPSG:3414", "EPSG:4326");
// Convenience function to calculate WGS84 coords from EPSG:3414 coords
const wgs84Coords = (location: { x: number; y: number; z: number }) =>
  proj.forward(location);

function cleanData(
  venue: string,
  poi: PlaceOfInterest
): Venue {
  const { attributes, geometry } = poi;
  const data: Venue = { corsRoomCode: venue };

  if (attributes && geometry) {
    data.details = {
      nusRoomCode: attributes.CODE,
      roomName: attributes.NAME,
      floor: attributes.FLOOR,

      location: {
        epsg3414: poi.geometry,
        wgs84: wgs84Coords(poi.geometry)
      }
    }
  }

  return data;
}

matchPoI();
