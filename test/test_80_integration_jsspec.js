

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
	
	
	/***************
	  FOR SOME REASON SUDDENLY UNABLE TO TEST THIS...
	,
	'Should report unmet expectations by throwing an exeption and storing it for JSSpec (NORMAL BROWSERS) [[!JSSpec.Browser.Trident]]': function() {
		var actualException = null;
		var actualAssertionFailure = null;
		try {
			window.globalFunction = function() {};
			jack(function(){
				jack.grab("globalFunction");
				jack.expect("globalFunction").once();
			});
		} catch(ex) {
			actualException = ex;
			actualAssertionFailure = JSSpec._assertionFailure;
			JSSpec._assertionFailure = null;
		}

		var expectedObject = {message:"Expectation failed: globalFunction() was expected 1 time(s), but was called 0 time(s)."};
		value_of(actualException).should_be(expectedObject);
		value_of(actualAssertionFailure).should_be(expectedObject);
		
		window.globalFunction = null;
	}
	,
	'Should report unmet expectations by throwing an exeption and storing it for JSSpec (INTERNET EXPLORER) [[JSSpec.Browser.Trident]]': function() {
		window.globalFunction = function() {};
		var calledWithExecutor;
		var calledWithException;
		var storedOnException = this.onException;
		this.onException = function(executor,exception) {
			calledWithExecutor = executor;
			calledWithException = exception;
		}
		jack(function(){
			jack.grab("globalFunction");
			jack.expect("globalFunction").once();
		});
		this.onException = storedOnException;
		var actualAssertionFailure = JSSpec._assertionFailure;
		JSSpec._assertionFailure = null;
		
		var expectedObject = {message:"Expectation failed: globalFunction() was expected 1 time(s), but was called 0 time(s)."};
		value_of(actualAssertionFailure).should_be(expectedObject);
		value_of(calledWithException).should_be(expectedObject);
		value_of(calledWithExecutor).should_be(this);
		
		window.globalFunction = null;
	}
	**************/
});
