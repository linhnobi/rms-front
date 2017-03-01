'use strict';

angular.module('rmsSystem')
				.config(function ($stateProvider) {
					$stateProvider.state('auth', {
						url: '/auth',
						abstract: true,
						template: '<ui-view />'
					}).state('auth.login', {
						url: '/login',
						templateUrl: 'app/frontend/auth/login/login.html',
						controller: 'LoginCtrl',
						resolve: {
							auth: function (Auth, $state) {
								return Auth.isLoggedInAsync().then(function () {
									$state.go('statistics');
								}, function () {
									return false;
								});
							}
						}
					});
				});