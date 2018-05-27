// templates

var classListItemTemplate = `
<input 
    class="_parchment_-class-list-item _parchment_-select-on-focus" 
    contenteditable="true"  
    onkeyup="updateSelectedElement(); adjustWidthOfInput(this);"
    value="{{class}}"
    onfocus="this.select()">
`

var cssPanelTemplate = `
<div class="_parchment_-css-panel _parchment_-css-panel">
    <span class="_parchment_-close-thin" onclick="removeCssRule(event)"></span>
    <input class="_parchment_-selector"
            contenteditable="true"
            onfocus="this.select()"
            value="{{selector}}"
            size=25>
    <br/>
    {{cssDeclarations}}
    <span class="_parchment_-add-declaration" 
        onclick="addDeclaration(event)"
        tabindex="0"
        onkeypress="keyPressedOnAddDeclaration(event)">+ add declaration</span>
</div>
`

var cssDeclarationTemplate = `
<span class="_parchment_-declaration">
    <span class="_parchment_-remove-declaration"
            onclick="removeDeclaration(event)">x</span>

    <input class="_parchment_-declaration _parchment_-declaration-property"
            onfocus="this.select()"
            value="{{property}}"
            size=10>
    <input class="_parchment_-declaration _parchment_-declaration-value"
            contenteditable="true"
            onfocus="this.select()"
            value={{value}}>
</span>
`

function renderTemplate(template, vars) {
    var rendered = template
    for (key in vars) {
        rendered = rendered.replace('{{' + key + '}}', vars[key])
    }
    return rendered
}

function createElementFromHTML(htmlString) {
    var temp = document.createElement('template');
    temp.innerHTML = htmlString.trim();
    return temp.content.firstChild; 
}

// end templates

// init stuff

// create global variables

var selectedRegion = {}
var html = ""
var panelIndexToStyleSheetIndex = []
var pageContents = document.getElementById("_parchment_-edit").textContent


// functions

function edited(e) {
    newPageContents = document.getElementById("_parchment_-edit").textContent
    if (newPageContents !== pageContents) { // only update if it was actually edited
        console.log("command let go!")
        html = document.getElementById("_parchment_-edit").innerHTML
        refreshSelection()
        pageContents = newPageContents
    }
}

function editedMouseUp(e) {
    refreshSelection()
}

function addNewClass(e) {
    let newHtml = renderTemplate(classListItemTemplate, {class: "new-class"})
    let newElement = createElementFromHTML(newHtml)
    adjustWidthOfInput(newElement)
    let classListRoot = document.getElementById("_parchment_-class-list")

    classListRoot.insertBefore(newElement, classListRoot.firstChild);
}

function updateSelectedElement() {
    var newTagName = selectedRegion.anchorElement.nodeName = document.getElementById("_parchment_-tagName").value.trim()
    var newId = selectedRegion.anchorElement.nodeName = document.getElementById("_parchment_-tagId-unfocusable").value.trim()
    if (newTagName.length < 1) { return }

    var element = selectedRegion.anchorElement
    var newElement = document.createElement(newTagName)
    var oldAttributes = element.attributes
    var newAttributes = newElement.attributes

    // copy attributes
    if (typeof oldAttributes !== "undefined") {
        for(var i = 0, len = oldAttributes.length; i < len; i++) {
            newAttributes.setNamedItem(oldAttributes.item(i).cloneNode())
        }
    }

    // update edited attributes
    newElement.id = newId
    newElement.classList.remove('_parchment_-selected')
    newClassListItems = document.getElementById('_parchment_-sidebar-classes').getElementsByTagName('input')
    for (var i = 0; i < newElement.classList.length; i++) {
        newElement.classList.remove(newElement.classList[i])
    }
    for (var i = 0; i < newClassListItems.length; i++) {
        if (newClassListItems[i].value.trim().length > 0) {
            newElement.classList.add(newClassListItems[i].value.trim())
        }
    }

    // copy child nodes
    do {
        if (element.firstChild) {
            newElement.appendChild(element.firstChild)
        }
    } 
    while(element.firstChild)

    // replace element
    element.parentNode.replaceChild(newElement, element)
    selectedRegion = new SelectRegion(newElement)
    
}

function refreshSelection() {
    var selected = window.getSelection()
    selected = new SelectRegion(selected.anchorNode)
    selectedRegion = selected
    updateSideBar()
}

