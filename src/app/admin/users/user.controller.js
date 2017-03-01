'use strict';

angular.module('rmsSystem').controller('UsersCtrl', function ($scope, users, Admin) {

	$scope.users = users;

	$scope.dtOptions = {
		fnDrawCallback: function (oSettings) {
			if (oSettings._iDisplayLength >= oSettings.fnRecordsDisplay()) {
				$(oSettings.nTableWrapper).find('.dataTables_paginate').hide();
			}
		},
		columnDefs: [
			{
				searchable: false,
				targets: 0
			}
		],
		aoColumnDefs: [{
				bSortable: false,
				aTargets: [-1]
			}],
		language: {
			oPaginate: {
				sPrevious: "&laquo;",
				sNext: "&raquo;"
			},
			sEmptyTable: 'Không có dữ liệu',
			sZeroRecords: 'Không có dữ liệu',
			sSearch: 'Tìm kiếm'
		},
		iDisplayLength: 5,
		bLengthChange: false,
		bInfo: false,
		sDom: '<"clearfix"lfr>t<"clearfix"ip>'
	};

	$scope.confirm = {
		title: '<strong>Xác nhận</strong>',
		message: 'Xóa tài khoản này ?',
		confirmText: 'Có',
		cancelText: 'Không'
	};
	$scope.deleteUser = function (user) {
		Admin.deleteUser(user.id).then(function () {
			_.remove($scope.users, function (u) {
				return u.id === user.id;
			});
		});
	};

	$scope.update = function (user, state) {
		Admin.updateUser(user.id, {active: state}).then(function () {
			user.active = state;
		});
	};
}).controller('UserCtrl', function ($scope, $rootScope, user, roles, permissions, groupStations,  Admin, growl, $state, Auth) {
	//$scope.model = angular.copy(user);
	$scope.model = angular.copy($scope.user);
	$scope.model.sex = $scope.model.sex || 'male';
	

	$scope.roles = roles;
	if (!$scope.model.roles) {
		$scope.model.roles = [roles[0]];
	}

	$scope.permissions = permissions;
	$scope.groupStations = [];
	_.each(groupStations, function(value){
		
		$scope.groupStations.push({"key" : value.groupCode , "value" : value.groupName});
	});

	$scope.hasRole = function (roleName) {
		var idx = _.findIndex($scope.model.roles, function (r) {
			return r.roleName === roleName;
		});
		return idx !== -1;
	};

	$scope.hasViewGroupStation = function (viewMode) {
		if ($scope.model.viewMode == "1") {
			return true;
		} else {
			return false;
		}
	};

	$scope.roleChanged = function (e, role) {
//		if (!e.target.checked) {
//			_.remove($scope.model.roles, function (r) {
//				return r.id === role.id;
//			});
//		} else {
//			$scope.model.roles = $scope.model.roles || [];
//			var idx = _.findIndex($scope.model.roles, function (r) {
//				return r.id === role.id;
//			});
//			if (idx === -1) {
//				$scope.model.roles.push(role);
//			}
//		}
		if (e.target.checked) {
			$scope.model.roles = [role];
		}
		$scope.model.stationPermission = [];
		$scope.$$phase || $scope.$apply();
	};

	$scope.hasPermission = function (permission) {
		var idx = _.findIndex($scope.model.stationPermission, function (p) {
			return p.key === permission.key;
		});
		return idx !== -1;
	};

	$scope.permissionChanged = function (e, permission) {
		if (!e.target.checked) {
			_.remove($scope.model.stationPermission, function (p) {
				return p.key === permission.key;
			});
		} else {
			$scope.model.stationPermission = $scope.model.stationPermission || [];
			var idx = _.findIndex($scope.model.stationPermission, function (p) {
				return p.key === permission.key;
			});
			if (idx === -1) {
				$scope.model.stationPermission.push(permission);
			}
		}
		$scope.$$phase || $scope.$apply();
	};

	var init = function () {
		$scope.currentUser = angular.copy($rootScope.user);
		// $scope.model.viewMode = $scope.model.viewMode || '0';
		// $scope.hasViewGroupStation($scope.model.viewMode);
	};
	$rootScope.$watch('user', function (nv) {
		if (nv) {
			init();
			

		}
	});

	$scope.isNew = function () {
		return !!!$scope.model.id;
	};

	$scope.loadding = false;

	$scope.openDatePicker = function () {
		$scope.showPicker = true;
	};

	$scope.submit = function (form) {
		if (form.$invalid) {
			growl.error('Vui lòng nhập đầy đủ thông tin');
			return false;
		}
		if (!$scope.model.roles.length) {
			growl.error('Vui lòng chọn vai trò cho tài khoản');
			return false;
		}
		if ($scope.isNew()) {
			if ($scope.model.password !== $scope.model.confirmPassword) {
				growl.error('Mật khẩu không giống nhau');
				return false;
			}
			var user = _.omit(angular.copy($scope.model), 'confirmPassword');
			if (user.birthday) {
				user.birthday = user.birthday.getTime();
			}
			// user.groupStations = [];
			// var i =0 ;
			// _.each($scope.model.groupStations, function(value) {
			// 	user.groupStations[i] = value.key;
			// 	i++;
			// });
			// i =0;
			user.active = true;
			user.viewMode = parseInt(user.viewMode);
			Admin.createUser(user).then(function () {
				growl.success('Tạo tài khoản thành công');
				$state.go('admin.users');
			}, function (err) {
				if (err.status === 409) {
					growl.error('Email hoặc trên truy cập đã được sử dụng');
				} else {
					growl.error('Lỗi không xác định. Tạo tài khoản thất bại');
				}
				$scope.model = angular.copy(user);
				form.$setPristine();
			});
		}
		else {
			if ($scope.model.password && $scope.model.password !== $scope.model.confirmPassword) {
				growl.error('Mật khẩu không giống nhau');
				return false;
			}
			var user = _.omit(angular.copy($scope.model), ['id', 'confirmPassword', 'email']);
			user.viewMode = parseInt(user.viewMode);
			Admin.updateUser($scope.model.id, $scope.model).then(function (resp) {
				if (resp.data.id === $scope.currentUser.id) {
					Auth.setCurrentUser(resp.data);
				}
				form.$setPristine();
				growl.success('Cập nhật khoản thành công');
			}, function () {
				growl.error('Cập nhật khoản thất bại');
				$scope.model = angular.copy(user);
				form.$setPristine();
			});
		}
	};
});
