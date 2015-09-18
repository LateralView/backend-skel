module.exports = function(grunt) {
  //filter npm module dependencies by name. With this you avoid using grunt.loadNpmTasks("grunt-task-name") for each dependency
  require("matchdep").filter("grunt-*").forEach(grunt.loadNpmTasks);
  grunt.loadNpmTasks('grunt-apidoc');

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
            env: 'local'
          }
        }
      },
      development: {
        constants: {
          config: {
            //place here constants for this environment
            env: 'development'
          }
        }
      },

      staging: {
        constants: {
          config: {
            //place here constants for this environment
            env: 'staging'
          }
        }
      },
      production: {
        constants: {
          config: {
            //place here constants for this environment
            env: 'production'
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

  grunt.registerTask('local', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'apidoc',
      'ngconstant:local',
      'auto_install'
    ]);
  });


  grunt.registerTask('development', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'apidoc',
      'ngconstant:development',
      // 'bower-install',
      // 'concurrent:server',
      // 'autoprefixer',
      // 'connect:livereload',
      // 'watch'
    ]);
  });

  grunt.registerTask('staging', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'apidoc',
      'ngconstant:staging'
    ]);
  });

  grunt.registerTask('production', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'apidoc',
      'ngconstant:production'
    ]);
  });
};
