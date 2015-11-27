**ICA - ready-to-use Iwa Angular Components**

This is a collection of Angular components by Iwa Labs, which composes of directives, services and factories.

The styles are included where applicable, and there's also some standalone style components that are released in this package just for convinience.

While the styles are just CSS, the Angular components require certain include/load order, and sometimes depend on each other.

The most important thing, however, is to always include/load the IAC.js before anything else, as that creates the "IAC" Angular module the other files refer to. 

To use, include the "IAC" as a dependency in your app's module definition, like:

`angular.module('myAngularApp', ['ngAnimate', 'ngCookies', 'ngTouch', 'ngSanitize', 'ngMessages', 'ngAria', 'ngResource', 'ngRoute','IAC']);
`

(just use whatever angular modules you actually need, the point of the example is the IAC in the mix)



When including just some directive, for example, simply check if it depends on something, like a service. If it does, a file with a similar name is included in this package. Include/load it before the directive and everything works fine.

