

describe('Setting expectations for locally created mocks', {
	before_all: function() {
		jack.env.disableReporting();
	}
	,
	after_all: function() {
		jack.env.enableReporting();
	}
	,
	'Test one': function() {			
		jack(function(){
			var myMock = jack.create("myMock",['myFunction']);
			jack.expect("myMock.myFunction").atLeast("3 times");
			myMock.myFunction();
			myMock.myFunction();
			myMock.myFunction();
			myMock.myFunction();
		});
		
		var report = jack.report("myMock.myFunction");
		value_of(report.expected).should_be(3);
		value_of(report.actual).should_be(4);
		value_of(report.success).should_be_true();
	}
	,
	'Test two': function() {			
		jack(function(){
			var myMock = jack.create("myMock",['myFunction']);
			jack.expect("myMock.myFunction").exactly("1 times");
		});
		
		var report = jack.report("myMock.myFunction");
		value_of(report.expected).should_be(1);
		value_of(report.actual).should_be(0);
		value_of(report.success).should_be_false();
	}
});