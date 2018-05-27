// PURE FUNCTIONS

// replicateAttributesFromNode :: Node, Node -> Node
const replicateAttributesFromNode = (node, nodeToCopy) => {
    node = node.cloneNode(true); // act on a copy
    let attributesToCopy = arrayLikeToArray(nodeToCopy.attributes);
    attributesToCopy.map((item) => node.attributes.setNamedItem(item.cloneNode(true)));
    return node
}

// classNameFromClassListItems :: HTMLCollection -> String
const classNameFromClassListItems = (classListItems) => {
    return arrayLikeToArray(classListItems)
    .map((item) => item.value.trim())
    .join(' ');
}


// IMPURE FUNCTIONS

// addSelectedClassTo just adds a little class to the element to show it's selected
const addSelectedClassTo = (element) => {
    element.classList.add('_parchment_-selected')
}

const clearSelectedClass = () => {
    arrayLikeToArray(document.getElementsByClassName('_parchment_-selected'))
        .map((item) => item.classList.remove('_parchment_-selected'))
}

// selectNode :: Node -> Node
const selectNode = (node) => {
    if (isElement(node)) {
        if (node.id == '_parchment_-page') return
    }
    clearSelectedClass();
    GS.selectedNode = elementOf(node);
    updateSideBar();
    if (isNode(node)) {
        addSelectedClassTo(GS.selectedNode);
        GS.panelIndexToStyleSheetIndex = cssRulesOfElement(document.styleSheets[1], GS.selectedNode).map(indexOfCssRule);
    } else {
        GS.panelIndexToStyleSheetIndex = []
    }
    return GS.selectedNode
}

// selectNodeRelatedBy propertyOfNode -> \selects a node
const selectNodeRelatedBy = (property) => {
    let newNode = nodeFromNodeProperty(GS.selectedNode, property)
    if(isNode(newNode)) {
        selectNode(newNode)
    }
}

// selectNodeAtCursorPosition just calls selectNode on the window's selection
const selectNodeAtCursorPosition = () => selectNode(window.getSelection().anchorNode);

const deleteSelectedElement = () => {
    GS.selectedNode.remove()
    selectNode(null)
}

// updateSelectedElement just changes the selected element itself
const updateSelectedElement = () => {
    let selectedElement = GS.selectedNode;

    let newTagName = document.getElementById("_parchment_-tagName").value.trim();
    if (newTagName.length < 1) { return }

    // just duplicate it with a new tag name
    let newElement = document.createElement(newTagName);
    replicateAttributesFromNode(newElement, selectedElement);

    // now set all the attributes they've edited
    newElement.id = document.getElementById("_parchment_-tagId-inner").value.trim();
    newElement.classList.remove('_parchment_-selected');
    newElement.className = classNameFromClassListItems(
        document.getElementById('_parchment_-sidebar-classes')
        .getElementsByTagName('input')
    )

    // copy child nodes
    while (selectedElement.firstChild) {
        newElement.appendChild(selectedElement.firstChild)
    }
    
    // replace element
    selectedElement.parentNode.replaceChild(newElement, selectedElement)
    GS.selectedNode = elementOf(newElement)
}