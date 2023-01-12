jQuery(function ($) {
    "use strict";

    // Post image slider
    $("#post-thumb, #gallery-post").slick({
        infinite: true,
        arrows: false,
        autoplay: true,
        autoplaySpeed: 4000
    });

    $("#features").slick({
        infinite: true,
        arrows: false,
        autoplay: true,
        autoplaySpeed: 4000
    });

    // Magnific popup
    $('.image-popup').magnificPopup({
        type: 'image',
        removalDelay: 160, // Delay removal by X to allow out-animation
        callbacks: {
            beforeOpen: function () {
                // Hack that adds mfp-anim class to markup
                this.st.image.markup = this.st.image.markup.replace('mfp-figure', 'mfp-figure mfp-with-anim');
                this.st.mainClass = this.st.el.attr('data-effect');
            }
        },
        closeOnContentClick: true,
        midClick: true,
        fixedContentPos: false,
        fixedBgPos: true
    });

    // Portfolio filter
    $('.filtr-container').filterizr({});

    // Testimonial carousel
    $("#testimonials").slick({
        infinite: true,
        arrows: false,
        autoplay: true,
        autoplaySpeed: 4000
    });

    // Contact form validation
    $('#contact-submit-button').click(function (e) {
        var contactForm = $('#contact-form');
        if (contactForm[0].checkValidity() === false) {
            // Stop the form from being submitted
            e.preventDefault();
            e.stopPropagation();
        }
        contactForm.addClass('was-validated');
    });

    // WOW animations
    var wow = new WOW({
        offset: 100, // distance to the element when triggering the animation (default is 0)
        mobile: false // trigger animations on mobile devices (default is true)
    });

    // Fix for the Google and other crawlers to see the WOW-managed content, see
    // https://github.com/matthieua/WOW/issues/196#issuecomment-348734401
    var scrolled = false;
    $(window).on('scroll', function () {
        if (!scrolled) {
            scrolled = true;
            wow.init();
        }
    });

});
