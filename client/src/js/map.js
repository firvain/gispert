import ol from 'openlayers';
// import Vue from 'vue';
// import Vuex from 'vuex';
import store from '../store';

const mapCenter = [2425483, 4910237];

// const geoJSONFormat = new ol.format.GeoJSON({
//   defaultDataProjection: 'EPSG:4326',
// });

const bingMapsAerial = new ol.layer.Tile({
  preload: Infinity,
  visible: false,
  name: 'bing',
  source: new ol.source.BingMaps({
    key: 'Ap3sskZ5BccP6TvBr0FoLc9orA4_R1uh-8UjpOKYciXL1hNMtAJr_BdxMjTJNkpv',
    imagerySet: 'AerialWithLabels',
  }),
});

const getHashtags = function getText(feature) {
  const hashtags = feature.get('hashtags');
  const measurement = feature.get('measurement');
  const name = feature.get('name');
  let messages = feature.get('messages');

  if (messages !== undefined) {
    const n = messages.replace(/ *\([^)]*\) */g, '').split('\n');
    const n1 = n.slice(Math.max(n.length - 5, 0));
    const n2 = n1.join('\n');
    messages = n2;
  }

  const labelArray = [];
  const textArray = [messages, measurement, hashtags, name];
  textArray.forEach((t) => {
    if (t !== undefined) {
      labelArray.push(t);
    }
  });
  let text = labelArray[0];
  if (labelArray.length === 0) {
    text = '';
  }
  return text;
};

function normalStyle(feature) {
  let style;
  if (feature.getGeometry().getType() === 'Point') {
    const strokeWidth = feature.get('strkWdth');
    const strokeColor = feature.get('strkClr');
    const fillColor = feature.get('fllClr');

    let setStrokeWidth;
    let setStrokeColor;
    let setFillColor;

    if (strokeWidth !== undefined) {
      setStrokeWidth = strokeWidth;
    } else {
      setStrokeWidth = 2;
    }
    if (strokeColor !== undefined) {
      setStrokeColor = strokeColor;
    } else {
      setStrokeColor = 'blue';
    }
    if (fillColor !== undefined) {
      setFillColor = fillColor;
    } else {
      setFillColor = 'rgba(255, 255, 255, 0.4)';
    }

    style = new ol.style.Style({
      fill: new ol.style.Fill({
        color: 'rgba(255, 255, 255, 0.4)',
      }),
      stroke: new ol.style.Stroke({
        color: setStrokeColor,
        width: setStrokeWidth,
      }),
      image: new ol.style.Circle({
        radius: 5,
        fill: new ol.style.Fill({
          color: setFillColor,
        }),
        stroke: new ol.style.Stroke({
          color: setStrokeColor,
          width: setStrokeWidth,
        }),
      }),
      text: new ol.style.Text({
        font: 'bold 12px Verdana',
        text: getHashtags(feature),
        fill: new ol.style.Fill({
          color: 'blue',
        }),
        stroke: new ol.style.Stroke({
          color: 'white',
          width: 2,
        }),
        offsetY: -15,
      }),
    });
  }
  if (feature.getGeometry().getType() === 'LineString') {
    const strokeWidth = feature.get('strkWdth');
    const strokeColor = feature.get('strkClr');
    // const start = feature.getGeometry().getFirstCoordinate();
    // const end = feature.getGeometry().getLastCoordinate();

    // const dx = end[0] - start[0];
    // const dy = end[1] - start[1];
    // const rotation = Math.atan2(dy, dx);

    let setStrokeWidth;
    let setStrokeColor;

    if (strokeWidth !== undefined) {
      setStrokeWidth = strokeWidth;
    } else {
      setStrokeWidth = 2;
    }
    if (strokeColor !== undefined) {
      setStrokeColor = strokeColor;
    } else {
      setStrokeColor = 'blue';
    }

    style = new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: setStrokeColor,
        width: setStrokeWidth,
      }),
      text: new ol.style.Text({
        font: 'bold 12px Verdana',
        text: getHashtags(feature),
        fill: new ol.style.Fill({
          color: 'blue',
        }),
        stroke: new ol.style.Stroke({
          color: 'white',
          width: 3.5,
        }),
        offsetY: -15,
      }),
    });
  }
  if (feature.getGeometry().getType() === 'Polygon') {
    const strokeWidth = feature.get('strkWdth');
    const strokeColor = feature.get('strkClr');
    const fillColor = feature.get('fllClr');

    let setStrokeWidth;
    let setStrokeColor;
    let setFillColor;

    if (strokeWidth !== undefined) {
      setStrokeWidth = strokeWidth;
    } else {
      setStrokeWidth = 2;
    }
    if (strokeColor !== undefined) {
      setStrokeColor = strokeColor;
    } else {
      setStrokeColor = 'blue';
    }
    if (fillColor !== undefined) {
      setFillColor = fillColor;
    } else {
      setFillColor = 'rgba(255, 255, 255, 0.4)';
    }

    style = new ol.style.Style({
      fill: new ol.style.Fill({
        color: 'rgba(255, 255, 255, 0.4)',
      }),
      stroke: new ol.style.Stroke({
        color: setStrokeColor,
        width: setStrokeWidth,
      }),
      image: new ol.style.Circle({
        radius: 5,
        fill: new ol.style.Fill({
          color: setFillColor,
        }),
        stroke: new ol.style.Stroke({
          color: setStrokeColor,
          width: setStrokeWidth,
        }),
      }),
      text: new ol.style.Text({
        font: 'bold 12px Verdana',
        text: getHashtags(feature),
        fill: new ol.style.Fill({
          color: 'blue',
        }),
        stroke: new ol.style.Stroke({
          color: 'white',
          width: 3.5,
        }),
        offsetY: -15,
      }),
    });
  }
  return [style];
}

