'use strict';

var gulp   = require('gulp');
var jshint = require('gulp-jshint');
var jscs = require('gulp-jscs');

var paths = {
  lint: ['./gulpfile.js', './lib/**/*.js', 'index.js'],
  tests: ['./test/**/*.js', '!test/{temp,temp/**}']
};

gulp.task('lint', function () {
  return gulp.src(paths.lint)
    .pipe(jshint('.jshintrc'))
    .pipe(jscs())
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('test', ['lint']);