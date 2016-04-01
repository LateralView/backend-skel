
describe('service', function() {
	beforeEach(module("services"));
	beforeEach(module("settings"));

	// User
	it("check the existence of User factory", inject(function(User){
		expect(User).toBeDefined();
	}));

	// Auth
	it("check the existence of Auth factory", inject(function(Auth){
		expect(Auth).toBeDefined();
	}));

	// flash
	it("check the existence of flash factory", inject(function(flash){
		expect(flash).toBeDefined();
	}));
});
