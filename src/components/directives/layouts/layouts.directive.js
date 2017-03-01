'use strict';

angular.module('rmsSystem').directive('rmsHeader', function () {
	return {
		restrict: 'AE',
		templateUrl: 'components/directives/layouts/header.html',
		controller: function ($scope, $rootScope, $location, Auth, User) {
			$rootScope.$watch('user', function () {
				$scope.user = $rootScope.user;
			});

			$scope.logout = function () {
				Auth.logout($rootScope.user.id);
				$rootScope.user = null;
				$location.path('/auth/login');
			};
		}
	};
}).directive('rmsAdminHeader', function ($rootScope, Auth, $location) {
	return {
		restrict: 'AE',
		templateUrl: 'components/directives/layouts/adminHeader.html',
		link: function (scope, elm) {
//			elm.find('#toggle_sidemenu_l').bind('click', function () {
//				$('body').toggleClass('sb-l-m');
//			});
			$rootScope.$watch('user', function () {
				scope.user = $rootScope.user;
			});

			scope.logout = function () {
				Auth.logout($rootScope.user.id);
				$rootScope.user = null;
				$location.path('/admin/login');
			};
		}
	};
}).directive('rmsAdminAside', function ($rootScope, $state) {
	return {
		restrict: 'AE',
		templateUrl: 'components/directives/layouts/adminAside.html',
		link: function (scope) {
			scope.stateName = $state.current.name;
			scope.subAccess = false;
			$rootScope.$on('$stateChangeSuccess', function (event, next) {
				scope.stateName = next.name;
			});
			scope.isActive = function (state) {
				return scope.active === state;
			};
			scope.$watch('stateName', function (nv) {
				switch (nv) {
					case 'admin.info':
						scope.active = 'info';
						break;
					case 'admin.users':
					case 'admin.user':
						scope.active = 'user';
						break;
					case 'admin.stations':
					case 'admin.station':
						scope.active = 'station';
						break;
					case 'admin.group-station':
					case 'admin.new-group-station':
						scope.active = 'group-station';
						break;
					case 'admin.accessAll':
						scope.active = 'allAccess';
						break;
					case 'admin.accessLogged':
						scope.active = 'logged';
						break;
					case 'admin.config':
						scope.active = 'config';
						break;
					default:
						scope.active = '';
						break;
				}
			});
			scope.showSubAccess = function () {
				scope.subAccess = !scope.subAccess;
			};
		}
	};
});
