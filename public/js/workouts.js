function populateExerciseList(data, textStatus, jqXHR) {
    $('.exercise-single select').children().not(':first-child').remove();

    $.each(data, function(i, item) {
        $('.exercise-single select').append($('<option>', {
            value: item.slug,
            text: item.name
        }));
    });
};

function fetchWorkouts() {
    var args = Array.from(arguments);
    $.ajax({
        type: 'GET',
        url: '/workout',
        dataType: 'json'
    }).done(function(data, textStatus, jqXHR) {
        args.forEach(function(cb) {
            cb.call(this, data, textStatus, jqXHR);
        });
    }).fail(function(jqXHR, textStatus, err) {
        
    });
};

function deleteWorkout(slug) {
    $.ajax({
        type: 'DELETE',
        url: '/workout/' + slug,
    }).done(function(data, textStatus, jqXHR) {
        $('#removeBlockModal').modal('hide');
        fetchWorkouts(populateWorkoutResults);
        fetchMostRecentWorkout();
        fetchMostCompletedWorkout();
    }).fail(function(jqXHR, textStatus, err) {
        $('#removeBlockModal .modal-body').html('Cannot delete workout: ' + jqXHR.responseText);
        $('#removeBlockModal .btn-danger').addClass('disabled');
        setTimeout(function() {$('#removeBlockModal').modal('hide');}, 3000);
        $('#removeBlockModal .btn-danger').removeClass('disabled');
        $('#removeBlockModal .modal-body').html('Are you sure you want to remove this item?');
    });
};

function setFavourite(slug, favourite) {
    $.ajax({
        type: 'PUT',
        url: '/workout/setfav',
        data: {
            slug: slug,
            favourite: favourite
        }
    }).done(function(data, textStatus, jqXHR) {
        fetchWorkouts(populateWorkoutResults);
        fetchMostRecentWorkout();
        fetchMostCompletedWorkout()
    }).fail(function(jqXHR, textStatus, err) {

    });
};

function completeWorkout(slug) {
    $.ajax({
        type: 'PUT',
        url: '/workout/complete',
        data: {
            slug: slug
        }
    }).done(function(data, textStatus, jqXHR) {
        fetchWorkouts(populateWorkoutResults);
        fetchMostRecentWorkout();
        fetchMostCompletedWorkout()
    }).fail(function(jqXHR, textStatus, err) {

    });
};


