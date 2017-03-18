'use strict';

angular.module('rmsSystem').controller('OverviewCtrl', function($scope, Overview, DTOptionsBuilder, DTColumnBuilder, DTColumnDefBuilder) {
    $scope.momentDate = moment().format('DD-MM-YYYY');
    $scope.dataStation = [];
    $scope.dataRainAllRow = [];
    $scope.dtColumns = [];
    $scope.count = 0;
    console.log('$scope.momentDate', $scope.momentDate);
    Overview.getRainAll(1050, '11-3-2017', 1, 2).then(function(response) {
        $scope.dataRainAll = response.data;
        $scope.dataRainAll.rows.forEach(function(element) {
            $scope.dataRainAllRow.push(element.data);
        });
        console.log('$scope.dataRainAllRow', $scope.dataRainAllRow);
    });

    moment.createFromInputFallback = function(config) {
        config._d = new Date(NaN);
        console.log(config._d);
    }


    $scope.$watchGroup(['momentDate'], function() {
        console.log('momentDate', $scope.momentDate);
        Overview.getRainDay($scope.momentDate, 10).then(function(response) {
            $scope.dataRainDay = response.data;

            $scope.dataRainDay.colHeader.forEach((element) => {
                console.log(element);
                var a = DTColumnBuilder.newColumn(element).withTitle(element);
                $scope.dtColumns.push(a);
            })

            $scope.dataRainDay.rows.forEach(function(element) {
                $scope.dataStation.push(element.data);
            });
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