function updateSideBar() {
    panelIndexToStyleSheetIndex = []
    if (selectedRegion.anchorElement === null) {
        document.getElementById("_parchment_-tagName").value = ""
        document.getElementById("_parchment_-tagId-unfocusable").value = ""
        document.getElementById("_parchment_-class-list").innerHTML = ""
        document.getElementById("_parchment_-sidebar-css-panels").innerHTML = ""
        return
    }
    let selectedElement = selectedRegion.anchorElement

    document.getElementById("_parchment_-tagName").value = selectedElement.nodeName
    document.getElementById("_parchment_-tagId-unfocusable").value = selectedElement.id
    
    let renderedClassListItems = ""
    for (let i = 0; i < selectedElement.classList.length; i++) {
        if (selectedElement.classList[i] === "_parchment_-selected") {
            continue
        }
        let vars = {
            class: selectedElement.classList[i]
        }
        let renderedTemplate = renderTemplate(classListItemTemplate, vars)
        renderedClassListItems += renderedTemplate
    }
    document.getElementById("_parchment_-class-list").innerHTML = renderedClassListItems
    let classListItems = document.getElementsByClassName('_parchment_-class-list-item')
    for (let i = 0; i < classListItems.length; i++) {
        adjustWidthOfInput(classListItems[i])
    }

    let renderedCSSPanels = ""
    let selectedElementCSS = cssOfThisAndParents(selectedElement)
    for (let i = 0; i < selectedElementCSS.length; i++) {
        let renderedCssDeclarations = ""
        if (selectedElementCSS[i].selectorText.includes("_parchment_-")) {
            continue
        }
        for (let j = 0; j < selectedElementCSS[i].styleMap.size; j++) {
            let cssRuleProperty = selectedElementCSS[i].style[j]
            let cssRuleVars = {
                property: cssRuleProperty,
                value: selectedElementCSS[i].style[cssRuleProperty]
            }
            let renderedCssDeclarationsTemplate = renderTemplate(cssDeclarationTemplate, cssRuleVars)
            renderedCssDeclarations += renderedCssDeclarationsTemplate
        }
        let selectorVars = {
            selector: selectedElementCSS[i].selectorText,
            cssDeclarations: renderedCssDeclarations
        }
        let renderedCSSPanelsTemplate = renderTemplate(cssPanelTemplate, selectorVars)
        if (renderedCSSPanels.includes(renderedCSSPanelsTemplate)) {
            continue
        }
        renderedCSSPanels += renderedCSSPanelsTemplate
        // update internal store
        let styleSheet = document.styleSheets[1]
        for (let j = 0; j < styleSheet.cssRules.length; j++) {
            if (styleSheet.cssRules[j].selectorText === selectedElementCSS[i].selectorText) {
                panelIndexToStyleSheetIndex.push(j)
            }
        }
    }
    document.getElementById("_parchment_-sidebar-css-panels").innerHTML = renderedCSSPanels
    // bind event listeners to newly created elements
    let cssPanels = document.getElementsByClassName('_parchment_-css-panel')
    for (let i = 0; i < cssPanels.length; i++) {
        cssPanels[i].addEventListener('input', cssInputsChanged)
    }
}

function cssInputsChanged(event) {
    updateCss(event.target)
}

function updateCss(eventTargetElement) {
    var styleSheet = document.styleSheets[1]
    var cssPanel = nearestParentOfClass(eventTargetElement, '_parchment_-css-panel')
    var renderedCss = cssRuleFromPanel(cssPanel)
    var index = panelIndexToStyleSheetIndex[getChildNumber(cssPanel)]
    try {
        styleSheet.insertRule(renderedCss, index)
        styleSheet.deleteRule(index + 1)
    }
    catch(error) {
        // any error is just improper cssRule. Probably ok
        // in this case we just don't update the css
    }
}

function cssRuleFromPanel(panel) {
    let selector = panel.getElementsByClassName('_parchment_-selector')[0].value
    let ruleElements = panel.getElementsByClassName('_parchment_-declaration-property')
    let rules = []
    for (let i = 0; i < ruleElements.length; i++) {
        let property = panel.getElementsByClassName('_parchment_-declaration-property')[i].value.trim()
        let value = panel.getElementsByClassName('_parchment_-declaration-value')[i].value.trim()
        rules.push(property + ": " + value + "; ")
    }
    let ruleString = selector + " {" + rules.join("") + "} "
    console.log(ruleString)

    return ruleString
}

