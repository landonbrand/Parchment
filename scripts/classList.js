// PURE FUNCTIONS


// renderClassList :: String -> HTMLString
const renderClassListItem = (className) => {
    if (className === null || className === "" || typeof className == undefined || className === "_parchment_-selected") {
        return ''
    } else {
        return `
        <input 
        class="_parchment_-class-list-item _parchment_-select-on-focus" 
        contenteditable="true"  
        onkeyup="updateSelectedElement(); autoSizeInput(this);"
        value="${className}"
        onfocus="this.select()">
        `
    }
};

// IMPURE FUNCTIONS

const addNewClass = () => {
    GS.selectedNode.classList.add('new-class')
    updateSideBar()
}