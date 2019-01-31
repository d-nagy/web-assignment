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
    $("#dismiss").click();
});

$('#workoutLink').click(function() {
    $('#content > .row').hide();
    $('#workouts').show();
    fetchExercises(populateExerciseList);
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

var itemToRemove;
var gridToRemoveFrom;

$(document).on('shown.bs.modal', '#removeBlockModal', function(event) {
    var triggerElement = event.relatedTarget;
    itemToRemove = triggerElement.parentNode.parentNode;
    console.log(itemToRemove);
    gridToRemoveFrom = columnGrids.filter(function (g) {
        return g.getItems(itemToRemove).length > 0;
    })[0];
    //- console.log(gridToRemoveFrom);
});

$('#confirmRemove').click(function() {
    if ($(itemToRemove).hasClass('muuri-item')) {
        gridToRemoveFrom.remove(itemToRemove);
        if ($(itemToRemove).hasClass('board-column')) {
            var gridToRemove = columnGrids.filter(function (g) {
                return itemToRemove.contains(g.getElement());
            })[0];
            var index = columnGrids.indexOf(gridToRemove);
            if (index > -1) { columnGrids.splice(index, 1); }
        }
    } else if ($(itemToRemove).hasClass('exercise-card')) {
        deleteExercise($(itemToRemove).attr('data-slug'));
    } else if ($(itemToRemove).hasClass('workout-card')) {
        deleteWorkout($(itemToRemove).attr('data-slug'));
    };

    $(itemToRemove).remove();
});

function setStarRating(container, value) {
    var colors = ['#37ce1f', '#b8ce1f', '#ffdb4c', '#ff923f', '#e41c1c'];
    var color = colors[parseInt(value) - 1];
    $star = container.find('.star' + value);
    $stars = $star.prevUntil('.rating-static');
    $star.removeClass('far').addClass('fas').css('color', color);
    $stars.removeClass('far').addClass('fas').css('color', color);
};

$('.exCollapseButton, .wkCollapseButton, .userStatsCollapseButton').click(function() {
    $(this).children('i').toggleClass('fa-angle-down').toggleClass('fa-angle-up');
});