var width = 550,
    height = 600;

var cluster = d3.layout.cluster()
    .size( [height, width - 160] );

var diagonal = d3.svg.diagonal()
    .projection( function ( d ) {
        return [d.y, d.x];
    } );

var svg = d3.select( "body" ).append( "svg" )
    .attr( "width", width )
    .attr( "height", height )
    .append( "g" )
    .attr( "transform", "translate(40,0)" );

var drawTree = function ( tree ) {

    svg.selectAll( ".node" ).remove();
    svg.selectAll( ".link" ).remove();

    var nodes = cluster.nodes( tree ),
        links = cluster.links( nodes );

    var link = svg.selectAll( ".link" )
        .data( links )
        .enter().append( "path" )
        .attr( "class", "link" )
        .style( "stroke-width", function ( d ) {
            return 1;
        } )
        .attr( "d", diagonal );

    var node = svg.selectAll( ".node" )
        .data( nodes )
        .enter().append( "g" )
        .attr( "class", "node" )
        .attr( "transform", function ( d ) {
            return "translate(" + d.y + "," + d.x + ")";
        } )

    node.append( "circle" )
        .attr( "r", 20 );
    node.append( "text" )
        .attr( "dx", -10 )
        .attr( "dy", 3 )

        .text( function ( d ) {
            return d.title;
        } );
    d3.select( self.frameElement ).style( "height", height + "px" );
}

