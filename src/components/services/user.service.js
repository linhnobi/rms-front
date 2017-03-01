'use strict';
angular.module('rmsSystem').factory('User', ['Config', '$http',
	function (Config, $http) {
		var api = Config.api + 'user';
		return {
			getProfile: function (id) {
				return $http.get(api + '/profile/' + id);
			},
			update: function (id, data) {
				return $http.put(api + '/edit/' + id, data);
			},
			changePassword: function(id, data) {
					return $http.put(api + '/changepass/' + id, data);
			},
			logout:function(id) {
				return $http.get(api + '/singout/' + id);
			}
		};
	}]);
