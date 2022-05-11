angular.module('MyApp')
	.controller('userController', ['$scope', '$rootScope', '$http', '$route', '$location', '$window', '$timeout', '$uibModal', 'Upload', 'Entity', function ($scope, $rootScope, $http, $route, $location, $window, $timeout, $uibModal, Upload, Entity) {
        
        var endurl= 'http://localhost:8802';    

        $scope.RedirectLink = function (path) {
			$location.path(path);
		}
        

		function InitTableStructure(headers, data)
		{
			$scope.tableData = {};
			$scope.tableData.headers = headers;
			$scope.tableData.data = data;
		}

		$scope.selectedRecord = [];

		$scope.selectRow = function(data)
		{
			if(data.bool == true)
			{
				$scope.selectedRecord.push(data);
			}
			else
			{
				var index = -1;
				
				$scope.selectedRecord.some(function(obj, i) {
					return obj.id === data.id ? index = i : false;
				  });
				$scope.selectedRecord.splice(index, 1);
			}
		}


		function getCommaListFromArray(list, field) {
			if (list != undefined && list.length > 0) {
			  var strList = "";
			  list.forEach(function (value) {
				strList = strList + value[field] + ", ";
			  });
			  console.log(strList)
			}
		
			if (strList != undefined) {
				strList = strList.substring(0, strList.length - 2);
			  	return strList;
			} else return "";
		  }


        //   USER DETAILS


        
		$scope.userDetails = {};
		

		
		
		$scope.getUserDetails = function(data)
		{
				$scope.userDetails = data;
		}

		$scope.saveUserDetails = function()
		{
			Entity.saveUserDetails().save($scope.userDetails).$promise.then(function(response){
				Swal({
					type: response.type,
					title: response.title,
					text: response.message,
				  }).then(function()  {
					location.reload();
				  })
			});
		}
        
		$scope.getCompanyLocations = function()
		{
			Entity.getCompanyLocations().query().$promise.then(function(response){
				if(!response.status)
					$scope.CompanyLocations = response.companyLocations;
			});
		}

		$scope.getUsersList = function()
		{
			Entity.getUsersList().query().$promise.then(function(response){
				if(response.status == 401)
				{
					$scope.RedirectLink('/')
				}
				else
				{
				if(!response.status)
					$scope.UsersList = response.UsersList;
					var headers = [
						{title:'Company Name', field:'company_name'},
						{title:'Location', field:'location_name'},
						{title:'Name', field:'name'},
						{title:'Mobile No.', field:'mobile'},
						{title:'Email', field:'email'},
					]

					InitTableStructure(headers, $scope.UsersList)
					$scope.getCompanyLocations();
				}
			});
           
		}


		$scope.deleteUsers = function()
		{

			Swal({
                title: 'Are you sure?',
                // text: status == 0?"You won't be able to revert this!":,
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: status == 0?'Yes, delete it!':"Yes, restore it!"
              }).then(function(result) {
                if (result.value) {

					var userid = getCommaListFromArray($scope.selectedRecord, 'id')

                    Entity.deleteUsers().query({userid:userid}).$promise.then(function (response) {   
                      Swal({
                        type: response.type,
                        title: response.title,
                        text: response.message,
                      }).then(function(){
                        $scope.getUsersList();
                      })
                    });
                  }
                });
		}

        //   USER DETAILS

        //   PARKING ALLOCATION

		$scope.filter = {};
		$scope.VehicalTypefilter = {};
		$scope.parkingPaymentfilter = {};

		$scope.resetFilter = function(filter, filterObj)
		{
			if(filter == '' || filter == null || filter < 0)
			{
				eval('$scope.'+filterObj+'= {}');
			}
		}

		$scope.applyFiltersOnData = function(obj, key, filter)
		{
			if(eval('$scope.'+obj+'["'+key+'"]') != filter)
			{
				eval('$scope.'+obj+'["'+key+'"] = "'+filter+'"');
			}
			else
			{
				eval('$scope.'+obj+'= {}');
			}
		}

		$scope.getAquiredParking = function()
		{

			

			Entity.getAquiredParking().save($scope.filter).$promise.then(function(response){
				if(response.status == 401)
				{
					$scope.RedirectLink('/')
				}
				else
				{
					if(response.parkingData)
					{
						$scope.parkingData = response.parkingData;
						$scope.parkingCapacity.map(function(val, parentIndex){
							eval('var '+val.vehicalType+'=$scope.parkingData.filter(function(subChildVal){return val.vehicalType == subChildVal.vehical_types });$scope.ArrayParkingList('+val.vehicalType+', val.vehicalType);');
						});
					}
				}
            });
		
			
		}

		$scope.ArrayParkingList = function(parkingList, val)
		{
			var selectedArray = eval('$scope.'+val+'Capacity = []');
			var totalCapacity = $scope.parkingCapacity.filter(function(capacityVal){
				return capacityVal.vehicalType == val;
			
			});				
			parkingList.map(function(childVal){
					selectedArray.push(childVal);
			});

				if(totalCapacity && totalCapacity.length > 0)
			{
				var freePlaces = parseInt(totalCapacity[0].capacity) - parkingList.length;
				for(var i = 0 ; i < freePlaces; i++)
				{
					selectedArray.push({});
				}
			}
		}

		$scope.reservedCount = function(data)
		{
			if(data)
			{
			var count = data.filter(function(capacityVal){
				return capacityVal.vehical_no != undefined && capacityVal.vehical_no != null && capacityVal.vehical_no != '';
			});		
			if(count && count.length >= 0)
				return count.length;
			else
			return 0;
			}
			return 0;
		}

        $scope.getLocationParkingCapacity = function()
        {
            Entity.getLocationParkingCapacity().query().$promise.then(function(response){
				if(response.status == 401)
				{
					$scope.RedirectLink('/')
				}
				else
				{
					if(response.capacity)
					$scope.parkingCapacity = JSON.parse(response.capacity[0]._parking_capacity);
					$scope.getAquiredParking();
					$scope.getParkringPrice();
				}
            });
        }
		$scope.parkingDetails = {};
		$scope.getParkringPrice = function()
		{
					if($scope.parkingCapacity && $scope.parkingCapacity.length == 1)
					{
						{
							$scope.parkingDetails['vehical_type'] = $scope.parkingCapacity[0].vehicalType;
							$scope.parkingDetails['amount'] = $scope.parkingCapacity[0].amount;
						}
					}
					else if($scope.parkingDetails != undefined && $scope.parkingDetails != null)
					{
						var selectedVehical = $scope.parkingCapacity.filter(function(value){
							return value.vehicalType == $scope.parkingDetails.vehical_type;
						});
						if(selectedVehical != undefined && selectedVehical.length > 0)
						{
							$scope.parkingDetails['amount'] = selectedVehical[0].amount;
						}
					}
		}

        $scope.getExistingVehicalsNumber = function()
        {
            Entity.getExistingVehicalsNumber().query().$promise.then(function(response){
				if(response.status == 401)
				{
					$scope.RedirectLink('/')
				}
				else
				{
					if(response.vehicals)
					$scope.existingVehicalsList = response.vehicals;
				}
            });
        }

		$scope.saveParkingAllocationDetails = function()
		{
			
				Entity.saveParkingAllocationDetails().save($scope.parkingDetails).$promise.then(function(response){
					Swal({
						type: response.type,
						title: response.title,
						text: response.message,
					}).then(function()  {
						location.reload();
					})
				});
			
		}

		$scope.getCustomerData = function(data)
		{
			Entity.getCustomerData().query({id:data.id}).$promise.then(function (response) {   
				if(response.status == 401)
				{
					$scope.RedirectLink('/')
				}
				else
				{
					if(response.customerDetails)
					{
						$scope.customerDetails = response.customerDetails;
						console.log($scope.customerDetails)
						$scope.parkingDetails['customer_name'] = $scope.customerDetails[0].customer_name;
						$scope.parkingDetails['vehical_type'] = $scope.customerDetails[0].vehical_type;
						$scope.parkingDetails['mobile'] = $scope.customerDetails[0].mobile;
						$scope.parkingDetails['email'] = $scope.customerDetails[0].email;
						$scope.getParkringPrice();
					}
				}
			});
			
		}

		$scope.dynamicArray = function(vehicalType)
		{
			return eval('$scope.'+vehicalType+'Capacity');
		}

		$scope.getParkingDetails = function(data)
		{
			$scope.parkingDetails = data;
			$scope.parkingDetails.time_to = new Date(data.time_to);
			$scope.getCustomerData({id: data.customer_id});
			
			console.log(data);
		}
        //   PARKING ALLOCATION

		  //   CUSTOMER DETAILS


        
		  $scope.customerDetails = {};
	
		  $scope.getCustomerDetails = function(data)
		  {
				  $scope.customerDetails = data;
		  }
  
		  $scope.saveCustomerDetails = function()
		  {
			  Entity.saveCustomerDetails().save($scope.customerDetails).$promise.then(function(response){
				  Swal({
					  type: response.type,
					  title: response.title,
					  text: response.message,
					}).then(function()  {
					  location.reload();
					})
			  });
		  }
  
		  $scope.getCustomersList = function()
		  {
			  Entity.getCustomersList().query().$promise.then(function(response){
				  if(response.status == 401)
				  {
					  $scope.RedirectLink('/')
				  }
				  else
				  {
				  if(!response.status)
					  $scope.CustomersList = response.CustomersList;
					  console.log($scope.CustomersList)
					  var headers = [
						  {title:'Company Name', field:'company_name'},
						  {title:'Location', field:'location_name'},
						  {title:'Name', field:'customer_name'},
						  {title:'Mobile No.', field:'mobile'},
						  {title:'Email', field:'email'},
					  ]
  
					  InitTableStructure(headers, $scope.CustomersList)
				  }
			  });
			 
		  }
  
  
		  $scope.deleteCustomers = function()
		  {
  
			  Swal({
				  title: 'Are you sure?',
				  // text: status == 0?"You won't be able to revert this!":,
				  type: 'warning',
				  showCancelButton: true,
				  confirmButtonColor: '#3085d6',
				  cancelButtonColor: '#d33',
				}).then(function(result) {
				  if (result.value) {
  
					  var ids = getCommaListFromArray($scope.selectedRecord, 'id')
  
					  Entity.deleteCustomers().query({id:ids}).$promise.then(function (response) {   
						Swal({
						  type: response.type,
						  title: response.title,
						  text: response.message,
						}).then(function(){
						  $scope.getCustomersList();
						})
					  });
					}
				  });
		  }
  
		  //   CUSTOMER DETAILS

          
        }]);


