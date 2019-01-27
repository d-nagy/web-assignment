$(document).ready(function(){
    // Check Radio-box
    $(".rating input:radio").attr("checked", false);

    $('.rating input').click(function () {
        $(".rating span").removeClass('checked selected');
        $(this).parent().addClass('checked selected');
        $(this).siblings('label').children('i').removeClass('far').addClass('fas');
        $stars = $(this).parent().nextAll().children('label').children('i');
        $stars.removeClass('far').addClass('fas');
    });

    $('.rating span').hover(
        function() {
            $(".rating span").removeClass('checked');
            $('.rating i').removeClass('fas').addClass('far');

            $(this).addClass('checked');
            $(this).children('label').children('i').removeClass('far').addClass('fas');
            $stars = $(this).nextAll().children('label').children('i');
            $stars.removeClass('far').addClass('fas');
        }, function() {
            $(this).removeClass('checked');
            $(this).children('label').children('i').removeClass('fas').addClass('far');
            $stars = $(this).nextAll().children('label').children('i');
            $stars.removeClass('fas').addClass('far');

        }
    );

    $('.rating').hover(
        function() {},
        function() {
            $('.rating span').removeClass('checked');
            $('.rating .selected').addClass('checked');
            $('.rating .selected').children('label').children('i').removeClass('far').addClass('fas');
            $stars = $('.rating .selected').nextAll().children('label').children('i');
            $stars.removeClass('far').addClass('fas');
        }
    );
});
