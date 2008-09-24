
function throwError(message) {
	throw new Error(message);
}

function callThisAndThrowError(aFunction) {
	aFunction();
	throw new Error("An error...");
}