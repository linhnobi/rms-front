'use strict';

angular.module('rmsSystem')
				.config(function ($stateProvider) {
					$stateProvider.state('linh', {
						url: '/linh',
						templateUrl: 'app/frontend/linh/linh.html',
						controller: 'LinhCtrl',
						controllerAs: 'LinhCtrl',
						authenticate: true,
						ncyBreadcrumb: {
							label: 'Trang chủ'
						},
						resolve: {
							geoJson: function (Area) {
								return Area.getAreas().then(function (response) {
									return response.data;
								}, function () {
									return [];
								});
							}
						}
					});
				});