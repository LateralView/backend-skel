module.exports = function(grunt) {
  //filter npm module dependencies by name. With this you avoid using grunt.loadNpmTasks("grunt-task-name") for each dependency
  require("matchdep").filter("grunt-*").forEach(grunt.loadNpmTasks);

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    auto_install: {
      local: {}
    },
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

  // grunt.loadNpmTasks('grunt-ng-constant');
  // grunt.loadNpmTasks('grunt-auto-install');
  // grunt.loadNpmTasks('grunt-apidoc');

  grunt.registerTask('local', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'ngconstant:local',
      'auto_install',
      'apidoc'
    ]);
  });


  grunt.registerTask('development', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'ngconstant:development',
      'auto_install',
      'apidoc'
    ]);
  });

  grunt.registerTask('staging', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'ngconstant:staging',
      'auto_install',
      'apidoc'
    ]);
  });

  grunt.registerTask('production', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'ngconstant:production',
      'auto_install',
      'apidoc'
    ]);
  });
};
