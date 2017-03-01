'use strict';

angular.module('rmsSystem').controller('StatisticsCtrl', function ($scope, $q, $http, geoJson, $cookieStore, $filter, Area, Station, User, $timeout, growl, uiGridConstants, uiGridGroupingConstants,DTOptionsBuilder, DTColumnBuilder,DTColumnDefBuilder){
    $scope.dataTableHour = {};
    $scope.momentDate = moment().format('DD-MM-YYYY');
    // Linh Add
    $scope.dataTableMinute8 = [];
    $scope.dataTableMinute24 = [];
    $scope.dataTableHour8 = [];
    $scope.dataTableHour24 = [];
    $scope.bindMeaningData = function (data) {
        return meaninglessData.indexOf(data) !== -1 ? 0 : data;
    }
    var initArea = function (jsonData) {
        if (!jsonData || !jsonData.length) {
            return [];
        }
        _.each(jsonData, function (area) {
            var a = _.pick(area, ['areaCode', 'areaName', 'id']);
//                          if (a.provinceCode === 'VN.44') {
//                              a.displayName = a.feature.properties.name;
//                              a.order = 7;
//                          } else {
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

    var checkCode = function (code, compareCode) {
        var codes = [code];
        if (code === 'VN_REGION_DB' || code === 'VN_REGION_DBSH') {
            codes = ['VN_REGION_DB', 'VN_REGION_DBSH'];
        }
        if (code === 'VN_REGION_DNB' || code === 'VN_REGION_TNB') {
            codes = ['VN_REGION_DNB', 'VN_REGION_TNB'];
        }
        return codes.indexOf(compareCode) !== -1;
    };

    var getCurrentArea = function (jsonData, code) {
        var type = code ? 'area' : 'country';
        var out = {
            type: type,
            areaCode: code,
            features: []
        };
        _.each(jsonData, function (d) {
            if (!code || checkCode(code, d.areaCode)) {
                out.features.push(d.feature);
            }
        });
        return out;
    };

    var roundValue = function (value, precision) {
        var multiplier = Math.pow(10, precision || 0);
        return parseFloat((Math.round(value * multiplier) / multiplier).toFixed(precision));
    }

    var validateValue = function (value, getNull) {
        var meaninglessData = [-9999, -3.916];//, 999];
        var validatedValue = value;
        if (meaninglessData.indexOf(value) != -1 && getNull) {
            validatedValue = null;
        }
        if (meaninglessData.indexOf(value) != -1 && !getNull) {
            validatedValue = 0;
        }
        return validatedValue;
    }

    var getRecordFromHourTableByDate = function (date) {
        var found = $filter('filter')($scope.dataTableHour.data, {hr: date}, true);
        if (found.length) {
            return found[0];
        } else {
            return null;
        }
    }

    var parseMomentToTime = function (date, time) {
        return moment(date + " 23:59:59", "DD-MM-YYYY hh:mm:ss").valueOf()
    }

    var areas = [];
    $scope.areas = initArea(geoJson);
    $scope.currentArea = null;
    $timeout(function () {
        $scope.currentArea = getCurrentArea(geoJson);
    });

    $scope.states = [];
    $scope.currentState = null;

    $scope.stations = [];
    $scope.userinfo = {};

    $scope.currentStation = null;

    $scope.model = {};

    var userId = $cookieStore.get('localData')['userId'];
    User.getProfile(userId).then(function (response) {
        $scope.userinfo = response.data;
        console.log(response.data);
    });

    $scope.getStatesByArea = function (areaCode) {
        Area.getStatesByArea(areaCode).then(function (reponse) {
            $scope.states = reponse.data;
            console.log('linh1',response.data)
        });
    };

    $scope.getStationByArea = function (areaCode) {
        if (areaCode) {
            Station.getByArea(areaCode).then(function (response) {
                $scope.stations = response.data;
            });
        } else {


            Station.get().then(function (response) {
                $scope.stations = response.data;
            });

        }
    };

    $scope.getStationByProvince = function (provinceCode) {
        Station.getByProvince(provinceCode).then(function (response) {
            $scope.stations = response.data;
        });
    };


    var setArea = function (index) {
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

    $scope.$watch('model.area', function (nv) {
        setArea(nv);
    });

    $scope.$watch('model.state', function (nv) {
        if (nv) {
            $scope.currentArea = {type: 'state', features: [$scope.states[nv].feature]};
            $scope.currentState = angular.copy($scope.states[nv]);
            if ($scope.currentArea) {
                $scope.getStationByProvince($scope.states[nv].provinceCode);
            }
        } else {
            setArea($scope.model.area);
            $scope.currentState = null;
        }
    });

    $scope.$on('area:select', function (event, code) {
        var idx = _.findIndex($scope.areas, function (area) {
            return checkCode(code, area.areaCode);
        });
        if (idx !== -1) {
            var index = idx.toString();
            $scope.model.area = index;
            $scope.$$phase || $scope.$apply();
        }
    });
    $scope.$on('state:select', function (event, code) {
        var idx = _.findIndex($scope.states, function (state) {
            return code === state.provinceCode;
        });
        if (idx !== -1) {
            var index = idx.toString();
            $scope.model.state = index;
            $scope.$$phase || $scope.$apply();
        }
    });

    $scope.$on('station:select', function (event, station) {
        $scope.model.station = station;
        $scope.$$phase || $scope.$apply();
    });

//station info
    $scope.model.filterDate = new Date();
    $scope.model.filterTime = new Date(1999, 0, 1, 15, 30, 0);
    $scope.model.filterTime.setHours($scope.model.filterDate.getHours());
    $scope.model.filterTime.setMinutes($scope.model.filterDate.getMinutes());
    $scope.model.days = "0";
    $scope.model.intervals = "5";
    $scope.getNumber = function (num) {
        return new Array(num);
    }

    $scope.$watchGroup(['model.filterDate', 'model.station', 'model.filterTime', 'model.days', 'momentDate', 'momentTime'], function () {
        $scope.waterChartDatasetOverride = [
            {
                label: "Lượng Mưa (mm)",
                borderWidth: 1,
                type: 'line',
                yAxisID: 'y-axis-1'
            },
        ];
        $scope.rainChartDatasetOverride = [
            {
                label: "Lượng Mưa (mm)",
                borderWidth: 1,
                type: 'bar',
                yAxisID: 'rain-y-axis-1'
            }
        ];
        $scope.rainChartData = [[]];
        $scope.dataTableHour.data = [];
        $scope.waterChartData[0].length = 0;

        $scope.waterChartData.length = 1;
        if (!$scope.model.station) {
            growl.success('Chọn trạm để xem thông tin', {ttl: 5000});
            return false;
        }
        if ($scope.userinfo.roles[0].roleName == "USER") {
            $scope.model.station.sensor = $scope.model.station.station.sensor;
        }

        if (!$scope.momentDate) {
            growl.success('Chọn ngày để xem thông tin');
            return false;
        }
        if (typeof $scope.userinfo.roles[0].roleName !== "undefined") {
            if ($scope.userinfo.roles[0].roleName == "USER") {
                $scope.model.station.StationFullNam = $scope.model.station.value;
                getDataTableHour($scope.model.station.station.stationCode,$scope.model.station.station.sensor);
                getDataTableMinute($scope.model.station.station.stationCode,$scope.model.station.station.sensor);
                
            } else {
                getDataTableHour($scope.model.station.stationCode,$scope.model.station.sensor);
                getDataTableMinute($scope.model.station.stationCode,$scope.model.station.sensor);
                $scope.model.station.StationFullNam = $scope.model.station.stationName;
               
            }
        }
    }, true);

// Chart config
    var labelsSimple = []
    var labels = [];
    for (var hour = 0; hour < 720; hour++) {
        labels.push(moment("2015-01-01").startOf('day').minutes(hour * 2).format('H:mm'));
    }
    for (var i = 0; i <= 23; i++) {
        labelsSimple.push(i + ":00");
    }
// Rain chart
    $scope.rainChartLabels = labelsSimple;
    $scope.rainColours = ['#45b7cd', '#ffe400', '#cd5a45'];
    $scope.rainChartSeries = ["Lượng Mưa"];
    $scope.rainChartData = [[]];
    $scope.rainChartDatasetOverride = [
        {
            label: "Lượng Mưa (mm)",
            borderWidth: 1,
            type: 'bar',
            yAxisID: 'rain-y-axis-1'
        }
    ];
    $scope.rainChartOptions = {
        // scales: {
        //     yAxes: [
        //         {
        //             id: 'rain-y-axis-1',
        //             type: 'linear',
        //             display: true,
        //             position: 'left',
        //             gridLines: {
        //                 display: false,
        //             }
        //         },
        //         {
        //             id: 'rain-y-axis-2',
        //             type: 'linear',
        //             display: true,
        //             position: 'right',
        //             gridLines: {
        //                 display: false,
        //             }
        //         },
        //         {
        //             id: 'rain-y-axis-3',
        //             type: 'linear',
        //             display: true,
        //             position: 'right',
        //             gridLines: {
        //                 display: false,
        //             }
        //         }
        //     ],
        //     xAxes: [
        //         {
        //             ticks: {
        //                 maxTicksLimit: 24
        //             }
        //         }
        //     ]
        // },
        // legend: {display: true},
    };

// Water chart
    $scope.waterChartLabels = labels;
    $scope.waterColours = ['#45b7cd', '#ffe400', '#cd5a45'];
    $scope.waterChartSeries = [];
    $scope.waterChartData = [
        []
    ];
    $scope.waterChartOnClick = function (points, evt) {
        console.log(points, evt);
    };
    $scope.waterChartDatasetOverride = [
        {
            label: "Lượng Mưa (mm)",
            borderWidth: 1,
            type: 'bar',
            yAxisID: 'y-axis-1'
        }
    ];
    $scope.waterChartOptions = {
        // scales: {
        //     yAxes: [
        //         {
        //             id: 'y-axis-1',
        //             type: 'linear',
        //             display: true,
        //             position: 'left',
        //             gridLines: {
        //                 display: false,
        //             }
        //         },
        //         {
        //             id: 'y-axis-2',
        //             type: 'linear',
        //             display: true,
        //             position: 'right',
        //             gridLines: {
        //                 display: false,
        //             }
        //         },
        //         {
        //             id: 'y-axis-3',
        //             type: 'linear',
        //             display: true,
        //             position: 'right',
        //             gridLines: {
        //                 display: false,
        //             }
        //         },
        //         {
        //             id: 'y-axis-4',
        //             type: 'linear',
        //             display: true,
        //             position: 'right',
        //             gridLines: {
        //                 display: false,
        //             }
        //         }
        //     ],
        //     xAxes: [
        //         {
        //             ticks: {
        //                 stepSize: 1
        //             },
        //             gridLines: {
        //                 display: false,
        //             }
        //         }
        //     ]
        // },
        // elements: {
        //     point: {
        //         radius: 0
        //     }
        // },
        // legend: {display: true}
    };

    var checkIsUndefinedOrNull = function (value) {
        return !value;
    }
    var padLeft = function (number) {
        return (number < 10 ? '0' : '') + number;
    }

    var changDay = function () {
        console.log('$scope.model.days',$scope.model.days);
    }

    var getDataTableHour = function (stations, sensor) {
        var day = $scope.model.days == 0 ? 1 : ($scope.model.days);
        Station.infoTableHour(stations, $scope.momentDate, parseInt(day) , sensor)
            .then(function (response) {
                var sortedData = $filter('orderBy')(response.data, 'date');
                if (sensor == 8 ) {
                    $scope.dataTableHour8 = response.data;
                    $scope.dataTableHour24 = [];
                    bindData8ChartAndGrid(sortedData);
                }else {
                    $scope.dataTableHour24 = response.data;
                    $scope.dataTableHour8 = [];
                    bindData24ChartAndGrid(sortedData);
                }
            },
            function () {
                growl.error('Không có dữ liệu cho trạm ' + $scope.model.station.stationName);
            });
    }

    
    var getDataTableMinute = function (stations, sensor) {
        var day = $scope.model.days == 0 ? 1 : ($scope.model.days);
        Station.infoTableMinute(stations, $scope.momentDate, parseInt($scope.model.days), sensor)
            .then(function (response) {
                var sortedData = $filter('orderBy')(response.data, 'date');
                if (sensor == 8 ) {
                    $scope.dataTableMinute8 = response.data;
                    $scope.dataTableMinute24 = [];
                    bindData8ChartAndGrid(sortedData);
                }else {
                    $scope.dataTableMinute24 = response.data;
                    $scope.dataTableMinute8 = [];
                    bindData24ChartAndGrid(sortedData);
                }
            },
            function () {
                growl.error('Không có dữ liệu cho trạm ' + $scope.model.station.stationName);
            });
    }

    $scope.dtOptions = DTOptionsBuilder.newOptions()
    .withDOM("<'row'<'col-sm-9'p><'col-sm-3'B>>" + "<'row wp-table'<'col-sm-12'tr>>" + "<'row'<'col-sm-12'l>>")
    .withPaginationType('simple_numbers')
    .withDisplayLength(30)
    .withBootstrap()
    .withButtons([
        'copy',
        'print',
        'excel'
    ])
    .withLanguage({
        "sEmptyTable":     "Không có dữ liệu trong bảng",
        "sInfo":           "Hiển thị _START_ đến _END_ của _TOTAL_ bản ghi",
        "sInfoEmpty":      "Hiển thị 0 đến 0 của 0 bản ghi",
        "sInfoFiltered":   "(lọc từ _MAX_ tổng số bản ghi)",
        "sInfoPostFix":    "",
        "sInfoThousands":  ",",
        "sLengthMenu":     "Hiển thị _MENU_ bản ghi",
        "sLoadingRecords": "Đang tải...",
        "sProcessing":     "Đang xử lý...",
        "sSearch":         "Tìm kiếm : ",
        "sZeroRecords":    "Không tìm thấy kết quả",
        "oPaginate": {
            "sFirst":    "Đầu tiên",
            "sLast":     "Cuối cùng",
            "sNext":     "Kế tiếp",
            "sPrevious": "Trước"
        },
        "oAria": {
            "sSortAscending":  ": sắp xếp cột tăng dần",
            "sSortDescending": ": sắp xếp cột giảm dần"
        }
    })
    .withOption('lengthMenu', [[30, 60, 90, 180, -1], [30, 60, 90, 180, "All"]])
    .withOption('autoWidth', false)
    ;
    
    // Chart
    var setupGridAndChart8 = function () {
        $scope.waterChartData = [[], []];
        $scope.waterColours = ['#45b7cd', '#ff0000'];
        $scope.waterChartOptions.scales = {
            yAxes: [
                {
                    id: 'y-axis-1',
                    type: 'linear',
                    display: true,
                    position: 'left',
                    gridLines: {
                        display: false,
                    },
                    ticks: {
                        suggestedMin: 2,
                        suggestedMax: 2,
                        stepSize: 0.5
                    },
                },
                {
                    id: 'y-axis-2',
                    type: 'linear',
                    display: true,
                    position: 'right',
                    gridLines: {
                        display: false,
                    }
                }
            ],
            xAxes: [
                {
                    type: 'time',
                    display: true,
                    time: {
                        format: "HH:mm",
                        unit: 'hour',
                        unitStepSize: 1,
                        displayFormats: {
                            'minute': 'HH:mm',
                            'hour': 'HH:mm'
                        },
                        max: moment("2015-01-01 23:58").format('H:mm')
                    },
                    gridLines: {
                        display: false,
                    },
                    ticks: {
                        beginAtZero: true
                    }
                }
            ]
        }

        $scope.waterChartDatasetOverride = [];
        $scope.waterChartDatasetOverride.push({
            label: "Lượng mưa (mm)",
            type: 'line',
            yAxisID: 'y-axis-1',
            backgroundColor: "rgba(255,255,255,0)",
        });

        $scope.waterChartDatasetOverride.push({
            label: "Mực Nước (mm)",
            type: 'line',
            yAxisID: 'y-axis-2',
            backgroundColor: "rgba(255,255,255,0)",
        });

        $scope.rainChartOptions = {
            scales: {
                yAxes: [
                    {
                        id: 'rain-y-axis-1',
                        type: 'linear',
                        display: true,
                        position: 'left',
                        gridLines: {
                            display: false,
                        },
                        ticks: {
                            suggestedMax: 15,
                            suggestedMin: 15,
                            stepSize: 5
                        },
                    },
                    {
                        id: 'rain-y-axis-2',
                        type: 'linear',
                        display: true,
                        position: 'right',
                        gridLines: {
                            display: false,
                        }
                    }
                ],
                xAxes: [
                    {
                        ticks: {
                            maxTicksLimit: 24,
                        }
                    }
                ]
            }
        };
    }

    var pushData8RainChart = function (record, index) {
        var rainData = validateValue(record.g_dat[0], false);
        $scope.rainChartData[0].push(rainData);
    }

    var bindData8ChartAndGrid = function (data) {
        setupGridAndChart8();
        angular.forEach(data, function (record, index) {
            pushData8RainChart(record, index);
            pushData8WaterRain(record, index);
        });
    }

    var pushData8WaterRain = function (record, index) {
        var rainData = validateValue(record.g_dat[0], true);
        var waterData = validateValue(record.g_dat[1], true);
        $scope.waterChartData[0].push(rainData)
        $scope.waterChartData[1].push(waterData);
    }


    
    var setupGridAndChart24 = function () {
        $scope.waterChartData = [
            [], [], [], []
        ];
        $scope.waterColours = ['#ffe400', '#cd5a45', "#37bc9b", "#45b7cd"];
        $scope.waterChartOptions = {
            scales: {
                yAxes: [
                    {
                        id: 'y-axis-1',
                        type: 'linear',
                        display: true,
                        position: 'left',
                        gridLines: {
                            display: false,
                        }
                    },
                    {
                        id: 'y-axis-2',
                        type: 'linear',
                        display: true,
                        position: 'right',
                        gridLines: {
                            display: false,
                        }
                    },
                    {
                        id: 'y-axis-3',
                        type: 'linear',
                        display: true,
                        position: 'right',
                        gridLines: {
                            display: false,
                        }
                    },
                    {
                        id: 'y-axis-4',
                        type: 'linear',
                        display: true,
                        position: 'right',
                        gridLines: {
                            display: false,
                        },
                        ticks: {
                            beginAtZero: true
                        },
                    }
                ],
                xAxes: [
                    {
                        type: 'time',
                        display: true,
                        time: {
                            format: "HH:mm",
                            unit: 'hour',
                            unitStepSize: 1,
                            displayFormats: {
                                'minute': 'HH:mm',
                                'hour': 'HH:mm'
                            },
                            max: moment("2015-01-01 23:58").format('H:mm')
                        },
                        gridLines: {
                            display: false,
                        }
                    }
                ]
            },
            elements: {
                point: {
                    radius: 0
                }
            },
            legend: {display: true},
        };

        $scope.rainChartOptions = {
            scales: {
                yAxes: [
                    {
                        id: 'rain-y-axis-1',
                        type: 'linear',
                        display: true,
                        position: 'left',
                        gridLines: {
                            display: false,
                        },
                        ticks: {
                            suggestedMax: 15,
                            suggestedMin: 15,
                            stepSize: 5,
                            beginAtZero: true
                        },
                    },
                    {
                        id: 'rain-y-axis-2',
                        type: 'linear',
                        display: true,
                        position: 'right',
                        gridLines: {
                            display: false,
                        },
                        ticks: {
                            beginAtZero: true
                        },
                    },
                    {
                        id: 'rain-y-axis-3',
                        type: 'linear',
                        display: true,
                        position: 'right',
                        gridLines: {
                            display: false,
                        },
                        ticks: {
                            beginAtZero: true
                        },
                    }
                ],
                 xAxes: [
                    {
                        ticks: {
                            maxTicksLimit: 24,
                        }
                    }
                ]
            },
            legend: {display: true}
        };

        $scope.rainChartData = [
            [], [], []
        ];
        $scope.rainChartDatasetOverride.push({
            label: "Bức Xạ",
            type: 'line',
            yAxisID: 'rain-y-axis-2',
            backgroundColor: "rgba(255,255,255,0)",
        });
        $scope.rainChartDatasetOverride.push({
            label: "Thời Gian Nắng",
            type: 'bar',
            yAxisID: 'rain-y-axis-3',
        })


        $scope.waterChartDatasetOverride = [];
        $scope.waterChartDatasetOverride.push({
            label: "Nhiệt Độ",
            type: 'line',
            yAxisID: 'y-axis-1',
            backgroundColor: "rgba(255,255,255,0)",
        });
        $scope.waterChartDatasetOverride.push({
            label: "Độ Ẩm",
            type: 'line',
            yAxisID: 'y-axis-2',
            backgroundColor: "rgba(255,255,255,0)",
        });
        $scope.waterChartDatasetOverride.push({
            label: "Áp Suất",
            type: 'line',
            yAxisID: 'y-axis-3',
            backgroundColor: "rgba(255,255,255,0)",
        });
        $scope.waterChartDatasetOverride.push({
            label: "Lượng Mưa",
            type: 'line',
            yAxisID: 'y-axis-4',
        });
    }

    var pushData24RainChart = function (record, index, hourIndex, summing) {
        //Lượng mưa
        $scope.rainChartData[0].push(validateValue(record.g_dat[0], false));
        // Bức xạ
        $scope.rainChartData[1].push(validateValue(record.g_dat[15], false));
        // Thời gian nắng
        $scope.rainChartData[2].push(validateValue(record.g_dat[16], false));
        
    }

    var pushData24WaterRain = function (record, index, summing) {
        // nhiệt độ
        $scope.waterChartData[0].push(validateValue(record.g_dat[1],true));
        // độ ẩm
        $scope.waterChartData[1].push(validateValue(record.g_dat[4],true));
        // Áp suất
        $scope.waterChartData[2].push(validateValue(record.g_dat[6],true));
        // Lượng mưa
        $scope.waterChartData[3].push(validateValue(record.g_dat[0],true));
    }

    var bindData24ChartAndGrid = function (data) {
        setupGridAndChart24();
        angular.forEach(data, function (record, index) {
            pushData24RainChart(record, index);
            pushData24WaterRain(record, index, true);
        });
    }

    $scope.validateValue2 = function (value, getNull) {
        //var meaninglessData = [-9999];
        var meaninglessData = [-9999, -3.916];//, 999];
        var validatedValue = value;
        if (meaninglessData.indexOf(value) != -1 && getNull) {
            validatedValue = null;
        }
        if (meaninglessData.indexOf(value) != -1 && !getNull) {
            validatedValue = 0;
        }
        return validatedValue;
    }

});
