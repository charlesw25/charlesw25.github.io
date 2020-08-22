var scroll = new SmoothScroll('a[href*="#"]', {
    speed: 500
  });

var typed = new Typed(".type",{
        strings: [
        "is an aspiring programmer.", 
        "loves to create.",
        "is a doer of things.",
        "designs."
        ],
        typeSpeed: 60, 
        backSpeed: 60,
        startDelay: 1000,
        cursorChar: '_',
        loop: true
        });

$(function () {
    $('[data-toggle="tooltip"]').tooltip();
});

