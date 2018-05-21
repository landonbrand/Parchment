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
    <span class="p-add-declaration">+ add declaration</span>
</div>
`

var cssRuleTemplate = `
<span class="p-declaration">
    <span contenteditable="false"
            class="p-remove-declaration">x</span>

    <span class="p-declaration p-declaration-property"
            contenteditable="true">

        {{property}}
    </span>
    <span class="p-declaration p-declaration-value"
            contenteditable="true">
        {{value}}
    </span>
</span>
<br/>
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
    console.log("temp:", temp)
    return temp.content.firstChild; 
}

// end templates


var selectedRegion = {}
var html = ""
var cssDeclarations = []

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
        newElement.classList.add(newClassListItems[i].innerText.trim())
    }

    var selectors = document.getElementsByClassName('p-selector')
    // selectors = selectors.map(x => x.innerText)
    // console.log(selectors)

    // update css
    // var styleSheet = document.styleSheets[0]
    // for (var i = 0; i < styleSheet.cssRules.length; i++) {
    //     if (styleSheet.cssRules[i].selectorText === selector) {
    //         if (ruleName === "" || ruleValue === "") {
    //             styleSheet.cssRules[i].style[camelCase(ruleName)] = ""
    //             styleSheet.cssRules[i].style.removeProperty(camelCase(ruleName))
    //         } else {
    //             styleSheet.cssRules[i].style[camelCase(ruleName)] = ruleValue
    //         }
    //     }
    // }
    // for (var i = 0; i < styleSheet.cssRules.length; i++) {
    //     if (styleSheet.cssRules[i].selectorText === document.getElementById()) {
    //         styleSheet.cssRules[i].selectorText = newSelector
    //     }
    // }
    // oldElementCSS = cssOf(selectedRegion.anchorElement)
    // console.log(oldElementCSS)
    // for (var i = 0; i < styleSheet.cssRules.length; i++) {
    //     if (styleSheet.cssRules[i].selectorText === oldElementCSS.) {
    //         styleSheet.cssRules[i].selectorText = newSelector
    //     }
    // }
    // console.log("new sheet: ", styleSheet);



    // copy child nodes
    do {
        if (element.firstChild) {
            newElement.appendChild(element.firstChild)
        }
    } 
    while(element.firstChild)

    // replace element
    // console.log("element: ", element)
    // console.log("newElement: ", newElement)
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
    selectedElement = selectedRegion.anchorElement

    document.getElementById("p-tagName").innerHTML = selectedElement.nodeName
    document.getElementById("p-tagId-unfocusable").innerHTML = selectedElement.id
    
    renderedClassListItems = ""
    for (var i = 0; i < selectedElement.classList.length; i++) {
        vars = {
            class: selectedElement.classList[i]
        }
        renderedTemplate = renderTemplate(classListItemTemplate, vars)
        renderedClassListItems += renderedTemplate
    }
    document.getElementById("p-class-list").innerHTML = renderedClassListItems

    renderedCSSPanels = ""
    selectedElementCSS = cssOf(selectedElement)
    for (var i = 0; i < selectedElementCSS.length; i++) {
        renderedCSSRules = ""
        cssRules = [] // used for keeping track of currentCSSRules
        for (var j = 0; j < selectedElementCSS[i].styleMap.size; j++) {
            cssRuleProperty = selectedElementCSS[i].style[j]
            cssRuleVars = {
                property: cssRuleProperty,
                value: selectedElementCSS[i].style[cssRuleProperty]
            }
            renderedCSSRulesTemplate = renderTemplate(cssRuleTemplate, cssRuleVars)
            renderedCSSRules += renderedCSSRulesTemplate
        }
        selectorVars = {
            selector: selectedElementCSS[i].selectorText,
            cssRules: renderedCSSRules
        }
        renderedCSSPanelsTemplate = renderTemplate(cssPanelTemplate, selectorVars)
        renderedCSSPanels += renderedCSSPanelsTemplate
    }
    document.getElementById("p-sidebar-css-panels").innerHTML = renderedCSSPanels
    // bind event listeners to newly created elements
    var cssPanels = document.getElementsByClassName('p-css-panel')
    for (var i = 0; i < cssPanels.length; i++) {
        cssPanels[i].addEventListener('input', changeCss)
    }
}

function changeCss(event) {

    allSelectors = document.getElementsByClassName('p-selector')
    for (var i = 0; i < allSelectors.length; i++) {
        if (allSelectors[i].innerText != cssDeclarations[i].selector) { 
            // selector has changed!!
            cssDeclarations[i].selector = allSelectors[i].innerText
            console.log("selector updated!")
        } 
        else {
            console.log("selector unchanged")
        }
    }
    // console.log(cssDeclarations)
    // console.log('Hey, somebody changed something in my text!', event)
    updateStyleSheet(oldCssDeclarations, cssDeclarations)
    // updateSideBar()
}

function renderCssFromPanel(panel) {
    selector = document.getElementsByClassName('p-selector')[0].innerText
    ruleElements = document.getElementsByClassName('p-declaration-property')
    rules = []
    for (var i = 0; i < ruleElements.length; i++) {
        property = panel.getElementsByClassName('p-declaration-property')[i].innerText
        value = panel.getElementsByClassName('p-declaration-value')[i].innerText
        rules.push(property + ": " + value + "; ")
    }
    ruleString = selector + " {" + rules.join("") + "} "
    console.log(ruleString)
}

function updateStyleSheet(oldCssDeclarations, newCssDeclarations) {
    // update css
    var styleSheet = document.styleSheets[0]
    var cssFields = document.getElementsByClassName('p-field-group')
    for (var i = 0; i < styleSheet.cssRules.length; i++) {
        for (var j = 0; j < oldCssDeclarations.length; j++) {
            // console.log("styleSheet selector: ", styleSheet.cssRules[i].selectorText)
            // console.log("cssDeclarations selector: ", oldCssDeclarations[j].selector)
            if (styleSheet.cssRules[i].selectorText === oldCssDeclarations[j].selector) {
                renderedCss = renderCssFromPanel(cssFields[j])
                console.log("before", styleSheet.cssRules[i])
                styleSheet.cssRules[i].cssText = renderedCss
                console.log("after", styleSheet.cssRules[i])
            }
        }
    }
        // if (styleSheet.cssRules[i].selectorText === selector) {
    //         if (ruleName === "" || ruleValue === "") {
    //             styleSheet.cssRules[i].style[camelCase(ruleName)] = ""
    //             styleSheet.cssRules[i].style.removeProperty(camelCase(ruleName))
    //         } else {
    //             styleSheet.cssRules[i].style[camelCase(ruleName)] = ruleValue
    //         }
    //     }
    // }
    // for (var i = 0; i < styleSheet.cssRules.length; i++) {
    //     if (styleSheet.cssRules[i].selectorText === document.getElementById()) {
    //         styleSheet.cssRules[i].selectorText = newSelector
    //     }
    // }
    // oldElementCSS = cssOf(selectedRegion.anchorElement)
    // console.log(oldElementCSS)
    // for (var i = 0; i < styleSheet.cssRules.length; i++) {
    //     if (styleSheet.cssRules[i].selectorText === oldElementCSS.) {
    //         styleSheet.cssRules[i].selectorText = newSelector
    //     }
    // }
    // console.log("new sheet: ", styleSheet);

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

function SelectRegion(anchorNode) {
    // console.log(anchorNode);
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
