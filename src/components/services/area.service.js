'use strict';
angular.module('rmsSystem').factory('Area', ['Config', '$http',
	function (Config, $http) {
		var api = Config.api + 'meteorology/area';
		return {
			getAreas: function () {
				var url = api;
				return $http.get(url);
			},
			getStatesByArea: function (areaCode) {
				var url = api + '/' + areaCode;
				return $http.get(url);
			}
		};
	}]);
