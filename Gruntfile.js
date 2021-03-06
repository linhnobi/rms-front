// Generated on 2015-03-18 using generator-angular-fullstack 2.0.13
'use strict';

module.exports = function (grunt) {
	var localConfig;
	try {
		localConfig = require('./server/config/local.env');
	} catch (e) {
		localConfig = {};
	}

	// Load grunt tasks automatically, when needed
	require('jit-grunt')(grunt, {
		express: 'grunt-express-server',
		useminPrepare: 'grunt-usemin',
		ngtemplates: 'grunt-angular-templates',
		cdnify: 'grunt-google-cdn',
		protractor: 'grunt-protractor-runner',
		injector: 'grunt-asset-injector',
		buildcontrol: 'grunt-build-control'
	});

	// Time how long tasks take. Can help when optimizing build times
	require('time-grunt')(grunt);

	// Define the configuration for all the tasks
	grunt.initConfig({
		// Project settings
		pkg: grunt.file.readJSON('package.json'),
		yeoman: {
			// configurable paths
			src: require('./bower.json').appPath || 'src',
			dist: 'dist'
		},
		express: {
			options: {
				port: process.env.PORT || 5555
			},
			dev: {
				options: {
					script: 'index.js',
					debug: true
				}
			},
			prod: {
				options: {
					script: 'dist/index.js'
				}
			}
		},
		open: {
			server: {
				url: 'http://localhost:<%= express.options.port %>'
			}
		},
		watch: {
			injectJS: {
				files: [
					'<%= yeoman.src %>/{app,components}/**/*.js',
					'!<%= yeoman.src %>/{app,components}/**/*.spec.js',
					'!<%= yeoman.src %>/{app,components}/**/*.mock.js',
					'!<%= yeoman.src %>/app/app.js'],
				tasks: ['injector:scripts']
			},
			injectCss: {
				files: [
					'<%= yeoman.src %>/{app,components}/**/*.css'
				],
				tasks: ['injector:css']
			},
			mochaTest: {
				files: ['server/**/*.spec.js'],
				tasks: ['env:test', 'mochaTest']
			},
			jsTest: {
				files: [
					'<%= yeoman.src %>/{app,components}/**/*.spec.js',
					'<%= yeoman.src %>/{app,components}/**/*.mock.js'
				],
				tasks: ['newer:jshint:all', 'karma']
			},
			injectLess: {
				files: [
					'<%= yeoman.src %>/{app,components}/**/*.less'],
				tasks: ['injector:less']
			},
			less: {
				files: [
					'<%= yeoman.src %>/{app,components}/**/*.less'],
				tasks: ['less', 'autoprefixer']
			},
			gruntfile: {
				files: ['Gruntfile.js']
			},
			livereload: {
				files: [
					'{.tmp,<%= yeoman.src %>}/{app,components}/**/*.css',
					'{.tmp,<%= yeoman.src %>}/{app,components}/**/*.html',
					'{.tmp,<%= yeoman.src %>}/{app,components}/**/*.js',
					'!{.tmp,<%= yeoman.src %>}{app,components}/**/*.spec.js',
					'!{.tmp,<%= yeoman.src %>}/{app,components}/**/*.mock.js',
					'<%= yeoman.src %>/assets/img/{,*//*}*.{png,jpg,jpeg,gif,webp,svg}'
				],
				options: {
					livereload: true
				}
			},
			express: {
				files: [
					'server/**/*.{js,json}'
				],
				tasks: ['express:dev', 'wait'],
				options: {
					livereload: true,
					nospawn: true //Without this option specified express won't be reloaded
				}
			}
		},
		// Make sure code styles are up to par and there are no obvious mistakes
		jshint: {
			options: {
				jshintrc: '<%= yeoman.src %>/.jshintrc',
				reporter: require('jshint-html-reporter'),
				reporterOutput: 'jshint-report.html'
			},
			server: {
				options: {
					jshintrc: 'server/.jshintrc'
				},
				src: [
					'server/**/*.js',
					'!server/**/*.spec.js'
				]
			},
			serverTest: {
				options: {
					jshintrc: 'server/.jshintrc-spec'
				},
				src: ['server/**/*.spec.js']
			},
			all: [
				'<%= yeoman.src %>/{app,components}/**/*.js',
				'!<%= yeoman.src %>/{app,components}/**/*.spec.js',
				'!<%= yeoman.src %>/{app,components}/**/*.mock.js'
			],
			test: {
				src: [
					'<%= yeoman.src %>/{app,components}/**/*.spec.js',
					'<%= yeoman.src %>/{app,components}/**/*.mock.js'
				]
			}
		},
		// Empties folders to start fresh
		clean: {
			dist: {
				files: [{
						dot: true,
						src: [
							'.tmp',
							'<%= yeoman.dist %>/*',
							'!<%= yeoman.dist %>/.git*',
							'!<%= yeoman.dist %>/.openshift',
							'!<%= yeoman.dist %>/Procfile'
						]
					}]
			},
			server: '.tmp'
		},
		// Add vendor prefixed styles
		autoprefixer: {
			options: {
				browsers: ['last 1 version']
			},
			dist: {
				files: [{
						expand: true,
						cwd: '.tmp/',
						src: '{,*/}*.css',
						dest: '.tmp/'
					}]
			}
		},
		// Debugging with node inspector
		'node-inspector': {
			custom: {
				options: {
					'web-host': 'localhost'
				}
			}
		},
		// Use nodemon to run server in debug mode with an initial breakpoint
		nodemon: {
			debug: {
				script: 'server/app.js',
				options: {
					nodeArgs: ['--debug-brk'],
					env: {
						PORT: process.env.PORT || 9000
					},
					callback: function (nodemon) {
						nodemon.on('log', function (event) {
							console.log(event.colour);
						});

						// opens browser on initial server start
						nodemon.on('config:update', function () {
							setTimeout(function () {
								require('open')('http://localhost:8080/debug?port=5858');
							}, 500);
						});
					}
				}
			}
		},
		// Automatically inject Bower components into the app
		wiredep: {
			target: {
				src: '<%= yeoman.src %>/index.html',
				ignorePath: '<%= yeoman.src %>/',
				exclude: [/bootstrap-sass-official/, '/json3/', '/es5-shim/']
								// /bootstrap.js/,  /bootstrap.css/,, /font-awesome.css/
			}
		},
		// Renames files for browser caching purposes
		rev: {
			dist: {
				files: {
					src: [
						'<%= yeoman.dist %>/src/{,*/}*.js',
						'<%= yeoman.dist %>/src/{,*/}*.css',
						'!<%= yeoman.dist %>/src/assets/img/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
						'!<%= yeoman.dist %>/src/assets/fonts/*'
					]
				}
			}
		},
		// Reads HTML for usemin blocks to enable smart builds that automatically
		// concat, minify and revision files. Creates configurations in memory so
		// additional tasks can operate on them
		useminPrepare: {
			html: ['<%= yeoman.src %>/index.html'],
			options: {
				dest: '<%= yeoman.dist %>/src'
			}
		},
		// Performs rewrites based on rev and the useminPrepare configuration
		usemin: {
			html: ['<%= yeoman.dist %>/src/{,*/}*.html'],
			css: ['<%= yeoman.dist %>/src/{,*/}*.css'],
			js: ['<%= yeoman.dist %>/src/{,*/}*.js'],
			options: {
				assetsDirs: [
					'<%= yeoman.dist %>/src',
					'<%= yeoman.dist %>/src/assets/img'
				],
				// This is so we update image references in our ng-templates
				patterns: {
					js: [
						[/(assets\/img\/.*?\.(?:gif|jpeg|jpg|png|webp|svg))/gm, 'Update the JS to reference our revved images']
					]
				}
			}
		},
		// The following *-min tasks produce minified files in the dist folder
		imagemin: {
			dist: {
				files: [{
						expand: true,
						cwd: '<%= yeoman.src %>/assets/img',
						src: '{,*/}*.{png,jpg,jpeg,gif}',
						dest: '<%= yeoman.dist %>/src/assets/img'
					}]
			}
		},
		svgmin: {
			dist: {
				files: [{
						expand: true,
						cwd: '<%= yeoman.src %>/assets/img',
						src: '{,*/}*.svg',
						dest: '<%= yeoman.dist %>/src/assets/img'
					}]
			}
		},
		// Allow the use of non-minsafe AngularJS files. Automatically makes it
		// minsafe compatible so Uglify does not destroy the ng references
		ngAnnotate: {
			dist: {
				files: [{
						expand: true,
						cwd: '.tmp/concat',
						src: '*/**.js',
						dest: '.tmp/concat'
					}]
			}
		},
		// Package all the html partials into a single javascript payload
		ngtemplates: {
			options: {
				// This should be the name of your apps angular module
				module: 'rmsSystem',
				htmlmin: {
					collapseBooleanAttributes: true,
					collapseWhitespace: true,
					removeAttributeQuotes: true,
					removeEmptyAttributes: true,
					removeRedundantAttributes: true,
					removeScriptTypeAttributes: true,
					removeStyleLinkTypeAttributes: true
				},
				usemin: 'app/app.js'
			},
			main: {
				cwd: '<%= yeoman.src %>',
				src: ['{app,components}/**/*.html'],
				dest: '.tmp/templates.js'
			},
			tmp: {
				cwd: '.tmp',
				src: ['{app,components}/**/*.html'],
				dest: '.tmp/tmp-templates.js'
			}
		},
		// Replace Google CDN references
		cdnify: {
			dist: {
				html: ['<%= yeoman.dist %>/src/*.html']
			}
		},
		// Copies remaining files to places other tasks can use
		copy: {
			dist: {
				files: [{
						expand: true,
						dot: true,
						cwd: '<%= yeoman.src %>',
						dest: '<%= yeoman.dist %>/src',
						src: [
							'*.{ico,png,txt}',
							'.htaccess',
							'!bower_components/**/*',
							'assets/img/{,*/}*.{webp}',
							'assets/fonts/**/*',
							'index.html'
						]
					}, {
						expand: true,
						cwd: '.tmp/img',
						dest: '<%= yeoman.dist %>/src/assets/img',
						src: ['generated/*']
					}, {
						expand: true,
						dest: '<%= yeoman.dist %>',
						src: [
							'package.json',
							'index.js',
							'bower.json',
							'.bowerrc'
						]
					}]
			},
			styles: {
				expand: true,
				cwd: '<%= yeoman.src %>',
				dest: '.tmp/',
				src: ['{app,components}/**/*.css']
			}
		},
		buildcontrol: {
			options: {
				dir: 'dist',
				commit: true,
				push: true,
				connectCommits: false,
				message: 'Built %sourceName% from commit %sourceCommit% on branch %sourceBranch%'
			},
			heroku: {
				options: {
					remote: 'heroku',
					branch: 'master'
				}
			},
			openshift: {
				options: {
					remote: 'openshift',
					branch: 'master'
				}
			}
		},
		// Run some tasks in parallel to speed up the build process
		concurrent: {
			server: [
				'less',
			],
			test: [
				'less',
			],
			debug: {
				tasks: [
					'nodemon',
					'node-inspector'
				],
				options: {
					logConcurrentOutput: true
				}
			},
			dist: [
				'less',
				'imagemin',
				'svgmin'
			]
		},
		// Test settings
		karma: {
			unit: {
				configFile: 'karma.conf.js',
				singleRun: true
			}
		},
		mochaTest: {
			options: {
				reporter: 'spec'
			},
			src: ['server/**/*.spec.js']
		},
		protractor: {
			options: {
				configFile: 'protractor.conf.js'
			},
			chrome: {
				options: {
					args: {
						browser: 'chrome'
					}
				}
			}
		},
		env: {
			test: {
				NODE_ENV: 'test'
			},
			prod: {
				NODE_ENV: 'production'
			},
			all: localConfig
		},
		// Compiles Less to CSS
		less: {
			options: {
				paths: [
					'<%= yeoman.src %>/bower_components',
					'<%= yeoman.src %>/app',
					'<%= yeoman.src %>/components'
				]
			},
			server: {
				files: {
					'.tmp/app/app.css': '<%= yeoman.src %>/app/app.less'
				}
			},
		},
		injector: {
			options: {
			},
			// Inject application script files into index.html (doesn't include bower)
			scripts: {
				options: {
					transform: function (filePath) {
						filePath = filePath.replace('/src/', '');
						filePath = filePath.replace('/.tmp/', '');
						return '<script src="' + filePath + '"></script>';
					},
					starttag: '<!-- injector:js -->',
					endtag: '<!-- endinjector -->'
				},
				files: {
					'<%= yeoman.src %>/index.html': [
						['{.tmp,<%= yeoman.src %>}/{app,components}/**/*.js',
							'!{.tmp,<%= yeoman.src %>}/app/app.js',
							'!{.tmp,<%= yeoman.src %>}/{app,components}/**/*.spec.js',
							'!{.tmp,<%= yeoman.src %>}/{app,components}/**/*.mock.js']
					]
				}
			},
			// Inject component less into app.less
			less: {
				options: {
					transform: function (filePath) {
						filePath = filePath.replace('/src/app/', '');
						filePath = filePath.replace('/src/components/', '');
						return '@import \'' + filePath + '\';';
					},
					starttag: '// injector',
					endtag: '// endinjector'
				},
				files: {
					'<%= yeoman.src %>/app/app.less': [
						'<%= yeoman.src %>/{app,components}/**/*.less',
						'!<%= yeoman.src %>/app/app.less'
					]
				}
			},
			// Inject component css into index.html
			css: {
				options: {
					transform: function (filePath) {
						filePath = filePath.replace('/src/', '');
						filePath = filePath.replace('/.tmp/', '');
						return '<link rel="stylesheet" href="' + filePath + '">';
					},
					starttag: '<!-- injector:css -->',
					endtag: '<!-- endinjector -->'
				},
				files: {
					'<%= yeoman.src %>/index.html': [
						'<%= yeoman.src %>/{app,components}/**/*.css'
					]
				}
			}
		},
	});

	// Used for delaying livereload until after server has restarted
	grunt.registerTask('wait', function () {
		grunt.log.ok('Waiting for server reload...');

		var done = this.async();

		setTimeout(function () {
			grunt.log.writeln('Done waiting!');
			done();
		}, 1500);
	});

	grunt.registerTask('express-keepalive', 'Keep grunt running', function () {
		this.async();
	});

	grunt.registerTask('serve', function (target) {
		if (target === 'dist') {
			return grunt.task.run(['build', 'env:all', 'env:prod', 'express:prod', 'wait', 'open', 'express-keepalive']);
		}

		if (target === 'debug') {
			return grunt.task.run([
				'clean:server',
				'env:all',
				'injector:less',
				'concurrent:server',
				'injector',
				'wiredep',
				'autoprefixer',
				'concurrent:debug'
			]);
		}

		grunt.task.run([
			'clean:server',
			'env:all',
			'injector:less',
			'concurrent:server',
			'injector',
			'wiredep',
			'autoprefixer',
			'express:dev',
			'wait',
			'open',
			'watch'
		]);
	});

	grunt.registerTask('server', function () {
		grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
		grunt.task.run(['serve']);
	});

	grunt.registerTask('test', function (target) {
		if (target === 'server') {
			return grunt.task.run([
				'env:all',
				'env:test',
				'mochaTest'
			]);
		}

		else if (target === 'client') {
			return grunt.task.run([
				'clean:server',
				'env:all',
				'injector:less',
				'concurrent:test',
				'injector',
				'autoprefixer',
				'karma'
			]);
		}

		else if (target === 'e2e') {
			return grunt.task.run([
				'clean:server',
				'env:all',
				'env:test',
				'injector:less',
				'concurrent:test',
				'injector',
				'wiredep',
				'autoprefixer',
				'express:dev',
				'protractor'
			]);
		}

		else
			grunt.task.run([
				'test:server',
				'test:client'
			]);
	});

	grunt.registerTask('build', [
		'clean:dist',
		'injector:less',
		'concurrent:dist',
		'injector',
		'wiredep',
		'useminPrepare',
		'autoprefixer',
		'ngtemplates',
		'concat',
		'ngAnnotate',
		'copy:dist',
		'cdnify',
		'cssmin',
		'uglify',
		'rev',
		'usemin'
	]);

	grunt.registerTask('default', [
		'newer:jshint',
		'test',
		'build'
	]);
};
