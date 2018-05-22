// templates

var classListItemTemplate = `
<span 
    class="p-class-list-item" 
    contenteditable="true"  
    onkeyup="updateSelectedElement()">
    {{class}}
</span>
`

var cssPanelTemplate = `
<div class="p-field-group p-css-panel">
    <span class="p-close-thin"></span>
    <span class="p-selector"
            contenteditable="true"}>
            {{selector}}
    </span>
    <br/>
    {{cssRules}}
    <span class="p-add-declaration" onclick="addDeclaration(event)">+ add declaration</span>
</div>
`

var cssRuleTemplate = `
<span class="p-declaration">
    <span contenteditable="false"
            class="p-remove-declaration"
            onclick="removeDeclaration(event)">x</span>

    <span class="p-declaration p-declaration-property"
            contenteditable="true">

        {{property}}
    </span>
    <span class="p-declaration p-declaration-value"
            contenteditable="true">
        {{value}}
    </span>
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


var selectedRegion = {}
var html = ""
var panelIndexToStyleSheetIndex = []

function edited(e) {
    html = document.getElementById("p-edit").innerHTML
    refreshSelection()
}

function editedMouseUp(e) {
    refreshSelection()
}

function addNewClass(e) {
    newHtml = renderTemplate(classListItemTemplate, {class: "new-class"})
    newElement = createElementFromHTML(newHtml)
    classListRoot = document.getElementById("p-class-list")
    classListRoot.insertBefore(newElement, classListRoot.firstChild);
}

function updateSelectedElement() {
    var newTagName = selectedRegion.anchorElement.nodeName = document.getElementById("p-tagName").innerHTML.replace(/&nbsp;/gi,'').trim()
    var newId = selectedRegion.anchorElement.nodeName = document.getElementById("p-tagId-unfocusable").innerHTML.replace(/&nbsp;/gi,'').trim()
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
    newClassListItems = document.getElementsByClassName("p-class-list-item")
    for (var i = 0; i < newElement.classList.length; i++) {
        newElement.classList.remove(newElement.classList[i])
    }
    for (var i = 0; i < newClassListItems.length; i++) {
        if (newClassListItems[i].innerText.trim().length > 0) {
            newElement.classList.add(newClassListItems[i].innerText.trim())
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
    let selectedElement = selectedRegion.anchorElement

    document.getElementById("p-tagName").innerHTML = selectedElement.nodeName
    document.getElementById("p-tagId-unfocusable").innerHTML = selectedElement.id
    
    let renderedClassListItems = ""
    for (let i = 0; i < selectedElement.classList.length; i++) {
        let vars = {
            class: selectedElement.classList[i]
        }
        let renderedTemplate = renderTemplate(classListItemTemplate, vars)
        renderedClassListItems += renderedTemplate
    }
    document.getElementById("p-class-list").innerHTML = renderedClassListItems

    let renderedCSSPanels = ""
    let selectedElementCSS = cssOf(selectedElement)
    for (let i = 0; i < selectedElementCSS.length; i++) {
        let renderedCSSRules = ""
        let cssRules = [] // used for keeping track of currentCSSRules
        for (let j = 0; j < selectedElementCSS[i].styleMap.size; j++) {
            let cssRuleProperty = selectedElementCSS[i].style[j]
            let cssRuleVars = {
                property: cssRuleProperty,
                value: selectedElementCSS[i].style[cssRuleProperty]
            }
            let renderedCSSRulesTemplate = renderTemplate(cssRuleTemplate, cssRuleVars)
            renderedCSSRules += renderedCSSRulesTemplate
        }
        let selectorVars = {
            selector: selectedElementCSS[i].selectorText,
            cssRules: renderedCSSRules
        }
        let renderedCSSPanelsTemplate = renderTemplate(cssPanelTemplate, selectorVars)
        renderedCSSPanels += renderedCSSPanelsTemplate
        // update internal store
        let styleSheet = document.styleSheets[0]
        for (let j = 0; j < styleSheet.cssRules.length; j++) {
            if (styleSheet.cssRules[j].selectorText === selectedElementCSS[i].selectorText) {
                panelIndexToStyleSheetIndex.push(j)
            }
        }
    }
    document.getElementById("p-sidebar-css-panels").innerHTML = renderedCSSPanels
    // bind event listeners to newly created elements
    let cssPanels = document.getElementsByClassName('p-css-panel')
    for (let i = 0; i < cssPanels.length; i++) {
        cssPanels[i].addEventListener('input', cssInputsChanged)
    }
    
}

function cssInputsChanged(event) {
    updateCss(event.target)
}

function updateCss(eventTargetElement) {
    var styleSheet = document.styleSheets[0]
    var cssPanel = nearestParentOfClass(eventTargetElement, 'p-field-group')
    var renderedCss = cssRuleFromPanel(cssPanel)
    var index = panelIndexToStyleSheetIndex[getChildNumber(cssPanel)]
    console.log(getChildNumber(cssPanel))
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
    let selector = panel.getElementsByClassName('p-selector')[0].innerText
    let ruleElements = panel.getElementsByClassName('p-declaration-property')
    let rules = []
    for (let i = 0; i < ruleElements.length; i++) {
        let property = panel.getElementsByClassName('p-declaration-property')[i].innerText.trim()
        let value = panel.getElementsByClassName('p-declaration-value')[i].innerText.trim()
        rules.push(property + ": " + value + "; ")
    }
    let ruleString = selector + " {" + rules.join("") + "} "
    return ruleString
}

function addDeclaration(event) {
    let newDeclarationElement = createElementFromHTML(renderNewCssDeclaration())
    let parentElement = event.target.parentElement
    parentElement.insertBefore(newDeclarationElement, event.target.previousSibling)
}

function removeDeclaration(event) {
    let newTarget = event.target.parentElement.previousSibling

    let declarationElement = nearestParentOfClass(event.target, 'p-declaration')
    declarationElement.remove()
    updateCss(newTarget)
}

function newStyle() {
    let renderedCSSRules = renderNewCssDeclaration()
    let selectorVars = {
        selector: 'new-selector',
        cssRules: renderedCSSRules
    }
    let renderedCSSPanelsTemplate = renderTemplate(cssPanelTemplate, selectorVars)

    // update styleSheet to have a new rule
    let styleSheet = document.styleSheets[0]
    styleSheet.insertRule(".new-rule {}", styleSheet.cssRules.length - 1)
    panelIndexToStyleSheetIndex.push(styleSheet.cssRules.length - 1)

    // push to document
    let oldInnerHTML = document.getElementById("p-sidebar-css-panels").innerHTML
    document.getElementById("p-sidebar-css-panels").innerHTML = oldInnerHTML + renderedCSSPanelsTemplate

    // bind event listeners to newly created elements
    let cssPanels = document.getElementsByClassName('p-css-panel')
    cssPanels[cssPanels.length - 1].addEventListener('input', cssInputsChanged)
}

function renderNewCssDeclaration() {
    let cssRuleVars = {
        property: 'new-property',
        value: 0
    }
    let renderedDeclarationTemplate = renderTemplate(cssRuleTemplate, cssRuleVars)
    return renderedDeclarationTemplate
}

function selectParent() {
    newRegion = new SelectRegion(selectedRegion.anchorElement.parentNode)
    if (newRegion.anchorElement.id === "p-edit") {
        console.log("already at root!")
    } else {
        selectedRegion = newRegion
    }
    updateSideBar()
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

function deleteElement() {
    let elementToDelete = selectedRegion.anchorElement
    selectParent()
    elementToDelete.remove()
}

function getChildNumber(node) {
    console.log("childNodes:", node.parentNode.children)
    return Array.prototype.indexOf.call(node.parentNode.children, node)
}

function SelectRegion(anchorNode) {
    // this.anchorNode = anchorNode;
    // this.extentNode = extentNode;
    // this.anchorOffset = anchorOffset;
    // this.extentOffset = extentOffset;
    if(anchorNode.nodeName === "#text"){
        this.anchorElement = anchorNode.parentNode;
    } else {
        this.anchorElement = anchorNode;
    }
    // if(extentNode.nodeName === "#text"){
    //     this.extentElement = extentNode.parentNode;
    // } else {
    //     this.extentElement = extentNode;
    // }
}


function renderStyleSheet() {
    var styleSheet = document.styleSheets[0]
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
    var sheets = document.styleSheets, o = []
    a.matches = a.matches || a.webkitMatchesSelector || a.mozMatchesSelector || a.msMatchesSelector || a.oMatchesSelector
    for (var i in sheets) {
        var rules = sheets[i].rules || sheets[i].cssRules
        for (var r in rules) {
            if (a.matches(rules[r].selectorText)) {
                o.push(rules[r])
            }
        }
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
document.onkeypress = function(e) {
    if (e.keyCode === 180 && e.altKey === true) {
        e.preventDefault();
        // console.log(document.styleSheets)
        console.log(selectedRegion)
        console.log(cssOf(selectedRegion.anchorElement))
    }
}
