'use strict';

angular.module('rmsSystem').controller('OnlineCtrl', function($scope, Overview, Station, User, geoJson, $timeout, $cookieStore, DTOptionsBuilder, DTColumnBuilder, DTColumnDefBuilder) {
	$scope.userinfo = {};
	var userId = $cookieStore.get('localData')['userId'];
    User.getProfile(userId).then(function(response) {
        $scope.userinfo = response.data;
        console.log(response.data);
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

    //var areas = [];
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
        console.log('1');
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


});