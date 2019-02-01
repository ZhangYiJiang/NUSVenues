import axios from 'axios'
import * as fs from 'fs-extra'
import * as _ from 'lodash'
import { PlaceOfInterest } from "./types";

const POI_NETWORK_URL = 'https://arcgis.ami-lab.org/arcgis/rest/services/FULL_NUS_NETWORK_051017/FULL_NUS_NETWORK_150118/MapServer/8/query';

/**
 * Load all places of interest from an NUS ArcGIS database
 */

async function getPoi() {
  let lastId = 0;
  let features;
  const allPlaces = [];

  // Repeatedly query the POI endpoint for features until it runs out
  do {
    const where = `OBJECTID > ${lastId}`;

    const res = await axios.get<{ features: PlaceOfInterest[] }>(POI_NETWORK_URL, {
      params: {
        where,
        // Return all fields
        outFields: '*',
        // Return x and y
        returnGeometry: true,
        // Return z (altitude - unreliable)
        returnZ: true,
        returnM: true,
        // Return it as JSON
        f: 'json'
      }
    });

    features = res.data.features;
    allPlaces.push(...features);

    const lastFeature: PlaceOfInterest | void = _.last(features);
    if (lastFeature) {
      lastId = lastFeature.attributes.OBJECTID;
    } else {
      break;
    }

    console.log(`Queried ${features.length} POI with lastId = ${lastId}`);
  } while (features.length > 0);

  fs.outputJSON('poi.json', allPlaces, { spaces: 2 })
}

getPoi();
