<?php
	define(DEV_MODE, false);
		
	function build_class( $name, $map ) {
		$parts = [];
		foreach ( explode( '-', $name ) as $part ) {
			$newPart = array_key_exists( $part, $map )? $map[ $part ] : $part;
			array_push( $parts, $newPart );
		}
		return implode( '-', $parts );
	}
	function class_rename ( $content ) {
		$string = file_get_contents( 'map.json' );
		$classMap = json_decode( $string, true );
		
		$doc = new DOMDocument();
		$doc->preserveWhiteSpace = false; // Remove unnesesary whitespace.
		
		@$doc->loadHTML( $content );
		foreach ( $doc->getElementsByTagName( '*' ) as $elem ) {
			$classStr = $elem->getAttribute( 'class' );
			if ( ! empty( $classStr ) ) { // No need setting empty classess all over the place.
				$classes = []; // This is ware we put all the renamed classes.
				foreach ( explode( ' ', $classStr ) as $class ) {
					array_push( $classes, build_class( $class, $classMap ) );
				}
				$elem->setAttribute( 'class', implode( ' ', $classes ) );
			}
		}
		
		return $doc->saveHTML();
	}
	if (!DEV_MODE)
		ob_start( 'class_rename' );
?>
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta name="viewport" content = "width=device-width, initial-scale=1">
		<meta charset = "utf-8">
		
		<?php if (DEV_MODE): ?>
		
		<link rel='stylesheet' href = 'node_modules/bootstrap/dist/css/bootstrap.css'>
		
		<script src = 'node_modules/jquery/dist/jquery.js'></script>
		<script src = 'node_modules/bootstrap/dist/js/bootstrap.js'></script>
		<script src = 'assets/js/main.js'></script>
		
		<?php else: ?>
		
		<link rel='stylesheet' href = 'node_modules/bootstrap/dist/css/bootstrap.sm.cls.css'>
		
		<script src = 'node_modules/jquery/dist/jquery.min.js'></script>
		<script src = 'node_modules/bootstrap/dist/js/bootstrap.min.js'></script>
		<script src = 'assets/js/main.min.js'></script>
		
		<?php endif; ?>
	
	</head>
	<body onload = 'main()'>
		<nav class = "navbar navbar-default">
			<div class = "container-fluid">
				<div class = "navbar-header">
					<a class = "navbar-brand" href = "#">Brand</a>
				</div>
				<div>
					<ul class = "nav navbar-nav">
						<li class = "active">
							<a href = "#">Link <span class = "sr-only">(current)</span></a>
						</li>
						<li><a href = "#">Action 1</a></li>
						<li><a href = "#">Action 2</a></li>
						<li><a href = "#">Action 3</a></li>
					</ul>
				</div>
			</div>
		</nav>
		<div class = "container">
			<div class = "row">
				<div class = "col-sm-6">
					<div class = "alert alert-success" role = "alert">
						<span class = "glyphicon glyphicon-ok" aria-hidden = "true"></span>
						<strong>Hooray!</strong>
						Everything worked fine.
					</div>
				</div>
				<div class = "col-sm-6">
					<div class = "alert alert-danger" role = "alert">
						<span class = "glyphicon glyphicon-exclamation-sign" aria-hidden = "true"></span>
						<strong>Error:</strong>
						There seems to be an error.
					</div>
				</div>
			</div>
			<ol class = "breadcrumb">
				<li><a href = "#">Home</a></li>
				<li><a href = "#">Library</a></li>
				<li class = "active">Data</li>
			</ol>
		</div>
	</body>
</html>
<?php if (!DEV_MODE) ob_end_flush(); ?>
