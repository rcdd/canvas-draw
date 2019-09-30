'use strict';

module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-angular-templates');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-ng-annotate');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-serve');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        serve: {
            options: {
                port: 9000
            }
        },
        cssmin: { // css minifier
            main: { // default target
                files: {
                    // take css in temp, minify it, and save it into dist
                    'dist/css.min.css': ['css/main.css']
                }
            }
        },
        ngtemplates: {
            app: {
                options: {
                    prefix: '/'
                }
            }
        },
        concat: {
            dist: {
                src: ['src/lib/*', 'src/before/*', 'src/**/*.js'],
                dest: 'dist/<%= pkg.name %>-<%= pkg.version %>.js'
            }
        },
        uglify: { // minifies your js files
            main: { // default task
                // again, many other options available
                options: {
                    sourceMap: true, // we will generate a source map for uglified js
                    sourceMapName: 'dist/<%= pkg.name %>-<%= pkg.version %>.min.map', // into this dir
                    mangle: false
                },
                files: {
                    // files to uglify and destination
                    // we only have one file to uglify
                    'dist/<%= pkg.name %>-<%= pkg.version %>.min.js': ['dist/<%= pkg.name %>-<%= pkg.version %>.js']
                }
            }
        }
    });

    grunt.registerTask('build', ['cssmin', 'ngtemplates', 'concat', 'uglify']);

};
