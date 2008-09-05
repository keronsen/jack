

describe('Fixing reported bugs', {
	before_each: function() {
		window.MyQuery = function() {}
		window.MyQuery.post = function() {}
	}
	,
	after_each: function() {
		window.MyQuery = null
	}
	,
	'FIXED: Is not failing when first expectation is met': function() {
		jack(function(){	
			jack
				.expect("MyQuery")
				.exactly('1 times')
				.whereArgument(0).is('#entryform');
							
			jack
				.expect("MyQuery")
				.exactly("1 times")
				.whereArgument(0).is('#entry');
			
			MyQuery('#entryform');				
			MyQuery('#entry');
		});
	}
	,
	'FIXED: Confusion between objects and functions, maybe?':function() {
		jack(function(){
			jack
				.expect("MyQuery")
				.exactly("1 time")
				.whereArgument(0).is('#myForm');
				
			jack
				.expect("MyQuery.post")
				.exactly("1 time")
				.whereArgument(0).is('/twit/feed')
				.whereArgument(1).hasProperty('entry','crappadore');
			
			MyQuery("#myForm");
			MyQuery.post("/twit/feed", { 'entry':'crappadore' });
		});
	}
	,
	'FIXED: Matches wrong expectation':function() {
		jack(function(){
			var textArea = jack.create('textArea', ['val']);       
			var bindableObject = jack.create('bindableObject', ['bind']);
			
			jack
				.expect("MyQuery")
				.exactly("1 times")
				.whereArgument(0).is('#entry')
				.mock(function(selector) {
					return textArea;
				});
			
			jack
				.expect("MyQuery")
				.exactly('1 times')
				.whereArgument(0).is('#entryform')
				.mock(function(selector) {
					return bindableObject;
				});
				
			 jack
				.expect('textArea.val').atLeast("1 time");
				
			 jack
				.expect('bindableObject.bind').atLeast("1 time");   
			
			MyQuery('#entryform').bind();				
			MyQuery('#entry').val();
		});
	}
	,
	'FIXED: Order of expectations seems to matter':function() {
		jack(function(){
			var textArea = jack.create('textArea', ['val']);       
			var bindableObject = jack.create('bindableObject', ['bind']);
			 
			jack
				.expect("MyQuery")
				.exactly('1 times')
				.whereArgument(0).is('#entryform')
				.mock(function(selector) {
					return bindableObject;
				});
				
			jack
				.expect("MyQuery")
				.exactly("1 times")
				.whereArgument(0).is('#entry')
				.mock(function(selector) {
					return textArea;
				});
				
			 jack
				.expect('textArea.val').atLeast("1 time");
				
			 jack
				.expect('bindableObject.bind').atLeast("1 time");   
				
			MyQuery('#entryform').bind();
			MyQuery('#entry').val();
		});
	}
		
})
