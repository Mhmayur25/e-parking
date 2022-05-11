angular.module('MyApp')
  .factory('Entity', ['$resource', 'Upload', function ($resource, Upload) {
    var endurl= 'http://localhost:8802';
    return{

        VerifyCompanyEmail: function () {
          return $resource(endurl+'/api/VerifyCompanyEmail',
              {}, { 'save': { method: 'POST',isArray:false } });
      },
      VerifyCompanyMobile: function () {
          return $resource(endurl+'/api/VerifyCompanyMobile',
              {}, { 'save': { method: 'POST',isArray:false } });
      },
      VerifyCompanyLandline: function () {
          return $resource(endurl+'/api/VerifyCompanyLandline',
              {}, { 'save': { method: 'POST',isArray:false } });
      },

      getSession: function () {
          return $resource(endurl+'/api/getSession',
              {}, { 'query': { method: 'GET',isArray:false } });
      },

      getProductList: function () {
          return $resource(endurl+'/api/getProductList',
              {}, { 'query': { method: 'GET',isArray:false } });
      },

      productTypes: function () {
          return $resource(endurl+'/api/productTypes',
              {}, { 'query': { method: 'GET',isArray:true } });
      },

      productUnits: function () {
          return $resource(endurl+'/api/productUnits',
              {}, { 'query': { method: 'GET',isArray:true } });
      },

      deleteProductDetails: function () {
          return $resource(endurl+'/api/deleteProductDetails/:id',
              {}, { 'query': { method: 'GET',isArray:false } });
      },

      getCompanyList: function () {
          return $resource(endurl+'/api/getCompanyList/',
              {}, { 'query': { method: 'GET',isArray:false } });
      },
    
      deleteCompanyDetails: function () {
          return $resource(endurl+'/api/deleteCompanyDetails/:companyid',
              {}, { 'query': { method: 'GET',isArray:false } });
      },

      getCompanyDetails: function () {
          return $resource(endurl+'/api/getCompanyDetails/',
              {}, { 'query': { method: 'GET',isArray:false } });
      },

      getUserProfileData: function () {
          return $resource(endurl+'/api/getUserProfileData/',
              {}, { 'query': { method: 'GET',isArray:false } });
      },
      VerifyUserEmail: function()
        {
            return $resource(endurl+'/api/VerifyUserEmail',
                {}, { 'save': { method: 'POST',isArray:false } });
        },

        VerifyUserMobile: function()
        {
            return $resource(endurl+'/api/VerifyUserMobile',
                {}, { 'save': { method: 'POST',isArray:false } });
        },
      SaveUserDetails: function()
      {
          return $resource(endurl+'/api/SaveUserDetails',
              {}, { 'save': { method: 'POST',isArray:false } });
      },

    //   COMAPNY LOCATION

    saveCompanyLocations: function () {
        return $resource(endurl+'/api/saveCompanyLocations',
            {}, { 'save': { method: 'POST',isArray:false } });
    },
    getCompanyLocationsList: function () {
      return $resource(endurl+'/api/getCompanyLocationsList/',
          {}, { 'query': { method: 'GET',isArray:false } });
  },
  deleteCompanyLocations: function () {
      return $resource(endurl+'/api/deleteCompanyLocations/:companyid',
          {}, { 'query': { method: 'GET',isArray:false } });
  },

    //   COMAPNY LOCATION

    //   USER DETAILS

    saveUserDetails: function () {
        return $resource(endurl+'/api/saveUserDetails',
            {}, { 'save': { method: 'POST',isArray:false } });
    },
    getCompanyLocations: function () {
      return $resource(endurl+'/api/getCompanyLocations/',
          {}, { 'query': { method: 'GET',isArray:false } });
  },
    getUsersList: function () {
      return $resource(endurl+'/api/getUsersList/',
          {}, { 'query': { method: 'GET',isArray:false } });
  },
  deleteUsers: function () {
      return $resource(endurl+'/api/deleteUsers/:userid',
          {}, { 'query': { method: 'GET',isArray:false } });
  },

//   USER DETAILS

  getLocationParkingCapacity: function () {
      return $resource(endurl+'/api/getLocationParkingCapacity/',
          {}, { 'query': { method: 'GET',isArray:false } });
  },

  getExistingVehicalsNumber: function () {
      return $resource(endurl+'/api/getExistingVehicalsNumber/',
          {}, { 'query': { method: 'GET',isArray:false } });
  },
  getCustomerData: function () {
      return $resource(endurl+'/api/getCustomerData/:id',
          {}, { 'query': { method: 'GET',isArray:false } });
  },

  saveParkingAllocationDetails: function () {
    return $resource(endurl+'/api/saveParkingAllocationDetails',
        {}, { 'save': { method: 'POST',isArray:false } });
    },
  getAquiredParking: function () {
    return $resource(endurl+'/api/getAquiredParking',
        {}, { 'save': { method: 'POST',isArray:false } });
    },

     



     //   CUSTOMER DETAILS

    saveCustomerDetails: function () {
        return $resource(endurl+'/api/saveCustomerDetails',
            {}, { 'save': { method: 'POST',isArray:false } });
    },
   
    getCustomersList: function () {
      return $resource(endurl+'/api/getCustomersList/',
          {}, { 'query': { method: 'GET',isArray:false } });
  },
  deleteCustomers: function () {
      return $resource(endurl+'/api/deleteCustomers/:ids',
          {}, { 'query': { method: 'GET',isArray:false } });
  },


    }
  }]);