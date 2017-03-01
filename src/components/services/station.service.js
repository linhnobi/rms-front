'use strict';
angular.module('rmsSystem').factory('Station', ['Config', '$http',
	function (Config, $http) {
		var api = Config.api + 'meteorology/station';
		return {
			get: function (code) {
				var url = code ? api + '/' + code : api + '/all';
				return $http.get(url);
			},
			create: function (data) {
				return $http.post(api, data);
			},
			update: function (code, data) {
				return $http.put(api + '/' + code, data);
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
			// info: function(code, time, days, intervals) {
			// 	return $http.get(api + '/info/' + code + '/' + time + '/' + days + '/' + intervals);
			// }
			// ,
			infoTableMinute: function(code, time, days,sensor) {
			    return $http.get(api + '/info/tableminute/' + code + "/" + time + '/' + days + '/' + sensor);
			},
			infoTableHour: function(code, time, days,sensor) {
			    return $http.get(api + '/info/tablehour/' + code + "/" + time + '/' + days + '/' + sensor);
			}
		};
	}]);
