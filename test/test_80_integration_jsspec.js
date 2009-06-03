

describe('Integration with JSSpec',{
	'Should know when JSSpec is in environment': function() {
		value_of(jack.env.isJSSpec()).should_be_true();
	}
	,
	'Should know when JSSpec not is in environment': function() {
		var _jsspec = window.JSSpec;
		window.JSSpec = null;
		var result = jack.env.isJSSpec();
		window.JSSpec = _jsspec;
		value_of(result).should_be_false();
	}
	,
	'Should report unmet expectations by throwing an exeption': function() {
		window.globalFunction = function() {}
		var actualException = null;
		
		try {
			window.globalFunction = function() {};
			jack(function(){
				jack.expect("globalFunction").once();
			});
		} catch(ex) {
			actualException = ex;
		}
		
		value_of(actualException.message).should_be("Expectation failed: globalFunction() expected exactly 1 time, called 0 times");
		
		window.globalFunction = null;
	}
});
