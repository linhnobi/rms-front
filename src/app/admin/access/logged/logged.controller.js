'use strict';

angular.module('rmsSystem').controller('LoggedCtrl', function ($scope, loggedUsers, Access) {
	$scope.loggedUsers = loggedUsers;

	$scope.dtOptions = {
		fnDrawCallback: function (oSettings) {
			if (oSettings._iDisplayLength >= oSettings.fnRecordsDisplay()) {
				$(oSettings.nTableWrapper).find('.dataTables_paginate').hide();
			}
		},
		columnDefs: [
			{
				searchable: false,
				targets: 0
			}
		],
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
		iDisplayLength: 5,
		bLengthChange: false,
		bInfo: false,
		sDom: '<"clearfix"lfr>t<"clearfix"ip>'
	};

	$scope.kickout = function (id) {
		Access.kickout(id).then(function () {
			_.remove($scope.loggedUsers, function (u) {
				return u.id === id;
			});
		});
	};
	$scope.deny = function (id) {
		Access.deny(id).then(function () {
			_.remove($scope.loggedUsers, function (u) {
				return u.id === id;
			});
		});
	};
});
