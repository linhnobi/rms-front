'use strict';
angular.module('rmsSystem').directive('rmsDo', function ($timeout) {
	return {
		restrict: 'AE',
		scope: {
			resize: '=',
			data: '='
		},
		templateUrl: 'components/directives/chart-da/chart.html',
		link: function (scope) {
			// var categories = ['0', '1', '2', '3', '4', '5', '6', '7'];
			// var name = 'Chọn một trạm trên bản đồ để xem dữ liệu';
			// var data = [null, null, null, null, null, null, null];
			var chart;
			function initChart(chartCategories, chartData) {
				var chartCategories = chartCategories;
				var chartData = chartData;
				// var chartName = chartName;
				// console.log(chartName);
				console.log(chartData);
				console.log(chartCategories);
				chart = new Highcharts.Chart({
					// title: {
					// 	text: chartName
					// },
					title: false,
					//colors: ['#FF2221'],
					chart: {
						type: 'spline',
						renderTo: 'statistics-chart-da'
					},
					credits: {
						enabled: false
					},
					mapNavigation: false,
					exporting: {enabled: false},
					xAxis: {
						categories: [],
						crosshair: true
					},
					yAxis: [{
							labels: {
								format: '{value} m',
								style: {
									color: '#FF2221'
								}
							},
							title: {
								text: 'Lượng nước',
								style: {
									color: '#FF2221'
								}
							},
							opposite: true
						}, {// Secondary yAxis
							gridLineWidth: 0,
							title: {
								text: '',
								style: {
									//color: Highcharts.getOptions().colors[0]
								}
							},
							labels: {
								format: '{value}',
								style: {
									//color: Highcharts.getOptions().colors[0]
								}
							}

						}, {// Tertiary yAxis
							gridLineWidth: 0,
							title: {
								text: '',
								style: {
									color: '#37BC9B'
								}
							},
							labels: {
								format: '{value}',
								style: {
									color: '#37BC9B'
								}
							},
							opposite: true
						}],
					tooltip: {
						shared: true
					},
					series: [
						{
							name: 'Lượng nước',
							data: chartData,
							// type: 'spline',
							tooltip: {
								//valueSuffix: ' °C'
							},
							color: '#37BC9B'
						}]	
						// }, {
						// 	name: 'Độ ẩm',
						// 	yAxis: 2,
						// 	data: chartData[2] || data,
						// 	type: 'spline',
						// 	tooltip: {
						// 		//valueSuffix: ' °C'
						// 	},
						// 	color: '#37BC9B'
						// }, {
						// 	name: 'Nhiệt độ',
						// 	data: chartData[0] || data,
						// 	type: 'spline',
						// 	tooltip: {
						// 		valueSuffix: ' °C'
						// 	},
						// 	color: '#FF2221'
						// }]
				});
			}

			var setData = function (datas) {
				if (datas) {
					// var infos = datas.infos;
					// var chartCategories = [];
					// var chartData = [];
					// var chartName = datas.stationName;
					// var i = 0;
					// _.each(infos, function (info) {
					// 	var date = new Date(info.date * 1000);
					// 	chartCategories.push(moment(date).format('HH:mm'));
					// 	chartData[0] = chartData[0] ? chartData[0] : [];
					// 	chartData[1] = chartData[1] ? chartData[1] : [];
					// 	chartData[2] = chartData[2] ? chartData[2] : [];
					// 	chartData[0].push(info.infos[4].value);
					// 	chartData[1].push(info.infos[5].value);
					// 	i++;
					// });
					setTimeout(function () {
						initChart([], datas.yData);
					});
				}
			};
			var resize = function () {
				if (chart) {
					$timeout(function () {
						var height = $("#statistics-chart-da").height();
						var width = $("#statistics-chart-da").width();
						chart.setSize(width, height);
					}, 250);
				}
			};
			$(window).on('resize', resize);
			scope.$on('$destroy', function () {
				$(window).off('resize', resize);
			});
			scope.$watch('resize', function (nv) {
				if (nv) {
					resize();
				}
			});

			scope.$watch('data', function (data) {
				if (data) {
					return setData(data);
				}
			}, true);
		}
	};
});
