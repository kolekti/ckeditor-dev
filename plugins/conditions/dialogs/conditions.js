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
	    $.each(critexps, function(i, critexp) {
		if (critexp.length == 0)
		    return
		var operator = "=\\";
		var operator = critexp.match(/= *\\?/)[0]
		critvals = critexp.split(operator);
		var criteria = critvals[0].trim(); 
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
	    var conditions_setOperator = function(criteria, operator) {
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
			$.each(item.values, function(indexval, value) {
			    if (indexval > 0)
				buffer += " , "
			    buffer += value
			});
		    }
		});
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
			expr[index]={"code":index, 
				     "def":item, 
				     "operator":"=", 
				     "values":[]};
			
			var condvalues = [];
			condvalues.push(["-- select --",""]);
			$.each(item, function(vindex, value) {
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
			    var block = editor.plugins.showblocks.getselectedblock(editor)
			    if (block && block.count()) {
				block = block.getItem(0);
				field.setValue(block.getAttribute('class'), false);
				parse_expression(field.getValue())
			    }
			}
		    }]
	    });
	    /*
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
	    */
	    return conditions
	    
	};

	return {
	    title: editor.lang.conditions[ 'title' ],
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
		var block, blocks = editor.plugins.showblocks.getselectedblock(editor)
		if (blocks)
		    for (var b = 0; b < blocks.count(); b++) {
			block = blocks.getItem(b);
			block.setAttribute('class',expr)
		    }
	    }
	};
    }
    
    CKEDITOR.dialog.add( 'editCondition', function(editor) {
	return condDialog(editor,'edit')
    });

    
})();
