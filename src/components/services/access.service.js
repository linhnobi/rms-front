'use strict';
angular.module('rmsSystem').factory('Access', ['Config', '$http',
	function (Config, $http) {
		var api = Config.api + 'manage';
		return {
			all: function () {
				return $http.get(api + '/history');
			},
			logged: function () {
				return $http.get(api + '/logged');
			},
			user: function (id) {
				return $http.get(api + '/history/' + id);
			},
			kickout: function (id) {
				return $http.get(api + '/kickout/' + id);
			},
			deny: function (id) {
				return $http.get(api + '/deny/' + id);
			}
		};
	}]);
