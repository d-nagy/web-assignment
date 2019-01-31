var itemContainers = [].slice.call(document.querySelectorAll('.board-column-content:not(#ex-block-template-content)'));
var columnGrids = [];
var boardGrid;

function createColumnGrid(container) {
    // Instantiate column grid.
    var grid = new Muuri(container, {
        items: '.board-item',
        layoutDuration: 400,
        layoutEasing: 'ease',
        dragEnabled: true,
        dragSort: function () {
            return columnGrids;
        },
        dragSortInterval: 0,
        dragSortPredicate: function(item, e) {
            var result = Muuri.ItemDrag.defaultSortPredicate(item, {
                threshold: 20
            });

            if (!item.getElement().classList.contains('board-column')) {
                var itemRect = item.getElement().getBoundingClientRect();
                var i = 0;
                for (i; i < columnGrids.length; i++) {
                    var grid = columnGrids[i];
                    if (grid === boardGrid) { continue; }

                    var block = grid.getElement().parentNode;
                    var blockRect = block.getBoundingClientRect();
                    var overlap = !(itemRect.bottom <  blockRect.top ||
                                    itemRect.top > blockRect.bottom);
                    if (overlap) {
                        var delta = (itemRect.top > blockRect.top) ? 
                                    blockRect.bottom - itemRect.top : 
                                    itemRect.bottom - blockRect.top;
                        
                        //- console.log(delta/item.getHeight());

                        if (delta >= item.getHeight() * 0.6) {
                            return {
                                index: result.index,
                                grid: grid
                            };
                        }
                    }
                }
            }

            return {
                index: result.index,
                grid: grid
            };
        },
        dragStartPredicate: {
            handle: '.drag-handle'
        },
        dragContainer: document.body,
        dragAxis: 'y',
        dragReleaseDuration: 400,
        dragReleaseEasing: 'ease'
    })
    .on('dragStart', function (item) {
        // Let's set fixed widht/height to the dragged item
        // so that it does not stretch unwillingly when
        // it's appended to the document body for the
        // duration of the drag.
        item.getElement().style.width = item.getWidth() + 'px';
        item.getElement().style.height = item.getHeight() + 'px';
    })
    .on('dragReleaseEnd', function (item) {
        // Let's remove the fixed width/height from the
        // dragged item now that it is back in a grid
        // column and can freely adjust to it's
        // surroundings.
        item.getElement().style.width = '';
        item.getElement().style.height = '';
        // Just in case, let's refresh the dimensions of all items
        // in case dragging the item caused some other items to
        // be different size.
        columnGrids.forEach(function (grid) {
            grid.refreshItems();
        });
    })
    .on('layoutStart', function () {
        // Let's keep the board grid up to date with the
        // dimensions changes of column grids.
        boardGrid.refreshItems().layout();
    })
    .on('receive', function () {
        if (grid.getItems().length === 1) {
            var $buttons = $(grid.getElement()).siblings('.add-btn-container').find('button');
            $buttons.removeClass('btn-outline-danger').addClass('btn-outline-dark');
        }
    });

    // Add the column grid reference to the column grids
    // array, so we can access it later on.
    columnGrids.push(grid);
};

// Define the column grids so we can drag those
// items around.
itemContainers.forEach(createColumnGrid);

