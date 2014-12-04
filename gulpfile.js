var gulp = require('gulp');
var concat = require('gulp-concat');

gulp.task('build', function() {
    gulp.src(['src/lib/jquery.min.js', 'src/lib/lodash.min.js', 'src/simplex.js'])
        .pipe(concat('simplex.bundle.js'))
        .pipe(gulp.dest('dist/'));

    gulp.src(['src/simplex.js'])
        .pipe(concat('simplex.js'))
        // TODO: Uglify
        .pipe(gulp.dest('dist/'));
});

gulp.task('default', ['build-script'], function() {});