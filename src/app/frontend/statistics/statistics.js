'use strict';

angular.module('rmsSystem')
				.config(function ($stateProvider) {
					$stateProvider.state('statistics', {
						url: '/statistics',
						templateUrl: 'app/frontend/statistics/statistics.html',
						controller: 'StatisticsCtrl',
						controllerAs: 'StatisticsCtrl',
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