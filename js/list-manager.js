// Trello.com loads lists after whole page loaded and DOM is ready so we need to
// wait for some DOM-elements appear on page and then react on this change.
// Custom jQuery plugin was used to wait while required DOM-element will be created.
// See https://gist.github.com/md55/6565078

(function ($, window) {
    // It is used to resize the wrapper around all when the top header gets too big
    function resizeBoardLayout() {
        var bannerHeight, boardHeaderHeight, headerHeight, height;
        height = $(window).height();
        headerHeight = $("#header").outerHeight();
        bannerHeight = $(".header-banner:visible").outerHeight();
        boardHeaderHeight = this.$(".board-header").outerHeight();
        this.$(".board-canvas").height(height - (headerHeight + bannerHeight + boardHeaderHeight));
    }

    function createDOMElements() {
        if (!$('#list-manager').length) {
            $('<span/>').addClass('board-header-btn')
                .addClass('board-header-btn-without-icon')
                .addClass('toggle-list-manager')
                .text('Toggle List Manager')
                .appendTo('.board-header-btns.mod-left');
            $('<ul/>').attr('id', 'list-manager').hide().appendTo('.board-header');
            $('.toggle-list-manager').click(function () {
                $('#list-manager').toggle()
            });
            $('#list-manager').click(handleClick)
        }
        renderMenu();
    }

    $(window).on('load', function () {
        createDOMElements();
        // Used to return element of class .list-wrapper that have changed and only those
        new MutationSummary({
            queries: [{
                element: '.list-wrapper'
            }],
            callback: createDOMElements
        });
    });




    function guid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    }

    // Update list name on change
    $('.list-wrapper').waitUntilExists(function () {
        $.get(
            window.location.href+".json",
            $.debounce(250,setupIDs)
        );
    });

    function setupIDs(data) {
        $('.list-wrapper').each(function () {
            var $list = $(this);
            var listName = $list.find('textarea').text();
            if (!$(this).attr('data-list-id')) {
                listData = data.lists.filter(function(object) {
                    return listName === object.name;
                })[0];
                if (listData) {
                    $(this).attr('data-list-id', listData.id);
                } else {
                    $(this).attr('data-list-id', guid());
                }
            }
        });
        createDOMElements();
    }

    function handleClick(event) {
        var $target = $(event.target);
        if ($target.prop("tagName") !== 'LI') {
            return;
        }

        var listId = $target.attr('data-list-id');
        if (listId === 'all') {
            $('.list-wrapper').each(function () {
                var $list = $(this);
                if ($target.hasClass('show-all')) {
                    $list.removeClass('hide-list');
                } else {
                    $list.addClass('hide-list');
                }
            });
            // Rebuild menu to set correct status.
            renderMenu();
        } else {
            var $list = $(".list-wrapper[data-list-id='" + listId + "']");

            if ($list.hasClass("hide-list")) {
                $list.removeClass('hide-list');
                $target.addClass('shown').removeClass('hidden');
            } else {
                $list.addClass('hide-list');
                $target.addClass('hidden').removeClass('shown');
            }
        }
    }

    function createToogleTab($list) {
        var listName = $list.find('textarea').text();
        var listId = $list.attr('data-list-id');
        if (!listName) {
            listName = "Add a list";
        }

        var $tab = $('<li/>').attr('data-list-id', listId).text(listName);

        if ($list.hasClass('hide-list')) {
            $tab.addClass('hidden');
        } else {
            $tab.addClass('shown');
        }
        return $tab;
    }

    function renderMenu() {
        // This variable will collect all tabs in top menu.
        var ul = $('<ul/>');

        $('.list-wrapper').each(function () {
            ul.append(createToogleTab($(this)));
        });
        // Add Show All ad Hide All tab
        ul.append($('<li/>').attr('data-list-id', 'all').text('Hide all').addClass('hide-all'));
        ul.append($('<li/>').attr('data-list-id', 'all').text('Show all').addClass('show-all'));

        // Replace tabs in the Menu.
        $('#list-manager').html(ul.html());
        resizeBoardLayout();
    }
})(jQuery, window);
