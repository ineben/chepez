const nowuiKit = {
    misc: {
        navbar_menu_visible: 0
	}
};

$(document).ready(function() {
    $('.form-control').on("focus", function() {
        $(this).parent('.input-group').addClass("input-group-focus");
    }).on("blur", function() {
        $(this).parent(".input-group").removeClass("input-group-focus");
    });
});

/*$(document).on('click', '.nav-link', () => {
	const $toggle = $('.navbar-toggler');
	$('html').removeClass('nav-open');
	nowuiKit.misc.navbar_menu_visible = 0;
	$('#bodyClick').remove();
	setTimeout(function() {
		$toggle.removeClass('toggled');
	}, 550);
});*/

$(document).on('click', '.navbar-toggler', function() {
    const $toggle = $(this);

    if (nowuiKit.misc.navbar_menu_visible == 1) {
        $('html').removeClass('nav-open');
        nowuiKit.misc.navbar_menu_visible = 0;
        $('#bodyClick').remove();
        setTimeout(function() {
            $toggle.removeClass('toggled');
			$('#wrapper').removeClass('niceWrapper');
			$('#navWrap').removeClass('niceWrapper');
        }, 550);
    } else {
        setTimeout(function() {
            $toggle.addClass('toggled');
			$('#wrapper').addClass('niceWrapper');
			$('#navWrap').addClass('niceWrapper');
        }, 580);
        const div = '<div id="bodyClick"></div>';
        $(div).appendTo('body').click(function() {
            $('html').removeClass('nav-open');
            nowuiKit.misc.navbar_menu_visible = 0;
            setTimeout(function() {
                $toggle.removeClass('toggled');
				$('#wrapper').removeClass('niceWrapper');
				$('#navWrap').removeClass('niceWrapper');
                $('#bodyClick').remove();
            }, 550);
        });

        $('html').addClass('nav-open');
        nowuiKit.misc.navbar_menu_visible = 1;
    }
});