function addDeclaration(event) {
    let newDeclarationElement = createElementFromHTML(renderNewCssDeclaration())
    let parentElement = event.target.parentElement
    parentElement.insertBefore(newDeclarationElement, event.target.previousSibling)
}

function keyPressedOnAddDeclaration(e) {
    console.log(e)
    if (e.key == "Enter") {
        addDeclaration(e)
    }
}

function removeDeclaration(event) {
    let newTarget = event.target.parentElement.previousSibling

    let declarationElement = nearestParentOfClass(event.target, '_parchment_-declaration')
    declarationElement.remove()
    updateCss(newTarget)
}

function removeCssRule(event) {
    let styleSheet = document.styleSheets[1]
    let cssPanel = nearestParentOfClass(event.target, '_parchment_-css-panel')
    let childNumber = getChildNumber(cssPanel)
    let indexToDelete = panelIndexToStyleSheetIndex[childNumber]
    styleSheet.deleteRule(indexToDelete)

    updateSideBar()
}

function newCssRule() {
    let renderedCssDeclarations = renderNewCssDeclaration()
    let selectorVars = {
        selector: 'new-selector',
        cssDeclarations: renderedCssDeclarations
    }
    let renderedCSSPanelsTemplate = renderTemplate(cssPanelTemplate, selectorVars)

    // update styleSheet to have a new rule
    let styleSheet = document.styleSheets[1]
    styleSheet.insertRule(".new-rule {}", styleSheet.cssRules.length)
    panelIndexToStyleSheetIndex.push(styleSheet.cssRules.length)

    // push to document
    let oldInnerHTML = document.getElementById("_parchment_-sidebar-css-panels").innerHTML
    document.getElementById("_parchment_-sidebar-css-panels").innerHTML = oldInnerHTML + renderedCSSPanelsTemplate

    // bind event listeners to newly created elements
    let cssPanels = document.getElementsByClassName('_parchment_-css-panel')
    cssPanels[cssPanels.length - 1].addEventListener('input', cssInputsChanged)
}

function keyPressedOnNewCssRule(e) {
    if (e.key == "Enter") {
        newCssRule()
    }
}

function renderNewCssDeclaration() {
    let cssRuleVars = {
        property: 'new-property',
        value: 0
    }
    let renderedDeclarationTemplate = renderTemplate(cssDeclarationTemplate, cssRuleVars)
    return renderedDeclarationTemplate
}

function selectParent() {
    newRegion = new SelectRegion(selectedRegion.anchorElement.parentNode)
    if (newRegion.anchorElement.id === "_parchment_-edit") {
        console.log("already at root!")
    } else {
        selectedRegion = newRegion
    }
    updateSideBar()
}

function selectPreviousSibling() {
    let previousSibling = selectedRegion.anchorElement.previousSibling
    while (previousSibling.nodeName === "#text") {
        previousSibling = previousSibling.previousSibling
    }
    selectedRegion = new SelectRegion(previousSibling)
    updateSideBar()
}

function selectNextSibling() {
    let nextSibling = selectedRegion.anchorElement.nextSibling
    while (nextSibling.nodeName === "#text") {
        nextSibling = nextSibling.nextSibling
    }
    selectedRegion = new SelectRegion(nextSibling)
    updateSideBar()
}

function selectFirstChild() {
    firstChild = selectedRegion.anchorElement.firstElementChild
    if (firstChild !== null) {
        newRegion = new SelectRegion(selectedRegion.anchorElement.firstElementChild)
        selectedRegion = newRegion
        updateSideBar()
    }
}

function selectAtCursorPos() {
    refreshSelection()
}

function newElement() {
    let parentNode = selectedRegion.anchorElement.parentNode
    let newNode = createElementFromHTML("<div>New Element</div>")
    parentNode.insertBefore(newNode, selectedRegion.anchorElement.nextSibling)
    selectedRegion = new SelectRegion(selectedRegion.anchorElement.nextSibling)
    updateSideBar()
}

function newElementEnclosing() {
    let parentNode = selectedRegion.anchorElement.parentNode
    let nextSibling = selectedRegion.anchorElement.nextSibling
    let newNode = createElementFromHTML("<div></div>")
    newNode.appendChild(selectedRegion.anchorElement)
    parentNode.insertBefore(newNode, nextSibling)
    selectedRegion = new SelectRegion(newNode)
    updateSideBar()
}

