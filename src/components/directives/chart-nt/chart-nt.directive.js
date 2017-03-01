'use strict';
angular.module('rmsSystem').directive('rmsNhiet', function ($timeout) {
	return {
		restrict: 'AE',
		scope: {
			resize: '=',
			data: '='
		},
		templateUrl: 'components/directives/chart-nt/chart.html',
		link: function (scope) {
			var categories = ['0', '1', '2', '3', '4', '5', '6', '7'];
			var name = 'Chọn một trạm trên bản đồ để xem dữ liệu';
			var data = [null, null, null, null, null, null, null];
			var chart;
			function initChart(chartCategories, chartData, chartName) {
				chartCategories = chartCategories || categories;
				chartData = chartData || [];
				chartName = chartName || name;
				chart = new Highcharts.Chart({
					title: false,
					//colors: ['#FF2221'],
					chart: {
//						type: 'spline',
						renderTo: 'statistics-chart-nt'
					},
					credits: {
						enabled: false
					},
					mapNavigation: false,
					exporting: {enabled: false},
					xAxis: {
						categories: chartCategories,
						crosshair: true
					},
					yAxis: [{
							labels: {
								format: '{value}°C',
								style: {
									color: '#FF2221'
								}
							},
							title: {
								text: 'Nhiệt độ',
								style: {
									color: '#FF2221'
								}
							},
							opposite: true
						}, {// Secondary yAxis
							gridLineWidth: 0,
							title: {
								text: 'Áp suất',
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
								text: 'Độ ẩm',
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
							name: 'Nhiệt độ',
							yAxis: 2,
							data: chartData[0] || data,
							type: 'spline',
							tooltip: {
								//valueSuffix: ' °C'
							},
							color: '#FF2221'
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
					var infos = datas.infos;
					var chartCategories = [];
					var chartData = [];
					var chartName = datas.stationName;
					var i = 0;
					_.each(infos, function (info) {
						var date = new Date(info.date * 1000);
						chartCategories.push(moment(date).format('HH:mm'));
						chartData[0] = chartData[0] ? chartData[0] : [];
						chartData[1] = chartData[1] ? chartData[1] : [];
						chartData[2] = chartData[2] ? chartData[2] : [];
						chartData[0].push(info.infos[4].value);
						chartData[1].push(info.infos[5].value);
						chartData[2].push(info.infos[6].value);
						i++;
					});
					setTimeout(function () {
						initChart(chartCategories, chartData, chartName);
					});
				}
			};
			var resize = function () {
				if (chart) {
					$timeout(function () {
						var height = $("#statistics-chart-nt").height();
						var width = $("#statistics-chart-nt").width();
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
				setTimeout(function () {
					initChart(categories, data, name);
				});
			}, true);
		}
	};
});
