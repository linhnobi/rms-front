'use strict';

angular.module('rmsSystem').controller('GroupStationCtrl', function ($scope, groupStations, GroupStation, Station) {
	_.each(groupStations, function (g) {
		var allStations = "";
		_.each(g.stations, function (s) {
			allStations = allStations + s.value + ";";
		});	
		g.allStations = allStations;
	});

	$scope.groupStations = groupStations;

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
	$scope.deleteGroupStation = function (g) {
		GroupStation.delete(g.groupCode).then(function () {
			_.remove($scope.groupStations, function (st) {
				return st.id === g.id;
			});
		});
	};
}).controller('AddGroupStationCtrl', function ($scope, groupStation, permissions, GroupStation, growl, $state, Station) {


	$scope.model = angular.copy(groupStation);
	
	
	// console.log($scope.model);
	$scope.permissions = permissions;
	// $scope.cities = areas;
	$scope.isNew = function () {
		return !!!$scope.model.id;
	};

	$scope.addMarker = function(model){
		addMarker(model);
	};

	// $scope.openDatePicker = function () {
	// 	$scope.showPicker = true;
	// };

	$scope.submit = function (form) {
		if (form.$invalid) {
			growl.error('Vui lòng nhập đầy đủ thông tin');
			return false;
		}
		if ($scope.isNew()) {
			GroupStation.create($scope.model).then(function () {
				$state.go('admin.group-station', {id: $scope.model.id});
				growl.success('thêm nhóm trạm thành công');
			}, function () {
				growl.error('Tạo mới trạm không thành công');
			});
		}
		else {
			var data = _.omit($scope.model, ['provinceData', 'isActive']);
			data.active = true;
			GroupStation.update($scope.model).then(function () {
				growl.success('Cập nhật thành công');
			}, function () {
				growl.error('Cập nhật không thành công');
			});
		}
	};

	function addMarker(model){
		var position = {lat: model.centerLat || 16.172472808397515,lng: model.centerLog || 106.875};
		var zoom = parseInt(model.zoomSize) ? parseInt(model.zoomSize) : 5 ;
		
		var map = new google.maps.Map(document.getElementById('map'), {
			center: position,
			zoom: zoom,
		});
        var marker = new google.maps.Marker({
			position: position,
			map: map,
			draggable: true,
			icon: '/assets/img/marker-green.png'
		});
		var markerGreen =  new google.maps.Marker({
			position: position,
			map: map,
			draggable: true,
			icon: '/assets/img/marker-green.png'
		});
		for(var i = 0 ;i < $scope.model.stations.length;i++){
			var station = $scope.model.stations[i];
			Station.get(station.key).then(function (resp) {
				var currStation=  resp.data;
				// if (typeof station.station !== "undefined" && station.station != null) {
					var stationPos = {lat: currStation.coordinates[1],lng: currStation.coordinates[0]}
					var marker_temp = new google.maps.Marker({
						position: stationPos,
						map: map,
						animation: google.maps.Animation.DROP,
						icon: '/assets/img/point.png'
					});
					marker = marker_temp;
				// }
			});	
			// Station.get(station.key).then(function(res) {
			// 	var stationInfo = res.data;
			// 	console.log("stationInfo" + stationInfo.key);
			// });
			
			
		}

		markerGreen.addListener('dragend', function (pos) {
			$scope.model.centerLat = pos.latLng.lat();
			$scope.model.centerLog = pos.latLng.lng();
			$scope.$apply();
			updateLatLng(pos);
		});
		markerGreen.addListener('click', function (pos) {
			$scope.model.centerLat = pos.latLng.lat();
			$scope.model.centerLog = pos.latLng.lng();
			$scope.$apply();
			updateLatLng(pos);
		});
		var updateLatLng = function (pos) {
			markerGreen.setPosition({lat: pos.latLng.lat(), lng: pos.latLng.lng()});
			map.setCenter(markerGreen.getPosition());
		};
	}

});

