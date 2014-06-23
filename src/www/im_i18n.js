//Including ngTranslate
angular.module("ngTranslate", ["ng"]).config(["$provide",
function(n) {
    $TranslateProvider = function() {
        var n, t = {};
        this.translations = function(n, r) {
            if (!n && !r)
                return t;
            if (n && !r) {
                if (angular.isString(n))
                    return t[n];
                t = n
            } else
                t[n] = r
        }, this.uses = function(r) {
            if (!r)
                return n;
            if (!t[r])
                throw Error("$translateProvider couldn't find translationTable for langKey: '" + r + "'");
            n = r
        }, this.$get = ["$interpolate", "$log",
        function(r, a) {
            return $translate = function(e, i) {
                var l = n ? t[n][e] : t[e];
                return l ? r(l)(i) : (a.warn("Translation for " + e + " doesn't exist"), e)
            }
        }]

    }, n.provider("$translate", $TranslateProvider)
}]), angular.module("ngTranslate").directive("translate", ["$filter", "$interpolate",
function(n, t) {
    var r = n("translate");
    return {
        restrict : "A",
        scope : !0,
        link : function(n, a, e) {
            e.$observe("translate", function(r) {
                n.translationId = angular.equals(r, "") ? t(a.text())(n.$parent) : r
            }), e.$observe("values", function(t) {
                n.interpolateParams = t
            }), n.$watch("translationId + interpolateParams", function() {
                a.html(r(n.translationId, n.interpolateParams))
            })
        }
    }
}]), angular.module("ngTranslate").filter("translate", ["$parse", "$translate",
function(n, t) {
    return function(r, a) {
        return angular.isObject(a) || ( a = n(a)()), t(r, a)
    }
}]);
