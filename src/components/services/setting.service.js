'use strict';
angular.module('rmsSystem').factory('Setting', ['Config', '$http',
	function (Config, $http) {
		var api = Config.api + 'config';
		return {
			getPower: function () {
				return $http.get(api + '/onoff');
			},
			power: function (toggle) {
				return $http.put(api + '/onoff/' + toggle);
			},
			getCronjob: function () {
				return $http.get(api + '/cronjob');
			},
			cronjob: function (body) {
				return $http.put(api + '/cronjob', body);
			},
			getRemote: function () {
				return $http.get(api + '/remote');
			},
			remote: function (body) {
				return $http.put(api + '/remote', body);
			},
			updateData: function () {
				return $http.get(api + '/cronjob/now');
			}
		};
	}]);
