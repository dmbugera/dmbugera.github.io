var gulp = require('gulp'),
    sass = require('gulp-sass'),
    concat = require('gulp-concat'),
    rigger = require('gulp-rigger');

gulp.task('sass', function() {
    return gulp.src('src/sass/*.scss')  // only compile the entry file
        .pipe(sass.sync().on('error', sass.logError))
        .pipe(gulp.dest('app/css/'))
});

gulp.task('local:js', function () {
    gulp.src('src/js/main.js') //Найдем наш main файл
        .pipe(rigger()) //Прогоним через rigger
        .pipe(concat('local.js'))
        .pipe(gulp.dest('app/js')); //Выплюнем готовый файл в build
});

gulp.task('watch', function() {
    gulp.watch('src/sass/**/*.scss', ['sass']);  // Watch all the .less files, then run the less task
    gulp.watch('src/js/**/*.js', ['local:js']);  // Watch all the .js files, then run the less task
});

gulp.task('default', ['watch']);