function createWorkoutCard(i, wk, exercises) {
    var wkExercises = [];
    var lookup = {};

    $wkCard = $('#workout-card-template').clone(true);
    $wkCard.removeAttr('id');
    $wkCard.attr('data-slug', wk.slug);
    $wkCard.find('.setWotdButton').attr('data-id', wk.slug);

    $.each(wk.routine, function(i, item) {
        switch (item.type) {
            case "rest":
                $li = $('#rest-li-template').clone(true);
                $li.find('h6').html('Rest for ' + item.duration + ' seconds');
                break;
            case "exercise-single":
                $li = $('#ex-single-li-template').clone(true);

                var ex = exercises.find(function(element) {
                    return element.slug === item.slug; 
                });

                if (!lookup[ex.slug]) {
                    wkExercises.push(ex);
                    lookup[ex.slug] = 1;
                }

                $li.find('h6').html(ex.name + ' &times ' + item.quantity + ' ' + item.units);
                $li.find('.card-title').html(ex.name);
                $li.find('.card-text').html(ex.description);
                setStarRating($li, ex.difficulty);
                break;
            case "exercise-block":
                $li = $('#ex-block-li-template').clone(true);
                $li.find('h6').html(item.title + ' &times ' + item.reps + ' reps');
                $.each(item.exercises, function(i, ex) {
                    switch (ex.type) {
                        case "rest":
                            $subli = $('#rest-li-template').clone(true);
                            $subli.find('h6').html('Rest for ' + ex.duration + ' seconds');
                            break;
                        case "exercise-single":
                            $subli = $('#ex-single-li-template').clone(true);

                            var e = exercises.find(function(element) {
                                return element.slug === ex.slug; 
                            });

                            if (!lookup[e.slug]) {
                                wkExercises.push(e);
                                lookup[e.slug] = 1;
                            }

                            $subli.find('h6').html(e.name + ' &times ' + ex.quantity + ' ' + ex.units);
                            $subli.find('.card-title').html(e.name);
                            $subli.find('.card-text').html(e.description);
                            setStarRating($subli, e.difficulty);
                            break;
                    }
                    $subli.removeAttr('id');
                    $li.append($subli);
                    $subli.show();
                });
                break;
        }

        $li.removeAttr('id');
        $wkCard.find('.workoutDisplay > ul').append($li);
        $li.show();
    });

    $wkCard.find('.card-title').html(wk.title);
    $wkCard.find('.card-text').html(wk.description);
    $wkCard.find('.fav-counter').html(wk.favourites);
    $wkCard.find('.workoutAuthor').html('Created by ' + wk.author);

    $.each(wkExercises, function(i, ex) {
        $card = $('#ex-card-li-template').clone(true);
        $card.removeAttr('id');

        $card.find('.card-title').html(ex.name);
        $card.find('.card-text').html(ex.description);
        setStarRating($card, ex.difficulty);

        $wkCard.find('.exerciseDisplay').append($card);
        $card.show();
    });

    var exDataTarget = "exerciseCollapse-" + i;
    var wkDataTarget = "workoutCollapse-" + i;

    $wkCard.find('.exCollapseButton').attr('data-target', "#" + exDataTarget);
    $wkCard.find('.exerciseDisplay').attr('id', exDataTarget);

    $wkCard.find('.wkCollapseButton').attr('data-target', "#" + wkDataTarget);
    $wkCard.find('.workoutDisplay').attr('id', wkDataTarget);
    
    if ($wkCard.find('.card-footer').length) {
        var fav = $wkCard.find('.card-footer .fav-button');
        fav.attr('data-id', wk.slug);
        if (wk.favourite === true) {
            fav.addClass('favourite');
        }

        fav[0].addEventListener('click', function(e) {
            var favourite = 1;
            if ($(this).hasClass('favourite')) {
                $('.fav-button[data-id=' + wk.slug + ']').removeClass('favourite').addClass('unfavourite');
                var favourite = -1;
            } else {
                $('.fav-button[data-id=' + wk.slug + ']').removeClass('unfavourite').addClass('favourite');
            }
            setFavourite($(this).attr('data-id'), favourite);
        });

        var complete = $wkCard.find('.card-footer .wkCompleteButton');
        complete.attr('data-id', wk.slug);

        if (wk.can_complete) {
            complete[0].addEventListener('click', function(e) {
                $('.wkCompleteButton[data-id=' + wk.slug + ']').removeClass('btn-secondary').addClass('active disabled btn-success');
                $('.wkCompleteButton[data-id=' + wk.slug + ']').html('Times completed: ' + wk.complete_count);
                completeWorkout($(this).attr('data-id'));
            });
        } else {
            complete.removeClass('btn-secondary').addClass('active disabled btn-success');
            complete.html('Times completed: ' + wk.complete_count);
        }
    }

    return $wkCard;
};


