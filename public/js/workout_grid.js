/**
 *
 * @param {*} container
 */
function createColumnGrid(container) {
  // Instantiate column grid.
  const grid = new Muuri(container, {
    items: '.board-item',
    layoutDuration: 400,
    layoutEasing: 'ease',
    dragEnabled: true,
    dragSort: function() {
      return columnGrids;
    },
    dragSortInterval: 0,
    dragSortPredicate: function(item, e) {
      const result = Muuri.ItemDrag.defaultSortPredicate(item, {
        threshold: 20,
      });

      if (!item.getElement().classList.contains('board-column')) {
        const itemRect = item.getElement().getBoundingClientRect();
        let i = 0;
        for (i; i < columnGrids.length; i++) {
          const grid = columnGrids[i];
          if (grid === boardGrid) {
            continue;
          }

          const block = grid.getElement().parentNode;
          const blockRect = block.getBoundingClientRect();
          const overlap = !(itemRect.bottom < blockRect.top ||
                                    itemRect.top > blockRect.bottom);
          if (overlap) {
            const delta = (itemRect.top > blockRect.top) ?
              blockRect.bottom - itemRect.top :
              itemRect.bottom - blockRect.top;

            // - console.log(delta/item.getHeight());

            if (delta >= item.getHeight() * 0.6) {
              return {
                index: result.index,
                grid: grid,
              };
            }
          }
        }
      }

      return {
        index: result.index,
        grid: boardGrid,
      };
    },
    dragStartPredicate: {
      handle: '.drag-handle',
    },
    dragContainer: document.body,
    dragAxis: 'y',
    dragReleaseDuration: 400,
    dragReleaseEasing: 'ease',
  })
      .on('dragStart', function(item) {
      // Let's set fixed width/height to the dragged item
      // so that it does not stretch unwillingly when
      // it's appended to the document body for the
      // duration of the drag.
        item.getElement().style.width = item.getWidth() + 'px';
        item.getElement().style.height = item.getHeight() + 'px';
      })
      .on('dragReleaseEnd', function(item) {
      // Let's remove the fixed width/height from the
      // dragged item now that it is back in a grid
      // column and can freely adjust to it's
      // surroundings.
        item.getElement().style.width = '';
        item.getElement().style.height = '';
        // Just in case, let's refresh the dimensions of all items
        // in case dragging the item caused some other items to
        // be different size.
        columnGrids.forEach(function(grid) {
          grid.refreshItems();
        });
      })
      .on('layoutStart', function() {
      // Let's keep the board grid up to date with the
      // dimensions changes of column grids.
        boardGrid.refreshItems().layout();
      })
      .on('receive', function() {
        if (grid.getItems().length === 1) {
          const $buttons = $(grid.getElement())
              .siblings('.add-btn-container').find('button');
          $buttons.removeClass('btn-outline-danger')
              .addClass('btn-outline-dark');
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
  dragSort: function(item) {
    if (item.getElement().classList.contains('board-column')) {
      return [boardGrid];
    }
    return columnGrids;
  },
  dragSortInterval: 0,
  dragSortPredicate: function(item, e) {
    const result = Muuri.ItemDrag.defaultSortPredicate(item, {
      threshold: 60,
    });

    if (!item.getElement().classList.contains('board-column')) {
      const itemRect = item.getElement().getBoundingClientRect();
      let i = 0;
      for (i; i < columnGrids.length; i++) {
        const grid = columnGrids[i];
        if (grid === boardGrid) {
          continue;
        }

        const block = grid.getElement().parentNode;
        const blockRect = block.getBoundingClientRect();
        const overlap = !(itemRect.bottom < blockRect.top ||
                                itemRect.top > blockRect.bottom);
        if (overlap) {
          const delta = (itemRect.top > blockRect.top) ?
            blockRect.bottom - itemRect.top :
            itemRect.bottom - blockRect.top;

          if (delta >= item.getHeight() * 0.6) {
            return {
              index: result.index,
              grid: grid,
            };
          }
        }
      }
    }

    return result;
  },
  dragStartPredicate: {
    handle: '.board-column-header>.drag-handle, ' +
            '.board>.board-item>.board-item-content>.drag-handle',
  },
  dragAxis: 'y',
  dragReleaseDuration: 400,
  dragReleaseEasing: 'ease',
})
    .on('dragStart', function(item) {
    // Let's set fixed widht/height to the dragged item
    // so that it does not stretch unwillingly when
    // it's appended to the document body for the
    // duration of the drag.
      item.getElement().style.width = item.getWidth() + 'px';
      item.getElement().style.height = item.getHeight() + 'px';
    })
    .on('dragReleaseEnd', function(item) {
    // Let's remove the fixed width/height from the
    // dragged item now that it is back in a grid
    // column and can freely adjust to it's
    // surroundings.
      item.getElement().style.width = '';
      item.getElement().style.height = '';
      // Just in case, let's refresh the dimensions of all items
      // in case dragging the item caused some other items to
      // be different size.
      columnGrids.forEach(function(grid) {
        grid.refreshItems();
      });
    })
    .on('receive', function() {
      if (boardGrid.getItems().length === 1) {
        const $buttons = $(boardGrid.getElement())
            .siblings('.add-btn-container').find('button');
        $buttons.removeClass('btn-outline-danger').addClass('btn-outline-dark');
      }
    });

columnGrids.push(boardGrid);

$('.add-ex').click(function() {
  $ex = $('#ex-template').clone(true);
  $ex.removeAttr('id');
  const source = this.parentNode.parentNode;
  const grid = columnGrids.filter(function(g) {
    return g.getElement().nextSibling === source;
  })[0];
  grid.add($ex[0]);
  grid.show($ex[0]);
  $(this).parent().parent().parent().find('button')
      .removeClass('btn-outline-danger').addClass('btn-outline-dark');
});

$('.add-ex-block').click(function() {
  $exBlock = $('#ex-block-template').clone(true);
  $exBlock.removeAttr('id');
  const source = this.parentNode.parentNode;
  const grid = columnGrids.filter(function(g) {
    return g.getElement().nextSibling === source;
  })[0];
  grid.add($exBlock[0]);
  grid.show($exBlock[0]);
  $content = $exBlock.find('.board-column-content');
  $content.removeAttr('id');
  createColumnGrid($content[0]);
  $(this).parent().parent().parent().find('button')
      .removeClass('btn-outline-danger').addClass('btn-outline-dark');
});

$('.add-rest').click(function() {
  $rest = $('#rest-template').clone(true);
  $rest.removeAttr('id');
  const source = this.parentNode.parentNode;
  const grid = columnGrids.filter(function(g) {
    return g.getElement().nextSibling === source;
  })[0];
  grid.add($rest[0]);
  grid.show($rest[0]);
  $(this).parent().parent().parent().find('button')
      .removeClass('btn-outline-danger').addClass('btn-outline-dark');
});

/**
 *
 * @return {*}
 */
function checkValidWorkout() {
  let allSetsNotEmpty = true;

  /**
   *
   * @param {*} grid
   */
  function checkSetNotEmpty(grid) {
    const isEmpty = grid.getItems().length < 1;
    if (isEmpty) {
      allSetsNotEmpty = false;
      const $buttons = $(grid.getElement())
          .siblings('.add-btn-container').find('button');
      $buttons.removeClass('btn-outline-dark').addClass('btn-outline-danger');
    }
  }

  columnGrids.forEach(checkSetNotEmpty);

  let validForms = true;
  $('.workout-creator form').each(function() {
    const form = $(this)[0];
    if (form.checkValidity() === false) {
      form.classList.add('was-validated');
      validForms = false;
    }
  });

  if (!(allSetsNotEmpty && validForms)) {
    return false;
  }

  return true;
};

/**
 *
 * @return {*}
 */
function serializeWorkout() {
  /**
   *
   * @param {*} grid
   * @return {*}
   */
  function serializeGrid(grid) {
    const items = grid.getItems();
    const json = [];

    items.forEach(function(item) {
      const $el = $(item.getElement());

      if ($el.hasClass('exercise-single')) {
        const ex = {
          type: 'exercise-single',
          slug: $el.find('select[name=inputExercise]').val(),
          quantity: $el.find('input[name=quantity]').val(),
          units: $el.find('input:radio:checked').val(),
        };
        json.push(ex);
      } else if ($el.hasClass('rest')) {
        const rest = {
          type: 'rest',
          duration: $el.find('input[name=inputRest]').val(),
        };
        json.push(rest);
      } else {
        const gridToSerialize = columnGrids.filter(function(g) {
          return $el[0].contains(g.getElement());
        })[0];

        const block = {
          type: 'exercise-block',
          title: $el.find('input[name=sectionTitle]').val(),
          reps: $el.find('input[name=sectionReps]').val(),
          exercises: serializeGrid(gridToSerialize),
        };

        json.push(block);
      }
    });
    return json;
  };

  return serializeGrid(boardGrid);
};

/**
 *
 */
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
