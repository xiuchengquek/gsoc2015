

/**
 * Created by quek on 26/03/2015.
 */
String.format = function () {
    // The string containing the format items (e.g. "{0}")
    // will and always has to be the first argument.
    var theString = arguments[0];

    // start with the second argument (i = 1)
    for (var i = 1; i < arguments.length; i++) {
        // "gm" = RegEx options for Global search (more than one instance)
        // and for Multiline search
        var regEx = new RegExp("\\{" + (i - 1) + "\\}", "gm");
        theString = theString.replace(regEx, arguments[i]);
    }

    return theString;
};
// initialize app
var heter = angular.module('heterApp', ['ngResource']);

// configuration to make use with django template language omit if not using django
heter.config(function ($interpolateProvider, $resourceProvider, $sceDelegateProvider) {
    $interpolateProvider.startSymbol('[[');
    $interpolateProvider.endSymbol(']]');
    $sceDelegateProvider.resourceUrlWhitelist(['self', 'http://biobirdblog.s3.amazonaws.com/**'])
});