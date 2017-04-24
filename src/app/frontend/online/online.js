'use strict';

angular.module('rmsSystem').config(function($stateProvider) {
    $stateProvider.state('online', {
        url: '/online',
        templateUrl: 'app/frontend/online/online.html',
        controller: 'OnlineCtrl',
        authenticate: true,
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