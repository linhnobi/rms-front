'use strict';
angular.module('rmsSystem').factory('Admin', ['Config', '$http',
	function (Config, $http) {
		var api = Config.api + 'admin';
		return {
			getUsers: function () {
				return $http.get(api + '/user/all');
			},
			deleteUser: function (id) {
				return $http.delete(api + '/user/' + id);
			},
			createUser: function (data) {
				return $http.post(api + '/user/add', data);
			},
			updateUser: function (id, data) {
				return $http.put(api + '/user/' + id, data);
			},
			getRoles: function () {
				return $http.get(api + '/role');
			},
			getPermissions: function () {
				return $http.get(api + '/user/station');
			}
		};
	}]);
