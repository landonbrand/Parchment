// IMPURE FUNCTIONS

const parchmentOnMouseUp = (event) => {
    selectNodeAtCursorPosition()
}

const parchmentEdited = (event) => {
    newPageContents = document.getElementById("_parchment_-page").textContent
    if (newPageContents !== GS.pageContents) selectNodeAtCursorPosition()
    GS.pageContents = newPageContents
}

document.onkeydown = function(e) {
    // console.log(e.key)
    // alt + shift + e to log selectedRegion? weird shortcut tho
    if (e.keyCode === 180 && e.altKey === true) {
        e.preventDefault();
        // console.log(document.styleSheets)
        console.log(selectedRegion)
        console.log(document.styleSheets)
    }

    // esc to deselect
    if (e.key === 'Escape') {
        selectNode(null)
    }

    // cmd + ArrowUp to go up one element
    if (e.key === "ArrowUp" && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
        e.preventDefault()
        e.stopPropagation()
        selectNodeRelatedBy('parentNode')
        return false
    }

    // cmd + ArrowDown to go to first child
    if (e.key === "ArrowDown" && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
        e.preventDefault()
        e.stopPropagation()
        selectNodeRelatedBy('firstChild')
        return false
    }

    // cmd + ArrowLeft to go to previous sibling
    if (e.key === "ArrowLeft" && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
        e.preventDefault()
        e.stopPropagation()
        selectNodeRelatedBy('previousSibling')
        return false
    }

    // cmd + ArrowRight to go to next sibling
    if (e.key === "ArrowRight" && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
        e.preventDefault()
        e.stopPropagation()
        selectNodeRelatedBy('nextSibling')
        return false
    }

    // cmd + / to go to current cursor position
    if (e.key === "/" && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
        e.preventDefault()
        e.stopPropagation()
        selectNodeAtCursorPosition()
        return false
    }

    // cmd + ' to select the tag name input box so they can start editing :)
    if (e.key === "'" && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
        e.preventDefault()
        e.stopPropagation()
        document.getElementById('_parchment_-tagName').focus();
        return false
    }

    // cmd + Backspace [or delete] to delete currently selected tag
    if (e.key === "Backspace" && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
        e.preventDefault()
        e.stopPropagation()
        deleteElement()
        return false
    }
}