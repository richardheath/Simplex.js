var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

gulp.task('build', function() {
    // Unminified
    gulp.src(['simplex.js'])
        .pipe(concat('simplex.js'))
        .pipe(gulp.dest('dist/'));

    // Minified
    gulp.src(['simplex.js'])
        .pipe(concat('simplex.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist/'));

    // Bundled and minified
    gulp.src(['test/lib/jquery.min.js', 'test/lib/lodash.min.js', 'dist/simplex.min.js'])
        .pipe(concat('simplex.bundle.js'))
        .pipe(gulp.dest('dist/'));


});

gulp.task('default', ['build'], function() {});