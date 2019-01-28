function fetchExercises() {
    var args = Array.from(arguments);
    $.ajax({
        type: 'GET',
        url: '/exercise',
        dataType: 'json'
    }).done(function(data, textStatus, jqXHR) {
        args.forEach(function(cb) {
            cb.call(this, data, textStatus, jqXHR);
        });
    });
};

function populateResults(data, textStatus, jqXHR) {
    if (data.length === 0) {
        $('#noExercises').show();
    }

    $.each(data, function(i, item) {
        $exCard = $('#ex-card-template').clone(true);
        $exCard.removeAttr('id');
        $exCard.find('.card-title').html(item.name);
        $exCard.find('.card-text').html(item.description);

        var colors = ['#37ce1f', '#b8ce1f', '#ffdb4c', '#ff923f', '#e41c1c'];
        var color = colors[parseInt(item.difficulty) - 1];
        $star = $exCard.find('.star' + item.difficulty);
        $stars = $star.prevUntil('.rating-static');
        $star.removeClass('far').addClass('fas').css('color', color);
        $stars.removeClass('far').addClass('fas').css('color', color);
        
        $('#exerciseResults').append($exCard);
        $exCard.show();
    });
};