var suggestions = [
  {title: ""},
  {title: "Mozilla Firefox"},
  {title: "Mozilla Foundation"},
  {title: "Mongolia"},
  {title: "Mozillians"},
  {title: "Morbid Humor"},
  {title: "Mozart"},
  {title: "Mozfest"}
];
var originalQuery = "";

// Turn all IDs into selectable vars
varify();

// Typing
searchField.addEventListener( 'keyup', function(e) {
  if ( searchField.value !== '' ) {
    popup.style.display = "block";
  } else {
    popup.style.display = "none";
  }
  if ( !contains( ["Up", "Down", "Left", "Right", "Tab"], e.key ) ) {
    originalQuery = searchField.value;
    updateSuggestions();
  }
});



// Navigating
searchField.addEventListener( 'keydown', function(e) {
  // Abort if the pressed key is not a navigation key
  if ( !contains(["Up", "Down", "Left", "Right", "Tab"], e.key) ) {
    return;
  }

  var leavingCurrentRange = false;
  var currentlyActive = select("li.active");
  var next = null;

  // Navigating
  if ( contains( ["Up", "Down", "Left", "Right"], e.key ) ) {
    next = maybe(e.key==="Down" || e.key==="Right", 
                     currentlyActive.nextElementSibling, 
                     currentlyActive.previousElementSibling);

  }

  // Tab navigation
  if ( e.key === "Tab" ) {
    e.preventDefault();
    if ( currentlyActive.parentElement.id==="suggestion-container" || !currentlyActive.nextElementSibling ) {
      leavingCurrentRange = true;
    } else {
      next = currentlyActive.nextElementSibling;
    }
  }

  // Jump to the next entry
  if ( next ) {
    after( 5, function() {
      searchField.setSelectionRange( searchField.value.length, searchField.value.length );
    });
  } else {
    leavingCurrentRange = true;
  }

  // Jumping in and out of the current navigation section
  if (leavingCurrentRange) {
    currentlyActive.classList.remove("active");
    var nextSection;

    if ( currentlyActive.parentElement.id === "suggestion-container" ) {
      nextSection = oneOffs;
    } else {
      nextSection = suggestionContainer;
    }

    if ( e.key!=="Tab" ) {
      searchField.value = originalQuery;
      inject( "Search <strong>"+ searchField.value +"</strong> on:", searchHeadline );
    }

    if ( e.key==="Down" || e.key==="Right" || e.key==="Tab" ) {
      next = nextSection.children[0];
    } else {
      next = nextSection.children[nextSection.children.length-1];
    }
  }

  // Update the highlight
  currentlyActive.classList.remove("active");
  next.classList.add("active");
  if ( next.parentElement.id==="suggestion-container" ) {
    searchField.value = next.innerHTML;
    inject( "Search <strong>"+ searchField.value +"</strong> on:", searchHeadline );
  }
});



// Focusing
searchField.addEventListener( 'focus', function() {
  if ( searchField.value !== '' ) {
    popup.style.display = "block";
    updateSuggestions();
  }
});

searchField.addEventListener( 'blur', function() {
  popup.style.display = "none";
});

function updateSuggestions() {
  // update the dummy entry
  suggestions[0].title = searchField.value;
  // typing
  var activeSuggestions = maybe( searchField.value==='', [suggestions[0]], 
                                                         suggestions.filter( function( item ) {
                                                           return item.title.toLowerCase().startsWith( searchField.value.toLowerCase() );
                                                        }));
  if ( activeSuggestions.length < 2 ) {
    activeSuggestions = [{title:''}, {title:searchField.value}];
  }
  var newHTML = "";
  activeSuggestions.forEach( function( item, index ) {
    newHTML += "<li" + maybe(index===0, " class='active'", "") + ">" + item.title + "</li>";
  });
  inject( newHTML, suggestionContainer );

  inject( "Search <strong>"+ searchField.value +"</strong> on:", searchHeadline );
}




function collect(selector) {
  return document.querySelectorAll( selector );
}

function select(selector)  {
  return document.querySelectorAll( selector )[0];
}

function inject(content, element) {
  if ( typeof element === "string" ) {
    select( element ).innerHTML = content;
  } else {
    element.innerHTML = content;
  }
}

function maybe(test, trueValue, falseValue) {
  if ( test ) {
    return trueValue;
  } else {
    return falseValue;
  }
}

function contains(where, what) {
  if ( where.indexOf( what ) > -1 ) {
    return true;
  } else {
    return false;
  }
}

function varify(scope, target) {
  if ( !target ) { target = window };
  if ( !scope ) { scope = document };
  var elements = scope.querySelectorAll("[id]")
  for (var i=0; i<elements.length; i++) {
    var item = elements[i];
    target[camelCase( item.id )] = select( "#"+item.id );
  }
}

function camelCase(str) {
  return str.replace(/\W+(.)/g, function (x, chr) {
    return chr.toUpperCase();
  });
}

function after(time, fn) {
  window.setTimeout( fn, time );
}