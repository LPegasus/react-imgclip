/* eslint-disable */
var fs = require('fs-extra');
var exec = require('child_process').exec;
// var glob = require('glob');
var path = require('path');
var gulp = require('gulp');
// var ts = require('gulp-typescript')
// var cp = require('child_process');
var cwd = process.cwd();
// var merge = require('merge2');
// var babel = require('gulp-babel');
var es = require('event-stream');
// var babelCfg = JSON.parse(fs.readFileSync(path.resolve(cwd, '.babelrc'), 'utf8'));
// var tsconfigForES2015 = JSON.parse(fs.readFileSync(path.join('tsconfig.json'), { encoding: 'utf-8' })).compilerOptions;
// var tsconfigForIE = Object.assign({}, tsconfigForES2015, {target: 'es5', module: 'es2015'});

/*
function mrTSConfig(cfg) {
  return Object.assign({
    moduleResolution: "node",
    experimentalDecorators: true,
    emitDecoratorMetadata: true,
    allowSyntheticDefaultImports: true,
    jsx: "preserve",
    allowJs: false,
    declaration: true,
    removeComments: true
  }, cfg);
};
*/

gulp.task('clear', function(cb) {
  var t1 = fs.remove(path.resolve(cwd, 'es'));
  var t2 = fs.remove(path.resolve(cwd, 'lib'));
  Promise.all([t1, t2]).then(function() { cb(); }, function() { cb(); });
});

gulp.task('cpl', ['clear'], function(cb) {
  exec('npm run build', function(err) {
    cb(err);
  });
});

// gulp.task('babel', ['cpl'], function() {
//   return gulp.src('lib/**/*.js*(x)').pipe(babel(babelCfg))
//     .pipe(gulp.dest('lib'))
// });

gulp.task('del-jsx', ['cpl'], function() {
  return gulp.src(['lib/**/*.jsx'])
    .pipe(es.map(function(file, cb) {
      fs.remove(file.path, cb);
    }));
});

gulp.task('default', ['del-jsx']);
