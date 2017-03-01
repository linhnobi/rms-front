'use strict';

angular.module('rmsSystem').controller('StationsCtrl', function ($scope, stations, Station) {

	$scope.stations = stations;

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
		message: 'Xóa trạm này ?',
		confirmText: 'Có',
		cancelText: 'Không'
	};
	$scope.deleteStation = function (station) {
		Station.delete(station.stationCode).then(function () {
			_.remove($scope.stations, function (st) {
				return st.id === station.id;
			});
		});
	};
}).controller('StationCtrl', function ($scope, station, areas, Station, growl, $state) {

	$scope.model = angular.copy(station);
	$scope.cities = areas;
	$scope.stations = [];
	$scope.sensors = [6,8,24];
	
	$scope.isNew = function () {
		return !!!$scope.model.id;
	};

	// $scope.$watch('model.province', function (nv) {
	// 	if (nv) {
	// 		var idx = _.findIndex($scope.cities, function (c) {
	// 			return c.provinceCode === nv;
	// 		});
	// 		if (idx !== -1) {
	// 			if (!$scope.model.coordinates) {
	// 				$scope.model.coordinates = [0, 0];
	// 			}
	// 			$scope.model.coordinates[1] = $scope.cities[idx].feature.properties.latitude;
	// 			$scope.model.coordinates[0] = $scope.cities[idx].feature.properties.longitude;
	// 		}
	// 	}
	// });

	$scope.openDatePicker = function () {
		$scope.showPicker = true;
	};

	$scope.submit = function (form) {
		if (form.$invalid) {
			growl.error('Vui lòng nhập đầy đủ thông tin');
			return false;
		}

		if ($scope.isNew()) {
			$scope.model.active = true;
			$scope.model.coordinates = Object.keys($scope.model.coordinates).map(function (key) { return $scope.model.coordinates[key]; });
			Station.create($scope.model).then(function () {
				$state.go('admin.station', {id: $scope.model.stationCode});
			}, function () {
				growl.error('Tạo mới trạm không thành công');
			});
		}
		else {
			var data = _.omit($scope.model, ['provinceData', 'isActive']);
			data.active = true;
			Station.update($scope.model.stationCode, data).then(function () {
				growl.success('Cập nhật thành công');
			}, function () {
				growl.error('Cập nhật không thành công');
			});
		}
	};
});
