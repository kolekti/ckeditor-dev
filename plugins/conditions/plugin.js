( function() {
    CKEDITOR.plugins.add( 'conditions', {
	icons: 'editcondition,removecondition',
	requires: 'dialog,showblocks',
	lang: 'en,fr', // %REMOVE_LINE_CORE%
	
	init: function( editor ) {
	    var allowed="div(*)";

	    has_condition = function(block) {
		var aclass = block.getAttribute('class')
		return aclass && aclass.indexOf('=') != -1; 
	    }
	    
	    editor.conditions_unwrap = function(condition_element) {
		// remove a condition, entierly removing div and span elements,
		// removing only class attributes on other elements (img, td...)
		var condition_element = editor.
		condition_element.removeAttribute('class')
		
	    }
	 
	    
	  
	    // include dialogs
	    
	    CKEDITOR.dialog.add( 'editCondition', this.path + 'dialogs/conditions.js' );
	    
	    // define commands
	    
	    var cmd_edit = editor.addCommand( 'editCondition', new CKEDITOR.dialogCommand( 'editCondition' ) );
	    var cmd_remove = editor.addCommand( 'removeCondition', new CKEDITOR.command( editor, {
		exec: function() {
		    var block, blocks = editor.plugins.showblocks.getselectedblock(editor);
		    if (blocks) {
			for (var b = 0; b < blocks.count(); b++) {
			    block = blocks.getItem(b);
			    block.removeAttribute('class')
			}
		    }
		    conditionButtonsState();
		}
	    }));
	    
	    editor.ui.addButton( 'editCondition', {
		label: editor.lang.conditions.toolbarEdit,
		command: 'editCondition',
		toolbar: 'tools,50'
	    });

	    editor.ui.addButton( 'removeCondition', {
		label: editor.lang.conditions.toolbarRemove,
		command: 'removeCondition',
		toolbar: 'tools,40'
	    });

	    var conditionButtonsState = function() {
		var blocks = editor.plugins.showblocks.getselectedblock(editor);
		if (blocks && blocks.count()) {
		    var block = blocks.getItem(0);
		    if (block.hasAttribute('class')) {
			if (has_condition(block)) {
			    cmd_edit.setState( CKEDITOR.TRISTATE_OFF );
			    cmd_remove.setState( CKEDITOR.TRISTATE_OFF );
			} else {
			    cmd_edit.setState( CKEDITOR.TRISTATE_DISABLED );
			    cmd_remove.setState( CKEDITOR.TRISTATE_DISABLED );
			}
		    } else {
			cmd_edit.setState( CKEDITOR.TRISTATE_OFF );
			cmd_remove.setState( CKEDITOR.TRISTATE_DISABLED );
		    }
		} else {
		    cmd_edit.setState( CKEDITOR.TRISTATE_DISABLED );
		    cmd_remove.setState( CKEDITOR.TRISTATE_DISABLED );
		}
	    }
	    editor.on( 'selectionChange', conditionButtonsState)
		       
	    editor.on( 'blockSelection', conditionButtonsState)
		       
	    // add menu definition
	    /*
	    if (editor.addMenuItems) {
		// 1st, add a Menu Group
		// tip: name it the same as your plugin. (I'm not sure about this)
		editor.addMenuGroup('conditions',120);
		// 2nd, use addMenuItems to add items
		
		editor.addMenuItems({
		    // 2.1 add the group again, and give it getItems, return all the child items
		    
		    // 2.2 Now add the child items to the group.
		    'insert_condition':
		    {
			label : 'Insert Condition',
			group : 'conditions',
			command : 'insertCondition'
		    },
		    'edit_condition':
		    {
			label : 'Mofify Condition',
			group : 'conditions',
			command : 'editCondition'
		    },
		    'remove_condition':
		    {
			label : 'Remove Condition',
			group : 'conditions',
			command : 'removeCondition'
		    }
		});
	    }
	    */
	    // contextual activation of menus
/*
	    if (editor.contextMenu) {
		editor.contextMenu.addListener(function(element, selection) {
		    var menu = {}
		    var selected_block = editor.plugins.showblocks.getselectedblock(editor)
		    
		    if (selected_block) {
			if(has_condition(selected_block)) {
			    menu['removeCondition'] = CKEDITOR.TRISTATE_OFF;
			    menu['editCondition'] = CKEDITOR.TRISTATE_OFF;
			} else {
			    menu['insertCondition'] = CKEDITOR.TRISTATE_OFF;
			}
		    } else {
			menu['removeCondition'] = CKEDITOR.TRISTATE_OFF;
			menu['editCondition'] = CKEDITOR.TRISTATE_OFF;
			menu['insertCondition'] = CKEDITOR.TRISTATE_OFF;
		    }
		    
		    return menu
		});
	    }
	    */
	}

	
    });
})();
