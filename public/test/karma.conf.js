module.exports = function(config){
  config.set({

    basePath : '../',

    files : [
      'bower_components/angular/angular.js',
			'bower_components/angular-mocks/angular-mocks.js',
			'app/app.js',
			'app/*.js',
			'app/**/*.js',
			'app/services/*.js',
			'app/directives/*.js',
			'app/controllers/*.js',
      'test/unit/*.js'
    ],

    autoWatch : true,

    frameworks: ['jasmine'],

    browsers : ['Chrome'],

    plugins : [
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-jasmine'
            ],

    junitReporter : {
      outputFile: 'test_out/unit.xml',
      suite: 'unit'
    }

  });
};
