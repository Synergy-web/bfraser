/*
 * Inline Form Validation Engine 1.4, jQuery plugin
 * 
 * Copyright(c) 2009, Cedric Dugas
 * http://www.position-relative.net
 *	
 * Form validation engine which allow custom regex rules to be added.
 * Licenced under the MIT Licence
 */
 
 
(function($) {
	$.fn.validationEngine = function(settings) {

	allRules = $.validationEngine.allRules;
 	settings = jQuery.extend({
		allrules:allRules,					
		inlineValidation: true,	
		ajaxSubmit: false,
		promptPosition: "topRight",	// OPENNING BOX POSITION, IMPLEMENTED: topLeft, topRight, bottomLeft, centerRight, bottomRight
		success : false,
		failure : function() {}
	}, settings);	
	
	
 
	$.validationEngine.ajaxValidArray = new Array()	// ARRAY FOR AJAX: VALIDATION MEMORY 

	$(this).bind("submit", function(caller){   // ON FORM SUBMIT, CONTROL AJAX FUNCTION IF SPECIFIED ON DOCUMENT READY
		$.validationEngine.onSubmitValid = true;
		
		if($.validationEngine.submitValidation(this,settings) == false){
			if($.validationEngine.submitForm(this,settings) == true) {return false;}
		}else{
			settings.failure && settings.failure(); 
			return false;
		}		
	})
	if(settings.inlineValidation == true){ 		// Validating Inline ?
		
		$(this).find("[class^=validate]").not("[type=checkbox]").bind("blur", function(caller){	_inlinEvent(this)   })
		$(this).find("[class^=validate][type=checkbox]").bind("click", function(caller){		_inlinEvent(this)   })
		
			function _inlinEvent(caller){
				if($.validationEngine.intercept == false || !$.validationEngine.intercept){		// STOP INLINE VALIDATION THIS TIME ONLY
					$.validationEngine.onSubmitValid=false;
					$.validationEngine.loadValidation(caller,settings); 
				}else{
					$.validationEngine.intercept = false;
				}
			}
	}
};	
$.validationEngine = {
	submitForm : function(caller){
		if($.validationEngine.settings.ajaxSubmit){		
			var prev_val=$(".valForm").find("input[type=submit]").val();
			var lang="en";
           	        $(".valForm").find("input[type=submit]").val( (lang=="ru"?"Пожалуйста, подождите":lang=="en"?"Please wait":"Будь ласка, зачекайте")+"...").attr('disabled', 'disabled');
           	        //alert($.validationEngine.settings.ajaxSubmitFile+"\n"+$(caller).serialize());
           	        //alert($.validationEngine.settings.ajaxSubmitFile);
			$.ajax({
			   	type: "POST",
			   	url: $.validationEngine.settings.ajaxSubmitFile,
			   	async: true,
			   	data: $(caller).serialize(),
			   	beforeSend: function(){			   			
				   		
			  	 	},
                error:function (xhr, ajaxOptions, thrownError){
                    alert("Error: "+xhr.status+" "+thrownError);
                },
			   	success: function(data){
			   		if(data == "true" || 1){			// EVERYTING IS FINE, SHOW SUCCESS MESSAGE
			   			$(caller).css("opacity",1)
			   			$(caller).animate({opacity: 0}, function(){
			   				$(caller).css("display","none")
			   				$(caller).before("<div class='ajaxSubmit'>"+data+"</div>")
			   				$.validationEngine.closePrompt(".formError",true) 	
	$(".retry").click(function () {
		$(caller).css("opacity", 1).fadeIn(1000);
		$(".ajaxSubmit").hide().remove();
		$("#captcha").val("");
		$(".valForm").find("input[type=submit]").val(prev_val).removeAttr('disabled');
		return false;
	});
			   				$(".ajaxSubmit").show("slow")
			   				if ($.validationEngine.settings.success){	// AJAX SUCCESS, STOP THE LOCATION UPDATE
								$.validationEngine.settings.success && $.validationEngine.settings.success(); 
								return false;
							}
			   			})
		   			}else{						// HOUSTON WE GOT A PROBLEM (SOMETING IS NOT VALIDATING)
			   			data = eval( "("+data+")");	
			   			errorNumber = data.jsonValidateReturn.length	
			   			for(index=0; index<errorNumber; index++){	
			   				fieldId = data.jsonValidateReturn[index][0];
			   				promptError = data.jsonValidateReturn[index][1];
			   				type = data.jsonValidateReturn[index][2];
			   				$.validationEngine.buildPrompt(fieldId,promptError,type);
		   				}
	   				}
   				}
			})	
			return true;
		}
		if ($.validationEngine.settings.success){	// AJAX SUCCESS, STOP THE LOCATION UPDATE
			$.validationEngine.settings.success && $.validationEngine.settings.success(); 
			return true;
		}
		return false;
	},
	buildPrompt : function(caller,promptText,type,ajaxed) {			// ERROR PROMPT CREATION AND DISPLAY WHEN AN ERROR OCCUR
		var divFormError = document.createElement('div');
		var formErrorContent = document.createElement('div');
		
		linkTofield = $(caller).attr("id") + "formError";
		linkTofield = linkTofield.replace("[",""); linkTofield = linkTofield.replace("]","");
		
		$(divFormError).addClass("formError")
		
		if(type == "pass"){ $(divFormError).addClass("greenPopup") }
		if(type == "load"){ $(divFormError).addClass("blackPopup") }
		if(ajaxed){ $(divFormError).addClass("ajaxed") }
		
		$(divFormError).addClass(linkTofield)
		$(formErrorContent).addClass("formErrorContent")
		
		$("body").append(divFormError)
		$(divFormError).append(formErrorContent)
			
		if($.validationEngine.showTriangle != false){		// NO TRIANGLE ON MAX CHECKBOX AND RADIO
			var arrow = document.createElement('div')
			$(arrow).addClass("formErrorArrow")
			$(divFormError).append(arrow)
			if($.validationEngine.settings.promptPosition == "bottomLeft" || $.validationEngine.settings.promptPosition == "bottomRight"){
			$(arrow).addClass("formErrorArrowBottom")
			$(arrow).html('<div class="line1"><!-- --></div><div class="line2"><!-- --></div><div class="line3"><!-- --></div><div class="line4"><!-- --></div><div class="line5"><!-- --></div><div class="line6"><!-- --></div><div class="line7"><!-- --></div><div class="line8"><!-- --></div><div class="line9"><!-- --></div><div class="line10"><!-- --></div>');
		}
			if($.validationEngine.settings.promptPosition == "topLeft" || $.validationEngine.settings.promptPosition == "topRight"){
				$(divFormError).append(arrow)
				$(arrow).html('<div class="line10"><!-- --></div><div class="line9"><!-- --></div><div class="line8"><!-- --></div><div class="line7"><!-- --></div><div class="line6"><!-- --></div><div class="line5"><!-- --></div><div class="line4"><!-- --></div><div class="line3"><!-- --></div><div class="line2"><!-- --></div><div class="line1"><!-- --></div>');
			}
		}
		$(formErrorContent).html(promptText)
	
		callerTopPosition = $(caller).offset().top;
		callerleftPosition = $(caller).offset().left;
		callerWidth =  $(caller).width()
		inputHeight = $(divFormError).height()
	
		/* POSITIONNING */
		if($.validationEngine.settings.promptPosition == "topRight"){callerleftPosition +=  callerWidth -30; callerTopPosition += -inputHeight -10; }
		if($.validationEngine.settings.promptPosition == "topLeft"){ callerTopPosition += -inputHeight -10; }
		
		if($.validationEngine.settings.promptPosition == "centerRight"){ callerleftPosition +=  callerWidth +13; }
		
		if($.validationEngine.settings.promptPosition == "bottomLeft"){
			callerHeight =  $(caller).height();
			callerleftPosition = callerleftPosition;
			callerTopPosition = callerTopPosition + callerHeight + 15;
		}
		if($.validationEngine.settings.promptPosition == "bottomRight"){
			callerHeight =  $(caller).height();
			callerleftPosition +=  callerWidth -30;
			callerTopPosition +=  callerHeight + 15;
		}
		$(divFormError).css({
			top:callerTopPosition,
			left:callerleftPosition,
			opacity:0
		})
		return $(divFormError).animate({"opacity":0.87},function(){return true;});	
	},
	updatePromptText : function(caller,promptText,type,ajaxed) {	// UPDATE TEXT ERROR IF AN ERROR IS ALREADY DISPLAYED
		
		linkTofield = $(caller).attr("id") + "formError";
		linkTofield = linkTofield.replace("[",""); linkTofield = linkTofield.replace("]","");
		
		var updateThisPrompt =  "."+ linkTofield;
		
		if(type == "pass") { $(updateThisPrompt).addClass("greenPopup") }else{ $(updateThisPrompt).removeClass("greenPopup")};
		if(type == "load") { $(updateThisPrompt).addClass("blackPopup") }else{ $(updateThisPrompt).removeClass("blackPopup")};
		if(ajaxed) { $(updateThisPrompt).addClass("ajaxed") }else{ $(updateThisPrompt).removeClass("ajaxed")};
	
		$(updateThisPrompt).find(".formErrorContent").html(promptText)
		callerTopPosition  = $(caller).offset().top;
		inputHeight = $(updateThisPrompt).height()
		
		if($.validationEngine.settings.promptPosition == "bottomLeft" || $.validationEngine.settings.promptPosition == "bottomRight"){
			callerHeight =  $(caller).height()
			callerTopPosition =  callerTopPosition + callerHeight + 15
		}
		if($.validationEngine.settings.promptPosition == "centerRight"){  callerleftPosition +=  callerWidth +13;}
		if($.validationEngine.settings.promptPosition == "topLeft" || $.validationEngine.settings.promptPosition == "topRight"){
			callerTopPosition = callerTopPosition  -inputHeight -10
		}
		$(updateThisPrompt).animate({
			top:callerTopPosition
		});
	},
	loadValidation : function(caller,settings) {		// GET VALIDATIONS TO BE EXECUTED
		$.validationEngine.settings = settings
		rulesParsing = $(caller).attr('class');
		rulesRegExp = /\[(.*)\]/;
		getRules = rulesRegExp.exec(rulesParsing);
		str = getRules[1]
		pattern = /\W+/;
		result= str.split(pattern);	
	
		var validateCalll = $.validationEngine.validateCall(caller,result)
		return validateCalll
	},
	validateCall : function(caller,rules) {	// EXECUTE VALIDATION REQUIRED BY THE USER FOR THIS FIELD
		var promptText =""	
		var prompt = $(caller).attr("id");
		var caller = caller;
		ajaxValidate = false
		var callerName = $(caller).attr("name")
		$.validationEngine.isError = false;
		$.validationEngine.showTriangle = true
		callerType = $(caller).attr("type");

		for (i=0; i<rules.length;i++){
			switch (rules[i]){
			case "optional": 
				if(!$(caller).val()){
					$.validationEngine.closePrompt(caller)
					return $.validationEngine.isError
				}
			break;
			case "required": 
				_required(caller,rules,i);
			break;
			case "custom": 
				 _customRegex(caller,rules,i);
			break;
			case "ajax": 
				if(!$.validationEngine.onSubmitValid){
					_ajax(caller,rules,i);	
				}
			break;
			case "length": 
				 _length(caller,rules,i);
			break;
			case "maxCheckbox": 
				_maxCheckbox(caller,rules,i);
			 	groupname = $(caller).attr("name");
			 	caller = $("input[name='"+groupname+"']")
			break;
			case "minCheckbox": 
				_minCheckbox(caller,rules,i);
				groupname = $(caller).attr("name");
			 	caller = $("input[name='"+groupname+"']")
			break;
			case "confirm": 
				 _confirm(caller,rules,i);
			break;
			case "or": 
				 _or(caller,rules,i);
			break;
			case "title": 
				 _title(caller,rules,i);
			break;
			default :;
			};
		};
		if ($.validationEngine.isError == true){
			
			radioHackOpen();
			if ($.validationEngine.isError == true){ // show only one

				($("div."+prompt+"formError").size() ==0) ? $.validationEngine.buildPrompt(caller,promptText,"error")	: $.validationEngine.updatePromptText(caller,promptText);
			}
		}else{
			radioHackClose();
			$.validationEngine.closePrompt(caller);
		}		
		/* UNFORTUNATE RADIO AND CHECKBOX GROUP HACKS */
		/* As my validation is looping input with id's we need a hack for my validation to understand to group these inputs */
		function radioHackOpen(){
	
			if($("input[name="+callerName+"]").size()> 1 && callerType == "radio") {		// Hack for radio group button, the validation go the first radio
				caller = $("input[name="+callerName+"]:first");
				$.validationEngine.showTriangle = false;
				var callerId ="."+ $(caller).attr("id")+"formError";
				if($(callerId).size()==0){ $.validationEngine.isError = true; }else{ $.validationEngine.isError = false;}
			}
			if($("input[name="+callerName+"]").size()> 1 && callerType == "checkbox") {		// Hack for checkbox group button, the validation go the first radio
				caller = $("input[name="+callerName+"]:first");
				$.validationEngine.showTriangle = false;
				var callerId ="div."+ $(caller).attr("id")+"formError";
				if($(callerId).size()==0){ $.validationEngine.isError = true; }else{ $.validationEngine.isError = false;}
			}
		}
		function radioHackClose(){
			if($("input[name="+callerName+"]").size()> 1 && callerType == "radio") {		// Hack for radio group button, the validation go the first radio
				caller = $("input[name="+callerName+"]:first");
			}
			if($("input[name="+callerName+"]").size()> 1 && callerType == "checkbox") {		// Hack for checkbox group button, the validation go the first radio
				caller = $("input[name="+callerName+"]:first");
			}
		}
		/* VALIDATION FUNCTIONS */
		function _required(caller,rules,position){   // VALIDATE BLANK FIELD
			callerType = $(caller).attr("type");
			if (callerType == "text" || callerType == "password" || callerType == "textarea"){
								
				if(!$(caller).val()){
					$.validationEngine.isError = true;					
					t=$(caller).attr('title');
					if (t) {
					   t=t.charAt(0).toLowerCase() + t.slice(1);
      				promptText += $.validationEngine.settings.allrules[rules[i]].alertTextTitle+t+"<br />";
					}
					else {
      				promptText += $.validationEngine.settings.allrules[rules[i]].alertText+"<br />";
					}
				}	
			}	
			if (callerType == "radio" || callerType == "checkbox" ){
				callerName = $(caller).attr("name");
		
				if($("input[name="+callerName+"]:checked").size() == 0) {
					$.validationEngine.isError = true;
					if($("input[name="+callerName+"]").size() ==1) {
						promptText += $.validationEngine.settings.allrules[rules[i]].alertTextCheckboxe+"<br />"; 
					}else{
						 promptText += $.validationEngine.settings.allrules[rules[i]].alertTextCheckboxMultiple+"<br />";
					}	
				}
			}	
			if (callerType == "select-one") { // added by paul@kinetek.net for select boxes, Thank you
					callerName = $(caller).attr("id");
				
				if(!$("select[name="+callerName+"]").val()) {
					$.validationEngine.isError = true;
					promptText += $.validationEngine.settings.allrules[rules[i]].alertText+"<br />";
				}
			}
			if (callerType == "select-multiple") { // added by paul@kinetek.net for select boxes, Thank you
					callerName = $(caller).attr("id");
				
				if(!$("#"+callerName).val()) {
					$.validationEngine.isError = true;
					promptText += $.validationEngine.settings.allrules[rules[i]].alertText+"<br />";
				}
			}
		}
		function _customRegex(caller,rules,position){		 // VALIDATE REGEX RULES
			customRule = rules[position+1];
			pattern = eval($.validationEngine.settings.allrules[customRule].regex);
			
			if($(caller).attr('value') && !pattern.test($(caller).attr('value'))){
				$.validationEngine.isError = true;
				promptText += $.validationEngine.settings.allrules[customRule].alertText+"<br />";
			}
		}
		function _ajax(caller,rules,position){				 // VALIDATE AJAX RULES
			
			customAjaxRule = rules[position+1];
			postfile = $.validationEngine.settings.allrules[customAjaxRule].file;
			fieldValue = $(caller).val();
			ajaxCaller = caller;
			fieldId = $(caller).attr("id");
			ajaxValidate = true;
			ajaxisError = $.validationEngine.isError;
			
			/* AJAX VALIDATION HAS ITS OWN UPDATE AND BUILD UNLIKE OTHER RULES */	
			if(!ajaxisError){
				$.ajax({
				   	type: "POST",
				   	url: postfile,
				   	async: true,
				   	data: "validateValue="+fieldValue+"&validateId="+fieldId+"&validateError="+customAjaxRule,
				   	beforeSend: function(){		// BUILD A LOADING PROMPT IF LOAD TEXT EXIST		   			
				   		if($.validationEngine.settings.allrules[customAjaxRule].alertTextLoad){
				   		
				   			if(!$("div."+fieldId+"formError")[0]){				   				
	 			 				return $.validationEngine.buildPrompt(ajaxCaller,$.validationEngine.settings.allrules[customAjaxRule].alertTextLoad,"load");
	 			 			}else{
	 			 				$.validationEngine.updatePromptText(ajaxCaller,$.validationEngine.settings.allrules[customAjaxRule].alertTextLoad,"load");
	 			 			}
			   			}
			  	 	},
					success: function(data){					// GET SUCCESS DATA RETURN JSON
						data = eval( "("+data+")");				// GET JSON DATA FROM PHP AND PARSE IT
						ajaxisError = data.jsonValidateReturn[2];
						customAjaxRule = data.jsonValidateReturn[1];
						ajaxCaller = $("#"+data.jsonValidateReturn[0])[0];
						fieldId = ajaxCaller;
						ajaxErrorLength = $.validationEngine.ajaxValidArray.length
						existInarray = false;
						
			 			 if(ajaxisError == "false"){			// DATA FALSE UPDATE PROMPT WITH ERROR;
			 			 	
			 			 	_checkInArray(false)				// Check if ajax validation alreay used on this field
			 			 	
			 			 	if(!existInarray){		 			// Add ajax error to stop submit		 		
				 			 	$.validationEngine.ajaxValidArray[ajaxErrorLength] =  new Array(2)
				 			 	$.validationEngine.ajaxValidArray[ajaxErrorLength][0] = fieldId
				 			 	$.validationEngine.ajaxValidArray[ajaxErrorLength][1] = false
				 			 	existInarray = false;
			 			 	}
				
			 			 	$.validationEngine.ajaxValid = false;
							promptText += $.validationEngine.settings.allrules[customAjaxRule].alertText+"<br />";
							$.validationEngine.updatePromptText(ajaxCaller,promptText,"",true);				
						 }else{	 
						 	_checkInArray(true)
					
						 	$.validationEngine.ajaxValid = true; 						   
	 			 			if($.validationEngine.settings.allrules[customAjaxRule].alertTextOk){	// NO OK TEXT MEAN CLOSE PROMPT	 			
	 			 				 				$.validationEngine.updatePromptText(ajaxCaller,$.validationEngine.settings.allrules[customAjaxRule].alertTextOk,"pass",true);
 			 				}else{
				 			 	ajaxValidate = false;		 	
				 			 	$.validationEngine.closePrompt(ajaxCaller);
 			 				}		
			 			 }
				 			function  _checkInArray(validate){
				 				for(x=0;x<ajaxErrorLength;x++){
				 			 		if($.validationEngine.ajaxValidArray[x][0] == fieldId){
				 			 			$.validationEngine.ajaxValidArray[x][1] = validate
				 			 			existInarray = true;
				 			 		
				 			 		}
				 			 	}
				 			}
			 		}				
				});
			}
		}
		function _confirm(caller,rules,position){		 // VALIDATE FIELD MATCH
			confirmField = rules[position+1];
			
			if($(caller).attr('value') != $("#"+confirmField).attr('value')){
				$.validationEngine.isError = true;
				promptText += $.validationEngine.settings.allrules["confirm"].alertText+"<br />";
			}
		}
		function _or(caller,rules,position){		 // VALIDATE FIELD MATCH
			confirmField = rules[position+1];
			if ($.validationEngine.first) {
			   $.validationEngine.first=0;
			}
			else {
			   $.validationEngine.first=1;
			}
			e1=$(caller);
			e2=$("#"+confirmField);
			if (!e1.attr('value') && !e2.attr('value')) {
				$.validationEngine.isError = true;
				t=e1.attr('title');
				t=t.charAt(0).toLowerCase()+t.slice(1);
				if ($.validationEngine.first) {
				   promptText += $.validationEngine.settings.allrules["or"].alertText+"<br />";
				   promptText += $.validationEngine.settings.allrules["or"].alertText2+t+"<br />";
				}
				else {
				   promptText += $.validationEngine.settings.allrules["or"].alertText3+"<br />";
				   promptText += $.validationEngine.settings.allrules["or"].alertText2+t+"<br />";
				}
			}
			
		}
		function _title(caller,rules,position){		 // VALIDATE FIELD MATCH
			confirmField = rules[position+1];
			alert(confirmField);
			return;
			
			if($(caller).attr('value') != $("#"+confirmField).attr('value')){
				$.validationEngine.isError = true;
				promptText += $.validationEngine.settings.allrules["confirm"].alertText+"<br />";
			}
		}
		function _length(caller,rules,position){    	  // VALIDATE LENGTH
		
			startLength = eval(rules[position+1]);
			endLength = eval(rules[position+2]);
			feildLength = $(caller).attr('value').length;

			if(feildLength<startLength || feildLength>endLength){
				$.validationEngine.isError = true;
				promptText += $.validationEngine.settings.allrules["length"].alertText+startLength+$.validationEngine.settings.allrules["length"].alertText2+endLength+$.validationEngine.settings.allrules["length"].alertText3+"<br />"
			}
		}
		function _maxCheckbox(caller,rules,position){  	  // VALIDATE CHECKBOX NUMBER
		
			nbCheck = eval(rules[position+1]);
			groupname = $(caller).attr("name");
			groupSize = $("input[name='"+groupname+"']:checked").size();
			if(groupSize > nbCheck){	
				$.validationEngine.showTriangle = false
				$.validationEngine.isError = true;
				promptText += $.validationEngine.settings.allrules["maxCheckbox"].alertText+"<br />";
			}
		}
		function _minCheckbox(caller,rules,position){  	  // VALIDATE CHECKBOX NUMBER
		
			nbCheck = eval(rules[position+1]);
			groupname = $(caller).attr("name");
			groupSize = $("input[name='"+groupname+"']:checked").size();
			if(groupSize < nbCheck){	
				$.validationEngine.isError = true;
				$.validationEngine.showTriangle = false;
				promptText += $.validationEngine.settings.allrules["minCheckbox"].alertText+" "+nbCheck+" "+$.validationEngine.settings.allrules["minCheckbox"].alertText2+"<br />";
			}
		}
		return($.validationEngine.isError) ? $.validationEngine.isError : false;
	},
	closePrompt : function(caller,outside) {						// CLOSE PROMPT WHEN ERROR CORRECTED
		if(outside){
			$(caller).fadeTo("fast",0,function(){
				$(caller).remove();
			});
			return false;
		}
		if(!ajaxValidate){
			linkTofield = $(caller).attr("id") + "formError";
			linkTofield = linkTofield.replace("[",""); linkTofield = linkTofield.replace("]","");
			
			closingPrompt = "."+linkTofield;
	
			$(closingPrompt).fadeTo("fast",0,function(){
				$(closingPrompt).remove();
			});
		}
	},
	submitValidation : function(caller,settings) {					// FORM SUBMIT VALIDATION LOOPING INLINE VALIDATION
		var stopForm = false;
		$.validationEngine.settings = settings
		$.validationEngine.ajaxValid = true
		$(caller).find(".formError").remove();
		var toValidateSize = $(caller).find("[class^=validate]").size();
		
		$(caller).find("[class^=validate]").each(function(){
			callerId = $(this).attr("id")
			if(!$("."+callerId+"formError").hasClass("ajaxed")){	// DO NOT UPDATE ALREADY AJAXED FIELDS (only happen if no normal errors, don't worry)
				var validationPass = $.validationEngine.loadValidation(this,settings);
				return(validationPass) ? stopForm = true : "";					
			}
		});
		ajaxErrorLength = $.validationEngine.ajaxValidArray.length		// LOOK IF SOME AJAX IS NOT VALIDATE
		for(x=0;x<ajaxErrorLength;x++){
	 		if($.validationEngine.ajaxValidArray[x][1] == false){
	 			$.validationEngine.ajaxValid = false
	 		}
	 	}
		if(stopForm || !$.validationEngine.ajaxValid){		// GET IF THERE IS AN ERROR OR NOT FROM THIS VALIDATION FUNCTIONS
			destination = $(".formError:not('.greenPopup'):first").offset().top;
			$("html:not(:animated)"+( ! $.browser.opera ? ",body:not(:animated)" : "")).animate({ scrollTop: destination}, 1100);
			return true;
		}else{
			return false
		}
	}
}	
})(jQuery);
