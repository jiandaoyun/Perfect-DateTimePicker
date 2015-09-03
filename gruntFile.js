module.exports = function (grunt) {
    grunt.file.defaultEncoding = 'utf-8';

    var jsDumpTasks = {
        files: [{
            // web
            expand: true,
            cwd: 'src',
            src: '*.js',
            dest: 'dist'
        }]
    };

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        //删除文件
        clean: {
            //清理原有js
            all: {
                src: [ 'dist/*.js']
            }
        },

        // 压缩js
        uglify: {
            product: jsDumpTasks
        }
    });

    // 加载指定插件任务
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');

    //任务
    grunt.registerTask('product', [
        'clean:all',
        'uglify:product'
    ]);
};
