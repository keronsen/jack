

describe('Setting advanced expectations for arguments', {
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
	'Should check for equal values': function() {
		jack(function(){
			jack.expect("globalFunctionOne").exactly("1 time")
				.whereArgument(0).is("argValue1")
				.whereArgument(1).is(12345);
			jack.expect("globalFunctionTwo").exactly("1 time")
				.whereArgument(0).is("argValue1")
				.whereArgument(1).is(12345);
			
			window.globalFunctionOne("foo", 22222);
			window.globalFunctionTwo("argValue1", 12345);
		});
		
		value_of(jack.report("globalFunctionOne").actual).should_be(0);
		value_of(jack.report("globalFunctionTwo").actual).should_be(1);
	}
	,
	'Should not have to specify constraints for all arguments': function() {
		jack(function(){
			jack.expect("globalFunctionOne").exactly("1 time")
				.whereArgument(1).is(12345);				
			window.globalFunctionOne("foo", 22222);
		});
		
		value_of(jack.report("globalFunctionOne").actual).should_be(0);
	}
	,
	'Should check for non-equal values': function() {
		jack(function(){
			jack.expect("globalFunctionOne").exactly("1 time")
				.whereArgument(1).isNot(12345);
			jack.expect("globalFunctionTwo").exactly("1 time")
				.whereArgument(1).isNot(12345);
			
			window.globalFunctionOne("argValue1", 22222);
			window.globalFunctionTwo("argValue1", 12345);
		});
		
		value_of(jack.report("globalFunctionOne").actual).should_be(1);
		value_of(jack.report("globalFunctionTwo").actual).should_be(0);
	}
	,
	'Should check for matching values with regexp': function() {
		jack(function(){
			jack.expect("globalFunctionOne").exactly("1 time")
				.whereArgument(0).matches(/foo/);
			jack.expect("globalFunctionTwo").exactly("1 time")
				.whereArgument(0).matches(/foo/);
			
			window.globalFunctionOne("foo");
			window.globalFunctionTwo("bar");
		});
		
		value_of(jack.report("globalFunctionOne").actual).should_be(1);
		value_of(jack.report("globalFunctionTwo").actual).should_be(0);
	}
	,
	'Should check for object property': function() {
		jack(function(){
			jack.expect("globalFunctionOne").exactly("1 time")
				.whereArgument(0).hasProperty('name');
			jack.expect("globalFunctionTwo").exactly("1 time")
				.whereArgument(0).hasProperty('name');
			
			window.globalFunctionOne({name:'Homer'});
			window.globalFunctionTwo({message:'Doh!'});
		});
		
		value_of(jack.report("globalFunctionOne").actual).should_be(1);
		value_of(jack.report("globalFunctionTwo").actual).should_be(0);
	}
	,
	'Should check for object property with value': function() {
		jack(function(){
			jack.expect("globalFunctionOne").exactly("1 time")
				.whereArgument(0).hasProperty('name','Homer');
			jack.expect("globalFunctionTwo").exactly("1 time")
				.whereArgument(0).hasProperty('name','Homer');
			
			window.globalFunctionOne({name:'Homer'});
			window.globalFunctionTwo({name:'Bart'});
		});
		
		value_of(jack.report("globalFunctionOne").actual).should_be(1);
		value_of(jack.report("globalFunctionTwo").actual).should_be(0);
	}
	,
	'Should specify more than one constraint per argument': function() {
		jack(function(){
			jack.expect("globalFunctionOne").exactly("1 time")
				.whereArgument(0).matches(/foo/)
				.whereArgument(0).matches(/bar/);
			jack.expect("globalFunctionTwo").exactly("1 time")
				.whereArgument(0).matches(/foo/)
				.whereArgument(0).matches(/bar/);
			
			window.globalFunctionOne('foobar');
			window.globalFunctionTwo('bar');
		});
		
		value_of(jack.report("globalFunctionOne").actual).should_be(1);
		value_of(jack.report("globalFunctionTwo").actual).should_be(0);
	}
	,
	'Should check for multiple object properties with values': function() {
		jack(function(){
			jack.expect("globalFunctionOne").exactly("1 time")
				.whereArgument(0).hasProperties({name:'Homer',message:'Doh!'});
			jack.expect("globalFunctionTwo").exactly("1 time")
				.whereArgument(0).hasProperty({name:'Homer',message:'Doh!'});
			
			window.globalFunctionOne({name:'Homer',message:'Doh!'});
			window.globalFunctionTwo({name:'Homer'});
		});
		
		value_of(jack.report("globalFunctionOne").actual).should_be(1);
		value_of(jack.report("globalFunctionTwo").actual).should_be(0);
	}
	,
	'Should check for one of more values': function() {
		jack(function(){
			jack.expect("globalFunctionOne").exactly("1 time")
				.whereArgument(0).isOneOf("argValue1","argValue2","argValue3");
			jack.expect("globalFunctionTwo").exactly("1 time")
				.whereArgument(0).isOneOf("argValue1","argValue2","argValue3");
			
			window.globalFunctionOne("argValue2");
			window.globalFunctionTwo("Something completely different");
		});
		
		value_of(jack.report("globalFunctionOne").actual).should_be(1);
		value_of(jack.report("globalFunctionTwo").actual).should_be(0);
	}
	,
	'Should check for value type': function() {
		jack(function(){
			jack.expect("globalFunctionOne").exactly("1 time")
				.whereArgument(0).isType("string");
			jack.expect("globalFunctionTwo").exactly("1 time")
				.whereArgument(0).isType("string");
			
			window.globalFunctionOne("An example string");
			window.globalFunctionTwo(1001);
		});
		
		value_of(jack.report("globalFunctionOne").actual).should_be(1);
		value_of(jack.report("globalFunctionTwo").actual).should_be(0);
	}
	,
	'Should provide all jack.matchers to whereArgument(n)': function() {
		var actualMathcerNames = [];
		jack(function() {
			var matchers = jack.expect("window.open").whereArgument(0);
			for(var p in matchers) {
				actualMathcerNames.push(p);
			}
		});
		
		for (var expectedMatcherName in jack.matchers) { 
			value_of(actualMathcerNames).should_include(expectedMatcherName);
		}
		
	}
});
