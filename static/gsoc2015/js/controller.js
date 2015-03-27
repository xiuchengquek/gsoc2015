/**
 * Created by quek on 22/03/2015.
 */


/** Changing prototype of String for easy Replacement /
 */



heter.controller('heterCtrl', ['$scope', '$http', 'dataServices', function heterCtrl($scope, $http, dataServices) {
    /* main  controller,
     TODO : break master controller into smaller controller for each directive.
     */

    $scope.patientBundle = { value: undefined };
    $scope.mutationprofile = { value: undefined};
    $scope.treatmentList = { value: undefined };
    $scope.biopsydata = [];
    $scope.current = dataServices

    var dataPromise = dataServices.call();
    dataPromise
        .then(
        function (results) {
            // load data for treatment and timeline first
            $scope.patientBundle.value = results
            $scope.treatmentList.value = results
        })
        .then(
        function () {
            // load gene-level information
            $scope.biopsydata = {value: dataServices.generateData()}
        }
    );
}]);

