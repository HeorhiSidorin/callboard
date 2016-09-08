'use strict'

var gulp = require('gulp')
var sass = require('gulp-sass')
var autoprefixer = require('gulp-autoprefixer')
var runSequence = require('run-sequence')
var browserSync = require('browser-sync').create()
var rename = require('gulp-rename')

var paths = {
  app: './app',
  src: './app/src',
  styles: './app/src/styles',
  images: './app/src/img',
  dist: './app/dist',
  node_modules: './node_modules'
}


gulp.task('fonts-files', function () {
  return gulp.src(paths.node_modules + '/font-awesome/fonts/*.*')
    .pipe(gulp.dest(paths.dist + '/fonts'));
})

gulp.task('fonts-styles', function () {
  return gulp.src(paths.node_modules + '/font-awesome/css/font-awesome.min.css')
    .pipe(gulp.dest(paths.dist + '/css'));
})

gulp.task('images', function () {
  return gulp.src(paths.images + '/**/*.*')
    .pipe(gulp.dest(paths.app + '/dist/img'))
})

gulp.task('bootstrap', function () {
  return gulp.src(paths.styles + '/bootstrap-import.scss')
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: [
        'Android 2.3',
        'Android >= 4',
        'Chrome >= 20',
        'Firefox >= 24',
        'Explorer >= 8',
        'iOS >= 6',
        'Opera >= 12',
        'Safari >= 6'
      ],
      cascade: false
    }))
    .pipe(rename('bootstrap.css'))
    .pipe(gulp.dest(paths.dist + '/css'))
    .pipe(browserSync.stream())
})

gulp.task('styles', function () {
  return gulp.src(paths.styles + '/main.scss')
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(gulp.dest(paths.dist + '/css'))
    .pipe(browserSync.stream())
})

gulp.task('default', ['bootstrap', 'styles', 'fonts-files', 'fonts-styles', 'images'])

gulp.task('dev', function () {
  runSequence('bootstrap', 'styles', 'fonts-files', 'fonts-styles', 'images', 'watch')
})

gulp.task('watch', function () {
  browserSync.init({
    server: './app'
  })
  gulp.watch([
    paths.styles + '/**/*.scss', 
    '!' + paths.styles + '/bootstrap-import.scss',
    '!' + paths.styles + '/_variables.scss'], ['styles'])
  gulp.watch([
    paths.styles + '/bootstrap-import.scss'], ['bootstrap'])
  gulp.watch(paths.styles + '/_variables.scss', ['styles', 'bootstrap'])
  gulp.watch(paths.app + '/*.html').on('change', browserSync.reload)
})
