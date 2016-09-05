seajs.use('views/test3', function (test3) {

    var res = test3.css_beautify("   .bd    \n { padding-top: 4px/$p; ul { display: -webkit-box;\n margin-top: 5px; }\n\
        li { -webkit-box-flex: 1; width: 0px; height: 80px; text-align: center; font-size: 14px; &:before { @include icon(0px, 0px, 104px/$p, 104px/$p, \"icon_share.png\", block); background-size: 416px/$p auto; margin: 0 auto 4px auto; }\
            }\n//asdfsf\n/*爱管家\nasdf*/\n\
        @for $i from 1 to 4 { li:nth-child(#{$i+1}):before { background-position: -104px/$p*$i 0px; }\
            }\n\n\
        }\n\
        \
        \
        \
ss\n\n\n\
        \
    .ft { .btn { display: block; line-height: 30px; height: 60px/$p; width: (550/640)*100%; font-size: 16px; background: #ccc; margin: 5px auto 0 auto; border-radius: 0;   }\
        }\
        \
    }");
    //$main.html(res);
});