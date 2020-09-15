var scroll = new SmoothScroll('a[href*="#"]', {
    speed: 500
  });

var typed = new Typed(".type",{
        strings: [
        "is a programmer.", 
        "designs.",
        "loves to create.",
        "is a doer of things."
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

var submitted=false;
$('#contact-form').on('submit', function(e) {
  $('#contact-form *').hide();
  $('#contact-form').append("Thank you for reaching out. I'll get back to you shortly!");
});
