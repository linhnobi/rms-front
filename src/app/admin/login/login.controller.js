'use strict';

angular.module('rmsSystem').controller('AdminLoginCtrl', function ($scope, Auth, $state, growl) {
	$scope.model = {};
	$scope.logged = false;
	$scope.login = function (form) {
		if (form.$invalid) {
			return false;
		}
		var hasRole = function (roles) {
			var idx = _.findIndex(roles, function (r) {
				return r.roleName === 'ADMIN';
			});
			return idx !== -1;
		};
		Auth.login($scope.model).then(function (resp) {
			if (hasRole(resp.user.roles)) {
				Auth.setCurrentUser(resp.user);
				$scope.logged = true;
				$state.go('admin.users');
			} else {
				Auth.logout(resp.user.id);
				growl.error('Không có quyền đăng nhập');
			}
		}, function (error) {
			if (error.status === 423) {
				growl.error('Tài khoản hiện đang được sử dụng');
			} else {
				growl.error('Địa chỉ email hoặc mật khẩu không chính xác');
			}
		});
	};
});