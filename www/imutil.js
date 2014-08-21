// v1.2

angular.module('inapp.util', []).factory('IMUtil', function($ionicLoading, $ionicPopup, $interval) {

    var Const = { ID_NONE:-1, ID_WEB: 0, ID_ANDROID: 1, ID_IOS: 2, ID_WP: 3, ID_FFOS: 4 };
    var isPhoneGap;
    
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
        return Const.ID_NONE;
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
            
        } else {
            console.log('AdMob plugin not available/ready.');
        }
    }

    function adInterstitial() {
        if (window.plugins && window.plugins.AdMob) {
            var am = window.plugins.AdMob;
            var adId = getAdId();
            
            am.createInterstitialView({
                'publisherId' : adId
            }, function() {
                am.requestInterstitialAd({
                    'isTesting' : false
                }, function() {
                    am.showAd(true);
                }, function() {
                    console.log('failed to request ad');
                });
            });
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
                case 'firefoxos':
                	isPhoneGap = Const.ID_FFOS;
                	return Const.ID_FFOS;
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

    function beep() {
        var snd = new Audio("data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");  
        snd.play();
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
        toast : toast,
        beep : beep
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
