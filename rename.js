module.exports = (function() {
	var 
		css = require( 'css' ), // Load css module
		classTest = /\.([\w-]+)/g,
		// All avaliable characters used in the short classes.
		chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

	function getClassParts ( selector ) {
		/**
		 * Find all the class segments within a givin selector.
		 */
		var classParts = [],
			match;
		
		while ( ( match = classTest.exec( selector ) ) != null ) {
			match[ 0 ].slice( 1 ).split( '-' ).forEach(function ( part ) {
				classParts.push( part );
			});
			selector = selector.slice( match.index + match[ 0 ].length );
		}
		return classParts;
	}
	
	function getClassSelector ( selector, map ) {
		/**
		 * Given a map and css selector return a new selector with renamed classes.
		 */
		return selector.replace( classTest, function ( match, group ) {					
			return '.' + getClassName( group, map );
		});
	}
	
	function getClassName ( cls, map ) {
		/**
		 * Return the new class named based on the given map.
		 */
		var parts = cls.split( '-' ), // Split up the class parts.
			part,
			i = parts.length;
		
		while ( i-- ) {
			part = parts[ i ]; // Grap the current class part.
			
			// If the part is not in the map then this class was not in the
			// compiled css file. Therefore we don't change the class at all.
			if ( map[ part ] === undefined )
				return cls;
			
			// Replace this class part with the compressed one.
			parts[ i ] = map[ part ];
		}
		return parts.join( '-' ); // Finnaly, join together all the class parts.
	}
	
	function walkPass1 ( rule, map ) {
		/**
		 * On the first pass we walk over the ast finding all the class parts
		 */
		var classParts = [], // Returned class parts.
			i;
		
		map = map || {};
		
		if ( rule.type == 'rule' ) {
			rule.selectors.forEach(function ( selector ) {
				getClassParts( selector ).forEach(function ( part ) {
					if ( map[ part ] ) {
						map[ part ] += 1;
					} else {
						map[ part ] = 1;
					}
				});
			});
		} else if ( rule.rules != undefined ) {
			rule.rules.forEach(function ( rule ) {
				walkPass1( rule, map );
			});
		}

		return map;
	}
	
	function walkPass2 ( rule, map ) {
		/**
		 * On the second pass we walk the ast giving the classes thier short names.
		 */
		if ( rule.type == 'rule' ) {
			rule.selectors.forEach(function ( selector, i ) {
				rule.selectors[ i ] = getClassSelector( selector, map );
			});
		} else if ( rule.rules != undefined ) {
			rule.rules.forEach( function ( rule ) { walkPass2 ( rule, map ) } );
		}
	}
	
	function rename( s, options /* passed directly to css.parse */ ) {
		/**
		 * Give the css classes short names like a-b instead of some-class
		 * 
		 * Returns an object in the form {text: `newCss`, map: `partsMap`} whare text is
		 * the newly generated css and partsMap is a map in the {oldPart: newPart}.
		 */
		var 
			ast = css.parse( s, options ),
			countMap = walkPass1( ast.stylesheet ), // Walk the first pass.
			sortedCounts = [],
			map = {}, // Final map.
			part,
			
			// List of charictor positions for the short class names.
			// Each number corresponds to a charictor in the `chars` string.
			charPosSet = [ 0 ];
		
		// Unpack the count map.
		for ( part in countMap ) {
			sortedCounts.push({
				name: part,
				count: countMap[ part ],
				replacment: undefined
			});
		}
		// Sort based on the number of counts. 
		// That way we can give the most used classes the smallest names.
		sortedCounts.sort(function( a, b ) { return b.count - a.count });
		
		// Generate the small class names.
		sortedCounts.forEach(function ( part ) {
			var 
				s = '',
				i = charPosSet.length;
			// Build up the replacment name.
			charPosSet.forEach(function ( pos ) {
				s += chars[ pos ];
			});
			
			while ( i-- ) {
				charPosSet[ i ]++;
				// If the current char pos is greater then the lenght of `chars`
				// Then we set it to zero.
				if ( charPosSet[ i ] == chars.length ) {
					charPosSet[ i ] = 0;
					if ( i == 0 ) { // Time to add another digit.
						charPosSet.push( 0 ); // The next digit will start at zero.
					}
				} else {
					// Everything is in bounds so break the loop.
					break;
				}
			}
			part.replacment = s;
		});
		
		// Now we pack a basic map in the form of old -> new.
		sortedCounts.forEach(function ( part ) {
			map[ part.name ] = part.replacment;
		});
		
		// Walk the tree a second time actually renameing the classes.
		walkPass2( ast.stylesheet, map );

		return {
			text: css.stringify( ast, options ), // Rebuild the css.
			map: map
		};
	}
	// Expose the module functions.
	return {
		rename: rename,
		getClassName: getClassName,
		getClassSelector: getClassSelector
	};
})();
