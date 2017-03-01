'use strict';
var map;
angular.module('rmsSystem').directive('rmsPosition', function ($timeout,$state) {
	return {
		restrict: 'A',
		scope: {
			lat: '=',
			lng: '=',
			stations : '=',
			zoom : '='
		},
		templateUrl: 'components/directives/position/position.html',
		link: function (scope) {
			var map, marker, markerGreen;
			var position = {lat: parseFloat(scope.lat) || 16.172472808397515, lng: parseFloat(scope.lng) || 106.875};

			var initMap = function () {
				
				if($state.current.name == 'admin.new-group-station'){
					var zoom = scope.zoom ? scope.zoom : 10;
				}else{
					var zoom = (scope.lat && scope.lng) ? 7 : 5;	
				}
				map = new google.maps.Map(document.getElementById('map'), {
					center: position,
					draggable: true,
					zoom: zoom,
					//scrollwheel: false,
					disableDefaultUI: true,
					zoomControl: true
									//styles: mapStyle
				});
				marker = new google.maps.Marker({
					map: map,
					draggable: true,
					animation: google.maps.Animation.DROP,
					position: position,
					icon: $state.current.name == 'admin.new-group-station' ? '/assets/img/marker-green.png' : '/assets/img/point.png'
				});
				markerGreen = marker;
				if(scope.stations){
					if(scope.stations.length > 0){
						for(var i = 0 ;i < scope.stations.length;i++){
							var station = scope.stations[i];
							var marker_temp = new google.maps.Marker({
								position: {lat: station.station.coordinates[1],lng: station.station.coordinates[0]},
								map: map,
								animation: google.maps.Animation.DROP,
								icon: '/assets/img/point.png'
							});
							marker = marker_temp;
						}

					}
				}
				
				markerGreen.addListener('dragend', function (pos) {
					scope.lat = pos.latLng.lat();
					scope.lng = pos.latLng.lng();
					scope.$apply();
					updateLatLng(pos);
				});
				markerGreen.addListener('click', function (pos) {
					scope.lat = pos.latLng.lat();
					scope.lng = pos.latLng.lng();
					scope.$apply();
					updateLatLng(pos);
				});
			};
			var updateLatLng = function (pos) {
				markerGreen.setPosition({lat: pos.latLng.lat(), lng: pos.latLng.lng()});
				map.setCenter(markerGreen.getPosition());
			};
			scope.$watchGroup(['lat', 'lng'], function () {
				if (scope.lat && scope.lng) {
					var pos = {
						latLng: {
							lat: function () {
								return scope.lat;
							},
							lng: function () {
								return scope.lng;
							}
						}
					};
					if(map) {
						updateLatLng(pos);
						map.setZoom(7);
					}
				}
			});
			$timeout(initMap);
		}
	};
});
