

describe('Integration with Qunit',{
	after_each: function() {
		window.QUnit = null;
	}
	,
	'Should know when Qunit is in environment': function() {
		window.QUnit = "";
		value_of(jack.env.isQunit()).should_be_true();
	}
	,
	'Should know when Qunit not is in environment': function() {
		value_of(jack.env.isQunit()).should_be_false();
	}
	,
	'Should report unmet expectations by calling ok(false, message)': function() {
		var message = {m:'not called'};
		var called = 0;
		window.QUnit = "";
		window.ok = function(bool, message2) {
			called++;
			message.m = message2;
		};
		window.globalFunction = function() {};
		jack(function(){
				jack.expect("globalFunction").once();
			});

		value_of(called).should_be(1);
		value_of(message.m).should_be("Expectation failed: globalFunction() expected exactly 1 time, called 0 times");

		window.globalFunction = null;
		window.ok = null;
	}
});
