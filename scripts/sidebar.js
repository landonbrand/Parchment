// IMPURE FUNCTIONS

const updateSideBar = () => {
    let selectedElement = GS.selectedNode

    if (selectedElement === null) {
        document.getElementById('_parchment_-tagName').value = ''
        document.getElementById('_parchment_-tagId-inner').value = ''
        document.getElementById('_parchment_-class-list').innerHTML = ''
        document.getElementById('_parchment_-sidebar-css-panels').innerHTML = ''
        return
    }

    // update tagName and tagId
    document.getElementById('_parchment_-tagName').value = selectedElement.tagName
    document.getElementById('_parchment_-tagId-inner').value = selectedElement.id

    // update classList
    let newClassListHTML = words(selectedElement.className).map(renderClassListItem)
    document.getElementById('_parchment_-class-list').innerHTML = newClassListHTML.join("\n")
    nodesWithClassName('_parchment_-class-list-item').map(autoSizeInput)

    // update cssPanel stuff
    document.getElementById('_parchment_-sidebar-css-panels').innerHTML = 
        cssRulesOfElement(document.styleSheets[1], selectedElement)
        .map(renderCssPanelFromCssRule).join('')
}