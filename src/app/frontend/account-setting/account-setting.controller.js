'use strict';

angular.module('rmsSystem').controller('AccountSettingCtrl', function ($rootScope, $scope, Auth, User, growl) {
	$scope.updateLoading = false;
	$scope.changeLoading = false;
	var init = function () {
		$scope.model = angular.copy($rootScope.user);
	};
	$rootScope.$watch('user', function (nv) {
		if (nv) {
			init();
		}
	});
	$scope.update = function (form) {
		if (form.$invalid || $scope.loading) {
			return false;
		}
		$scope.updateLoading = true;
		var data = _.pick($scope.model, 'email');
		User.update($scope.model.id, data).then(function (response) {
			Auth.setCurrentUser(response.data);
			growl.success('Thay đổi email thành công');
			$scope.updateLoading = false;
		}, function () {
			growl.error('Thay đổi email không thành công');
			init();
			$scope.updateLoading = false;
		});
	};

	$scope.changePassword = function (form) {
		if (form.$invalid || $scope.loading) {
			growl.error('Vui lòng nhập đầy đủ thông tin');
			return false;
		}
		if ($scope.info.password !== $scope.info.confirmPassword) {
			growl.error('Mật khẩu mới không trùng nhau');
			return false;
		}
		$scope.changeLoading = true;
		var data = {};
		data.oldPass = $scope.info.oldPassword;
		data.newPass = $scope.info.password;
		User.changePassword($scope.model.id, data).then(function (response) {
			if (response.status === 200) {
				growl.success('Thay đổi mật khẩu thành công');
			} else {
				growl.error('Mật khẩu cũ không chính xác');
			}
			form.$setPristine();
			$scope.info = {};
			$scope.changeLoading = false;
		}, function () {
			growl.error('Thay đổi mật khẩu không thành công');
			form.$setPristine();
			$scope.info = {};
			$scope.changeLoading = false;
		});
	};
});
