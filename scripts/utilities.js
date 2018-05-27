// DATA TYPES

// class Node {
//     constructor(x) {
//         this.$value = x;
//     }

//     static of(x) {
//         return new Node(x);
//     }

//     get isNothing() {
        
//     }

//     get element() {
//         if (this.isNothing)
//             return null
//         else
//             return (this.$value.nodeName === "#text") ? this.$value.parentNode : this.$value
//     }

//     get isElement() {
//         return (this.element instanceof Element);
//     }
// }

// PURE FUNCTIONS

// isNothing a -> Boolean
const isNothing = (a) => { return a === null || a === undefined }

// exists a -> Boolean
const exists = (a) => { return !isNothing(a) }

// isElement a -> Boolean
const isElement = (a) => {
    if (isNothing(a)) {
        return null
    } else {
        return (a instanceof Element)
    }
}

// isNode a -> Boolean
const isNode = (a) => {
    if (isNothing(a)) return null
    return (
        typeof Node === "object" ? 
            a instanceof Node :
            a && typeof a === "object" && typeof a.nodeType === "number" && typeof a.nodeName === "string"
    );
}

// elementOf Node -> Element
const elementOf = (node) => { 
    if (exists(node)) {
        return (node.nodeName === "#text") ? node.parentNode : node
    } else {
        return null
    }
}

// nodeFromNodeProperty :: Node -> Node | null
const nodeFromNodeProperty = R.curry((node, property) => {
    if (!isNode(node)) return null
    if (!isNode(node[property])) return null
    node = node[property]

    while (node.nodeName === "#text") {
        if (isNode(node[property])) {
            node = node[property]
        } else {
            if (isNode(node['nextSibling'])) node = node['nextSibling']
            else {
                return null
            }
        }
    }
    return node
});

// words :: String -> Array
const words = (str) => str.split(' ');

// getWidthOfInput :: Element -> Number  [Number refers to pixels]
const widthOfInput = (inputEl) => {
    var tmp = document.createElement("span");
    tmp.className = inputEl.className + "_parchment_-tmp-element";
    tmp.innerHTML = inputEl.value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    document.body.appendChild(tmp);
    var theWidth = tmp.getBoundingClientRect().width;
    document.body.removeChild(tmp);
    return theWidth;
}

// arrayLikeToArray :: ArrayLike[a] -> [a]
const arrayLikeToArray = (arrayLike) => {
    let array = []
    for (let i = 0; i < arrayLike.length; i++) {
        array.push(arrayLike[i]);
    }
    return array
}

// htmlStringToNode :: HtmlString -> Node
const htmlStringToNode = (htmlString) => {
    let template = document.createElement('div');
    template.innerHTML = htmlString.trim();
    return template.firstChild; 
}

// getElementWithParents :: Element -> [Element]
const getElementWithParents = (element) => {
    let array = []
    array.push(element)
    while (exists(element.parentNode) && element.tagName !== 'html') {
        array.push(element.parentNode)
        element = element.parentNode
    }
    return array
}

// indexOfItemInList :: a, Listlike[a] -> Integer
const indexOfItemInList = (a, list) => {
    return arrayLikeToArray(
        list
    ).indexOf(a);
}

// IMPURE FUNCTIONS

// autoSizeInput Element ->
const autoSizeInput = (inputEl) => {
    inputEl.style.width = widthOfInput(inputEl) + "px";
}

// nodesWithClassName :: String -> [Node]
const nodesWithClassName = (className) => {
    return arrayLikeToArray(document.getElementsByClassName(className))
}