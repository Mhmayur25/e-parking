const security = require('./config/auth');
const multer = require('multer');
var path = require('path');
const dir = './app/uploads';

var user = require('./controllers/user.Ctrl');

let storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, dir);
	},
	filename: (req, file, cb) => {
		cb(null, file.fieldname + '-' + Date.now() + '.' + path.extname(file.originalname));
	}
});

let upload = multer({
	storage: storage
});



module.exports = {

	configure: function (app) {
		app.post('/api/authUser', function (req, res) {
			user.AuthenticateUser(req, res);
		});

		app.post('/api/authUserAuto', function (req, res) {
			user.AuthenticateUserAuto(req, res);
		});

		app.post('/api/SetNewPassword', function (req, res) {
			security(req, res);user.SetNewPassword(req, res);
		});

		app.post('/api/ForgotPassword', function (req, res) {
			user.ForgotPassword(req, res);
		});

		app.get('/api/SignOut', function (req, res) {
			security(req, res);user.SignOut(req, res);
		});

		app.get('/api/verifyOTP/:otp', function (req, res) {
			user.verifyOTP(req, res);
		});

		app.get('/api/getSession', function (req, res) {
			security(req, res);
			user.getSession(req, res);
		});


		app.post('/api/VerifyCompanyMobile', function (req, res) {
			security(req, res);
			user.VerifyCompanyMobile(req, res);
		});

		app.post('/api/VerifyCompanyLandline', function (req, res) {
			security(req, res);
			user.VerifyCompanyLandline(req, res);
		});


		app.post('/api/VerifyCompanyEmail', function (req, res) {
			security(req, res);
			user.VerifyCompanyEmail(req, res);
		});

		app.post('/api/SaveCompanyDetails', upload.single('file'), function (req, res) {
			security(req, res);
			user.SaveCompanyDetails(req, res);
		});
		
		app.get('/api/getCompanyList', function (req, res) {
			security(req, res);
			user.getCompanyList(req, res);
		});

		app.get('/api/deleteCompanyDetails/:companyid', function (req, res) {
			security(req, res);
			user.deleteCompanyDetails(req, res);
		});


		// COMPANY LOCATIONS

		app.post('/api/saveCompanyLocations', function (req, res) {
			security(req, res);
			user.saveCompanyLocations(req, res);
		});

		app.get('/api/getCompanyLocationsList', function (req, res) {
			security(req, res);
			user.getCompanyLocationsList(req, res);
		});

		app.get('/api/getCompanyLocations', function (req, res) {
			security(req, res);
			user.getCompanyLocations(req, res);
		});

		app.get('/api/deleteCompanyLocations/:companyid', function (req, res) {
			security(req, res);
			user.deleteCompanyLocations(req, res);
		});

		// COMPANY LOCATIONS
		
		// USER DETAILS

		app.post('/api/saveUserDetails', function (req, res) {
			security(req, res);
			user.saveUserDetails(req, res);
		});

		app.get('/api/getUsersList', function (req, res) {
			security(req, res);
			user.getUsersList(req, res);
		});
		app.get('/api/deleteUsers/:userid', function (req, res) {
			security(req, res);
			user.deleteUsers(req, res);
		});


		app.get('/api/getLocationParkingCapacity/', function (req, res) {
			security(req, res);
			user.getLocationParkingCapacity(req, res);
		});

		app.get('/api/getExistingVehicalsNumber/', function (req, res) {
			security(req, res);
			user.getExistingVehicalsNumber(req, res);
		});
		app.get('/api/getCustomerData/:id', function (req, res) {
			security(req, res);
			user.getCustomerData(req, res);
		});
		app.post('/api/saveParkingAllocationDetails', function (req, res) {
			security(req, res);
			user.saveParkingAllocationDetails(req, res);
		});
		
		app.post('/api/getAquiredParking', function (req, res) {
			security(req, res);
			user.getAquiredParking(req, res);
		});

		// CUSTOMER DETAILS

		app.post('/api/saveCustomerDetails', function (req, res) {
			security(req, res);
			user.saveCustomerDetails(req, res);
		});
		app.get('/api/getCustomersList', function (req, res) {
			security(req, res)
			user.getCustomersList(req, res);
		});
		app.get('/api/deleteCustomers/:ids', function (req, res) {
			security(req, res);
			user.deleteCustomers(req, res);
		});


	}
};