module.exports = function(grunt) {
    var
    	// Imports
      	rename = require( './rename.js' ),
      	fs = require( 'fs' ),
      
      	// Globals
      	jQueryPattern = /(?:jQuery|\$|find)\s*\(\s*(["'])((?:\\.|(?!\1).)*)\1\s*\)/g,
      	fnPattern = /(jQuery|\$|find|__)\s*\(\s*(["'])((?:\\.|(?!\2).)*)\2\s*\)/g;
    
    // Project configuration.
    grunt.initConfig({
    	rename_css: {
    		options: {
    			compress: true
    		},
    		bootstrap: {
    			src:  [ 'node_modules/bootstrap/dist/css/bootstrap.css' ],
    			dest: 'node_modules/bootstrap/dist/css/bootstrap.sm.cls.css',
    			map:  'map.json'
    		},
    		main: {
    			src:  'assets/css/style.css',
    			dest: 'assets/css/style.min.css',
    			map:  'map.json'
    		}
    	},
    	
    	rename_js: {
    		main: {
    			src:  'assets/js/main.js',
    			dest: 'assets/js/main.min.js',
    			map:  'map.json'
    		}
    	},
    	
    	uglify: {
    		main: {
    			files: {
    				'assets/js/main.min.js': [ 'assets/js/main.min.js' ]
    			},
    			options: {
    				dead_code: true
    			}
    		}
    	}
    });
    
    grunt.loadNpmTasks('grunt-contrib-uglify');
    
	// Register the rename_css task.
	grunt.registerMultiTask('rename_css', 'Shorten css class names', function () {
		var options = this.options(); // Pass all options directly to css.parse
		this.files.forEach(function ( file ) {
			var renamed = rename.rename(
				fs.readFileSync( file.src[ 0 ], 'utf8' ), options );
			fs.writeFileSync( file.dest, renamed.text );
			fs.writeFileSync( file.map, JSON.stringify( renamed.map, null, 2 ) );
		});
	});
	// Register the rename_js task.
	grunt.registerMultiTask('rename_js', 'Use short css class names.', function () {
		this.files.forEach(function ( file ) {
			var 
				content = fs.readFileSync( file.src[ 0 ], 'utf8' ),
				map = JSON.parse( fs.readFileSync( file.map ) ),
				
			output = content.replace( fnPattern, function ( match, fn, delimiter, str ) {
				var classes, i;
				if ( fn == '__' ) {
					classes = str.split( ' ' );
					i = classes.length;
					
					while ( i-- ) {
						classes[ i ] = rename.getClassName( classes[i], map );
					}
					
					return '"' + classes.join( ' ' ) + '"';
				} else { // Must be a jQuery function.
					return match.replace( str, rename.getClassSelector( str, map ) );
				}
			});
			
			fs.writeFileSync( file.dest, '!(function(window, undefined) {' + output + '})(window);' );
		});
	});
	// Default task(s).
	grunt.registerTask('default', ['rename_css:bootstrap', 'rename_js:main', 'uglify']);
};
