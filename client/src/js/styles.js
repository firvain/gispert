import ol from "openlayers";

const image = new ol.style.Circle({
  radius: 4,
  fill: null,
  stroke: new ol.style.Stroke({
    color: "blue",
    width: 1
  })
});

const styles = {
  Point: new ol.style.Style({
    image
  }),
  LineString: new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: "blue",
      width: 1
    })
  }),
  BoldLineString: new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: "red",
      width: 2.5
    })
  }),
  MultiLineString: new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: "green",
      width: 1
    })
  }),
  MultiPoint: new ol.style.Style({
    image
  }),
  MultiPolygon: new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: "yellow",
      width: 1
    }),
    fill: new ol.style.Fill({
      color: "rgba(255, 255, 0, 0.1)"
    })
  }),
  Polygon: new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: "blue",
      width: 1
    }),
    fill: new ol.style.Fill({
      color: "rgba(0, 0, 255, 0.1)"
    })
  }),
  GeometryCollection: new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: "magenta",
      width: 2
    }),
    fill: new ol.style.Fill({
      color: "rgba(255, 255, 0, 0.1)"
    }),
    image: new ol.style.Circle({
      radius: 10,
      fill: null,
      stroke: new ol.style.Stroke({
        color: "magenta"
      })
    })
  }),
  Circle: new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: "red",
      width: 2
    }),
    fill: new ol.style.Fill({
      color: "rgba(255,0,0,0.2)"
    })
  }),
  selectedPoint: new ol.style.Style({
    image: new ol.style.Circle({
      radius: 5,
      fill: new ol.style.Fill({
        color: "orange"
      }),
      stroke: new ol.style.Stroke({
        color: "red",
        width: 2
      })
    })
  }),
  selectedLineString: new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: "orange",
      width: 1
    })
  }),
  selectedPolygon: new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: "orange",
      width: 3
    }),
    fill: new ol.style.Fill({
      color: "rgba(0, 0, 255, 0.1)"
    })
  })
};

export default styles;
