

describe('Setting simple equality expectations for arguments', {
	before_each: function() {
		jack.env.disableReporting();
		window.globalFunctionOne = function() {}
		window.globalFunctionTwo = function() {}
	}
	,
	after_each: function() {
		jack.env.enableReporting();
		window.globalFunctionOne = null;
		window.globalFunctionTwo = null;
	}
	,
	'Should specify that no arguments are expected': function() {
		jack(function(){
			jack.expect("globalFunctionOne").exactly("1 time").withNoArguments();
			jack.expect("globalFunctionTwo").exactly("1 time").withNoArguments();
			
			window.globalFunctionOne("foo", "bar");
			window.globalFunctionTwo();
		});
		
		value_of(jack.report("globalFunctionOne").actual).should_be(0);
		value_of(jack.report("globalFunctionTwo").actual).should_be(1);
	}
	,
	'Should check for equal strings': function() {
		jack(function(){
			jack.expect("globalFunctionOne").exactly("1 time").withArguments("argValue1","argValue2");
			jack.expect("globalFunctionTwo").exactly("1 time").withArguments("argValue1","argValue2");
			
			window.globalFunctionOne("foo", "bar");
			window.globalFunctionTwo("argValue1", "argValue2");
		});
		
		value_of(jack.report("globalFunctionOne").actual).should_be(0);
		value_of(jack.report("globalFunctionTwo").actual).should_be(1);
	}
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
});
