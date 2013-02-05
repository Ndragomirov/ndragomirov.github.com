(function () {
    var aboutText = "Hi,>im Nikita Dragomirov>Contact me:>email>jdavid214@gmail.com>skype>ndragomirov".replace( /\s/g, "\u2009" ).split( "" );
    var $contact = $( "#contact" );
    aboutText.forEach( function ( s ) {
        if ( s == ">" ) {
            $( "<br/>" ).appendTo( $contact );
        } else {
            $( "<div/>" ).addClass( "contact-block" ).html( s ).appendTo( $contact );
        }
    } );
    var $background = $( '#blackbg' );
    var $menu = $( '.menu-item ' );
    var $logos = $( '.grid-block-logo' );
    var $contactblocks = $( '.contact-block' );
    var $gridBlocks = $( '.grid-block' );
    var showWorks = function () {
        $background.removeClass( "next" );
        $menu.addClass( "white-color" );
        $background.css( {opacity: 1} );
    };
    var hideWorks = function () {
        $background.addClass( "next" );
        $menu.removeClass( "white-color" );
        $background.css( {opacity: 0} );
    };

    var showBlocks = function () {
        $contactblocks.each( function ( i, e ) {
            var t = $( this );
            var delay = i * 10;
            t.css( {
                top : Math.random() * 500
            } );
            setTimeout( function () {
                t.addClass( 'baseline' );
            }, delay );
        } );

        setTimeout( function () {
            $contactblocks.css( {top: 0} );
        }, 1000 );
    };
    var hideBlocks = function () {
        $contactblocks.removeClass( 'baseline' );
    };

    $( "body" )

        .on( 'click', '.grid-block-badge', function ( e ) {
            $( this ).closest( '.grid-block' ).toggleClass( 'hover' );
        } )
        .on( 'click', '.close-info', function ( e ) {
            $( this ).closest( '.grid-block' ).toggleClass( "hover" );
        } );

    $( 'a[href="#contact"]' ).on( 'click', function ( e ) {
        if ( window.location.hash != "#works" ) return true;
        var hasHoverBlocks = $gridBlocks.hasClass( "hover" );
        if ( hasHoverBlocks ) {
            $gridBlocks.removeClass( "hover" );
            setTimeout( function () {
                window.location.hash = "#contact";
            }, 400 );
            return false;
        }
    } );

    $( window ).hashchange( function () {

        var route = location.hash.slice( 1 );
        $( '[data-route]' ).addClass( "prev" );
        $( '[data-route="' + route + '"]' ).removeClass( "prev" );
        if ( route == "contact" ) {
            showBlocks();
        } else {
            hideBlocks();
        }
        if ( route == "works" ) {
            showWorks();
            setTimeout( function () {
                $logos.removeClass( "logo-up" );
            }, 300 );
        } else {
            $logos.addClass( "logo-up" );
            hideWorks();
        }
    } );

    // Trigger the event (useful on page load).
    window.location.hash = "#works";
    $( window ).hashchange();
})();