function newElementWithin() {
    let newNode = createElementFromHTML("<div></div>")
    selectedRegion.anchorElement.appendChild(newNode)
    selectedRegion = new SelectRegion(newNode)
    updateSideBar()
}

function deleteElement() {
    let elementToDelete = selectedRegion.anchorElement
    console.log("elementToDelete: ", elementToDelete)
    selectParent()
    elementToDelete.remove()
}

function getWidthOfInput(inputEl) {
    var tmp = document.createElement("span");
    tmp.className = "_parchment_-class-list-item _parchment_-tmp-element";
    tmp.innerHTML = inputEl.value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    document.body.appendChild(tmp);
    var theWidth = tmp.getBoundingClientRect().width;
    document.body.removeChild(tmp);
    return theWidth;
}

function adjustWidthOfInput(inputEl) {
    inputEl.style.width = getWidthOfInput(inputEl) + "px";
}


function getChildNumber(node) {
    return Array.prototype.indexOf.call(node.parentNode.children, node)
}

function SelectRegion(anchorNode) {
    if (typeof selectedRegion.anchorElement !== "undefined" && selectedRegion.anchorElement !== null) {
        selectedRegion.anchorElement.classList.remove("_parchment_-selected")
    }
    if (anchorNode === null) {
        this.anchorElement = null
    } else {
        if (anchorNode.nodeName === "#text") {
            this.anchorElement = anchorNode.parentNode;
        } else {
            this.anchorElement = anchorNode;
        }
        this.anchorElement.classList.add("_parchment_-selected")
    }
    
}


function renderStyleSheet() {
    var styleSheet = document.styleSheets[1]
    var cssArray = []
    var pageCSS
    if (styleSheet.cssRules != null ) {
        for (i = 0; i < styleSheet.cssRules.length; i++) {
            cssArray.push(styleSheet.cssRules[i].cssText)
        }
        pageCSS = cssArray.join(" ").
        replace(/ { /g, " {\n\t").
        replace(/ } /g, "\n}\n\n").
        replace(/; /g, ";\n\t")
    }
    console.log(pageCSS)
}


// misc utilities

function cssOf(a) {
    var sheet = document.styleSheets[1], o = []
    a.matches = a.matches || a.webkitMatchesSelector || a.mozMatchesSelector || a.msMatchesSelector || a.oMatchesSelector
    var rules = sheet.rules || sheet.cssRules
    for (var r in rules) {
        if (a.matches(rules[r].selectorText)) {
            o.push(rules[r])
        }
    }
    return o
}

function cssOfThisAndParents(a) {
    let o = []
    let el = a
    while (el.parentElement != null) {
        o = o.concat(cssOf(el))
        el = el.parentElement
    }
    return o
}

function nearestParentOfClass(element, classToFind) {
    if (element === null) {
        return null
    }
    if (element.parentElement === null) {
        return null
    }
    if (element.parentElement.classList.contains(classToFind)) {
        return element.parentElement
    } else {
        return nearestParentOfClass(element.parentElement, classToFind)
    }
}


// debugging and logging shiz

// log selectedRegion if user presses alt+shift+e
// TODO: have better shortcut

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
        selectedRegion = new SelectRegion(null)
        updateSideBar()
    }

    // cmd + ArrowUp to go up one element
    if (e.key === "ArrowUp" && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
        e.preventDefault()
        e.stopPropagation()
        selectParent()
        return false
    }

    // cmd + ArrowDown to go to first child
    if (e.key === "ArrowDown" && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
        e.preventDefault()
        e.stopPropagation()
        selectFirstChild()
        return false
    }

    // cmd + ArrowLeft to go to previous sibling
    if (e.key === "ArrowLeft" && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
        e.preventDefault()
        e.stopPropagation()
        selectPreviousSibling()
        return false
    }

    // cmd + ArrowRight to go to next sibling
    if (e.key === "ArrowRight" && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
        e.preventDefault()
        e.stopPropagation()
        selectNextSibling()
        return false
    }

    // cmd + / to go to current cursor position
    if (e.key === "/" && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
        e.preventDefault()
        e.stopPropagation()
        selectAtCursorPos()
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