'use strict';

angular.module('rmsSystem').controller('AdminProfileCtrl', function ($rootScope, $scope, Auth, User, growl) {
	$scope.loading = false;
	var init = function () {
		$scope.model = angular.copy($rootScope.user);
		$scope.model.sex = $scope.model.sex || 'male';
		$scope.model.birthday = $scope.model.birthday ? new Date($scope.model.birthday) : new Date();

	};


	$rootScope.$watch('user', function (nv) {
		if (nv) {
			init();
		}
	});


	$scope.openDatePicker = function () {
		$scope.showPicker = true;
	};

	$scope.update = function (form) {
		if (form.$invalid || $scope.loading) {
			return false;
		}
		$scope.loading = true;
		var data = _.omit($scope.model, ['id', 'email']);
		if (data.birthday) {
			data.birthday = data.birthday.getTime();
		}
		User.update($scope.model.id, data).then(function (response) {
			Auth.setCurrentUser(response.data);
			growl.success('Cập nhật thông tin thành công');
			form.$setPristine();
			$scope.loading = false;
		}, function () {
			growl.error('Cập nhật thông tin không thành công');
			form.$setPristine();
			init();
			$scope.loading = false;
		});
	};

	$scope.$watch('model.avatar', function (nv) {
		if (nv) {
			var user = Auth.getCurrentUser();
			user.avatar = nv;
			Auth.setCurrentUser(user);
		}
	}, true);
});
