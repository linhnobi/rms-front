'use strict';

angular.module('rmsSystem')
				.filter('timeFilter', function () {
					return function (time, format, isTimeStamp) {
						var returnTime;
						if (isTimeStamp) {
							returnTime = moment(new Date(time * 1000)).format(format);
						}
						returnTime = moment(time).format(format);
						return returnTime === 'Invalid date' ? 'Không xác định' : returnTime;
					};
				})
				.filter('fromNow', function () {
					return function (time) {
						var now = new Date().getTime();
						var time = new Date(time).getTime();
						var days = Math.ceil((now - time) / 86400000);
						return 'Cách đây ' + days + ' ngày';
					};
				})
				.filter('propsFilter', function () {
					return function (items, props) {
						var out = [];

						if (angular.isArray(items)) {
							items.forEach(function (item) {
								var itemMatches = false;

								var keys = Object.keys(props);
								for (var i = 0; i < keys.length; i++) {
									var prop = keys[i];
									var text = props[prop].toLowerCase();
									if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
										itemMatches = true;
										break;
									}
								}

								if (itemMatches) {
									out.push(item);
								}
							});
						} else {
							// Let the output be the input untouched
							out = items;
						}

						return out;
					};
				});
