function __( cls ) {
	return cls;
}

window.main = function () {
	var 
		elems = document.getElementsByClassName( __('glyphicon') ),
		i = elems.length, elem;
	
	while ( i-- ) {
		elem = elems[ i ];
		elem.setAttribute( 'icon', true );
	}
	
	jQuery( '.row' ).attr( 'row', true );
	var newHtml = jQuery( "<div><a href='bla' class='btn'></a></div>" );
	$( '#bla.row > something' ).find( '.some-random-class.row' );
	jQuery( '' );
}