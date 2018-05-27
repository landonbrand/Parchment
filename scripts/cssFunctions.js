// PURE FUNCTIONS

// renderCssDeclaration :: {String, String} -> HTMLString
const renderCssDeclaration = R.curry((pvPair) => {
    return `
    <span class="_parchment_-declaration">
        <span class="_parchment_-remove-declaration"
                onclick="removeDeclaration(event)">x</span>

        <input class="_parchment_-declaration _parchment_-declaration-property"
                onfocus="this.select()"
                value="${pvPair.property}"
                size=10
                oninput="updateAllCss()">
        <input class="_parchment_-declaration _parchment_-declaration-value"
                onfocus="this.select()"
                value=${pvPair.value}
                oninput="updateAllCss()">
    </span>
    `
});

const renderNewCssDeclaration = () => renderCssDeclaration({property: "newProperty", value: 0});

// renderCssPanel :: String, HTMLString -> HTMLString
const renderCssPanel = (selector, cssDeclarations) => {
    return `
    <div class="_parchment_-css-panel">
        <span class="_parchment_-close-thin" onclick="removeCssRule(event)"></span>
        <input class="_parchment_-selector"
                contenteditable="true"
                onfocus="this.select()"
                value="${selector}"
                size=25
                oninput="updateAllCss()">
        <br/>
        ${cssDeclarations}
        <span class="_parchment_-add-declaration" 
            onclick="addDeclaration(event)"
            tabindex="0"
            onkeypress="keyPressedOnAddDeclaration(event)">+ add declaration</span>
    </div>
    `
}

// doesSelectorMatchElement :: Element, Selector -> Boolean
const doesSelectorMatchElement = R.curry(
    (selector, element) => {
        if (!isElement(element)) return false
        element.matches = element.matches 
                            || element.webkitMatchesSelector 
                            || element.mozMatchesSelector 
                            || element.msMatchesSelector 
                            || element.oMatchesSelector
        return element.matches(selector)
    }
);

// doesCssRuleApplyToElement :: Element, CssRule -> Boolean
const doesCssRuleApplyToElement = R.curry(
    (element, cssRule) => {
        return getElementWithParents(element)
                .map(doesSelectorMatchElement(cssRule.selectorText))
                .includes(true);
    }
);

// cssRulesOfElement :: Element, StyleSheet -> [CssRules]
const cssRulesOfElement = (styleSheet, element) => {
    let rules = arrayLikeToArray(styleSheet.rules || styleSheet.cssRules)
    return rules.filter(doesCssRuleApplyToElement(element))
}

// indexOfCssRule CssRule -> Number
const indexOfCssRule = (cssRule) => {
    return arrayLikeToArray(cssRule.parentStyleSheet.cssRules).indexOf(cssRule)
}

// pvPairFromRule :: CssRule, String -> {String, String}
const pvPairFromRule = R.curry((cssRule, property) => {
    return {
        property: property,
        value: cssRule.style[property]
    }
});

// renderCssPanelFromCssRule :: CssRule -> HTMLString
const renderCssPanelFromCssRule = (cssRule) => {
    return renderCssPanel(
        cssRule.selectorText,
        arrayLikeToArray(cssRule.style)
            .map(pvPairFromRule(cssRule))
            .map(renderCssDeclaration).join('')
    );
}

// pvLineFromArrays :: [String], [String] -> [String]
const pvLinesFromArrays = (property, value) => {
    return property.map((x, i) => {return `${x}: ${value[i]};`})
}

// cssTextFromPanel :: Node -> CSSRuleString  [Node must be a CSSPanel]
const cssTextFromPanel = (panel) => {
    let selector = panel.getElementsByClassName('_parchment_-selector')[0].value
    let properties = arrayLikeToArray(
        panel.getElementsByClassName('_parchment_-declaration-property')
    ).map((x) => x.value)
    let values = arrayLikeToArray(
        panel.getElementsByClassName('_parchment_-declaration-value')
    ).map((x) => x.value)
    let pvLines = pvLinesFromArrays(properties, values).join('\n')
    return `${selector} {\n ${pvLines} \n}`
}

// IMPURE FUNCTIONS

// updateCss :: StyleSheet, [Integer], Integer -> null  // has side effect of updating that StyleSheet
const updateCss = R.curry((styleSheet, panelIndexToStyleSheetIndex, panelIndex) => {
    let newCss = cssTextFromPanel(document.getElementsByClassName('_parchment_-css-panel')[panelIndex]);
    let styleSheetIndex = panelIndexToStyleSheetIndex[panelIndex];
    try {
        styleSheet.insertRule(newCss, styleSheetIndex)
        styleSheet.deleteRule(styleSheetIndex + 1)
    }
    catch(error) {
        // console.log(error)
        // any error is just improper cssRule. Probably ok, they just typed the wrong things in the boxes.
        // in this case we just don't update the css
    }
});

// updateCssOnPanel just adds a couple arguments to updateCss so that it's ready to be mapped on an array
const updateCssOnPanel = (val, index) => updateCss(document.styleSheets[1], GS.panelIndexToStyleSheetIndex, index);

// updateAllCss just updates all the CSS from the panels into the stylesheet
const updateAllCss = () => {
    GS.panelIndexToStyleSheetIndex.map(updateCssOnPanel);
}

// addDeclaration just adds a new declaration to the panel that contains the event
const addDeclaration = (event) => {
    event.target.parentNode.insertBefore(
        htmlStringToNode(renderNewCssDeclaration()),
        event.target.parentNode.getElementsByClassName("_parchment_-add-declaration")[0]
    );
}

// just removes the css declaration at the event location
const removeDeclaration = (event) => {
    event.target.parentNode.remove();
    updateAllCss();
}


// just removes the css rule at the event location
const removeCssRule = (event) => {
    let cssPanel = event.target.parentNode
    let index = indexOfItemInList(
        cssPanel, 
        document.getElementsByClassName('_parchment_-css-panel')
    );
    cssPanel.remove();
    document.styleSheets[1].deleteRule(GS.panelIndexToStyleSheetIndex[index]);
    GS.panelIndexToStyleSheetIndex = GS.panelIndexToStyleSheetIndex.splice(index, 1);
}

const newCssRule = () => {
    let newCssPanel = htmlStringToNode(renderCssPanel("selector", renderNewCssDeclaration()));
    document.getElementById('_parchment_-sidebar-css-panels').appendChild(newCssPanel);
    document.styleSheets[1].insertRule('selector {property: 0;}', document.styleSheets[1].cssRules.length);
    GS.panelIndexToStyleSheetIndex.push(document.styleSheets[1].cssRules.length - 1);
    updateAllCss();
}