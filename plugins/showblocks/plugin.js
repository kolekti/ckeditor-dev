/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

/**
 * @fileOverview The "showblocks" plugin. Enable it will make all block level
 *               elements being decorated with a border and the element name
 *               displayed on the left-right corner.
 */

( function() {
	'use strict';

    var keys = {"structUp":27    // Esc
	       }
    
    var commandDefinition = {
	    readOnly: 1,
		preserveState: true,
		editorFocus: false,

		exec: function( editor ) {
			this.toggleState();
			this.refresh( editor );
		},

		refresh: function( editor ) {
			if ( editor.document ) {
				// Show blocks turns inactive after editor loses focus when in inline.
				var showBlocks = ( this.state == CKEDITOR.TRISTATE_ON && ( editor.elementMode != CKEDITOR.ELEMENT_MODE_INLINE || editor.focusManager.hasFocus ) );

				var funcName = showBlocks ? 'attachClass' : 'removeClass';
				editor.editable()[ funcName ]( 'cke_show_blocks' );
			}
		}
	};

    var inBlockLabel = function(event) {
	var target = event.getTarget();
	var y = event.getPageOffset().y
	return (y - target.$.offsetTop < 15)  
    }
    
	CKEDITOR.plugins.add( 'showblocks', {
		// jscs:disable maximumLineLength
		lang: 'af,ar,bg,bn,bs,ca,cs,cy,da,de,el,en,en-au,en-ca,en-gb,eo,es,et,eu,fa,fi,fo,fr,fr-ca,gl,gu,he,hi,hr,hu,id,is,it,ja,ka,km,ko,ku,lt,lv,mk,mn,ms,nb,nl,no,pl,pt,pt-br,ro,ru,si,sk,sl,sq,sr,sr-latn,sv,th,tr,tt,ug,uk,vi,zh,zh-cn', // %REMOVE_LINE_CORE%
		// jscs:enable maximumLineLength
		icons: 'showblocks,showblocks-rtl', // %REMOVE_LINE_CORE%
		hidpi: true, // %REMOVE_LINE_CORE%
		onLoad: function() {
		    var tags = [ 'p', 'div', 'pre', 'address', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'dl','dt','dd' ],
			subtags = tags.slice(),
			
				cssStd, cssImg, cssLtr, cssRtl, cssSel,
				path = CKEDITOR.getUrl( this.path ),
				// #10884 don't apply showblocks styles to non-editable elements and chosen ones.
				// IE8 does not support :not() pseudoclass, so we need to reset showblocks rather
				// than 'prevent' its application. We do that by additional rules.
				supportsNotPseudoclass = !( CKEDITOR.env.ie && CKEDITOR.env.version < 9 ),
			        notDisabled = supportsNotPseudoclass ? ':not([contenteditable=false]):not(.cke_show_blocks_off)' : '',
			before = ":before",
			select = "[data-selected-block]",
			tag, trailing, subtag, subtrailing,
			cssBody = "";//"body.cke_show_blocks {border-left:120px solid #F0F0F0; padding-left:10px;margin-top:0; margin-left:0;padding-top:8px}";

			cssStd = cssImg = cssLtr = cssRtl = cssSel = '';
		    
			while ( ( tag = tags.pop() ) ) {
			    trailing = tags.length ? ',' : '';
			    
			    cssStd += '.cke_show_blocks ' + tag + notDisabled + before;
			    cssSel += '.cke_show_blocks ' + tag + select + notDisabled + before +',';
			    for(var i=0; i < subtags.length; i++) {
				subtag = subtags[i];
				subtrailing = (i == subtags.length-1) ? '' : ',';
				cssSel += '.cke_show_blocks ' + tag + select;
				cssSel +=  ' ' + subtag + notDisabled + before + subtrailing;
			    }
			    cssSel += trailing;
			    cssLtr += '.cke_show_blocks.cke_contents_ltr ' + tag + notDisabled + trailing;
			    cssRtl += '.cke_show_blocks.cke_contents_rtl ' + tag + notDisabled + trailing;
			    //cssImg += '.cke_show_blocks ' + tag + notDisabled + '{' +
			    //	'background-image:url(' + CKEDITOR.getUrl( path + 'images/block_' + tag + '.png' ) + ')' +
			    //'}';
			    // .cke_show_blocks p { ... }
			    cssStd += '{' +
				'margin-left:-8px;' +
				'padding-left:10px;' +
				'margin-bottom:5px;' +
				
//				'position:relative;' +
//				'left:5px;' +
				'display:block;' +
//				'float:left;' +
//				'width:30%;' +
				'font-size:12px;' +
				'font-family:sans-serif;' +
				'font-weight:bold;' +
				'color:#202080;' +
				'background-color:#F0F0F0;' +
				'content:"'+tag+'  " attr(class);' +
				'border:1px solid #D0D0D0;' +
				'cursor:pointer;' +
			    //'padding-top:12px;' +
				//'list-style-position:inside' +
				'}';
			}
		    

		    cssSel += '{background-color:#C0C0C0}'

			// .cke_show_blocks.cke_contents_ltr p { ... }
		    cssLtr += '{' +
			'display:block;' +
			'border-left:1px solid #D0D0D0;' +
			'margin-left:8px;' +
			'padding-left:8px;' +
			'list-style-type:none' +
			'}';

			// .cke_show_blocks.cke_contents_rtl p { ... }
		    cssRtl += '{' +
			'display:block;' +
			'border-right:1px solid #D0D0D0;' +
			'margin-right:8px;' +
			'padding-right:8px;' +
			'list-style-type:none' +
			'}';

		    CKEDITOR.addCss( cssStd.concat(cssLtr, cssRtl, cssSel));//.concat( cssImg ) );

			// [IE8] Reset showblocks styles for non-editables and chosen elements, because
			// it could not be done using :not() pseudoclass (#10884).
			if ( !supportsNotPseudoclass ) {
				CKEDITOR.addCss(
					'.cke_show_blocks [contenteditable=false],.cke_show_blocks .cke_show_blocks_off{' +
						'border:none;' +
						'padding-top:0;' +
						'background-image:none' +
					'}' +
					'.cke_show_blocks.cke_contents_rtl [contenteditable=false],.cke_show_blocks.cke_contents_rtl .cke_show_blocks_off{' +
						'padding-right:0' +
					'}' +
					'.cke_show_blocks.cke_contents_ltr [contenteditable=false],.cke_show_blocks.cke_contents_ltr .cke_show_blocks_off{' +
						'padding-left:0' +
					'}'
				);
			}
		},
		init: function( editor ) {
		    editor.on( 'contentDom', function() {
			var resizer,
			    editable = editor.editable();
			
			// In Classic editor it is better to use document
			// instead of editable so event will work below body.
			editable.attachListener( editable.isInline() ? editable : editor.document, 'click', function( evt ) {
			    
			    evt = evt.data;
			    var target = evt.getTarget();
			    var selected = editor.document.find('[data-selected-block]')
			    for (var i = 0; i < selected.$.length; i++) {
				selected.$.item(i).removeAttribute('data-selected-block');
			    }
			    if (inBlockLabel(evt)) {
				console.log('select element')
				var sel = editor.getSelection()
				sel.selectElement( target );
				target.setAttribute('data-selected-block','yes')
			    }
			    
			})
			editable.attachListener( editable.isInline() ? editable : editor.document, 'keyup', function( evt ) {
			    evt = evt.data;
			    var target = evt.getTarget();
			    console.log(evt.getKey());
			    var selection = editor.getSelection()
			   
			    var selType = selection.getType()
			    console.log("============== Selection")
			    var native_selection = selection.getNative()
			    console.log("        ------ Native")
			    console.log(native_selection)
			    console.log("        ------ CK")
			    console.log(selection)
			    console.log("type "+selType)
			    if (selType == 3) {
				console.log(selection.getSelectedElement())
			    }
			    if (selType == 2) {
				var selrange = selection.getRanges()[0];
				console.log(selection.getSelectedText())
				console.log(selection.getStartElement())
				//			    console.log(selection.getEndElement()
				console.log("        ------ Ranges")
				console.log(selrange.startOffset)
				console.log(selrange.startContainer)
				console.log(selrange.endOffset)
				console.log(selrange.endContainer)
			    }
			})
		    })
					       
			    


			    


				    
		    if ( editor.blockless )
				return;

			var command = editor.addCommand( 'showblocks', commandDefinition );
			command.canUndo = false;

			if ( editor.config.startupOutlineBlocks )
				command.setState( CKEDITOR.TRISTATE_ON );

			editor.ui.addButton && editor.ui.addButton( 'ShowBlocks', {
				label: editor.lang.showblocks.toolbar,
				command: 'showblocks',
				toolbar: 'tools,20'
			} );

			// Refresh the command on setData.
			editor.on( 'mode', function() {
				if ( command.state != CKEDITOR.TRISTATE_DISABLED )
					command.refresh( editor );
			} );

			// Refresh the command on focus/blur in inline.
			if ( editor.elementMode == CKEDITOR.ELEMENT_MODE_INLINE ) {
				editor.on( 'focus', onFocusBlur );
				editor.on( 'blur', onFocusBlur );
			}

			// Refresh the command on setData.
			editor.on( 'contentDom', function() {
				if ( command.state != CKEDITOR.TRISTATE_DISABLED )
					command.refresh( editor );
			} );

			function onFocusBlur() {
				command.refresh( editor );
			}
		}
	} );
} )();

/**
 * Whether to automaticaly enable the show block" command when the editor loads.
 *
 *		config.startupOutlineBlocks = true;
 *
 * @cfg {Boolean} [startupOutlineBlocks=false]
 * @member CKEDITOR.config
 */
