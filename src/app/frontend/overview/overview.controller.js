'use strict';

angular.module('rmsSystem').controller('OverviewCtrl', function($scope, Overview, Station, User, $cookieStore, DTOptionsBuilder, DTColumnBuilder, DTColumnDefBuilder) {
    $scope.momentDate = moment().format('DD-MM-YYYY');
    $scope.dataStation = [];
    $scope.dataRainAllRow = [];
    $scope.dtColumnsRainDay = [];
    $scope.dtColumnsRainAll = [];
    $scope.dtInstances = [];
    $scope.countNext = 0;
    $scope.countPrev = 0;
    $scope.dataChart8 = [];
    $scope.waterdatasetOverride = [];
    $scope.sensor;
    moment.createFromInputFallback = function(config) {
        config._d = new Date(NaN);
    }

    $scope.changeStation = function() {}

    /**
     * Get user info , get list station of user
     */
    var userId = $cookieStore.get('localData')['userId'];
    User.getProfile(userId).then(function(response) {
        $scope.userinfo = response.data;
        $scope.listStation = response.data.stationPermission;
        $scope.station = $scope.listStation[0].key;
    });

    /**
     *  Setup label Chart
     */
    var labels = [];
    for (var hour = 0; hour < 720; hour++) {
        labels.push(moment().startOf('day').minutes(hour * 2).format('H:mm'));
    }
    $scope.datasetOverride = [];
    $scope.waterColors = [];
    $scope.waterChartOptions = {
        scales: {
            yAxes: [{
                    id: 'y-axis-1',
                    type: 'linear',
                    display: true,
                    position: 'left'
                },
                {
                    id: 'y-axis-2',
                    type: 'linear',
                    display: true,
                    position: 'right'
                }
            ],
            xAxes: [{
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
            }]
        },
        elements: {
            point: {
                radius: 0
            }
        },
        legend: { display: true },
    };

    $scope.$watchGroup(['momentDate', 'station'], function() {
        $scope.prevDay = function() {
            $scope.countPrev++;
            $scope.momentDate = moment().subtract($scope.countPrev, 'days').format('DD-MM-YYYY');
        }

        $scope.nextDay = function() {
            $scope.countNext++;
            $scope.momentDate = moment().add($scope.countNext, 'days').format('DD-MM-YYYY');
        }

        Overview.getRainDay($scope.momentDate, 10).then(function(response) {
            $scope.dataRainDay = [];
            $scope.dataStation = [];
            $scope.dataRainDay = response.data;

            $scope.dataRainDay.rows.forEach(function(element) {
                $scope.dataStation.push(element.data);
            });

        });

        if ($scope.station) {
            Overview.getRainAll($scope.station, $scope.momentDate, 1, 2).then(function(response) {
                var rain8 = [];
                var water8 = [];
                var temperature24 = [];
                var humidity24 = [];
                var rain24 = [];
                var pressure24 = [];
                $scope.data24Rain = [];
                $scope.data24Pressure = [];
                $scope.data24Temperature = [];
                $scope.dataRainAll = [];
                $scope.dataRainAllRow = [];
                $scope.listStation.forEach(function(_station) {
                    if ($scope.station === _station.key) {
                        $scope.sensor = _station.station.sensor;
                    }
                });
                if (response && response.data) {
                    $scope.dataRainAll = response.data;
                    $scope.dataRainAll.rows.forEach(function(element) {
                        $scope.dataRainAllRow.push(element.data);
                        if ($scope.sensor == 8) {
                            rain8.push(validateValue(element.data[2], true));
                            water8.push(validateValue(element.data[3], true));
                        } else if ($scope.sensor == 24) {

                            rain24.push(validateValue(element.data[2], true));
                            pressure24.push(validateValue(element.data[8], true));
                            temperature24.push(validateValue(element.data[3], true));
                            humidity24.push(validateValue(element.data[6], true));
                        }

                    });

                    $scope.dataChart8.push(rain8);
                    $scope.dataChart8.push(water8);
                    $scope.data24Temperature.push(temperature24);
                    $scope.data24Temperature.push(humidity24);
                    $scope.data24Rain.push(rain24);
                    $scope.data24Pressure.push(pressure24);
                } else {

                }
            });
        }
        // Vẽ Chart 8 sensor

        $scope.waterSeries = ['Lượng mưa', 'Mực nước'];
        $scope.data_Chart8 = $scope.dataChart8;

        $scope.onClick = function(points, evt) {
            console.log(points, evt);
        };

        $scope.ChartLabels = labels;
        $scope.waterColors = ['#3bff11', '#45b7cd'];


        $scope.waterdatasetOverride.push({
            yAxisID: 'y-axis-1',
            label: "Lượng Mưa (mm)",
            borderWidth: 1,
            backgroundColor: "rgba(255,255,255,0)",
            type: 'line'
        });

        $scope.waterdatasetOverride.push({
            yAxisID: 'y-axis-2',
            label: "Mực nước (m)",
            borderWidth: 1,
            backgroundColor: "rgba(255,255,255,0)",
            type: 'line'
        });





    }, true);

    // End $watchGroup

    $scope.dtOptions = DTOptionsBuilder.newOptions()
        .withDOM("<'row'<'col-sm-9'p><'col-sm-3'B>>" + "<'row wp-table'<'col-sm-12'tr>>" + "<'row'<'col-sm-12'l>>")
        .withPaginationType('simple_numbers')
        .withDisplayLength(10)
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
            [10, 25, 50, 100, -1],
            [10, 25, 50, 100, "All"]
        ])
        .withOption('autoWidth', true);

    // Vẽ Chart 24 sensor Lượng mưa
    $scope.series24Rain = ['Lượng mưa(mm)'];
    $scope.options24Rain = {
        scales: {
            yAxes: [{
                id: 'y-axis-1',
                type: 'linear',
                display: true,
                position: 'left',
                gridLines: {
                    display: false,
                }
            }],
            xAxes: [{
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
            }]
        },
        elements: {
            point: {
                radius: 0
            }
        },
        legend: { display: true },
    };

    $scope.datasetOverride24Rain = [{
        yAxisID: 'y-axis-1',
        label: "Lượng Mưa (mm)",
        borderWidth: 1,
        backgroundColor: "rgba(255,255,255,0)",
        type: 'line'
    }];
    $scope.colors24Rain = ['#45b7cd'];




    $scope.series24Temperature = ['Nhiệt độ', 'Độ ẩm'];
    $scope.colors24Temperature = ['#FDB45C', '#4D5360']
    $scope.options24Temperature = {
        scales: {
            yAxes: [{
                    id: 'y-axis-1',
                    type: 'linear',
                    display: true,
                    position: 'left',
                    gridLines: {
                        display: false,
                    }

                }, {
                    id: 'y-axis-2',
                    type: 'linear',
                    display: true,
                    position: 'right',
                    gridLines: {
                        display: false,
                    }
                }

            ],
            xAxes: [{
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
            }]
        },
        elements: {
            point: {
                radius: 0
            }
        },
        legend: { display: true },
    };
    $scope.datasetOverride24Temperature = [{
            yAxisID: 'y-axis-1',
            label: "Nhiêt độ",
            borderWidth: 1,
            backgroundColor: "rgba(255,255,255,0)",
            type: 'line'
        },
        {
            yAxisID: 'y-axis-2',
            label: "Độ ẩm",
            borderWidth: 1,
            backgroundColor: "rgba(255,255,255,0)",
            type: 'line'
        }
    ];




    $scope.series24Pressure = ['Áp xuất khí quyển'];
    $scope.colors24Pressure = ['#46BFBD'];
    $scope.options24Pressure = {
        scales: {
            yAxes: [{
                id: 'y-axis-1',
                type: 'linear',
                display: true,
                position: 'left'
            }],
            xAxes: [{
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
            }]
        },
        elements: {
            point: {
                radius: 0
            }
        },
        legend: { display: true },
    };
    $scope.datasetOverride24Pressure = [{
        yAxisID: 'y-axis-1',
        label: "Áp suất",
        borderWidth: 1,
        backgroundColor: "rgba(255,255,255,0)",
        type: 'line'
    }];

    /**
     * Validate value
     * er -> null
     * "" -> 0 
     * @param {*} value 
     * @param {*} getNull 
     */
    var validateValue = function(value, getNull) {
        var meaninglessData = ['er'];
        var meaninglessData2 = [""];
        var validatedValue = value;
        if (meaninglessData.indexOf(value) != -1 && getNull) {
            validatedValue = null;
        }
        if (meaninglessData2.indexOf(value) != -1 && getNull) {
            validatedValue = 0;
        }
        return validatedValue;
    }

    console.log(validateValue('', true));
});