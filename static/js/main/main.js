/**
 * Created by aditya on 21/01/15.
 */

var worlDataApp = angular.module('worlDataApp', ['ui.router']);

worlDataApp.config(function($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise("/");

    $stateProvider
        .state('choose', {
            controller: 'chooseController',
            url: "/",
            templateUrl: "static/templates/choose.html"
        }).state('result', {
            controller: 'resultController',
            templateUrl: "static/templates/result.html",
            params: {
                'something': undefined
            }
        });
})

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
    this.fetchDataPreview = function(ind, from, tableContainer) {
        // is optional, depending on whether we want to use cache.
        tableContainer = tableContainer || 0;

        // The promise is merely a wrapper that gives a
        // handle on the value that can be used
        // or referenced as pleased.
        var deferred_promise = $q.defer();

        var getQ = 'indDataPreview/' + ind + '/' + from;

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
                        var key = Object.keys(response.data)[i];
                        keys.push(key);
                        if (response.data[key] == null) {
                            response.data[key] = "NA";
                        } else {
                            response.data[key] = Number(response.data[key]).toPrecision(4);
                        }
                        vals.push(response.data[key]);
                    }

                    tableContainer.innerHTML = "";
                    var tableBox = document.createElement("p");
                    tableContainer.appendChild(tableBox);
                    var table = Handsontable(tableBox, {
                                data: [keys, vals],
                                startRows: 3,
                                startCols: 3,
                                colHeaders: true
                    })

                    var indDetails = "<p>" +
                        "id: " + (response.details.id || ind) + "<br />" +
                        "name: " + (response.details.name || "Name not found.") + "<br />" +
                        "source: " + (response.details.sourceOrganization || "Source not found.") + "<br />" +
                        "sourceNote: " + (response.details.sourceNote || "Source not found.") + "<br />" +
                        "Tags: " + (response.details.topics.reduce(function(prev, cur, index, arr) {
                                        return prev + ", " + cur;
                                   }, "") || "None")
                    + "</p>";
                    tableContainer.appendChild(document.createTextNode(indDetails));

                    console.log(indDetails);
                })
        }
        return deferred_promise.promise;
    }

    this.uploadData = function() {

        promise = $q.defer();

        $http.post('/regress', this.service.dataVariables).
          success(function(data, status, headers, config) {
            // this callback will be called asynchronously
            // when the response is available
                promise.resolve(data);
          }).
          error(function(data, status, headers, config) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
                promise.resolve(status);
          });

        return promise.promise;
    }


});

worlDataApp.controller('resultController', function ($scope, $stateParams, dataService) {

    $scope.results = $stateParams.something;

    $scope.arrived = function() {
        if ($scope.results.$$state.status == 1) {
            $scope.summary = $scope.results.$$state.value.summary;
            $scope.desc = $scope.results.$$state.value.desc;
            return true;
        }
        return false;
    }

    setTimeout(function() {console.log("Something:"  + $scope.results); }, 60);

});

worlDataApp.controller('chooseController', function ($scope, categoriesService, indicatorService, dataService, $state) {

    //share this item across
    $scope.dataVariables = dataService.dataVariables;
    // this is a function
    $scope.getResults = function() {
        $state.go('result', {'something': dataService.uploadData()});
    }


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

    $scope.getDataPreview = function(i) {
        i = i || -1;
        var ind = $scope.dataVariables[i]['ind'];
        var from = $scope.dataVariables['from'] || '2010';
        var tableContainer = document.getElementById('table-' + i);
        tableContainer.innerHTML = '<img src="static/img/loading.gif">';
        $scope.dataVariables[i]['data'] = dataService.fetchDataPreview(ind.trim(), from, tableContainer);
        //no special cases for final.
    }
});


worlDataApp.filter('angular', function () {
  return function () {
    return;
  };
});


// Helpers
function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

String.prototype.trim = function()
{
    return String(this).replace(/^\s+|\s+$/g, '');
};

//Todo: Make a preview function
//Todo: Dropdown.js
//Todo: menu cleanup