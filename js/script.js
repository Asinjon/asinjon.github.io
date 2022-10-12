(function($, window){
    $(window).on("load", () => {
        $(".loader").fadeOut(1000);
    });
    // $(".animsition").animsition({
    //         inClass:'fade-in',
    //         outClass:'fade-out',
    //         inDuration:1000,
    //         outDuration:700,
    //         linkElement:'a.project-box',
    //         loading:true,
    //         loadingParentElement:'body',
    //         loadingClass:'spinner',
    //         loadingInner:'<div class="double-bounce1"></div><div class="double-bounce2"></div>',
    //         timeout:false,
    //         timeoutCountdown:5000
    //         ,onLoadEvent:true,
    //         browser:['animation-duration','-webkit-animation-duration'],
    //         overlay:false,
    //         overlayClass:'animsition-overlay-slide',
    //         overlayParentElement:'body',
    //         transition:function(url){
    //             window.location.href=url;
    //         }
    //     });

    $(".pagepiling").pagepiling({
        anchors: ["page1", "page2", "page3", "page4"],
        scrollingSpeed: 280,
        loopBottom: true,
        loopTop: true,
        navigation: {
            textColor: "#fff",
            bulletsColor: "#fff",
            position: "right",
            tooltips: []
        },
        menu: ".menu__body"
    });
    $('.menu__body li a').on('click',function(){
        $('.menu__body li').removeClass('active');
        $(this).closest('li').addClass('active');
    });
    $("header div.menu").on("click", () => {
        $("body").removeClass("menu__is-closed").addClass("menu__is-opened");
    });
    $(".close__menu, .menu__body ul a").on("click", () => {
        $("body").removeClass("menu__is-opened").addClass("menu__is-closed");
    });
    $(".percent").each(function () {
        let $this = $(this);
        let percent = $this.data("percent");
        $this.width(percent);
    });
})(jQuery, window);