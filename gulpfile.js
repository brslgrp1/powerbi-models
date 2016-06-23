var gulp = require('gulp-help')(require('gulp'));
var del = require('del'),
    rename = require('gulp-rename'),
    replace = require('gulp-replace'),
    uglify = require('gulp-uglify'),
    karma = require('karma'),
    webpack = require('webpack-stream'),
    webpackConfig = require('./webpack.config'),
    webpackTestConfig = require('./webpack.test.config'),
    runSequence = require('run-sequence'),
    argv = require('yargs').argv;
    ;

gulp.task('build', 'Build for release', function (done) {
    return runSequence(
        'clean:dist',
        'compile:ts',
        'min',
        'generatecustomdts',
        done
    );
});

gulp.task('test', 'Runs all tests', function (done) {
    return runSequence(
        'clean:tmp',
        'compile:spec',
        'test:js',
        done
    );
});

gulp.task('compile:ts', 'Compile source files', function() {
    return gulp.src(['typings/**/*.d.ts', './src/**/*.ts'])
        .pipe(webpack(webpackConfig))
        .pipe(gulp.dest('./dist'));
});

gulp.task('min', 'Minify build files', function () {
    return gulp.src(['./dist/models.js'])
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('clean:dist', 'Clean dist folder', function () {
    return del([
        './dist/**/*'
    ]);
});

gulp.task('clean:tmp', 'Clean tmp folder', function () {
    return del([
        './tmp/**/*'
    ]);
});

gulp.task('compile:spec', 'Compile spec tests', function () {
    return gulp.src(['./test/test.spec.ts'])
        .pipe(webpack(webpackTestConfig))
        .pipe(gulp.dest('./tmp'));
});

gulp.task('generatecustomdts', 'Generate dts with no exports', function (done) {
    return gulp.src(['./dist/*.d.ts'])
        .pipe(replace(/export\s/g, ''))
        .pipe(rename(function (path) {
            path.basename = "models-noexports.d";
        }))
        .pipe(gulp.dest('dist/'));
});

gulp.task('test:js', 'Run spec tests', function (done) {
    new karma.Server.start({
        configFile: __dirname + '/karma.conf.js',
        singleRun: argv.debug ? false : true,
        captureTimeout: argv.timeout || 60000
    }, done);
});