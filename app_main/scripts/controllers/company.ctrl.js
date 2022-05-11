angular.module('MyApp')
	.controller('companyController', ['$scope', '$rootScope', '$http', '$route', '$location', '$window', '$timeout', '$uibModal', 'Upload', 'Entity', function ($scope, $rootScope, $http, $route, $location, $window, $timeout, $uibModal, Upload, Entity) {
        
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
			}
		
			if (strList != undefined) {
				strList = strList.substring(0, strList.length - 2);
			  	return strList;
			} else return "";
		  }


		// COMPANY DETAILS	

		$scope.VerifyCompanyContacts = function()
		{
			if($scope.CompanyDetails[0].email && $scope.CompanyDetails[0].email != '' && $scope.CompanyDetails[0].email != null)
            {
                Entity.VerifyCompanyEmail().save($scope.CompanyDetails[0]).$promise.then(function(response){
                    if(response.result.length > 0 && response.result[0].emailexist > 0)
                    {
                        $scope.emailexist = "Email ID already exist in record";
                    }
                    else
                    {
                        $scope.emailexist = undefined;  
                    }
                });
            }

            if(($scope.CompanyDetails[0].mobile && $scope.CompanyDetails[0].mobile != '' && $scope.CompanyDetails[0].mobile != 0 && $scope.CompanyDetails[0].mobile != null) || ($scope.CompanyDetails[0].altmobile && $scope.CompanyDetails[0].altmobile != '' && $scope.CompanyDetails[0].altmobile != 0 && $scope.CompanyDetails[0].altmobile != null) )
            {
                Entity.VerifyCompanyMobile().save($scope.CompanyDetails[0]).$promise.then(function(response){
                    if(response.result.length > 0 && response.result[0].mobileexist > 0)
                    {
                        $scope.mobileexist = "Mobile already exist in record";
                    }
                    else
                    {
                        $scope.mobileexist = undefined;
                    }
                });
            }	

            if(($scope.CompanyDetails[0].landline && $scope.CompanyDetails[0].landline != '' && $scope.CompanyDetails[0].landline != 0 && $scope.CompanyDetails[0].landline != null) || ($scope.CompanyDetails[0].altlandline && $scope.CompanyDetails[0].altlandline != '' && $scope.CompanyDetails[0].altlandline != 0 && $scope.CompanyDetails[0].altlandline != null) )
            {
                Entity.VerifyCompanyLandline().save($scope.CompanyDetails[0]).$promise.then(function(response){
                    if(response.result.length > 0 && response.result[0].landlineexist > 0)
                    {
                        $scope.landlineexist = "Landline Number already exist in record";
                    }
                    else
                    {
                        $scope.landlineexist = undefined;
                    }
                });
            }	
		}

		$scope.CompanyDetails = [];
		$scope.SaveCompanyDetails = function()
		{
		
				var passeddata = {
					CompanyDetails: $scope.CompanyDetails[0]
				}
			  
			  Upload.upload({
				url: endurl+'/api/SaveCompanyDetails',
				data: passeddata
			  }).then(function (resp) {
				Swal({
				  type: resp.data.type,
				  title: resp.data.title,
				  text: resp.data.message,
				}).then(function()  {
				  location.reload();
				})
			  }, function (resp) {
				Swal({
				  type: resp.data.type,
				  title: resp.data.title,
				  text: resp.data.message,
				}).then(function()  {
				  location.reload();
				})
			  }, function (evt) {
				var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
				// console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
			  });
		}
	
		$scope.getCompanyList = function()
		{
			Entity.getCompanyList().query().$promise.then(function(response){
				if(!response.status)
					$scope.CompanysList = response.companyList;
					var headers = [
						{title:'Name', field:'name'},
						{title:'Owner', field:'owner'},
						{title:'Mobile', field:'mobile'},
						{title:'Alt. Mobile', field:'altmobile'},
						{title:'Email', field:'email'},
					]

					InitTableStructure(headers, $scope.CompanysList)
			});
		}

		$scope.deleteCompanyDetails = function(status, companyid)
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
                    Entity.deleteCompanyDetails().query({companyid:companyid}).$promise.then(function (response) {   
                      Swal({
                        type: response.type,
                        title: response.title,
                        text: response.message,
                      }).then(function(){
                        $scope.getCompanyList();
                      })
                    });
                  }
                });
		}
		

		$scope.btnlbl = 'Approval'
		$scope.SetCompanyApproval = function()
		{
			if($scope.CompanyDetails && $scope.CompanyDetails.length > 0)
			{
				if($scope.CompanyDetails[0].status != undefined && $scope.CompanyDetails[0].status == 0)
				{
					$scope.CompanyDetails[0].status = 1;
					$scope.btnlbl = "Disable";
				}
				else
				{
					$scope.CompanyDetails[0].status = 0;
					$scope.btnlbl = "Aprrove"
				}
			}
		}

		$scope.getCompanyDetails = function(companyDetails)
		{
			$scope.CompanyDetails = [];

			$scope.CompanyDetails.push(companyDetails);
			if($scope.CompanyDetails[0].status != undefined && $scope.CompanyDetails[0].status == 0)
				{
					$scope.btnlbl = "Aprrove"
					
				}
				else
				{
					$scope.btnlbl = "Disable";
				}
		}

            $scope.getCompanyProfile = function()
            {
                Entity.getCompanyDetails().query().$promise.then(function(response){
                    if(!response.status)
                        $scope.CompanyDetails = response.companyDetails;
                });
            }

            $scope.setImagePreview = function(imgdata)
		{
			var reader = new FileReader();
			reader.onload = function(event) {
				$("#logoimg").attr("src",event.target.result);
			}
			reader.readAsDataURL(imgdata.files[0]);
		}

		$scope.SaveCompanyProfile = function()
		{
			if ($scope.logoimg) {
				var passeddata = {
				  file: $scope.logoimg,
				  CompanyDetails: $scope.CompanyDetails[0]
				}
			  } else {
				var passeddata = {
					CompanyDetails: $scope.CompanyDetails[0]
				}
			  }
			  Upload.upload({
				url: endurl+'/api/SaveCompanyDetails',
				data: passeddata
			  }).then(function (resp) {
				Swal({
				  type: resp.data.type,
				  title: resp.data.title,
				  text: resp.data.message,
				}).then(function()  {
				  location.reload();
				})
			  }, function (resp) {
				Swal({
				  type: resp.data.type,
				  title: resp.data.title,
				  text: resp.data.message,
				}).then(function()  {
				  location.reload();
				})
			  }, function (evt) {
				var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
				// console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
			  });
		}

		// COMPANY LOCATIONS

		$scope.CompanyLocationDetails = {};
		$scope.ParkingCapacity = [];

		$scope.addEntryInCapacity = function()
		{
			if($scope.ParkingCapacity)	
			{
				$scope.ParkingCapacity.push({});
			}
		}

		$scope.removeEntryInCapacity = function(index)
		{
			if($scope.ParkingCapacity)	
			{
				$scope.ParkingCapacity.splice(index, 1);
			}
		}
		
		$scope.getCompanyLocationDetails = function(data)
		{
				$scope.CompanyLocationDetails = data;
				$scope.ParkingCapacity = JSON.parse($scope.CompanyLocationDetails.parking_capacity)
		}

		$scope.saveCompanyLocations = function()
		{
			$scope.CompanyLocationDetails.parking_capacity = JSON.stringify($scope.ParkingCapacity);

			Entity.saveCompanyLocations().save($scope.CompanyLocationDetails).$promise.then(function(response){
				Swal({
					type: response.type,
					title: response.title,
					text: response.message,
				  }).then(function()  {
					location.reload();
				  })
			});
		}
		$scope.getCompanyLocationsList = function()
		{
			Entity.getCompanyLocationsList().query().$promise.then(function(response){
				if(!response.status)
					$scope.companyLocationList = response.companyLocationList;
					var headers = [
						{title:'Company Name', field:'company_name'},
						{title:'Location', field:'location_name'},
						{title:'Landline No.', field:'landlines'},
						{title:'Mobile No.', field:'mobiles'},
					]

					InitTableStructure(headers, $scope.companyLocationList)
			});
		}


		$scope.deleteLocations = function()
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

					var companyid = getCommaListFromArray($scope.selectedRecord, 'id')

                    Entity.deleteCompanyLocations().query({companyid:companyid}).$promise.then(function (response) {   
                      Swal({
                        type: response.type,
                        title: response.title,
                        text: response.message,
                      }).then(function(){
                        $scope.getCompanyLocationsList();
                      })
                    });
                  }
                });
		}



		// COMPANY LOCATIONS



        }]);