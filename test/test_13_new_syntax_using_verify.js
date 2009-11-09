

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
			jack.verify("myStack.push").atLeast("2 times");
		});
		
		var report = jack.report("myStack.push");
		value_of(report.expected).should_be(2);
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
	,
	'Should setup stub behaviour with when()': function() {
		jack(function() {
			var expected = "The expected return value";
			var myStack = jack.create("myStack", ["push","pop"]);
			jack.when("myStack.pop").returnValue(expected);
			value_of(myStack.pop()).should_be(expected);
		});
	}
	,
	'Should setup argument matching with when()': function() {
		jack(function() {
			var list = jack.create("list", ["get"]);
			jack.when("list.get").whereArgument(0).is(0).returnValue("First");
			jack.when("list.get").whereArgument(0).is(1).returnValue("Second");
			value_of(list.get(1)).should_be("Second");
			value_of(list.get(0)).should_be("First");
		});
	}
	,
	'Should not require the funciton to be called only because it has been used with when()': function() {
		jack(function() {
			var list = jack.create("list", ["get"]);
			jack.when("list.get").whereArgument(0).is(0).returnValue("First");
		});
		
		var report = jack.report("list.get");
		value_of(report.success).should_be_true();
	}
	,
	'Should be able to verify() a function that has been set up with when()': function() {
		jack(function() {
			var list = jack.create("list", ["get"]);
			jack.when("list.get").whereArgument(0).is(0).returnValue("First");
			
			list.get(0);
			list.get(3);
			
			jack.verify("list.get").exactly("3 times");
		});
		
		var report = jack.reportAll("list.get");
		value_of(report[0].success).should_be_true();
		value_of(report[1].expected).should_be(3);
		value_of(report[1].actual).should_be(2);
		value_of(report[1].success).should_be_false();
	}

});
