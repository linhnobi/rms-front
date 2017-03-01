'use strict';
angular.module('rmsSystem').directive('rmsTable', function () {
	return {
		restrict: 'AE',
		scope: {
			data: '=',
			date: '='
		},
		controller: function ($scope) {
			$scope.dtOptions = {
				fnDrawCallback: function (oSettings) {
					if (oSettings._iDisplayLength >= oSettings.fnRecordsDisplay()) {
						$(oSettings.nTableWrapper).find('.dataTables_paginate').hide();
					}
				},
				bFilter: false,
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
				iDisplayLength: 30,
				bLengthChange: false,
				bInfo: false,
				sDom: '<"clearfix"lfr>t<"clearfix"ip>'
			};
			var init = function () {
				$scope.noData = true;
				$scope.infos = [];
				$scope.columnData = [];
				$scope.columnName = [];  
				$scope.currentTime = $scope.date ? new Date($scope.date) : new Date();
			};
			init();
			$scope.$watch('data', function (nv) {
				if (nv && nv.infos.length) {
					$scope.infos = nv.infos;
					var columnData = [];
					var i= 0;
					_.each($scope.infos, function(value) {
						var newInfos = [];
						var dateTime = "";
						if (value.date != null && value.date != "" && typeof(value.date) != "undefined") {
							var time = new Date(value.date);
							var theyear=time.getFullYear();
							var themonth=time.getMonth()+1;
							var thetoday=time.getDate() + 1;
							var theHours=time.getHours();
							// var theHours=time.getHours();
							var theMinutes=time.getMinutes();
							dateTime = thetoday + "/" + themonth + "/" + theyear + " " + theHours + ":" + theMinutes; 
						} else {
							dateTime = "";
						}
						// value.dateTime = "không";
						// var time = new Date(value.date);
						// var theyear=time.getFullYear();
						// var themonth=time.getMonth()+1;
						// var thetoday=time.getDate() + 1 ;
						// var theHours=time.getHours();
						// var theHours=time.getHours();
						// var theMinutes=time.getMinutes();
						// value.dateTime = thetoday + "/" + themonth + "/" + theyear + " " + theHours + ":" + theMinutes; 

						newInfos.push({name: "" , value: "" + dateTime});
						_.each(value.infos, function(v) {
							
							newInfos.push(v);

							// v.dateTime =  new Date();
							// var time = new Date();
							// var theyear=time.getFullYear();
							// var themonth=time.getMonth()+1;
							// var thetoday=time.getDate();
							// v.dateTime = thetoday + "/" + themonth + "/" + theyear; 
						});
						columnData.push({index: i , data: newInfos});
						i++;
					});
					i = 0;
					$scope.columnName.push({index: i , name: 'Ngày giờ'});
					if ($scope.infos[0].infos.length == 8) {
						$scope.columnName.push({index: 1 , name: 'R'});
						$scope.columnName.push({index: 2 , name: 'H'});
					} else {
						_.each($scope.infos[0].infos, function(value) {
							switch(i % 6){
								case 0:
									$scope.columnName.push({index: i , name: 'T'});
									break;
								case 1:
									$scope.columnName.push({index: i , name: 'Tx'});
									break;
								case 2:
									$scope.columnName.push({index: i , name: 'Tn'});
									break;
								case 3:
									$scope.columnName.push({index: i , name: 'Un'});
									break;
								case 4:
									$scope.columnName.push({index: i , name: 'Po'});
									break;
								case 5:
									$scope.columnName.push({index: i , name: 'Pn'});
									break;
								default:
									break;
							}
							
							i++;
						});
					}
					if ($scope.infos[0].infos.length == 8) {
						var newColumnData =[];
						var j= 0;
						_.each(columnData, function(value) {
							newColumnData[j] = {};
							// newColumnData[j]= value;
							newColumnData[j].data = [];
							newColumnData[j].data[0] = value.data[0];
							newColumnData[j].data[1] = value.data[5];
							newColumnData[j].data[2] = value.data[6];
							j++;
						});
						$scope.columnData = newColumnData;
					} else {
						$scope.columnData = columnData;
					}
					if (columnData.length > 0 ) {
						$scope.noData = false;
					}
					// $scope.columnData = columnData;
					// console.log("length:" + $scope.columnData.length);
				} else {
					init();
				}
			}, true);
		},
		templateUrl: 'components/directives/table/table.html'
	};
});
