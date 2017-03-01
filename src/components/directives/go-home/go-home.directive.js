'use strict';

angular.module('rmsSystem').directive('goHome', function () {
	return {
		restrict: 'A',
		template: '<a href="#" ng-click="goHome()" class="fw600 p12 animated animated-short fadeInUp">Trang chủ</a>',
		controller: function ($rootScope, $scope, $location) {
			$rootScope.$watch('user', function () {
				$scope.user = $rootScope.user;
			});
			
			$scope.goHome = function() {
				$rootScope.adminSide = false;
				$location.path('statistics');
			};

			$scope.logout = function () {
				Auth.logout($rootScope.user.id);
				$rootScope.user = null;
				$location.path('/auth/login');
			};
		}
	};
});