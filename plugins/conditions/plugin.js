( function() {
    CKEDITOR.plugins.add( 'conditions', {
	icons: 'conditions',
	requires: 'dialog',
	lang: 'en,fr', // %REMOVE_LINE_CORE%
	
	init: function( editor ) {
	    var allowed="div(*)";
	    
	    editor.conditions_unwrap = function(condition_element) {
		// remove a condition, entierly removing div and span elements,
		// removing only class attributes on other elements (img, td...)
		
		var condition_element_name = condition_element.getName();
		if (condition_element_name == 'div' || condition_element_name == 'span')
		    condition_element.remove( true );
		else
		    condition_element.setAttribute('class','')
		
	    }
	    
	    editor.conditions_getSelected = function(selection) {
		// returns the nearest conditional element in common ancestors of selected elements 
		if (selection == undefined)
		    selection = editor.getSelection()
		var ancestor = selection.getCommonAncestor()
		if (ancestor.type == CKEDITOR.NODE_ELEMENT)
		{
		    if (condelt = editor.conditions_getClosest(ancestor))
		    {
			return condelt;
		    }
		} else {
		    if (condelt = editor.conditions_getClosest(selection.getStartElement()))
		    {
			return condelt;
		    }
		}
		return false;
	    };	    
	    
	    
	    editor.conditions_getClosest = function(elt) {
		// returns the first ancestor elements that holds a condition
		// returns false if no such element
		if (elt == null)
		    return false
		if (elt.type == CKEDITOR.NODE_ELEMENT &&
		    elt.getAttribute('class') &&
		    elt.getAttribute('class').search('=') != -1)
		    return elt
		return editor.conditions_getClosest(elt.getParent());
	    }
	    
	    editor.conditions_canSurround = function(range) {
		// is true if the range can be surrounded by a condition
		// eg range not overlap existing condition
		var boundaries = range.getBoundaryNodes(),
		    startCondition = editor.conditions_getClosest(boundaries.startNode),
		    endCondition = editor.conditions_getClosest(boundaries.endNode);
		if (startCondition && endCondition) {
		    // both start & and are inside a conditional statement
		    if(startCondition.equals(endCondition)) {
			// it is the same, can surround if node are contiguous or simple text selection
			if (boundaries.startNode.type == CKEDITOR.NODE_ELEMENT && boundaries.endNode.type == CKEDITOR.NODE_ELEMENT)
			{
			    return true
			}
			else if (boundaries.startNode.type == CKEDITOR.NODE_TEXT && boundaries.endNode.type == CKEDITOR.NODE_TEXT && boundaries.startNode.equals(boundaries.endNode) && (range.endOffset - range.startOffset > 0) )
			{
			    return true
			}	    
		    }
		}
		else if (!(startCondition || endCondition))
		{
		    console.log('not included in cond')
		    // both elements not included in conditional element
		    if (boundaries.startNode.type == CKEDITOR.NODE_ELEMENT && boundaries.endNode.type == CKEDITOR.NODE_ELEMENT)
		    {
			return true
		    }
		    else if (boundaries.startNode.type == CKEDITOR.NODE_TEXT && boundaries.endNode.type == CKEDITOR.NODE_TEXT && boundaries.startNode.equals(boundaries.endNode) && (range.endOffset - range.startOffset > 0) )
		    {
			return true
		    }	    
		}
		return false
	    }
	    

	    // include dialogs
	    
	    CKEDITOR.dialog.add( 'editCondition', this.path + 'dialogs/conditions.js' );
	    CKEDITOR.dialog.add( 'insertCondition', this.path + 'dialogs/conditions.js' );
	    
	    // define commands
	    
	    editor.addCommand( 'editCondition', new CKEDITOR.dialogCommand( 'editCondition' ) );
	    editor.addCommand( 'insertCondition', new CKEDITOR.dialogCommand( 'insertCondition' ) );
	    editor.addCommand( 'removeCondition', new CKEDITOR.command( editor, {
		exec: function() {
		    console.log('remove condition');
		    if (condelt = editor.conditions_getSelected())
		    {
			editor.conditions_unwrap(condelt)
		    }
		}
	    }));
	    
	    editor.addCommand( 'testconditions', new CKEDITOR.command( editor, {
		exec: function() {
		    console.log('test --------- >');
		    var selection = editor.getSelection()
		    console.log('* selection')
		    console.log(selection.getType())
		    console.log(selection.getStartElement())
		    console.log(selection.getCommonAncestor())
		    var range = selection.getRanges()[0]
		    console.log('* range')
		    console.log(range)
		    console.log('start')
		    console.log(range.startContainer)
		    console.log(range.getPreviousNode(function(){return true}))
		    console.log('end')
		    console.log(range.endContainer)
		    console.log(range.getNextNode(function(){return true}))
		    console.log(editor.getData())


		    console.log('test --------- <');
		}
	    }));
/*
	    editor.ui.addButton( 'conditions', {
		label: 'run test',
		command: 'testconditions',
		toolbar: 'insert'
	    });
*/
	    // add menu definition
	    
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
	    
	    // contextual activation of menus

	    if (editor.contextMenu) {
		editor.contextMenu.addListener(function(element, selection) {
		    menu = {
		    }
		    var selrange = selection.getRanges()[0];
		    //selrange.optimize();
		    
		    if (editor.conditions_canSurround(selrange)){
			menu['insert_condition'] = CKEDITOR.TRISTATE_OFF;
		    }
		    
		    if (editor.conditions_getSelected(selection)) {
			menu['remove_condition'] = CKEDITOR.TRISTATE_OFF;
			menu['edit_condition'] = CKEDITOR.TRISTATE_OFF;
		    }
		    console.log(menu)
		    return menu
		});
	    }
	    
	}

	
    });
})();
