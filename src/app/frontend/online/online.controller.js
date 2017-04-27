'use strict';

angular.module('rmsSystem').controller('OnlineCtrl', function($scope, Online, Station, User, geoJson, $timeout, $cookieStore, DTOptionsBuilder, DTColumnBuilder, DTColumnDefBuilder) {
	
	$scope.momentDate = moment().format('DD-MM-YYYY');
	$scope.dataRainDay = [];
    $scope.dataStation = [];
    $scope.dataRainSum = [];
    $scope.dataStationSum = [];
    $scope.colHeaderSum = [];
    $scope.listDays = [1,2,3,5,10];
    $scope.listMinutes = [60,180,360];
    $scope.days = $scope.listDays[0];
    $scope.minutes = $scope.listMinutes[0];
	/**
	 *	Get info user
	 */
	$scope.userinfo = {};
	var userId = $cookieStore.get('localData')['userId'];
    User.getProfile(userId).then(function(response) {
        $scope.userinfo = response.data;
        $scope.listStation = response.data.stationPermission;
        if($scope.listStation) {
        	$scope.station = $scope.listStation[0].key;
        }
       
    });

    var initArea = function(jsonData) {
        if (!jsonData || !jsonData.length) {
            return [];
        }
        _.each(jsonData, function(area) {
            var a = _.pick(area, ['areaCode', 'areaName', 'id']);
            delete a.provinceCode;
            switch (a.areaCode) {
                case 'VN_REGION_DB':
                case 'VN_REGION_DBSH':
                    a.displayName = 'Phía Đông Bắc Bộ';
                    a.order = 1;
                    break;
                case 'VN_REGION_TB':
                    a.displayName = 'Phía Tây Bắc Bộ';
                    a.order = 2;
                    break;
                case 'VN_REGION_BTB':
                    a.displayName = 'Thanh Hóa - Thừa Thiên Huế';
                    a.order = 3;
                    break;
                case 'VN_REGION_NTB':
                    a.displayName = 'Đà Nẵng - Bình Thuận';
                    a.order = 4;
                    break;
                case 'VN_REGION_TN':
                    a.displayName = 'Tây Nguyên';
                    a.order = 5;
                    break;
                case 'VN_REGION_DNB':
                case 'VN_REGION_TNB':
                    a.displayName = 'Nam Bộ';
                    a.order = 6;
                    break;
            }
            //}
            areas.push(a);
        });
        return _.sortBy(_.uniqBy(areas, 'displayName'), 'order');
    };
    var getCurrentArea = function(jsonData, code) {
        var type = code ? 'area' : 'country';
        var out = {
            type: type,
            areaCode: code,
            features: []
        };
        _.each(jsonData, function(d) {
            if (!code || checkCode(code, d.areaCode)) {
                out.features.push(d.feature);
            }
        });
        return out;
    };

    $scope.areas = initArea(geoJson);
    $scope.currentArea = null;
    $timeout(function() {
        $scope.currentArea = getCurrentArea(geoJson);
    });
    $scope.model = {};
    var setArea = function(index) {
        var area = angular.copy($scope.areas[index]);
        $scope.model.state = '';
        if (area) {
            $scope.currentArea = getCurrentArea(geoJson, area.areaCode);
            $scope.getStatesByArea($scope.currentArea.areaCode);
            $scope.getStationByArea($scope.currentArea.areaCode);
        } else {
            $scope.states = [];
            $scope.currentArea = getCurrentArea(geoJson);
            $scope.getStationByArea();
        }
    };

    $scope.$watch('model.area', function(nv) {
        setArea(nv);
    });

    $scope.$watch('model.state', function(nv) {
        if (nv) {
            $scope.currentArea = { type: 'state', features: [$scope.states[nv].feature] };
            $scope.currentState = angular.copy($scope.states[nv]);
            if ($scope.currentArea) {
                $scope.getStationByProvince($scope.states[nv].provinceCode);
            }
        } else {
            setArea($scope.model.area);
            $scope.currentState = null;
        }
    });

    $scope.$on('area:select', function(event, code) {
        var idx = _.findIndex($scope.areas, function(area) {
            return checkCode(code, area.areaCode);
        });
        if (idx !== -1) {
            var index = idx.toString();
            $scope.model.area = index;
            $scope.$$phase || $scope.$apply();
        }
        console.log('3');
    });

    $scope.$on('state:select', function(event, code) {
        var idx = _.findIndex($scope.states, function(state) {
            return code === state.provinceCode;
        });
        if (idx !== -1) {
            var index = idx.toString();
            $scope.model.state = index;
            $scope.$$phase || $scope.$apply();
        }
        console.log('2');
    });

    $scope.$on('station:select', function(event, station) {
        $scope.model.station = station;
        $scope.$$phase || $scope.$apply();
    });

    $scope.getStationByArea = function(areaCode) {
        if (areaCode) {
            Station.getByArea(areaCode).then(function(response) {
                $scope.stations = response.data;
            });
        } else {


            Station.get().then(function(response) {
                $scope.stations = response.data;
            });

        }
    };

    Online.getRainDay($scope.momentDate, 3).then(function (response) {
        $scope.dataRainDay = response.data;

        $scope.dataRainDay.rows.forEach(function(element) {
            $scope.dataStation.push(element.data);
        });
    });

    $scope.$watchGroup(['station', 'days', 'minutes', 'model.station'], function() {
    	var paramStation;


    	if ($scope.model.station) {
    		paramStation = $scope.model.station.key;
    		$scope.station = paramStation;
    		$scope.dataRainSum = [];
    		$scope.dataStationSum = [];
    		$scope.colHeaderSum = [];
    	} else {
    		paramStation = $scope.station;
    	}

    	Online.getRainSum(paramStation, $scope.momentDate, $scope.days, $scope.minutes).then(function(response) {
    		console.log('response.data',response.data);
    		$scope.dataRainSum = response.data;
    		$scope.colHeaderSum = response.data.colHeader;
	        $scope.dataRainSum.rows.forEach(function(element) {
	            $scope.dataStationSum.push(element.data);
	        });
	        console.log('$scope.colHeaderSum',$scope.colHeaderSum);
    	});
    });

    // Config datatables
    $scope.dtOptions = DTOptionsBuilder.newOptions()
        .withDOM("<'row'<'col-sm-8'p><'col-sm-4'B>>" + "<'row wp-table'<'col-sm-12'tr>>" + "<'row'<'col-sm-12'l>>")
        .withPaginationType('simple_numbers')
        .withDisplayLength(5)
        .withBootstrap()
        .withButtons([
            'copy',
            'print',
            'excel'
        ])
        .withLanguage({
            "sEmptyTable": "Không có dữ liệu trong bảng",
            "sInfo": "Hiển thị _START_ đến _END_ của _TOTAL_ bản ghi",
            "sInfoEmpty": "Hiển thị 0 đến 0 của 0 bản ghi",
            "sInfoFiltered": "(lọc từ _MAX_ tổng số bản ghi)",
            "sInfoPostFix": "",
            "sInfoThousands": ",",
            "sLengthMenu": "Hiển thị _MENU_ bản ghi",
            "sLoadingRecords": "Đang tải...",
            "sProcessing": "Đang xử lý...",
            "sSearch": "Tìm kiếm : ",
            "sZeroRecords": "Không tìm thấy kết quả",
            "oPaginate": {
                "sFirst": "Đầu tiên",
                "sLast": "Cuối cùng",
                "sNext": "Kế tiếp",
                "sPrevious": "Trước"
            },
            "oAria": {
                "sSortAscending": ": sắp xếp cột tăng dần",
                "sSortDescending": ": sắp xếp cột giảm dần"
            }
        })
        .withOption('lengthMenu', [
            [5, 10, 25, -1],
            [5, 10, 25, "All"]
        ])
        .withOption('autoWidth', true);
});