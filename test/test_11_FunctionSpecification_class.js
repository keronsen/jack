

describe('FunctionSpecification class', {
	'Class should exist': function() {
		var spec = new jack.FunctionSpecification();
		value_of(spec).should_not_be_undefined();
	}
	,
	'Should have test() method': function() {
		var spec = new jack.FunctionSpecification();
		var result = spec.test();
		value_of(result).should_be_true();
	}
	,
	'Should specify that no arguments are expected': function() {
		var spec = new jack.FunctionSpecification();
		spec.withNoArguments();
		value_of(spec.test()).should_be_true();
		value_of(spec.test("foo")).should_be_false();
	}
	,
	'withArguments() should check for equality': function() {
		var spec = new jack.FunctionSpecification();
		spec.withArguments("argValue1","argValue2");
		value_of(spec.test("foo","bar")).should_be_false();
		value_of(spec.test("argValue1","argValue2")).should_be_true();
	}
	,
	'whereArgument(n) should return all available matchers from jack.matchers': function() {
		var spec = new jack.FunctionSpecification();
		var matchers = spec.whereArgument(0);
		value_of(matchers).should_not_be_undefined();
		for(var m in jack.matchers) {
			value_of(typeof matchers[m]).should_be("function");
		}
	}
	,
	'whereArgument(n).<matcherName>() should call jack.matchers.<matcherName>()': function() {
		var dummyMatcherCalled = false;
		var dummyMatcher = function() {
			dummyMatcherCalled = true;
			return {};
		}
		jack.matchers.dummyMatcher = dummyMatcher;
		
		var spec = new jack.FunctionSpecification();
		spec.whereArgument(0).dummyMatcher();
		spec.test("value");
		
		value_of(dummyMatcherCalled).should_be_true();
		delete jack.matchers["dummyMatcher"];
	}
	,
	'whereArgument(n).<matcherName>(a, b, c) should call jack.matchers.<matcherName>(argument, a, b, c)': function() {
		var dummyMatcherCalledWithArgs = null;
		var dummyMatcher = function() {
			dummyMatcherCalledWithArgs = arguments;
			return {};
		}
		jack.matchers.dummyMatcher = dummyMatcher;
		
		var spec = new jack.FunctionSpecification();
		spec.whereArgument(0).dummyMatcher("arg1","arg2","arg3");
		spec.test("theArgument");
		
		value_of(dummyMatcherCalledWithArgs[0]).should_be("theArgument");
		value_of(dummyMatcherCalledWithArgs[1]).should_be("arg1");
		value_of(dummyMatcherCalledWithArgs[2]).should_be("arg2");
		value_of(dummyMatcherCalledWithArgs[3]).should_be("arg3");
		delete jack.matchers["dummyMatcher"];
	}
	,
	'specOne.satisfies(specTwo) should be true if specOne has is() constraints that satisfies the constraints of specTwo': function() {
		var specOne = (new jack.FunctionSpecification())
			.whereArgument(0).is("value1")
			.whereArgument(1).is(1001);
		var specTwo = (new jack.FunctionSpecification())
			.whereArgument(0).isOneOf("value1", "value2")
			.whereArgument(1).isType("number");
		
		value_of(specOne.satisfies(specTwo)).should_be_true();
	}
	,
	'specOne.satisfies(specTwo) should be false if specOne has is() constraints that do not satisfy the constraints of specTwo': function() {
		var specOne = (new jack.FunctionSpecification())
			.whereArgument(0).is("value1")
			.whereArgument(1).is(1001);
		var specTwo = (new jack.FunctionSpecification())
			.whereArgument(0).isOneOf("value1", "value2")
			.whereArgument(1).isType("string");
		
		value_of(specOne.satisfies(specTwo)).should_be_false();
	}
	,
	'specOne.satisfies(specTwo) should be true if neither has any constraints': function() {
		var specOne = new jack.FunctionSpecification();
		var specTwo = new jack.FunctionSpecification();

		value_of(specOne.satisfies(specTwo)).should_be_true();
	}
	,
	'invoke() should return undefined if no mock implementation is specified': function() {
		var spec = new jack.FunctionSpecification();
		var result = spec.invoke();
		value_of(result).should_be_undefined();
	}
	,
	'invoke() should call mock implementation if specified': function() {
		var mockWasCalled = false;
		var spec = new jack.FunctionSpecification();
		spec.mock(function() { 
			mockWasCalled = true;
		});
		var result = spec.invoke();
		value_of(mockWasCalled).should_be_true();
	}
	,
	'invoke() should return value from mock implementation': function() {
		var spec = new jack.FunctionSpecification();
		spec.mock(function() { 
			return "theReturnValue"; 
		});
		var result = spec.invoke();
		value_of(result).should_be("theReturnValue");
	}
	,
	'invoke() should call mock implementation with the correct "this" value': function() {
		var expectedThisValue = "The expected value";
		var actualThisValue = null;
		var spec = new jack.FunctionSpecification();
		spec.mock(function() { 
			actualThisValue = this;
		});
		var result = spec.invoke.apply(expectedThisValue);
		value_of(actualThisValue).should_be(expectedThisValue);
	}
	,
	'invoke() should call mock implementation with the correct arguments': function() {
		var expectedArguments = ["a","b","c"];
		var actualArguments = null;
		var spec = new jack.FunctionSpecification();
		spec.mock(function() { 
			actualArguments = arguments;
		});
		var result = spec.invoke.apply(null, expectedArguments);
		value_of(actualArguments[0]).should_be("a");
		value_of(actualArguments[1]).should_be("b");
		value_of(actualArguments[2]).should_be("c");
	}
	,
	'Should know that a mock implementation has not been specified': function() {
		var spec = new jack.FunctionSpecification();
		value_of(spec.hasMockImplementation()).should_be_false();
	}
	,
	'Should know that a mock implementation has been specified': function() {
		var spec = new jack.FunctionSpecification();
		spec.mock(function(){});
		value_of(spec.hasMockImplementation()).should_be_true();
	}
	,
	'Should speficy a simple mock implementation that returns a value': function() {
		var spec = new jack.FunctionSpecification();
		spec.returnValue("A value");
		value_of(spec.invoke()).should_be("A value");
	}
	,
	'Number of invocations should be 0 when function has not been invoked': function() {
		var spec = new jack.FunctionSpecification();
		value_of(spec.invocations().actual).should_be(0);
	}
	,
	'Should count number of invocations': function() {
		var spec = new jack.FunctionSpecification();
		spec.invoke();
		spec.invoke();
		value_of(spec.invocations().actual).should_be(2);
	}
	,
	'Should set exact number of expected invocations': function() {
		var spec = new jack.FunctionSpecification();
		spec.exactly("2 times");
		value_of(spec.invocations().expected).should_be(2);
		value_of(spec.testTimes(2)).should_be_true();
		value_of(spec.testTimes(1)).should_be_false();
	}
	,
	'Should set exact number of expected invocations with once()': function() {
		var spec = new jack.FunctionSpecification();
		spec.once();
		value_of(spec.invocations().expected).should_be(1);
		value_of(spec.testTimes(1)).should_be_true();
		value_of(spec.testTimes(2)).should_be_false();
	}
	,
	'Should set minimum number of expected invocations': function() {
		var spec = new jack.FunctionSpecification();
		spec.atLeast("4 times");
		value_of(spec.invocations().expected).should_be(4);
		value_of(spec.testTimes(4)).should_be_true();
		value_of(spec.testTimes(3)).should_be_false();
		value_of(spec.testTimes(5)).should_be_true();
	}
	,
	'Should set maximum number of expected invocations': function() {
		var spec = new jack.FunctionSpecification();
		spec.atMost("6 times");
		value_of(spec.invocations().expected).should_be(6);
		value_of(spec.testTimes(6)).should_be_true();
		value_of(spec.testTimes(7)).should_be_false();
		value_of(spec.testTimes(5)).should_be_true();
	}
	,
	'Should set exact number of expected invocations with never()': function() {
		var spec = new jack.FunctionSpecification();
		spec.never();
		value_of(spec.invocations().expected).should_be(0);
		value_of(spec.testTimes(0)).should_be_true();
		value_of(spec.testTimes(1)).should_be_false();
	}
	,
	'Default number of expected invocations should be once': function() {
		var spec = new jack.FunctionSpecification();
		value_of(spec.invocations().expected).should_be(1);
		value_of(spec.testTimes(1)).should_be_true();
		value_of(spec.testTimes(2)).should_be_false();
	}
	,
	'Should describe itself': function() {
		var spec = new jack.FunctionSpecification();
		value_of(spec.describe("foo")).should_match("foo\(\)");
	}
	,
	'Should describe its constraints': function() {
		var spec = 
			new jack.FunctionSpecification()
			.whereArgument(0).is("Foo!")
			.whereArgument(1).isOneOf("Bar!","Baz!")
			.whereArgument(2).isNot("Faz!");
		var description = spec.describe("myFunction");
		value_of(description).should_match(/myFunction\('Foo\!', oneOf:\['Bar\!','Baz\!'\], not:'Faz\!'\)/);
	}
	,
	'Should describe constraint as [any] if no constraint is set': function() {
		var spec = 
			new jack.FunctionSpecification()
			.whereArgument(0).is("Foo")
			.whereArgument(2).is("Bar");
		var description = spec.describe("myFunction");
		value_of(description).should_be("myFunction('Foo', [any], 'Bar') expected exactly 1 time, called 0 times");
	}
	,
	'Should describe exact number of expected calls': function() {
		var spec = 
			new jack.FunctionSpecification()
			.exactly("2 times");
		value_of(spec.describe("foo")).should_match(/foo\(\) expected exactly 2 times/);
	}
	,
	'Should describe minimum number of expected calls': function() {
		var spec = 
			new jack.FunctionSpecification()
			.atLeast("1 time");
		value_of(spec.describe("foo")).should_match(/foo\(\) expected at least 1 time/);
	}
	,
	'Should describe maximum number of expected calls': function() {
		var spec = 
			new jack.FunctionSpecification()
			.atMost("5 times");
		value_of(spec.describe("foo")).should_match(/foo\(\) expected at most 5 times/);
	}
	,
	'Should describe actual number of calls': function() {
		var spec = new jack.FunctionSpecification();
		spec.invoke();
		spec.invoke();
		value_of(spec.describe("foo")).should_match(/expected exactly 1 time, called 2 times/);
	}
	,
	'Should describe actual number of calls, singular': function() {
		var spec = new jack.FunctionSpecification();
		spec.invoke();
		value_of(spec.describe("foo")).should_match(/expected exactly 1 time, called 1 time$/);
	}
	,
	'Should allow more than one constraint per argument': function() {
		var spec = 
			new jack.FunctionSpecification()
			.whereArgument(0).matches(/Homer/)
			.whereArgument(0).matches(/Simpson/);

		value_of(spec.test("Simpson")).should_be_false();
		value_of(spec.test("Homer Simpson")).should_be_true();
	}
});










