

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
		value_of(report.actual).should_be(3);
		value_of(report.success).should_be_true();
	}
	,
	'Should detect wrong number of calls': function() {
		var someData = "Not important for the test";
		
		jack(function(){
			var myStack = jack.create("myStack", ["push","pop"]);
			myStack.push(someData);
			jack.verify("myStack.push").atLeast("2 times");
		});
		
		var report = jack.report("myStack.push");
		value_of(report.expected).should_be(2);
		value_of(report.actual).should_be(1);
		value_of(report.success).should_be_false();
	}
	,
	'Should verify multiple calls with separate argument sets': function() {
		jack(function() {
			var myStack = jack.create("myStack", ["push","pop"]);
			myStack.push("First element");
			myStack.push("Second element");
			myStack.push("Second element");
			jack.verify("myStack.push").exactly("1 time").whereArgument(0).is("First element");
			jack.verify("myStack.push").exactly("2 times").whereArgument(0).is("Second element");
		});
		
		var report = jack.report("myStack.push");
		value_of(report.success).should_be_true();
	}
	,
	'Should verify mismatch in multiple calls with separate argument sets': function() {
		jack(function() {
			var myStack = jack.create("myStack", ["push","pop"]);
			myStack.push("First element");
			myStack.push("Second element");
			myStack.push("Second element");
			jack.verify("myStack.push").exactly("1 time").whereArgument(0).is("First element");
			jack.verify("myStack.push").exactly("1 times").whereArgument(0).is("Second element");
		});
		
		var report = jack.report("myStack.push");
		value_of(report.success).should_be_true();
	}
	

});
