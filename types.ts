type PoiData = {
  address: string;
  score: number;
  location: {
    x: number;
    y: number;
    z: number;
  };
  attributes: {
    ResultID: number;
    Loc_name: string | null;
    Status: string;
    Score: number;
    Match_addr: string;
    Xmin: number;
    Xmax: number;
    Ymin: number;
    Ymax: number;
    Addr_type: string;
  };
};

export type NetworkData = {
  layerId: number;
  layerName: string;
  displayFieldName: string;
  foundFieldName: string;
  value: string;
  attributes: {
    OBJECTID: number;
    SHAPE: string;
    NAME: string;
    CODE: string;
    CATEGORY: string;
    SHAPE_Leng: string;
    ORIG_FID: number;
    FLOOR: string;
  };
  geometryType: string;
  geometry: {
    x: number;
    y: number;
    z: number;
    spatialReference: {
      wkid: number;
      latestWkid: number;
    };
  };
};

export type PoiLocatedVenue = {
  venue: string;
  poiData: PoiData;
};

export type CompleteVenue = {
  venue: string;
  poiData: PoiData;
  networkData?: NetworkData;
};

export type Venue = {
  corsRoomCode: string;
  details?: {
    nusRoomCode: string;
    roomName: string;
    floor: number | null;
    location: {
      epsg3414: {
        x: number;
        y: number;
        z: number;
      };
      wgs84: {
        x: number;
        y: number;
        z: number;
      };
    };
  };
};
