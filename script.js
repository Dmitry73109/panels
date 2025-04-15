$(function () {
  const $grid = $("#cardGrid");
  const $modal = $("#cardModal");
  const $form = $("#cardForm");
  const $modalTitle = $("#modalTitle");
  const $cardTitle = $("#cardTitle");
  const $cardDescription = $("#cardDescription");
  const $cardSize = $("#cardSize");
  const $cardId = $("#cardId");
  const $addCardBtn = $("#addCardBtn");
  const $closeModal = $(".close");
  const $toggleMoveBtn = $("#toggleMoveBtn");
  const $showHiddenBtn = $("#showHiddenBtn");

  let cards = [];
  let moveEnabled = false;

  //Sortable grid
  $grid.sortable({
    items: ".card",
    placeholder: "placeholder",
    forcePlaceholderSize: true,
    tolerance: "pointer",
    disabled: true,
    start: function (e, ui) {
      const size = parseInt(ui.item.data("size"));
      ui.placeholder.css("grid-column", `span ${size * 2}`);
    },
    update: saveCards //Save order
  });

  //Load cards from localStorage
  function loadCards() {
    const stored = localStorage.getItem("cards");
    if (stored) {
      cards = JSON.parse(stored);
      renderCards();
    }
  }

  //Save current card list
  function saveCards() {
    cards = [];
    $grid.children(".card").each(function () {
      const $card = $(this);
      cards.push({
        id: $card.data("id"),
        title: $card.find("h4").text(),
        description: $card.find("p").text(),
        size: parseInt($card.data("size")),
        hidden: $card.hasClass("hidden")
      });
    });
    localStorage.setItem("cards", JSON.stringify(cards));
  }

  //Render cards
  function renderCards() {
    $grid.empty();
    cards.forEach(card => {
      if (!card.hidden) {
        $grid.append(createCardElement(card));
      }
    });
  }

  //Create individual card element with actions
  function createCardElement(card) {
    const $card = $(`
      <div class="card size-${card.size}" data-id="${card.id}" data-size="${card.size}">
        <div class="menu-btn">⋮</div>
        <div class="context-menu">
          <button class="edit-btn">Edit</button>
          <button class="delete-btn">Delete</button>
          <button class="move-btn">Move</button>
          <button class="hide-btn">Hide</button>
        </div>
        <img class="card-icon" src="123.png" alt="icon">
        <h4>${card.title}</h4>
        <p>${card.description}</p>
      </div>
    `);

    //Toggle context menu
    $card.find(".menu-btn").on("click", function (e) {
      e.stopPropagation();
      $(".context-menu").hide();
      $(this).siblings(".context-menu").toggle();
    });

    //Edit card
    $card.find(".edit-btn").on("click", function () {
      openEditModal(card);
      $(".context-menu").hide();
    });

    //Delete card
    $card.find(".delete-btn").on("click", function () {
      cards = cards.filter(c => c.id !== card.id);
      localStorage.setItem("cards", JSON.stringify(cards));
      renderCards();
    });

    //Toggle move mode
    $card.find(".move-btn").on("click", function () {
      toggleMoveMode();
      $(".context-menu").hide();
    });

    //Hide card
    $card.find(".hide-btn").on("click", function () {
      card.hidden = true;
      localStorage.setItem("cards", JSON.stringify(cards));
      renderCards();
    });

    return $card;
  }

  //Close any open context menus on outside click
  $(document).on("click", function () {
    $(".context-menu").hide();
  });

  //Open modal to edit a card
  function openEditModal(card) {
    $modalTitle.text("Edit Card");
    $cardTitle.val(card.title);
    $cardDescription.val(card.description);
    $cardSize.val(card.size);
    $cardId.val(card.id);
    $modal.show();
  }

  //Open modal to add a new card
  $addCardBtn.on("click", function () {
    $modalTitle.text("Add Card");
    $form[0].reset();
    $cardId.val("");
    $modal.show();
  });

  //Close modal
  $closeModal.on("click", function () {
    $modal.hide();
  });

  //Handle form submission for add/edit
  $form.on("submit", function (e) {
    e.preventDefault();
    const id = $cardId.val() || Date.now();
    const newCard = {
      id: parseInt(id),
      title: $cardTitle.val(),
      description: $cardDescription.val(),
      size: parseInt($cardSize.val()),
      hidden: false
    };

    const existingIndex = cards.findIndex(c => c.id === newCard.id);
    if (existingIndex !== -1) {
      cards[existingIndex] = newCard;
    } else {
      cards.push(newCard);
    }

    localStorage.setItem("cards", JSON.stringify(cards));
    renderCards();
    $modal.hide();
  });

  //Enable or disable drag mode
  function toggleMoveMode(forceState = null) {
    moveEnabled = forceState !== null ? forceState : !moveEnabled;
    $grid.sortable("option", "disabled", !moveEnabled);
    $toggleMoveBtn.text(moveEnabled ? "Save Order" : "Move Cards");
    $(".move-btn").text(moveEnabled ? "Stop" : "Move");
  }

  //Toggle drag mode on button click
  $toggleMoveBtn.on("click", function () {
    toggleMoveMode();
  });

  //Show hidden cards by restoring them to the grid
  $showHiddenBtn.on("click", function () {
    cards.forEach(card => {
      if (card.hidden) {
        card.hidden = false;
        const $cardEl = createCardElement(card).addClass("revealed");
        $grid.append($cardEl);
        setTimeout(() => {
          $cardEl.removeClass("revealed");
        }, 3000);
      }
    });
    saveCards();
  });

  //Initial load
  loadCards();
});
