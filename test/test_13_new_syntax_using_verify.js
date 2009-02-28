
/*

describe('Using verify() instead of expect() for objects created with jack.create()', {
	before_all: function() {
		jack.env.disableReporting();
	}
	,
	after_all: function() {
		jack.env.enableReporting();
	}
	,
	'Should verify correct number of calls': function() {
		var someData = "Not important for the test";
		
		jack(function(){
			var myStack = jack.create("myStack", ["push","pop"]);
			myStack.push(someData);
			myStack.push(someData);
			myStack.push(someData);
			jack.verify("myStack.push").atLeast("3 times");
		});
		
		var report = jack.report("myStack.push");
		value_of(report.expected).should_be(3);
		value_of(report.success).should_be_true();
	}
	
	
	/*
	,
	'Should be able to specify a minimum number of expected calls (Example 2)': function() {
		window.globalFunction = function() {}
		
		jack(function(){
			jack.expect("globalFunction").atLeast("3 times");
			window.globalFunction();
			window.globalFunction();
			window.globalFunction();
		});
		
		var report = jack.report("globalFunction");
		value_of(report.expected).should_be(3);
		value_of(report.success).should_be_true();
		
		window.globalFunction = null;
	}
	,
	'Should be able to specify a minimum number of expected calls (Example 3)': function() {
		window.globalFunction = function() {}
		
		jack(function(){
			jack.expect("globalFunction").atLeast("3 times");
			window.globalFunction();
		});
		
		var report = jack.report("globalFunction");
		value_of(report.expected).should_be(3);
		value_of(report.success).should_be_false();
		
		window.globalFunction = null;
	}
	,
	'Should be able to specify a maximum number of expected calls (Example 1)': function() {
		window.globalFunction = function() {}
		
		jack(function(){
			jack.expect("globalFunction").atMost("3 times");
			window.globalFunction();
			window.globalFunction();
			window.globalFunction();
			window.globalFunction();
		});
		
		var report = jack.report("globalFunction");
		value_of(report.expected).should_be(3);
		value_of(report.success).should_be_false();
		
		window.globalFunction = null;
	}
	,
	'Should be able to specify a maximum number of expected calls (Example 2)': function() {
		window.globalFunction = function() {}
		
		jack(function(){
			jack.expect("globalFunction").atMost("3 times");
			window.globalFunction();
			window.globalFunction();
			window.globalFunction();
		});
		
		var report = jack.report("globalFunction");
		value_of(report.expected).should_be(3);
		value_of(report.success).should_be_true();
		
		window.globalFunction = null;
	}
	,
	'Should be able to specify a maximum number of expected calls (Example 3)': function() {
		window.globalFunction = function() {}
		
		jack(function(){
			jack.expect("globalFunction").atMost("3 times");
			window.globalFunction();
			window.globalFunction();
		});
		
		var report = jack.report("globalFunction");
		value_of(report.expected).should_be(3);
		value_of(report.success).should_be_true();
		
		window.globalFunction = null;
	}
	*/
});

*/