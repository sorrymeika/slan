define(function() {
    return {
        C: function(x,y) {
            var a=1,b=1;
            for(var i=x;i>x-y;i--) {
                a*=i;
            }
            for(var i=1;i<=y;i++) {
                b*=i;
            }
            return a/b;
        },
        A: function(x,y) {
            var a=1;
            for(var i=x;i>x-y;i--) {
                a*=i;
            }
            return a;
        }
    };

    return util;
})