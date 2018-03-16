/* eslint-disable */
var fs = require('fs-extra');
var glob = require('glob');
var path = require('path');
var gulp = require('gulp');
var ts = require('gulp-typescript')
var cp = require('child_process');
var cwd = process.cwd();
var merge = require('merge2');
var babel = require('gulp-babel');
var es = require('event-stream');
var babelCfg = JSON.parse(fs.readFileSync(path.resolve(cwd, '.babelrc'), 'utf8'));
var tsconfigForES2015 = JSON.parse(fs.readFileSync(path.join('tsconfig.json'), { encoding: 'utf-8' })).compilerOptions;
var tsconfigForIE = Object.assign({}, tsconfigForES2015, {target: 'es5', module: 'es2015'});

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

gulp.task('cpl', ['clear'], function() {
  var tscompilerForES2015 = ts.createProject(tsconfigForES2015);
  var tscompilerForIE = ts.createProject(tsconfigForIE);
  var globPaths = ['src/**/*.ts', 'src/**/*.tsx'];
  var tsResultForES2015 = gulp.src(globPaths)
    .pipe(tscompilerForES2015());
  var tsResultForIE = gulp.src(globPaths)
    .pipe(tscompilerForIE())
  return merge([
    tsResultForES2015.dts.pipe(gulp.dest('es')),
    tsResultForES2015.js.pipe(gulp.dest('es')),
    tsResultForIE.dts.pipe(gulp.dest('lib')),
    tsResultForIE.js.pipe(gulp.dest('lib'))
  ]);
});

gulp.task('babel', ['cpl'], function() {
  return gulp.src('lib/**/*.js*(x)').pipe(babel(babelCfg))
    .pipe(gulp.dest('lib'))
});

gulp.task('del-jsx', ['babel'], function() {
  return gulp.src(['lib/**/*.jsx'])
    .pipe(es.map(function(file, cb) {
      fs.remove(file.path, cb);
    }));
});

gulp.task('default', ['del-jsx']);