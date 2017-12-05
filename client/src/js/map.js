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

const createVectorStyleFunction = function setStyle() {
  return function getStyle(feature) {
    const strokeWidth = feature.get('strokeWidth');
    const strokeColor = feature.get('strokeColor');
    const fillColor = feature.get('fillColor');

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
      setFillColor = 'rgba(255, 255, 255, 0.2)';
    }

    const style = new ol.style.Style({
      fill: new ol.style.Fill({
        color: 'rgba(255, 255, 255, 0.2)',
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
          color: 'blue',
          width: 4,
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
    return [style];
  };
};

const createSelectedStyleFunction = function setStyle() {
  return function getStyle(feature) {
    const setstrkWidth = 2;
    const setstrkColor = 'white';
    const setFillColor = 'rgba(0, 0, 255, 0.2)';

    const style = new ol.style.Style({
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
    return [style];
  };
};


const customLayer = new ol.layer.Vector({
  style: createVectorStyleFunction(),
  source: new ol.source.Vector(),
  name: 'customLayer',
});

const olMap = new ol.Map({
  target: 'map',
  layers: [
    bingMapsAerial,
    customLayer,
  ],
  view: new ol.View({
    center: mapCenter,
    zoom: 16,
  }),
  selectedItem: null,
});


const collection = new ol.Collection();
const selectClick = new ol.interaction.Select({
  layers: [customLayer],
  condition: ol.events.condition.click,
  style: createSelectedStyleFunction(),
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

olMap.addInteraction(selectClick);
olMap.addInteraction(drawPoint);
olMap.addInteraction(drawLineString);
olMap.addInteraction(drawPolygon);

drawPoint.setProperties({ name: 'Point' });
drawLineString.setProperties({ name: 'LineString' });
drawPolygon.setProperties({ name: 'Polygon' });

drawPoint.setActive(false);
drawLineString.setActive(false);
drawPolygon.setActive(false);
selectClick.setActive(true);

selectClick.on('select', () => {
  const selectedFeature = selectClick.getFeatures().item(0);
  olMap.selectedFeature = selectedFeature;
  // console.log(selectedFeature);
  store.commit('setSelected', selectedFeature);
  // console.log(store.state.count);
});

drawPoint.on('drawend', (e) => {
  store.commit('newPostFeature', e.feature);
});
drawLineString.on('drawend', (e) => {
  store.commit('newPostFeature', e.feature);
});
drawPolygon.on('drawend', (e) => {
  store.commit('newPostFeature', e.feature);
});

export default olMap;
