'use strict';

angular.module('rmsSystem').controller('AdminConfigCtrl', function ($scope, Setting, power, cronjob, server, growl, $uibModal, $timeout) {
	$scope.power = power;
	$scope.cronjob = cronjob;
	$scope.minutes = _.map(new Array(60), function (v, i) {
		return i;
	});
	$scope.hours = _.map(new Array(24), function (v, i) {
		return i;
	});
	$scope.remote = angular.copy(server);
	$scope.active = 'server';

	$scope.isActive = function (tab) {
		return tab === $scope.active;
	};

	$scope.activeTab = function (tab) {
		$scope.active = tab;
	};

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

	$scope.updateRemoteServer = function () {
		Setting.remote($scope.remote).then(function () {
			server = angular.copy($scope.remote);
			growl.success('Cập nhật thông tin thành công');
		}, function () {
			growl.error('Cập nhật thông tin thất bại');
			$scope.remote = angular.copy(server);
		});
	};
	$scope.updateCronjob = function () {
		Setting.cronjob(
			{
				cronTrigger: $scope.cronjob
			})
		.then(function () {
			server = angular.copy($scope.cronjob);
			growl.success('Cập nhật thông tin thành công');
		}, function () {
			growl.error('Cập nhật thông tin thất bại');
			$scope.cronjob = angular.copy(cronjob);
		});
	};
	$scope.powerServer = function (e) {
		var power = $scope.power;
		var msg = power ? 'Chắc chắn muốn <strong>TẮT</strong> website?' : 'Chắc chắn muốn <strong>BẬT</strong> website ?';
		var html = '<div class="modal-body">' + msg + '</div>';
		html += '<div class="modal-footer">';
		html += '<button class="btn btn-primary" ng-click="ok()">Xác nhận</button>';
		html += '<button class="btn btn-default" ng-click="cancel()">Hủy</button>';
		html += '</div>';
		var modalInstance = $uibModal.open({
			animation: $scope.animationsEnabled,
			template: html,
			controller: ['$scope', '$uibModalInstance', 'power', function ($scope, $uibModalInstance, power) {
					$scope.ok = function () {
						$uibModalInstance.close(!power);
					};
					$scope.cancel = function () {
						$uibModalInstance.dismiss('cancel');
					};
				}],
			size: 'sm',
			resolve: {
				power: function () {
					return power;
				}
			}
		});

		modalInstance.result.then(function (allow) {
			var succesMsg = allow ? 'Website đã được BẬT.' : 'Website đã được TẮT.';
			var erorrMsg = allow ? 'Không thể BẬT website.' : 'Không thể TẮT website.';
			Setting.power(allow).then(function () {
				$scope.power = allow;
				$scope.$$phase || $scope.$apply();
				growl.success(succesMsg);
			}, function () {
				growl.error(erorrMsg);
			});
		});
	};
	$timeout(function () {
		$('#cron').cron({
			initial: cronjob,
			customValues: {
		        "Mỗi 5 phút" : "*/5 * * * *"
		    },
			onChange: function () {
				var value = $(this).cron('value');
				value = value.split(' ');
				// value.unshift('0');
				$scope.cronjob = value.join(' ');
				$scope.$$phase || $scope.$apply();
			}
		});
	});
});
