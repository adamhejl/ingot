/**
 * Created by josh on 9/14/15.
 */
jQuery( document ).ready( function ( $ ) {

    //the all click handler
    $( document ).on( 'click', function(e) {
        var el = document.activeElement;
        var href = el.href;
        var group_id;
        group_id =  getParameterByName( 'group_id', href );
        if( 'null' !== group_id ) {
            if ( 'price' == getParameterByName( 'type', href ) ) {

                e.preventDefault();
                    var action;

                    if ( 'list' == group_id ) {
                        action = 'get_price_list_page';
                    } else {
                        action = 'get_price_group_page';
                    }

                    var data = {
                        _nonce: INGOT.admin_ajax_nonce,
                        action: action,
                        group_id: group_id
                    };

                    var outer_wrap = document.getElementById( 'ingot-outer-wrap' );
                    $( outer_wrap ).empty();
                    $( '<img/>', {
                        id: 'outer-loading-spinner',
                        src: INGOT.spinner_url,
                        alt: INGOT.spinner_alt,
                    }).appendTo( outer_wrap );
                    $.ajax( {
                        url: INGOT.admin_ajax,
                        method: "GET",
                        data: data,
                        complete: function ( r, status ) {
                            $( '#outer-loading-spinner' ).remove();
                            if( 'success' == status ) {
                                $( outer_wrap ).html( r.responseText );
                                history.replaceState( {}, 'Ingot', href );
                            }
                        }

                    } );

            }else if( 'click' ==  getParameterByName( 'type', href ) ) {
                //use for click naviagations
            }

        }


        function getParameterByName(name, href ) {
            name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
            var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
                results = regex.exec( href);
            return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
        }
    });

    $( '#group-type' ).change( function() {
        maybe_hide_select_option();
    });

    var maybe_hide_select_option;
    (maybe_hide_select_option = function(){
        var val = $( '#group-type' ).val();
        if ( 'text' != val ) {
            $( '#selector-wrap' ).hide();
        }else{
            $( '#selector-wrap' ).show();
        }
    })();

    $( document ).on( 'click', '#add-group', function(e) {

        e.preventDefault();

        $.get( INGOT.test_field, {
            _nonce: INGOT.admin_ajax_nonce
        }, function(r) {
            $( '#group-parts' ).prepend( r );
            var id = $( r ).attr( 'id' );
            console.log( id );

            $( '#remove-' + id ).on( 'click', function(e) {
                var remove = $( this ).data( 'part-id' );
                var el = document.getElementById( remove );
                if( null != el ) {
                    $( el ).remove();
                }
            });
        });


    });

    $( document ).on( 'click', '#delete-all-groups', function(e) {
        e.preventDefault();
        var url;
        if( 'click' == $( this ).attr( 'data-group-type' ) ) {
            var url = INGOT.api_url + '/test-group/1?all=true';
        }else{
            alert( 'fail' );
            return;
        }

        swal( {
                title: INGOT.are_you_sure,
                text: INGOT.delete_confirm,
                type: "warning",
                showCancelButton: true,
                confirmButtonText:INGOT.delete,
                cancelButtonText: INGOT.cancel,
                closeOnConfirm: false,
                closeOnCancel: false
            }, function ( isConfirm ) {
                if ( isConfirm ) {

                    $.ajax({
                        url:url,
                        method: "DELETE",
                        success: function( r, textStatus ) {
                            swal( INGOT.deleted, "", "success" ), function() {
                                location.reload();
                            };
                        }

                    });

                } else {
                    swal( INGOT.canceled, "", "success" );
                }
            } );
    });

    $( '.part-remove' ).each( function( i, button ){
        $( button ).on( 'click', function(e) {
            swal({
                title: INGOT.beta_error_header,
                text: INGOT.no_stats,
                type: "error",
                confirmButtonText: INGOT.close
            });
        });
    });

    $( document ).on( 'click', '.group-stats', function(e) {
        /**
        swal({
            title: INGOT.beta_error_header,
            text: INGOT.cant_remove,
            type: "error",
            confirmButtonText: INGOT.close
        });
         */
    });

    $( document ).on( 'click', '.group-delete', function(e) {
        id = $( this ).data( 'group-id' );
        var url = INGOT.api_url + '/test-group/' + id;
        $.ajax({
            url:url,
            method: "DELETE",
            success: function( r, textStatus ) {
                var el = document.getElementById( 'group-' + r );
                if ( null != el ) {
                    $( el ).slideUp( "slow", function() {
                        swal({
                            title: INGOT.deleted,
                            text: '',
                            type: "success",
                            confirmButtonText: INGOT.close
                        });
                        $( el ).remove();
                    });

                }
            }
        })
    });



    $( document ).on( 'submit', '#ingot-click-test', function( e) {
        e.preventDefault();
        $( '#spinner' ).show().css( 'visibility', 'visible' ).attr( 'aria-hidden', 'false' );


        var parts;
        parts = $( '.test-part' );

        var test_endpoint = INGOT.api_url + '/test/';


        var  id, _id, create, name, text, part_data, url, current;
        var test_ids = {};

        $.each( parts, function( i, part ){
            id = 0;
            _id = $( part ).attr( 'id' );
            create = false;

            if ( _id.substring(0,4) == "-ID_") {
                create = true;
            }else{
                id = _id;
            }

            name = $( '#name-'  + _id ).val();
            text = $( '#text-'  + _id ).val();

            part_data = {
                name: name,
                text: text,
                id: id
            };

            current = $( '#' + _id ).data( 'current' );
            if( false == create && part_data.name == current.name && part_data.text == current.text ) {
                test_ids[ i ] = id;
                return;
            }


            if ( true == create ) {
                url = test_endpoint;
            }else{
                url = test_endpoint + id;
            }

            //@todo use a promise to avouid syncronous transfer
            $.ajax( {
                url: url,
                async: false,
                method: 'POST',
                beforeSend: function ( xhr ) {
                    xhr.setRequestHeader( 'X-WP-Nonce', INGOT.nonce );
                },
                data: part_data
            } ).always(function( r, status) {

                if( 'object' == typeof r){
                    $( '#name-'  + _id ).attr( 'id', 'name-' + r.ID );
                    $( '#text-'  + _id ).attr( 'id', 'value-' + r.ID );
                    $( part ).attr( 'id', r.ID );
                    $( '#part-hidden-id-' + _id ).val( r.ID );
                    $( '#part-hidden-id-' + _id ).attr( 'id', 'part-hidden-id-' + r.ID );

                    test_ids[ i ] = r.ID;
                }
            });


        });

        var group_id = $( '#test-group-id' ).val();
        url = INGOT.api_url + '/test-group/';

        if ( 0 < group_id ) {
            url = url + group_id;
        }

        var group_data = {
            type: 'click',
            name : $( '#group-name' ).val(),
            click_type: $( '#group-type' ).val(),
            order: test_ids,
            selector: $( '#selector' ).val(),
            initial: $( '#intial' ).val(),
            threshold: $( '#threshold' ).val(),
            link: $( '#link' ).val()
        };


        $.ajax({
            url: url,
            data: group_data,
            method: 'POST',
            beforeSend: function ( xhr ) {
                xhr.setRequestHeader( 'X-WP-Nonce', INGOT.nonce );
            }

        } ).always(function( r, status ) {
            if( 'success' == status ){

                $( '#test-group-id' ).val( r.ID );
                var href = window.location.href.split('?')[0];
                var title = INGOT.test_group_page_title + r.name;
                var new_url = href + '?page=ingot&group=' + r.ID;
                $( '#spinner' ).hide();
                swal({
                    title: INGOT.success,
                    text: INGOT.saved + r.name,
                    type: "success",
                    confirmButtonText: INGOT.close
                });
                history.pushState( {}, title, new_url );
            }else{
                $( '#spinner' ).hide().css( 'visibility', 'hidden' ).attr( 'aria-hidden', 'true' );
                swal({
                    title: INGOT.fail,
                    text: INGOT.fail,
                    type: "error",
                    confirmButtonText: INGOT.close
                });
            }
        });




    });

    $( document ).on( 'submit', '#ingot-settings', function(e) {
        e.preventDefault();
        $( '#ingot-settings-spinner' ).show().css( 'visibility', 'visible' ).attr( 'aria-hidden', 'false' );
        var data = {
            click_tracking: $( '#click_tracking' ).val(),
            anon_tracking: $( '#anon_tracking' ).val(),
            license_code: $( '#license_code' ).val(),
            _nonce: INGOT.admin_ajax_nonce,
            action: 'ingot_settings'
        };
        $.ajax({
            url: INGOT.admin_ajax,
            method: "POST",
            data: data,
            complete: function() {
                $( '#ingot-settings-spinner' ).hide().css( 'visibility', 'hidden' ).attr( 'aria-hidden', 'true' );
            }

        });

    });
} );
