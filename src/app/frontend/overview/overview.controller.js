'use strict';

angular.module('rmsSystem').controller('OverviewCtrl', function($scope, Overview, Station, User, $cookieStore, DTOptionsBuilder, DTColumnBuilder, DTColumnDefBuilder) {
    $scope.momentDate = moment().format('DD-MM-YYYY');
    $scope.dataStation = [];
    $scope.dataRainAllRow = [];
    $scope.dtColumnsRainDay = [];
    $scope.dtColumnsRainAll = [];
    $scope.dtInstances = [];
    $scope.count = 0;
    //console.log('$scope.momentDate', $scope.momentDate);


    moment.createFromInputFallback = function(config) {
        config._d = new Date(NaN);
        console.log(config._d);
    }

    // Get list trạm
    Station.get().then(function(response) {
        //$scope.listStation = response.data;
        //$scope.station.stationCode = $scope.listStation[0].stationCode;
        // console.log('listStation', $scope.listStation);
        // console.log('station', $scope.station);
    });

    $scope.changeStation = function() {
        console.log('changeStation', $scope.station);
    }

    /**
     * Get user info , get list station of user
     */
    var userId = $cookieStore.get('localData')['userId'];
    User.getProfile(userId).then(function(response) {
        $scope.userinfo = response.data;
        $scope.listStation = response.data.stationPermission;
        console.log('$scope.listStation', $scope.listStation);
    });




    $scope.$watchGroup(['momentDate', 'station.stationCode'], function() {
        //console.log('momentDate', $scope.momentDate);
        Overview.getRainDay($scope.momentDate, 10).then(function(response) {
            $scope.dataRainDay = response.data;

            $scope.dataRainDay.colHeader.forEach((element) => {
                var colHeader = DTColumnBuilder.newColumn(element).withTitle(element);
                $scope.dtColumnsRainDay.push(colHeader);
            })

            $scope.dataRainDay.rows.forEach(function(element) {
                $scope.dataStation.push(element.data);
            });
            $scope.dtInstances = [];
        });

        $scope.prevDay = function() {
            //console.log('$scope.momentDate', $scope.momentDate.toString());
            $scope.count++;
            //var a = $scope.momentDate.toString();
            // var a = moment($scope.momentDate.toString());
            // var b = a.add(1, 'days');
            // console.log('bbbbb', b);
            //console.log('test 111', moment($scope.momentDate));
            //console.log('test', moment($scope.momentDate).add(1, 'days').format('DD-MM-YYYY'));
            $scope.momentDate = moment().subtract($scope.count, 'days').format('DD-MM-YYYY');
        }

        $scope.nextDay = function() {
            $scope.count++;
            $scope.momentDate = moment().add($scope.count, 'days').format('DD-MM-YYYY');
        }



        // console.log('station $watchGroup', $scope.station.stationCode);
        // console.log('momentDate', $scope.momentDate);
        // console.log('$scope.station.stationCode', $scope.station.stationCode);
        Overview.getRainAll(1050, $scope.momentDate, 1, 2).then(function(response) {
            if (response) {
                $scope.dataRainAll = response.data;
                $scope.dataRainAll.rows.forEach(function(element) {
                    $scope.dataRainAllRow.push(element.data);
                });
                $scope.dataRainAll.colHeader.forEach((element) => {
                    var colHeader = DTColumnBuilder.newColumn(element).withTitle(element);
                    $scope.dtColumnsRainAll.push(colHeader);
                })
                $scope.dtInstances = [];
                // if (sensor == 8) {
                //     $scope.dataTableHour8 = response.data;
                //     $scope.dataTableHour24 = [];
                //bindData8ChartAndGrid(sortedData);
                // } else {
                //     $scope.dataTableHour24 = response.data;
                //     $scope.dataTableHour8 = [];
                //     bindData24ChartAndGrid(sortedData);
                // }
            }

            //console.log('$scope.dataRainAllRow', $scope.dataRainAllRow);
        });

        // Vẽ Chart

        $scope.labels = [];
        for (var i = 0; i <= 23; i++) {
            $scope.labels.push(i + ":00");
        }

        //$scope.labels = ["January", "February", "March", "April", "May", "June", "July"];
        $scope.series = ['Series A', 'Series B'];
        //$scope.data = $scope.dataRainAll.rows;
        // [
        //     [65, 59, 80, 81, 56, 55, 40],
        //     [28, 48, 40, 19, 86, 27, 90]
        // ];
        $scope.onClick = function(points, evt) {
            console.log(points, evt);
        };
        $scope.datasetOverride = [{ yAxisID: 'y-axis-1' }, { yAxisID: 'y-axis-2' }];
        $scope.options = {
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
                ]
            }
        };

    });

    // End $watchGroup

    console.log('$scope.dtColumns', $scope.dtColumns);

    //$scope.dtColumnDefs = [];



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
        .withOption('autoWidth', false);




});