function populateWorkoutResults(data, textStatus, jqXHR) {
    var workouts = data.workouts;
    var exercises = data.exercises;

    if (workouts.length === 0) {
        $('#noWorkouts').show();
    }

    $('#noWorkouts').nextAll().remove();
    $('#wotdComplete').nextAll().remove();
    $('#noUncompleted').nextAll().remove();

    var wotdExists = false;
    var allCompleted = true;

    $.each(workouts, function(i, wk) {
        $wkCard = createWorkoutCard(i, wk, exercises);

        if (wk.wotd === true) {
            wotdExists = true;
            $wkCard.find('.setWotdButton').remove();
            $wotd = $(document.createElement('p'));
            $wotd.addClass('lead');
            $icon = $(document.createElement('i'));
            $icon.addClass('fas fa-calendar-day');
            $wotd.append($icon);
            $icon.after('Workout of the Day');
            $wkCard.find('.footer').append($wotd);

            if (wk.can_complete) {
                $wotdCard = $wkCard.clone(true, true);
                
                if ($wkCard.find('.card-footer').length) {
                    $wotdCard.find('.card-footer .fav-button').attr('data-id', wk.slug);
                    $wotdCard.find('.card-footer .fav-button')[0].addEventListener('click', function(e) {
                        var favourite = 1;
                        if ($(this).hasClass('favourite')) {
                            $('.fav-button[data-id=' + wk.slug + ']').removeClass('favourite').addClass('unfavourite');
                            var favourite = -1;
                        } else {
                            $('.fav-button[data-id=' + wk.slug + ']').removeClass('unfavourite').addClass('favourite');
                        }
                        setFavourite($(this).attr('data-id'), favourite);
                    });
    
                    var complete = $wotdCard.find('.card-footer .wkCompleteButton');
                    complete.attr('data-id', wk.slug);
    
                    if (wk.can_complete) {
                        complete[0].addEventListener('click', function(e) {
                            $('.wkCompleteButton[data-id=' + wk.slug + ']').removeClass('btn-secondary').addClass('active disabled btn-success');
                            $('.wkCompleteButton[data-id=' + wk.slug + ']').html('Times completed: ' + wk.complete_count);
                            completeWorkout($(this).attr('data-id'));
                        });
                    }
                }
    
                var exDataTarget = "exerciseCollapse-wotd";
                var wkDataTarget = "workoutCollapse-wotd";
    
                $wotdCard.find('.exCollapseButton').attr('data-target', "#" + exDataTarget);
                $wotdCard.find('.exerciseDisplay').attr('id', exDataTarget);
    
                $wotdCard.find('.wkCollapseButton').attr('data-target', "#" + wkDataTarget);
                $wotdCard.find('.workoutDisplay').attr('id', wkDataTarget);
    
                $('#workoutOfTheDay').append($wotdCard);
                $wotdCard.show();    
            } else {
                $('#workoutOfTheDay').addClass('completed');
            }
        }

        $('#workoutResults').append($wkCard);

        if (wk.complete_count < 1) {
            allCompleted = false;

            $uncompleteCard = $wkCard.clone(true, true);
                
            if ($wkCard.find('.card-footer').length) {
                $uncompleteCard.find('.card-footer .fav-button').attr('data-id', wk.slug);
                $uncompleteCard.find('.card-footer .fav-button')[0].addEventListener('click', function(e) {
                    var favourite = 1;
                    if ($(this).hasClass('favourite')) {
                        $('.fav-button[data-id=' + wk.slug + ']').removeClass('favourite').addClass('unfavourite');
                        var favourite = -1;
                    } else {
                        $('.fav-button[data-id=' + wk.slug + ']').removeClass('unfavourite').addClass('favourite');
                    }
                    setFavourite($(this).attr('data-id'), favourite);
                });

                var complete = $uncompleteCard.find('.card-footer .wkCompleteButton');
                complete.attr('data-id', wk.slug);

                if (wk.can_complete) {
                    complete[0].addEventListener('click', function(e) {
                        $('.wkCompleteButton[data-id=' + wk.slug + ']').removeClass('btn-secondary').addClass('active disabled btn-success');
                        $('.wkCompleteButton[data-id=' + wk.slug + ']').html('Times completed: ' + wk.complete_count);
                        completeWorkout($(this).attr('data-id'));
                    });
                }
            }

            var exDataTarget = "exerciseCollapse-uncomplete-" + i;
            var wkDataTarget = "workoutCollapse-uncomplete-" + i;

            $uncompleteCard.find('.exCollapseButton').attr('data-target', "#" + exDataTarget);
            $uncompleteCard.find('.exerciseDisplay').attr('id', exDataTarget);

            $uncompleteCard.find('.wkCollapseButton').attr('data-target', "#" + wkDataTarget);
            $uncompleteCard.find('.workoutDisplay').attr('id', wkDataTarget);

            $('#uncompletedResults').append($uncompleteCard);
            $uncompleteCard.show();
        }

        $wkCard.show();
    });

    if (wotdExists !== false) {
        document.getElementById('#wotdRow').hidden = false;
    }

    if (allCompleted === true) {
        $('#noUncompleted').show();
    }
};

