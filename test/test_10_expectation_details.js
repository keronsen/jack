

describe('Finding expectation details', {
	before_all: function() {
		jack.env.disableReporting();
	}
	,
	after_all: function() {
		jack.env.enableReporting();
	}
	,
	'Finding line number [[!JSSpec.Browser.Trident]]': function() {
		var exp1 = null;
		var exp2 = null;
		
		jack(function(){
			jack.create("mockObject", ['functionOne']);
			exp1 = jack.expect("mockObject.functionOne").exactly("1 time");
			exp2 = jack.expect("mockObject.functionOne").exactly("1 time");
		});
		
		// value_of(exp1._lineNumber).should_be(18);
		// value_of(exp2._lineNumber).should_be(19);
	}
});