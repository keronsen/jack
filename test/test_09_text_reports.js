

describe('Text reports', {
	before_all: function() {
		jack.env.disableReporting();
	}
	,
	after_all: function() {
		jack.env.enableReporting();
	}
	,
	'Report for number of calls (exact)': function() {
		window.globalFunction = function() {};
		jack(function(){
			jack.expect("globalFunction").exactly("1 time");
		});
		value_of(jack.reportAll("globalFunction")[0].message)
			.should_be("Expectation failed: globalFunction() expected exactly 1 time, called 0 times");
		window.globalFunction = null;
	}
	,
	'Report for number of calls (at least)': function() {
		window.globalFunction = function() {};
		jack(function(){
			jack.expect("globalFunction").atLeast("3 times");
			globalFunction();
			globalFunction();
		});
		value_of(jack.reportAll("globalFunction")[0].message)
			.should_be("Expectation failed: globalFunction() expected at least 3 times, called 2 times");
		window.globalFunction = null;
	}
	,
	'Report for number of calls (at most)': function() {
		window.globalFunction = function() {};
		jack(function(){
			jack.expect("globalFunction").atMost("2 times");
			globalFunction();
			globalFunction();
			globalFunction();
			globalFunction();
		});
		value_of(jack.reportAll("globalFunction")[0].message)
			.should_be("Expectation failed: globalFunction() expected at most 2 times, called 4 times");
		window.globalFunction = null;
	}
	,
	'Report correct name for object grabs': function() {
		window.globalObject = function() {};
		window.globalObject.globalFunction = function() {};
		jack(function(){
			jack.expect("globalObject").exactly("1 time");
			jack.expect("globalObject.globalFunction").exactly("1 time");
		});
		value_of(jack.reportAll("globalObject").length).should_be(1);
		value_of(jack.reportAll("globalObject.globalFunction")[0].message)
			.should_be("Expectation failed: globalObject.globalFunction() expected exactly 1 time, called 0 times");
		window.globalObject = null;
	}
	,
	'Report values for is() constraints': function() {
		window.globalFunction = function() {};
		jack(function(){
			jack.expect("globalFunction")
				.exactly("1 time")
				.whereArgument(0).is("foo")
				.whereArgument(1).is(true)
				.whereArgument(2).is(1001);
		});
		value_of(jack.reportAll("globalFunction")[0].message)
			.should_be("Expectation failed: globalFunction('foo', true, 1001) expected exactly 1 time, called 0 times");
		window.globalFunction = null;
	}
	,
	'Report values for isNot() constraints': function() {
		window.globalFunction = function() {};
		jack(function(){
			jack.expect("globalFunction")
				.exactly("1 time")
				.whereArgument(0).isNot("foo")
				.whereArgument(1).isNot(true)
				.whereArgument(2).isNot(1001);
		});
		value_of(jack.reportAll("globalFunction")[0].message)
			.should_be("Expectation failed: globalFunction(not:'foo', not:true, not:1001) expected exactly 1 time, called 0 times");
		window.globalFunction = null;
	}
	,
	'Report values for isOneOf() constraints': function() {
		window.globalFunction = function() {};
		jack(function(){
			jack.expect("globalFunction")
				.exactly("1 time")
				.whereArgument(0).isOneOf("foo",true,1001)
				.whereArgument(1).isOneOf(false,3002,"bar");
		});
		value_of(jack.reportAll("globalFunction")[0].message)
			.should_be("Expectation failed: globalFunction(oneOf:['foo',true,1001], oneOf:[false,3002,'bar']) expected exactly 1 time, called 0 times");
		window.globalFunction = null;
	}
	,
	'Report [any] for arguments without constraints': function() {
		window.globalFunction = function() {};
		jack(function(){
			jack.expect("globalFunction")
				.exactly("1 time")
				.whereArgument(1).is("bar");
		});
		value_of(jack.reportAll("globalFunction")[0].message)
			.should_be("Expectation failed: globalFunction([any], 'bar') expected exactly 1 time, called 0 times");
		window.globalFunction = null;
	}
});