function selectedStyle(feature) {
  const setstrkWidth = 2;
  const setstrkColor = 'white';
  const setFillColor = 'rgba(0, 0, 255, 0.2)';
  let style;
  if (feature.getGeometry().getType() === 'Point') {
    style = new ol.style.Style({
      fill: new ol.style.Fill({
        color: setFillColor,
      }),
      stroke: new ol.style.Stroke({
        color: setstrkColor,
        width: setstrkWidth,
      }),
      image: new ol.style.Circle({
        radius: 5,
        fill: new ol.style.Fill({
          color: setFillColor,
        }),
        stroke: new ol.style.Stroke({
          color: setstrkColor,
          width: setstrkWidth,
        }),
      }),
      text: new ol.style.Text({
        font: 'bold 12px Verdana',
        text: getHashtags(feature),
        fill: new ol.style.Fill({
          color: 'orange',
        }),
        stroke: new ol.style.Stroke({
          color: 'red',
          width: 3.5,
        }),
        offsetY: -15,
      }),
    });
  }
  if (feature.getGeometry().getType() === 'LineString') {
    style = new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: setstrkColor,
        width: setstrkWidth,
      }),
      text: new ol.style.Text({
        font: 'bold 12px Verdana',
        text: getHashtags(feature),
        fill: new ol.style.Fill({
          color: 'blue',
        }),
        stroke: new ol.style.Stroke({
          color: 'white',
          width: 3.5,
        }),
        offsetY: -15,
      }),
    });
  }
  if (feature.getGeometry().getType() === 'Polygon') {
    style = new ol.style.Style({
      fill: new ol.style.Fill({
        color: setFillColor,
      }),
      stroke: new ol.style.Stroke({
        color: setstrkColor,
        width: setstrkWidth,
      }),
      image: new ol.style.Circle({
        radius: 5,
        fill: new ol.style.Fill({
          color: setFillColor,
        }),
        stroke: new ol.style.Stroke({
          color: setstrkColor,
          width: setstrkWidth,
        }),
      }),
      text: new ol.style.Text({
        font: 'bold 12px Verdana',
        text: getHashtags(feature),
        fill: new ol.style.Fill({
          color: 'blue',
        }),
        stroke: new ol.style.Stroke({
          color: 'white',
          width: 3.5,
        }),
        offsetY: -15,
      }),
    });
  }
  return [style];
}


const customLayer = new ol.layer.Vector({
  style: normalStyle,
  source: new ol.source.Vector(),
  name: 'customLayer',
});

const dragAndDropInteraction = new ol.interaction.DragAndDrop({
  formatConstructors: [
    ol.format.GPX,
    ol.format.GeoJSON,
    ol.format.IGC,
    ol.format.KML,
    ol.format.TopoJSON,
  ],
});

// const overlay = new ol.Overlay();
const olMap = new ol.Map({
  target: 'map',
  interactions: ol.interaction.defaults().extend([dragAndDropInteraction]),
  layers: [
    bingMapsAerial,
    new ol.layer.Tile({
      name: 'esri',
      source: new ol.source.XYZ({
        attributions: 'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/' +
            'rest/services/World_Topo_Map/MapServer">ArcGIS</a>',
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/' +
            'World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
      }),
    }),
    // new ol.layer.Tile({
    //   name: 'here',
    //   visible: true,
    //   preload: Infinity,
    //   source: new ol.source.XYZ({
    //     url: 'https://{1-4}.{aerial}.maps.cit.api.here.com' +
    //     '/{maptile}/2.1/maptile/newest/{hybrid.day}/{z}/{x}/{y}/256/png' +
    //     '?app_id={app_id}&app_code={app_code}',
    //     attributions: `Map Tiles &copy; ' ${new Date().getFullYear()} '<a href="http://developer.here.com">HERE</a>`,
    //   }),
    // }),
    customLayer,
  ],
  // overlays: [overlay],
  view: new ol.View({
    center: mapCenter,
    zoom: 16,
    maxZoom: 19,
  }),
  selectedItem: null,
});

// overlay.setPosition([218000, 4500000]);

dragAndDropInteraction.on('addfeatures', (event) => {
  customLayer.getSource().addFeatures(event.features);
  olMap.getView().fit(customLayer.getSource().getExtent());
});

