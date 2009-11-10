

describe('Integration with YUI Test',{
	after_each: function() {
		window.YAHOO = null;
	}
	,
	'Should know when YUI Test is in environment': function() {
		window.YAHOO = { tool: { TestCase: function() {} } };
		value_of(jack.env.isYuiTest()).should_be_true();
	}
	,
	'Should know when YUI Test not is in environment': function() {
		value_of(jack.env.isYuiTest()).should_be_false();
	}
	,
	'Should report unmet expectations by calling YAHOO.util.Assert.fail(message)': function() {
		var actualMessage = "";
		var called = 0;
		window.YAHOO = { 
			tool: { 
				TestCase: function() {} 
			},
			util: { 
				Assert: { 
					fail: function(message) {
						called++;
						actualMessage = message;
					} 
				}
			}
		};

		window.globalFunction = function() {};
		jack(function(){
			jack.expect("globalFunction").once();
		});

		value_of(called).should_be(1);
		value_of(actualMessage).should_be("Expectation failed: globalFunction() expected exactly 1 time, called 0 times");
	}
});
