import gulp from 'gulp';
import bg from 'gulp-bg';
import nodemon from 'gulp-nodemon';
import webpackBuild from './webpack/build';

gulp.task('set-dev', () => {
  process.env.NODE_ENV = 'dev';
});

gulp.task('hot-reload', bg('node', './webpack/server'));

gulp.task('node-reload', () => {
  nodemon({
    script: 'server',
    watch: ['server/']
  }).on('restart', () => {
    console.log('Server restarted!');
  });
});

gulp.task('build', webpackBuild);
gulp.task('default', ['set-dev', 'hot-reload', 'node-reload']);