// Instantiate the board grid so we can drag those
// columns around.
boardGrid = new Muuri('.board', {
    items: '.board-column, .board-item',
    layoutDuration: 400,
    layoutEasing: 'ease',
    dragEnabled: true,
    dragSort: function (item) {
        if (item.getElement().classList.contains('board-column')) {
            return [boardGrid];
        }
        return columnGrids;
    },
    dragSortInterval: 0,
    dragSortPredicate: function(item, e) {
        var result = Muuri.ItemDrag.defaultSortPredicate(item, {
            threshold: 60,
        });

        if (!item.getElement().classList.contains('board-column')) {
            var itemRect = item.getElement().getBoundingClientRect();
            var i = 0;
            for (i; i < columnGrids.length; i++) {
                var grid = columnGrids[i];
                if (grid === boardGrid) { continue; }

                var block = grid.getElement().parentNode;
                var blockRect = block.getBoundingClientRect();
                var overlap = !(itemRect.bottom <  blockRect.top ||
                                itemRect.top > blockRect.bottom);
                if (overlap) {
                    var delta = (itemRect.top > blockRect.top) ? 
                                blockRect.bottom - itemRect.top : 
                                itemRect.bottom - blockRect.top;
                    
                    if (delta >= item.getHeight() * 0.6) {
                        return {
                            index: result.index,
                            grid: grid
                        };
                    }
                }
            }
        }

        return result;
    },
    dragStartPredicate: {
        handle: '.board-column-header>.drag-handle, .board>.board-item>.board-item-content>.drag-handle'
    },
    dragAxis: 'y',
    dragReleaseDuration: 400,
    dragReleaseEasing: 'ease'
})
.on('dragStart', function (item) {
    // Let's set fixed widht/height to the dragged item
    // so that it does not stretch unwillingly when
    // it's appended to the document body for the
    // duration of the drag.
    item.getElement().style.width = item.getWidth() + 'px';
    item.getElement().style.height = item.getHeight() + 'px';
})
.on('dragReleaseEnd', function (item) {
    // Let's remove the fixed width/height from the
    // dragged item now that it is back in a grid
    // column and can freely adjust to it's
    // surroundings.
    item.getElement().style.width = '';
    item.getElement().style.height = '';
    // Just in case, let's refresh the dimensions of all items
    // in case dragging the item caused some other items to
    // be different size.
    columnGrids.forEach(function (grid) {
        grid.refreshItems();
    });
})
.on('receive', function () {
    if (boardGrid.getItems().length === 1) {
        var $buttons = $(boardGrid.getElement()).siblings('.add-btn-container').find('button');
        $buttons.removeClass('btn-outline-danger').addClass('btn-outline-dark');
    }
});

columnGrids.push(boardGrid);

$('.add-ex').click(function() {
    $ex = $('#ex-template').clone(true);
    $ex.removeAttr('id');
    var source = this.parentNode.parentNode;
    var grid = columnGrids.filter(function (g) {
        return g.getElement().nextSibling === source;
    })[0];
    grid.add($ex[0]);
    grid.show($ex[0]);
    $(this).parent().parent().parent().find('button').removeClass('btn-outline-danger').addClass('btn-outline-dark');
});

$('.add-ex-block').click(function() {
    $exBlock = $('#ex-block-template').clone(true);
    $exBlock.removeAttr('id');
    var source = this.parentNode.parentNode;
    var grid = columnGrids.filter(function (g) {
        return g.getElement().nextSibling === source;
    })[0];
    grid.add($exBlock[0]);
    grid.show($exBlock[0]);
    $content = $exBlock.find('.board-column-content');
    $content.removeAttr('id');
    createColumnGrid($content[0]);
    $(this).parent().parent().parent().find('button').removeClass('btn-outline-danger').addClass('btn-outline-dark');
});

$('.add-rest').click(function() {
    $rest = $('#rest-template').clone(true);
    $rest.removeAttr('id');
    var source = this.parentNode.parentNode;
    var grid = columnGrids.filter(function (g) {
        return g.getElement().nextSibling === source;
    })[0];
    grid.add($rest[0]);
    grid.show($rest[0]);
    $(this).parent().parent().parent().find('button').removeClass('btn-outline-danger').addClass('btn-outline-dark');
});

function checkValidWorkout() {
    var allSetsNotEmpty = true;

    function checkSetNotEmpty(grid) {
        var isEmpty = grid.getItems().length < 1;
        if (isEmpty) {
            allSetsNotEmpty = false;
            var $buttons = $(grid.getElement()).siblings('.add-btn-container').find('button');
            $buttons.removeClass('btn-outline-dark').addClass('btn-outline-danger');
        }
    }

    columnGrids.forEach(checkSetNotEmpty);

    var validForms = true;
    $('.workout-creator form').each(function() {
        var form = $(this)[0];
        if (form.checkValidity() === false) {
            form.classList.add('was-validated');
            validForms = false;
        }
    });

    if (!(allSetsNotEmpty && validForms)) { return false; }

    return true;
};

