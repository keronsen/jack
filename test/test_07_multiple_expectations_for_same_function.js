

describe('Setting different expectations for multiple calls to same function', {
	before_all: function() {
		jack.env.disableReporting();
	}
	,
	after_all: function() {
		jack.env.enableReporting();
	}
	,
	'Should register expectations and invocations for the right argument list': function() {
		window.globalFunctionOne = function() {}
		
		var ex = [];
		jack(function(){
			ex[0] = jack.expect("globalFunctionOne").exactly("5 times").withArguments("argValue1","argValue2");
			ex[1] = jack.expect("globalFunctionOne").exactly("6 times").withArguments("argValue3");
			ex[2] = jack.expect("globalFunctionOne").exactly("7 times").withArguments("argValue4","argValue5","argValue6");
			
			window.globalFunctionOne("argValue1","argValue2");
			window.globalFunctionOne("argValue1","argValue2");
			window.globalFunctionOne("argValue3");
			window.globalFunctionOne("argValue3");
			window.globalFunctionOne("argValue3");
			window.globalFunctionOne("argValue4","argValue5","argValue6");
			window.globalFunctionOne("argValue4","argValue5","argValue6");
			window.globalFunctionOne("argValue4","argValue5","argValue6");
			window.globalFunctionOne("argValue4","argValue5","argValue6");
		});
		
		value_of(jack.report("globalFunctionOne",ex[0]).expected).should_be(5);
		value_of(jack.report("globalFunctionOne",ex[1]).expected).should_be(6);
		value_of(jack.report("globalFunctionOne",ex[2]).expected).should_be(7);
		value_of(jack.report("globalFunctionOne",ex[0]).actual).should_be(2);
		value_of(jack.report("globalFunctionOne",ex[1]).actual).should_be(3);
		value_of(jack.report("globalFunctionOne",ex[2]).actual).should_be(4);
		
		window.globalFunctionOne = null;
	}
	,
	'Should report for all expectations': function() {
		window.globalFunctionOne = function() {}
		
		var ex = [];
		jack(function(){
			ex[0] = jack.expect("globalFunctionOne").exactly("5 times").withArguments("argValue1","argValue2");
			ex[1] = jack.expect("globalFunctionOne").exactly("6 times").withArguments("argValue3");
			ex[2] = jack.expect("globalFunctionOne").exactly("7 times").withArguments("argValue4","argValue5","argValue6");
		});
		
		value_of(jack.reportAll("globalFunctionOne")).should_have(3, "items");
		value_of(jack.reportAll("globalFunctionOne")[0].expected).should_be(5);
		
		window.globalFunctionOne = null;
	}
});
