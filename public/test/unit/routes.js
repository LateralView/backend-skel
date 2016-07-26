describe ('Routes test', function() {
	var location, route, rootScope;

	beforeEach(function(){
		// Mock app.routes module
		module('app.routes'); // same as angular.mock.module



		// Inject the services we'll using in the tests and save a reference
		inject(function(_$location_, _$route_, _$rootScope_, Auth) {
			location = _$location_;
			route = _$route_;
			rootScope = _$rootScope_;

			$rootScope.$on('$routeChangeStart', function (event, next, current) {
				if (next.$$route) {
					if (!Auth.isLoggedIn()) {
						if (next.$$route.authenticate) $location.path('/login');
					} else {
						if (!next.$$route.authenticate) $location.path(config.main_path);
					}
				}
			});
		});
	});

	describe('home route', function(){
		beforeEach(inject(
			function($httpBackend) {
				$httpBackend.expectGET('app/views/pages/home.html')
				.respond(200, 'main HTML');
			}
		));

		it("should load the home page on a successful load of /home", function(done){
			location.path("/home");
			rootScope.$digest(); // call the digest loop
			expect(route.current.loadedTemplateUrl).to.equal("app/views/pages/home.html");
			done();
		});

		it("should redirect to the home path on non-existent route", function(done){
			location.path("/invalid/route");
			rootScope.$digest(); // call the digest loop
			expect(route.current.loadedTemplateUrl).to.equal("app/views/pages/home.html");
			done();
		});
	});

	describe('user route', function(){

		describe('non logged user', function(){
			beforeEach(inject(
				function($httpBackend) {
					$httpBackend.expectGET('app/views/pages/login.html')
					.respond(200, 'login HTML');

					$httpBackend.expectGET('app/views/users/edit.html')
					.respond(200, 'edit HTML');
				}
			));

			it("should redirect to the login path on non-logged user", function(done){
				location.path("/user");
				rootScope.$digest();
				expect(route.current.loadedTemplateUrl).to.equal("app/views/pages/login.html");
				done();
			});

		});
	});
});