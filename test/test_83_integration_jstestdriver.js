

describe('Integration with JsTestDriver',{
	after_each: function() {
		window.jstestdriver = null;
	}
	,
	'Should know when JsTestDriver is in environment': function() {
		window.jstestdriver = {};
		value_of(jack.env.isJsTestDriver()).should_be_true();
	}
	,
	'Should know when JsTestDriver not is in environment': function() {
		value_of(jack.env.isJsTestDriver()).should_be_false();
	}
	,
	'Should report unmet expectations by calling fail(message)': function() {
		var actualMessage = "";
		var called = 0;
		window.jstestdriver = {};
		window.fail = function(message) {
			called++;
			actualMessage = message;
		};
		window.globalFunction = function() {};
		jack(function(){
			jack.expect("globalFunction").once();
		});

		value_of(called).should_be(1);
		value_of(actualMessage).should_be("Expectation failed: globalFunction() expected exactly 1 time, called 0 times");

		window.globalFunction = null;
		window.fail = null;
	}
});
