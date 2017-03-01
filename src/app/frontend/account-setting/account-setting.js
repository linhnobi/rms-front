'use strict';

angular.module('rmsSystem').config(function ($stateProvider) {
	$stateProvider.state('accountSetting', {
		url: '/account-setting',
		templateUrl: 'app/frontend/account-setting/account-setting.html',
		controller: 'AccountSettingCtrl',
		ncyBreadcrumb: {
			label: 'Cài đặt tài khoản',
			parent: 'statistics'
		},
		authenticate: true
	});
});