(function(angular) {
  'use strict';

  /**
   * Textbook controller
   */
  angular.module('calcentral.directives').directive('ccMapDirective', function() {
    return {
      link: function(scope, element, attrs) {
        var map = new OpenLayers.Map('map');
        var defaultFormat = new OpenLayers.Format.KML({
          extractStyles: true,
          extractAttributes: true,
          maxDepth: 2
        });
        var buildingNames = {};

        var poi = new OpenLayers.Layer.Vector('POI', {
          strategies: [new OpenLayers.Strategy.Fixed()],
          protocol: new OpenLayers.Protocol.HTTP({
            url: '/dummy/map/poi-layer.kml',
            format: defaultFormat
          })
        });
        var building = new OpenLayers.Layer.Vector('Buildings', {
          strategies: [new OpenLayers.Strategy.Fixed()],
          protocol: new OpenLayers.Protocol.HTTP({
            url: '/dummy/map/building-layers.kml',
            format: defaultFormat
          }),
          preFeatureInsert: function(feature) {
            buildingNames[feature.attributes.name] = feature.id;
          }
        });
        var roads = new OpenLayers.Layer.Vector('Roads', {
          strategies: [new OpenLayers.Strategy.Fixed()],
          protocol: new OpenLayers.Protocol.HTTP({
            url: '/dummy/map/roads-layer.kml',
            format: defaultFormat
          })
        });
        var green = new OpenLayers.Layer.Vector('Grass', {
          strategies: [new OpenLayers.Strategy.Fixed()],
          protocol: new OpenLayers.Protocol.HTTP({
            url: '/dummy/map/green-layer.kml',
            format: defaultFormat
          })
        });
        var soda = new OpenLayers.Layer.Vector('Soda', {
          strategies: [new OpenLayers.Strategy.Fixed()],
          protocol: new OpenLayers.Protocol.HTTP({
            url: '/dummy/map/soda.kml',
            format: new OpenLayers.Format.KML({
              extractStyles: true,
              extractAttributes: true,
              maxDepth: 0
            })
          })
        });
        var dwinelle = new OpenLayers.Layer.Vector('Dwinelle', {
          strategies: [new OpenLayers.Strategy.Fixed()],
          protocol: new OpenLayers.Protocol.HTTP({
            url: '/dummy/map/dwinelle.kml',
            format: new OpenLayers.Format.KML({
              extractStyles: true,
              extractAttributes: true,
              maxDepth: 0
            })
          })
        });
        map.addLayer(new OpenLayers.Layer.OSM());
        map.addLayer(poi);
        map.addLayer(building);
        map.addLayer(green);
        map.addLayer(roads);
        map.addLayer(soda); // DOESNT WORK :(
        map.addLayer(dwinelle);

        var layer_switcher= new OpenLayers.Control.LayerSwitcher({});
        map.addControl(layer_switcher);
        var center = new OpenLayers.LonLat(-122.25840,37.86913).transform(
            new OpenLayers.Projection('EPSG:4326'), // transform from WGS 1984
            map.getProjectionObject() // to Spherical Mercator Projection
        );
        map.setCenter(center, 16);

        function createPopup(feature) {
          feature.popup = new OpenLayers.Popup.FramedCloud('pop',
            feature.geometry.getBounds().getCenterLonLat(),
            null,
            '<div class="markerContent cc-map-infobox">' +
                '<h2>' + feature.attributes.name + '</h2>' +
                '<p>' + feature.attributes.description + '</p>' +
            '</div>',
            null,
            true,
            function() { destroyPopup(feature); }
          );
          feature.popup.closeOnMove = false;
          map.addPopup(feature.popup);
        }

        function destroyPopup(feature) {
          feature.popup.destroy();
          feature.popup = null;
        }

        var buildingSelectControl = new OpenLayers.Control.SelectFeature(building,
            { onSelect: createPopup, onUnselect: destroyPopup });


        map.addControl(buildingSelectControl);
        buildingSelectControl.activate();

        function selectByName(name) {
          var id = buildingNames[name];
          if (id != null) {
            var feature = building.getFeatureById(id);
            createPopup(feature);
          }
        }

        function findClosestMatch(name) {
          name = name.toLowerCase();
          for (var building in buildingNames) {
            if (building.toLowerCase().indexOf(name) !== -1) {
              return building;
            }
          }
        }

        attrs.$observe('ccMapDirective', function(buildingName) {
          console.log(buildingName);
          if (buildingName != null) {
            selectByName(findClosestMatch(buildingName));
          }
        });
      }
    };
  });
})(window.angular);
