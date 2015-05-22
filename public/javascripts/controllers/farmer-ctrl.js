/**
 * Created by matjames007 on 4/29/15.
 */

angular.module('jasmic.controllers')

    /**
     *  This controller is used to handle the displaying of information on the
     *  Farmer Listing Page.
     */
    .controller('FarmerListingCtrl', ['$scope', '$mdDialog', '$location', '$routeParams', 'FarmersFactory',
        function ($scope, $mdDialog, $location, $routeParams, FarmersFactory) {
            FarmersFactory.query($routeParams, function(farmers) {
                $scope.farmers = farmers;
            }, function(error) {
                showDialog($mdDialog, error, true);
            });
            $scope.selected = false;

            $scope.selectedElement = function(farmer) {
                $scope.selectedFarmer = farmer;
                $scope.selected = true;
            };

            $scope.goToFarmer = function() {
                $location.url('farmer/'+$scope.selectedFarmer._id);
            };

            $scope.editFarmer = function() {
                $location.url('farmer/'+$scope.selectedFarmer._id+'/edit');
            };
        }
    ])

    /**
     * This controller does a query to retrieve the farmer by the specified ID in the
     * routeParameter.  It then creates the $scope.farmer object for the view to consume
     */
    .controller('FarmerProfileCtrl', ['$scope', '$location', '$routeParams', '$mdDialog',
        'TransactionsFactory', 'FarmerFactory', 'ParishesFactory', 'FarmerFarmFactory', 'CropsFactory',
        'UnitsFactory', 'CommodityFactory', 'CommoditiesFactory',
        function ($scope, $location, $routeParams, $mdDialog, TransactionsFactory,
                FarmerFactory, ParishesFactory, FarmerFarmFactory, CropsFactory, UnitsFactory,
                CommodityFactory, CommoditiesFactory) {
            /**
             * First query for the farmer based on the id supplied in the parameters,
             * then query for the transactions this farmer has been involved in.
             * TODO: Finish up this!
             */
            function loadAll() {
                FarmerFactory.show({id:$routeParams.id}, function(farmer) {
                    $scope.farmer = farmer;
                    $scope.completedTransactions = TransactionsFactory.query({
                        fr_farmer: farmer._id, tr_status: 'Completed'
                    });
                    $scope.pendingTransactions = TransactionsFactory.query({
                        fr_farmer: farmer._id, tr_status: 'Pending'
                    });
                    $scope.disputes = []; //TODO:  Create and Generate Endpoints and Functions
                }, function(err) {
                    console.log(err);
                });
            };
            function populateCommodities() {
                CommoditiesFactory.query({id: $routeParams.id}, function(list) {
                    $scope.commodities = list;
                }, function(fail) {
                    console.log(fail);
                });
            };
            loadAll();
            populateCommodities();

            /**
             * Quick and dirty check to see if information is present for
             * manipulation
             * @param obj
             * @returns {boolean}
             */
            $scope.isValid = function(obj) {
                if(obj == undefined) {
                    return false;
                } else if(obj == '') {
                    return false;
                } else {
                    return true;
                }
            };

            /**
             * Attempts to add new Farm to the farmer object.  Assumes the
             * server will take care of the address creation.
             */
            $scope.addNewFarm = function() {
                FarmerFarmFactory.create({id:$scope.farmer._id}, $scope.farm, function(success) {
                    showDialog($mdDialog, {statusText:"Successfully Added!"}, false);
                    $scope.farmer = success;
                    $scope.newFarm = !$scope.newFarm;
                }, function(fail) {
                    console.log(fail);
                    console.log($scope.farm);
                    showDialog($mdDialog, fail, true);
                });
            };

            $scope.cancelAdd = function() {
                $scope.newFarm = !$scope.newFarm;
            };

            /**
             * Necessary to load all parishes in the necessary forms
             */
            ParishesFactory.query({},
                function(parishes) {
                    $scope.parishes = parishes;
                },
                function(error) {
                    console.log(error);
                });

            /**
             * Button related functions and variables for hiding/showing
             * new forms
             */
            $scope.newFarmLocation = function() {
                $scope.newFarm = !$scope.newFarm;
            };
            $scope.newCommodityItem = function() {
                $scope.newCommodity = !$scope.newCommodity;
                $scope.commodity = {};
                $scope.commodity.co_availability_date= moment().toDate();
                $scope.commodity.co_until = moment().add(7, 'days').toDate();
            };
            $scope.newCommodity = false;
            $scope.newFarm = false;
            $scope.farm = {};
            $scope.commodity = {};
            var selectedCrop;

            /**
             * Open the page for editing the farmer.
             */
            $scope.editFarmer = function() {
                $location.url('farmer/'+$scope.farmer._id+'/edit');
            };

            /**
             *  This function does the magic for the auto-complete crop selection
             *  tool.  The API looks out for a key called 'beginsWith' and they
             *  constructs a regex expression that searches for the crop name and
             *  returns a list matching the expression.
             */
            $scope.queryCropSearch = function(cropName) {
                return CropsFactory.query({beginsWith: cropName});
            };
            $scope.selectedItemChange = function(item) {
                selectedCrop = item._id;
            };

            /**
             * Fetches the units that user can select
             */
            $scope.units = UnitsFactory.query({});

            $scope.saveCommodity = function() {
                $scope.commodity.cr_crop = selectedCrop;
                alert($scope.commodity.co_availability_date);
                console.log($scope.commodity);
                CommodityFactory.create({id:$scope.farmer._id}, $scope.commodity, function(success) {
                    $scope.newCommodityItem();
                    populateCommodities();
                }, function(error) {
                    showDialog($mdDialog, error, true);
                })
            }
        }
    ])
    /**
     * TODO:  Incomplete New Farmer Controller that utilizes the same view as the
     * edit farmer view
     */
    .controller('NewFarmerCtrl', ['$scope', '$routeParams', 'FarmerFactory',
        function ($scope, $routeParams, FarmerFactory) {
            $scope.save = function() {
                console.log($scope.farmer);
            };
        }
    ])
    /**
     * This controller is responsible for the querying of the farmer by id,
     * then creation of the farmer object for the view to render.  It also
     * populates the parishes combo box for user interaction.
     */
    .controller('EditFarmerCtrl', ['$scope', '$location', '$mdDialog','$routeParams', 'FarmerFactory', 'ParishesFactory',
        function ($scope, $location, $mdDialog, $routeParams, FarmerFactory, ParishesFactory) {
            FarmerFactory.show({id:$routeParams.id},
                function(farmer) {
                    $scope.farmer = farmer;
                    if(farmer.fa_dob == '') {
                        $scope.dob = moment(farmer.fa_dob).toDate();
                    } else {
                        $scope.dob = "";
                    }
                },
                function(error) {
                    showDialog($mdDialog, error, true);
                });

            ParishesFactory.query({},
                function(parishes) {
                    $scope.parishes = parishes;
                },
                function(error) {
                    console.log(error);
                });

            $scope.save = function() {
                FarmerFactory.update({id:$scope.farmer._id}, $scope.farmer, function(success) {
                    showDialog($mdDialog, {statusText:"Successfully Updated!"}, false);
                    $location.url('farmer/' + success._id);
                }, function(error) {
                    showDialog($mdDialog, error, true);
                });
            };

        }
    ]);

/**
 * A general purpose Dialog window to display feedback from the
 * server.
 *
 * @param $mdDialog
 * @param ev
 * @param message
 * @param isError
 */
function showDialog($mdDialog, message, isError) {
    $mdDialog.show(
        $mdDialog.alert()
            .parent(angular.element(document.body))
            .title(isError? 'Error Detected':'System Message')
            .content(message.statusText)
            .ariaLabel(isError?'Alert Error':'Alert Message')
            .ok('Ok')
    );
};