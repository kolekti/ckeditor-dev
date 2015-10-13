( function() {
    var condDialog = function( editor, dialogType ) {

	var expr = {};
	var cond_elt = null;
		
	var get_expression = function() {
	    var exprs = []
	    $.each(expr, function(i, cond) {
		if (cond.values.length) {
		exprs.push( i + " " + cond.operator + "  "+ cond.values.join(','));
		}
	    });
	    return exprs.join(';')
	}
	
	var parse_expression = function(strexp) {
	    critexps = strexp.split(';')
	    console.log(critexps)
	    $.each(critexps, function(i, critexp) {
		if (critexp.length == 0)
		    return
		var operator = "=\\";
		var operator = critexp.match(/= *\\?/)[0]
		critvals = critexp.split(operator);
		var criteria = critvals[0].trim(); 
		console.log(critvals[0])
		expr[criteria]['operator'] = operator.replace(' ','');
		expr[criteria]['values']=[];
		$.each(critvals[1].split(','), function(j, val) {
		    expr[criteria]['values'].push(val.trim())
		});
	    });
	    return critexps;
	}
	
	var conditions_setup = function() {
	    
	}

	var condition_menu = function() {
	    var conditions = [];
	    console.log('condition menu');
	    var conditions_setOperator = function(criteria, operator) {
		console.log('set operator '+criteria+operator)
		expr[criteria]['operator']=operator;
	    };
	    var conditions_addValue = function(criteria, value) {
		if (value.length) {
		    var vind = expr[criteria].values.indexOf(value) 
		    if( vind == -1) {
			expr[criteria]['values'].push(value);
		    } else {
//			expr[criteria]['values'].splice(vind);
		    }
		}
		
	    };
	    var conditions_removeCriteria = function(criteria) {
		expr[criteria]['values']=[];
		expr[criteria]['operator']='=';
	    };
	    var conditions_updateExpr = function(dialog) {
		var buffer="";
		var firstCrit = true;
		$.each(expr, function(index, item) {
		    if (item.values.length) {
			if (!firstCrit) {
			    buffer += " ; ";
			}
			firstCrit = false;
			buffer += item.code
			buffer += ' '
			buffer += item.operator
			buffer += ' '
			console.log('ser -> '+item.code+item.operator)
			$.each(item.values, function(indexval, value) {
			    if (indexval > 0)
				buffer += " , "
			    buffer += value
			});
		    }
		});
		console.log('update expr');
		console.log(expr)
		console.log(buffer)
		dialog.getContentElement("tab-basic","cond_ID").setValue(buffer, false)
	    };
	   
	    
	    $.ajax({
		type: 'GET',
		url: '/criteria.json',
		contentType: 'application/json; charset=utf-8',
		dataType: 'json',
		async: false,
		success: function(data) {
		    
		    $.each(data, function(index, item) {
			//  console.log( '**item ' + item);
			/*  console.log( $.each(item, function(vindex, value) {
			    console.log(value);
			    return 42;
			    }))
			    */
			expr[index]={"code":index, 
				     "def":item, 
				     "operator":"=", 
				     "values":[]};
			
			var condvalues = [];
			condvalues.push(["-- select --",""]);
			$.each(item, function(vindex, value) {
			    console.log(value);
			    condvalues.push([value,value]);
			});
			

			conditions.push({
			    type: 'hbox',
			    widths: [ '280px', '110px' ],
			    align: 'left',
			    children: [
				{
				    type: 'html',
				    html:'<span class="condition_dialoglabel">'+index+'</span>'
				},
				{
				'type': 'select',
				    'id'  : 'operator_ID_'+index,
				    'items': [[" = ", "="],
					      ["= \\ ","= \\"]],
				    'default':"=",
				    onChange:function() {
					conditions_setOperator(index,this.getValue());
					conditions_updateExpr(this.getDialog());
				    }
				},
				{
				    type: 'select',
				    id: 'crit_ID_'+index,
				    items : condvalues,
				    onClick:function() {
					conditions_addValue(index,this.getValue());
					conditions_updateExpr(this.getDialog());
					this.setValue('');
				    }
				},
				{
				    'type': 'button',
				    'id'  : 'del_ID_'+index,
				    'label': "X",
				    onClick:function() {
					conditions_removeCriteria(index);
					conditions_updateExpr(this.getDialog());
				    }

				}]
			})
		    });
		},		    
		
	    
		error:function (xhr, ajaxOptions, thrownError){
		    alert(xhr.status);
		alert(thrownError);
		} 
            });

	    // full condition string
	    conditions.push({
		type: 'hbox',
		widths: [ '280px', '110px' ],
		align: 'left',
		children: [
		    {
			type: 'text',
			id: 'cond_ID',
			label: 'Expression condition :',
			validate:function(  ) {
			    console.log('validate')
			},
			setup:function(  ) {
			    console.log('setup')
			},
			onChange:function() {
			    console.log('onChange '+dialogType)
			    var field = this;
			    parse_expression(field.getValue())
			},
			onShow:function( ) {
			    console.log('onShow '+dialogType)
			    var field = this;
			    if(dialogType == 'edit') {
				console.log(editor.conditions_getSelected());
				field.setValue(editor.conditions_getSelected().getAttribute('class'), false);
				parse_expression(field.getValue())
			    }
			}
		    }]
	    });
	    if(dialogType == 'insert') {

		conditions.push({
		    type: 'hbox',
		    widths: [ '280px', '110px' ],
		    align: 'left',
		    children: [
			{
			    type: 'checkbox',
			    id: 'force_create',
			    label: "Forcer la création d'un élément div ou span"
			}]
		});
	    }
	    // console.log(conditions);
	    return conditions
	    
	};

	return {
	    title: editor.lang.conditions[ dialogType == 'insert' ? 'titleInsert' : 'titleModify' ],
            minWidth: 400,
            minHeight: 200,
            contents: [
		{
                    id: 'tab-basic',
                    label: 'Critères',
                    elements: condition_menu()
		}
            ],
	    
	    onShow : function(element) {
		conditions_setup();
		$.each(expr, function(i,item) {
		    item.values=[];
		    item.operator="=";
		});
	    },
	    
            onOk: function() {
		var dialog = this;
		var expr = dialog.getValueOf( 'tab-basic', 'cond_ID' );
		// TODO
		var cond_elt = null;
		if (dialogType == 'edit') {
		    cond_elt = editor.conditions_getSelected()
		} else {
		    selection = editor.getSelection()
		    if (selection.getType() == CKEDITOR.SELECTION_ELEMENT) {
			var elt = selection.getSelectedElement()
			if (dialog.getValueOf('tab-basic','force_create') ||
			    elt.hasAttribute('class')) {
			    // create element
			    if (elt.hasAscendant('p', false)) {
				cond_elt = editor.document.createElement( 'span' );
			    } else {
				cond_elt = editor.document.createElement( 'div' );
			    }
			    cond_elt.insertAfter(elt)
			    elt.move(cond_elt,true)
			}
		    }
		    else if (selection.getType() == CKEDITOR.SELECTION_TEXT) {
			var ancestor = selection.getCommonAncestor()
			var range = selection.getRanges()[0]
			var startchild = range.startContainer
			var endchild = range.endContainer
			if (ancestor.type == CKEDITOR.NODE_TEXT) {
			    // the selection is fully enclosed in a text element
			    startchild.split(range.endOffset)
			    startchild = startchild.split(range.startOffset)
			    endchild = startchild
			    ancestor = ancestor.getParent()
			}
			if (!startchild.equals(ancestor) || endchild.equals(ancestor))
			    startchild = endchild = ancestor
			if (!startchild.equals(ancestor)) {
			    while (startchild) {
				if (startchild.getParent().equals(ancestor))
				    break;
				
				if (startchild.type == CKEDITOR.NODE_TEXT && range.startOffset > 1) {
				    startchild = startchild.split(range.startOffset)
				}
			    
				if (startchild.hasPrevious()) {
				    // split the parent
				    var cloned = startchild.getParent().clone()
				    cloned.insertBefore(startchild.getParent())
				    while (startchild.hasPrevious()) {
					startchild.getPrevious().move(cloned)
				    }
				}
				startchild = startchild.getParent()
			    }
			}
			if (!endchild.equals(ancestor)) {
			    while (endchild) {
				if (endchild.getParent().equals(ancestor))
				    break;
				
				if (endchild.type==CKEDITOR.NODE_TEXT && range.endOffset > 1) {
				    endchild.split(range.endOffset)
				}
				if (endchild.hasNext()) {
				    // split the parent
				    var cloned = endchild.getParent().clone()
				    cloned.insertAfter(endchild.getParent())
				    while (endchild.hasNext()) {
					endchild.getNext().move(cloned)
				    }
				}
				endchild = endchild.getParent()
			    }
			}
			if (dialog.getValueOf('tab-basic','force_create') ||
			    startchild.hasPrevious() ||
			    endchild.hasNext() ||
			    ancestor.hasAttribute('class')) {
			    
			    if (startchild.type == CKEDITOR.NODE_TEXT ||
				startchild.hasAscendant('p', false)) {
				cond_elt = editor.document.createElement( 'span' );
			    } else {
				cond_elt = editor.document.createElement( 'div' );
			    }
			    cond_elt.insertBefore(startchild);
			    moved = startchild;
			    while (moved && !moved.equals(endchild)) {
				var elt = moved.getNext(); 
				moved.move(cond_elt);
				moved = elt;
			    }
			    endchild.move(cond_elt);
			} else {
			    cond_elt = ancestor;
			}
		    }
		}
		cond_elt.setAttribute('class',expr)
	    }
	};
    };
    
    CKEDITOR.dialog.add( 'editCondition', function(editor) {
	return condDialog(editor,'edit')
    });

    CKEDITOR.dialog.add( 'insertCondition', function(editor) {
	return condDialog(editor,'insert')
    });
    
})();
