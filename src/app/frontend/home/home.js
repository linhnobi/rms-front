'use strict';

angular.module('rmsSystem').config(function ($stateProvider) {
	$stateProvider.state('home', {
		url: '/home',
		templateUrl: 'app/frontend/home/home.html',
		controller: 'HomeCtrl',
		authenticate: true
	});
});