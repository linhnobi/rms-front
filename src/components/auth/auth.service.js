'use strict';

angular.module('rmsSystem')
				.factory('Auth', function Auth($http, $rootScope, User, $cookieStore, $q, Config) {
					var localData = {};
					var currentUser = {};
					if ($cookieStore.get('localData')) {
						localData = $cookieStore.get('localData');
					}
					return {
						login: function (user, callback) {
							var cb = callback || angular.noop;
							var deferred = $q.defer();
							var _this = this;
							$http.post(Config.api + 'auth/authenticate', {
								email: user.email,
								password: user.password
							}).then(function (resp) {
								var data = resp.data;
								localData = {token: data.token, userId: data.user.id};
								$cookieStore.put('localData', localData);
								_this.setCurrentUser(data.user);
								deferred.resolve(data);
								return cb(data);
							}, function (err) {
								deferred.reject(err);
								return cb(err);
							});

							return deferred.promise;
						},
						/**
						 * Delete access token and user info
						 *
						 * @param  {Function}
						 */
						removeData: function () {
							$cookieStore.remove('localData');
						},
						logout: function (id) {
							localData = {};
							currentUser = {};
							var _this = this;
							User.logout(id).then(function () {
								_this.removeData();
							}, function () {
								_this.removeData();
							});
						},
						isLoggedInAsync: function (callback) {
							var _this = this;
							var cb = callback || angular.noop;
							var deferred = $q.defer();
							if (!localData.userId) {
								deferred.reject(false);
								cb(false);
								return deferred.promise;
							}
							User.getProfile(localData.userId).then(function (response) {
								_this.setCurrentUser(response.data);
								cb(response.data);
								deferred.resolve(response.data);
							}, function (error) {
								if (error.status === 401) {
									_this.removeData();
								}
								cb(false);
								deferred.reject(false);
							});
							return deferred.promise;
						},
						setCurrentUser: function (user) {
							currentUser = _.merge(currentUser, user);
							$rootScope.user = currentUser;
							$rootScope.$$phase || $rootScope.$apply();
						},
						getCurrentUser: function () {
							return currentUser;
						},
						resetPassword: function (email) {
							return $http.get(Config.api + 'auth/resetpass?email=' + email);
						}
					};
				});
