(function ($, window) {
    var homeUrl =  window.location.href;
    $(window).on('load', function () {
        debouncedCreateDOMElements();
        // Used to return element of class .list-wrapper that have changed and only those
        new MutationSummary({
            queries: [{
                element: '.list-wrapper'
            }],
            callback: debouncedCreateDOMElements
        });
    });

    $.get(
        homeUrl+".json",
        function (data) {
            setupIDs(data);
            restoreFromLocalStorage();
            // Update list name on change
            $('.list-wrapper').waitUntilExists(debouncedGetListIDs);
        }
    );

    $(window).unload(function () {
        storeInLocaltrorage();
    });

    const debouncedGetListIDs = $.debounce(2000, getListIDs);
    function getListIDs() {
        $.get(
            homeUrl+".json",
            setupIDs
        );
    }

    // It is used to resize the wrapper around all when the top header gets too big
    function resizeBoardLayout() {
        var bannerHeight, boardHeaderHeight, headerHeight, height;
        height = $(window).height();
        headerHeight = $("#header").outerHeight();
        bannerHeight = $(".header-banner:visible").outerHeight();
        boardHeaderHeight = this.$(".board-header").outerHeight();
        this.$(".board-canvas").height(height - (headerHeight + bannerHeight + boardHeaderHeight));
    }

    const debouncedCreateDOMElements = $.debounce(250,createDOMElements);
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

    function setupIDs(data) {
        $('.list-wrapper').each(function () {
            var $list = $(this);
            var listName = $list.find('textarea').text();
            if (!$(this).attr('data-list-id')) {
                var listData = data.lists.filter(function(object) {
                    return listName === object.name;
                })[0];
                if (listData) {
                    $(this).attr('data-list-id', listData.id);
                } else {
                    $(this).attr('data-list-id', 'add-list');
                }
            }
        });
        debouncedCreateDOMElements();
    }

    function handleClick(event) {
        var $target = $(event.target);
        if ($target.prop("tagName") !== 'LI') {
            return;
        }

        var listId = $target.attr('data-list-id');
        if (listId === 'all') {
            var $lists = $('.list-wrapper');
            if ($target.hasClass('show-all')) {
                $lists.removeClass('hide-list');
            } else {
                $lists.addClass('hide-list');
            }
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

    function restoreFromLocalStorage() {
        $('.list-wrapper').each(function(){
            var $list = $(this);
            var listId = $list.attr('data-list-id');
            var state = localStorage.getItem('list-manager-'+ listId);
            if (state === "hide-list") {
                $list.addClass('hide-list');
            }
        });
    }

    function storeInLocaltrorage() {
        $lists = $('.list-wrapper');
        for (var i = 0;i<$lists.length;i++) {
            var $list = $($lists.get(i));
            var listId = $list.attr('data-list-id');
            if ($list.hasClass('hide-list')) {
                localStorage.setItem('list-manager-'+ listId, 'hide-list');
            } else {
                localStorage.setItem('list-manager-'+ listId, 'show-list');
            }
        }
    }

})(jQuery, window);