const collection = new ol.Collection();
const selectClick = new ol.interaction.Select({
  layers: [customLayer],
  condition: ol.events.condition.click,
  style: selectedStyle,
});
selectClick.getFeatures().on('change:length', () => {
  const length = selectClick.getFeatures().getLength();
  if (length > 1) {
    selectClick.getFeatures().clear();
    collection.clear();
  } else if (length === 0) {
    collection.clear();
  } else if (length === 1) {
    collection.push(selectClick.getFeatures().item(0));
    collection.item(0).getProperties();
    olMap.selectedItem = collection.item(0);
  }
});

const drawPoint = new ol.interaction.Draw({
  source: customLayer.getSource(),
  type: ('Point'),
  name: 'point',
});

const drawLineString = new ol.interaction.Draw({
  source: customLayer.getSource(),
  type: ('LineString'),
  name: 'line',
});

const drawPolygon = new ol.interaction.Draw({
  source: customLayer.getSource(),
  type: ('Polygon'),
  name: 'polygon',
});

// eslint-disable-next-line
const drawBox = new ol.interaction.Draw({
  source: customLayer.getSource(),
  type: ('Circle'),
  name: 'box',
  geometryFunction: ol.interaction.Draw.createBox(),
});

olMap.addInteraction(selectClick);
olMap.addInteraction(drawPoint);
olMap.addInteraction(drawLineString);
olMap.addInteraction(drawPolygon);
olMap.addInteraction(drawBox);

drawPoint.setProperties({ name: 'Point' });
drawLineString.setProperties({ name: 'LineString' });
drawPolygon.setProperties({ name: 'Polygon' });
drawBox.setProperties({ name: 'Box' });

drawPoint.setActive(false);
drawLineString.setActive(false);
drawPolygon.setActive(false);
drawBox.setActive(false);
selectClick.setActive(true);

selectClick.on('select', () => {
  const selectedFeature = selectClick.getFeatures().item(0);
  olMap.selectedFeature = selectedFeature;
  // console.log(selectedFeature);
  store.commit('setSelected', selectedFeature);
  // console.log(store.state.count);
});

drawPoint.on('drawend', (e) => {
  e.feature.setProperties({
    strkWdth: 1,
    strkClr: 'blue',
    // fllClr: 'orange',
  });
  if (store.state.questionnaireMode === 'normal') {
    store.commit('newPostFeature', e.feature);
    store.commit('setUserPostProperties', [{ property: 'userFeatures', value: new ol.format.GeoJSON().writeFeatures([e.feature]) }]);
  } else {
    store.commit('addQuestionnaireFeature', e.feature);
    drawPoint.setActive(false);
    drawLineString.setActive(false);
    drawPolygon.setActive(false);
    drawBox.setActive(false);
    selectClick.setActive(true);
  }
});
drawLineString.on('drawend', (e) => {
  e.feature.setProperties({
    strkWdth: 1,
    strkClr: 'blue',
    // fllClr: 'orange',
  });
  if (store.state.questionnaireMode === 'normal') {
    store.commit('newPostFeature', e.feature);
    store.commit('setUserPostProperties', [{ property: 'userFeatures', value: new ol.format.GeoJSON().writeFeatures([e.feature]) }]);
  } else {
    store.commit('addQuestionnaireFeature', e.feature);
    drawPoint.setActive(false);
    drawLineString.setActive(false);
    drawPolygon.setActive(false);
    drawBox.setActive(false);
    selectClick.setActive(true);
  }
});
drawPolygon.on('drawend', (e) => {
  e.feature.setProperties({
    strkWdth: 1,
    strkClr: 'blue',
    fill: new ol.style.Fill({
      color: 'rgba(0, 0, 255, 0.1)',
    }),
  });
  if (store.state.questionnaireMode === 'normal') {
    store.commit('newPostFeature', e.feature);
    store.commit('setUserPostProperties', [{ property: 'userFeatures', value: new ol.format.GeoJSON().writeFeatures([e.feature]) }]);
  } else {
    store.commit('addQuestionnaireFeature', e.feature);
    drawPoint.setActive(false);
    drawLineString.setActive(false);
    drawPolygon.setActive(false);
    drawBox.setActive(false);
    selectClick.setActive(true);
  }
});
drawBox.on('drawend', (e) => {
  e.feature.setProperties({
    strkWdth: 1,
    strkClr: 'blue',
    fill: new ol.style.Fill({
      color: 'rgba(0, 0, 255, 0.1)',
    }),
  });
  if (store.state.questionnaireMode === 'normal') {
    store.commit('newPostFeature', e.feature);
    store.commit('setUserPostProperties', [{ property: 'userFeatures', value: new ol.format.GeoJSON().writeFeatures([e.feature]) }]);
  } else {
    store.commit('addQuestionnaireFeature', e.feature);
    drawPoint.setActive(false);
    drawLineString.setActive(false);
    drawPolygon.setActive(false);
    drawBox.setActive(false);
    selectClick.setActive(true);
  }
});
export default olMap;
