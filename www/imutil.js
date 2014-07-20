// v1.1

angular.module('inapp.util', []).factory('IMUtil', function($ionicLoading, $ionicPopup, $interval) {

    var Const = { ID_NONE:-1, ID_WEB: 0, ID_ANDROID: 1, ID_IOS: 2, ID_WP: 3, ID_FFOS: 4 };
    var isPhoneGap;
    var isInterstitial = false;
    
    function getAdId() {
        switch(isPhoneGap) {
            case Const.ID_ANDROID:
                return admob_android_key;
            case Const.ID_IOS:
                return admob_ios_key;
            case Const.ID_WP:
                return admob_wp_key;
            case Const.ID_FFOS:
                break;
            default:
                break;
        }
        return ID_NONE;
    }

    function adBanner() {
        if (window.plugins && window.plugins.AdMob) {
            var adId = getAdId();
            var am = window.plugins.AdMob;

            am.createBannerView({
                'publisherId' : adId,
                'adSize' : am.AD_SIZE.SMART_BANNER,
                'bannerAtTop' : false
            }, function() {
                am.requestAd({
                    'isTesting' : false
                }, function() {
                    am.showAd(true);
                }, function() { console.log('failed to request ad');
                });
            }, function() {console.log('failed to create banner view');
            });
            
            am.createInterstitialView({
                'publisherId' : adId
            }, function() {
            	isInterstitial = true;
            });            
        } else {
            console.log('AdMob plugin not available/ready.');
        }
    }

    function adInterstitial() {
        if (window.plugins && window.plugins.AdMob) {
            var am = window.plugins.AdMob;

            if ( isInterstitial ) {
                am.requestInterstitialAd({
                    'isTesting' : false
                }, function() {
                    am.showAd(true);
                }, function() {
                    console.log('failed to request ad');
                });
            }
        }
    }

    function toast(msg) {
        showLoading(msg);
        
        var p = $interval(function(){
            hideLoading();
            $interval.cancel(p);
        },3000);
    }
    function showConfirm(title, msg) {
        var confirmPopup = $ionicPopup.confirm({
            title : title,
            template : msg
        });
        return confirmPopup;
    };

    function getPlatformID() {
        if ( typeof device !== "undefined") {
            switch( device.platform ) {
                case 'Android':
                    isPhoneGap = Const.ID_ANDROID;
                    return Const.ID_ANDROID;
                case 'iOS':
                    isPhoneGap = Const.ID_IOS;
                    return Const.ID_IOS;
                case 'WinCE':
                case 'Win32NT':
                    isPhoneGap = Const.ID_WP;
                    return Const.ID_WP;
                // TODO: include firefox
                default:
                    break;
            }
        }
        isPhoneGap = Const.ID_WEB;
        return Const.ID_WEB;
    }

    function openBrowser(url) {
        if (isPhoneGap === Const.ID_WEB)
            window.open(url);
        else
            window.open(url, '_system');
    }

    function ab2str(array) {// ArrayBuffer to String
        var out, i, len, c;
        var char2, char3;

        out = "";
        len = array.length;
        i = 0;
        while (i < len) {
            c = array[i++];
            switch(c >> 4) {
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                    // 0xxxxxxx
                    out += String.fromCharCode(c);
                    break;
                case 12:
                case 13:
                    // 110x xxxx   10xx xxxx
                    char2 = array[i++];
                    out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
                    break;
                case 14:
                    // 1110 xxxx  10xx xxxx  10xx xxxx
                    char2 = array[i++];
                    char3 = array[i++];
                    out += String.fromCharCode(((c & 0x0F) << 12) | ((char2 & 0x3F) << 6) | ((char3 & 0x3F) << 0));
                    break;
            }
        }

        return out;
    }
    
    function str2ab(str) {
        var arr = new Uint8Array(str.length);
        for(var i = 0, len = str.length; i < len; ++i)
            arr[i] = str.charCodeAt(i);
        return arr;
    }

    function sendFeedBack(body) {
        if ( window.plugin && window.plugin.email ) {
            window.plugin.email.isServiceAvailable(
                function (isAvailable) {
                    if ( isAvailable ) {
                        window.plugin.email.open({
                            to:      ['imapp.help@gmail.com'],
                            subject: 'Hybrid Feedback',
                            body:    body 
                        });                        
                    }
                    else {
                        openBrowser('mailto:imapp.help@gmail.com');
                    }
                }
        );        
        }
        else
            openBrowser('mailto:imapp.help@gmail.com');
    }


    function showLoading(content) {
        // Show the loading overlay and text
        $ionicLoading.show({
            // The text to display in the loading indicator
            content : content,
            // The animation to use
            animation : 'fade-in',
            // Will a dark overlay or backdrop cover the entire view
            showBackdrop : true,
            // The maximum width of the loading indicator
            // Text will be wrapped if longer than maxWidth
            maxWidth : 300,
            // The delay in showing the indicator
            showDelay : 500
        });
    };

    function hideLoading() {
        $ionicLoading.hide();
    }

    return {
        Const : Const,

        adBanner : adBanner,
        openBrowser : openBrowser,
        getPlatformID : getPlatformID,
        showConfirm : showConfirm,
        adInterstitial : adInterstitial,
        ab2str : ab2str,
        str2ab : str2ab,
        sendFeedBack : sendFeedBack,
        showLoading : showLoading,
        hideLoading : hideLoading,
        toast : toast
    };
})

.directive('integer', function() {
   return {
     restrict: 'A',
     require: 'ngModel',
     link: function(scope, element, attrs, modelCtrl) {
       modelCtrl.$parsers.push(function (inputValue) {
           // this next if is necessary for when using ng-required on your input. 
           // In such cases, when a letter is typed first, this parser will be called
           // again, and the 2nd time, the value will be undefined
           if (inputValue === undefined) return '';
           var transformedInput = inputValue.replace(/[^0-9]/g, ''); 
           if ( parseInt(transformedInput) < attrs.min ) {
               transformedInput = attrs.min;
           }
           if ( parseInt(transformedInput) > attrs.max ) {
               transformedInput = transformedInput.slice(0,-1);
           }
           
           if (transformedInput !== inputValue) {
              modelCtrl.$setViewValue(transformedInput);
              modelCtrl.$render();
           }         
           
            console.log(parseInt(transformedInput)+"::"+attrs.min + ':::' + attrs.max);

           return transformedInput;         
       });
     }
   };
})
;
