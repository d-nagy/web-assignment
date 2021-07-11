let itemToRemove;
let gridToRemoveFrom;
const itemContainers = [].slice.call(
    document.querySelectorAll(
        '.board-column-content:not(#ex-block-template-content)',
    ),
);
const columnGrids = [];
let boardGrid;

$(document).on('shown.bs.modal', '#removeBlockModal', function(event) {
  const triggerElement = event.relatedTarget;
  itemToRemove = triggerElement.parentNode.parentNode;
  gridToRemoveFrom = columnGrids.filter(function(g) {
    return g.getItems(itemToRemove).length > 0;
  })[0];
});

$('#confirmRemove').click(function() {
  if ($(itemToRemove).hasClass('muuri-item')) {
    gridToRemoveFrom.remove(itemToRemove);
    if ($(itemToRemove).hasClass('board-column')) {
      const gridToRemove = columnGrids.filter(function(g) {
        return itemToRemove.contains(g.getElement());
      })[0];
      const index = columnGrids.indexOf(gridToRemove);
      if (index > -1) {
        columnGrids.splice(index, 1);
      }
    }
    $('#removeBlockModal').modal('hide');
    $(itemToRemove).remove();
  } else if ($(itemToRemove).hasClass('exercise-card')) {
    deleteExercise($(itemToRemove).attr('data-slug'));
  } else if ($(itemToRemove).hasClass('workout-card')) {
    deleteWorkout($(itemToRemove).attr('data-slug'));
  }
});

/**
 *
 * @param {*} container
 * @param {*} value
 */
function setStarRating(container, value) {
  const colors = ['#37ce1f', '#b8ce1f', '#ffdb4c', '#ff923f', '#e41c1c'];
  const color = colors[parseInt(value) - 1];
  $star = container.find('.star' + value);
  $stars = $star.prevUntil('.rating-static');
  $star.removeClass('far').addClass('fas').css('color', color);
  $stars.removeClass('far').addClass('fas').css('color', color);
};

$('.exCollapseButton, .wkCollapseButton').click(function() {
  $(this).children('i').toggleClass('fa-angle-down').toggleClass('fa-angle-up');
});
