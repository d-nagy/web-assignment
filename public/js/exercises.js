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
    }).fail(function(jqXHR, textStatus, err) {
        
    });
};

function fetchExerciseBySlug(slug) {
    var args = Array.from(arguments);
    var slug = args[0];
    var cbs = args.slice(1);
    $.ajax({
        type: 'GET',
        url: '/exercise/' + slug
    }).done(function(data, textStatus, jqXHR) {
        cbs.forEach(function(cb) {
            cb.call(this, data, textStatus, jqXHR);
        });
    }).fail(function(jqXHR, textStatus, err) {
        
    });
};

function deleteExercise(slug) {
    $.ajax({
        type: 'DELETE',
        url: '/exercise/' + slug,
    }).done(function(data, textStatus, jqXHR) {
        fetchExercises(populateExerciseResults);
    }).fail(function(jqXHR, textStatus, err) {
        console.log(jqXHR);
        console.log(textStatus);
        console.log(err);
    });
};

function populateExerciseResults(data, textStatus, jqXHR) {
    if (data.length === 0) {
        $('#noExercises').show();
    }

    $.each(data, function(i, item) {
        $exCard = $('#ex-card-template').clone(true);
        $exCard.removeAttr('id');
        $exCard.attr('data-slug', item.slug);
        $exCard.find('.card-title').html(item.name);
        $exCard.find('.card-text').html(item.description);

        // var colors = ['#37ce1f', '#b8ce1f', '#ffdb4c', '#ff923f', '#e41c1c'];
        // var color = colors[parseInt(item.difficulty) - 1];
        // $star = $exCard.find('.star' + item.difficulty);
        // $stars = $star.prevUntil('.rating-static');
        // $star.removeClass('far').addClass('fas').css('color', color);
        // $stars.removeClass('far').addClass('fas').css('color', color);

        setStarRating($exCard, item.difficulty);
        
        $('#exerciseResults').append($exCard);
        $exCard.show();
    });
};