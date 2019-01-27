var populateExercises = function() {
    $.ajax({
        type: 'GET',
        url: '/exercise',
        dataType: 'json'
    }).done(function(data, textStatus, jqXHR) {
        $('.exercise-single select').children().not(':first-child').remove();

        $.each(data, function(i, item) {
            $('.exercise-single select').append($('<option>', {
                value: item.slug,
                text: item.name
            }));
        });
    });
};

populateExercises();

$('.add-btn').click(function() {
    $(this).fadeToggle('fast');
    $(this).next('.add-btn-group').fadeToggle('fast');
});

$('.add-btn-group > button').click(function() {
    $(this).parent().fadeToggle('fast');
    $(this).parent().prev('.add-btn').fadeToggle('fast');
});


$('.list-unstyled li').click(function() {
    $('.list-unstyled li.active').removeClass('active');
    $(this).addClass('active');
});


$('#workoutLink').click(function() {
    $('#content > .row').hide();
    $('#workouts').show();
    populateExercises();
});

$('#exerciseLink').click(function() {
    $('#content > .row').hide();
    $('#exercises').show();
});

$('#memberLink').click(function() {
    $('#content > .row').hide();
    $('#members').show();
});

$('#statLink').click(function() {
    $('#content > .row').hide();
    $('#stats').show();
});