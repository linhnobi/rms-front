'use strict';

angular.module('rmsSystem').controller('LinhCtrl', LinhCtrl);

function LinhCtrl($q, $http, DTOptionsBuilder, DTColumnBuilder) {
  var vm = this;
  vm.persons = [];
  
  vm.dtOptions = DTOptionsBuilder.fromFnPromise(getData)
        .withDOM('frtip')
        .withPaginationType('full_numbers')
        .withButtons([
            'columnsToggle',
            'colvis',
            'copy',
            'print',
            'excel',
            {
                text: 'Some button',
                key: '1',
                action: function (e, dt, node, config) {
                    alert('Button activated');
                }
            }
        ]);
  vm.dtColumns = [
    DTColumnBuilder.newColumn('id').withTitle('ID'),
    DTColumnBuilder.newColumn('firstName').withTitle('First name'),
    DTColumnBuilder.newColumn('lastName').withTitle('Last name')
  ];
  
  function getData() {
    var defer = $q.defer();
    $http.get('https://raw.githubusercontent.com/l-lin/angular-datatables/dev/data.json').then(function(result) {
      defer.resolve(result.data);
    });
    console.log();
    return defer.promise;
  }
}
