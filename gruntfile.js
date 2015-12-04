module.exports = function(grunt) {
  //filter npm module dependencies by name. With this you avoid using grunt.loadNpmTasks("grunt-task-name") for each dependency
  require("matchdep").filter("grunt-*").forEach(grunt.loadNpmTasks);

  // Project configuration.
  grunt.initConfig({
    ngconstant: {
      // Options for all targets
      options: {
       // wrap: '"use strict";\n\n {%= __ngModule %}',
        name: 'settings',
        dest: 'public/app/app.config.js',
        constants: {
          config: {
            main_path: "/home"
          }
        }

      },
      // Environment targets
      local: {
        constants: {
          config: {
            //place here constants for this environment
            env: 'local',
            api_url: '/api'
          }
        }
      },
      development: {
        constants: {
          config: {
            //place here constants for this environment
            env: 'development',
            api_url: '/api'
          }
        }
      },

      staging: {
        constants: {
          config: {
            //place here constants for this environment
            env: 'staging',
            api_url: '/api'
          }
        }
      },
      production: {
        constants: {
          config: {
            //place here constants for this environment
            env: 'production',
            api_url: '/api'
          }
        }
      }
    },
    apidoc: {
      myapp: {
        src: "app/",
        dest: "apidoc/"
      }
    }
  });


  grunt.registerTask('createConfig', function (target) {
    var environment = process.env.NODE_ENV || "local";
    grunt.task.run([
      'ngconstant:' + environment,
      'apidoc'
    ]);
  });
};
