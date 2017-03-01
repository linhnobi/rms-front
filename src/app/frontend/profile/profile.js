'use strict';

angular.module('rmsSystem').config(function ($stateProvider) {
	$stateProvider.state('profile', {
		url: '/profile',
		templateUrl: 'app/frontend/profile/profile.html',
		controller: 'ProfileCtrl',
		ncyBreadcrumb: {
			label: 'Thông tin cá nhân',
			parent: 'statistics'
		},
		authenticate: true
	});
});