

describe('Saving arguments', {
	'Should be able to save arguments': function() {
		window.globalFunction = function() {}
		
		jack(function(){
			jack.expect("globalFunction").exactly("1 time").saveArguments();
			globalFunction();
		});
		
		var inspectArguments = jack.inspect("globalFunction").arguments();
		value_of(inspectArguments).should_not_be_undefined();
		
		window.globalFunction = null;
	}
	,
	'Should be able to inspect argument values': function() {
		window.globalFunction = function(arg1, arg2) {}
		
		jack(function(){
			jack.expect("globalFunction").exactly("1 time").saveArguments();
			globalFunction("value1", 7740923, {message:'Kilroy was here!'});
		});
		
		var inspectArguments = jack.inspect("globalFunction").arguments();
		value_of(inspectArguments[0]).should_be("value1");
		value_of(inspectArguments[1]).should_be(7740923);
		value_of(inspectArguments[2]).should_be({message:'Kilroy was here!'});
		
		window.globalFunction = null;
	}
	,
	'Should be able to save arguments by name': function() {
		window.globalFunction = function(arg1, arg2) {}
		
		jack(function(){
			jack.expect("globalFunction").exactly("1 time").saveArguments('namedArgument1','namedArgument2','namedArgument3');
			globalFunction("value1", 7740923, {message:'Kilroy was here!'});
		});
		
		var inspectArguments = jack.inspect("globalFunction").arguments();
		value_of(inspectArguments['namedArgument1']).should_be("value1");
		value_of(inspectArguments['namedArgument2']).should_be(7740923);
		value_of(inspectArguments['namedArgument3']).should_be({message:'Kilroy was here!'});
		
		window.globalFunction = null;
	}
});
