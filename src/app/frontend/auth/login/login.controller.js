'use strict';

angular.module('rmsSystem').controller('LoginCtrl', function ($rootScope, $scope, Auth, $state, growl) {
	$scope.model = {};
	$scope.loginForm = true;
	$scope.login = function (form) {
		if (form.$invalid) {
			return false;
		}
		Auth.login($scope.model).then(function () {
			$state.go('statistics');
		}, function (error) {
			switch (error.status) {
				case 503 :
					growl.error('Máy chủ đang được bảo trì', {ttl: 5000});
					break
				case 423 :
					growl.error('Tài khoản hiện đang được sử dụng');
					break;
				default:
					growl.error('Địa chỉ email hoặc mật khẩu không chính xác');
					break
			}
		});
	};

	$scope.forgot = function (forgotForm) {
		if (forgotForm.$invalid) {
			return false;
		}
		Auth.resetPassword($scope.email).then(function () {
			growl.error('Mật khẩu mới đã được gởi tới địa chỉ email ' + $scope.email + '.Xin vui lòng kiểm tra.', {ttl: 0});
		}, function () {
			growl.error('Lấy lại mật khẩu không thành công');
		});
	};

	$scope.toggle = function () {
		$scope.loginForm = !$scope.loginForm;
	};


});