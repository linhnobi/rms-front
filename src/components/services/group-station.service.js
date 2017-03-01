'use strict';
angular.module('rmsSystem').factory('GroupStation', ['Config', '$http',
	function (Config, $http) {
		var api = Config.api + 'meteorology/groupStation';
		return {
			get: function (code) {
				var url = code ? api + '/' + code : api + '/all';
				return $http.get(url);
			},
			getByCode: function (code) {
				var url = code ? api + '/' + code : api + '/code';
				return $http.get(url);
			},
			create: function (data) {
				return $http.post(api, data);
			},
			update: function (data) {
				return $http.put(api + '/', data);
			},
			delete: function (code) {
				return $http.delete(api + '/' + code);
			},
			getByArea: function (areaCode) {
				var url = api + '?areaCode=' + areaCode;
				return $http.get(url);
			},
			getByProvince: function (provinceCode) {
				var url = api + '?provinceCode=' + provinceCode;
				return $http.get(url);
			},
			info: function(code, time) {
				return $http.get(api + '/info/' + code + '/' + time);
			}
		};
	}]);
