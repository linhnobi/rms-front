'use strict';

angular.module('rmsSystem').config(function ($stateProvider) {
	$stateProvider.state('admin', {
		url: '/admin',
		templateUrl: 'app/admin/admin.html',
		ncyBreadcrumb: {
			label: 'Quản trị',
			skip: true
		},
		authenticate: true,
		roles: ['admin'],
		controller: function ($rootScope, $state) {
			$rootScope.adminSide = true;
			$state.current.name !== 'admin' || $state.go('admin.login');
		}
	}).state('admin.login', {
		url: '/login',
		templateUrl: 'app/admin/login/login.html',
		controller: 'AdminLoginCtrl',
		resolve: {
			auth: function (Auth, $state) {
				return Auth.isLoggedInAsync().then(function () {
					$state.go('admin.users', {}, {reload: true});
				}, function () {
					return false;
				});
			}
		}
	}).state('admin.users', {
		url: '/users',
		templateUrl: 'app/admin/users/partials/users.html',
		controller: 'UsersCtrl',
		authenticate: true,
		roles: ['admin'],
		ncyBreadcrumb: {
			label: 'Danh sách tài khoản'
		},
		resolve: {
			users: function (Admin) {
				return Admin.getUsers().then(function (resp) {
					return resp.data;
				}, function () {
					return [];
				});
			}
		}
	}).state('admin.user', {
		url: '/user/:id?',
		templateUrl: 'app/admin/users/partials/user.html',
		controller: 'UserCtrl',
		ncyBreadcrumb: {
			label: '{{isNew() ? "Tạo tài khoản" : "Chỉnh sửa tài khoản"}}',
			parent: 'admin.users'
		},
		resolve: {
			groupStations: function (GroupStation) {
				return GroupStation.get().then(function (resp) {
					return resp.data;
				}, function () {
					return [];
				});
			},
			user: function ($stateParams, User) {
				if (!$stateParams.id) {
					return {};
				}
				return User.getProfile($stateParams.id).then(function (resp) {
					return resp.data;
				}, function () {
					return {};
				});
			},
			roles: function (Admin) {
				return Admin.getRoles().then(function (resp) {
					return resp.data;
				}, function () {
					return [];
				});
			},
			permissions: function (Admin) {
				return Admin.getPermissions().then(function (resp) {
					return resp.data;
				}, function () {
					return [];
				});
			}
		},
		roles: ['admin'],
		authenticate: true
	}).state('admin.stations', {
		url: '/stations',
		templateUrl: 'app/admin/stations/partials/stations.html',
		controller: 'StationsCtrl',
		authenticate: true,
		ncyBreadcrumb: {
			label: 'Danh sách trạm'
		},
		resolve: {
			stations: function (Station) {
				return Station.get().then(function (resp) {
					return resp.data;
				}, function () {
					return [];
				});
			}
		}
	}).state('admin.station', {
		url: '/station/:id?',
		templateUrl: 'app/admin/stations/partials/station.html',
		controller: 'StationCtrl',
		roles: ['admin'],
		authenticate: true,
		ncyBreadcrumb: {
			label: '{{isNew() ? "Tạo mới trạm" : "Chỉnh sửa trạm"}}',
			parent: 'admin.stations'
		},
		resolve: {
			station: function ($stateParams, Station) {
				if (!$stateParams.id) {
					return {};
				}
				return Station.get($stateParams.id).then(function (resp) {
					return resp.data;
				}, function () {
					return {};
				});
			},
			areas: function (Area) {
				return Area.getAreas().then(function (resp) {
					return resp.data;
				}, function () {
					return [];
				});
			}

		}
	}).state('admin.info', {
		url: '/info',
		templateUrl: 'app/admin/info/info.html',
		controller: 'InfoCtrl',
		authenticate: true,
		roles: ['admin'],
		ncyBreadcrumb: {
			label: 'Dữ liệu trạm'
		},
		resolve: {
			geoJson: function (Area) {
				return Area.getAreas().then(function (response) {
					return response.data;
				}, function () {
					return [];
				});
			}
		}
	}).state('admin.accountSetting', {
		url: '/account-setting',
		templateUrl: 'app/admin/account-setting/account-setting.html',
		controller: 'AdminAccountSettingCtrl',
		authenticate: true,
		ncyBreadcrumb: {
			label: 'Cài đặt tài khoản'
		},
		roles: ['admin']
	}).state('admin.profile', {
		url: '/profile',
		templateUrl: 'app/admin/profile/profile.html',
		controller: 'AdminProfileCtrl',
		authenticate: true,
		ncyBreadcrumb: {
			label: 'Thông tin cá nhân'
		},
		roles: ['admin']
	}).state('admin.accessAll', {
		url: '/access/all',
		templateUrl: 'app/admin/access/all/all.html',
		controller: 'AllAccessCtrl',
		authenticate: true,
		ncyBreadcrumb: {
			label: 'Lịch sử truy cập'
		},
		roles: ['admin'],
		resolve: {
			allAccess: function (Access) {
				return Access.all().then(function (resp) {
					return resp.data;
				}, function () {
					return [];
				});
			}
		}
	}).state('admin.accessLogged', {
		url: '/access/logged',
		templateUrl: 'app/admin/access/logged/logged.html',
		controller: 'LoggedCtrl',
		authenticate: true,
		ncyBreadcrumb: {
			label: 'Tài khoản đang đăng nhập'
		},
		roles: ['admin'],
		resolve: {
			loggedUsers: function (Access) {
				return Access.logged().then(function (resp) {
					return resp.data;
				}, function () {
					return [];
				});
			}
		}
	}).state('admin.accessUser', {
		url: '/access/user/:id',
		templateUrl: 'app/admin/access/user/user.html',
		controller: 'UserAccessCtrl',
		authenticate: true,
		roles: ['admin'],
		params: {
			from: 'logged'
		},
		ncyBreadcrumb: {
			label: 'Lịch sử đăng nhập',
			parent: function ($scope) {
				return $scope.from === 'all' ? 'admin.accessAll' : 'admin.accessLogged';
			}
		},
		resolve: {
			allAccess: function (Access, $stateParams) {
				if (!$stateParams.id) {
					return [];
				}
				return Access.user($stateParams.id).then(function (resp) {
					return resp.data;
				}, function () {
					return [];
				});
			},
			from: function ($stateParams) {
				return $stateParams.from;
			}
		}
	}).state('admin.config', {
		url: '/config',
		templateUrl: 'app/admin/config/config.html',
		controller: 'AdminConfigCtrl',
		authenticate: true,
		ncyBreadcrumb: {
			label: 'Thiết lập'
		},
		roles: ['admin'],
		resolve: {
			power: function (Setting) {
				return Setting.getPower().then(function (resp) {
					return resp.data;
				}, function () {
					return false;
				});
			},
			cronjob: function (Setting) {
				return Setting.getCronjob().then(function (resp) {
					return resp.data;
				}, function () {
					return '';
				});
			},
			server: function (Setting) {
				return Setting.getRemote().then(function (resp) {
					return resp.data;
				}, function () {
					return {};
				});
			}
		}
	}).state('admin.group-station', {
		url: '/group-station',
		templateUrl: 'app/admin/group-station/group-station.html',
		controller: 'GroupStationCtrl',
		authenticate: true,
		ncyBreadcrumb: {
			label: 'Quản lý nhóm trạm'
		},
		roles: ['admin'],
		resolve: {
			groupStations: function (GroupStation) {
				return GroupStation.get().then(function (resp) {
					return resp.data;
				}, function () {
					return [];
				});
			}
		}
	}).state('admin.new-group-station', {
		url: '/group-station/:id?/:code?',
		templateUrl: 'app/admin/group-station/new-group-station.html',
		controller: 'AddGroupStationCtrl',
		roles: ['admin'],
		authenticate: true,
		ncyBreadcrumb: {
			label: '{{isNew() ? "Tạo mới nhóm trạm" : "Chỉnh sửa nhóm trạm"}}',
			parent: 'admin.group-station'
		},
		resolve: {
			groupStation: function ($stateParams, GroupStation) {
				if (!$stateParams.id) {
					return {};
				}
				return GroupStation.getByCode($stateParams.code).then(function (resp) {
					return resp.data;
				}, function () {
					return {};
				});
			},
			permissions: function (Admin) {
				return Admin.getPermissions().then(function (resp) {
					return resp.data;
				}, function () {
					return [];
				});
			}

		}
	});
});