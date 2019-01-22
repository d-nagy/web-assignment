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
});

var itemToRemove;
var gridToRemoveFrom;

$(document).on('shown.bs.modal', '#removeBlockModal', function(event) {
    var triggerElement = event.relatedTarget;
    itemToRemove = triggerElement.parentNode.parentNode;
    gridToRemoveFrom = columnGrids.filter(function (g) {
        return g.getItems(itemToRemove).length > 0;
    })[0];
    //- console.log(gridToRemoveFrom);
});

$('#confirmRemove').click(function() {
    gridToRemoveFrom.remove(itemToRemove);
    $(itemToRemove).remove();
});