function serializeWorkout() {
    function serializeGrid(grid) {
        var items = grid.getItems();
        var json = [];

        items.forEach(function(item) {
            var $el = $(item.getElement());

            if ($el.hasClass('exercise-single')) {
                var ex = {
                    type: 'exercise-single',
                    slug: $el.find('select[name=inputExercise]').val(),
                    quantity: $el.find('input[name=quantity]').val(),
                    units: $el.find('input:radio:checked').val()
                };
                json.push(ex);
            } else if ($el.hasClass('rest')) {
                var rest = {
                    type: 'rest',
                    duration: $el.find('input[name=inputRest]').val()
                };
                json.push(rest);
            } else {
                var gridToSerialize = columnGrids.filter(function (g) {
                    return $el[0].contains(g.getElement());
                })[0];

                var block = {
                    type: 'exercise-block',
                    title: $el.find('input[name=sectionTitle]').val(),
                    reps: $el.find('input[name=sectionReps]').val(),
                    exercises: serializeGrid(gridToSerialize)
                }

                json.push(block);
            }
        });
        return json;
    };

    return serializeGrid(boardGrid);
};

function clearWorkout() {
    boardGrid.getItems().forEach(function(item) {
        boardGrid.remove(item, {removeElements: true});
    });

    columnGrids.forEach(function(grid) {
        if (grid !== boardGrid) {
            grid.destroy(true);
        }
    });
};

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
        fetchWorkouts(populateWorkoutResults);
    }).fail(function(jqXHR, textStatus, err) {
        console.log(jqXHR);
        console.log(textStatus);
        console.log(err);
    });
};


function populateWorkoutResults(data, textStatus, jqXHR) {
    var workouts = data.workouts;
    var exercises = data.exercises;

    if (workouts.length === 0) {
        $('#noWorkouts').show();
    }

    $('#noWorkouts').nextAll().remove();

    $.each(workouts, function(i, wk) {
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

                    $li.find('h6').html(ex.name + ' &times ' + item.quantity + ' ' + item.units);
                    $li.find('.card-title').html(ex.name);
                    $li.find('.card-text').html(ex.description);
                    setStarRating($li, ex.difficulty);
                    break;
                case "exercise-block":
                    $li = $('#ex-block-li-template').clone(true);
                    break;
            }

            $li.removeAttr('id');
            $wkCard.find('.workoutDisplay > ul').append($li);
            $li.show();
        });

        $wkCard.find('.card-title').html(wk.title);
        $wkCard.find('.card-text').html(wk.description);
        setStarRating($wkCard, wk.rating);
        $wkCard.find('.fav-counter').html(wk.favourites);
        $wkCard.find('.workoutAuthor').html('Created by ' + wk.author);

        $.each(exercises, function(i, ex) {
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

        $wkCard.find('.card-footer .fav-button').attr('data-id', wk.slug);
        $wkCard.find('.card-footer .fav-button')[0].addEventListener('click', function(e) {
            if ($(this).hasClass('favourite')) {
                $(this).removeClass('favourite').addClass('unfavourite');
            } else {
                $(this).removeClass('unfavourite').addClass('favourite');
            }
        });

        $wkCard.find('.card-footer .workout-rating').attr('data-id', wk.slug);

        if (wk.wotd === true) {
            $wkCard.find('.setWotdButton').remove();
            $wotd = $(document.createElement('p'));
            $wotd.addClass('lead');
            $icon = $(document.createElement('i'));
            $icon.addClass('fas fa-calendar-day');
            $wotd.append($icon);
            $icon.after('Workout of the Day');
            $wkCard.find('.footer').append($wotd);
            
            $wotdCard = $wkCard.clone(true);
            
            var exDataTarget = "exerciseCollapse-wotd";
            var wkDataTarget = "workoutCollapse-wotd";

            $wotdCard.find('.exCollapseButton').attr('data-target', "#" + exDataTarget);
            $wotdCard.find('.exerciseDisplay').attr('id', exDataTarget);

            $wotdCard.find('.wkCollapseButton').attr('data-target', "#" + wkDataTarget);
            $wotdCard.find('.workoutDisplay').attr('id', wkDataTarget);

            $('#workoutOfTheDay').append($wotdCard);
            $wotdCard.show();
        }

        $('#workoutResults').append($wkCard);

        $wkCard.show();
    });
};

(function() {
    window.addEventListener('load', function() {
        // Fetch all the forms we want to apply custom Bootstrap validation styles to
        var forms = document.getElementsByClassName('needs-validation');
        // Loop over them and prevent submission
        var validation = Array.prototype.filter.call(forms, function(form) {
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
        });
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

fetchWorkouts(populateWorkoutResults);