(function() {
    window.addEventListener('load', function() {
        form = document.getElementById('addWorkoutForm');

        if (form) {
            form.addEventListener('submit', function(event) {
                event.preventDefault();
                event.stopPropagation();
    
                var formValid = form.checkValidity();
                if (formValid === false) {
                    form.classList.add('was-validated');
                }
    
                if (checkValidWorkout() !== false && formValid !== false) {
                    var formArray = $(form).serializeArray();
                    var formData = {};
                    for (var i = 0; i < formArray.length; i++){
                        formData[formArray[i]['name']] = formArray[i]['value'];
                    }
    
                    var postData = {
                        formData: JSON.stringify(formData),
                        wkData: JSON.stringify(serializeWorkout())
                    }
    
                    $.ajax({
                        type: 'POST',
                        url: form.getAttribute('action'),
                        data: postData,
                    }).done(function(data, textStatus, jqXHR) {
                        $(form).children('.alert-danger').hide();
                        $(form).children('.alert-success').html('Workout added!').show().delay(5000).fadeOut(200);
                        $(form).find('input:text, textarea').val('');
                        clearWorkout();
                        fetchWorkouts(populateWorkoutResults);
                    }).fail(function(jqXHR, textStatus, err) {
                        $(form).children('.alert-danger').html(jqXHR.responseText).show().delay(5000).fadeOut(200);
                    });
                }
                
            }, false);    
        }
    }, false);
})();

$('.add-btn').click(function() {
    $(this).fadeToggle('fast');
    $(this).next('.add-btn-group').fadeToggle('fast');
});

$('.add-btn-group > button').click(function() {
    $(this).parent().fadeToggle('fast');
    $(this).parent().prev('.add-btn').fadeToggle('fast');
});

$('#setWotdModal').on('show.bs.modal', function(event) {
    var button = $(event.relatedTarget) 
    var slug = button.data('id');
    var modal = $(this)
    modal.find('#setWotdSlug').val(slug);
});

$('#setWotdConfirmButton').click(function(event) {
    var modal = $('#setWotdModal');
    var slug = modal.find('#setWotdSlug').val();

    $.ajax({
        type: 'PUT',
        url: '/workout/wotd',
        data: {
            slug: slug
        }
    }).done(function(data, textStatus, jqXHR) {
        modal.modal('hide');
        fetchWorkouts(populateWorkoutResults);
    }).fail(function(jqXHR, textStatus, err) {

    });
});

function fetchMostRecentWorkout() {
    $.ajax({
        type: 'GET',
        url: '/workout/recent',
        dataType: 'json'
    }).done(function(data, textStatus, jqXHR) {
        $('#noRecent').nextAll().remove();
        $('#recentCompleted span').html('');
        $('#recentCompleted span').html(data.workout.time_since + ' ago');
        if (data.workout.slug) {
            $wkCard = createWorkoutCard('recent', data.workout, data.exercises);
            $('#mostRecent').append($wkCard);
            $wkCard.show();
            $('#noRecent').hide();
        } else {
            $('#noRecent').show();
        }
    }).fail(function(jqXHR, textStatus, err) {

    });
};

function fetchMostCompletedWorkout() {
    $.ajax({
        type: 'GET',
        url: '/workout/complete',
        dataType: 'json'
    }).done(function(data, textStatus, jqXHR) {
        $('#noCompleted').nextAll().remove();
        if (data.workout.slug) {
            $wkCard = createWorkoutCard('completed', data.workout, data.exercises);
            $('#mostCompleted').append($wkCard);
            $wkCard.show();
            $('#noCompleted').hide();
        } else {
            $('#noCompleted').show();
        }
    }).fail(function(jqXHR, textStatus, err) {

    });
};


fetchWorkouts(populateWorkoutResults);