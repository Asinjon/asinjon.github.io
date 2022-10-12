(function($, document, window, undefined) {
    "use strict";

    $.fn.pagepiling = function(customSettings) {
        let pagepiling = $.fn.pagepiling;
        let containerElement = $(this);
        let lastAnimation = 0;
        let lastScrolledDestiny;
        let scrollings = [];
        let scrollDelay = 600;

        let options = $.extend(true, {
            direction: "vertical",
            menu: null,
            verticalCentered: true,
            sectionsColor: [],
            anchors: [],
            scrollingSpeed: 700,
            easing: "easeInQuart",
            loopBottom: false,
            loopTop: false,
            css3: true,
            navigation: {
                textColor: "#000",
                bulletsColor: "#000",
                position: "right",
                tooltips: []
            },
            normalScrollElements: null,
            normalScrollElementTouchThreshold: 5,
            touchSensitivity: 5,
            keyboardScrolling: true,
            sectionSelector: ".section",
            animateAnchor: false,
            afterLoad: null,
            onLeave: null,
            afterRender: null
        }, customSettings);

        $(options.sectionSelector).each(function() {
            $(this).addClass("pp-section");
        });

        // if(options.css3){
        //     options.css3 = true;
        //  } 

        $(containerElement).css({
            "overflow": "hidden",
            '-ms-touch-action': 'none',  /* Touch detection for Windows 8 */
            'touch-action': 'none' 
        });

        if(!$.isEmptyObject(options.navigation)) {
            $("body").append("<div id='pp-nav'><ul></ul></div>");
            let nav = $("#pp-nav");

            nav.css("color", options.navigation.textColor);
            nav.addClass(options.navigation.position);
            for(let cont = 0; cont < $(".pp-section").length;cont++){
                let link = "";
                if(options.anchors.length) {
                    link = options.anchors[cont];
                }
                if(options.navigation.tooltips !== "undefined") {
                    var tooltip = options.navigation.tooltips[cont];
                    if(typeof tooltip === "undefined"){
                        tooltip = ""
                    }
                }
                nav.find("ul").append(`<li data-tooltip="${tooltip}"><a href="#${link}"><span></span></a></li>`);
            }

            nav.find("span").css("border-color", options.navigation.bulletsColor);
        }

        $(document).on('click touchstart', '#pp-nav a', function(e){
            e.preventDefault();
            var index = $(this).parent().index();

            scrollPage($('.pp-section').eq(index));
        });

        $(document).on({
            mouseenter: function(){
                var tooltip = $(this).data('tooltip');
                $('<div class="pp-tooltip ' + options.navigation.position +'">' + tooltip + '</div>').hide().appendTo($(this)).fadeIn(200);
            },
            mouseleave: function(){
                $(this).find('.pp-tooltip').fadeOut(200, function() {
                    $(this).remove();
                });
            }
        }, '#pp-nav li');

        let zIndex = $(".pp-section").length;

        $(".pp-section").each(function(index) {
            $(this).data("data-index", index);
            $(this).css("z-index", zIndex);

            if(!index && $(".pp-section.active").length === 0) {
                $(this).addClass("active");
            }
            if(options.anchors[index] !== "undefined") {
                $(this).attr("data-anchor", options.anchors[index]);
            }
            zIndex = zIndex - 1;
        }).promise().done(function() {
            if(options.navigation){
                $('#pp-nav').css('margin-top', '-' + ($('#pp-nav').height()/2) + 'px');
                $('#pp-nav').find('li').eq($('.pp-section.active').index('.pp-section')).find('a').addClass('active');
            }

            $(window).on("load", function() {
                let hashValueWithout = window.location.hash.replace("#", "");
                let section = $(document).find(`.pp-section[data-anchor="${hashValueWithout}"]`);

                if(section.length) {
                    scrollPage(section);
                }
            });
        });

        function isMoving() {
            let timeNow = new Date().getTime();
            if (timeNow - lastAnimation < scrollDelay + options.scrollingSpeed) {
                return true;
            }
            return false;
        }

        pagepiling.moveSectionUp = function() {
            let prev = $(".pp-section.active").prev(".pp-section");

            if(!prev.length && options.loopTop) prev = $(".pp-section").last();

            if(prev.length) scrollPage(prev);
        }

        pagepiling.moveSectionDown = function() {
            let next = $(".pp-section.active").next(".pp-section");

            if(!next.length && options.loopBottom) next = $(".pp-section").first();

            if(next.length) scrollPage(next);
        }

        function getYMovement(destiny) {
            let fromIndex = $(".pp-section.active").index(".pp-section");
            let toindex = destiny.index(".pp-section");

            if(fromIndex > toindex) return "up";
            return "down";
        }

        function getSectionsToMove(opts) {
            let sectionToMove;
            if(opts.yMovement === "down"){
                sectionToMove = $(".pp-section").map(function(index) {
                    if(index < opts.destination.index(".pp-section")){
                        return $(this);
                    }
                });
            }else {
                sectionToMove = $(".pp-section").map(function (index) {
                    if(index > opts.destination.index(".pp-section")) {
                        return $(this);
                    }
                });
            }

            return sectionToMove;
        }

        function getTransforms(translate3d) {
            return {
                '-webkit-transform': translate3d,
                    '-moz-transform': translate3d,
                    '-ms-transform': translate3d,
                    'transform': translate3d
            };
        }

        function transformContainer(element, translate3d, animated) {
            element.toggleClass("pp-easing", animated);
            element.css(getTransforms(translate3d));
        }

        function performMovement(opts) {
            console.log("opts::", opts);
            if(options.css3) {
                transformContainer(opts.animateSection, opts.translate3d, opts.animated);

                opts.sectionsToMove.each(function() {
                    transformContainer($(this), opts.translate3d, opts.animated);
                });
            }else {

            }
        }

        function scrollPage(destination, animated) {
            let opts = {
                destination: destination,
                animated: animated,
                activeSection : $(".pp-section.active"),
                anchorLink: destination.data("anchor"),
                sectionIndex: destination.index(".pp-section"),
                toMove: destination,
                yMovement: getYMovement(destination),
                leavingSection: $(".pp-section.active").index(".pp-section") + 1
            }
            if(opts.activeSection.is(destination)) return;

            if(typeof opts.animated === "undefined") opts.animated = true;

            if(typeof opts.anchorLink !== "undefined") {
                if(options.anchors.length) {
                    location.hash = opts.anchorLink;
                    location.hash = location.hash.replace('#','');

                    //removing previous anchor classes
                    $('body')[0].className = $('body')[0].className.replace(/\b\s?pp-viewing-[^\s]+\b/g, '');

                    //adding the current anchor
                    $('body').addClass('pp-viewing-' + location.hash);
                }else {
                    location.hash = opts.sectionIndex;
                    location.hash = location.hash.replace('#','');

                    //removing previous anchor classes
                    $('body')[0].className = $('body')[0].className.replace(/\b\s?pp-viewing-[^\s]+\b/g, '');

                    //adding the current anchor
                    $('body').addClass('pp-viewing-' + opts.sectionIndex);
                }
            }
            opts.destination.addClass('active').siblings().removeClass('active');
            opts.sectionsToMove = getSectionsToMove(opts);

            if(opts.yMovement === "down") {
                if(options.direction !== "vertical"){
                    opts.animClass = "horizontal";
                    opts.translate3d = "translate(-100%,0,0)";
                }
                else{ 
                    opts.translate3d = "translate3d(0,-100%,0)";
                    opts.animClass = "vertical";
                }
                opts.scrolling = "-100%";

                opts.animateSection = opts.activeSection;
            }else {
                opts.translate3d = 'translate3d(0px, 0px, 0px)';
                opts.animClass = "normal";
                opts.scrolling = '0';

                opts.animateSection = destination;
            }

            performMovement(opts);
            activateMenuElement(opts.anchorLink);
            activateNavDots(opts.anchorLink, opts.sectionIndex);
            lastScrolledDestiny = opts.anchorLink;

            var timeNow = new Date().getTime();
            lastAnimation = timeNow;
        }

        $(document).keydown(function(e) {
            if(options.keyboardScrolling && !isMoving()) {
                switch(e.which) {
                    case 38:
                    case 33:
                        pagepiling.moveSectionUp();
                        break;

                        //down
                    case 40:
                    case 34:
                        pagepiling.moveSectionDown();
                        break;

                        //Home
                    case 36:
                        // PP.moveTo(1);
                        console.log("GO home");
                        break;

                        //End
                    case 35:
                        // PP.moveTo($('.pp-section').length);
                        console.log("GO end");
                        break;

                        //left
                    case 37:
                        // PP.moveSectionUp();
                        console.log("GO left");
                        break;

                        //right
                    case 39:
                        // PP.moveSectionDown();
                        console.log("GO right");
                        break;

                    default:
                        return; // exit this handler for other keys
                }
            }
        });

        function activateNavDots(name, sectionIndex){
            if(options.navigation){
                $('#pp-nav').find('.active').removeClass('active');
                if(name){
                    $('#pp-nav').find('a[href="#' + name + '"]').addClass('active');
                }else{
                    $('#pp-nav').find('li').eq(sectionIndex).find('a').addClass('active');
                }
            }
        }

        function activateMenuElement(name){
            if(options.menu){
                $(options.menu).find('.active').removeClass('active');
                $(options.menu).find('[data-menuanchor="'+name+'"]').addClass('active');
            }
        }

        $(window).on('hashchange', hashChangeHandler);

        function hashChangeHandler(){
            var value =  window.location.hash.replace('#', '').split('/');
            var sectionAnchor = value[0];

            if(sectionAnchor.length){
                /*in order to call scrollpage() only once for each destination at a time
                It is called twice for each scroll otherwise, as in case of using anchorlinks `hashChange`
                event is fired on every scroll too.*/
                if (sectionAnchor && sectionAnchor !== lastScrolledDestiny)  {
                    var section;

                    if(isNaN(sectionAnchor)){
                        section = $(document).find('[data-anchor="'+sectionAnchor+'"]');
                    }else{
                        section = $('.pp-section').eq( (sectionAnchor -1) );
                    }
                    scrollPage(section);
                }
            }
        }
    }
})(jQuery, document, window);