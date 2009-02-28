
/*
describe('FunctionInvocation class', {
	'Class should exist': function() {
		var inv = new jack.FunctionInvocation();
		value_of(inv).should_not_be_undefined();
	}
	,
	'Should have test() method': function() {
		var inv = new jack.FunctionInvocation();
		var result = inv.test();
		value_of(result).should_be_true();
	}
	,
	'Should specify that no arguments are expected': function() {
		var inv = new jack.FunctionInvocation();
		inv.withNoArguments();
		value_of(inv.test()).should_be_true();
		value_of(inv.test("foo")).should_be_false();
	}
	,
	'Should check for equal strings': function() {
		var inv = new jack.FunctionInvocation();
		inv.withArguments("argValue1","argValue2");
		value_of(inv.test("foo","bar")).should_be_false();
		value_of(inv.test("argValue1","argValue2")).should_be_true();
	}
	,
	'whereArgument(n) should return all available matchers from jack.matchers': function() {
		var inv = new jack.FunctionInvocation();
		var matchers = inv.whereArgument(0);
		value_of(matchers).should_not_be_undefined();
		for(var m in jack.matchers) {
			value_of(typeof matchers[m]).should_be("function");
		}
	}
	/*
	,
	'Should check for equal numbers': function() {
		jack(function(){
			jack.expect("globalFunctionOne").exactly("1 time").withArguments(1234,5678);
			jack.expect("globalFunctionTwo").exactly("1 time").withArguments(1234,5678);
			
			window.globalFunctionOne(1111, 5555);
			window.globalFunctionTwo(1234, 5678);
		});
		
		value_of(jack.report("globalFunctionOne").actual).should_be(0);
		value_of(jack.report("globalFunctionTwo").actual).should_be(1);
	}
	*/
});

*/