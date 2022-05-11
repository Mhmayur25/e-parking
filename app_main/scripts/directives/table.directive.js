angular.module('MyApp').directive('lnTable', function() {
            var directive = {};
            directive.restrict = 'EA';
            directive.templateUrl = '../../templates/table.html';
            
            directive.scope = {
               tableData : "=name",
               checkTableData: "&",
               selectRow:"&selectRow",
            }
            directive.compile = function(element, attributes) {


               var linkFunction = function($scope, element, attributes) {

                $scope.filter = {};

                $scope._checkTableData = function()
                {
                    $scope.checkTableData($scope.tableData)
                }

                   $scope.startFrom = 0;
                   $scope.pageLimit = 5;
                  
                   var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
                   var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
                   return new bootstrap.Popover(popoverTriggerEl,{
                       html:true
                   })
                   })

  $scope.getTotagePages = function()
  {
    $scope.clonaeddata = angular.copy($scope.tableData.data);
    $scope.listLimit = 0;
    var totalPages = Number($scope.tableData.data.length) / parseInt($scope.pageLimit);
    $scope.jumpedPage = undefined;
    $scope.listLimit =  parseInt($scope.pageLimit) + parseInt($scope.startFrom);
    $scope.NumOfPages = Math.ceil(totalPages);
    $scope.selectedPage = Number($scope.startFrom) + 1;
  }
  if($scope.tableData)
  $scope.getTotagePages();

  $scope.previousPage = function()
  {
    $scope.jumpedPage = !$scope.jumpedPage;
    $scope.selectedPage = $scope.selectedPage - 1;
    $scope.startFrom =  (Number($scope.selectedPage) - 1) * parseInt($scope.pageLimit);
    $scope.listLimit =  parseInt($scope.pageLimit) + parseInt($scope.startFrom);
  }
  $scope.nextPage = function()
  {
    $scope.jumpedPage = !$scope.jumpedPage;
    $scope.selectedPage = $scope.selectedPage + 1;
    $scope.startFrom =  String((Number($scope.selectedPage) - 1) * parseInt($scope.pageLimit));
    $scope.listLimit =  parseInt($scope.pageLimit) + parseInt($scope.startFrom);
  }

  $scope.JumpedToPage = function(page)
  {
    if(page != undefined && page != null && !isNaN(page))
    {
      $scope.selectedPage = page;
      $scope.startFrom =  String((Number($scope.selectedPage) - 1) * parseInt($scope.pageLimit));
      $scope.listLimit =  parseInt($scope.pageLimit) + parseInt($scope.startFrom);
    }
    else
    {
      $scope.selectedPage = 1;
      $scope.startFrom =  String((Number($scope.selectedPage) - 1) * parseInt($scope.pageLimit));
      $scope.listLimit =  parseInt($scope.pageLimit) + parseInt($scope.startFrom);
    }
  }

$scope.jumpTuFirstPage = function()
  {
    $scope.jumpedPage = undefined;
    $scope.selectedPage = 1;
    $scope.startFrom =  (Number($scope.selectedPage) - 1) * parseInt($scope.pageLimit);
    $scope.listLimit =  parseInt($scope.pageLimit) + parseInt($scope.startFrom);
  }

  $scope.jumpToLastPage = function()
  {
    $scope.jumpedPage = undefined;
    $scope.selectedPage = $scope.NumOfPages;
    $scope.startFrom =  String((Number($scope.selectedPage) - 1) * parseInt($scope.pageLimit));
    $scope.listLimit =  parseInt($scope.pageLimit) + parseInt($scope.startFrom);
  }


  
  $scope.orderDesc = false;
  $scope.orderAsc = false;
  
   $scope.sortCounter = 0;
   $scope.clickedIndex;
  $scope.RecordOrderedBy=function(recordObj, index) 
  {
    $scope.clickedIndex = index;
      if($scope.sortCounter == 0)
      {
       
        $scope.orderAsc = true;
        $scope._tableData = $scope.tableData.data.sort((a,b) =>  (a[recordObj.field] > b[recordObj.field] ? 1 : -1));
        $scope.sortCounter = $scope.sortCounter +1
      }
      else if($scope.sortCounter == 1)
      {
       
        $scope.orderAsc = false;
        $scope.orderDesc = true;
        $scope._tableData = $scope.tableData.data.sort((a,b) =>  (a[recordObj.field] > b[recordObj.field] ? -1 : 1));
        $scope.sortCounter = $scope.sortCounter +1
      }
      else
      {
       
        $scope.orderAsc = false;
        $scope.orderDesc = false;
        $scope._tableData = $scope.clonaeddata;
        $scope.sortCounter = 0;
      }
  }



               }
               return linkFunction;
            }

          
            
            return directive;
         });