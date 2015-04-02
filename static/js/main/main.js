/**
 * Created by aditya on 21/01/15.
 */

var worlDataApp = angular.module('worlDataApp', []);

worlDataApp.service('categoriesService', function($http, $q) {

    var service = this;
    this.categories = {};

    this.getCategories = function() {

        // The promise is merely a wrapper that gives a
        // handle on the value that can be used
        // or referenced as pleased.
        var deferred_promise = $q.defer();

        if (!isEmpty(service.categories)) {
            // Sends a resolved object.
            deferred_promise.resolve(service.categories);
        } else {
            $http.get('/static/data/categories.json').
                success(function(response) {
                    console.log(response);
                    service.categories = response;
                    // Will be resolved later.
                    deferred_promise.resolve(response);
            })
        }
        return deferred_promise.promise;
    }
    
});

worlDataApp.service('indicatorService', function($http, $q) {

    var service = this;

    this.indicators = {};

    this.getCatIndicators = function(i) {

        // The promise is merely a wrapper that gives a
        // handle on the value that can be used
        // or referenced as pleased.
        var deferred_promise = $q.defer();

        if (service.indicators.hasOwnProperty(i)) {
            // Sends a resolved object.
            deferred_promise.resolve(service.indicators[i]);
        } else {
            $http.get('/static/data/indicators/' + i + '.json').
                success(function(response) {
                    console.log(response);
                    service.indicators[i] = response;
                    // Will be resolved later.
                    deferred_promise.resolve(response);
            })
        }
        console.log(service.indicators);
        return deferred_promise.promise;
    }

    this.getLocalCatIndicators = function(i) {
        if (service.indicators.hasOwnProperty(i))
            return service.indicators[i];
        return {};
    }

});

worlDataApp.service('dataService', function ($q, $http) {
    this.service = this;
    this.dataVariables = {};
    this.fetchData = function(ind, from, to, tableContainer) {
        // is optional, depending on whether we want to use cache.
        tableContainer = tableContainer || 0;

        // The promise is merely a wrapper that gives a
        // handle on the value that can be used
        // or referenced as pleased.
        var deferred_promise = $q.defer();

        var getQ = 'indData/' + ind + '/' + from + '/' + to;

        console.log(getQ);

        if (!tableContainer) {
            $http.get(getQ).success(function(response) { deferred_promise.resolve(response); });
        } else {
            $http.get(getQ).
                success(function(response) {
                    console.log(response);
                    // Will be resolved later.
                    deferred_promise.resolve(response);

                    var keys = [], vals = [];

                    for (var i = 1; i < 10; i++) {
                        var key = Object.keys(response)[i];
                        keys.push(key);
                        if (response[key] == null) {
                            response[key] = "NA";
                        } else {
                            response[key] = Number(response[key]).toFixed(3);
                        }
                        vals.push(response[key]);
                    }

                    tableContainer.innerHTML = "";
                    var table = Handsontable(tableContainer, {
                                data: [keys, vals],
                                startRows: 3,
                                startCols: 3,
                                colHeaders: true
                    })

                    console.log(table);
                })
        }
        return deferred_promise.promise;
    }
});

worlDataApp.controller('chooseController', function ($scope, categoriesService, indicatorService, dataService) {

    //share this item across
    $scope.dataVariables = dataService.dataVariables;

    $scope.range = function(min, max, step) {
        min = parseInt(min);
        max = parseInt(max);
        step = step || 1;
        var input = [];
        for (var i = min; i <= max; i += step) input.push(i);
        return input;
    };

    // setInterval(function() {console.log($scope.categories)}, 100);
    categoriesService.getCategories().then(function(response) {
        $scope.categories = response;
    });

    // Update the data objects.
    $scope.updateInds = function (numInds) {
        console.log("Number of indicators: ", numInds);
    }


    // get indicators
    $scope.getCatIndicators = indicatorService.getCatIndicators;
    $scope.getLocalCatIndicators = indicatorService.getLocalCatIndicators;
    $scope.getData = function(i) {
        var ind = $scope.dataVariables[i]['ind'];
        var from = $scope.dataVariables[i]['from'];
        var to = $scope.dataVariables[i]['to'];
        var tableContainer = document.getElementById('table-' + i);
        tableContainer.innerHTML = '<img src="static/img/loading.gif">';
        $scope.dataVariables[i]['data'] = dataService.fetchData(ind.trim(), from.trim(), to.trim(), tableContainer);
    }

});


// Helpers
function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

String.prototype.trim = function()
{
    return String(this).replace(/^\s+|\s+$/g, '');
};