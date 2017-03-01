'use strict';
var map;
angular.module('rmsSystem').directive('rmsMap', function ($interval, $timeout) {
	return {
		restrict: 'AE',
		scope: {
			userinfo: '=',
			area: '=',
			stations: '='
			
		},
		templateUrl: 'components/directives/map/map.html',
		link: function (scope) {
			var map, makers = [];
			// var position = {lat: 16.172472808397515, lng: 106.875};
			
			var mapStyle = [
				{
					featureType: "administrative",
					elementType: "all",
					stylers: [
						{visibility: "off"}
					]
				},
				{
					featureType: "administrative.country",
					elementType: "labels",
					stylers: [
						{visibility: "on"}
					]
				},
				{
					featureType: "administrative.locality",
					elementType: "labels",
					stylers: [
						{visibility: "on"}
					]
				},
				{
					featureType: "landscape",
					elementType: "all",
					stylers: [
						{visibility: "off"}
					]
				},
				{
					featureType: "road",
					stylers: [
						{visibility: "on"}
					]
				},
				{
					featureType: "poi",
					stylers: [
						{visibility: "off"}
					]
				}
			];


			var tooltip = function (content, event) {
				var tooltip = $('<p id="map-tooltip"></p>');
				if (!content) {
					$('body').find('#map-tooltip').remove();
					return false;
				}
				tooltip.text(content);
				if (typeof event !== "undefined" && event != null) {
					tooltip.css({left: event.clientX, top: event.clientY, position: 'fixed'});
				}
				$('body').find('#map-tooltip').remove();
				$('body').append(tooltip);
			};


			var initMap = function (feature, type) {

				var position = {lat: 16.172472808397515, lng: 106.875};
				var zoom = 7;

				if(scope.userinfo.groupStations.length > 0) {
					zoom = scope.userinfo.groupStations[0].zoomSize > 0 ? scope.userinfo.groupStations[0].zoomSize : 7;
				}

				if (typeof scope.userinfo.roles[0].roleName !== "undefined") {
					if (scope.userinfo.roles[0].roleName == "USER"){
						position = {lat: scope.userinfo.stationPermission[0].station.coordinates[1] || 16.172472808397515 ,lng: scope.userinfo.stationPermission[0].station.coordinates[0] || 106.875};
					} else {
						if (scope.stations && scope.stations.length) {
							position = {lat: scope.stations[0].coordinates[1] || 16.172472808397515, lng: scope.stations[0].coordinates[0] || 106.875};
						}
					}
				}
				
				map = new google.maps.Map(document.getElementById('map'), {
					center: position,
					draggable: true,
					zoom: zoom,
					scrollwheel: false,
					disableDefaultUI: true,
					zoomControl: true,
					styles: mapStyle
				});
				if (scope.stations && scope.stations.length) {
					if (makers.length) {
						_.each(makers, function (maker) {
							maker.setMap(null);
						});
						makers = [];
					}
					// addStationsToMap(scope.stations, scope.userinfo, type);
				}
				addStationsToMap(scope.stations, scope.userinfo, type);
				/*if (type === 'country') {
				 map.data.addListener('addfeature', function (e) {
				 var region = e.feature.getProperty('customCode');
				 switch (region) {
				 case 'VN_REGION_DB':
				 map.data.overrideStyle(e.feature, {fillColor: '#A7B247'});
				 break;
				 case 'VN_REGION_TB':
				 map.data.overrideStyle(e.feature, {fillColor: '#DC73E3'});
				 break;
				 case 'VN_REGION_DBSH':
				 map.data.overrideStyle(e.feature, {fillColor: '#A7B247'});
				 break;
				 case 'VN_REGION_BTB':
				 map.data.overrideStyle(e.feature, {fillColor: '#ED9522'});
				 break;
				 case 'VN_REGION_NTB':
				 map.data.overrideStyle(e.feature, {fillColor: '#7CE697'});
				 break;
				 case 'VN_REGION_TN':
				 map.data.overrideStyle(e.feature, {fillColor: '#592386'});
				 break;
				 case 'VN_REGION_DNB':
				 map.data.overrideStyle(e.feature, {fillColor: '#B1F353'});
				 break;
				 case 'VN_REGION_TNB':
				 map.data.overrideStyle(e.feature, {fillColor: '#B1F353'});
				 break;
				 }
				 });
				 map.data.addListener('mouseover', function (e) {
				 var code = e.feature.getProperty('customCode');
				 var codes = [code];
				 if (code === 'VN_REGION_DB' || code === 'VN_REGION_DBSH') {
				 codes = ['VN_REGION_DB', 'VN_REGION_DBSH'];
				 }
				 if (code === 'VN_REGION_DNB' || code === 'VN_REGION_TNB') {
				 codes = ['VN_REGION_DNB', 'VN_REGION_TNB'];
				 }
				 map.data.forEach(function (layer) {
				 if (codes.indexOf(layer.getProperty('customCode')) !== -1) {
				 map.data.overrideStyle(layer, {fillOpacity: 0.8});
				 } else {
				 map.data.overrideStyle(layer, {fillOpacity: 0.5});
				 }
				 });
				 var region = e.feature.getProperty('customCode');
				 switch (region) {
				 case 'VN_REGION_DB':
				 case 'VN_REGION_DBSH':
				 tooltip('Phía Đông Bắc Bộ', e.Qb);
				 break;
				 case 'VN_REGION_TB':
				 tooltip('Phía Tây Bắc Bộ', e.Qb);
				 break;
				 case 'VN_REGION_BTB':
				 tooltip('Thanh Hóa - Thừa Thiên Huế', e.Qb);
				 break;
				 case 'VN_REGION_NTB':
				 tooltip('Đà Nẵng - Bình Thuận', e.Qb);
				 break;
				 case 'VN_REGION_TN':
				 tooltip('Tây Nguyên', e.Qb);
				 break;
				 case 'VN_REGION_DNB':
				 case 'VN_REGION_TNB':
				 tooltip('Nam Bộ', e.Qb);
				 break;
				 }
				 });
				 //					map.data.addListener('click', function (e) {
				 //						scope.$emit('area:select', e.feature.getProperty('customCode'));
				 //					});
				 map.data.addListener('mouseout', function () {
				 tooltip(false);
				 map.data.forEach(function (layer) {
				 map.data.overrideStyle(layer, {fillOpacity: 0.5});
				 });
				 });
				 map.data.setStyle({
				 strokeColor: '#ffffff',
				 strokeWeight: 0,
				 fillOpacity: 0.5
				 });
				 }
				 else if (type === 'area') {
				 map.data.addListener('addfeature', function (e) {
				 map.data.overrideStyle(e.feature, {
				 fillColor: e.feature.getProperty('color'),
				 //strokeColor: '#FF351E',
				 strokeWeight: 1
				 });
				 });
				 var pos = feature.features[0].properties.areaCoodrs;
				 map.setCenter(pos);
				 map.data.addListener('mouseover', function (e) {
				 tooltip(e.feature.getProperty('name'), e.Qb);
				 map.data.overrideStyle(e.feature, {fillOpacity: 1});
				 });
				 map.data.addListener('click', function (e) {
				 scope.$emit('state:select', e.feature.getProperty('gn_a1_code'));
				 });
				 map.data.addListener('mouseout', function (e) {
				 tooltip(false);
				 map.data.overrideStyle(e.feature, {fillOpacity: 0.5});
				 });
				 map.data.setStyle({
				 strokeColor: '#FFFFFF',
				 strokeWeight: 0,
				 fillOpacity: 0.5
				 });
				 }
				 else {
				 map.data.addListener('addfeature', function (e) {
				 map.data.overrideStyle(e.feature, {
				 fillColor: e.feature.getProperty('color'),
				 //strokeColor: '#FF351E',
				 strokeWeight: 1
				 });
				 });
				 map.data.setStyle({
				 strokeColor: '#FFFFFF',
				 strokeWeight: 1,
				 fillOpacity: 0.5
				 });
				 var pos = {
				 lat: parseFloat(feature.features[0].properties.latitude),
				 lng: parseFloat(feature.features[0].properties.longitude)
				 };
				 map.setCenter(pos);
				 }*/
				map.data.addListener('addfeature', function (e) {
					map.data.overrideStyle(e.feature, {
						// fillColor: e.feature.getProperty('color'),
						fillColor: '#ffffff',
						fillOpacity: 0,
						//strokeColor: '#FF351E',
						strokeWeight: 1
					});
				});
				map.data.addListener('mouseover', function (e) {
					tooltip(e.feature.getProperty('name'), e.Ra);
					map.data.overrideStyle(e.feature, {fillOpacity: 0});
				});
				map.data.addListener('mouseout', function (e) {
					tooltip(false);
					map.data.forEach(function (layer) {
						map.data.overrideStyle(layer, {fillOpacity: 0});
					});
				});
				map.data.setStyle({
					strokeColor: '#c9c9c9',
					strokeWeight: 0,
					strokeOpacity: 0,
					fillOpacity: 0.5
				});
				map.data.addGeoJson(feature);
			};

			//add marker
			var addStationsToMap = function (stations, userInfo, type) {
				if (makers.length) {
					_.each(makers, function (maker) {
						maker.setMap(null);
					});
				}
				//marker size
				var point = 'marker-green.png';
				// if (typeof scope.userinfo.roles[0].roleName !== "undefined") {
				if (scope.userinfo.roles[0].roleName == "USER" && typeof scope.userinfo.roles[0].roleName !== "undefined"){
					_.each(scope.userinfo.stationPermission, function (station) {
						if (station.station.coordinates[1] == null || station.station.coordinates[0] == null) {
							station.station.coordinates[0] = 107.227702;
							station.station.coordinates[1] = 11.011240;
						}
						var pos = {lat: station.station.coordinates[1], lng: station.station.coordinates[0]};
						var maker = new google.maps.Marker({
							position: pos,
							title: station.station.stationName,
							icon: '/assets/img/' + point
						});
						maker.addListener('click', function () {
							scope.$emit('station:select', station);
						});
						maker.setMap(map);
						makers.push(maker);
					});
				} else {
					_.each(stations, function (station) {
						if (station.coordinates[1] == null || station.coordinates[0] == null) {
							station.coordinates[0] = 107.227702;
							station.coordinates[1] = 11.011240;
						}
						var pos = {lat: station.coordinates[1], lng: station.coordinates[0]};
						var maker = new google.maps.Marker({
							position: pos,
							title: station.stationName,
							icon: '/assets/img/' + point
						});
						maker.addListener('click', function () {
							scope.$emit('station:select', station);
						});
						maker.setMap(map);
						makers.push(maker);
					});
				}
				
			};

			var resizeGmap = function () {
				$timeout(function () {
					google.maps.event.trigger(map, 'resize');
				}, 250);
			};

			$(window).on('resize', resizeGmap);

			//watch scope
			scope.areaCode = null;
			scope.$watch('area', function () {
				tooltip(false);
				if (scope.area) {
					var geoJson = {
						type: 'FeatureCollection',
						features: scope.area.features
					};
					scope.areaCode = scope.area.areaCode;
					$timeout(function () {
						initMap(geoJson, scope.area.type);
					});
				}
			}, true);
			scope.$watch('stations', function (nv) {
				if (nv) {
					var _int = $interval(function () {
						if (map) {
							$interval.cancel(_int);
							addStationsToMap(nv, scope.area.type);
						}
					});
				}
			});

			scope.$on('$destroy', function () {
				tooltip(false);
			});
		}
	};
});
