module.exports = function (grunt) {
    grunt.file.defaultEncoding = 'utf-8';

    var jsDumpTasks = {
        files: [{
            // src
            expand: true,
            cwd: 'src',
            src: '*.js',
            dest: 'dist'
        }, {
            // lib
            expand: true,
            cwd: 'lib',
            src: '*.js',
            dest: 'dist'
        }]
    };

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        // Delete generated files
        clean: {
            all: {
                src: [ 'dist/*.js', 'dist/*.css' ]
            }
        },

        // Compile less to css
        less: {
            compile: {
                files: {'dist/jquery.datetimepicker.css': 'src/jquery.datetimepicker.less'}
            },
        },

        // Compress javascript
        uglify: {
            product: jsDumpTasks
        }
    });

    // Loads specified plug-in tasks
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-cssmin');

    // Grunt runner
    grunt.registerTask('default', [
        'clean:all',
        'less:compile',
        'uglify:product'
    ]);
};
