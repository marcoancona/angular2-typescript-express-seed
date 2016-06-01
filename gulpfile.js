var gulp = require('gulp');
var path = require('path');
var sourcemaps = require('gulp-sourcemaps');
var ts = require('gulp-typescript');
var del = require('del');
var concat = require('gulp-concat');
var runSequence = require('run-sequence');
var stylus = require('gulp-stylus');
var tslint = require('gulp-tslint');
var gutil = require('gulp-util');
var nodemon = require('gulp-nodemon');
var notifier = require('node-notifier');
var bower = require('gulp-bower');
var jade = require('gulp-jade');


var tsLintConfigured = function() {
	return tslint({
		configuration: {
			rules: {
				/* List all rules here */
				'ban': true,
				'class-name': true,
				'curly': true,
				'eofline': true,
				'forin': true,
				'indent': true,
				'interface-name': true,
				'label-position': true,
				'label-undefined': true,
				'no-construct': true,
				'no-duplicate-key': true,
				'no-duplicate-variable': true,
				'no-eval': true,
				'no-switch-case-fall-through': true,
				'trailing-comma': true,
				'no-trailing-whitespace': true,
				'no-unreachable': true,
				'no-unused-expression': true,
				'no-use-before-declare': true,
				'one-line': [true,
					'check-open-brace',
					'check-whitespace'
				],
				'semicolon': true,
				'triple-equals': true,
				'use-strict': true,
				'whitespace': [true,
					'check-branch',
					'check-decl',
					'check-operator'
				]
			}
		}
	});
};

function tslintReporter(output, file, options) {
	gutil.log(gutil.colors.cyan('tslint'),file.path);
	var path = file.path;
	output.forEach(function(m) {
		/* vim: set errorfomat=tslint\ %f:%l:%c:%m
		 * do not modify */
		console.log(
			gutil.colors.yellow("tslint "+path+":"+(m.startPosition.line+1)+":"+(m.startPosition.character+1)+":")+
			gutil.colors.red(m.failure),
			gutil.colors.magenta(" ("+m.ruleName+")")
		);
		notifier.notify({
			title: 'tslint '+path+':'+(m.startPosition.line+1),
			message: m.failure
		});
	});
}

gulp.task('tslint:client', function () {
	return gulp.src('client/app/**/*.ts')
		.pipe(tsLintConfigured()).pipe(tslint.report(tslintReporter, {emitError: false}));
});

gulp.task('tslint:server', function () {
	return gulp.src('server/src/**/*.ts')
		.pipe(tsLintConfigured()).pipe(tslint.report(tslintReporter, {emitError: false}));
});


// SERVER
gulp.task('compile:server', ['tslint:client'], function () {
	var tsProject = ts.createProject('server/tsconfig.json');
	var tsResult = gulp.src('server/**/*.ts')
		.pipe(sourcemaps.init())
		.pipe(ts(tsProject));

	tsResult.js
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('dist/server'));
});


// CLIENT
/*
  jsNPMDependencies, sometimes order matters here! so becareful!
*/
var jsNPMDependencies = [
	'angular2/bundles/angular2-polyfills.js',
	'systemjs/dist/system.src.js',
	'rxjs/bundles/Rx.js',
	'angular2/bundles/angular2.dev.js',
	'angular2/bundles/router.dev.js'
];

gulp.task('compile:client', ['tslint:client'], function(){
	// Dependencies
	var mappedPaths = jsNPMDependencies.map(function (file) {
		return path.resolve('node_modules', file);
	});
	var copyJsNPMDependencies = gulp.src(mappedPaths, {base:'node_modules'})
		.pipe(gulp.dest('dist/public/libs'));

	// Source files
	var tsProject = ts.createProject('client/tsconfig.json');
	var tsResult = gulp.src('client/**/*.ts')
		.pipe(sourcemaps.init())
		.pipe(ts(tsProject));
	return tsResult.js
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('dist/public'));
});

gulp.task('compile:views', function(){
	gulp.src([
		'client/**/*.jade',
	])
	.pipe(jade({
	}))
	.pipe(gulp.dest('dist/public/'));
});

gulp.task('compile:stylus', function(finished) {
	var exit = finished;
	/// Note: Correct async running
	gulp.src([
		'client/style/main.styl',
		'client/app/**/*.styl'
		])
	.pipe(concat('all.styl'))
	.pipe(stylus())
	.on('error', function(err) {
		notifier.notify({
			title: 'Stylus compile error',
			message: err.message
		});
		/// Stylus breaks on error in parts and the pipeline does
		/// not continue. So, finish/exit here
		exit(err);
		exit = function() {}; /// make sure to call only once, just to be future-proof and double-safe
	})
	.pipe(gulp.dest('dist/public/style/'))
	.on('end', function() {
		exit();
	});
});

gulp.task('develop', ['server:start'], function(){
	gulp.watch('server/src/**/*.ts', ['compile:server']);
	gulp.watch('client/app/**/*.ts', ['compile:client']);
	gulp.watch('client/**/*.jade', ['compile:views']);
	gulp.watch('client/**/*.styl', ['compile:stylus']);
});

gulp.task('bower:install', function() {
	return bower().pipe(gulp.dest('dist/public/libs'));
});

gulp.task('compile', function(callback) {
	runSequence('clean', 'compile:server', 'compile:client', 'compile:views', 'compile:stylus', 'bower:install', callback);
});


gulp.task('server:start', function() {
	nodemon({
		script: 'dist/server/src/server.js',
		watch: 'dist/libs',
		env: { 'NODE_ENV': 'development' }
	});
});

gulp.task('clean', function(){
	return del('dist');
});

gulp.task('default', ['compile']);
