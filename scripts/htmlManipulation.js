const placeHolderElement = () => {
    let element = document.createElement('div')
    element.textContent = 'new element'
    return element
}

const newElementAfter = () => {
    let elementToAdd = placeHolderElement()
    GS.selectedNode.parentNode.insertBefore(
        elementToAdd,
        GS.selectedNode.nextSibling
    )
    selectNode(elementToAdd)
}

const newElementEnclosing = () => {
    let elementToAdd = document.createElement('div')
    elementToAdd.appendChild(GS.selectedNode.cloneNode(true))
    GS.selectedNode.parentNode.replaceChild(
        elementToAdd,
        GS.selectedNode
    )
    selectNode(elementToAdd)
}

const newElementWithin = () => {
    let elementToAdd = placeHolderElement()
    GS.selectedNode.appendChild(elementToAdd)
    selectNode(elementToAdd)
}