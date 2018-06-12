const gulp = require('gulp');
const minifycss = require('gulp-clean-css');
const rename = require ('gulp-rename');

gulp.task('minify-css', () => {
    gulp.src('content/styles/site.css')
        .pipe(minifycss())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('content/styles'));
});